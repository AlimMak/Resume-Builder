/**
 * qualityRules
 * Heuristic ATS/quality checks for resumes. Provides a synchronous evaluator
 * returning a structured list of issues, plus small safe auto-fixes.
 *
 * Design:
 * - Stateless pure functions for predictability and testability
 * - Severity: 'error' | 'warn' | 'info'
 * - Issues include section anchors and optional field paths for fine-grained jumps
 */
import { logger as rootLogger } from './logger';

const logger = rootLogger.child('quality');

const ACTION_VERBS = [
  'designed','built','developed','integrated','managed','utilized','implemented','enhanced','reduced','tracked','supported','collaborated','engineered','created','automated','optimized','improved','led','owned','delivered','increased','decreased','analyzed','architected','launched','migrated','refactored','secured','deployed','orchestrated','streamlined'
];

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const URL_RE = /^(https?:\/\/)[\w.-]+\.[a-z]{2,}(?:\/[\w#?=&.-]*)?$/i;

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeUSPhone(phone) {
  if (!phone) return '';
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(1)?(\d{3})(\d{3})(\d{4})$/);
  if (match) return `(${match[2]}) ${match[3]}-${match[4]}`;
  return phone;
}

function checkPersonalInfo(issues, personalInfo) {
  const section = 'personalInfo';
  if (!isNonEmptyString(personalInfo?.FirstName)) {
    issues.push({ id: 'pi-first', severity: 'error', section, message: 'Missing first name.' });
  }
  if (!isNonEmptyString(personalInfo?.LastName)) {
    issues.push({ id: 'pi-last', severity: 'error', section, message: 'Missing last name.' });
  }
  if (!EMAIL_RE.test(personalInfo?.Email || '')) {
    issues.push({ id: 'pi-email', severity: 'error', section, message: 'Invalid or missing email address.' });
  }
  const normalized = normalizeUSPhone(personalInfo?.Phone || '');
  if (!/\(\d{3}\) \d{3}-\d{4}/.test(normalized)) {
    issues.push({ id: 'pi-phone', severity: 'warn', section, message: 'Phone format is not US-standard (XXX) XXX-XXXX.', autoFix: { type: 'formatPhone' } });
  }
  // Social links validity (if provided)
  const socials = Array.isArray(personalInfo?.socials) ? personalInfo.socials : [];
  socials.forEach((s, idx) => {
    if (isNonEmptyString(s?.url) && !URL_RE.test(s.url)) {
      issues.push({ id: `pi-url-${idx}`, severity: 'info', section, message: `Social link ${idx + 1} is not a valid URL.` });
    }
  });
}

function parseMonthYear(str) {
  if (!str) return null;
  const [year, month] = String(str).split('-');
  const y = parseInt(year, 10), m = parseInt(month, 10);
  if (!y || !m) return null;
  return { y, m };
}

function compareYm(a, b) {
  if (!a || !b) return 0;
  if (a.y !== b.y) return a.y - b.y;
  return a.m - b.m;
}

function checkEducation(issues, education) {
  const section = 'education';
  if (!Array.isArray(education) || education.length === 0) {
    issues.push({ id: 'ed-empty', severity: 'warn', section, message: 'Education section is empty.' });
    return;
  }
  education.forEach((e, idx) => {
    if (!isNonEmptyString(e?.institution)) {
      issues.push({ id: `ed-inst-${idx}`, severity: 'error', section, message: `Education ${idx + 1}: Missing institution.` });
    }
    if (!isNonEmptyString(e?.degree)) {
      issues.push({ id: `ed-degree-${idx}`, severity: 'warn', section, message: `Education ${idx + 1}: Missing degree.` });
    }
    if (!isNonEmptyString(e?.graduationDate)) {
      issues.push({ id: `ed-grad-${idx}`, severity: 'warn', section, message: `Education ${idx + 1}: Missing graduation date.` });
    }
  });
}

function bulletQuality(bullet) {
  const trimmed = (bullet || '').trim();
  const length = trimmed.length;
  const startsWithVerb = ACTION_VERBS.includes(trimmed.split(/\s+/)[0]?.toLowerCase());
  const endsWithPeriod = /\.$/.test(trimmed);
  const problems = [];
  if (length < 15 || length > 220) problems.push('Bullet length should be 15–220 chars.');
  if (!startsWithVerb) problems.push('Begin with a strong action verb.');
  if (endsWithPeriod) problems.push('Avoid trailing periods for bullets.');
  return problems;
}

function checkExperience(issues, experience) {
  const section = 'experience';
  if (!Array.isArray(experience) || experience.length === 0) {
    issues.push({ id: 'ex-empty', severity: 'warn', section, message: 'Experience section is empty.' });
    return;
  }
  experience.forEach((e, idx) => {
    if (!isNonEmptyString(e?.company)) issues.push({ id: `ex-co-${idx}`, severity: 'error', section, message: `Experience ${idx + 1}: Missing company.` });
    if (!isNonEmptyString(e?.position)) issues.push({ id: `ex-pos-${idx}`, severity: 'warn', section, message: `Experience ${idx + 1}: Missing position title.` });
    const start = parseMonthYear(e?.startDate);
    const end = e?.current ? null : parseMonthYear(e?.endDate);
    if (!start) issues.push({ id: `ex-start-${idx}`, severity: 'error', section, message: `Experience ${idx + 1}: Missing start date.` });
    if (!e?.current && !end) issues.push({ id: `ex-end-${idx}`, severity: 'warn', section, message: `Experience ${idx + 1}: Missing end date.` });
    if (start && end && compareYm(start, end) > 0) issues.push({ id: `ex-range-${idx}`, severity: 'error', section, message: `Experience ${idx + 1}: Start date is after end date.` });
    const bullets = Array.isArray(e?.bulletPoints) ? e.bulletPoints : [];
    if (bullets.length === 0) issues.push({ id: `ex-bullets-empty-${idx}`, severity: 'warn', section, message: `Experience ${idx + 1}: Add at least one bullet.` });
    const seen = new Set();
    bullets.forEach((b, bIdx) => {
      const key = (b || '').trim().toLowerCase();
      if (key && seen.has(key)) issues.push({ id: `ex-dup-${idx}-${bIdx}`, severity: 'info', section, message: `Experience ${idx + 1}: Duplicate bullet.` });
      if (key) seen.add(key);
      const probs = bulletQuality(b);
      probs.forEach((msg, pi) => issues.push({ id: `ex-bq-${idx}-${bIdx}-${pi}`, severity: 'info', section, message: `Experience ${idx + 1}: ${msg}` }));
    });
  });
}

function checkProjects(issues, projects) {
  const section = 'projects';
  if (!Array.isArray(projects) || projects.length === 0) return; // optional
  projects.forEach((p, idx) => {
    if (!isNonEmptyString(p?.projectName)) issues.push({ id: `pr-name-${idx}`, severity: 'warn', section, message: `Project ${idx + 1}: Missing project name.` });
    const bullets = Array.isArray(p?.bulletPoints) ? p.bulletPoints : [];
    bullets.forEach((b, bIdx) => {
      const probs = bulletQuality(b);
      probs.forEach((msg, pi) => issues.push({ id: `pr-bq-${idx}-${bIdx}-${pi}`, severity: 'info', section, message: `Project ${idx + 1}: ${msg}` }));
    });
  });
}

function checkSkills(issues, skills) {
  const section = 'skills';
  if (!Array.isArray(skills) || skills.length === 0) {
    issues.push({ id: 'sk-empty', severity: 'warn', section, message: 'Skills section is empty.' });
    return;
  }
  const set = new Set();
  let dupes = 0;
  skills.forEach((s) => {
    const k = (s || '').trim().toLowerCase();
    if (!k) return;
    if (set.has(k)) dupes++;
    set.add(k);
  });
  if (dupes > 0) issues.push({ id: 'sk-dupes', severity: 'info', section, message: 'Duplicate skills found.' });
  if (skills.length > 25) issues.push({ id: 'sk-many', severity: 'warn', section, message: 'Consider reducing skills to the most relevant (over 25 listed).' });
}

/**
 * Evaluate the full resume and return a list of issues.
 */
export function evaluateResume(formData) {
  const t0 = performance.now?.() || Date.now();
  const issues = [];
  try {
    checkPersonalInfo(issues, formData?.personalInfo || {});
    checkEducation(issues, formData?.education || []);
    checkExperience(issues, formData?.experience || []);
    checkProjects(issues, formData?.projects || []);
    checkSkills(issues, formData?.skills || []);
  } catch (err) {
    logger.error('Rule evaluation failed', { message: err?.message });
  }
  const t1 = performance.now?.() || Date.now();
  logger.debug('Evaluation complete', { issues: issues.length, ms: Math.round(t1 - t0) });
  return issues;
}

/**
 * Apply a safe auto-fix to the formData. Returns new formData.
 */
export function applyAutoFix(formData, fix) {
  if (!fix) return formData;
  switch (fix.type) {
    case 'formatPhone': {
      const next = { ...formData, personalInfo: { ...(formData.personalInfo || {}) } };
      next.personalInfo.Phone = normalizeUSPhone(next.personalInfo.Phone || '');
      return next;
    }
    default:
      return formData;
  }
}

export default { evaluateResume, applyAutoFix };


