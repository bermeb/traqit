/**
 * ThemeToggle Component
 * Toggle between light and dark mode
 */

import { useDarkMode } from '../../hooks/useDarkMode';
import './ThemeToggle.css';

export function ThemeToggle() {
  const { isDark, toggleTheme } = useDarkMode();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Hell' : 'Dunkel'}
    >
      <span className="theme-toggle__icon">
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  );
}
