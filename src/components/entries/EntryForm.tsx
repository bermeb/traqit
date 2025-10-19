/**
 * EntryForm Component
 * Dynamic form for creating/editing entries based on defined fields
 */

import { useState, FormEvent } from 'react';
import { Field, EntryFormData } from '../../types';
import { Button, Input, DatePicker } from '../common';
import { ImageUpload } from './ImageUpload';
import { useToast } from '../../hooks';
import './EntryForm.css';

interface EntryFormProps {
  fields: Field[];
  onSubmit: (data: EntryFormData) => Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<EntryFormData>;
  submitText?: string;
}

export function EntryForm({
  fields,
  onSubmit,
  onCancel,
  initialData,
  submitText = 'Speichern',
}: EntryFormProps) {
  const { showToast, ToastContainer } = useToast();

  // Ensure date is always a valid Date object
  const getValidDate = (date: Date | undefined): Date => {
    if (!date) return new Date();
    const dateObj = true ? date : new Date(date);
    return isNaN(dateObj.getTime()) ? new Date() : dateObj;
  };

  const [formData, setFormData] = useState<EntryFormData>({
    date: getValidDate(initialData?.date),
    values: initialData?.values || {},
    image: initialData?.image,
    notes: initialData?.notes || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that at least one field has a value
    if (Object.keys(formData.values).length === 0) {
      setError('Bitte fülle mindestens ein Feld aus.');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      // Reset form if adding new (no initialData)
      if (!initialData) {
        setFormData({
          date: new Date(),
          values: {},
          notes: '',
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleValueChange = (fieldId: string, value: string) => {
    if (value.trim() === '') {
      // Remove empty values
      const newValues = { ...formData.values };
      delete newValues[fieldId];
      setFormData({ ...formData, values: newValues });
    } else {
      setFormData({
        ...formData,
        values: {
          ...formData.values,
          [fieldId]: value,
        },
      });
    }
  };

  const handleImageSelect = (file: File) => {
    setFormData({ ...formData, image: file });
  };

  const handleImageRemove = () => {
    setFormData({ ...formData, image: undefined });
  };

  const handleImageError = (message: string) => {
    showToast({ message, type: 'warning' });
  };

  if (fields.length === 0) {
    return (
      <div className="entry-form__empty">
        <p>Keine Felder vorhanden.</p>
        <p>Erstelle zuerst Messfelder unter <a href="#/fields">Felder</a>.</p>
      </div>
    );
  }

  return (
    <form className="entry-form" onSubmit={handleSubmit}>
      <DatePicker
        label="Datum"
        value={formData.date}
        onChange={(date) => setFormData({ ...formData, date })}
        required
        fullWidth
      />

      <div className="entry-form__fields">
        <h3 className="entry-form__section-title">Messwerte</h3>
        {fields.map((field) => (
          <Input
            key={field.id}
            label={`${field.name} (${field.unit})`}
            type={field.type === 'number' ? 'number' : 'text'}
            step={field.type === 'number' ? 'any' : undefined}
            value={formData.values[field.id] || ''}
            onChange={(e) => handleValueChange(field.id, e.target.value)}
            placeholder={field.type === 'number' ? '0' : 'Wert eingeben'}
            fullWidth
          />
        ))}
      </div>

      <div className="entry-form__image">
        <h3 className="entry-form__section-title">Bild (optional)</h3>
        <ImageUpload
          onImageSelect={handleImageSelect}
          onImageRemove={handleImageRemove}
          onError={handleImageError}
          disabled={isSubmitting}
        />
      </div>

      <div className="entry-form__notes">
        <label htmlFor="notes" className="entry-form__label">
          Notizen (optional)
        </label>
        <textarea
          id="notes"
          className="entry-form__textarea"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Zusätzliche Notizen..."
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      {error && <div className="entry-form__error">{error}</div>}

      <div className="entry-form__actions">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Abbrechen
          </Button>
        )}
        <Button type="submit" variant="primary" loading={isSubmitting}>
          {submitText}
        </Button>
      </div>

      {ToastContainer}
    </form>
  );
}
