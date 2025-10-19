/**
 * useViewConfigs Hook Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useViewConfigs } from '../useViewConfigs';
import { ViewConfiguration } from '../../types';

// Mock the DB service
vi.mock('../../services/db', () => ({
  getViewConfigs: vi.fn(),
  addViewConfig: vi.fn(),
  updateViewConfig: vi.fn(),
  deleteViewConfig: vi.fn(),
}));

import * as db from '../../services/db';

describe('useViewConfigs Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('should load view configs on mount', async () => {
      const mockConfigs: ViewConfiguration[] = [
        {
          id: 'config-1',
          name: 'Test Config',
          fieldIds: ['field-1'],
          icon: '📊',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          isDefault: false,
        },
      ];

      vi.mocked(db.getViewConfigs).mockResolvedValue(mockConfigs);

      const { result } = renderHook(() => useViewConfigs());

      // Initially loading
      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.viewConfigs).toEqual(mockConfigs);
      expect(result.current.error).toBeNull();
      expect(db.getViewConfigs).toHaveBeenCalledTimes(1);
    });

    it('should handle empty configs list', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.viewConfigs).toEqual([]);
      expect(result.current.error).toBeNull();
    });

    it('should handle load error', async () => {
      vi.mocked(db.getViewConfigs).mockRejectedValue(new Error('Load failed'));

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Load failed');
      expect(result.current.viewConfigs).toEqual([]);
    });

    it('should handle non-Error exceptions', async () => {
      vi.mocked(db.getViewConfigs).mockRejectedValue('String error');

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Fehler beim Laden');
    });
  });

  describe('addViewConfig', () => {
    it('should add a new view config', async () => {
      const mockConfigs: ViewConfiguration[] = [
        {
          id: 'config-1',
          name: 'Existing Config',
          fieldIds: ['field-1'],
          icon: '📊',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          isDefault: false,
        },
      ];

      vi.mocked(db.getViewConfigs).mockResolvedValue(mockConfigs);
      vi.mocked(db.addViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock the second call after adding
      vi.mocked(db.getViewConfigs).mockResolvedValue([
        ...mockConfigs,
        {
          id: 'config-2',
          name: 'New Config',
          fieldIds: ['field-2', 'field-3'],
          icon: '🎯',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 1,
          isDefault: false,
        },
      ]);

      await result.current.addViewConfig({
        name: 'New Config',
        fieldIds: ['field-2', 'field-3'],
        icon: '🎯',
      });

      await waitFor(() => {
        expect(result.current.viewConfigs).toHaveLength(2);
      });

      expect(db.addViewConfig).toHaveBeenCalledTimes(1);
      const addedConfig = vi.mocked(db.addViewConfig).mock.calls[0][0];
      expect(addedConfig.name).toBe('New Config');
      expect(addedConfig.fieldIds).toEqual(['field-2', 'field-3']);
      expect(addedConfig.icon).toBe('🎯');
    });

    it('should trim name and description', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.addViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.addViewConfig({
        name: '  Test Config  ',
        description: '  Test Description  ',
        fieldIds: ['field-1'],
      });

      const addedConfig = vi.mocked(db.addViewConfig).mock.calls[0][0];
      expect(addedConfig.name).toBe('Test Config');
      expect(addedConfig.description).toBe('Test Description');
    });

    it('should use default icon if not provided', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.addViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.addViewConfig({
        name: 'Test Config',
        fieldIds: ['field-1'],
      });

      const addedConfig = vi.mocked(db.addViewConfig).mock.calls[0][0];
      expect(addedConfig.icon).toBe('📊');
    });

    it('should set isDefault to false for new configs', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.addViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.addViewConfig({
        name: 'Test Config',
        fieldIds: ['field-1'],
      });

      const addedConfig = vi.mocked(db.addViewConfig).mock.calls[0][0];
      expect(addedConfig.isDefault).toBe(false);
    });

    it('should set correct order based on existing configs', async () => {
      const mockConfigs: ViewConfiguration[] = [
        {
          id: 'config-1',
          name: 'Config 1',
          fieldIds: ['field-1'],
          icon: '📊',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          isDefault: false,
        },
        {
          id: 'config-2',
          name: 'Config 2',
          fieldIds: ['field-2'],
          icon: '🎯',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 1,
          isDefault: false,
        },
      ];

      vi.mocked(db.getViewConfigs).mockResolvedValue(mockConfigs);
      vi.mocked(db.addViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.addViewConfig({
        name: 'Test Config',
        fieldIds: ['field-1'],
      });

      const addedConfig = vi.mocked(db.addViewConfig).mock.calls[0][0];
      expect(addedConfig.order).toBe(2); // Should be after existing 2 configs
    });

    it('should handle add error', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.addViewConfig).mockRejectedValue(new Error('Add failed'));

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.addViewConfig({
          name: 'Test Config',
          fieldIds: ['field-1'],
        })
      ).rejects.toThrow('Add failed');

      await waitFor(() => {
        expect(result.current.error).toBe('Add failed');
      });
    });

    it('should generate unique IDs', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.addViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.addViewConfig({
        name: 'Config 1',
        fieldIds: ['field-1'],
      });

      await result.current.addViewConfig({
        name: 'Config 2',
        fieldIds: ['field-2'],
      });

      const call1 = vi.mocked(db.addViewConfig).mock.calls[0][0];
      const call2 = vi.mocked(db.addViewConfig).mock.calls[1][0];

      expect(call1.id).toBeTruthy();
      expect(call2.id).toBeTruthy();
      expect(call1.id).not.toBe(call2.id);
    });
  });

  describe('updateViewConfig', () => {
    it('should update a view config', async () => {
      const mockConfigs: ViewConfiguration[] = [
        {
          id: 'config-1',
          name: 'Original Name',
          fieldIds: ['field-1'],
          icon: '📊',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          isDefault: false,
        },
      ];

      vi.mocked(db.getViewConfigs).mockResolvedValue(mockConfigs);
      vi.mocked(db.updateViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.updateViewConfig('config-1', {
        name: 'Updated Name',
      });

      expect(db.updateViewConfig).toHaveBeenCalledWith('config-1', {
        name: 'Updated Name',
      });
    });

    it('should reload configs after update', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.updateViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      vi.clearAllMocks();

      await result.current.updateViewConfig('config-1', {
        name: 'Updated',
      });

      await waitFor(() => {
        expect(db.getViewConfigs).toHaveBeenCalled();
      });
    });

    it('should handle update error', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.updateViewConfig).mockRejectedValue(new Error('Update failed'));

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(
        result.current.updateViewConfig('config-1', { name: 'Updated' })
      ).rejects.toThrow('Update failed');

      await waitFor(() => {
        expect(result.current.error).toBe('Update failed');
      });
    });
  });

  describe('deleteViewConfig', () => {
    it('should delete a view config', async () => {
      const mockConfigs: ViewConfiguration[] = [
        {
          id: 'config-1',
          name: 'Config 1',
          fieldIds: ['field-1'],
          icon: '📊',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          isDefault: false,
        },
      ];

      vi.mocked(db.getViewConfigs).mockResolvedValue(mockConfigs);
      vi.mocked(db.deleteViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await result.current.deleteViewConfig('config-1');

      expect(db.deleteViewConfig).toHaveBeenCalledWith('config-1');
    });

    it('should reload configs after delete', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.deleteViewConfig).mockResolvedValue(undefined);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      vi.clearAllMocks();

      await result.current.deleteViewConfig('config-1');

      await waitFor(() => {
        expect(db.getViewConfigs).toHaveBeenCalled();
      });
    });

    it('should handle delete error', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.deleteViewConfig).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      await expect(result.current.deleteViewConfig('config-1')).rejects.toThrow('Delete failed');

      await waitFor(() => {
        expect(result.current.error).toBe('Delete failed');
      });
    });
  });

  describe('refreshViewConfigs', () => {
    it('should manually reload view configs', async () => {
      vi.mocked(db.getViewConfigs).mockResolvedValue([]);

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      vi.clearAllMocks();

      await result.current.refreshViewConfigs();

      expect(db.getViewConfigs).toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should set loading to true during operations', async () => {
      vi.mocked(db.getViewConfigs).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve([]), 100))
      );

      const { result } = renderHook(() => useViewConfigs());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe('Error State', () => {
    it('should clear error on successful operation', async () => {
      vi.mocked(db.getViewConfigs).mockRejectedValueOnce(new Error('Initial error'));

      const { result } = renderHook(() => useViewConfigs());

      await waitFor(() => {
        expect(result.current.error).toBe('Initial error');
      });

      vi.mocked(db.getViewConfigs).mockResolvedValue([]);
      vi.mocked(db.addViewConfig).mockResolvedValue(undefined);

      await result.current.addViewConfig({
        name: 'Test',
        fieldIds: ['field-1'],
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });
});
