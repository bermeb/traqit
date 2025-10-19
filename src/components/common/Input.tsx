/**
 * Input Component
 * Reusable input field with label and error handling
 */

import { InputHTMLAttributes, forwardRef } from 'react';
import './Input.css';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, fullWidth = false, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={`input-group ${fullWidth ? 'input-group--full-width' : ''} ${className}`}>
        {label && (
          <label htmlFor={inputId} className="input__label">
            {label}
            {props.required && <span className="input__required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input ${error ? 'input--error' : ''}`}
          {...props}
        />
        {error && <span className="input__error">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
