/**
 * FieldsPage Component Tests
 * Tests including cascade deletion for view configurations
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FieldsPage } from '../FieldsPage';
import { Field, ViewConfiguration } from '../../types';

// Mock the useFields hook
vi.mock('../../hooks', () => ({
  useFields: vi.fn(),
}));

// Mock the DB service
vi.mock('../../services/db', () => ({
  getViewConfigsUsingField: vi.fn(),
  updateViewConfig: vi.fn(),
}));

// Mock FieldList and FieldForm components
vi.mock('../../components/fields', () => ({
  FieldList: ({ fields, onEdit, onDelete }: { fields: Field[]; onEdit: (field: Field) => void; onDelete: (id: string) => void }) => (
    <div data-testid="field-list">
      {fields.map((field: Field) => (
        <div key={field.id} data-testid={`field-${field.id}`}>
          <span>{field.name}</span>
          <button onClick={() => onEdit(field)}>Bearbeiten</button>
          <button onClick={() => onDelete(field.id)}>Löschen</button>
        </div>
      ))}
    </div>
  ),
  FieldForm: ({ onSubmit, onCancel, submitText }: { onSubmit: (data: Record<string, unknown>) => void; onCancel: () => void; submitText: string }) => (
    <form data-testid="field-form" onSubmit={(e) => { e.preventDefault(); onSubmit({}); }}>
      <label htmlFor="name">Name</label>
      <input id="name" />
      <button type="button" onClick={onCancel}>Abbrechen</button>
      <button type="submit">{submitText}</button>
    </form>
  ),
}));

import { useFields } from '../../hooks';
import { getViewConfigsUsingField, updateViewConfig } from '../../services/db';

describe('FieldsPage Component', () => {
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
      description: 'Body composition',
      fieldIds: ['field-1', 'field-3'],
      icon: '🧬',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 0,
      isDefault: true,
    },
    {
      id: 'config-2',
      name: 'Gewichtstracking',
      fieldIds: ['field-2'],
      icon: '⚖️',
      createdAt: new Date(),
      updatedAt: new Date(),
      order: 1,
      isDefault: false,
    },
  ];

  const mockAddField = vi.fn();
  const mockUpdateField = vi.fn();
  const mockDeleteField = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useFields).mockReturnValue({
      fields: mockFields,
      addField: mockAddField.mockResolvedValue(undefined),
      updateField: mockUpdateField.mockResolvedValue(undefined),
      deleteField: mockDeleteField.mockResolvedValue(undefined),
      reorderFields: vi.fn(),
      loading: false,
      error: null,
    });

    vi.mocked(getViewConfigsUsingField).mockResolvedValue([]);
    vi.mocked(updateViewConfig).mockResolvedValue(undefined);
  });

  describe('Page Layout', () => {
    it('should render page title', () => {
      render(<FieldsPage />);
      expect(screen.getByText('Messfelder')).toBeInTheDocument();
    });

    it('should render new field button', () => {
      render(<FieldsPage />);
      expect(screen.getByRole('button', { name: /Neues Feld/i })).toBeInTheDocument();
    });

    it('should render field list', () => {
      render(<FieldsPage />);
      expect(screen.getByText('KFA')).toBeInTheDocument();
      expect(screen.getByText('Gewicht')).toBeInTheDocument();
      expect(screen.getByText('Muskelmasse')).toBeInTheDocument();
    });
  });

  describe('Delete Field - No Config Impact', () => {
    it('should show simple confirmation when field is not in any config', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([]);

      render(<FieldsPage />);

      // Assuming delete buttons exist in FieldList
      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      expect(
        screen.getByText(
          /Möchtest du dieses Feld wirklich löschen\? Alle zugehörigen Daten werden ebenfalls gelöscht\./
        )
      ).toBeInTheDocument();

      // Should not show warning about view configs
      expect(screen.queryByText(/wird in folgenden Ansichtskonfigurationen verwendet/)).not.toBeInTheDocument();
    });

    it('should delete field when confirmed', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([]);

      render(<FieldsPage />);

      // Click delete button from the field list
      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      // Get all Löschen buttons and click the one in the dialog (last one)
      const allDeleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(allDeleteButtons[allDeleteButtons.length - 1]);

      await waitFor(() => {
        expect(mockDeleteField).toHaveBeenCalledWith('field-1');
      });
    });

    it('should not delete field when cancelled', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Abbrechen/i });
      await user.click(cancelButton);

      expect(mockDeleteField).not.toHaveBeenCalled();
    });
  });

  describe('Delete Field - With Config Impact', () => {
    it('should show warning when field is used in view configs', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([mockViewConfigs[0]]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]); // Delete KFA which is in config-1

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      expect(
        screen.getByText(/Dieses Feld wird in folgenden Ansichtskonfigurationen verwendet/)
      ).toBeInTheDocument();
      expect(screen.getByText(/• Körperzusammensetzung/)).toBeInTheDocument();
      expect(
        screen.getByText(/Das Feld wird aus diesen Konfigurationen entfernt/)
      ).toBeInTheDocument();
    });

    it('should show multiple affected configs', async () => {
      const user = userEvent.setup();
      const multipleConfigs = [mockViewConfigs[0], mockViewConfigs[1]];
      vi.mocked(getViewConfigsUsingField).mockResolvedValue(multipleConfigs);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      expect(screen.getByText(/• Körperzusammensetzung/)).toBeInTheDocument();
      expect(screen.getByText(/• Gewichtstracking/)).toBeInTheDocument();
    });

    it('should remove field from all affected configs before deletion', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([mockViewConfigs[0]]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]); // Delete field-1 (KFA)

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      // Get all Löschen buttons and click the one in the dialog (last one)
      const allDeleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(allDeleteButtons[allDeleteButtons.length - 1]);

      await waitFor(() => {
        // Should update config to remove the field
        expect(updateViewConfig).toHaveBeenCalledWith('config-1', {
          fieldIds: ['field-3'], // field-1 removed, only field-3 remains
        });

        // Then delete the field
        expect(mockDeleteField).toHaveBeenCalledWith('field-1');
      });
    });

    it('should update multiple configs before deletion', async () => {
      const user = userEvent.setup();
      const multipleConfigs = [
        mockViewConfigs[0], // has field-1 and field-3
        mockViewConfigs[1], // has field-2
      ];
      vi.mocked(getViewConfigsUsingField).mockResolvedValue(multipleConfigs);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]); // Delete field-1

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      // Get all Löschen buttons and click the one in the dialog (last one)
      const allDeleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(allDeleteButtons[allDeleteButtons.length - 1]);

      await waitFor(() => {
        // Should update both configs
        expect(updateViewConfig).toHaveBeenCalledTimes(2);

        // Then delete the field
        expect(mockDeleteField).toHaveBeenCalledWith('field-1');
      });
    });

    it('should handle errors during cascade deletion', async () => {
      const user = userEvent.setup();
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      vi.mocked(getViewConfigsUsingField).mockResolvedValue([mockViewConfigs[0]]);
      vi.mocked(updateViewConfig).mockRejectedValue(new Error('Update failed'));

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      // Get all Löschen buttons and click the one in the dialog (last one)
      const allDeleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(allDeleteButtons[allDeleteButtons.length - 1]);

      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Error deleting field:',
          expect.any(Error)
        );
      });

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Field Deletion State Management', () => {
    it('should reset state after successful deletion', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([mockViewConfigs[0]]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      // Get all Löschen buttons and click the one in the dialog (last one)
      const allDeleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(allDeleteButtons[allDeleteButtons.length - 1]);

      await waitFor(() => {
        // Dialog should close
        expect(screen.queryByText('Feld löschen')).not.toBeInTheDocument();
      });
    });

    it('should reset state when cancel is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([mockViewConfigs[0]]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /Abbrechen/i });
      await user.click(cancelButton);

      // Dialog should close
      expect(screen.queryByText('Feld löschen')).not.toBeInTheDocument();
    });
  });

  describe('Create and Edit Field', () => {
    it('should open modal when new field button is clicked', async () => {
      const user = userEvent.setup();
      render(<FieldsPage />);

      const newButton = screen.getByRole('button', { name: /Neues Feld/i });
      await user.click(newButton);

      expect(screen.getByText('Neues Feld')).toBeInTheDocument();
    });

    it('should open modal with field data when edit is clicked', async () => {
      const user = userEvent.setup();
      render(<FieldsPage />);

      // Assuming edit buttons exist in FieldList
      const editButtons = screen.getAllByRole('button', { name: /bearbeiten/i });
      await user.click(editButtons[0]);

      expect(screen.getByText('Feld bearbeiten')).toBeInTheDocument();
    });

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      render(<FieldsPage />);

      const newButton = screen.getByRole('button', { name: /Neues Feld/i });
      await user.click(newButton);

      const cancelButton = screen.getByRole('button', { name: /Abbrechen/i });
      await user.click(cancelButton);

      expect(screen.queryByText('Neues Feld')).not.toBeInTheDocument();
    });
  });

  describe('Config Lookup', () => {
    it('should call getViewConfigsUsingField with correct field id', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]); // Delete first field (field-1)

      await waitFor(() => {
        expect(getViewConfigsUsingField).toHaveBeenCalledWith('field-1');
      });
    });

    it('should handle empty config list', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      // Should show simple message without config warning
      expect(
        screen.queryByText(/wird in folgenden Ansichtskonfigurationen verwendet/)
      ).not.toBeInTheDocument();
    });
  });

  describe('Deletion Order', () => {
    it('should update configs before deleting field', async () => {
      const user = userEvent.setup();
      const callOrder: string[] = [];

      vi.mocked(getViewConfigsUsingField).mockResolvedValue([mockViewConfigs[0]]);
      vi.mocked(updateViewConfig).mockImplementation(async () => {
        callOrder.push('updateViewConfig');
      });
      vi.mocked(mockDeleteField).mockImplementation(async () => {
        callOrder.push('deleteField');
      });

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText('Feld löschen')).toBeInTheDocument();
      });

      // Get all Löschen buttons and click the one in the dialog (last one)
      const allDeleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(allDeleteButtons[allDeleteButtons.length - 1]);

      await waitFor(() => {
        expect(callOrder).toEqual(['updateViewConfig', 'deleteField']);
      });
    });
  });

  describe('Warning Message Format', () => {
    it('should include warning emoji in message', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([mockViewConfigs[0]]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/⚠️/)).toBeInTheDocument();
      });
    });

    it('should list config names with bullet points', async () => {
      const user = userEvent.setup();
      vi.mocked(getViewConfigsUsingField).mockResolvedValue([
        mockViewConfigs[0],
        mockViewConfigs[1],
      ]);

      render(<FieldsPage />);

      const deleteButtons = screen.getAllByRole('button', { name: /löschen/i });
      await user.click(deleteButtons[0]);

      await waitFor(() => {
        expect(screen.getByText(/• Körperzusammensetzung/)).toBeInTheDocument();
        expect(screen.getByText(/• Gewichtstracking/)).toBeInTheDocument();
      });
    });
  });
});
