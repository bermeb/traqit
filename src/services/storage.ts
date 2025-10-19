/**
 * Image Storage Service
 * Handles image compression, conversion, and storage
 */

import { validateImageFile } from '../utils';
import { ImageUploadOptions, ImageValidationResult } from '../types';
import { MAX_IMAGE_WIDTH, MAX_IMAGE_HEIGHT, IMAGE_QUALITY } from '../utils';

/**
 * Compress an image file
 */
export async function compressImage(
  file: File,
  options: ImageUploadOptions = {}
): Promise<Blob> {
  const {
    maxWidth = MAX_IMAGE_WIDTH,
    maxHeight = MAX_IMAGE_HEIGHT,
    quality = IMAGE_QUALITY,
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Create canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to create blob'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convert blob to data URL
 */
export function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result as string);
    };

    reader.onerror = () => {
      reject(new Error('Failed to read blob'));
    };

    reader.readAsDataURL(blob);
  });
}

/**
 * Convert data URL to blob
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new Blob([u8arr], { type: mime });
}

/**
 * Validate and prepare image for upload
 */
export async function prepareImageForUpload(
  file: File,
  options?: ImageUploadOptions
): Promise<{ blob: Blob; mimeType: string; error?: string }> {
  // Validate file
  const validation: ImageValidationResult = validateImageFile(file);
  if (!validation.valid) {
    return {
      blob: new Blob(),
      mimeType: '',
      error: validation.error,
    };
  }

  try {
    // Compress image
    const blob = await compressImage(file, options);

    return {
      blob,
      mimeType: 'image/jpeg', // Always convert to JPEG for consistency
    };
  } catch (error) {
    return {
      blob: new Blob(),
      mimeType: '',
      error: error instanceof Error ? error.message : 'Fehler beim Verarbeiten des Bildes',
    };
  }
}

/**
 * Create object URL from blob (for displaying images)
 */
export function createObjectURL(blob: Blob): string {
  return URL.createObjectURL(blob);
}

/**
 * Revoke object URL to free memory
 */
export function revokeObjectURL(url: string): void {
  URL.revokeObjectURL(url);
}

/**
 * Get image dimensions from file
 */
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
        });
      };

      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsDataURL(file);
  });
}
