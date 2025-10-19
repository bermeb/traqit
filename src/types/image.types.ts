/**
 * Image Type Definitions
 * Defines the structure for stored images
 */

export interface StoredImage {
  id: string;              // UUID
  entryId: string;         // Reference to entry
  blob: Blob;              // Image data as Blob
  mimeType: string;        // e.g., "image/jpeg", "image/png"
  size: number;            // File size in bytes
  uploadedAt: Date;        // Upload timestamp
}

export interface ImageUploadOptions {
  maxWidth?: number;       // Max width for compression
  maxHeight?: number;      // Max height for compression
  quality?: number;        // JPEG quality (0-1)
}

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}
