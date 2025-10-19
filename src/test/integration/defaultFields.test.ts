/**
 * Default Fields Integration Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { initializeDefaultFields } from '../../utils/initializeDefaultFields';
import { DEFAULT_FIELDS } from '../../utils';

// Mock the DB service
vi.mock('../../services/db', () => ({
  addField: vi.fn().mockResolvedValue(undefined),
  getFields: vi.fn().mockResolvedValue([]),
}));

import { getFields, addField } from '../../services/db';

describe('Default Fields Initialization', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('should create default fields on first run', async () => {
    const result = await initializeDefaultFields();

    expect(result).toBe(true);
    expect(addField).toHaveBeenCalledTimes(DEFAULT_FIELDS.length);
    expect(localStorage.getItem('traqit-initial-fields-created')).toBe('true');
  });

  it('should not create fields if already initialized', async () => {
    localStorage.setItem('traqit-initial-fields-created', 'true');

    const result = await initializeDefaultFields();

    expect(result).toBe(false);
    expect(addField).not.toHaveBeenCalled();
  });

  it('should create default fields even if other fields exist', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
      {
        id: 'existing-field',
        name: 'Existing Custom Field',
        unit: 'kg',
        type: 'number',
        createdAt: new Date(),
        order: 0,
      },
    ]);

    const result = await initializeDefaultFields();

    expect(result).toBe(true);
    expect(addField).toHaveBeenCalledTimes(DEFAULT_FIELDS.length);
    expect(localStorage.getItem('traqit-initial-fields-created')).toBe('true');
  });

  it('should not create duplicate fields if they already exist', async () => {
    vi.mocked(getFields).mockResolvedValueOnce([
      {
        id: 'existing-field',
        name: 'KFA',
        unit: '%',
        type: 'number',
        createdAt: new Date(),
        order: 0,
      },
      {
        id: 'existing-field-2',
        name: 'Gewicht',
        unit: 'kg',
        type: 'number',
        createdAt: new Date(),
        order: 1,
      },
    ]);

    const result = await initializeDefaultFields();

    expect(result).toBe(true);
    // Should only create 8 fields (10 total - 2 already existing)
    expect(addField).toHaveBeenCalledTimes(8);
    expect(localStorage.getItem('traqit-initial-fields-created')).toBe('true');
  });

  it('should create all 10 default fields', async () => {
    await initializeDefaultFields();

    expect(addField).toHaveBeenCalledTimes(10);

    // Verify the field names
    const fieldNames = DEFAULT_FIELDS.map((f) => f.name);
    expect(fieldNames).toContain('KFA');
    expect(fieldNames).toContain('Knochenmasse');
    expect(fieldNames).toContain('Muskelmasse');
    expect(fieldNames).toContain('Wasseranteil');
    expect(fieldNames).toContain('Gewicht');
    expect(fieldNames).toContain('Bauch');
    expect(fieldNames).toContain('Taille');
    expect(fieldNames).toContain('Nacken');
    expect(fieldNames).toContain('Brustumfang');
    expect(fieldNames).toContain('Bizepsumfang');
  });

  it('should create fields with correct properties', async () => {
    await initializeDefaultFields();

    const calls = vi.mocked(addField).mock.calls;

    calls.forEach((call) => {
      const field = call[0];

      expect(field).toHaveProperty('id');
      expect(field).toHaveProperty('name');
      expect(field).toHaveProperty('unit');
      expect(field).toHaveProperty('type', 'number');
      expect(field).toHaveProperty('createdAt');
      expect(field).toHaveProperty('order');

      expect(field.id).toBeTruthy();
      expect(field.name).toBeTruthy();
      expect(field.unit).toBeTruthy();
      expect(typeof field.order).toBe('number');
    });
  });
});
