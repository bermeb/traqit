/**
 * ChartsPage
 * Visualize measurements with charts
 */

import { useState } from 'react';
import { useAppContext } from '../context';
import { useViewConfigs } from '../hooks';
import { ChartView } from '../components/charts';
import { ChartPresets } from '../components/charts';
import { ChartType } from '../types';
import { Card, Button } from '../components/common';
import './ChartsPage.css';

export function ChartsPage() {
  const { fields, entries, setCurrentRoute } = useAppContext();
  const { viewConfigs } = useViewConfigs();

  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [chartType, setChartType] = useState<ChartType>('line');

  const handlePresetSelect = (
    fieldIds: string[],
    start: Date,
    end: Date,
    type: ChartType
  ) => {
    setSelectedFieldIds(fieldIds);
    setStartDate(start);
    setEndDate(end);
    setChartType(type);

    // Smooth scroll to chart view
    setTimeout(() => {
      const chartSection = document.querySelector('.chart-view');
      if (chartSection) {
        chartSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  const handleViewConfigSelect = (configId: string) => {
    const config = viewConfigs.find((c) => c.id === configId);
    if (!config) return;

    // Filter to only include fields that still exist
    const validFieldIds = config.fieldIds.filter((id) =>
      fields.find((f) => f.id === id)
    );

    if (validFieldIds.length === 0) return;

    // Set date range to last 3 months
    const end = new Date();
    const start = new Date();
    start.setMonth(start.getMonth() - 3);

    setSelectedFieldIds(validFieldIds);
    setStartDate(start);
    setEndDate(end);
    setChartType(config.chartType || 'line');

    // Smooth scroll to chart view
    setTimeout(() => {
      const chartSection = document.querySelector('.chart-view');
      if (chartSection) {
        chartSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <div className="charts-page">
      <div className="container">
        <h2>Diagramme</h2>

        {fields.length > 0 && viewConfigs.length > 0 && (
          <Card className="charts-page__view-configs">
            <div className="charts-page__section-header">
              <div>
                <h3 className="charts-page__section-title">Meine Ansichten</h3>
                <p className="charts-page__section-description">
                  Wähle eine deiner gespeicherten Ansichten für ein Liniendiagramm der letzten 3 Monate
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentRoute('/view-configs')}
              >
                ⚙️ Verwalten
              </Button>
            </div>
            <div className="charts-page__view-config-list">
              {viewConfigs.map((config) => {
                const validFieldsCount = config.fieldIds.filter((id) =>
                  fields.find((f) => f.id === id)
                ).length;

                const chartTypeLabel =
                  config.chartType === 'bar' ? '📊 Balkendiagramm' :
                  config.chartType === 'pie' ? '🥧 Kuchendiagramm' :
                  '📈 Liniendiagramm';

                return (
                  <div key={config.id} className="view-config-quick-card">
                    <div className="view-config-quick-card__icon">{config.icon}</div>
                    <div className="view-config-quick-card__content">
                      <h4 className="view-config-quick-card__name">{config.name}</h4>
                      {config.description && (
                        <p className="view-config-quick-card__description">
                          {config.description}
                        </p>
                      )}
                      <div className="view-config-quick-card__badges">
                        <span className="view-config-quick-card__badge">
                          {validFieldsCount} {validFieldsCount === 1 ? 'Feld' : 'Felder'}
                        </span>
                        <span className="view-config-quick-card__badge view-config-quick-card__badge--primary">
                          {chartTypeLabel}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleViewConfigSelect(config.id)}
                      disabled={validFieldsCount === 0}
                    >
                      Anwenden
                    </Button>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {fields.length > 0 && (
          <Card className="charts-page__presets">
            <ChartPresets fields={fields} onPresetSelect={handlePresetSelect} />
          </Card>
        )}

        <ChartView
          fields={fields}
          entries={entries}
          initialFieldIds={selectedFieldIds}
          initialStartDate={startDate}
          initialEndDate={endDate}
          initialChartType={chartType}
        />
      </div>
    </div>
  );
}
