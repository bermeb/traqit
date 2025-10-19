/**
 * ChartPresets Component
 * Quick access to predefined chart configurations
 */

import { Field } from '../../types';
import { CHART_PRESETS, getPresetDateRange } from '../../utils/chartPresets';
import { Button } from '../common';
import { useToast } from '../../hooks';
import './ChartPresets.css';

interface ChartPresetsProps {
  fields: Field[];
  onPresetSelect: (fieldIds: string[], startDate: Date, endDate: Date, chartType: 'line' | 'bar' | 'pie') => void;
}

export function ChartPresets({ fields, onPresetSelect }: ChartPresetsProps) {
  const { showToast, ToastContainer } = useToast();

  if (fields.length === 0) {
    return null;
  }

  const handlePresetClick = (presetId: string) => {
    const preset = CHART_PRESETS.find(p => p.id === presetId);
    if (!preset) return;

    // Find field IDs that match the preset field names
    const matchedFieldIds = preset.fieldNames
      .map(fieldName => {
        const field = fields.find(f => f.name === fieldName);
        return field?.id;
      })
      .filter((id): id is string => id !== undefined);

    // Check if we found all required fields
    if (matchedFieldIds.length === 0) {
      showToast({
        message: `Die benötigten Felder (${preset.fieldNames.join(', ')}) wurden nicht gefunden. Bitte erstelle diese Felder zuerst.`,
        type: 'warning',
        duration: 5000,
      });
      return;
    }

    if (matchedFieldIds.length < preset.fieldNames.length) {
      const missingFields = preset.fieldNames.filter(
        name => !fields.find(f => f.name === name)
      );
      console.warn(`Einige Felder fehlen: ${missingFields.join(', ')}`);
    }

    // Get date range for preset
    const { start, end } = getPresetDateRange(preset.timeRangeMonths);

    // Apply preset
    onPresetSelect(matchedFieldIds, start, end, preset.chartType);
  };

  return (
    <div className="chart-presets">
      <h3 className="chart-presets__title">Schnellauswahl</h3>
      <p className="chart-presets__description">
        Vorkonfigurierte Diagramme für häufige Ansichten
      </p>
      <div className="chart-presets__list">
        {CHART_PRESETS.map((preset) => {
          // Check how many of the required fields are available
          const availableFieldsCount = preset.fieldNames.filter(
            fieldName => fields.find(f => f.name === fieldName)
          ).length;
          const allFieldsAvailable = availableFieldsCount === preset.fieldNames.length;

          return (
            <div key={preset.id} className="chart-preset-card">
              <div className="chart-preset-card__icon">{preset.icon}</div>
              <div className="chart-preset-card__content">
                <h4 className="chart-preset-card__name">{preset.name}</h4>
                <p className="chart-preset-card__description">{preset.description}</p>
                <div className="chart-preset-card__info">
                  <span className="chart-preset-card__badge">
                    {preset.chartType === 'pie' ? 'Kuchendiagramm' :
                     preset.chartType === 'line' ? 'Liniendiagramm' : 'Balkendiagramm'}
                  </span>
                  <span className="chart-preset-card__badge">
                    {preset.timeRangeMonths} {preset.timeRangeMonths === 1 ? 'Monat' : 'Monate'}
                  </span>
                  <span className={`chart-preset-card__badge ${!allFieldsAvailable ? 'chart-preset-card__badge--warning' : ''}`}>
                    {availableFieldsCount}/{preset.fieldNames.length} Felder
                  </span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handlePresetClick(preset.id)}
                disabled={availableFieldsCount === 0}
              >
                Anwenden
              </Button>
            </div>
          );
        })}
      </div>
      {ToastContainer}
    </div>
  );
}
