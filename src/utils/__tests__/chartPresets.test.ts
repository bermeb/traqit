/**
 * Chart Presets Tests
 */

import { describe, it, expect } from 'vitest';
import { CHART_PRESETS, getPresetDateRange } from '../chartPresets';

describe('Chart Presets', () => {
  describe('CHART_PRESETS', () => {
    it('should have at least one preset', () => {
      expect(CHART_PRESETS.length).toBeGreaterThan(0);
    });

    it('should have body composition preset', () => {
      const bodyComposition = CHART_PRESETS.find(
        (p) => p.id === 'body-composition'
      );

      expect(bodyComposition).toBeDefined();
      expect(bodyComposition?.name).toBe('Körperzusammensetzung');
      expect(bodyComposition?.chartType).toBe('pie');
      expect(bodyComposition?.timeRangeMonths).toBe(3);
    });

    it('should have correct field names in body composition', () => {
      const bodyComposition = CHART_PRESETS.find(
        (p) => p.id === 'body-composition'
      );

      expect(bodyComposition?.fieldNames).toEqual([
        'KFA',
        'Knochenmasse',
        'Muskelmasse',
        'Wasseranteil',
      ]);
    });

    it('all presets should have required properties', () => {
      CHART_PRESETS.forEach((preset) => {
        expect(preset).toHaveProperty('id');
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('description');
        expect(preset).toHaveProperty('fieldNames');
        expect(preset).toHaveProperty('chartType');
        expect(preset).toHaveProperty('timeRangeMonths');
        expect(preset).toHaveProperty('icon');

        expect(preset.fieldNames.length).toBeGreaterThan(0);
        expect(preset.timeRangeMonths).toBeGreaterThan(0);
      });
    });
  });

  describe('getPresetDateRange', () => {
    it('should return correct date range for 1 month', () => {
      const { start, end } = getPresetDateRange(1);

      expect(start).toBeInstanceOf(Date);
      expect(end).toBeInstanceOf(Date);
      expect(start.getTime()).toBeLessThan(end.getTime());

      const monthsDiff =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      expect(monthsDiff).toBe(1);
    });

    it('should return correct date range for 3 months', () => {
      const { start, end } = getPresetDateRange(3);

      const monthsDiff =
        (end.getFullYear() - start.getFullYear()) * 12 +
        (end.getMonth() - start.getMonth());

      expect(monthsDiff).toBe(3);
    });

    it('should have end date as today', () => {
      const { end } = getPresetDateRange(1);
      const now = new Date();

      expect(end.getDate()).toBe(now.getDate());
      expect(end.getMonth()).toBe(now.getMonth());
      expect(end.getFullYear()).toBe(now.getFullYear());
    });

    it('should handle different month ranges', () => {
      const ranges = [1, 3, 6, 12];

      ranges.forEach((months) => {
        const { start, end } = getPresetDateRange(months);

        const monthsDiff =
          (end.getFullYear() - start.getFullYear()) * 12 +
          (end.getMonth() - start.getMonth());

        expect(monthsDiff).toBe(months);
      });
    });
  });
});
