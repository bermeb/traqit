/**
 * StatGrid Component
 * Container for statistics dashboard
 */

import { Entry } from '../../types';
import { Field } from '../../types';
import { calculateAllStatistics } from '../../utils/statistics';
import { StatCard } from './StatCard';
import './StatGrid.css';

export interface StatGridProps {
  entries: Entry[];
  fields: Field[];
}

export function StatGrid({ entries, fields }: StatGridProps) {
  const statistics = calculateAllStatistics(entries, fields);

  if (fields.length === 0) {
    return (
      <div className="stat-grid__empty">
        <p>Keine Felder definiert. Erstelle zuerst Felder unter "Felder".</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="stat-grid__empty">
        <p>Noch keine Einträge vorhanden. Füge deinen ersten Eintrag hinzu!</p>
      </div>
    );
  }

  return (
    <div className="stat-grid">
      <div className="stat-grid__cards">
        {statistics.map((stat) => {
          const field = fields.find((f) => f.id === stat.fieldId);
          if (!field) return null;

          // Determine if lower is better (e.g., weight, body fat)
          const inverse = field.name.toLowerCase().includes('gewicht') ||
                         field.name.toLowerCase().includes('fett') ||
                         field.name.toLowerCase().includes('weight') ||
                         field.name.toLowerCase().includes('fat');

          return (
            <StatCard
              key={stat.fieldId}
              statistics={stat}
              unit={field.unit}
              inverse={inverse}
            />
          );
        })}
      </div>
    </div>
  );
}
