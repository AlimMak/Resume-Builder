import React, { useEffect, useMemo, useState } from 'react';
import { listResumes, getResume, updateResume, getResumeMeta, setResumeMeta } from '../utils/resumeDb';
import { logger } from '../utils/logger';
import { useToast } from './ToastProvider';
import { extractKeywords, scoreAndSuggestRewrites, applySuggestionsToExperience } from '../utils/jobTailor';

/**
 * FilterCheckPage
 * Paste a job description, pick a resume, preview suggested bullet rewrites, and apply.
 * In-browser only, no uploads. Keeps lightweight version history per resume in resumeMeta.
 */
function FilterCheckPage({ onGoHome, onOpenInBuilder }) {
  const toast = useToast();
  const [resumes, setResumes] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [resumeRecord, setResumeRecord] = useState(null);
  const [jdText, setJdText] = useState('');
  const [keywords, setKeywords] = useState({ mustHave: [], niceToHave: [] });
  const [suggestions, setSuggestions] = useState([]); // per bullet suggestions
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const all = await listResumes();
      setResumes(all);
      if (all.length) setSelectedId(all[0].id);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!selectedId) { setResumeRecord(null); return; }
      const rec = await getResume(selectedId);
      setResumeRecord(rec);
    })();
  }, [selectedId]);

  const canAnalyze = useMemo(() => jdText.trim().length > 20 && !!resumeRecord?.data, [jdText, resumeRecord]);

  const analyze = async () => {
    try {
      setLoading(true);
      const kw = extractKeywords(jdText);
      setKeywords(kw);
      const sugg = scoreAndSuggestRewrites(resumeRecord.data, kw);
      setSuggestions(sugg);
      if (!kw.mustHave.length && !kw.niceToHave.length) {
        toast.warn('No targeted sections found. Add “Requirements:” or “Preferred Qualifications:”');
      } else if (!sugg.length) {
        toast.info('No rewrite suggestions. Bullets may already match key terms.');
      } else {
        toast.info('Analysis complete');
      }
    } catch (e) {
      logger.error('Analyze failed', { message: e?.message });
      toast.error('Failed to analyze job description');
    } finally {
      setLoading(false);
    }
  };

  const applyAll = async () => {
    if (!resumeRecord?.id) return;
    try {
      setLoading(true);
      // Push previous version to meta history
      try {
        const meta = (await getResumeMeta(resumeRecord.id)) || { resumeId: resumeRecord.id };
        const history = Array.isArray(meta.history) ? meta.history : [];
        const snapshot = { ts: Date.now(), data: resumeRecord.data };
        const nextMeta = { ...meta, history: [...history, snapshot] };
        await setResumeMeta(resumeRecord.id, nextMeta);
      } catch {}

      const nextData = applySuggestionsToExperience(resumeRecord.data, suggestions);
      const updated = await updateResume(resumeRecord.id, { data: nextData });
      setResumeRecord(updated);
      toast.success('Applied tailored bullet points');
      onOpenInBuilder?.(updated.id);
    } catch (e) {
      logger.error('Apply failed', { message: e?.message });
      toast.error('Failed to apply suggestions');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen app-gradient">
      <div className="max-w-5xl mx-auto px-4 pt-16 pb-14">
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600/20 via-indigo-600/10 to-emerald-600/20 p-1 shadow-lg">
          <div className="flex items-center justify-between rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur px-5 py-4 ring-1 ring-black/5">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">Filter Check</h1>
              <p className="text-sm opacity-80">Paste a job description, tailor your experience bullets, and export.</p>
            </div>
            <button onClick={onGoHome} className="pill-btn pill-neutral">Home</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: JD input and controls */}
          <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur ring-1 ring-black/5 shadow-2xl p-4">
            <div className="mb-3">
              <label className="block font-semibold mb-1">Choose a Resume</label>
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full input-glass">
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label className="block font-semibold mb-1">Paste Job Description</label>
              <textarea value={jdText} onChange={(e) => setJdText(e.target.value)} rows={14} className="w-full input-glass" placeholder="Paste the full job description here..." />
            </div>

            <div className="flex gap-2">
              <button onClick={analyze} disabled={!canAnalyze || loading} className={`pill-btn ${canAnalyze ? 'pill-primary' : 'bg-gray-400 cursor-not-allowed'}`}>Analyze</button>
              <button onClick={applyAll} disabled={!suggestions.length || loading} className={`pill-btn ${suggestions.length ? 'pill-success' : 'bg-gray-400 cursor-not-allowed'}`}>Apply All</button>
            </div>

            {/* Keywords summary */}
            {(keywords.mustHave.length > 0 || keywords.niceToHave.length > 0) && (
              <div className="mt-4 text-sm">
                <div className="font-semibold mb-1">Keywords</div>
                <div className="mb-1"><span className="font-medium">Must‑have:</span> {keywords.mustHave.join(', ') || '—'}</div>
                <div><span className="font-medium">Nice‑to‑have:</span> {keywords.niceToHave.join(', ') || '—'}</div>
              </div>
            )}
          </div>

          {/* Right: Suggestions */}
          <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur ring-1 ring-black/5 shadow-2xl p-4">
            <div className="font-semibold mb-2">Suggested Bullet Rewrites</div>
            {(!suggestions || suggestions.length === 0) ? (
              <div className="text-sm opacity-80">No suggestions yet. Paste a job description and click Analyze.</div>
            ) : (
              <ul className="space-y-3 max-h-[65vh] overflow-auto pr-1">
                {suggestions.map(s => (
                  <li key={s.id} className="p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 ring-1 ring-black/5">
                    <div className="text-xs opacity-70 mb-1">Experience item</div>
                    <div className="text-sm mb-1"><span className="font-medium">Original:</span> {s.original}</div>
                    <div className="text-sm mb-2"><span className="font-medium">Rewrite:</span> {s.rewrite}</div>
                    <div className="text-xs opacity-70">Matches: {s.matches.join(', ') || '—'}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default FilterCheckPage;



