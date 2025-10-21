/**
 * ImageSelector Component
 * Select entries with images for comparison
 */

import { useState, useEffect } from 'react';
import { Entry } from '../../types';
import { useAppContext } from '../../context';
import { formatDate } from '../../utils';
import './ImageSelector.css';

export interface ImageSelectorProps {
  entries: Entry[];
  selectedId: string | null;
  onSelect: (entryId: string) => void;
  label: string;
  imageUrls: Map<string, string>;
  sortOrder?: 'oldest-first' | 'newest-first';
  disabledIds?: string[];
}

export function ImageSelector({
  entries,
  selectedId,
  onSelect,
  label,
  imageUrls,
  sortOrder = 'oldest-first',
  disabledIds = [],
}: ImageSelectorProps) {
  const { isImagesBlurred } = useAppContext();
  const [unblurredImages, setUnblurredImages] = useState<Set<string>>(new Set());

  // Filter entries that have images
  const entriesWithImages = entries.filter((entry) => entry.imageId && imageUrls.has(entry.id));

  // Sort entries based on sortOrder - create new array to ensure sort is applied
  const sortedEntries = entriesWithImages.slice().sort((a, b) => {
    const dateA = a.date.getTime();
    const dateB = b.date.getTime();
    const result = dateA - dateB;
    return sortOrder === 'oldest-first' ? result : -result;
  });

  // Reset unblurred images when global blur is disabled
  useEffect(() => {
    if (!isImagesBlurred) {
      setUnblurredImages(new Set());
    }
  }, [isImagesBlurred]);

  const toggleImageBlur = (entryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUnblurredImages((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(entryId)) {
        newSet.delete(entryId);
      } else {
        newSet.add(entryId);
      }
      return newSet;
    });
  };

  if (sortedEntries.length === 0) {
    return (
      <div className="image-selector">
        <h4 className="image-selector__label">{label}</h4>
        <div className="image-selector__empty">
          Keine Einträge mit Bildern gefunden
        </div>
      </div>
    );
  }

  return (
    <div className="image-selector">
      <h4 className="image-selector__label">{label}</h4>
      <div className="image-selector__grid">
        {sortedEntries.map((entry) => {
          const imageUrl = imageUrls.get(entry.id);
          if (!imageUrl) return null;

          const isSelected = entry.id === selectedId;
          const isBlurred = isImagesBlurred && !unblurredImages.has(entry.id);
          const isDisabled = disabledIds.includes(entry.id);

          return (
            <button
              key={entry.id}
              className={`image-selector__item ${isSelected ? 'image-selector__item--selected' : ''} ${isDisabled ? 'image-selector__item--disabled' : ''}`}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  e.stopPropagation();
                  return;
                }
                onSelect(entry.id);
              }}
              onMouseDown={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
              type="button"
              disabled={isDisabled}
              aria-disabled={isDisabled}
            >
              <div className="image-selector__image">
                <img
                  src={imageUrl}
                  alt={`Entry from ${formatDate(entry.date)}`}
                  className={isBlurred ? 'image-blurred' : ''}
                />
                {isImagesBlurred && !isDisabled && (
                  <button
                    className="image-selector__toggle"
                    onClick={(e) => toggleImageBlur(entry.id, e)}
                    type="button"
                  >
                    {unblurredImages.has(entry.id) ? '🙈' : '👁️'}
                  </button>
                )}
              </div>
              <div className="image-selector__date">{formatDate(entry.date)}</div>
              {isSelected && (
                <div className="image-selector__check">✓</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
