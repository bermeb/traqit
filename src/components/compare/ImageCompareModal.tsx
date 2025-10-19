/**
 * ImageCompareModal Component
 * Modal for selecting and comparing entry images
 */

import { useState, useEffect } from 'react';
import { Entry } from '../../types';
import { Modal, Button } from '../common';
import { ImageCompare } from './ImageCompare';
import { ImageSelector } from './ImageSelector';
import { formatDate } from '../../utils';
import { getImage } from '../../services/db';
import { blobToDataURL } from '../../services/storage';
import './ImageCompareModal.css';

export interface ImageCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: Entry[];
}

export function ImageCompareModal({ isOpen, onClose, entries }: ImageCompareModalProps) {
  const [beforeId, setBeforeId] = useState<string | null>(null);
  const [afterId, setAfterId] = useState<string | null>(null);
  const [imageUrls, setImageUrls] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load all images when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const loadImages = async () => {
      setLoading(true);
      const urls = new Map<string, string>();

      for (const entry of entries) {
        if (entry.imageId) {
          try {
            const storedImage = await getImage(entry.imageId);
            if (storedImage) {
              const url = await blobToDataURL(storedImage.blob);
              urls.set(entry.id, url);
            }
          } catch (error) {
            console.error('Failed to load image:', error);
          }
        }
      }

      setImageUrls(urls);
      setLoading(false);

      // Auto-select first two entries with images
      const entriesWithImages = entries.filter((e) => urls.has(e.id));
      if (entriesWithImages.length >= 2) {
        setBeforeId(entriesWithImages[0].id);
        setAfterId(entriesWithImages[1].id);
      } else if (entriesWithImages.length === 1) {
        setBeforeId(entriesWithImages[0].id);
      }
    };

    loadImages();
  }, [isOpen, entries]);

  // Clean up image URLs when modal closes
  useEffect(() => {
    if (!isOpen) {
      imageUrls.forEach((url) => URL.revokeObjectURL(url));
      setImageUrls(new Map());
      setBeforeId(null);
      setAfterId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const beforeEntry = entries.find((e) => e.id === beforeId);
  const afterEntry = entries.find((e) => e.id === afterId);
  const beforeUrl = beforeId ? imageUrls.get(beforeId) : null;
  const afterUrl = afterId ? imageUrls.get(afterId) : null;

  const canCompare = beforeUrl && afterUrl && beforeId !== afterId;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bilder vergleichen" size="lg">
      <div className="image-compare-modal">
        {loading ? (
          <div className="image-compare-modal__loading">
            <div className="loading-spinner" />
            <p>Lade Bilder...</p>
          </div>
        ) : (
          <>
            {canCompare ? (
              <div className="image-compare-modal__comparison">
                <ImageCompare
                  beforeImage={beforeUrl}
                  afterImage={afterUrl}
                  beforeLabel={`Vorher: ${formatDate(beforeEntry!.date)}`}
                  afterLabel={`Nachher: ${formatDate(afterEntry!.date)}`}
                />
              </div>
            ) : (
              <div className="image-compare-modal__placeholder">
                <p>Wähle zwei verschiedene Bilder zum Vergleichen aus</p>
              </div>
            )}

            <div className="image-compare-modal__selectors">
              <ImageSelector
                entries={entries}
                selectedId={beforeId}
                onSelect={setBeforeId}
                label="Vorher"
                imageUrls={imageUrls}
              />

              <ImageSelector
                entries={entries}
                selectedId={afterId}
                onSelect={setAfterId}
                label="Nachher"
                imageUrls={imageUrls}
              />
            </div>

            <div className="image-compare-modal__actions">
              <Button variant="secondary" onClick={onClose}>
                Schließen
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
