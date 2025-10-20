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
  onMoveUp?: (id: string) => void;
  onMoveDown?: (id: string) => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export function FieldCard({
  field,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst = false,
  isLast = false
}: FieldCardProps) {
  return (
    <Card className="field-card" padding="md">
      <div className="field-card__content">
        <div className="field-card__info">
          <h3 className="field-card__name">{field.name}</h3>
          <span className="field-card__unit">{field.unit}</span>
          <span className="field-card__type">{field.type === 'number' ? 'Zahl' : 'Text'}</span>
        </div>
        <div className="field-card__actions">
          {onMoveUp && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMoveUp(field.id)}
              disabled={isFirst}
              aria-label="Nach oben verschieben"
            >
              ↑
            </Button>
          )}
          {onMoveDown && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onMoveDown(field.id)}
              disabled={isLast}
              aria-label="Nach unten verschieben"
            >
              ↓
            </Button>
          )}
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
