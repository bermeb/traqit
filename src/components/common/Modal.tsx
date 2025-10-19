/**
 * Modal Component
 * Reusable modal dialog
 */

import { ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import './Modal.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closeOnBackdropClick?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeOnBackdropClick = true,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return createPortal(
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className={`modal modal--${size}`}>
        <div className="modal__header">
          {title && <h2 className="modal__title">{title}</h2>}
          <button className="modal__close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="modal__content">{children}</div>
      </div>
    </div>,
    document.body
  );
}

interface ModalActionsProps {
  children: ReactNode;
}

export function ModalActions({ children }: ModalActionsProps) {
  return <div className="modal__actions">{children}</div>;
}
