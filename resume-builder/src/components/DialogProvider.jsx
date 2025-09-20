import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

/**
 * DialogProvider
 * App-wide styled dialogs replacing native alert/confirm/prompt.
 * All methods return Promises so callers can `await` user decisions.
 */
const DialogContext = createContext(null);

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [value, setValue] = useState('');

  const open = useCallback((cfg) => {
    return new Promise((resolve) => {
      setValue(cfg.defaultValue || '');
      setDialog({ ...cfg, resolve });
    });
  }, []);

  const close = useCallback((result) => {
    if (dialog?.resolve) dialog.resolve(result);
    setDialog(null);
  }, [dialog]);

  // Keyboard handlers (Enter/ESC)
  useEffect(() => {
    if (!dialog) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        close(dialog.type === 'alert' ? true : null);
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (dialog.type === 'prompt') close(value);
        if (dialog.type === 'confirm') close(true);
        if (dialog.type === 'alert') close(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dialog, value, close]);

  const api = useMemo(() => ({
    alert: (message, options) => open({ type: 'alert', message, ...(options || {}) }),
    confirm: (message, options) => open({ type: 'confirm', message, ...(options || {}) }),
    prompt: (message, defaultValue = '', options) => open({ type: 'prompt', message, defaultValue, ...(options || {}) }),
  }), [open]);

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
          <div className="fixed inset-0 bg-black/50" />
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div className="rounded-2xl bg-white/90 dark:bg-gray-900/80 backdrop-blur ring-1 ring-black/5 shadow-2xl w-full max-w-md">
              <div className="p-5">
                {dialog.title && <div className="text-lg font-semibold mb-2">{dialog.title}</div>}
                <div className="text-sm opacity-90 mb-3">{dialog.message}</div>
                {dialog.type === 'prompt' && (
                  <input
                    className="w-full input-glass mb-4"
                    autoFocus
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                  />
                )}
                <div className="flex justify-end gap-2">
                  {dialog.type !== 'alert' && (
                    <button className="pill-btn pill-neutral" onClick={() => close(null)}>Cancel</button>
                  )}
                  {dialog.type === 'confirm' && (
                    <button className="pill-btn pill-primary" onClick={() => close(true)}>Confirm</button>
                  )}
                  {dialog.type === 'prompt' && (
                    <button className="pill-btn pill-primary" onClick={() => close(value)}>OK</button>
                  )}
                  {dialog.type === 'alert' && (
                    <button className="pill-btn pill-primary" onClick={() => close(true)}>OK</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error('useDialog must be used within a DialogProvider');
  return ctx;
}

export default DialogProvider;


