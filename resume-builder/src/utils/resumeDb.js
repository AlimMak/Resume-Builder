/**
 * resumeDb
 * IndexedDB persistence for storing multiple resumes with unique naming.
 *
 * Why: We need scalable local storage beyond localStorage for multiple, named resumes.
 * How: Use a single object store `resumes` with keyPath `id` and an index on `name`.
 * All operations return Promises for easy async/await integration in React components.
 *
 * Logging: Uses the app logger for all operations to trace workflows and errors.
 *
 * Data shape stored in the `resumes` object store:
 * {
 *   id: string,              // uuid-like or timestamp-based id
 *   name: string,            // unique human-friendly name (enforced by helper)
 *   data: ResumeFormData,    // the full resume form state
 *   createdAt: number,       // epoch ms
 *   updatedAt: number        // epoch ms
 * }
 */
import { logger as rootLogger } from './logger';

const logger = rootLogger.child('resumeDb');

const DB_NAME = 'resumeBuilderDB';
const DB_VERSION = 3; // v3: extend resumeMeta for version history
const STORE_NAME = 'resumes';

/**
 * Open (or upgrade) the IndexedDB database and return the instance.
 * Ensures the object store and indexes exist.
 */
function openDb() {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
          // Non-unique name index to allow searching; uniqueness handled in app logic
          store.createIndex('name', 'name', { unique: false });
          store.createIndex('updatedAt', 'updatedAt', { unique: false });
        }
        // Meta store for dismissals and panel prefs per resume
        if (!db.objectStoreNames.contains('resumeMeta')) {
          db.createObjectStore('resumeMeta', { keyPath: 'resumeId' });
        }
        logger.info('DB upgrade complete', { oldVersion: event.oldVersion, newVersion: DB_VERSION });
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        logger.error('DB open error', { message: request.error?.message });
        reject(request.error);
      };
    } catch (err) {
      logger.error('DB open threw', { message: err?.message });
      reject(err);
    }
  });
}

/**
 * Run a transaction for the given store with the specified mode.
 */
async function runTx(mode, fn) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const store = tx.objectStore(STORE_NAME);
    let result;
    tx.oncomplete = () => resolve(result);
    tx.onerror = () => {
      logger.error('Transaction failed', { message: tx.error?.message });
      reject(tx.error);
    };
    try {
      result = fn(store);
    } catch (err) {
      logger.error('Transaction body error', { message: err?.message });
      reject(err);
    }
  });
}

/**
 * Generate a simple time-based id.
 * Using time+random keeps it sortable and unique enough for client-side.
 */
function generateId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Fetch all resumes sorted by updatedAt desc.
 */
export async function listResumes() {
  return runTx('readonly', (store) => {
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result || [];
        all.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
        resolve(all);
      };
      request.onerror = () => reject(request.error);
    });
  });
}

/**
 * Get a resume by id.
 */
export async function getResume(id) {
  if (!id) return null;
  return runTx('readonly', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  });
}

/**
 * Internal: Collect all names for uniqueness checks.
 */
async function getAllNames() {
  const all = await listResumes();
  return new Set(all.map(r => (r?.name || '').toLowerCase()));
}

/**
 * Compute a unique name by appending " (n)" if needed.
 * Example: "business resume", "business resume (1)", "business resume (2)", ...
 */
export async function findUniqueName(baseName) {
  const trimmed = (baseName || 'Untitled Resume').trim();
  const existing = await getAllNames();
  if (!existing.has(trimmed.toLowerCase())) return trimmed;
  let n = 1;
  while (true) {
    const candidate = `${trimmed} (${n})`;
    if (!existing.has(candidate.toLowerCase())) return candidate;
    n++;
  }
}

/**
 * Create and persist a new resume record with unique name.
 */
export async function createResume({ name, data }) {
  const now = Date.now();
  const unique = await findUniqueName(name || 'Untitled Resume');
  const record = { id: generateId(), name: unique, data: data || createEmptyFormData(), createdAt: now, updatedAt: now };
  logger.info('Creating resume', { id: record.id, name: record.name });
  return runTx('readwrite', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.add(record);
      req.onsuccess = () => resolve(record);
      req.onerror = () => reject(req.error);
    });
  });
}

/**
 * Update an existing resume. Supports partial updates of name and/or data.
 * Ensures name uniqueness if provided.
 */
export async function updateResume(id, update) {
  const existing = await getResume(id);
  if (!existing) throw new Error('Resume not found');
  const next = { ...existing };
  if (update?.name && update.name !== existing.name) {
    next.name = await findUniqueName(update.name);
  }
  if (update?.data !== undefined) {
    next.data = update.data;
  }
  next.updatedAt = Date.now();
  logger.info('Updating resume', { id, rename: update?.name ? true : false });
  return runTx('readwrite', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.put(next);
      req.onsuccess = () => resolve(next);
      req.onerror = () => reject(req.error);
    });
  });
}

/**
 * Rename a resume, enforcing unique naming.
 */
export async function renameResume(id, newName) {
  return updateResume(id, { name: newName });
}

/**
 * Delete a resume by id.
 */
export async function deleteResume(id) {
  logger.warn('Deleting resume', { id });
  return runTx('readwrite', (store) => {
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  });
}

/**
 * Duplicate a resume to a new record with a unique name.
 */
export async function duplicateResume(id, baseName) {
  const existing = await getResume(id);
  if (!existing) throw new Error('Resume not found');
  const unique = await findUniqueName(baseName || existing.name);
  return createResume({ name: unique, data: existing.data });
}

/**
 * Create an empty resume form data structure.
 * Exported for re-use so UI and DB stay in sync on default shape.
 */
export function createEmptyFormData() {
  return {
    personalInfo: {
      FirstName: '',
      LastName: '',
      Description: '',
      socials: [{ platform: '', url: '' }],
      isUSCitizen: '',
      Email: '',
      Phone: ''
    },
    education: [],
    experience: [],
    projects: [],
    skills: []
  };
}

/**
 * Convenience: Check if database has any resumes.
 */
export async function hasAnyResumes() {
  const all = await listResumes();
  return all.length > 0;
}

/**
 * Resume Meta helpers: store dismissals and UI prefs per resume
 */
export async function getResumeMeta(resumeId) {
  if (!resumeId) return null;
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resumeMeta', 'readonly');
    const store = tx.objectStore('resumeMeta');
    const req = store.get(resumeId);
    req.onsuccess = () => resolve(req.result || { resumeId, dismissed: {}, panelOpen: false });
    req.onerror = () => reject(req.error);
  });
}

export async function setResumeMeta(resumeId, meta) {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('resumeMeta', 'readwrite');
    const store = tx.objectStore('resumeMeta');
    const record = { resumeId, ...(meta || {}) };
    const req = store.put(record);
    req.onsuccess = () => resolve(record);
    req.onerror = () => reject(req.error);
  });
}

export default {
  listResumes,
  getResume,
  createResume,
  updateResume,
  renameResume,
  deleteResume,
  duplicateResume,
  findUniqueName,
  hasAnyResumes,
  createEmptyFormData,
  getResumeMeta,
  setResumeMeta,
};


