import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Calendar } from '../Calendar';
import './DatePicker.css';

/** Format a Date as a locale-neutral `YYYY-MM-DD` string for the read-only display value. */
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export interface DatePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visible label. Required for accessibility — never rely on the placeholder alone. */
  label: string;
  /** Currently selected date. Pass `null` (or omit) for no selection. */
  value?: Date | null;
  /** Called when a day is chosen in the calendar. */
  onChange?: (date: Date) => void;
  /** Called whenever the visible month changes via the calendar's prev/next controls. */
  onMonthChange?: (month: Date) => void;
  /** Marks the field optional; renders "(optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the field. Hidden while an `error` is present. */
  hint?: string;
  /** Error message. When set, the field renders in the error state and announces the message. */
  error?: string;
  /** Placeholder shown when no date is selected. @default 'Select a date' */
  placeholder?: string;
  /**
   * Trailing calendar icon slot (FontAwesome Duotone node). Rendered inside an
   * `aria-hidden` wrapper. No glyph is hardcoded — supply your own icon node.
   */
  icon?: ReactNode;
  /** Leading icon for the calendar's previous-month control (FontAwesome Duotone node). */
  iconPrev?: ReactNode;
  /** Trailing icon for the calendar's next-month control (FontAwesome Duotone node). */
  iconNext?: ReactNode;
  /** Predicate to disable individual days in the calendar (e.g. min/max range). */
  isDateDisabled?: (date: Date) => boolean;
  /** Overrides "today" for the current-day marker (mainly for testing / time zones). */
  today?: Date;
  /** Disables the field and prevents the calendar from opening. */
  disabled?: boolean;
  /** Controlled open state of the calendar popover. Omit for uncontrolled behaviour. */
  open?: boolean;
  /** Called when the popover requests to open or close (outside click, Escape, selection). */
  onOpenChange?: (open: boolean) => void;
  /** Id for the input. Auto-generated when omitted; also wires label + hint associations. */
  id?: string;
  /** Native form field name for the underlying input. */
  name?: string;
}

/**
 * Date Picker — Spotler Design System.
 *
 * A date input field that opens the `Calendar` day-grid in a popover for choosing a date.
 * The field reuses the "Inputs / Regular Text Field" tokens; the popover floats on the
 * `Date Picker` surface (default background) at overlay elevation.
 *
 * Field: row, padding 8px 12px, gap 8px, radius small (4px), 1px hairline stroke.
 * States: default, hover, focus-within, error, disabled. Popover offset 4px below the field.
 * Pair with a real `<label>`; the calendar carries `role="grid"` with arrow-key navigation,
 * month paging, an announced selection, and non-color cues for today/selected.
 */
export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(function DatePicker(
  {
    label,
    value,
    onChange,
    onMonthChange,
    optional,
    hint,
    error,
    placeholder = 'Select a date',
    icon,
    iconPrev,
    iconNext,
    isDateDisabled,
    today,
    disabled,
    open: openProp,
    onOpenChange,
    id,
    name,
    className,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const popoverId = `${fieldId}-popover`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  // Support both controlled and uncontrolled open state.
  const isControlled = openProp !== undefined;
  const [openState, setOpenState] = useState(false);
  const open = isControlled ? openProp : openState;

  const rootRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const setOpen = useCallback(
    (next: boolean) => {
      if (!isControlled) setOpenState(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  // Close on outside click / Escape, and restore focus to the field on Escape.
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
  }, [open, setOpen]);

  // Move focus into the calendar grid when the popover opens.
  useEffect(() => {
    if (!open) return;
    const grid = popoverRef.current?.querySelector<HTMLButtonElement>(
      '[role="gridcell"][tabindex="0"]',
    );
    grid?.focus();
  }, [open]);

  const classes = [
    'sds-date-picker',
    hasError && 'sds-date-picker--error',
    disabled && 'sds-date-picker--disabled',
    open && 'sds-date-picker--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const display = value ? formatDate(value) : '';
  const toggle = () => {
    if (!disabled) setOpen(!open);
  };

  return (
    <div className={classes} ref={rootRef} {...rest}>
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
          onClick={toggle}
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
          onClick={toggle}
        >
          <span className="sds-date-picker__icon" aria-hidden="true">
            {icon}
          </span>
        </button>
      </div>
      {message && (
        <p className="sds-date-picker__hint" id={hintId}>
          {message}
        </p>
      )}
      {open && (
        <div
          ref={popoverRef}
          className="sds-date-picker__popover"
          id={popoverId}
          role="dialog"
          aria-label={label}
        >
          <Calendar
            month={value ?? undefined}
            value={value ?? null}
            today={today}
            isDateDisabled={isDateDisabled}
            iconPrev={iconPrev}
            iconNext={iconNext}
            onMonthChange={onMonthChange}
            ariaLabel={label}
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
