/**
 * ErrorDialog Component
 * Modal dialog for displaying important errors
 */

import { Modal, ModalActions, Button } from './index';

interface ErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
  details?: string;
}

export function ErrorDialog({
  isOpen,
  onClose,
  title = 'Fehler',
  message,
  details,
}: ErrorDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div style={{ marginBottom: 'var(--spacing-lg)' }}>
        <p style={{ marginBottom: details ? 'var(--spacing-md)' : 0 }}>{message}</p>
        {details && (
          <details style={{ marginTop: 'var(--spacing-md)' }}>
            <summary style={{ cursor: 'pointer', color: 'var(--color-text-secondary)' }}>
              Details
            </summary>
            <pre
              style={{
                marginTop: 'var(--spacing-sm)',
                padding: 'var(--spacing-sm)',
                background: 'var(--color-surface-hover)',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.875rem',
                overflow: 'auto',
                maxHeight: '200px',
              }}
            >
              {details}
            </pre>
          </details>
        )}
      </div>
      <ModalActions>
        <Button variant="primary" onClick={onClose}>
          OK
        </Button>
      </ModalActions>
    </Modal>
  );
}
