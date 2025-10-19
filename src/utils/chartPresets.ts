/**
 * Chart Presets
 * Predefined chart configurations for quick access
 */

import { ChartType } from '../types';

export interface ChartPreset {
  id: string;
  name: string;
  description: string;
  fieldNames: string[]; // Field names to match against
  chartType: ChartType;
  timeRangeMonths: number; // Number of months back from today
  icon: string;
}

export const CHART_PRESETS: ChartPreset[] = [
  {
    id: 'body-composition',
    name: 'Körperzusammensetzung',
    description: 'Durchschnittliche Zusammensetzung aus KFA, Knochenmasse, Muskelmasse und Wasseranteil',
    fieldNames: ['KFA', 'Knochenmasse', 'Muskelmasse', 'Wasseranteil'],
    chartType: 'pie',
    timeRangeMonths: 3,
    icon: '🎯',
  },
];

/**
 * Get date range for preset
 */
export function getPresetDateRange(months: number): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  start.setMonth(start.getMonth() - months);

  return { start, end };
}
