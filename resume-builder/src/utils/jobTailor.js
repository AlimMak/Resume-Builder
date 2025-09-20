/**
 * jobTailor
 * In-browser keyword extraction and deterministic bullet rewrites based on a pasted JD.
 * Prioritizes must-have keywords; never fabricates new experience—only rewrites bullets.
 * Logging is handled upstream where these functions are called.
 */

const STOPWORDS = new Set([
  'the','a','an','and','or','for','with','to','of','in','on','by','at','from','as','that','this','these','those',
  'we','you','our','your','their','they','he','she','it','is','are','was','were','be','been','being','will','can','may',
  'must','should','could','would','have','has','had','do','does','did','not','no','yes','etc','about','over','under','per',
  // Generic JD words/headers we never want as keywords
  'summary','overview','about','job','title','role','position','duration','contract','hourly','rate','salary','benefits',
  'requirements','requirement','responsibilities','responsibility','qualifications','qualification','preferred','preference',
  'nice','plus','nice-to-have','must-have','location','remote','onsite','hybrid','locals','department','team','office',
  'company','mission','vision','group','organization','firm','client','clients','consultants','employees','candidate'
]);

const ACTION_VERBS = [
  'designed','built','developed','integrated','managed','utilized','implemented','enhanced','reduced','tracked','supported','collaborated','engineered','created','automated','optimized','improved','led','owned','delivered','increased','decreased','analyzed','architected','launched','migrated','refactored','secured','deployed','orchestrated','streamlined'
];

// Comprehensive allowlist of common tech/product keywords (lowercase canonical forms)
const ALLOWLIST = [
  // Languages
  'python','java','javascript','typescript','c++','c#','go','golang','rust','php','ruby','kotlin','swift','scala','r','matlab','bash','shell','powershell','sql','nosql','html','css','sass','less','dart','elixir','haskell','clojure','lua','perl','objective-c','objectivec','solidity','apex',
  // Web/Frameworks
  'react','reactjs','react.js','nextjs','next.js','angular','angularjs','vue','vuejs','vue.js','svelte','node','nodejs','node.js','express','express.js','nestjs','nest.js','graphql','rest','grpc','fastapi','django','flask','spring','springboot','spring-boot','.net','dotnet','asp.net','aspnet','rails','ruby on rails','laravel','symfony','phoenix','gin','fiber','ktor',
  // Data/Analytics
  'pandas','numpy','scikit-learn','sklearn','matplotlib','seaborn','pytorch','tensorflow','keras','spark','pyspark','hadoop','hive','pig','presto','trino','airflow','dbt','looker','tableau','powerbi','power bi','superset','metabase','qlik','databricks','snowflake','bigquery','redshift','athena','glue','emr',
  // Databases/Caches/Search
  'mysql','postgres','postgresql','mariadb','sqlite','sqlserver','oracle','mongodb','cassandra','dynamodb','couchbase','cosmosdb','cockroachdb','redis','memcached','elasticsearch','opensearch','solr','neo4j','janusgraph','arangodb',
  // Cloud/Infra
  'aws','azure','gcp','google cloud','amazon web services','ec2','s3','rds','lambda','api gateway','apigateway','route53','cloudfront','ecr','ecs','eks','fargate','cloudwatch','cloudformation','terraform','pulumi','ansible','chef','puppet','packer','vault','consul','nomad','kubernetes','k8s','helm','istio','linkerd','nginx','apache','haproxy',
  // DevOps/CI-CD
  'docker','compose','podman','jenkins','github actions','gitlab ci','gitlab-ci','circleci','travis','bamboo','teamcity','argo','argo cd','argo-cd','spinnaker','sonarqube','nexus','artifactory','snyk','dependabot',
  // Messaging/Streaming
  'kafka','rabbitmq','activemq','sqs','sns','kinesis','pubsub','pub/sub','eventbridge',
  // Testing/QA
  'selenium','cypress','playwright','puppeteer','jest','mocha','chai','enzyme','vitest','pytest','unittest','nose','junit','testng','robot framework','postman','newman','gatling','locust','jmeter','qa','quality assurance',
  // Monitoring/Logging
  'prometheus','grafana','loki','tempo','jaeger','zipkin','datadog','new relic','dynatrace','splunk','elk','efk','opentelemetry','otel',
  // Mobile
  'android','kotlin','java','ios','swift','objective-c','react native','react-native','flutter','xcode','gradle','maven',
  // Security/Auth
  'oauth','oauth2','saml','oidc','open id connect','jwt','jwks','mfa','2fa','cwe','owasp','csp','tls','mtls','mutual tls',
  // Tools/IDEs
  'vscode','visual studio code','visual studio','intellij','idea','pycharm','webstorm','datagrip','clion','android studio','xcode',
  // PM/Issue Tracking
  'jira','confluence','trello','asana','linear','notion',
  // Other
  'microservices','serverless','event-driven','event driven','soa','monolith','saas','paas','iaas','etl','elt','mlops','devops','site reliability','sre','apm'
];
export const KEYWORD_COUNT = ALLOWLIST.length;
const ALLOWLIST_LOWER = ALLOWLIST.map(s => s.toLowerCase());
const ALLOW_TOKENS = new Set(ALLOWLIST_LOWER.filter(s => !s.includes(' ')));
const ALLOW_PHRASES = ALLOWLIST_LOWER.filter(s => s.includes(' '));

function tokenize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9+#.\-\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function extractAllowedFromLine(line) {
  const hits = new Set();
  const lower = String(line || '').toLowerCase();
  // single-token hits
  const toks = tokenize(lower);
  for (const t of toks) {
    if (ALLOW_TOKENS.has(t)) hits.add(t);
  }
  // phrase hits
  for (const ph of ALLOW_PHRASES) {
    if (lower.includes(ph)) hits.add(ph);
  }
  return Array.from(hits);
}

function uniquePreserveOrder(arr) {
  const seen = new Set();
  const out = [];
  for (const x of arr) {
    const k = x.toLowerCase();
    if (!seen.has(k)) { seen.add(k); out.push(x); }
  }
  return out;
}

function isTechWord(word) {
  // Keep likely skill/tech tokens
  if (!word) return false;
  if (STOPWORDS.has(word)) return false;
  if (/^\d+$/.test(word)) return false;
  return /[a-z0-9]/.test(word);
}

/**
 * Extract must-have and nice-to-have keywords from JD text.
 * Must-have: words under headings like Requirements/Qualifications/Responsibilities.
 */
export function extractKeywords(jdText) {
  const text = String(jdText || '');
  const lines = text.split(/\r?\n/);
  // Strict section targeting: only pull from required/basic and preferred/nice-to-have sections
  const MUST_HEADERS = [
    /^(required|basic)\s+(skills|qualifications|requirements)\s*:?$/i,
    /^required\s*:$/i,
    /^requirements\s*:?$/i,
    /^minimum\s+qualifications\s*:?$/i,
    /^basic\s+qualifications\s*:$/i,
    /^qualifications\s*:$/i,
  ];
  const NICE_HEADERS = [
    /^(preferred|nice\s*-?\s*to\s*-?\s*have|desired)\s+(skills|qualifications|requirements)?\s*:?$/i,
    /^preferred\s*:$/i,
    /^preferred\s+qualifications\s*:?$/i,
    /^desired\s+skills\s*:$/i,
    /^bonus\s+points\s*:?$/i,
  ];
  const HEADERISH = (line) => /:$/i.test(line) || (/^[A-Z][A-Za-z \-/&]{2,}$/.test(line) && line.length < 80);

  let current = 'none'; // 'must' | 'nice' | 'none'
  const buckets = { must: [], nice: [] };
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    if (HEADERISH(line)) {
      if (MUST_HEADERS.some(re => re.test(line))) current = 'must';
      else if (NICE_HEADERS.some(re => re.test(line))) current = 'nice';
      else current = 'none';
      continue; // never treat headers as keyword sources
    }
    // Only extract inside targeted sections
    if (current === 'none') continue;
    // Prefer bullet/short lines; ignore long prose
    const bulletLike = /^([•\-\*]\s+)/.test(raw) || line.length <= 160;
    if (!bulletLike) continue;
    // Strictly keep only allowlisted keywords (tokens or phrases)
    const kept = extractAllowedFromLine(line);
    if (kept.length) buckets[current].push(...kept);
  }

  // Fallback: if no keywords found at all, try inline section detection
  const hasAny = (buckets.must.length + buckets.nice.length) > 0;
  if (!hasAny) {
    const textLower = text.toLowerCase();
    const tryGrab = (needleReArray) => {
      for (const re of needleReArray) {
        const m = re.exec(textLower);
        if (m) {
          // Take up to next two blank lines as the section body
          const start = m.index + m[0].length;
          const tail = textLower.slice(start);
          const body = tail.split(/\n\s*\n/)[0] || tail; // until first blank line block
          const secLines = body.split(/\n/).slice(0, 40); // cap
          for (const raw2 of secLines) {
            const l2 = raw2.trim();
            if (!l2) continue;
            const bulletLike2 = /^([•\-\*]\s+)/.test(raw2) || l2.length <= 160;
            if (!bulletLike2) continue;
            const kept2 = extractAllowedFromLine(l2);
            if (kept2.length) buckets.must.push(...kept2);
          }
          if (buckets.must.length) break;
        }
      }
    };
    tryGrab([/requirements\s*:?/i, /required\s+qualifications\s*:?/i, /minimum\s+qualifications\s*:?/i]);
    if (!buckets.must.length) tryGrab([/preferred\s+qualifications\s*:?/i, /nice\s*-?\s*to\s*-?\s*have\s*:?/i, /desired\s+skills\s*:?/i]);
  }

  // Global fallback: if still no (or too few) keywords, scan entire JD and weight allowlisted hits
  const totalFound = buckets.must.length + buckets.nice.length;
  if (totalFound < 3) {
    const scores = new Map();
    const allLines = text.split(/\r?\n/);
    for (const rawLine of allLines) {
      const line = rawLine.trim();
      if (!line) continue;
      // Weights: bullets get 3, short lines get 2, others get 1
      const isBullet = /^([•\-\*]\s+)/.test(rawLine);
      const isShort = line.length <= 140;
      const weight = isBullet ? 3 : (isShort ? 2 : 1);

      // Token/phrase-based hits
      const hits = extractAllowedFromLine(line);
      for (const h of hits) {
        scores.set(h, (scores.get(h) || 0) + weight);
      }

      // Comma-separated lists often include tools: split and test each token
      if (/,/.test(line)) {
        const parts = line.split(',').map(s => s.trim().toLowerCase());
        for (const p of parts) {
          const hits2 = extractAllowedFromLine(p);
          for (const h2 of hits2) {
            scores.set(h2, (scores.get(h2) || 0) + weight + 1);
          }
        }
      }
    }
    const ranked = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]).map(([k]) => k);
    // Use top N as must-have to drive suggestions
    buckets.must.push(...ranked.slice(0, 20));
  }
  let mustHave = uniquePreserveOrder(buckets.must).slice(0, 80);
  let nicePool = uniquePreserveOrder(buckets.nice).slice(0, 80);
  // Filter stopwords again explicitly (handles multi-pass cases)
  mustHave = mustHave.filter(t => !STOPWORDS.has(t));
  nicePool = nicePool.filter(t => !STOPWORDS.has(t));
  // Remove overlaps
  const mustSet = new Set(mustHave.map(x => x.toLowerCase()));
  const niceToHave = nicePool.filter(x => !mustSet.has(x.toLowerCase()));
  return { mustHave, niceToHave };
}

function startsWithActionVerb(text) {
  const first = String(text || '').trim().split(/\s+/)[0]?.toLowerCase();
  return ACTION_VERBS.includes(first);
}

function enforceStyleRules(text) {
  if (!text) return '';
  let t = String(text).trim();
  // Remove trailing period
  t = t.replace(/\.+\s*$/, '');
  // Start with an action verb if missing
  if (!startsWithActionVerb(t)) {
    t = `${ACTION_VERBS[0]} ${t}`; // default to 'designed' as a safe prefix
  }
  // Clamp length
  if (t.length < 15) t = t.padEnd(15, '·');
  if (t.length > 220) t = t.slice(0, 220);
  return t;
}

function matchKeywords(text, keywords) {
  const hits = new Set(extractAllowedFromLine(text));
  const want = new Set((keywords || []).map(k => String(k).toLowerCase()));
  const out = [];
  for (const h of hits) {
    if (want.has(h.toLowerCase())) out.push(h);
  }
  return out;
}

/**
 * scoreAndSuggestRewrites
 * For each experience bullet, compute matches; if few matches and relevant tokens exist in JD,
 * suggest a rewrite that prioritizes must-have keywords while preserving meaning.
 */
export function scoreAndSuggestRewrites(formData, { mustHave, niceToHave }) {
  const experience = Array.isArray(formData?.experience) ? formData.experience : [];
  const suggestions = [];
  const must = mustHave || [];
  const nice = niceToHave || [];
  const combined = [...must, ...nice];

  // 1) Compute which allowlisted keywords already exist across all bullets
  const presentAcrossAll = new Set();
  experience.forEach((exp) => {
    const bullets = Array.isArray(exp?.bulletPoints) ? exp.bulletPoints : [];
    bullets.forEach((b) => {
      matchKeywords(b || '', combined).forEach(k => presentAcrossAll.add(k.toLowerCase()));
    });
  });

  // 2) Missing keywords overall, in priority order (must first)
  const missingOverall = combined.filter(k => !presentAcrossAll.has(k.toLowerCase()));
  if (missingOverall.length === 0) return suggestions;

  // 3) Distribute: add at most ONE new keyword per bullet, and use each keyword ONCE total
  const usedKeywords = new Set();
  for (let expIdx = 0; expIdx < experience.length; expIdx++) {
    const exp = experience[expIdx] || {};
    const bullets = Array.isArray(exp?.bulletPoints) ? exp.bulletPoints : [];
    for (let bIdx = 0; bIdx < bullets.length; bIdx++) {
      const original = bullets[bIdx] || '';
      const currentMatches = matchKeywords(original, combined).map(s => s.toLowerCase());
      // pick the first missing keyword that hasn't been used and isn't already matched in this bullet
      const candidate = missingOverall.find(k => !usedKeywords.has(k.toLowerCase()) && !currentMatches.includes(k.toLowerCase()));
      if (!candidate) continue;

      let rewrite = original;
      if (/\b(using|with|via|through)\b/i.test(rewrite)) {
        rewrite = rewrite.replace(/\b(using|with|via|through)\b/i, `$1 ${candidate} and`);
      } else {
        rewrite = `${rewrite} using ${candidate}`;
      }
      rewrite = enforceStyleRules(rewrite);
      const matches = matchKeywords(rewrite, combined);
      suggestions.push({ id: `${expIdx}-${bIdx}`, expIndex: expIdx, bulletIndex: bIdx, original, rewrite, matches });
      usedKeywords.add(candidate.toLowerCase());

      // stop if we've placed all missing keywords
      if (usedKeywords.size >= missingOverall.length) break;
    }
    if (usedKeywords.size >= missingOverall.length) break;
  }

  return suggestions;
}

/**
 * applySuggestionsToExperience
 * Returns new formData with suggested rewrites applied to experience bullets.
 */
export function applySuggestionsToExperience(formData, suggestions) {
  const map = new Map();
  for (const s of suggestions || []) {
    map.set(`${s.expIndex}-${s.bulletIndex}`, s.rewrite);
  }
  const next = { ...(formData || {}) };
  next.experience = (Array.isArray(formData?.experience) ? formData.experience : []).map((exp, expIdx) => {
    const e = { ...(exp || {}) };
    e.bulletPoints = (Array.isArray(exp?.bulletPoints) ? exp.bulletPoints : []).map((b, bIdx) => {
      const key = `${expIdx}-${bIdx}`;
      return map.has(key) ? map.get(key) : b;
    });
    return e;
  });
  return next;
}

export default { extractKeywords, scoreAndSuggestRewrites, applySuggestionsToExperience };



