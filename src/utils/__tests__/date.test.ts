/**
 * Date Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  formatDate,
  formatDateTime,
  dateToInputValue,
  parseDate,
  getDateRangePresets,
  isSameDay,
  getStartOfDay,
  getEndOfDay,
  inputValueToDate,
} from '../date';

describe('Date Utilities', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2025-10-18T12:00:00');
      const formatted = formatDate(date);
      expect(formatted).toBe('18.10.2025');
    });

    it('should handle Date objects', () => {
      const date = new Date(2025, 9, 18); // Month is 0-indexed
      const formatted = formatDate(date);
      expect(formatted).toBe('18.10.2025');
    });

    it('should handle string dates', () => {
      const formatted = formatDate('2025-10-18');
      expect(formatted).toBe('18.10.2025');
    });

    it('should handle invalid dates', () => {
      const formatted = formatDate('invalid');
      expect(formatted).toBe('Ungültiges Datum');
    });
  });

  describe('formatDateTime', () => {
    it('should format datetime with time', () => {
      const date = new Date('2025-10-18T14:30:00');
      const formatted = formatDateTime(date);
      expect(formatted).toBe('18.10.2025 14:30');
    });
  });

  describe('dateToInputValue', () => {
    it('should convert date to input value format', () => {
      const date = new Date('2025-10-18');
      const value = dateToInputValue(date);
      expect(value).toBe('2025-10-18');
    });

    it('should handle single digit days and months', () => {
      const date = new Date('2025-01-05');
      const value = dateToInputValue(date);
      expect(value).toBe('2025-01-05');
    });
  });

  describe('parseDate', () => {
    it('should parse valid date string', () => {
      const date = parseDate('2025-10-18');
      expect(date).toBeInstanceOf(Date);
      expect(date?.getDate()).toBe(18);
      expect(date?.getMonth()).toBe(9); // October (0-indexed)
      expect(date?.getFullYear()).toBe(2025);
    });

    it('should return null for invalid date string', () => {
      const date = parseDate('invalid');
      expect(date).toBeNull();
    });
  });

  describe('inputValueToDate', () => {
    it('should convert input value to date', () => {
      const date = inputValueToDate('2025-10-18');
      expect(date).toBeInstanceOf(Date);
      expect(date.getDate()).toBe(18);
    });
  });

  describe('isSameDay', () => {
    it('should return true for same day', () => {
      const date1 = new Date('2025-10-18T10:00:00');
      const date2 = new Date('2025-10-18T15:00:00');
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it('should return false for different days', () => {
      const date1 = new Date('2025-10-18');
      const date2 = new Date('2025-10-19');
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });

  describe('getStartOfDay', () => {
    it('should return start of day', () => {
      const date = new Date('2025-10-18T14:30:45');
      const start = getStartOfDay(date);
      expect(start.getHours()).toBe(0);
      expect(start.getMinutes()).toBe(0);
      expect(start.getSeconds()).toBe(0);
    });
  });

  describe('getEndOfDay', () => {
    it('should return end of day', () => {
      const date = new Date('2025-10-18T14:30:45');
      const end = getEndOfDay(date);
      expect(end.getHours()).toBe(23);
      expect(end.getMinutes()).toBe(59);
      expect(end.getSeconds()).toBe(59);
    });
  });

  describe('getDateRangePresets', () => {
    it('should return all presets', () => {
      const presets = getDateRangePresets();
      expect(presets).toHaveProperty('last7Days');
      expect(presets).toHaveProperty('last30Days');
      expect(presets).toHaveProperty('last3Months');
      expect(presets).toHaveProperty('last6Months');
      expect(presets).toHaveProperty('last12Months');
    });

    it('should have correct date ranges', () => {
      const presets = getDateRangePresets();

      // Check that end date is approximately today
      const now = new Date();
      const last7Days = presets.last7Days;

      expect(last7Days.end.getDate()).toBe(now.getDate());
      expect(last7Days.start).toBeInstanceOf(Date);
      expect(last7Days.end).toBeInstanceOf(Date);
      expect(last7Days.start.getTime()).toBeLessThan(last7Days.end.getTime());
    });
  });
});
