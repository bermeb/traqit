/**
 * useToast Hook
 * Easy toast notifications
 */

import { useState, useCallback } from 'react';
import { Toast, ToastType } from '../components/common';

interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

export function useToast() {
  const [toast, setToast] = useState<ToastOptions | null>(null);

  const showToast = useCallback((options: ToastOptions) => {
    setToast(options);
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const ToastContainer = toast ? (
    <Toast
      message={toast.message}
      type={toast.type}
      duration={toast.duration}
      onClose={hideToast}
    />
  ) : null;

  return {
    showToast,
    hideToast,
    ToastContainer,
  };
}
