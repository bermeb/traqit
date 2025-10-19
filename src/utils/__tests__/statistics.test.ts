/**
 * Statistics Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  calculateFieldStatistics,
  calculateAllStatistics,
  formatStatValue,
  formatChangeValue,
} from '../statistics';
import { Entry, Field } from '../../types';

describe('Statistics Utilities', () => {
  const mockField: Field = {
    id: 'field-1',
    name: 'Gewicht',
    unit: 'kg',
    type: 'number',
    createdAt: new Date('2025-01-01'),
    order: 0,
  };

  const mockEntries: Entry[] = [
    {
      id: 'entry-1',
      date: new Date('2025-10-01'),
      values: { 'field-1': 75 },
      imageId: undefined,
      notes: '',
      createdAt: new Date('2025-10-01'),
      updatedAt: new Date('2025-10-01'),
    },
    {
      id: 'entry-2',
      date: new Date('2025-10-08'),
      values: { 'field-1': 74 },
      imageId: undefined,
      notes: '',
      createdAt: new Date('2025-10-08'),
      updatedAt: new Date('2025-10-08'),
    },
    {
      id: 'entry-3',
      date: new Date('2025-10-15'),
      values: { 'field-1': 73.5 },
      imageId: undefined,
      notes: '',
      createdAt: new Date('2025-10-15'),
      updatedAt: new Date('2025-10-15'),
    },
  ];

  describe('calculateFieldStatistics', () => {
    it('should calculate correct statistics', () => {
      const stats = calculateFieldStatistics(mockEntries, mockField);

      expect(stats).not.toBeNull();
      if (stats) {
        expect(stats.fieldId).toBe('field-1');
        expect(stats.fieldName).toBe('Gewicht');
        expect(stats.current).toBe(73.5);
        expect(stats.min).toBe(73.5);
        expect(stats.max).toBe(75);
        expect(stats.average).toBeCloseTo(74.17, 2);
        expect(stats.dataPoints).toBe(3);
      }
    });

    it('should handle missing values', () => {
      const entriesWithMissing: Entry[] = [
        { ...mockEntries[0], values: {} },
        mockEntries[1],
        mockEntries[2],
      ];

      const stats = calculateFieldStatistics(entriesWithMissing, mockField);
      expect(stats).not.toBeNull();
      if (stats) {
        expect(stats.dataPoints).toBe(2);
        expect(stats.min).toBe(73.5);
      }
    });

    it('should return null for no data', () => {
      const stats = calculateFieldStatistics([], mockField);

      // When there's no data, the function returns null
      expect(stats).toBeNull();
    });
  });

  describe('calculateAllStatistics', () => {
    const fields: Field[] = [
      mockField,
      {
        id: 'field-2',
        name: 'KFA',
        unit: '%',
        type: 'number',
        createdAt: new Date('2025-01-01'),
        order: 1,
      },
    ];

    const entries: Entry[] = [
      {
        ...mockEntries[0],
        values: { 'field-1': 75, 'field-2': 18 },
      },
      {
        ...mockEntries[1],
        values: { 'field-1': 74, 'field-2': 17.5 },
      },
    ];

    it('should calculate statistics for all fields', () => {
      const allStats = calculateAllStatistics(entries, fields);

      expect(allStats).toHaveLength(2);
      expect(allStats[0].fieldId).toBe('field-1');
      expect(allStats[1].fieldId).toBe('field-2');
    });

    it('should return empty array for no fields', () => {
      const allStats = calculateAllStatistics(entries, []);
      expect(allStats).toHaveLength(0);
    });
  });

  describe('formatStatValue', () => {
    it('should format value with unit', () => {
      expect(formatStatValue(75.5, 'kg')).toBe('75.5 kg');
    });

    it('should handle null values', () => {
      expect(formatStatValue(null, 'kg')).toBe('-');
    });

    it('should round to 1 decimal', () => {
      expect(formatStatValue(75.567, 'kg')).toBe('75.6 kg');
    });
  });

  describe('formatChangeValue', () => {
    it('should format positive change', () => {
      expect(formatChangeValue(2.5, 'kg')).toBe('+2.5 kg');
    });

    it('should format negative change', () => {
      expect(formatChangeValue(-2.5, 'kg')).toBe('-2.5 kg');
    });

    it('should handle null values', () => {
      expect(formatChangeValue(null, 'kg')).toBe('-');
    });

    it('should handle zero', () => {
      // Zero might be formatted as '0.0 kg' or '+0.0 kg' depending on implementation
      const result = formatChangeValue(0, 'kg');
      expect(result).toMatch(/[+]?0\.0 kg/);
    });
  });
});
