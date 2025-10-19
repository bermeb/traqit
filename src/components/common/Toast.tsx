/**
 * Toast Component
 * Temporary notification messages
 */

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Toast.css';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icon = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
  }[type];

  return createPortal(
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">{icon}</span>
      <span className="toast__message">{message}</span>
      <button
        className="toast__close"
        onClick={onClose}
        aria-label="Schließen"
      >
        ✕
      </button>
    </div>,
    document.body
  );
}
