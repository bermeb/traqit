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
  { route: '/entries', label: 'Erfassung', icon: '📅' },
  { route: '/analytics', label: 'Auswertung', icon: '📈' },
  { route: '/backup', label: 'Backup', icon: '💾' },
];

export function Navigation() {
  const { currentRoute } = useAppContext();

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
      </div>
    </nav>
  );
}
