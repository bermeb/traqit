/**
 * ImageComparisonPage
 * Compare images from different time periods
 */

import { useState, useMemo } from 'react';
import { useAppContext } from '../context';
import { useImages } from '../hooks';
import { ImageCompare } from '../components/compare';
import { Card, Button } from '../components/common';
import { formatDate } from '../utils';
import './ImageComparisonPage.css';

type TimeUnit = 'days' | 'months' | 'years';

export function ImageComparisonPage() {
  const { entries } = useAppContext();
  const { getImageUrl } = useImages();

  const [timeValue, setTimeValue] = useState<number>(3);
  const [timeUnit, setTimeUnit] = useState<TimeUnit>('months');
  const [beforeImageUrl, setBeforeImageUrl] = useState<string | null>(null);
  const [afterImageUrl, setAfterImageUrl] = useState<string | null>(null);
  const [beforeDate, setBeforeDate] = useState<Date | null>(null);
  const [afterDate, setAfterDate] = useState<Date | null>(null);

  // Get entries with images, sorted by date
  const entriesWithImages = useMemo(() => {
    return entries
      .filter((e) => e.imageId)
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [entries]);

  // Calculate target date
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

  // Find closest entry before target date
  const findBeforeEntry = () => {
    const targetDate = calculateTargetDate();

    // Find entry closest to target date (but not after today)
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

  // Find most recent entry
  const findAfterEntry = () => {
    return entriesWithImages.length > 0 ? entriesWithImages[0] : null;
  };

  const handleCompare = async () => {
    const beforeEntry = findBeforeEntry();
    const afterEntry = findAfterEntry();

    if (!beforeEntry || !afterEntry) {
      return;
    }

    // Load images
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

  return (
    <div className="image-comparison-page">
      <div className="container">
        <h2>Bildvergleich</h2>
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
                    beforeLabel={`Vor ${timeValue} ${getTimeUnitLabel(timeUnit)}`}
                    afterLabel="Aktuell"
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
    </div>
  );
}
