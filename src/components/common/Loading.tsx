/**
 * Loading Component
 * Spinner and loading states
 */

import './Loading.css';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  text?: string;
}

export function Loading({ size = 'md', fullScreen = false, text }: LoadingProps) {
  if (fullScreen) {
    return (
      <div className="loading-fullscreen">
        <div className={`loading-spinner loading-spinner--${size}`} />
        {text && <p className="loading-text">{text}</p>}
      </div>
    );
  }

  return (
    <div className="loading">
      <div className={`loading-spinner loading-spinner--${size}`} />
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
