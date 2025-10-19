/**
 * useImages Hook
 * Manages image operations
 */

import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { StoredImage, ImageUploadOptions } from '../types';
import { useAppContext } from '../context';
import * as db from '../services/db';
import { prepareImageForUpload, createObjectURL } from '../services/storage';

export function useImages() {
  const { setError } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Upload an image
   */
  const uploadImage = useCallback(
    async (file: File, entryId: string, options?: ImageUploadOptions): Promise<string> => {
      setLoading(true);
      setLocalError(null);
      setUploadProgress(0);

      try {
        // Prepare image (compress, validate)
        const { blob, mimeType, error } = await prepareImageForUpload(file, options);

        if (error) {
          throw new Error(error);
        }

        setUploadProgress(50);

        // Create stored image
        const imageId = uuidv4();
        const storedImage: StoredImage = {
          id: imageId,
          entryId,
          blob,
          mimeType,
          size: blob.size,
          uploadedAt: new Date(),
        };

        // Save to DB
        await db.saveImage(storedImage);

        setUploadProgress(100);

        return imageId;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Hochladen';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
        setTimeout(() => setUploadProgress(0), 500);
      }
    },
    [setError]
  );

  /**
   * Get image URL for display
   */
  const getImageUrl = useCallback(async (imageId: string): Promise<string | null> => {
    try {
      const image = await db.getImage(imageId);
      if (!image) return null;

      return createObjectURL(image.blob);
    } catch (err) {
      console.error('Failed to get image URL:', err);
      return null;
    }
  }, []);

  /**
   * Get image by entry ID
   */
  const getImageByEntryId = useCallback(async (entryId: string): Promise<StoredImage | null> => {
    try {
      const image = await db.getImageByEntryId(entryId);
      return image || null;
    } catch (err) {
      console.error('Failed to get image:', err);
      return null;
    }
  }, []);

  /**
   * Delete an image
   */
  const deleteImage = useCallback(
    async (imageId: string): Promise<void> => {
      setLoading(true);
      setLocalError(null);

      try {
        await db.deleteImage(imageId);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Fehler beim Löschen';
        setLocalError(errorMsg);
        setError(errorMsg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [setError]
  );

  return {
    uploadImage,
    getImageUrl,
    getImageByEntryId,
    deleteImage,
    loading,
    uploadProgress,
    error: localError,
  };
}
