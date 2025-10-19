/**
 * Initialize View Configurations Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeViewConfigs } from '../../utils/initializeViewConfigs';
import { STORAGE_KEYS } from '../../utils';

// Mock the DB service
vi.mock('../../services/db', () => ({
  addViewConfig: vi.fn().mockResolvedValue(undefined),
  getViewConfigs: vi.fn().mockResolvedValue([]),
  getFields: vi.fn().mockResolvedValue([]),
}));

import { getFields, addViewConfig, getViewConfigs } from '../../services/db';

describe('Initialize View Configurations', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create default view config on first run', async () => {
    // Mock fields that match the default body composition fields
    vi.mocked(getFields).mockResolvedValueOnce([
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
        name: 'Knochenmasse',
        unit: '%',
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
      {
        id: 'field-4',
        name: 'Wasseranteil',
        unit: '%',
        type: 'number',
        createdAt: new Date(),
        order: 3,
      },
      {
        id: 'field-5',
        name: 'Gewicht',
        unit: 'kg',
        type: 'number',
        createdAt: new Date(),
        order: 4,
      },
    ]);

    const result = await initializeViewConfigs();

    expect(result).toBe(true);
    expect(addViewConfig).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem(STORAGE_KEYS.VIEW_CONFIGS_CREATED)).toBe('true');

    // Check the config that was created
    const calls = vi.mocked(addViewConfig).mock.calls;
    const createdConfig = calls[0][0];
    expect(createdConfig.name).toBe('Körperzusammensetzung');
    expect(createdConfig.description).toBe('Übersicht über Körperfett, Muskeln und Gewicht');
    expect(createdConfig.icon).toBe('🧬');
    expect(createdConfig.isDefault).toBe(true);
    expect(createdConfig.fieldIds).toHaveLength(5);
  });

  it('should not create configs if already initialized', async () => {
    localStorage.setItem(STORAGE_KEYS.VIEW_CONFIGS_CREATED, 'true');

    const result = await initializeViewConfigs();

    expect(result).toBe(false);
    expect(addViewConfig).not.toHaveBeenCalled();
    expect(getFields).not.toHaveBeenCalled();
  });

  it('should handle case-insensitive field name matching', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
      {
        id: 'field-1',
        name: 'kfa', // lowercase
        unit: '%',
        type: 'number',
        createdAt: new Date(),
        order: 0,
      },
      {
        id: 'field-2',
        name: 'GEWICHT', // uppercase
        unit: 'kg',
        type: 'number',
        createdAt: new Date(),
        order: 1,
      },
    ]);

    const result = await initializeViewConfigs();

    expect(result).toBe(true);
    expect(addViewConfig).toHaveBeenCalledTimes(1);

    const calls = vi.mocked(addViewConfig).mock.calls;
    const createdConfig = calls[0][0];
    expect(createdConfig.fieldIds).toHaveLength(2);
    expect(createdConfig.fieldIds).toContain('field-1');
    expect(createdConfig.fieldIds).toContain('field-2');
  });

  it('should create config with only matching fields', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
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
        name: 'Custom Field',
        unit: 'cm',
        type: 'number',
        createdAt: new Date(),
        order: 2,
      },
    ]);

    const result = await initializeViewConfigs();

    expect(result).toBe(true);

    const calls = vi.mocked(addViewConfig).mock.calls;
    const createdConfig = calls[0][0];
    expect(createdConfig.fieldIds).toHaveLength(2);
    expect(createdConfig.fieldIds).toContain('field-1'); // KFA
    expect(createdConfig.fieldIds).toContain('field-2'); // Gewicht
    expect(createdConfig.fieldIds).not.toContain('field-3'); // Custom Field
  });

  it('should not create config if no matching fields exist', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
      {
        id: 'field-1',
        name: 'Custom Field 1',
        unit: 'cm',
        type: 'number',
        createdAt: new Date(),
        order: 0,
      },
      {
        id: 'field-2',
        name: 'Custom Field 2',
        unit: 'kg',
        type: 'number',
        createdAt: new Date(),
        order: 1,
      },
    ]);

    const result = await initializeViewConfigs();

    expect(result).toBe(true);
    expect(addViewConfig).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEYS.VIEW_CONFIGS_CREATED)).toBe('true');
  });

  it('should set correct order based on existing configs', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
      {
        id: 'field-1',
        name: 'KFA',
        unit: '%',
        type: 'number',
        createdAt: new Date(),
        order: 0,
      },
    ]);

    vi.mocked(getViewConfigs).mockResolvedValueOnce([
      {
        id: 'existing-1',
        name: 'Existing Config 1',
        fieldIds: ['field-x'],
        icon: '📊',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 0,
        isDefault: false,
      },
      {
        id: 'existing-2',
        name: 'Existing Config 2',
        fieldIds: ['field-y'],
        icon: '🎯',
        createdAt: new Date(),
        updatedAt: new Date(),
        order: 1,
        isDefault: false,
      },
    ]);

    await initializeViewConfigs();

    const calls = vi.mocked(addViewConfig).mock.calls;
    const createdConfig = calls[0][0];
    expect(createdConfig.order).toBe(2); // Should be after existing configs
  });

  it('should create config with proper properties', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
      {
        id: 'field-1',
        name: 'KFA',
        unit: '%',
        type: 'number',
        createdAt: new Date(),
        order: 0,
      },
    ]);

    await initializeViewConfigs();

    const calls = vi.mocked(addViewConfig).mock.calls;
    const createdConfig = calls[0][0];

    expect(createdConfig).toHaveProperty('id');
    expect(createdConfig).toHaveProperty('name');
    expect(createdConfig).toHaveProperty('description');
    expect(createdConfig).toHaveProperty('fieldIds');
    expect(createdConfig).toHaveProperty('icon');
    expect(createdConfig).toHaveProperty('createdAt');
    expect(createdConfig).toHaveProperty('updatedAt');
    expect(createdConfig).toHaveProperty('order');
    expect(createdConfig).toHaveProperty('isDefault');

    expect(createdConfig.id).toBeTruthy();
    expect(typeof createdConfig.name).toBe('string');
    expect(typeof createdConfig.order).toBe('number');
    expect(createdConfig.createdAt).toBeInstanceOf(Date);
    expect(createdConfig.updatedAt).toBeInstanceOf(Date);
  });

  it('should handle error and remove flag on failure', async () => {
    vi.mocked(getFields).mockRejectedValueOnce(new Error('Database error'));

    const result = await initializeViewConfigs();

    expect(result).toBe(false);
    expect(localStorage.getItem(STORAGE_KEYS.VIEW_CONFIGS_CREATED)).toBeNull();
  });

  it('should find all 5 body composition fields when they exist', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
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
        name: 'Knochenmasse',
        unit: '%',
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
      {
        id: 'field-4',
        name: 'Wasseranteil',
        unit: '%',
        type: 'number',
        createdAt: new Date(),
        order: 3,
      },
      {
        id: 'field-5',
        name: 'Gewicht',
        unit: 'kg',
        type: 'number',
        createdAt: new Date(),
        order: 4,
      },
      {
        id: 'field-6',
        name: 'Other Field',
        unit: 'cm',
        type: 'number',
        createdAt: new Date(),
        order: 5,
      },
    ]);

    await initializeViewConfigs();

    const calls = vi.mocked(addViewConfig).mock.calls;
    const createdConfig = calls[0][0];

    expect(createdConfig.fieldIds).toHaveLength(5);
    expect(createdConfig.fieldIds).toContain('field-1'); // KFA
    expect(createdConfig.fieldIds).toContain('field-2'); // Knochenmasse
    expect(createdConfig.fieldIds).toContain('field-3'); // Muskelmasse
    expect(createdConfig.fieldIds).toContain('field-4'); // Wasseranteil
    expect(createdConfig.fieldIds).toContain('field-5'); // Gewicht
    expect(createdConfig.fieldIds).not.toContain('field-6'); // Other Field
  });

  it('should use crypto.randomUUID() for id generation', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
      {
        id: 'field-1',
        name: 'KFA',
        unit: '%',
        type: 'number',
        createdAt: new Date(),
        order: 0,
      },
    ]);

    await initializeViewConfigs();

    const calls = vi.mocked(addViewConfig).mock.calls;
    const createdConfig = calls[0][0];

    // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(createdConfig.id).toMatch(uuidRegex);
  });

  it('should handle empty fields array', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([]);

    const result = await initializeViewConfigs();

    expect(result).toBe(true);
    expect(addViewConfig).not.toHaveBeenCalled();
    expect(localStorage.getItem(STORAGE_KEYS.VIEW_CONFIGS_CREATED)).toBe('true');
  });
});
