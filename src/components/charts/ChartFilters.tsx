/**
 * ChartFilters Component
 * Filters for chart visualization
 */

import { Field, ChartType } from '../../types';
import { dateToInputValue, getDateRangePresets } from '../../utils';
import { Button } from '../common';
import './ChartFilters.css';

interface ChartFiltersProps {
  fields: Field[];
  selectedFieldIds: string[];
  onFieldsChange: (fieldIds: string[]) => void;
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
  chartType: ChartType;
  onChartTypeChange: (type: ChartType) => void;
}

export function ChartFilters({
  fields,
  selectedFieldIds,
  onFieldsChange,
  startDate,
  endDate,
  onDateRangeChange,
  chartType,
  onChartTypeChange,
}: ChartFiltersProps) {
  const presets = getDateRangePresets();

  const handleFieldToggle = (fieldId: string) => {
    if (selectedFieldIds.includes(fieldId)) {
      onFieldsChange(selectedFieldIds.filter((id) => id !== fieldId));
    } else {
      onFieldsChange([...selectedFieldIds, fieldId]);
    }
  };

  const handlePresetClick = (presetKey: keyof typeof presets) => {
    const { start, end } = presets[presetKey];
    onDateRangeChange(start, end);
  };

  const handleSelectAll = () => {
    onFieldsChange(fields.map((f) => f.id));
  };

  const handleDeselectAll = () => {
    onFieldsChange([]);
  };

  if (fields.length === 0) {
    return (
      <div className="chart-filters-empty">
        <p>Keine Felder vorhanden.</p>
        <p>Erstelle zuerst Messfelder unter <a href="#/fields">Felder</a>.</p>
      </div>
    );
  }

  return (
    <div className="chart-filters">
      <div className="chart-filters__section">
        <div className="chart-filters__header">
          <h3 className="chart-filters__title">Felder auswählen</h3>
          <div className="chart-filters__actions">
            <Button size="sm" variant="ghost" onClick={handleSelectAll}>
              Alle
            </Button>
            <Button size="sm" variant="ghost" onClick={handleDeselectAll}>
              Keine
            </Button>
          </div>
        </div>
        <div className="chart-filters__fields">
          {fields.map((field) => (
            <label key={field.id} className="chart-filters__field">
              <input
                type="checkbox"
                checked={selectedFieldIds.includes(field.id)}
                onChange={() => handleFieldToggle(field.id)}
              />
              <span>{field.name} ({field.unit})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="chart-filters__section">
        <h3 className="chart-filters__title">Zeitraum</h3>
        <div className="chart-filters__presets">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePresetClick('last7Days')}
          >
            7 Tage
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePresetClick('last30Days')}
          >
            30 Tage
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePresetClick('last3Months')}
          >
            3 Monate
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handlePresetClick('last6Months')}
          >
            6 Monate
          </Button>
        </div>
        <div className="chart-filters__date-range">
          <div className="chart-filters__date-input">
            <label htmlFor="start-date">Von:</label>
            <input
              id="start-date"
              type="date"
              value={dateToInputValue(startDate)}
              onChange={(e) => onDateRangeChange(new Date(e.target.value), endDate)}
            />
          </div>
          <div className="chart-filters__date-input">
            <label htmlFor="end-date">Bis:</label>
            <input
              id="end-date"
              type="date"
              value={dateToInputValue(endDate)}
              onChange={(e) => onDateRangeChange(startDate, new Date(e.target.value))}
            />
          </div>
        </div>
      </div>

      <div className="chart-filters__section">
        <h3 className="chart-filters__title">Diagramm-Typ</h3>
        <div className="chart-filters__chart-types">
          <label className="chart-filters__chart-type">
            <input
              type="radio"
              name="chartType"
              value="line"
              checked={chartType === 'line'}
              onChange={() => onChartTypeChange('line')}
            />
            <span>Liniendiagramm</span>
          </label>
          <label className="chart-filters__chart-type">
            <input
              type="radio"
              name="chartType"
              value="bar"
              checked={chartType === 'bar'}
              onChange={() => onChartTypeChange('bar')}
            />
            <span>Balkendiagramm</span>
          </label>
          <label className="chart-filters__chart-type">
            <input
              type="radio"
              name="chartType"
              value="pie"
              checked={chartType === 'pie'}
              onChange={() => onChartTypeChange('pie')}
            />
            <span>Kuchendiagramm</span>
          </label>
        </div>
      </div>
    </div>
  );
}
