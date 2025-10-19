/**
 * TrendIndicator Component
 * Shows trend direction with icon and color
 */

import './TrendIndicator.css';

export interface TrendIndicatorProps {
  trend: 'up' | 'down' | 'stable';
  value?: string;
  inverse?: boolean; // If true, down is good (e.g., weight loss)
}

export function TrendIndicator({ trend, value, inverse = false }: TrendIndicatorProps) {
  const getTrendIcon = () => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendClass = () => {
    if (trend === 'stable') return 'trend-indicator--stable';

    // If inverse, down is good and up is bad
    if (inverse) {
      return trend === 'down' ? 'trend-indicator--positive' : 'trend-indicator--negative';
    }

    // Normal: up is good, down is bad
    return trend === 'up' ? 'trend-indicator--positive' : 'trend-indicator--negative';
  };

  return (
    <span className={`trend-indicator ${getTrendClass()}`}>
      <span className="trend-indicator__icon">{getTrendIcon()}</span>
      {value && <span className="trend-indicator__value">{value}</span>}
    </span>
  );
}
