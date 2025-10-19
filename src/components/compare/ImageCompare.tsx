/**
 * ImageCompare Component
 * Side-by-side image comparison with slider
 */

import { useState } from 'react';
import './ImageCompare.css';

export interface ImageCompareProps {
  beforeImage: string;
  afterImage: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function ImageCompare({
  beforeImage,
  afterImage,
  beforeLabel = 'Vorher',
  afterLabel = 'Nachher',
}: ImageCompareProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number, container: HTMLDivElement) => {
    const rect = container.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    handleMove(e.clientX, e.currentTarget);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length === 0) return;
    handleMove(e.touches[0].clientX, e.currentTarget);
  };

  return (
    <div
      className="image-compare"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseUp}
    >
      {/* After Image (Full) */}
      <div className="image-compare__after">
        <img src={afterImage} alt={afterLabel} className="image-compare__img" />
        <div className="image-compare__label image-compare__label--after">{afterLabel}</div>
      </div>

      {/* Before Image (Clipped) */}
      <div
        className="image-compare__before"
        style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
      >
        <img src={beforeImage} alt={beforeLabel} className="image-compare__img" />
        <div className="image-compare__label image-compare__label--before">{beforeLabel}</div>
      </div>

      {/* Slider */}
      <div
        className="image-compare__slider"
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
      >
        <div className="image-compare__slider-line" />
        <div className="image-compare__slider-handle">
          <span className="image-compare__slider-arrow">◀</span>
          <span className="image-compare__slider-arrow">▶</span>
        </div>
      </div>
    </div>
  );
}
