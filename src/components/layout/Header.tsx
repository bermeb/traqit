/**
 * Header Component
 * App header with logo, title and theme toggle
 */

import { APP_NAME } from '../../utils';
import { ThemeToggle } from '../common';
import './Header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__content">
          <div className="header__branding">
            <img src="/icon-192.png" alt={APP_NAME} className="header__logo" />
            <h1 className="header__title">{APP_NAME}</h1>
          </div>
          <div className="header__actions">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
