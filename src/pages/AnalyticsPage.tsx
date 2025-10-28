/**
 * AnalyticsPage
 * Combined page for charts and image comparison
 */

import { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '../context';
import { useViewConfigs, useImages } from '../hooks';
import { ChartView } from '../components/charts';
import { ImageCompare, ImageSelector } from '../components/compare';
import { ChartType } from '../types';
import { Card, Button, Tabs, Tab } from '../components/common';
import { formatDate } from '../utils';
import './AnalyticsPage.css';

type TimeUnit = 'days' | 'months' | 'years';
type SelectionMode = 'timeRange' | 'manual';

export function AnalyticsPage() {
  const { fields, entries, setCurrentRoute } = useAppContext();
  const { viewConfigs } = useViewConfigs();
  const { getImageUrl } = useImages();

  // Tab state
  const [activeTab, setActiveTab] = useState('charts');

  // Charts tab state
  const [selectedFieldIds, setSelectedFieldIds] = useState<string[]>([]);
  const [startDate] = useState<Date | undefined>(undefined);
  const [endDate] = useState<Date | undefined>(undefined);
  const [chartType, setChartType] = useState<ChartType>('line');

  // Image comparison tab state
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('timeRange');
  const [timeValue, setTimeValue] = useState<number>(3);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('months');
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [beforeDate, setBeforeDate] = useState<Date | null>(null);
  const [afterDate, setAfterDate] = useState<Date | null>(null);
  const [selectedBeforeId, setSelectedBeforeId] = useState<string | null>(null);
  const [selectedAfterId, setSelectedAfterId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());

  // Get entries with images, sorted by date
  const entriesWithImages = useMemo(() => {
    return entries
      .filter((e) => e.imageId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries]);

  const handleViewConfigSelect = (configId: string) => {
    const config = viewConfigs.find((c) => c.id === configId);
    if (!config) return;

    const validFieldIds = config.fieldIds.filter((id) =>
      fields.find((f) => f.id === id)
    );

    if (validFieldIds.length === 0) return;

    setSelectedFieldIds(validFieldIds);
    setChartType(config.chartType || 'line');

    setTimeout(() => {
      const chartSection = document.querySelector('.chart-view');
      if (chartSection) {
        chartSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  // Image comparison functions
  const calculateTargetDate = () => {
    const now = new Date();
    const target = new Date(now);

    switch (timeUnit) {
      case 'days':
        target.setDate(target.getDate() - timeValue);
        break;
      case 'months':
        target.setMonth(target.getMonth() - timeValue);
        break;
      case 'years':
        target.setFullYear(target.getFullYear() - timeValue);
        break;
    }

    return target;
  };

  const findBeforeEntry = () => {
    const targetDate = calculateTargetDate();

    let closestEntry = null;
    let smallestDiff = Infinity;

    for (const entry of entriesWithImages) {
      const diff = Math.abs(entry.date.getTime() - targetDate.getTime());
      if (diff < smallestDiff) {
        smallestDiff = diff;
        closestEntry = entry;
      }
    }

    return closestEntry;
  };

  const findAfterEntry = () => {
    return entriesWithImages.length > 0 ? entriesWithImages[0] : null;
  };

  useEffect(() => {
    const loadImageUrls = async () => {
      const urlMap = new Map<string, string>();

      for (const entry of entriesWithImages) {
        const imageId = entry.imageId;
        if (imageId !== undefined && imageId !== null) {
          try {
            const url = await getImageUrl(imageId);
            if (url) {
              urlMap.set(entry.id, url);
            }
          } catch (error) {
            console.error(`Failed to load image for entry ${entry.id}:`, error);
          }
        }
      }

      setImageUrls(urlMap);
    };

    if (selectionMode === 'manual' && entriesWithImages.length > 0) {
      loadImageUrls();
    }
  }, [selectionMode, entriesWithImages, getImageUrl]);

  const handleCompare = async () => {
    const beforeEntry = findBeforeEntry();
    const afterEntry = findAfterEntry();

    if (!beforeEntry || !afterEntry) {
      return;
    }

    if (beforeEntry.imageId) {
      const url = await getImageUrl(beforeEntry.imageId);
      setBeforeImageUrl(url);
      setBeforeDate(beforeEntry.date);
    }

    if (afterEntry.imageId) {
      const url = await getImageUrl(afterEntry.imageId);
      setAfterImageUrl(url);
      setAfterDate(afterEntry.date);
    }
  };

  const handleManualCompare = () => {
    if (!selectedBeforeId || !selectedAfterId) {
      return;
    }

    const beforeEntry = entriesWithImages.find(e => e.id === selectedBeforeId);
    const afterEntry = entriesWithImages.find(e => e.id === selectedAfterId);

    if (!beforeEntry || !afterEntry) {
      return;
    }

    const beforeUrl = imageUrls.get(selectedBeforeId);
    const afterUrl = imageUrls.get(selectedAfterId);

    if (beforeUrl && afterUrl) {
      setBeforeImageUrl(beforeUrl);
      setAfterImageUrl(afterUrl);
      setBeforeDate(beforeEntry.date);
      setAfterDate(afterEntry.date);
    }
  };

  const handleModeChange = (mode: SelectionMode) => {
    setSelectionMode(mode);
    setBeforeImageUrl(null);
    setAfterImageUrl(null);
    setBeforeDate(null);
    setAfterDate(null);
    setSelectedBeforeId(null);
    setSelectedAfterId(null);
  };

  const getTimeUnitLabel = (unit: TimeUnit): string => {
    switch (unit) {
      case 'days':
        return timeValue === 1 ? 'Tag' : 'Tage';
      case 'months':
        return timeValue === 1 ? 'Monat' : 'Monate';
      case 'years':
        return timeValue === 1 ? 'Jahr' : 'Jahre';
    }
  };

  const hasImages = entriesWithImages.length >= 2;

  // Charts tab content
  const chartsContent = (
    <div className="analytics-page__charts">
      {fields.length > 0 && viewConfigs.length > 0 && (
        <Card className="charts-page__view-configs">
          <div className="charts-page__section-header">
            <div>
              <h3 className="charts-page__section-title">Meine Ansichten</h3>
              <p className="charts-page__section-description">
                Wähle eine deiner gespeicherten Ansichten. Den Zeitraum kannst du im Diagramm anpassen.
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

      <ChartView
        fields={fields}
        entries={entries}
        initialFieldIds={selectedFieldIds}
        initialStartDate={startDate}
        initialEndDate={endDate}
        initialChartType={chartType}
      />
    </div>
  );

  // Image comparison tab content
  const imageComparisonContent = (
    <div className="analytics-page__image-comparison">
      <p className="image-comparison-page__subtitle">
        Vergleiche deine Fortschritte über verschiedene Zeiträume
      </p>

      {!hasImages ? (
        <Card>
          <div className="image-comparison-page__empty">
            <p>📸 Nicht genügend Bilder für einen Vergleich vorhanden.</p>
            <p className="image-comparison-page__empty-hint">
              Du benötigst mindestens 2 Einträge mit Bildern.
              Aktuell: {entriesWithImages.length} {entriesWithImages.length === 1 ? 'Bild' : 'Bilder'}
            </p>
          </div>
        </Card>
      ) : (
        <>
          <Card className="image-comparison-page__controls">
            <h3>Auswahlmodus</h3>
            <div className="selection-mode-toggle">
              <button
                className={`mode-btn ${selectionMode === 'timeRange' ? 'mode-btn--active' : ''}`}
                onClick={() => handleModeChange('timeRange')}
              >
                📅 Nach Zeitraum
              </button>
              <button
                className={`mode-btn ${selectionMode === 'manual' ? 'mode-btn--active' : ''}`}
                onClick={() => handleModeChange('manual')}
              >
                🖼️ Bilder direkt wählen
              </button>
            </div>
          </Card>

          {selectionMode === 'timeRange' ? (
            <Card className="image-comparison-page__controls">
              <h3>Zeitraum wählen</h3>
              <p className="image-comparison-page__controls-description">
                Vergleiche ein Bild von vor einiger Zeit mit deinem aktuellsten Bild
              </p>

              <div className="image-comparison-page__time-selector">
                <div className="time-input-group">
                  <label htmlFor="time-value">Vor</label>
                  <input
                    id="time-value"
                    type="number"
                    min="1"
                    max="100"
                    value={timeValue}
                    onChange={(e) => setTimeValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="time-input"
                  />
                </div>

                <div className="time-unit-selector">
                  <button
                    className={`time-unit-btn ${timeUnit === 'days' ? 'time-unit-btn--active' : ''}`}
                    onClick={() => setTimeUnit('days')}
                  >
                    {timeValue === 1 ? 'Tag' : 'Tage'}
                  </button>
                  <button
                    className={`time-unit-btn ${timeUnit === 'months' ? 'time-unit-btn--active' : ''}`}
                    onClick={() => setTimeUnit('months')}
                  >
                    {timeValue === 1 ? 'Monat' : 'Monate'}
                  </button>
                  <button
                    className={`time-unit-btn ${timeUnit === 'years' ? 'time-unit-btn--active' : ''}`}
                    onClick={() => setTimeUnit('years')}
                  >
                    {timeValue === 1 ? 'Jahr' : 'Jahre'}
                  </button>
                </div>

                <Button variant="primary" onClick={handleCompare}>
                  Vergleich starten
                </Button>
              </div>

              <div className="image-comparison-page__info">
                <p>
                  📊 Verfügbare Bilder: <strong>{entriesWithImages.length}</strong>
                </p>
                <p>
                  Zeitraum: <strong>Vor {timeValue} {getTimeUnitLabel(timeUnit)}</strong> vs. <strong>Aktuell</strong>
                </p>
              </div>
            </Card>
          ) : (
            <Card className="image-comparison-page__manual-selection">
              <h3>Bilder auswählen</h3>
              <p className="image-comparison-page__controls-description">
                Wähle zwei beliebige Bilder aus, um sie zu vergleichen
              </p>

              <div className="image-comparison-page__selectors">
                <ImageSelector
                  entries={entriesWithImages}
                  selectedId={selectedBeforeId}
                  onSelect={setSelectedBeforeId}
                  label="Vorher-Bild"
                  imageUrls={imageUrls}
                  sortOrder="oldest-first"
                  disabledIds={selectedAfterId ? [selectedAfterId] : []}
                />

                <ImageSelector
                  entries={entriesWithImages}
                  selectedId={selectedAfterId}
                  onSelect={setSelectedAfterId}
                  label="Nachher-Bild"
                  imageUrls={imageUrls}
                  sortOrder="newest-first"
                  disabledIds={selectedBeforeId ? [selectedBeforeId] : []}
                />
              </div>

              <div className="image-comparison-page__manual-actions">
                <Button
                  variant="primary"
                  onClick={handleManualCompare}
                  disabled={!selectedBeforeId || !selectedAfterId}
                >
                  Vergleich starten
                </Button>
                {(!selectedBeforeId || !selectedAfterId) && (
                  <p className="image-comparison-page__manual-hint">
                    Wähle jeweils ein Bild aus beiden Galerien aus
                  </p>
                )}
              </div>
            </Card>
          )}

          {beforeImageUrl && afterImageUrl && beforeDate && afterDate && (
            <Card className="image-comparison-page__result">
              <h3>Dein Fortschritt</h3>
              <div className="image-comparison-page__dates">
                <span className="date-badge date-badge--before">
                  📅 {formatDate(beforeDate)}
                </span>
                <span className="date-badge date-badge--after">
                  📅 {formatDate(afterDate)}
                </span>
              </div>
              <div className="image-comparison-page__compare">
                <ImageCompare
                  beforeImage={beforeImageUrl}
                  afterImage={afterImageUrl}
                  beforeLabel={selectionMode === 'timeRange' ? `Vor ${timeValue} ${getTimeUnitLabel(timeUnit)}` : 'Vorher'}
                  afterLabel={selectionMode === 'timeRange' ? 'Aktuell' : 'Nachher'}
                />
              </div>
              <p className="image-comparison-page__hint">
                💡 Ziehe den Slider, um zwischen den Bildern zu wechseln
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );

  const tabs: Tab[] = [
    {
      id: 'charts',
      label: 'Diagramme',
      icon: '📈',
      content: chartsContent,
    },
    {
      id: 'image-compare',
      label: 'Bildvergleich',
      icon: '🖼️',
      content: imageComparisonContent,
    },
  ];

  return (
    <div className="analytics-page">
      <div className="container">
        <h2>Auswertung</h2>
        <Tabs tabs={tabs} activeTabId={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}
