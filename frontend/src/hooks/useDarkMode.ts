import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    const stored = localStorage.getItem('mrs_theme');
    if (stored) return stored === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      localStorage.setItem('mrs_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mrs_theme', 'light');
    }
  }, [isDark]);

  return { isDark, toggle: () => setIsDark((d) => !d) };
};
