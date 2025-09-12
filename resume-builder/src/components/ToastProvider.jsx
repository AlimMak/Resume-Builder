import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { logger } from '../utils/logger';

/**
 * ToastProvider
 * Minimal toast/notification system for app-wide messages.
 * Use: const toast = useToast(); toast.success('Saved'); toast.error('Oops');
 */
const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const idRef = useRef(0);

  const remove = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const push = useCallback((variant, message, meta) => {
    const id = ++idRef.current;
    const toast = { id, variant, message };
    setToasts(prev => [...prev, toast]);
    logger.info('Toast', { variant, message, ...meta });
    // Auto-dismiss after 3.5s
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const api = useMemo(() => ({
    success: (message, meta) => push('success', message, meta),
    error: (message, meta) => push('error', message, meta),
    info: (message, meta) => push('info', message, meta),
    warn: (message, meta) => push('warn', message, meta),
  }), [push]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {/* Toast container */}
      <div style={{ position: 'fixed', top: 12, right: 12, zIndex: 9999 }}>
        {toasts.map(t => (
          <div
            key={t.id}
            className={`mb-2 px-4 py-3 rounded shadow text-white ${
              t.variant === 'success' ? 'bg-green-600' :
              t.variant === 'error' ? 'bg-red-600' :
              t.variant === 'warn' ? 'bg-yellow-600' : 'bg-gray-800'
            }`}
            role="status"
            aria-live="polite"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Hook to access toast API
 */
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}


