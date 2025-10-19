/**
 * Date utility functions
 */

import { format, parseISO, isValid, startOfDay, endOfDay, subDays, subMonths } from 'date-fns';
import { de } from 'date-fns/locale';
import { DATE_FORMAT, DATETIME_FORMAT } from './constants';

/**
 * Format a date to string
 */
export function formatDate(date: Date | string, formatStr: string = DATE_FORMAT): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) {
    return 'Ungültiges Datum';
  }
  return format(dateObj, formatStr, { locale: de });
}

/**
 * Format a date to datetime string
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, DATETIME_FORMAT);
}

/**
 * Parse a date string to Date object
 */
export function parseDate(dateStr: string): Date | null {
  try {
    const date = parseISO(dateStr);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Get start of day
 */
export function getStartOfDay(date: Date = new Date()): Date {
  return startOfDay(date);
}

/**
 * Get end of day
 */
export function getEndOfDay(date: Date = new Date()): Date {
  return endOfDay(date);
}

/**
 * Get date range presets
 */
export function getDateRangePresets() {
  const now = new Date();

  return {
    last7Days: {
      start: startOfDay(subDays(now, 7)),
      end: endOfDay(now),
    },
    last30Days: {
      start: startOfDay(subDays(now, 30)),
      end: endOfDay(now),
    },
    last3Months: {
      start: startOfDay(subMonths(now, 3)),
      end: endOfDay(now),
    },
    last6Months: {
      start: startOfDay(subMonths(now, 6)),
      end: endOfDay(now),
    },
    last12Months: {
      start: startOfDay(subMonths(now, 12)),
      end: endOfDay(now),
    },
  };
}

/**
 * Convert Date to input value (YYYY-MM-DD)
 */
export function dateToInputValue(date: Date | undefined | null): string {
  // Handle invalid dates
  if (!date) {
    return format(new Date(), 'yyyy-MM-dd');
  }

  // Use the Date object directly
  const dateObj = date;

  // Check if the date is valid
  if (isNaN(dateObj.getTime())) {
    return format(new Date(), 'yyyy-MM-dd');
  }

  return format(dateObj, 'yyyy-MM-dd');
}

/**
 * Convert input value (YYYY-MM-DD) to Date
 */
export function inputValueToDate(value: string): Date {
  return parseISO(value);
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}
