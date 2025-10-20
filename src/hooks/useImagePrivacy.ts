/**
 * useImagePrivacy Hook
 * Manages image privacy/blur state with localStorage persistence
 */

import { useState, useEffect } from 'react';

const STORAGE_KEY = 'traqit-image-privacy';

export function useImagePrivacy() {
  const [isBlurred, setIsBlurred] = useState<boolean>(() => {
    // Check localStorage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored !== null) {
      return stored === 'true';
    }

    // Default: images are not blurred
    return false;
  });

  useEffect(() => {
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, String(isBlurred));
  }, [isBlurred]);

  const toggleBlur = () => {
    setIsBlurred((prev) => !prev);
  };

  const enableBlur = () => setIsBlurred(true);
  const disableBlur = () => setIsBlurred(false);

  return {
    isBlurred,
    toggleBlur,
    enableBlur,
    disableBlur,
  };
}
