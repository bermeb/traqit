/**
 * FieldCard Component
 * Display a single field with actions
 */

import { Field } from '../../types';
import { Card, Button } from '../common';
import './FieldCard.css';

interface FieldCardProps {
  field: Field;
  onEdit: (field: Field) => void;
  onDelete: (id: string) => void;
}

export function FieldCard({ field, onEdit, onDelete }: FieldCardProps) {
  return (
    <Card className="field-card" padding="md">
      <div className="field-card__content">
        <div className="field-card__info">
          <h3 className="field-card__name">{field.name}</h3>
          <span className="field-card__unit">{field.unit}</span>
          <span className="field-card__type">{field.type === 'number' ? 'Zahl' : 'Text'}</span>
        </div>
        <div className="field-card__actions">
          <Button size="sm" variant="ghost" onClick={() => onEdit(field)}>
            Bearbeiten
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(field.id)}>
            Löschen
          </Button>
        </div>
      </div>
    </Card>
  );
}
