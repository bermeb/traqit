/**
 * DatePicker Component
 * Custom date picker with consistent behavior across browsers
 */

import { forwardRef } from 'react';
import ReactDatePicker, { registerLocale } from 'react-datepicker';
import { de } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import './DatePicker.css';

// Register German locale
registerLocale('de', de);

export interface DatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
  required?: boolean;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
  fullWidth?: boolean;
}

interface CustomInputProps {
  value?: string;
  onClick?: () => void;
  label?: string;
  disabled?: boolean;
}

// Custom input component
const CustomInput = forwardRef<HTMLButtonElement, CustomInputProps>(({ value, onClick, label, disabled }, ref) => (
  <div className={`date-picker-input ${disabled ? 'date-picker-input--disabled' : ''}`}>
    {label && <label className="date-picker-input__label">{label}</label>}
    <button
      type="button"
      className="date-picker-input__button"
      onClick={onClick}
      ref={ref}
      disabled={disabled}
    >
      <span className="date-picker-input__icon">📅</span>
      <span className="date-picker-input__value">{value}</span>
      <span className="date-picker-input__arrow">▼</span>
    </button>
  </div>
));

CustomInput.displayName = 'CustomInput';

export function DatePicker({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  minDate,
  maxDate,
  fullWidth = false,
}: DatePickerProps) {
  return (
    <div className={`date-picker ${fullWidth ? 'date-picker--full-width' : ''}`}>
      <ReactDatePicker
        selected={value}
        onChange={(date) => date && onChange(date)}
        dateFormat="dd.MM.yyyy"
        locale="de"
        customInput={<CustomInput label={label} disabled={disabled} />}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        required={required}
        showYearDropdown
        showMonthDropdown
        dropdownMode="select"
        popperPlacement="bottom-start"
        calendarStartDay={1} // Monday
      />
    </div>
  );
}
