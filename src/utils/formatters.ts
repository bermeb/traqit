/**
 * Formatter utility functions
 */

/**
 * Format file size to human-readable string
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * Format number with unit
 */
export function formatValue(value: number | string, unit: string): string {
  if (typeof value === 'number') {
    return `${value.toLocaleString('de-DE')} ${unit}`;
  }
  return `${value} ${unit}`;
}

/**
 * Format number with decimal places
 */
export function formatNumber(value: number, decimals: number = 2): string {
  return value.toLocaleString('de-DE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse number from localized string
 */
export function parseLocalizedNumber(value: string): number | null {
  // Replace German decimal separator with English one
  const normalized = value.replace(',', '.');
  const num = parseFloat(normalized);
  return isNaN(num) ? null : num;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Generate CSV-safe value (escape quotes and commas)
 */
export function escapeCsvValue(value: string | number): string {
  const str = String(value);

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

/**
 * Generate filename-safe string
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9äöüßÄÖÜ._-]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${formatNumber(value, decimals)}%`;
}
