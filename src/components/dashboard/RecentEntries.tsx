/**
 * RecentEntries Component
 * Display recent measurement entries on dashboard
 */

import { Entry, Field } from '../../types';
import { Card } from '../common';
import { formatDate } from '../../utils';
import './RecentEntries.css';

interface RecentEntriesProps {
  entries: Entry[];
  fields: Field[];
}

export function RecentEntries({ entries, fields }: RecentEntriesProps) {
  if (entries.length === 0) {
    return (
      <Card className="recent-entries recent-entries--empty">
        <p>Noch keine Einträge vorhanden.</p>
      </Card>
    );
  }

  return (
    <div className="recent-entries">
      {entries.map((entry) => {
        const entryValues = Object.entries(entry.values)
          .map(([fieldId, value]) => {
            const field = fields.find((f) => f.id === fieldId);
            return field ? { field, value } : null;
          })
          .filter((item): item is { field: Field; value: string } => item !== null);

        return (
          <Card key={entry.id} className="recent-entry">
            <div className="recent-entry__header">
              <div className="recent-entry__date">
                <span className="recent-entry__date-icon">📅</span>
                <span>{formatDate(entry.date)}</span>
              </div>
              {entry.imageId && (
                <span className="recent-entry__badge">
                  📸 Mit Bild
                </span>
              )}
            </div>

            <div className="recent-entry__values">
              {entryValues.map(({ field, value }) => (
                <div key={field.id} className="recent-entry__value">
                  <span className="recent-entry__field">{field.name}</span>
                  <span className="recent-entry__number">
                    {value} <span className="recent-entry__unit">{field.unit}</span>
                  </span>
                </div>
              ))}
            </div>

            {entry.notes && (
              <div className="recent-entry__notes">
                <span className="recent-entry__notes-icon">💬</span>
                <span className="recent-entry__notes-text">{entry.notes}</span>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
