/**
 * Statistics Utility Functions
 * Calculate statistics from entries
 */

import { Entry } from '../types';
import { Field } from '../types';
import { subDays, isAfter, isBefore } from 'date-fns';

export interface FieldStatistics {
  fieldId: string;
  fieldName: string;
  current: number | null;
  min: number;
  max: number;
  average: number;
  change7d: number | null;
  change30d: number | null;
  trend: 'up' | 'down' | 'stable';
  dataPoints: number;
}

/**
 * Calculate statistics for a specific field
 */
export function calculateFieldStatistics(
  entries: Entry[],
  field: Field
): FieldStatistics | null {
  // Filter entries that have this field
  const validEntries = entries
    .filter((entry) => {
      const value = entry.values[field.id];
      return value !== undefined && value !== null && value !== '';
    })
    .map((entry) => ({
      ...entry,
      numericValue: Number(entry.values[field.id]),
    }))
    .filter((entry) => !isNaN(entry.numericValue))
    .sort((a, b) => b.date.getTime() - a.date.getTime()); // Sort by date descending

  if (validEntries.length === 0) {
    return null;
  }

  // Calculate basic statistics
  const values = validEntries.map((e) => e.numericValue);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const average = values.reduce((sum, val) => sum + val, 0) / values.length;
  const current = validEntries[0]?.numericValue ?? null;

  // Calculate 7-day change
  const now = new Date();
  const date7dAgo = subDays(now, 7);
  const entry7dAgo = validEntries.find((e) => isBefore(e.date, date7dAgo));
  const change7d = current !== null && entry7dAgo ? current - entry7dAgo.numericValue : null;

  // Calculate 30-day change
  const date30dAgo = subDays(now, 30);
  const entry30dAgo = validEntries.find((e) => isBefore(e.date, date30dAgo));
  const change30d = current !== null && entry30dAgo ? current - entry30dAgo.numericValue : null;

  // Determine trend (based on 7-day change, or 30-day if 7-day unavailable)
  const trendValue = change7d ?? change30d ?? 0;
  const trend = Math.abs(trendValue) < 0.01 ? 'stable' : trendValue > 0 ? 'up' : 'down';

  return {
    fieldId: field.id,
    fieldName: field.name,
    current,
    min,
    max,
    average,
    change7d,
    change30d,
    trend,
    dataPoints: validEntries.length,
  };
}

/**
 * Calculate all field statistics
 */
export function calculateAllStatistics(
  entries: Entry[],
  fields: Field[]
): FieldStatistics[] {
  return fields
    .map((field) => calculateFieldStatistics(entries, field))
    .filter((stat): stat is FieldStatistics => stat !== null);
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
}

/**
 * Get entries within a date range
 */
export function getEntriesInRange(
  entries: Entry[],
  startDate: Date,
  endDate: Date
): Entry[] {
  return entries.filter(
    (entry) => isAfter(entry.date, startDate) && isBefore(entry.date, endDate)
  );
}

/**
 * Format statistic value with unit
 */
export function formatStatValue(value: number | null, unit: string, decimals = 1): string {
  if (value === null) return '-';
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Format change value with sign and unit
 */
export function formatChangeValue(
  change: number | null,
  unit: string,
  decimals = 1
): string {
  if (change === null) return '-';
  const sign = change > 0 ? '+' : '';
  return `${sign}${change.toFixed(decimals)} ${unit}`;
}
