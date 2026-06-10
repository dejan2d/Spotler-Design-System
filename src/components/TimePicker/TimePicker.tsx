import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './TimePicker.css';

/** Generate "HH:MM" options across 24h at the given minute step. */
function buildOptions(step: number): string[] {
  const out: string[] = [];
  for (let h = 0; h < 24; h += 1) {
    for (let m = 0; m < 60; m += step) {
      out.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    }
  }
  return out;
}

export interface TimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visible label. Required for accessibility — never rely on placeholder alone. */
  label: string;
  /** Selected time as "HH:MM" (24h). */
  value?: string;
  /** Called when an option is chosen. */
  onChange?: (time: string) => void;
  /** Minute granularity for the option list. Default 30. */
  step?: number;
  /** Marks the field optional; shows "(optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the field. */
  hint?: string;
  /** Error message. When set, the field renders in the error state. */
  error?: string;
  /** Placeholder shown when no time is selected. */
  placeholder?: string;
  /** Trailing clock icon slot (FontAwesome Duotone node). Rendered inside an `aria-hidden` wrapper. */
  icon?: ReactNode;
  /** Disables the field and prevents the option list from opening. */
  disabled?: boolean;
  /** Id for the input. Auto-generated when omitted; also wires label + hint associations. */
  id?: string;
  /** Native form field name for the underlying input. */
  name?: string;
}

/**
 * Time Picker — time input field with a clock icon that opens a scrollable option list.
 * Spec: references/components/time-picker.md (Time Picker + Inputs Regular Text Field tokens).
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  {
    label,
    value,
    onChange,
    step = 30,
    optional,
    hint,
    error,
    placeholder = 'Select a time',
    icon,
    disabled,
    id,
    className,
    name,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const listboxId = `${fieldId}-listbox`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const options = buildOptions(step);

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
    'sds-time-picker',
    hasError && 'sds-time-picker--error',
    disabled && 'sds-time-picker--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes} ref={rootRef} {...rest}>
      <label className="sds-time-picker__label" htmlFor={fieldId}>
        {label}
        {optional && <span className="sds-time-picker__optional"> (optional)</span>}
      </label>
      <div className="sds-time-picker__field">
        <input
          ref={ref}
          id={fieldId}
          name={name}
          className="sds-time-picker__input"
          type="text"
          inputMode="numeric"
          readOnly
          disabled={disabled}
          value={value ?? ''}
          placeholder={placeholder}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? hintId : undefined}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listboxId : undefined}
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
          className="sds-time-picker__trigger"
          aria-label="Open time options"
          aria-haspopup="listbox"
          aria-expanded={open}
          disabled={disabled}
          tabIndex={-1}
          onClick={() => !disabled && setOpen((o) => !o)}
        >
          <span className="sds-time-picker__icon" aria-hidden="true">
            {icon}
          </span>
        </button>
      </div>
      {message && (
        <p className="sds-time-picker__hint" id={hintId}>
          {message}
        </p>
      )}
      {open && (
        <ul className="sds-time-picker__listbox" id={listboxId} role="listbox" aria-label={label}>
          {options.map((opt) => {
            const selected = opt === value;
            return (
              <li
                key={opt}
                role="option"
                aria-selected={selected}
                className={
                  selected
                    ? 'sds-time-picker__option sds-time-picker__option--selected'
                    : 'sds-time-picker__option'
                }
                onClick={() => {
                  onChange?.(opt);
                  setOpen(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onChange?.(opt);
                    setOpen(false);
                  }
                }}
                tabIndex={0}
              >
                {opt}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
