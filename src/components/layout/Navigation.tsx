/**
 * Navigation Component
 * Main navigation bar
 */

import { Route } from '../../types';
import { useAppContext } from '../../context';
import './Navigation.css';

interface NavItem {
  route: Route;
  label: string;
  icon: string;
}

const navItems: NavItem[] = [
  { route: '/', label: 'Dashboard', icon: '📊' },
  { route: '/fields', label: 'Felder', icon: '📝' },
  { route: '/entries', label: 'Einträge', icon: '📅' },
  { route: '/charts', label: 'Diagramme', icon: '📈' },
  { route: '/image-compare', label: 'Bildvergleich', icon: '🖼️' },
  { route: '/backup', label: 'Backup', icon: '💾' },
];

export function Navigation() {
  const { currentRoute, isImagesBlurred, toggleImageBlur } = useAppContext();

  return (
    <nav className="navigation">
      <div className="navigation__container">
        {navItems.map((item) => (
          <a
            key={item.route}
            href={`#${item.route}`}
            className={`navigation__item ${currentRoute === item.route ? 'navigation__item--active' : ''}`}
          >
            <span className="navigation__icon">{item.icon}</span>
            <span className="navigation__label">{item.label}</span>
          </a>
        ))}
        <button
          onClick={toggleImageBlur}
          className="navigation__toggle"
          title={isImagesBlurred ? 'Bilder anzeigen' : 'Bilder verstecken'}
        >
          <span className="navigation__icon">{isImagesBlurred ? '🙈' : '👁️'}</span>
          <span className="navigation__label">Privatsphäre</span>
        </button>
      </div>
    </nav>
  );
}
