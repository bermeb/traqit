/**
 * ChartView Component
 * Container for chart display with filters
 */

import { useState, useMemo, useEffect } from 'react';
import { Field, Entry, ChartType } from '../../types';
import { ChartFilters } from './ChartFilters';
import { LineChart } from './LineChart';
import { BarChart } from './BarChart';
import { PieChart } from './PieChart';
import { Card } from '../common';
import { getDateRangePresets } from '../../utils';
import './ChartView.css';

interface ChartViewProps {
  fields: Field[];
  entries: Entry[];
  initialFieldIds?: string[];
  initialStartDate?: Date;
  initialEndDate?: Date;
  initialChartType?: ChartType;
  onFilterChange?: (fieldIds: string[], startDate: Date, endDate: Date, chartType: ChartType) => void;
}

export function ChartView({
  fields,
  entries,
  initialFieldIds = [],
  initialStartDate,
  initialEndDate,
  initialChartType = 'line',
  onFilterChange,
}: ChartViewProps) {
  const presets = getDateRangePresets();

  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>(initialFieldIds);
  const [startDate, setStartDate] = useState<Date>(initialStartDate || presets.last30Days.start);
  const [endDate, setEndDate] = useState<Date>(initialEndDate || presets.last30Days.end);
  const [chartType, setChartType] = useState<ChartType>(initialChartType);

  // Update internal state when external props change
  useEffect(() => {
    if (initialFieldIds.length > 0) {
      setSelectedFieldIds(initialFieldIds);
    }
  }, [initialFieldIds]);

  useEffect(() => {
    if (initialStartDate) {
      setStartDate(initialStartDate);
    }
  }, [initialStartDate]);

  useEffect(() => {
    if (initialEndDate) {
      setEndDate(initialEndDate);
    }
  }, [initialEndDate]);

  useEffect(() => {
    setChartType(initialChartType);
  }, [initialChartType]);

  // Notify parent when filters change
  useEffect(() => {
    if (onFilterChange) {
      onFilterChange(selectedFieldIds, startDate, endDate, chartType);
    }
  }, [selectedFieldIds, startDate, endDate, chartType, onFilterChange]);

  // Filter entries by date range
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate >= startDate && entryDate <= endDate;
    });
  }, [entries, startDate, endDate]);

  // Get selected fields
  const selectedFields = useMemo(() => {
    return fields.filter((field) => selectedFieldIds.includes(field.id));
  }, [fields, selectedFieldIds]);

  const handleDateRangeChange = (start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
  };

  return (
    <div className="chart-view">
      <Card className="chart-view__filters">
        <ChartFilters
          fields={fields}
          selectedFieldIds={selectedFieldIds}
          onFieldsChange={setSelectedFieldIds}
          startDate={startDate}
          endDate={endDate}
          onDateRangeChange={handleDateRangeChange}
          chartType={chartType}
          onChartTypeChange={setChartType}
        />
      </Card>

      <Card className="chart-view__chart">
        {chartType === 'line' ? (
          <LineChart entries={filteredEntries} selectedFields={selectedFields} />
        ) : chartType === 'bar' ? (
          <BarChart entries={filteredEntries} selectedFields={selectedFields} />
        ) : (
          <PieChart entries={filteredEntries} selectedFields={selectedFields} />
        )}
      </Card>
    </div>
  );
}
