/**
 * Formatters Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  formatFileSize,
  formatValue,
  formatNumber,
  parseLocalizedNumber,
  truncateText,
  escapeCsvValue,
  sanitizeFilename,
  formatPercentage,
} from '../formatters';

describe('Formatters Utilities', () => {
  describe('parseLocalizedNumber', () => {
    it('should parse numbers with comma as decimal separator', () => {
      expect(parseLocalizedNumber('37,5')).toBe(37.5);
      expect(parseLocalizedNumber('75,25')).toBe(75.25);
      expect(parseLocalizedNumber('0,5')).toBe(0.5);
      expect(parseLocalizedNumber('1234,56')).toBe(1234.56);
    });

    it('should parse numbers with dot as decimal separator', () => {
      expect(parseLocalizedNumber('37.5')).toBe(37.5);
      expect(parseLocalizedNumber('75.25')).toBe(75.25);
      expect(parseLocalizedNumber('0.5')).toBe(0.5);
      expect(parseLocalizedNumber('1234.56')).toBe(1234.56);
    });

    it('should parse integer numbers', () => {
      expect(parseLocalizedNumber('75')).toBe(75);
      expect(parseLocalizedNumber('0')).toBe(0);
      expect(parseLocalizedNumber('1234')).toBe(1234);
    });

    it('should parse negative numbers with commas', () => {
      expect(parseLocalizedNumber('-37,5')).toBe(-37.5);
      expect(parseLocalizedNumber('-10,25')).toBe(-10.25);
    });

    it('should parse negative numbers with dots', () => {
      expect(parseLocalizedNumber('-37.5')).toBe(-37.5);
      expect(parseLocalizedNumber('-10.25')).toBe(-10.25);
    });

    it('should handle leading/trailing whitespace', () => {
      expect(parseLocalizedNumber(' 37,5 ')).toBe(37.5);
      expect(parseLocalizedNumber('  75.5  ')).toBe(75.5);
    });

    it('should return null for invalid inputs', () => {
      expect(parseLocalizedNumber('abc')).toBeNull();
      expect(parseLocalizedNumber('not a number')).toBeNull();
      expect(parseLocalizedNumber('')).toBeNull();
      expect(parseLocalizedNumber('   ')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(parseLocalizedNumber('')).toBeNull();
    });

    it('should handle very large numbers', () => {
      expect(parseLocalizedNumber('999999,99')).toBe(999999.99);
      expect(parseLocalizedNumber('999999.99')).toBe(999999.99);
    });

    it('should handle very small decimals', () => {
      expect(parseLocalizedNumber('0,001')).toBe(0.001);
      expect(parseLocalizedNumber('0.001')).toBe(0.001);
    });
  });

  describe('formatFileSize', () => {
    it('should format bytes correctly', () => {
      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(500)).toBe('500 B');
    });

    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1024 * 1024)).toBe('1 MB');
      expect(formatFileSize(2.5 * 1024 * 1024)).toBe('2.5 MB');
    });
  });

  describe('formatValue', () => {
    it('should format numeric values with German locale', () => {
      expect(formatValue(1234.5, 'kg')).toBe('1.234,5 kg');
      expect(formatValue(75, 'cm')).toBe('75 cm');
    });

    it('should format string values', () => {
      expect(formatValue('test', 'unit')).toBe('test unit');
    });
  });

  describe('formatNumber', () => {
    it('should format numbers with German locale', () => {
      expect(formatNumber(1234.56, 2)).toBe('1.234,56');
      expect(formatNumber(75.5, 1)).toBe('75,5');
    });

    it('should respect decimal places', () => {
      expect(formatNumber(75.123, 2)).toBe('75,12');
      expect(formatNumber(75.129, 2)).toBe('75,13');
    });
  });

  describe('truncateText', () => {
    it('should truncate long text', () => {
      expect(truncateText('This is a very long text', 10)).toBe('This is...');
    });

    it('should not truncate short text', () => {
      expect(truncateText('Short', 10)).toBe('Short');
    });
  });

  describe('escapeCsvValue', () => {
    it('should escape values with commas', () => {
      expect(escapeCsvValue('Hello, World')).toBe('"Hello, World"');
    });

    it('should escape values with quotes', () => {
      expect(escapeCsvValue('Say "Hi"')).toBe('"Say ""Hi"""');
    });

    it('should not escape simple values', () => {
      expect(escapeCsvValue('SimpleValue')).toBe('SimpleValue');
      expect(escapeCsvValue('123')).toBe('123');
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize invalid characters', () => {
      expect(sanitizeFilename('file/name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('test:file.pdf')).toBe('test_file.pdf');
    });

    it('should keep valid characters', () => {
      expect(sanitizeFilename('valid-file_name.txt')).toBe('valid-file_name.txt');
    });

    it('should handle German characters', () => {
      expect(sanitizeFilename('Übung.txt')).toBe('Übung.txt');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with German locale', () => {
      expect(formatPercentage(75.5, 1)).toBe('75,5%');
      expect(formatPercentage(100, 0)).toBe('100%');
    });

    it('should respect decimal places', () => {
      expect(formatPercentage(75.123, 2)).toBe('75,12%');
    });
  });
});
