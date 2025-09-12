/**
 * useUndoRedo
 * Generic history manager for immutable state with undo/redo support.
 * Stores a bounded history to avoid memory bloat.
 */
import { useCallback, useMemo, useRef, useState } from 'react';
import { logger } from './logger';

export function useUndoRedo(initialState, options = {}) {
  const { capacity = 50 } = options;
  const [present, setPresent] = useState(initialState);
  const pastRef = useRef([]);
  const futureRef = useRef([]);

  const set = useCallback((next) => {
    setPresent(prev => {
      const value = typeof next === 'function' ? next(prev) : next;
      // Push previous to past, clear future on new branch
      const past = pastRef.current;
      past.push(prev);
      if (past.length > capacity) past.shift();
      pastRef.current = past;
      futureRef.current = [];
      logger.debug('State set', { sizePast: past.length });
      return value;
    });
  }, [capacity]);

  const canUndo = pastRef.current.length > 0;
  const canRedo = futureRef.current.length > 0;

  const undo = useCallback(() => {
    if (!pastRef.current.length) return;
    setPresent(prev => {
      const past = pastRef.current;
      const previous = past.pop();
      futureRef.current.push(prev);
      pastRef.current = past;
      logger.info('Undo', { sizePast: past.length, sizeFuture: futureRef.current.length });
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    if (!futureRef.current.length) return;
    setPresent(prev => {
      const future = futureRef.current;
      const next = future.pop();
      pastRef.current.push(prev);
      futureRef.current = future;
      logger.info('Redo', { sizePast: pastRef.current.length, sizeFuture: futureRef.current.length });
      return next;
    });
  }, []);

  const api = useMemo(() => ({ state: present, set, undo, redo, canUndo, canRedo }), [present, set, undo, redo, canUndo, canRedo]);
  return api;
}

export default useUndoRedo;


