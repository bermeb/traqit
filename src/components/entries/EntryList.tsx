/**
 * EntryList Component
 * Display list of entries grouped by date
 */

import { Entry, Field } from '../../types';
import { EntryCard } from './EntryCard';
import './EntryList.css';

interface EntryListProps {
  entries: Entry[];
  fields: Field[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export function EntryList({ entries, fields, onEdit, onDelete }: EntryListProps) {
  if (entries.length === 0) {
    return (
      <div className="entry-list-empty">
        <p>Keine Einträge vorhanden.</p>
        <p className="entry-list-empty__hint">
          Erstelle deinen ersten Eintrag, um mit dem Tracking zu beginnen.
        </p>
      </div>
    );
  }

  // Sort entries by date (newest first)
  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="entry-list">
      {sortedEntries.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          fields={fields}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
