import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Calendar } from '../Calendar';
import './DatePicker.css';

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface DatePickerProps {
  /** Visible label. Required for accessibility — never rely on placeholder alone. */
  label: string;
  /** Currently selected date. */
  value?: Date | null;
  /** Called when a day is chosen in the calendar. */
  onChange?: (date: Date) => void;
  /** Marks the field optional; shows "(optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the field. */
  hint?: string;
  /** Error message. When set, the field renders in the error state. */
  error?: string;
  /** Placeholder shown when no date is selected. */
  placeholder?: string;
  /** Trailing calendar icon (FontAwesome Duotone node). Falls back to a default glyph. */
  icon?: ReactNode;
  disabled?: boolean;
  id?: string;
  className?: string;
  name?: string;
}

/**
 * Date Picker — date input field that opens the Calendar in a popover.
 * Spec: references/components/date-picker.md (Date Picker + Inputs Regular Text Field tokens).
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    label,
    value,
    onChange,
    optional,
    hint,
    error,
    placeholder = 'Select a date',
    icon,
    disabled,
    id,
    className,
    name,
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const popoverId = `${fieldId}-popover`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const classes = [
    'sds-date-picker',
    hasError && 'sds-date-picker--error',
    disabled && 'sds-date-picker--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const display = value ? formatDate(value) : '';

  return (
    <div className={classes} ref={rootRef}>
      <label className="sds-date-picker__label" htmlFor={fieldId}>
        {label}
        {optional && <span className="sds-date-picker__optional"> (optional)</span>}
      </label>
      <div className="sds-date-picker__field">
        <input
          ref={ref}
          id={fieldId}
          name={name}
          className="sds-date-picker__input"
          type="text"
          inputMode="numeric"
          readOnly
          disabled={disabled}
          value={display}
          placeholder={placeholder}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? hintId : undefined}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-controls={open ? popoverId : undefined}
          onClick={() => !disabled && setOpen((o) => !o)}
          onKeyDown={(e) => {
            if (disabled) return;
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
              e.preventDefault();
              setOpen(true);
            }
          }}
        />
        <button
          type="button"
          className="sds-date-picker__trigger"
          aria-label="Open calendar"
          aria-haspopup="dialog"
          aria-expanded={open}
          disabled={disabled}
          tabIndex={-1}
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          <span className="sds-date-picker__icon" aria-hidden="true">
            {icon ?? '📅'}
          </span>
        </button>
      </div>
      {message && (
        <p className="sds-date-picker__hint" id={hintId}>
          {message}
        </p>
      )}
      {open && (
        <div className="sds-date-picker__popover" id={popoverId} role="dialog" aria-label={label}>
          <Calendar
            month={value ?? undefined}
            value={value ?? null}
            onSelect={(date) => {
              onChange?.(date);
              setOpen(false);
            }}
          />
        </div>
      )}
    </div>
  );
});
