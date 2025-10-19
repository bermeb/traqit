/**
 * ImageUpload Component
 * Drag & Drop image upload with preview
 */

import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import './ImageUpload.css';

interface ImageUploadProps {
  onImageSelect: (file: File) => void;
  currentImage?: string; // URL for preview
  onImageRemove?: () => void;
  onError?: (message: string) => void;
  disabled?: boolean;
}

export function ImageUpload({
  onImageSelect,
  currentImage,
  onImageRemove,
  onError,
  disabled = false,
}: ImageUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = (file: File) => {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      onError?.('Bitte wähle eine Bilddatei aus.');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Call parent callback
    onImageSelect(file);
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageRemove?.();
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="image-upload">
      {previewUrl ? (
        <div className="image-upload__preview">
          <img src={previewUrl} alt="Preview" className="image-upload__preview-img" />
          {!disabled && (
            <button
              type="button"
              className="image-upload__remove"
              onClick={handleRemoveImage}
              aria-label="Bild entfernen"
            >
              ✕
            </button>
          )}
        </div>
      ) : (
        <div
          className={`image-upload__dropzone ${isDragging ? 'image-upload__dropzone--dragging' : ''} ${disabled ? 'image-upload__dropzone--disabled' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="image-upload__icon">📷</div>
          <p className="image-upload__text">
            {isDragging ? 'Bild hier ablegen' : 'Klicken oder Bild hierher ziehen'}
          </p>
          <p className="image-upload__hint">JPG, PNG oder WebP</p>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="image-upload__input"
        disabled={disabled}
      />
    </div>
  );
}
