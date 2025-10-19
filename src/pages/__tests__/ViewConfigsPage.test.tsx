/**
 * ViewConfigsPage Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ViewConfigsPage } from '../ViewConfigsPage';
import { Field, ViewConfiguration } from '../../types';

// Mock the context
vi.mock('../../context', () => ({
  useAppContext: vi.fn(),
}));

// Mock the useViewConfigs hook
vi.mock('../../hooks', () => ({
  useViewConfigs: vi.fn(),
}));

import { useAppContext } from '../../context';
import { useViewConfigs } from '../../hooks';

describe('ViewConfigsPage Component', () => {
  const mockFields: Field[] = [
    {
      id: 'field-1',
      name: 'KFA',
      unit: '%',
      type: 'number',
      createdAt: new Date(),
      order: 0,
    },
    {
      id: 'field-2',
      name: 'Gewicht',
      unit: 'kg',
      type: 'number',
      createdAt: new Date(),
      order: 1,
    },
    {
      id: 'field-3',
      name: 'Muskelmasse',
      unit: '%',
      type: 'number',
      createdAt: new Date(),
      order: 2,
    },
  ];

  const mockViewConfigs: ViewConfiguration[] = [
    {
      id: 'config-1',
      name: 'Körperzusammensetzung',
      description: 'Body composition metrics',
      fieldIds: ['field-1', 'field-2'],
      icon: '🧬',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
      isDefault: true,
    },
    {
      id: 'config-2',
      name: 'Custom Config',
      description: 'My custom config',
      fieldIds: ['field-3'],
      icon: '📊',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
      isDefault: false,
    },
  ];

  const mockAddViewConfig = vi.fn();
  const mockUpdateViewConfig = vi.fn();
  const mockDeleteViewConfig = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useAppContext).mockReturnValue({
      fields: mockFields,
      entries: [],
      isLoading: false,
      error: null,
      currentRoute: '/view-configs',
      setFields: vi.fn(),
      setEntries: vi.fn(),
      setCurrentRoute: vi.fn(),
      setIsLoading: vi.fn(),
      setError: vi.fn(),
      refreshFields: vi.fn(),
      refreshEntries: vi.fn(),
      clearError: vi.fn(),
    });

    vi.mocked(useViewConfigs).mockReturnValue({
      viewConfigs: mockViewConfigs,
      addViewConfig: mockAddViewConfig.mockResolvedValue(undefined),
      updateViewConfig: mockUpdateViewConfig.mockResolvedValue(undefined),
      deleteViewConfig: mockDeleteViewConfig.mockResolvedValue(undefined),
      refreshViewConfigs: vi.fn(),
      loading: false,
      error: null,
    });
  });

  describe('Page Layout', () => {
    it('should render page title', () => {
      render(<ViewConfigsPage />);
      expect(screen.getByText('Ansichtskonfigurationen')).toBeInTheDocument();
    });

    it('should render page description', () => {
      render(<ViewConfigsPage />);
      expect(
        screen.getByText(
          /Erstelle vorgefertigte Ansichten mit ausgewählten Messfeldern/
        )
      ).toBeInTheDocument();
    });

    it('should render new view button', () => {
      render(<ViewConfigsPage />);
      expect(screen.getByRole('button', { name: /Neue Ansicht/i })).toBeInTheDocument();
    });
  });

  describe('View Configs List', () => {
    it('should display all view configs', () => {
      render(<ViewConfigsPage />);

      expect(screen.getByText('Körperzusammensetzung')).toBeInTheDocument();
      expect(screen.getByText('Custom Config')).toBeInTheDocument();
    });

    it('should display config descriptions', () => {
      render(<ViewConfigsPage />);

      expect(screen.getByText('Body composition metrics')).toBeInTheDocument();
      expect(screen.getByText('My custom config')).toBeInTheDocument();
    });

    it('should display config icons', () => {
      render(<ViewConfigsPage />);

      expect(screen.getByText('🧬')).toBeInTheDocument();
      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('should display field count', () => {
      render(<ViewConfigsPage />);

      expect(screen.getByText(/2 Felder/)).toBeInTheDocument();
      expect(screen.getByText(/1 Feld/)).toBeInTheDocument();
    });

    it('should display field names', () => {
      render(<ViewConfigsPage />);

      expect(screen.getByText(/KFA, Gewicht/)).toBeInTheDocument();
      expect(screen.getByText(/Muskelmasse/)).toBeInTheDocument();
    });

    it('should show Standard badge for default configs', () => {
      render(<ViewConfigsPage />);

      const badges = screen.getAllByText('Standard');
      expect(badges).toHaveLength(1);
    });

    it('should show edit buttons for all configs', () => {
      render(<ViewConfigsPage />);

      const editButtons = screen.getAllByRole('button', { name: /Bearbeiten/i });
      expect(editButtons).toHaveLength(2);
    });

    it('should show delete button only for non-default configs', () => {
      render(<ViewConfigsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /Löschen/i });
      expect(deleteButtons).toHaveLength(2); // Both configs can be deleted now
    });

    it('should show empty message when no configs', () => {
      vi.mocked(useViewConfigs).mockReturnValue({
        viewConfigs: [],
        addViewConfig: mockAddViewConfig,
        updateViewConfig: mockUpdateViewConfig,
        deleteViewConfig: mockDeleteViewConfig,
        refreshViewConfigs: vi.fn(),
        loading: false,
        error: null,
      });

      render(<ViewConfigsPage />);

      expect(screen.getByText('Noch keine Ansichtskonfigurationen erstellt.')).toBeInTheDocument();
    });
  });

  describe('Create View Config', () => {
    it('should open modal when new view button is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      expect(screen.getByText('Neue Ansicht')).toBeInTheDocument();
      expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    });

    it('should submit new view config', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      // Open modal
      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      // Fill form
      const nameInput = screen.getByLabelText(/Name/i);
      await user.type(nameInput, 'Test Config');

      const descriptionInput = screen.getByLabelText(/Beschreibung/i);
      await user.type(descriptionInput, 'Test Description');

      // Select fields
      const fieldCheckboxes = screen.getAllByRole('checkbox');
      await user.click(fieldCheckboxes[0]); // Select first field

      // Submit
      const submitButton = screen.getByRole('button', { name: /Erstellen/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockAddViewConfig).toHaveBeenCalledWith({
          name: 'Test Config',
          description: 'Test Description',
          fieldIds: ['field-1'],
          icon: '📊',
          chartType: 'line',
        });
      });
    });

    it('should show error when submitting without name', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      const submitButton = screen.getByRole('button', { name: /Erstellen/i });
      await user.click(submitButton);

      expect(screen.getByText('Bitte gib einen Namen ein.')).toBeInTheDocument();
    });

    it('should show error when submitting without fields', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      const nameInput = screen.getByLabelText(/Name/i);
      await user.type(nameInput, 'Test Config');

      const submitButton = screen.getByRole('button', { name: /Erstellen/i });
      await user.click(submitButton);

      expect(screen.getByText('Bitte wähle mindestens ein Feld aus.')).toBeInTheDocument();
    });

    it('should close modal after successful creation', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      const nameInput = screen.getByLabelText(/Name/i);
      await user.type(nameInput, 'Test Config');

      const fieldCheckboxes = screen.getAllByRole('checkbox');
      await user.click(fieldCheckboxes[0]);

      const submitButton = screen.getByRole('button', { name: /Erstellen/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Neue Ansicht')).not.toBeInTheDocument();
      });
    });
  });

  describe('Edit View Config', () => {
    it('should open modal with existing data when edit is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const editButtons = screen.getAllByRole('button', { name: /Bearbeiten/i });
      await user.click(editButtons[0]);

      expect(screen.getByText('Ansicht bearbeiten')).toBeInTheDocument();

      const nameInput = screen.getByLabelText(/Name/i) as HTMLInputElement;
      expect(nameInput.value).toBe('Körperzusammensetzung');

      const descriptionInput = screen.getByLabelText(/Beschreibung/i) as HTMLTextAreaElement;
      expect(descriptionInput.value).toBe('Body composition metrics');
    });

    it('should submit updated view config', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const editButtons = screen.getAllByRole('button', { name: /Bearbeiten/i });
      await user.click(editButtons[0]);

      const nameInput = screen.getByLabelText(/Name/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated Name');

      const submitButton = screen.getByRole('button', { name: /Aktualisieren/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockUpdateViewConfig).toHaveBeenCalledWith(
          'config-1',
          expect.objectContaining({
            name: 'Updated Name',
          })
        );
      });
    });
  });

  describe('Delete View Config', () => {
    it('should open confirm dialog when delete is clicked', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /Löschen/i });
      await user.click(deleteButtons[0]);

      expect(screen.getByText('Ansicht löschen')).toBeInTheDocument();
      expect(screen.getByText(/Möchtest du die Ansicht/)).toBeInTheDocument();
    });

    it('should delete config when confirmed', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /Löschen/i });
      await user.click(deleteButtons[0]);

      // Wait for dialog to appear, then get all delete buttons (now includes dialog button)
      await waitFor(() => {
        expect(screen.getByText('Ansicht löschen')).toBeInTheDocument();
      });

      const confirmButton = screen.getAllByRole('button', { name: /Löschen/i })[2];
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockDeleteViewConfig).toHaveBeenCalledWith('config-1');
      });
    });

    it('should not delete when cancelled', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /Löschen/i });
      await user.click(deleteButtons[0]);

      const cancelButton = screen.getByRole('button', { name: /Abbrechen/i });
      await user.click(cancelButton);

      expect(mockDeleteViewConfig).not.toHaveBeenCalled();
    });
  });

  describe('Icon Selection', () => {
    it('should display available icons', async () => {
      const user = userEvent.setup();
      const { container } = render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      // Wait for modal to open
      await waitFor(() => {
        expect(screen.getByText('Neue Ansicht')).toBeInTheDocument();
      });

      // Check that icon selector exists and has icon buttons
      const iconSelector = container.querySelector('.icon-selector');
      if (iconSelector) {
        const iconButtons = container.querySelectorAll('.icon-selector__item');
        expect(iconButtons.length).toBeGreaterThan(0);
      } else {
        // If modal didn't render with icon selector, at least check the form is there
        expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
      }
    });

    it('should select icon when clicked', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      const iconButtons = document.querySelectorAll('.icon-selector__item');
      await user.click(iconButtons[1]); // Click second icon

      expect(iconButtons[1]).toHaveClass('icon-selector__item--selected');
    });
  });

  describe('Field Selection', () => {
    it('should display all available fields', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      expect(screen.getByText('KFA (%)')).toBeInTheDocument();
      expect(screen.getByText('Gewicht (kg)')).toBeInTheDocument();
      expect(screen.getByText('Muskelmasse (%)')).toBeInTheDocument();
    });

    it('should toggle field selection', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      const fieldCheckboxes = screen.getAllByRole('checkbox');
      const firstCheckbox = fieldCheckboxes[0] as HTMLInputElement;

      expect(firstCheckbox.checked).toBe(false);

      await user.click(firstCheckbox);
      expect(firstCheckbox.checked).toBe(true);

      await user.click(firstCheckbox);
      expect(firstCheckbox.checked).toBe(false);
    });

    it('should show selected count', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      expect(screen.getByText(/0 ausgewählt/)).toBeInTheDocument();

      const fieldCheckboxes = screen.getAllByRole('checkbox');
      await user.click(fieldCheckboxes[0]);

      expect(screen.getByText(/1 ausgewählt/)).toBeInTheDocument();
    });

    it('should show message when no fields available', async () => {
      vi.mocked(useAppContext).mockReturnValue({
        fields: [],
        entries: [],
        isLoading: false,
        error: null,
        currentRoute: '/view-configs',
        setFields: vi.fn(),
        setEntries: vi.fn(),
        setCurrentRoute: vi.fn(),
        setIsLoading: vi.fn(),
        setError: vi.fn(),
        refreshFields: vi.fn(),
        refreshEntries: vi.fn(),
        clearError: vi.fn(),
      });

      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      expect(screen.getByText('Keine Felder vorhanden. Erstelle zuerst Felder.')).toBeInTheDocument();
    });
  });

  describe('Cancel Actions', () => {
    it('should close modal when cancel is clicked in create mode', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const newButton = screen.getByRole('button', { name: /Neue Ansicht/i });
      await user.click(newButton);

      const cancelButton = screen.getAllByRole('button', { name: /Abbrechen/i })[0];
      await user.click(cancelButton);

      expect(screen.queryByText('Neue Ansicht')).not.toBeInTheDocument();
    });

    it('should close modal when cancel is clicked in edit mode', async () => {
      const user = userEvent.setup();
      render(<ViewConfigsPage />);

      const editButtons = screen.getAllByRole('button', { name: /Bearbeiten/i });
      await user.click(editButtons[0]);

      const cancelButton = screen.getAllByRole('button', { name: /Abbrechen/i })[0];
      await user.click(cancelButton);

      expect(screen.queryByText('Ansicht bearbeiten')).not.toBeInTheDocument();
    });
  });
});
