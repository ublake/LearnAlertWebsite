'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('dark');
  // Pick up whatever the pre-paint script already applied.
  useEffect(() => { setTheme(document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'); }, []);
  function toggleTheme() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    if (next === 'light') document.documentElement.dataset.theme = 'light';
    else delete document.documentElement.dataset.theme;
    try { localStorage.setItem('learnalert-theme', next); } catch {}
  }
  return <button className="theme-toggle" onClick={toggleTheme} aria-pressed={theme === 'light'} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
    {theme === 'dark'
      ? <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.3M12 19.1v2.3M4.4 4.4l1.6 1.6M18 18l1.6 1.6M2.6 12h2.3M19.1 12h2.3M4.4 19.6L6 18M18 6l1.6-1.6"/></svg>
      : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 14.3A8.7 8.7 0 0 1 9.7 3.5a8.8 8.8 0 1 0 10.8 10.8Z"/></svg>}
    {theme === 'dark' ? 'Light' : 'Dark'}
  </button>;
}
