/**
 * Mock Data Helpers
 * Helper functions to create mock data for tests
 */

import { Field, Entry } from '../../types';

/**
 * Create a mock field with default values
 */
export function createMockField(overrides: Partial<Field> = {}): Field {
  return {
    id: 'field-1',
    name: 'Test Field',
    unit: 'kg',
    type: 'number',
    createdAt: new Date('2024-01-01'),
    order: 0,
    goalDirection: 'increase',
    ...overrides,
  };
}

/**
 * Create multiple mock fields
 */
export function createMockFields(count: number, baseOverrides: Partial<Field> = {}): Field[] {
  return Array.from({ length: count }, (_, index) =>
    createMockField({
      id: `field-${index + 1}`,
      name: `Field ${index + 1}`,
      order: index,
      ...baseOverrides,
    })
  );
}

/**
 * Create a mock entry with default values
 */
export function createMockEntry(overrides: Partial<Entry> = {}): Entry {
  return {
    id: 'entry-1',
    date: new Date('2024-01-01'),
    values: {},
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  };
}

/**
 * Create multiple mock entries
 */
export function createMockEntries(count: number, baseOverrides: Partial<Entry> = {}): Entry[] {
  return Array.from({ length: count }, (_, index) =>
    createMockEntry({
      id: `entry-${index + 1}`,
      date: new Date(`2024-01-${String(index + 1).padStart(2, '0')}`),
      ...baseOverrides,
    })
  );
}
