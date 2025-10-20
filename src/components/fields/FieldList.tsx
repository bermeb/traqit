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
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
}

export function FieldList({ fields, onEdit, onDelete, onMoveUp, onMoveDown }: FieldListProps) {
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
      {fields.map((field, index) => (
        <FieldCard
          key={field.id}
          field={field}
          onEdit={onEdit}
          onDelete={onDelete}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          isFirst={index === 0}
          isLast={index === fields.length - 1}
        />
      ))}
    </div>
  );
}
