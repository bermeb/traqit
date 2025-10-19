/**
 * Validation utility functions
 */

import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from './constants';
import { ImageValidationResult } from '../types';

/**
 * Validate field name
 */
export function validateFieldName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Feldname darf nicht leer sein' };
  }

  if (name.length > 50) {
    return { valid: false, error: 'Feldname darf maximal 50 Zeichen lang sein' };
  }

  return { valid: true };
}

/**
 * Validate field unit
 */
export function validateFieldUnit(unit: string): { valid: boolean; error?: string } {
  if (!unit || unit.trim().length === 0) {
    return { valid: false, error: 'Einheit darf nicht leer sein' };
  }

  if (unit.length > 20) {
    return { valid: false, error: 'Einheit darf maximal 20 Zeichen lang sein' };
  }

  return { valid: true };
}

/**
 * Validate numeric value
 */
export function validateNumericValue(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'Wert darf nicht leer sein' };
  }

  const num = parseFloat(value);
  if (isNaN(num)) {
    return { valid: false, error: 'Ungültiger Zahlenwert' };
  }

  return { valid: true };
}

/**
 * Validate text value
 */
export function validateTextValue(value: string): { valid: boolean; error?: string } {
  if (!value || value.trim().length === 0) {
    return { valid: false, error: 'Wert darf nicht leer sein' };
  }

  if (value.length > 500) {
    return { valid: false, error: 'Text darf maximal 500 Zeichen lang sein' };
  }

  return { valid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): ImageValidationResult {
  // Check file type
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Ungültiger Dateityp. Erlaubt sind: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  // Check file size
  if (file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `Datei zu groß. Maximal ${MAX_IMAGE_SIZE / 1024 / 1024} MB erlaubt.`,
    };
  }

  return { valid: true };
}

/**
 * Validate notes
 */
export function validateNotes(notes: string): { valid: boolean; error?: string } {
  if (notes.length > 1000) {
    return { valid: false, error: 'Notizen dürfen maximal 1000 Zeichen lang sein' };
  }

  return { valid: true };
}

/**
 * Validate export data version
 */
export function validateExportVersion(version: string): boolean {
  // Currently only version 1.0 is supported
  return version === '1.0';
}

/**
 * Sanitize string (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  return input.replace(/[<>]/g, '');
}
