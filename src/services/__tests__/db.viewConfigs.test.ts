/**
 * View Configuration Database Operations Tests
 * Unit tests with mocked IndexedDB
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ViewConfiguration } from '../../types';

// Mock idb before importing db module
const mockDB = {
  add: vi.fn(),
  getAllFromIndex: vi.fn(),
  getAll: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  transaction: vi.fn(() => ({
    store: {
      clear: vi.fn(),
    },
    done: Promise.resolve(),
  })),
};

vi.mock('idb', () => ({
  openDB: vi.fn(() => Promise.resolve(mockDB)),
}));

// Import after mocking
import * as db from '../db';

describe('View Configuration Database Operations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addViewConfig', () => {
    it('should add a view configuration to the database', async () => {
      const config: ViewConfiguration = {
        id: 'config-1',
        name: 'Test Config',
        fieldIds: ['field-1', 'field-2'],
        icon: '📊',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0,
        isDefault: false,
      };

      await db.addViewConfig(config);

      expect(mockDB.add).toHaveBeenCalledWith('viewConfigs', config);
    });
  });

  describe('getViewConfigs', () => {
    it('should retrieve all view configurations', async () => {
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

      mockDB.getAllFromIndex.mockResolvedValue(mockConfigs);

      const result = await db.getViewConfigs();

      expect(mockDB.getAllFromIndex).toHaveBeenCalledWith('viewConfigs', 'by-order');
      expect(result).toEqual(mockConfigs);
    });
  });

  describe('getViewConfig', () => {
    it('should retrieve a specific view configuration', async () => {
      const mockConfig: ViewConfiguration = {
        id: 'config-1',
        name: 'Test Config',
        fieldIds: ['field-1'],
        icon: '📊',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0,
        isDefault: false,
      };

      mockDB.get.mockResolvedValue(mockConfig);

      const result = await db.getViewConfig('config-1');

      expect(mockDB.get).toHaveBeenCalledWith('viewConfigs', 'config-1');
      expect(result).toEqual(mockConfig);
    });
  });

  describe('updateViewConfig', () => {
    it('should update a view configuration', async () => {
      const existingConfig: ViewConfiguration = {
        id: 'config-1',
        name: 'Original Name',
        fieldIds: ['field-1'],
        icon: '📊',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        order: 0,
        isDefault: false,
      };

      mockDB.get.mockResolvedValue(existingConfig);

      await db.updateViewConfig('config-1', { name: 'Updated Name' });

      expect(mockDB.get).toHaveBeenCalledWith('viewConfigs', 'config-1');
      expect(mockDB.put).toHaveBeenCalledWith(
        'viewConfigs',
        expect.objectContaining({
          id: 'config-1',
          name: 'Updated Name',
          fieldIds: ['field-1'],
        })
      );
    });

    it('should update updatedAt timestamp', async () => {
      const existingConfig: ViewConfiguration = {
        id: 'config-1',
        name: 'Test',
        fieldIds: ['field-1'],
        icon: '📊',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        order: 0,
        isDefault: false,
      };

      mockDB.get.mockResolvedValue(existingConfig);

      await db.updateViewConfig('config-1', { name: 'Updated' });

      const putCall = mockDB.put.mock.calls[0][1];
      expect(putCall.updatedAt).toBeInstanceOf(Date);
      expect(putCall.updatedAt.getTime()).toBeGreaterThan(existingConfig.updatedAt.getTime());
    });

    it('should throw error when config does not exist', async () => {
      mockDB.get.mockResolvedValue(undefined);

      await expect(db.updateViewConfig('non-existent', { name: 'Test' })).rejects.toThrow(
        'View configuration with id non-existent not found'
      );
    });
  });

  describe('deleteViewConfig', () => {
    it('should delete a view configuration', async () => {
      await db.deleteViewConfig('config-1');

      expect(mockDB.delete).toHaveBeenCalledWith('viewConfigs', 'config-1');
    });
  });

  describe('getViewConfigsUsingField', () => {
    it('should return configs that use the specified field', async () => {
      const mockConfigs: ViewConfiguration[] = [
        {
          id: 'config-1',
          name: 'Config 1',
          fieldIds: ['field-1', 'field-2'],
          icon: '📊',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 0,
          isDefault: false,
        },
        {
          id: 'config-2',
          name: 'Config 2',
          fieldIds: ['field-2', 'field-3'],
          icon: '🎯',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 1,
          isDefault: false,
        },
        {
          id: 'config-3',
          name: 'Config 3',
          fieldIds: ['field-4'],
          icon: '🔥',
          createdAt: new Date(),
          updatedAt: new Date(),
          order: 2,
          isDefault: false,
        },
      ];

      mockDB.getAll.mockResolvedValue(mockConfigs);

      const result = await db.getViewConfigsUsingField('field-2');

      expect(mockDB.getAll).toHaveBeenCalledWith('viewConfigs');
      expect(result).toHaveLength(2);
      expect(result.map((c) => c.id)).toEqual(['config-1', 'config-2']);
    });

    it('should return empty array when no configs use the field', async () => {
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

      mockDB.getAll.mockResolvedValue(mockConfigs);

      const result = await db.getViewConfigsUsingField('field-2');

      expect(result).toHaveLength(0);
    });
  });
});
