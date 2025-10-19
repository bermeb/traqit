/**
 * Modal Component Tests
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal, ModalActions } from '../Modal';

describe('Modal Component', () => {
  it('should render when open', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );

    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="Test Modal">
        Modal content
      </Modal>
    );

    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    const closeButton = screen.getByRole('button', { name: /close/i });
    await user.click(closeButton);

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when backdrop is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        Content
      </Modal>
    );

    // Modal is rendered via portal to document.body
    const backdrop = document.body.querySelector('.modal-backdrop');
    if (backdrop) {
      await user.click(backdrop);
    }

    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('should not close when modal content is clicked', async () => {
    const handleClose = vi.fn();
    const user = userEvent.setup();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Modal">
        <div data-testid="modal-content">Content</div>
      </Modal>
    );

    const content = screen.getByTestId('modal-content');
    await user.click(content);

    expect(handleClose).not.toHaveBeenCalled();
  });

  it('should render with custom size', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="Test" size="lg">
        Content
      </Modal>
    );

    // Modal is rendered via portal to document.body
    const modal = document.body.querySelector('.modal--lg');
    expect(modal).toBeInTheDocument();
  });
});

describe('ModalActions Component', () => {
  it('should render action buttons', () => {
    render(
      <ModalActions>
        <button>Action 1</button>
        <button>Action 2</button>
      </ModalActions>
    );

    expect(screen.getByText('Action 1')).toBeInTheDocument();
    expect(screen.getByText('Action 2')).toBeInTheDocument();
  });

  it('should have correct CSS class', () => {
    render(
      <ModalActions>
        <button>Action</button>
      </ModalActions>
    );

    const actions = screen.getByText('Action').parentElement;
    expect(actions).toHaveClass('modal__actions');
  });
});
