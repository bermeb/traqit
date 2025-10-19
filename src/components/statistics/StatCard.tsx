/**
 * StatCard Component
 * Displays a single statistic with trend
 */

import { FieldStatistics, formatStatValue, formatChangeValue } from '../../utils/statistics';
import { TrendIndicator } from './TrendIndicator';
import './StatCard.css';

export interface StatCardProps {
  statistics: FieldStatistics;
  unit: string;
  inverse?: boolean;
}

export function StatCard({ statistics, unit, inverse = false }: StatCardProps) {
  const { fieldName, current, min, max, average, change7d, change30d, trend, dataPoints } =
    statistics;

  return (
    <div className="stat-card">
      <div className="stat-card__header">
        <h3 className="stat-card__title">{fieldName}</h3>
        <TrendIndicator trend={trend} inverse={inverse} />
      </div>

      <div className="stat-card__body">
        <div className="stat-card__main">
          <div className="stat-card__current">
            {current !== null ? (
              <>
                <span className="stat-card__value">{current.toFixed(1)}</span>
                <span className="stat-card__unit">{unit}</span>
              </>
            ) : (
              <span className="stat-card__empty">Keine Daten</span>
            )}
          </div>
        </div>

        <div className="stat-card__details">
          <div className="stat-card__row">
            <span className="stat-card__label">Durchschnitt:</span>
            <span className="stat-card__detail-value">{formatStatValue(average, unit)}</span>
          </div>

          <div className="stat-card__row">
            <span className="stat-card__label">Min / Max:</span>
            <span className="stat-card__detail-value">
              {formatStatValue(min, unit)} / {formatStatValue(max, unit)}
            </span>
          </div>

          {change7d !== null && (
            <div className="stat-card__row">
              <span className="stat-card__label">7 Tage:</span>
              <span className={`stat-card__change ${getChangeClass(change7d, inverse)}`}>
                {formatChangeValue(change7d, unit)}
              </span>
            </div>
          )}

          {change30d !== null && (
            <div className="stat-card__row">
              <span className="stat-card__label">30 Tage:</span>
              <span className={`stat-card__change ${getChangeClass(change30d, inverse)}`}>
                {formatChangeValue(change30d, unit)}
              </span>
            </div>
          )}

          <div className="stat-card__row">
            <span className="stat-card__label">Einträge:</span>
            <span className="stat-card__detail-value">{dataPoints}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function getChangeClass(change: number, inverse: boolean): string {
  if (Math.abs(change) < 0.01) return 'stat-card__change--neutral';

  if (inverse) {
    return change < 0 ? 'stat-card__change--positive' : 'stat-card__change--negative';
  }

  return change > 0 ? 'stat-card__change--positive' : 'stat-card__change--negative';
}
