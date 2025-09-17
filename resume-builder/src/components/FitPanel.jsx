import React from 'react';

/**
 * FitPanel
 * Controls compact presets, page format, and per-section visibility.
 */
function FitPanel({ compactLevel, setCompactLevel, pageFormat, setPageFormat, hiddenSections, setHiddenSections, overflowLines, onRestoreDefaults }) {
  const sectionToggles = [
    { key: 'education', label: 'Education' },
    { key: 'experience', label: 'Experience' },
    { key: 'projects', label: 'Projects' },
    { key: 'skills', label: 'Skills' },
  ];

  return (
    <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur ring-1 ring-black/5 shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">One‑Page Fit</div>
        <div className={`pill-btn ${overflowLines > 0 ? 'pill-danger' : 'pill-success'}`}>{overflowLines > 0 ? `+${overflowLines} lines` : '1‑page fit'}</div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Compact level</div>
        <div className="flex gap-2 flex-wrap">
          {['default','tight','ultra'].map(level => (
            <button key={level} onClick={() => setCompactLevel(level)} className={`pill-btn ${compactLevel === level ? 'pill-primary' : 'pill-neutral'}`}>{level}</button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Page format</div>
        <div className="flex gap-2">
          {['A4','Letter'].map(fmt => (
            <button key={fmt} onClick={() => setPageFormat(fmt)} className={`pill-btn ${pageFormat === fmt ? 'pill-primary' : 'pill-neutral'}`}>{fmt}</button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium mb-2">Hide sections (for fit)</div>
        <div className="flex gap-2 flex-wrap">
          {sectionToggles.map(s => (
            <button key={s.key} onClick={() => setHiddenSections(prev => ({ ...prev, [s.key]: !prev[s.key] }))} className={`pill-btn ${hiddenSections?.[s.key] ? 'pill-warn' : 'pill-neutral'}`}>{hiddenSections?.[s.key] ? `Show ${s.label}` : `Hide ${s.label}`}</button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button className="pill-btn pill-neutral" onClick={onRestoreDefaults}>Restore defaults</button>
      </div>
    </div>
  );
}

export default FitPanel;


