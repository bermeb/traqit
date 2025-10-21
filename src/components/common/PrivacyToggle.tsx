/**
 * PrivacyToggle Component
 * Toggle image privacy mode (blur/show images)
 */

import { useAppContext } from '../../context';
import './PrivacyToggle.css';

export function PrivacyToggle() {
  const { isImagesBlurred, toggleImageBlur } = useAppContext();

  return (
    <button
      className="privacy-toggle"
      onClick={toggleImageBlur}
      aria-label={isImagesBlurred ? 'Bilder anzeigen' : 'Bilder verstecken'}
      title={isImagesBlurred ? 'Bilder anzeigen' : 'Bilder verstecken'}
    >
      <span className="privacy-toggle__icon">
        {isImagesBlurred ? '🙈' : '👁️'}
      </span>
    </button>
  );
}
