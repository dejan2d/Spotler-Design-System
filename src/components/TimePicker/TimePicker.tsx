import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react';
import './TimePicker.css';

const pad = (n: number) => String(n).padStart(2, '0');

/** Hours 00–23 for the left column. */
const HOURS: string[] = Array.from({ length: 24 }, (_, h) => pad(h));

/** Minutes for the right column at the given step (1–60). */
function buildMinutes(step: number): string[] {
  const safe = Number.isFinite(step) && step >= 1 && step <= 60 ? Math.floor(step) : 1;
  const out: string[] = [];
  for (let m = 0; m < 60; m += safe) out.push(pad(m));
  return out;
}

/** Split "HH:MM" into its parts; anything unparsable yields nulls. */
function parseTime(value: string | undefined): { hour: string | null; minute: string | null } {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value ?? '');
  if (!match) return { hour: null, minute: null };
  return { hour: pad(Number(match[1])), minute: match[2] };
}

export interface TimePickerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visible label (Paragraph - Semi Bold). Required for accessibility — never rely on placeholder alone. */
  label: string;
  /** Selected time as "HH:MM" (24h). Omit for uncontrolled use. */
  value?: string;
  /** Called with "HH:MM" when an hour or a minute is chosen. */
  onChange?: (time: string) => void;
  /**
   * Minute granularity of the minutes column. Figma shows consecutive minutes.
   * @default 1
   */
  step?: number;
  /** Marks the field optional; shows "(optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the field. */
  hint?: string;
  /** Error message. When set, the field renders in the error state. */
  error?: string;
  /** Placeholder shown when no time is selected. */
  placeholder?: string;
  /** Trailing clock icon slot (FontAwesome Duotone node, 20×20). Rendered inside an `aria-hidden` wrapper. */
  icon?: ReactNode;
  /** Disables the field and prevents the picker from opening. */
  disabled?: boolean;
  /** Id for the input. Auto-generated when omitted; also wires label + hint associations. */
  id?: string;
  /** Native form field name for the underlying input. */
  name?: string;
}

/**
 * Time Picker — a pick-only time field that opens a two-column hours | minutes picker.
 *
 * Picker — Figma "Time picker" 1302:13533 (page 29:7): row, padding 16px 8px, gap 4px, radius 4px,
 * Monochrome/White; an hours column and a minutes column (5 visible slots each, gap 8px, scrolls)
 * separated by a vertical Divider. "single time slot" set 1302:13503: padding 12px, radius 4px,
 * Paragraph - Regular; Default `Time Picker/default-*`, Hover `hover-*`, Selected `selected-*`.
 *
 * Field — Figma has no time-field design, so it follows Inputs › Input Field 9396:14218,
 * Size=Regular (label Paragraph - Semi Bold, 40px, padding 8px 12px, radius 8px) with the
 * `Inputs/Regular Text Field/<state>-*` tokens. Typing a time is intentionally not supported.
 * Choosing an hour keeps the picker open; choosing a minute closes it.
 *
 * The panel has no shadow (none in Figma). The keyboard focus rings are not designed in Figma;
 * they are kept for accessibility.
 */
export const TimePicker = forwardRef<HTMLInputElement, TimePickerProps>(function TimePicker(
  {
    label,
    value,
    onChange,
    step = 1,
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
  const popoverId = `${fieldId}-popover`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState('');
  const current = isControlled ? value : internal;
  const { hour, minute } = parseTime(current);

  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const hoursRef = useRef<HTMLUListElement>(null);
  const minutesRef = useRef<HTMLUListElement>(null);
  const minutes = buildMinutes(step);

  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const close = (restoreFocus: boolean) => {
    setOpen(false);
    if (restoreFocus) inputRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // On open: scroll both columns to their selected slot and focus the hours column.
  useEffect(() => {
    if (!open) return;
    [hoursRef.current, minutesRef.current].forEach((column) => {
      const active = column?.querySelector<HTMLLIElement>('[tabindex="0"]');
      if (column && active) column.scrollTop = active.offsetTop - column.offsetTop;
    });
    hoursRef.current?.querySelector<HTMLLIElement>('[tabindex="0"]')?.focus();
  }, [open]);

  const commit = (next: string) => {
    if (!isControlled) setInternal(next);
    onChange?.(next);
  };

  const pickHour = (h: string) => commit(`${h}:${minute ?? '00'}`);
  const pickMinute = (m: string) => {
    commit(`${hour ?? '00'}:${m}`);
    close(true);
  };

  /** Roving focus inside a column: arrows, Home / End; Enter / Space selects. */
  const handleOptionKey = (
    event: ReactKeyboardEvent<HTMLLIElement>,
    index: number,
    items: string[],
    pick: (item: string) => void,
  ) => {
    let next: number | null = null;
    switch (event.key) {
      case 'ArrowDown':
        next = Math.min(items.length - 1, index + 1);
        break;
      case 'ArrowUp':
        next = Math.max(0, index - 1);
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        pick(items[index]);
        return;
      default:
        return;
    }
    event.preventDefault();
    const column = event.currentTarget.parentElement;
    const target = column?.children[next] as HTMLElement | undefined;
    target?.focus();
  };

  const renderColumn = (
    items: string[],
    selected: string | null,
    columnLabel: string,
    columnRef: typeof hoursRef,
    pick: (item: string) => void,
  ) => {
    const activeIndex = Math.max(0, selected ? items.indexOf(selected) : 0);
    return (
      <ul ref={columnRef} className="sds-time-picker__column" role="listbox" aria-label={columnLabel}>
        {items.map((item, index) => {
          const isSelected = item === selected;
          return (
            <li
              key={item}
              role="option"
              aria-selected={isSelected}
              tabIndex={index === activeIndex ? 0 : -1}
              className={
                isSelected
                  ? 'sds-time-picker__option sds-time-picker__option--selected'
                  : 'sds-time-picker__option'
              }
              onClick={() => pick(item)}
              onKeyDown={(e) => handleOptionKey(e, index, items, pick)}
            >
              {item}
            </li>
          );
        })}
      </ul>
    );
  };

  const classes = [
    'sds-time-picker',
    current && 'sds-time-picker--filled',
    hasError && 'sds-time-picker--error',
    disabled && 'sds-time-picker--disabled',
    open && 'sds-time-picker--open',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const toggle = () => {
    if (!disabled) setOpen((o) => !o);
  };

  return (
    <div className={classes} ref={rootRef} {...rest}>
      <label className="sds-time-picker__label" htmlFor={fieldId}>
        {label}
        {optional && <span className="sds-time-picker__optional"> (optional)</span>}
      </label>
      <div className="sds-time-picker__field">
        <input
          ref={setRefs}
          id={fieldId}
          name={name}
          className="sds-time-picker__input"
          type="text"
          inputMode="numeric"
          readOnly
          disabled={disabled}
          value={current ?? ''}
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
          className="sds-time-picker__trigger"
          aria-label="Open time picker"
          aria-haspopup="dialog"
          aria-expanded={open}
          disabled={disabled}
          tabIndex={-1}
          onClick={toggle}
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
        <div className="sds-time-picker__popover" id={popoverId} role="dialog" aria-label={label}>
          {renderColumn(HOURS, hour, 'Hours', hoursRef, pickHour)}
          <span className="sds-time-picker__divider" aria-hidden="true" />
          {renderColumn(minutes, minute, 'Minutes', minutesRef, pickMinute)}
        </div>
      )}
    </div>
  );
});
