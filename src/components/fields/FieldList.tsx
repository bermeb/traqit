/**
 * FieldList Component
 * Display list of all fields
 */

import { Field } from '../../types';
import { FieldCard } from './FieldCard';
import './FieldList.css';

interface FieldListProps {
  fields: Field[];
  onEdit: (field: Field) => void;
  onDelete: (id: string) => void;
}

export function FieldList({ fields, onEdit, onDelete }: FieldListProps) {
  if (fields.length === 0) {
    return (
      <div className="field-list-empty">
        <p>Keine Felder vorhanden.</p>
        <p className="field-list-empty__hint">
          Erstelle dein erstes Messfeld, um mit dem Tracking zu beginnen.
        </p>
      </div>
    );
  }

  return (
    <div className="field-list">
      {fields.map((field) => (
        <FieldCard key={field.id} field={field} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}
