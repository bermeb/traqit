/**
 * Chart Presets Integration Tests
 */

import { describe, it, expect } from 'vitest';
import { CHART_PRESETS } from '../../utils/chartPresets';
import { DEFAULT_FIELDS } from '../../utils';
import type { Field } from '../../types';

describe('Chart Presets Integration', () => {
  // Create mock fields based on default fields
  const mockFields: Field[] = DEFAULT_FIELDS.map((df, index) => ({
    id: `field-${index}`,
    name: df.name,
    unit: df.unit,
    type: 'number' as const,
    createdAt: new Date(),
    order: index,
  }));

  describe('Body Composition Preset', () => {
    const preset = CHART_PRESETS.find((p) => p.id === 'body-composition');

    it('should exist', () => {
      expect(preset).toBeDefined();
    });

    it('should find all required fields in default fields', () => {
      if (!preset) return;

      preset.fieldNames.forEach((fieldName) => {
        const field = mockFields.find((f) => f.name === fieldName);
        expect(field).toBeDefined();
        expect(field?.unit).toBe('%');
      });
    });

    it('should match exactly 4 fields', () => {
      if (!preset) return;

      const matchedFields = preset.fieldNames
        .map((name) => mockFields.find((f) => f.name === name))
        .filter((f) => f !== undefined);

      expect(matchedFields).toHaveLength(4);
    });

    it('should only include percentage fields', () => {
      if (!preset) return;

      const matchedFields = preset.fieldNames
        .map((name) => mockFields.find((f) => f.name === name))
        .filter((f) => f !== undefined);

      matchedFields.forEach((field) => {
        expect(field?.unit).toBe('%');
      });
    });

    it('should be configured for pie chart', () => {
      expect(preset?.chartType).toBe('pie');
    });

    it('should be configured for 3 months', () => {
      expect(preset?.timeRangeMonths).toBe(3);
    });
  });

  describe('Field Matching Logic', () => {
    it('should match fields case-sensitive', () => {
      const testField = mockFields.find((f) => f.name === 'KFA');
      expect(testField).toBeDefined();

      const wrongCaseField = mockFields.find((f) => f.name === 'kfa');
      expect(wrongCaseField).toBeUndefined();
    });

    it('should handle missing fields gracefully', () => {
      const incompleteFields = mockFields.slice(0, 2); // Only first 2 fields

      const preset = CHART_PRESETS[0];
      const matchedFieldIds = preset.fieldNames
        .map((name) => {
          const field = incompleteFields.find((f) => f.name === name);
          return field?.id;
        })
        .filter((id): id is string => id !== undefined);

      expect(matchedFieldIds.length).toBeLessThan(preset.fieldNames.length);
    });
  });

  describe('Preset Validation', () => {
    it('should have valid chart types', () => {
      const validChartTypes = ['line', 'bar', 'pie'];

      CHART_PRESETS.forEach((preset) => {
        expect(validChartTypes).toContain(preset.chartType);
      });
    });

    it('should have reasonable time ranges', () => {
      CHART_PRESETS.forEach((preset) => {
        expect(preset.timeRangeMonths).toBeGreaterThan(0);
        expect(preset.timeRangeMonths).toBeLessThanOrEqual(12);
      });
    });

    it('should have unique IDs', () => {
      const ids = CHART_PRESETS.map((p) => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should have descriptions', () => {
      CHART_PRESETS.forEach((preset) => {
        expect(preset.description).toBeTruthy();
        expect(preset.description.length).toBeGreaterThan(10);
      });
    });

    it('should have icons', () => {
      CHART_PRESETS.forEach((preset) => {
        expect(preset.icon).toBeTruthy();
        expect(preset.icon.length).toBeGreaterThan(0);
      });
    });
  });
});
