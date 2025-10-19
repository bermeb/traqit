/**
 * Validation Utility Tests
 */

import { describe, it, expect } from 'vitest';
import {
  validateFieldName,
  validateFieldUnit,
  validateNumericValue,
  validateTextValue,
  validateImageFile,
  validateNotes,
  validateExportVersion,
  sanitizeString,
} from '../validation';

describe('Validation Utilities', () => {
  describe('validateFieldName', () => {
    it('should accept valid field names', () => {
      expect(validateFieldName('Gewicht').valid).toBe(true);
      expect(validateFieldName('Body Fat %').valid).toBe(true);
      expect(validateFieldName('Arm-Umfang').valid).toBe(true);
    });

    it('should reject empty names', () => {
      const result1 = validateFieldName('');
      expect(result1.valid).toBe(false);
      expect(result1.error).toBeTruthy();

      const result2 = validateFieldName('   ');
      expect(result2.valid).toBe(false);
    });

    it('should reject names that are too long', () => {
      const longName = 'a'.repeat(51);
      const result = validateFieldName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('50');
    });
  });

  describe('validateFieldUnit', () => {
    it('should accept valid units', () => {
      expect(validateFieldUnit('kg').valid).toBe(true);
      expect(validateFieldUnit('%').valid).toBe(true);
      expect(validateFieldUnit('cm').valid).toBe(true);
    });

    it('should reject empty units', () => {
      const result1 = validateFieldUnit('');
      expect(result1.valid).toBe(false);
      expect(result1.error).toBeTruthy();

      const result2 = validateFieldUnit('   ');
      expect(result2.valid).toBe(false);
    });

    it('should reject units that are too long', () => {
      const longUnit = 'a'.repeat(21);
      const result = validateFieldUnit(longUnit);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('20');
    });
  });

  describe('validateNumericValue', () => {
    it('should accept valid numbers', () => {
      expect(validateNumericValue('75').valid).toBe(true);
      expect(validateNumericValue('75.5').valid).toBe(true);
      expect(validateNumericValue('0').valid).toBe(true);
      expect(validateNumericValue('-10').valid).toBe(true);
    });

    it('should reject empty values', () => {
      const result = validateNumericValue('');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject invalid numbers', () => {
      const result1 = validateNumericValue('abc');
      expect(result1.valid).toBe(false);
      expect(result1.error).toBeTruthy();

      const result2 = validateNumericValue('not a number');
      expect(result2.valid).toBe(false);
    });
  });

  describe('validateTextValue', () => {
    it('should accept valid text', () => {
      expect(validateTextValue('Normal').valid).toBe(true);
      expect(validateTextValue('Gut gefühlt').valid).toBe(true);
    });

    it('should reject empty values', () => {
      const result1 = validateTextValue('');
      expect(result1.valid).toBe(false);
      expect(result1.error).toBeTruthy();

      const result2 = validateTextValue('   ');
      expect(result2.valid).toBe(false);
    });

    it('should reject text that is too long', () => {
      const longText = 'a'.repeat(501);
      const result = validateTextValue(longText);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('500');
    });
  });

  describe('validateImageFile', () => {
    it('should accept valid image files', () => {
      const validFile = new File([''], 'test.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(validFile, 'size', { value: 1024 * 1024 }); // 1 MB

      const result = validateImageFile(validFile);
      expect(result.valid).toBe(true);
    });

    it('should reject invalid file types', () => {
      const invalidFile = new File([''], 'test.gif', {
        type: 'image/gif',
      });

      const result = validateImageFile(invalidFile);
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });

    it('should reject files that are too large', () => {
      const largeFile = new File([''], 'test.jpg', {
        type: 'image/jpeg',
      });
      Object.defineProperty(largeFile, 'size', { value: 11 * 1024 * 1024 }); // 11 MB

      const result = validateImageFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('groß');
    });
  });

  describe('validateNotes', () => {
    it('should accept valid notes', () => {
      expect(validateNotes('Some notes').valid).toBe(true);
      expect(validateNotes('').valid).toBe(true); // Empty is valid for notes
    });

    it('should reject notes that are too long', () => {
      const longNotes = 'a'.repeat(1001);
      const result = validateNotes(longNotes);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('1000');
    });
  });

  describe('validateExportVersion', () => {
    it('should accept version 1.0', () => {
      expect(validateExportVersion('1.0')).toBe(true);
    });

    it('should reject other versions', () => {
      expect(validateExportVersion('2.0')).toBe(false);
      expect(validateExportVersion('1.1')).toBe(false);
      expect(validateExportVersion('')).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove dangerous characters', () => {
      expect(sanitizeString('Hello<script>')).toBe('Helloscript');
      expect(sanitizeString('Test > value')).toBe('Test  value');
    });

    it('should keep safe characters', () => {
      expect(sanitizeString('Normal text 123')).toBe('Normal text 123');
      expect(sanitizeString('Gewicht: 75kg')).toBe('Gewicht: 75kg');
    });
  });
});
