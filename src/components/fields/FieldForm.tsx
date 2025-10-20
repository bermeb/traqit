/**
 * FieldForm Component
 * Form for adding/editing fields
 */

import { useState, FormEvent } from 'react';
import { FieldFormData, FieldType, GoalDirection } from '../../types';
import { Button, Input } from '../common';
import './FieldForm.css';

interface FieldFormProps {
  onSubmit: (data: FieldFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: FieldFormData;
  submitText?: string;
}

export function FieldForm({
  onSubmit,
  onCancel,
  initialData,
  submitText = 'Hinzufügen',
}: FieldFormProps) {
  const [formData, setFormData] = useState<FieldFormData>(
    initialData || {
      name: '',
      unit: '',
      type: 'number',
      goalDirection: 'increase',
    }
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form if adding new
      if (!initialData) {
        setFormData({
          name: '',
          unit: '',
          type: 'number',
          goalDirection: 'increase',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="field-form" onSubmit={handleSubmit}>
      <Input
        label="Feldname"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="z.B. Gewicht, Körperfett, Bauchumfang"
        required
        fullWidth
      />

      <Input
        label="Einheit"
        value={formData.unit}
        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
        placeholder="z.B. kg, %, cm"
        required
        fullWidth
      />

      <div className="field-form__type">
        <label className="field-form__type-label">Datentyp</label>
        <div className="field-form__type-options">
          <label className="field-form__type-option">
            <input
              type="radio"
              name="type"
              value="number"
              checked={formData.type === 'number'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as FieldType })}
            />
            <span>Zahl</span>
          </label>
          <label className="field-form__type-option">
            <input
              type="radio"
              name="type"
              value="text"
              checked={formData.type === 'text'}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as FieldType })}
            />
            <span>Text</span>
          </label>
        </div>
      </div>

      <div className="field-form__goal">
        <label className="field-form__goal-label">Zielrichtung für Trends</label>
        <p className="field-form__goal-hint">Wann ist eine Veränderung positiv?</p>
        <div className="field-form__goal-options">
          <label className="field-form__goal-option">
            <input
              type="radio"
              name="goalDirection"
              value="increase"
              checked={formData.goalDirection === 'increase'}
              onChange={(e) => setFormData({ ...formData, goalDirection: e.target.value as GoalDirection })}
            />
            <span className="field-form__goal-option-text">
              <strong>Steigend ↑</strong>
              <small>Höher ist besser (z.B. Muskelumfang)</small>
            </span>
          </label>
          <label className="field-form__goal-option">
            <input
              type="radio"
              name="goalDirection"
              value="decrease"
              checked={formData.goalDirection === 'decrease'}
              onChange={(e) => setFormData({ ...formData, goalDirection: e.target.value as GoalDirection })}
            />
            <span className="field-form__goal-option-text">
              <strong>Fallend ↓</strong>
              <small>Niedriger ist besser (z.B. Gewicht, Körperfett)</small>
            </span>
          </label>
        </div>
      </div>

      {error && <div className="field-form__error">{error}</div>}

      <div className="field-form__actions">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Abbrechen
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {submitText}
        </Button>
      </div>
    </form>
  );
}
