import React, { useEffect, useState } from 'react';
import { logger } from '../utils/logger';

/**
 * ThemeToggle
 * Small control to switch between light/dark themes.
 * Persists preference to localStorage and defaults to system preference.
 *
 * Logging: Records theme changes for user sessions.
 */
function ThemeToggle() {
  // Determine initial theme: stored value or system preference
  const getInitialTheme = () => {
    try {
      const stored = localStorage.getItem('theme');
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {}
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Apply theme to <html> for CSS variable scoping
    document.documentElement.setAttribute('data-theme', theme);
    // Also toggle Tailwind's dark mode class so `dark:` utilities activate
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('theme', theme);
    } catch {}
    logger.info('Theme changed', { theme });
  }, [theme]);

  const toggle = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <button
      onClick={toggle}
      aria-label="Toggle dark mode"
      className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
      title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
    </button>
  );
}

export default ThemeToggle;


