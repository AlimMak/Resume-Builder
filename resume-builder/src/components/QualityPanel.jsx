import React from 'react';

/**
 * QualityPanel
 * Displays ATS/quality issues with filters and actions.
 */
function QualityPanel({ issues, onJump, onDismiss, onAutoFix, filters, setFilters, onRestore, busy }) {
  const counts = issues.reduce((acc, it) => { acc[it.severity] = (acc[it.severity] || 0) + 1; return acc; }, {});

  const visible = issues.filter(it => (filters.error && it.severity === 'error') || (filters.warn && it.severity === 'warn') || (filters.info && it.severity === 'info'));

  return (
    <div className="rounded-2xl bg-white/70 dark:bg-gray-900/60 backdrop-blur ring-1 ring-black/5 shadow-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-semibold">Quality checks</div>
        <div className="flex gap-2">
          <button className={`pill-btn ${filters.error ? 'pill-danger' : 'pill-neutral'}`} onClick={() => setFilters(prev => ({ ...prev, error: !prev.error }))}>Errors {counts.error ? `(${counts.error})` : ''}</button>
          <button className={`pill-btn ${filters.warn ? 'pill-warn' : 'pill-neutral'}`} onClick={() => setFilters(prev => ({ ...prev, warn: !prev.warn }))}>Warnings {counts.warn ? `(${counts.warn})` : ''}</button>
          <button className={`pill-btn ${filters.info ? 'pill-primary' : 'pill-neutral'}`} onClick={() => setFilters(prev => ({ ...prev, info: !prev.info }))}>Info {counts.info ? `(${counts.info})` : ''}</button>
          <button className="pill-btn pill-neutral" onClick={onRestore} disabled={busy}>Restore All</button>
        </div>
      </div>
      {visible.length === 0 ? (
        <div className="text-sm opacity-80">No issues in selected filters.</div>
      ) : (
        <ul className="space-y-2 max-h-[50vh] overflow-auto pr-1">
          {visible.map((it) => (
            <li key={it.id} className="flex items-start justify-between gap-2 p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 ring-1 ring-black/5">
              <div className="flex-1">
                <div className="text-sm"><span className={`font-semibold mr-1 ${it.severity === 'error' ? 'text-red-600' : it.severity === 'warn' ? 'text-amber-500' : 'text-blue-600'}`}>{it.severity.toUpperCase()}</span>{it.message}</div>
              </div>
              <div className="flex gap-2">
                {it.autoFix && (
                  <button className="pill-btn pill-success" onClick={() => onAutoFix(it)} disabled={busy}>Auto-fix</button>
                )}
                <button className="pill-btn pill-primary" onClick={() => onJump(it.section)}>Jump</button>
                <button className="pill-btn pill-neutral" onClick={() => onDismiss(it.id)} disabled={busy}>Dismiss</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default QualityPanel;


