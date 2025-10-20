/**
 * EntryCard Component
 * Display a single entry with values and image
 */

import { useState, useEffect } from 'react';
import { Entry, Field } from '../../types';
import { Card, Button } from '../common';
import { useImages } from '../../hooks';
import { useAppContext } from '../../context';
import { formatDate, formatValue } from '../../utils';
import './EntryCard.css';

interface EntryCardProps {
  entry: Entry;
  fields: Field[];
  onEdit: (entry: Entry) => void;
  onDelete: (id: string) => void;
}

export function EntryCard({ entry, fields, onEdit, onDelete }: EntryCardProps) {
  const { getImageUrl } = useImages();
  const { isImagesBlurred } = useAppContext();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLocallyUnblurred, setIsLocallyUnblurred] = useState(false);

  useEffect(() => {
    if (entry.imageId) {
      getImageUrl(entry.imageId).then(setImageUrl);
    }
  }, [entry.imageId, getImageUrl]);

  // Reset local unblur state when global blur is disabled
  useEffect(() => {
    if (!isImagesBlurred) {
      setIsLocallyUnblurred(false);
    }
  }, [isImagesBlurred]);

  const isImageBlurred = isImagesBlurred && !isLocallyUnblurred;

  const handleToggleBlur = () => {
    setIsLocallyUnblurred(!isLocallyUnblurred);
  };

  // Get field name and unit for each value
  const getFieldInfo = (fieldId: string) => {
    return fields.find((f) => f.id === fieldId);
  };

  const hasValues = Object.keys(entry.values).length > 0;

  return (
    <Card className="entry-card" padding="md">
      <div className="entry-card__header">
        <div className="entry-card__date">{formatDate(entry.date)}</div>
        <div className="entry-card__actions">
          <Button size="sm" variant="ghost" onClick={() => onEdit(entry)}>
            Bearbeiten
          </Button>
          <Button size="sm" variant="danger" onClick={() => onDelete(entry.id)}>
            Löschen
          </Button>
        </div>
      </div>

      {imageUrl && (
        <div className="entry-card__image">
          <img
            src={imageUrl}
            alt="Entry"
            className={isImageBlurred ? 'image-blurred' : ''}
            onClick={isImageBlurred ? handleToggleBlur : undefined}
          />
          {isImagesBlurred && (
            <button
              className="entry-card__image-toggle"
              onClick={handleToggleBlur}
            >
              {isLocallyUnblurred ? '🙈 Verstecken' : '👁️ Anzeigen'}
            </button>
          )}
        </div>
      )}

      {hasValues && (
        <div className="entry-card__values">
          {Object.entries(entry.values).map(([fieldId, value]) => {
            const field = getFieldInfo(fieldId);
            if (!field) return null;

            return (
              <div key={fieldId} className="entry-card__value">
                <span className="entry-card__value-label">{field.name}:</span>
                <span className="entry-card__value-data">
                  {formatValue(value, field.unit)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {entry.notes && (
        <div className="entry-card__notes">
          <strong>Notizen:</strong> {entry.notes}
        </div>
      )}
    </Card>
  );
}
