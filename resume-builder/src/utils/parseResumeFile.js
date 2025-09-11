/**
 * parseResumeFile orchestrates parsing different file types (PDF/DOCX/TXT)
 * and maps extracted text heuristically into our formData structure.
 *
 * This module aims to be robust against messy real-world resumes by:
 *  - Normalizing whitespace and bullets
 *  - Forcing section markers onto new lines when they appear inline
 *  - Supporting multiple date formats (Month YYYY, MM/YYYY, MMM YYYY, etc.)
 *  - Extracting entities with layered fallbacks
 */
import { logger } from './logger'

/**
 * Extract plain text from a PDF File using pdfjs-dist.
 */
async function extractTextFromPdf(file) {
  // Lazy-load pdfjs to reduce initial bundle size and improve worker path reliability
  const pdfjsLib = await import('pdfjs-dist');
  // Import worker as URL so Vite bundles it and serves a correct path
  const workerModule = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerModule.default;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  let text = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const strings = content.items.map((item) => item.str);
    text += strings.join(' ') + '\n';
  }
  return text;
}

/**
 * Extract plain text from a DOCX File using mammoth.
 */
async function extractTextFromDocx(file) {
  // Use browser build of mammoth for client-side environments
  const mammoth = (await import('mammoth/mammoth.browser.js')).default;
  const arrayBuffer = await file.arrayBuffer();
  const { value } = await mammoth.extractRawText({ arrayBuffer });
  return value || '';
}

/**
 * Extract text from a TXT file.
 */
async function extractTextFromTxt(file) {
  return await file.text();
}

/**
 * Heuristically map raw text into our form data structure.
 * This is intentionally naive and can be improved with better NLP rules.
 */
function mapTextToFormData(text) {
  /**
   * 1) Normalize text: unify bullets, whitespace, and ensure headers are on their own lines.
   */
  const normalized = normalizeText(text);
  const lines = normalized.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

  /**
   * 2) Segment sections via robust header detection with synonyms.
   */
  const sections = segmentSections(normalized);
  logger.debug('Detected sections', { keys: Object.keys(sections) });

  /**
   * 3) Extract personal info from the top area and globally.
   */
  const personalInfo = extractPersonalInfo(normalized);

  /**
   * 4) Extract structured sections.
   */
  const education = extractEducation(sections.education || sections.academics || '');
  const experience = extractExperience(sections.experience || sections.work || sections.employment || '');
  const projects = extractProjects(sections.projects || '');
  const skills = extractSkills(sections.skills || sections.technologies || sections.tools || normalized);

  return { personalInfo, education, experience, projects, skills };
}

/**
 * Public API: parse a File and return partial formData to merge.
 */
export async function parseResumeFile(file) {
  logger.info('Parsing resume file', { name: file.name });
  const lower = file.name.toLowerCase();
  let text = '';
  try {
    if (lower.endsWith('.pdf')) {
      text = await extractTextFromPdf(file);
    } else if (lower.endsWith('.docx')) {
      text = await extractTextFromDocx(file);
    } else if (lower.endsWith('.txt')) {
      text = await extractTextFromTxt(file);
    } else {
      throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT.');
    }
  } catch (err) {
    logger.error('Extraction failed', { message: err?.message, stack: err?.stack });
    throw err;
  }
  logger.debug('Extracted text length', { length: text.length });
  const mapped = mapTextToFormData(text);
  return mapped;
}

export default parseResumeFile;

/**
 * TEXT NORMALIZATION + SECTIONING UTILITIES
 */

/**
 * Normalize incoming text to improve downstream parsing.
 * - Unify bullets to "•"
 * - Replace multiple spaces with single
 * - Ensure main headers are on their own line
 */
function normalizeText(input) {
  let t = input
    .replace(/[\u2022\u25CF\u25AA\-\*]+\s*/g, '• ') // normalize bullets
    .replace(/\s+\|\s+/g, ' | ') // normalize inline separators
    .replace(/\r\n|\r/g, '\n');

  // Ensure bullets start new lines so we treat them as distinct items
  t = t.replace(/\s•\s/g, '\n• ');

  // Force section tokens onto new lines to help segmentation when input is run-on
  const headerTokens = [
    'EDUCATION', 'SKILLS', 'EXPERIENCE', 'WORK EXPERIENCE', 'PROFESSIONAL EXPERIENCE', 'PROJECTS',
    'EMPLOYMENT HISTORY', 'TECHNOLOGIES', 'TOOLS', 'CERTIFICATIONS'
  ];
  headerTokens.forEach(h => {
    const re = new RegExp(`\\s(${escapeRegExp(h)})\\s`, 'gi');
    t = t.replace(re, `\n$1\n`);
  });

  // Collapse excessive whitespace while preserving new lines
  t = t.split('\n').map(l => l.replace(/\s{2,}/g, ' ').trim()).join('\n');
  return t;
}

function escapeRegExp(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

/**
 * Segment text into named sections using header detection.
 */
function segmentSections(text) {
  const headers = [
    { key: 'education', re: /^(education)\b/i },
    { key: 'skills', re: /^(skills|technologies|technical skills|tools)\b/i },
    { key: 'experience', re: /^(experience|work experience|professional experience|employment history)\b/i },
    { key: 'projects', re: /^(projects|selected projects)\b/i },
  ];

  const lines = text.split(/\n/);
  const result = {};

  let currentKey = 'preamble';
  result[currentKey] = [];
  for (const line of lines) {
    const header = headers.find(h => h.re.test(line.trim()));
    if (header) {
      currentKey = header.key;
      if (!result[currentKey]) result[currentKey] = [];
      continue; // Do not include header line
    }
    if (!result[currentKey]) result[currentKey] = [];
    result[currentKey].push(line);
  }

  // Join arrays back to blocks
  const blocks = {};
  for (const [k, arr] of Object.entries(result)) {
    blocks[k] = arr.join('\n').trim();
  }
  return blocks;
}

/**
 * Extract personal info: name, email, phone, socials (LinkedIn/GitHub/Portfolio).
 */
function extractPersonalInfo(text) {
  const top = text.split('\n').slice(0, 20).join(' ');

  // Email and phone from anywhere
  const emailMatch = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  const phoneMatch = text.match(/(?:\+?1\s*)?(\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4})/);

  // Name heuristic: first line with at least 2 words, not a header token
  const firstLine = text.split('\n').find(l => /[A-Za-z]/.test(l) && l.trim().split(/\s+/).length >= 2 && !/^(education|skills|experience|projects)\b/i.test(l.trim())) || '';
  const [FirstName = '', LastName = ''] = firstLine.trim().split(/\s+/, 2);

  // Socials: LinkedIn/GitHub/Portfolio URLs
  const socials = [];
  const addSocial = (platform, url) => socials.push({ platform, url });
  const li = text.match(/(https?:\/\/)?(www\.)?linkedin\.com\/[A-Za-z0-9_\-\/]+/i);
  if (li) addSocial('LinkedIn', li[0]);
  const gh = text.match(/(https?:\/\/)?(www\.)?github\.com\/[A-Za-z0-9_\-\/]+/i);
  if (gh) addSocial('GitHub', gh[0]);
  const site = text.match(/(https?:\/\/)[\w.-]+\.[a-z]{2,}(?:\/[\w#?=&.-]*)?/i);
  if (site && !(li && site[0] === li[0]) && !(gh && site[0] === gh[0])) addSocial('Portfolio', site[0]);

  return {
    FirstName,
    LastName,
    Description: '',
    socials: socials.length ? socials : [{ platform: '', url: '' }],
    isUSCitizen: /\bUS\s*Citizen\b/i.test(top) ? 'Yes' : '',
    Email: emailMatch ? emailMatch[0] : '',
    Phone: phoneMatch ? phoneMatch[1] : '',
  };
}

/**
 * Parse a variety of date formats into YYYY-MM strings where possible.
 */
function parseMonthYear(str) {
  if (!str) return '';
  const monthNames = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const mIndex = monthNames.findIndex(m => new RegExp(`\\b${m.substr(0,3)}`, 'i').test(str));
  const yMatch = str.match(/(20\d{2}|19\d{2})/);
  if (mIndex >= 0 && yMatch) {
    const month = String(mIndex + 1).padStart(2, '0');
    return `${yMatch[1]}-${month}`;
  }
  const mmYY = str.match(/(\d{1,2})[\/-](\d{2,4})/);
  if (mmYY) {
    const mm = String(parseInt(mmYY[1], 10)).padStart(2, '0');
    let yyyy = mmYY[2];
    if (yyyy.length === 2) yyyy = `20${yyyy}`;
    return `${yyyy}-${mm}`;
  }
  return '';
}

function parseDateRange(input) {
  // Match patterns like: May 2022 - Present, 05/2022 - 06/2024, May 2022 – May 2024
  const re = /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{1,2}[\/-]\d{2,4})\s*[–-]\s*(present|\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s*\d{4}|\d{1,2}[\/-]\d{2,4})/i;
  const m = re.exec(input);
  if (!m) return { start: '', end: '', current: false, index: -1, raw: '' };
  const start = parseMonthYear(m[1]);
  const end = /present/i.test(m[2]) ? '' : parseMonthYear(m[2]);
  return { start, end, current: /present/i.test(m[2]), index: m.index ?? input.indexOf(m[0]), raw: m[0] };
}

/**
 * EDUCATION: institution, degree, location, graduationDate.
 */
function extractEducation(block) {
  if (!block) return [];
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Heuristic: line with University/College/Institute indicates institution
    if (/(university|college|institute|school)/i.test(line)) {
      const institution = line;
      // Degree may appear on same line or next line
      const degreeSameLineMatch = line.match(/(bachelor|master|associate|b\.?s\.?|m\.?s\.?|ba|ma)[^,\n]*/i);
      const degreeLine = degreeSameLineMatch ? degreeSameLineMatch[0] : (lines[i + 1] || '');
      const locationLine = lines[i + 2] || '';
      const merged = [degreeLine, locationLine].join(' ');
      const gradMatch = merged.match(/(expected\s+)?graduation[^,]*[,\s]+([^,\n]+)/i);
      const dateCandidate = gradMatch ? gradMatch[2] : merged;
      const graduationDate = parseMonthYear(dateCandidate);
      result.push({
        id: String(Date.now() + i),
        institution,
        degree: degreeLine || '',
        location: /(,|\bTX\b|\bCA\b|\bNY\b|\bUSA\b)/i.test(locationLine) ? locationLine : '',
        graduationDate,
        hasGraduated: graduationDate ? /\b(graduated|degree awarded)\b/i.test(merged) : false,
      });
    }
  }
  return result;
}

/**
 * EXPERIENCE: company, position, date range, bullets.
 */
function extractExperience(block) {
  if (!block) return [];
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];

  // Expanded role lexicon captures common job titles
  const roleKeywords = /(intern|developer|engineer|manager|analyst|consultant|designer|lead|porter|associate|architect|administrator|scientist|specialist|coordinator|director|principal|owner|founder|technician|qa|test|support|product|program)/i;
  const stateAbbr = /(,\s*[A-Z]{2})(\b|\s)/; // e.g., Austin, TX

  // Action verbs commonly used to start bullet lines
  const ACTION_VERBS = [
    'designed','built','developed','integrated','managed','leveraged','utilized','implemented','enhanced','reduced','tracked','supported','worked','collaborated','engineered','created','automated','optimized','improved','led','owned','delivered','increased','decreased','analyzed','designed','architected'
  ];

  const isLikelyBulletLine = (line) => {
    if (!line) return false;
    if (/^•\s+/.test(line) || /^-\s+/.test(line)) return true;
    // Starts with action verb and is sentence-length
    const first = line.split(/\s+/)[0]?.toLowerCase();
    if (ACTION_VERBS.includes(first) && line.length > 25) return true;
    // Ends with period and is descriptive length
    if (/\.$/.test(line) && line.length > 30) return true;
    return false;
  };

  const isLikelyRoleTitle = (line) => {
    if (!line) return false;
    if (roleKeywords.test(line)) return true;
    const words = line.split(/\s+/);
    // Short Title/Role-like lines without trailing period
    if (words.length <= 6 && !/\.$/.test(line)) {
      const titleish = words.every(w => /^(?:[A-Z][a-z]+|[A-Z]{2,}|&|of|and|for|the)$/i.test(w));
      return titleish;
    }
    return false;
  };

  const isLikelyCompany = (line) => {
    if (!line) return false;
    if (/^•\s+/.test(line)) return false; // bullets are not company lines
    if (/^(experience|projects|skills|education)\b/i.test(line)) return false;
    if (/(inc\.|llc|corp\.?|company|solutions|technologies|labs|systems)\b/i.test(line)) return true;
    if (/[A-Za-z][A-Za-z .'-]+,\s*[A-Z]{2}$/.test(line)) return true; // City, ST
    const words = line.split(/\s+/).filter(Boolean);
    // Short, title-like lines
    if (words.length && words.length <= 4) {
      const stop = /^(of|and|the|for|at|in|on)$/i;
      const titleCase = words.every(w => stop.test(w) || /^(?:[A-Z][a-z]+|[A-Z]{2,})$/.test(w));
      if (titleCase) return true;
    }
    // Very long sentences are never companies
    if (line.length > 60) return false;
    return false;
  };

  // Lookahead-based grouping: detect a company header, then attach role, dates, location, bullets
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip clear description lines until we hit a header
    if (isLikelyBulletLine(line)) continue;
    const dateInfoInline = parseDateRange(line);

    // Company header if explicit or heuristically likely, or a line with date where left part is short (company)
    const leftOfDate = dateInfoInline.index > -1 ? line.slice(0, dateInfoInline.index).trim().replace(/[–-]\s*$/, '').trim() : '';
    const headerLike = isLikelyCompany(line) || (dateInfoInline.start && leftOfDate && leftOfDate.split(/\s+/).length <= 8);
    if (headerLike) {
      const entry = {
        id: String(Date.now() + result.length + i),
        company: (dateInfoInline.start && leftOfDate) ? leftOfDate : line,
        position: '',
        startDate: dateInfoInline.start || '',
        endDate: dateInfoInline.end || '',
        current: dateInfoInline.current || false,
        bulletPoints: [],
        location: stateAbbr.test(line) ? (line.match(/([A-Za-z .]+,\s*[A-Z]{2})/)?.[1] || '') : '',
        remote: /\bremote\b/i.test(line),
        employmentType: 'full-time',
      };

      // Look ahead up to 3 lines for role, dates, location
      let j = i + 1;
      for (; j < Math.min(i + 4, lines.length); j++) {
        const la = lines[j];
        if (!la) continue;
        // Stop if next company header encountered
        if (isLikelyCompany(la)) break;

        // Role detection
        if (!entry.position && isLikelyRoleTitle(la)) {
          entry.position = la;
          continue;
        }
        // Dates
        const di = parseDateRange(la);
        if (di.start) {
          entry.startDate = entry.startDate || di.start;
          entry.endDate = entry.endDate || di.end;
          entry.current = entry.current || di.current;
          continue;
        }
        // Location
        if (stateAbbr.test(la) && !entry.location) {
          entry.location = (la.match(/([A-Za-z .]+,\s*[A-Z]{2})/)?.[1] || entry.location);
          continue;
        }
        // First bullet line
        if (/^•\s+/.test(la)) {
          break; // bullets will be handled in the next loop
        }
      }

      // Advance i to last header-consumed line before bullets
      i = j - 1;

      // Collect bullets until next header or section end
      for (let k = i + 1; k < lines.length; k++) {
        const b = lines[k];
        if (!b) continue;
        if (isLikelyCompany(b)) { i = k - 1; break; }
        if (isLikelyBulletLine(b)) {
          entry.bulletPoints.push(b.replace(/^•\s+/, '').trim());
        } else {
          // occasionally bullets are missing marker, treat non-short sentences as bullets
          if (b.length > 20 && !parseDateRange(b).start) entry.bulletPoints.push(b);
        }
        if (k === lines.length - 1) i = k; // end
      }

      result.push(entry);
      continue;
    }
  }

  return result;
}

/**
 * PROJECTS: projectName, role, dates, bullets.
 */
function extractProjects(block) {
  if (!block) return [];
  const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
  const result = [];
  let current = null;

  for (const line of lines) {
    const dateInfo = parseDateRange(line);
    const isHeader = /^project\b|^•\s+/i.test(line);

    if (isHeader || dateInfo.start) {
      if (current) result.push(current);
      current = {
        id: String(Date.now() + result.length),
        projectName: line.replace(/^•\s+/, '').replace(/^project\s*[:\-]?\s*/i, ''),
        role: '',
        startDate: dateInfo.start,
        endDate: dateInfo.end,
        isCurrent: dateInfo.current,
        bulletPoints: [],
        location: '',
      };
      continue;
    }

    if (/^•\s+/.test(line) || /^-\s+/.test(line)) {
      current?.bulletPoints.push(line.replace(/^•\s+|^-\s+/, '').trim());
      continue;
    }

    if (current) {
      if (!current.role && /\b(developer|engineer|lead|owner|contributor|designer)\b/i.test(line)) {
        current.role = line;
      } else {
        current.bulletPoints.push(line);
      }
    }
  }
  if (current) result.push(current);
  return result;
}

/**
 * SKILLS: pull from skills section if available, otherwise infer from comma/pipe lists.
 */
function extractSkills(blockOrFullText) {
  const t = blockOrFullText || '';
  // Prefer a single line following a header-like token
  const lines = t.split('\n').map(l => l.trim());
  let candidates = [];
  for (let i = 0; i < lines.length; i++) {
    if (/^(skills|technologies|tools)\b/i.test(lines[i])) {
      candidates.push(lines[i + 1] || '');
    }
  }
  if (!candidates.length) candidates = lines.filter(l => /,/.test(l) && l.split(',').length >= 4);
  const joined = candidates.join(',');
  const tokens = joined.split(/,|\s•\s|\s\|\s/).map(s => s.trim()).filter(Boolean);
  // De-duplicate while preserving order
  const seen = new Set();
  const skills = [];
  for (const token of tokens) {
    const tkn = token.replace(/[^A-Za-z0-9+#\-.]/g, '');
    if (tkn && !seen.has(tkn.toLowerCase())) {
      seen.add(tkn.toLowerCase());
      skills.push(tkn);
    }
  }
  return skills.slice(0, 50);
}


