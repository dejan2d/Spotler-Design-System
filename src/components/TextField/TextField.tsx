import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import './TextField.css';

type InputValue = InputHTMLAttributes<HTMLInputElement>['value'];

function hasContent(value: InputValue): boolean {
  return value != null && String(value).length > 0;
}

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. Required for accessibility — never rely on placeholder alone. */
  label: string;
  /**
   * Hides the label visually while keeping it as the accessible name
   * (Figma `Label` boolean = false).
   */
  hideLabel?: boolean;
  /** Marks the field optional; shows "(optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the field. */
  hint?: string;
  /**
   * Leading icon of the help / error message row (16×16, FontAwesome Duotone node —
   * `circle-info` in the Figma component). Rendered decorative.
   */
  hintIcon?: ReactNode;
  /** Error message. When set, the field renders in the error state. */
  error?: string;
  /** Leading icon (20×20, FontAwesome Duotone node). */
  iconStart?: ReactNode;
  /** Trailing icon (20×20, FontAwesome Duotone node). */
  iconEnd?: ReactNode;
  /** Status Chip slot shown before the value (pass a `<StatusChip>`). */
  statusChip?: ReactNode;
  /** Suffix text shown after the value, e.g. a unit such as "px" (Figma `Sufix`). */
  suffix?: ReactNode;
}

/**
 * Text Field — single-line text input with label, helper text, and validation.
 *
 * Figma: Inputs › Input Field (9396:14218), Size=Regular.
 * - Root: column, gap 4px. Label row: label (Paragraph - Semi Bold) + "(optional)"
 *   (Paragraph - Regular), gap 4px.
 * - Field: 40px tall, padding 8px 12px, gap 8px, radius 8px (Border/Large), 1px stroke.
 *   Slots in order: Icon Start (20px), Status Chip, value (Paragraph - Regular),
 *   Sufix (Paragraph - Regular), Icon End (20px).
 * - Help text row: 16px icon + Paragraph - Small, gap 4px.
 * - States: Default, Hover, Focused, Filled (has a value), Error, Disabled — each bound to
 *   the `Inputs/Regular Text Field/<state>-*` tokens (Disabled uses `Disabled/*`).
 *
 * The multi-line "Big Text Field" size is not implemented here.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hideLabel,
    optional,
    hint,
    hintIcon,
    error,
    iconStart,
    iconEnd,
    statusChip,
    suffix,
    id,
    disabled,
    className,
    value,
    defaultValue,
    onChange,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  // Filled state: controlled fields read `value`; uncontrolled fields track input events.
  const isControlled = value !== undefined;
  const [uncontrolledFilled, setUncontrolledFilled] = useState(() => hasContent(defaultValue));
  const filled = isControlled ? hasContent(value) : uncontrolledFilled;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledFilled(event.target.value.length > 0);
    onChange?.(event);
  };

  const classes = [
    'sds-textfield',
    filled && 'sds-textfield--filled',
    hasError && 'sds-textfield--error',
    disabled && 'sds-textfield--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label
        className={['sds-textfield__label', hideLabel && 'sds-textfield__label--hidden']
          .filter(Boolean)
          .join(' ')}
        htmlFor={fieldId}
      >
        {label}
        {optional && (
          <>
            {' '}
            <span className="sds-textfield__optional">(optional)</span>
          </>
        )}
      </label>
      <div className="sds-textfield__field">
        {iconStart && (
          <span className="sds-textfield__icon sds-textfield__icon--start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        {statusChip && <span className="sds-textfield__status-chip">{statusChip}</span>}
        <input
          ref={ref}
          id={fieldId}
          className="sds-textfield__input"
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? hintId : undefined}
          {...rest}
        />
        {suffix && <span className="sds-textfield__suffix">{suffix}</span>}
        {iconEnd && (
          <span className="sds-textfield__icon sds-textfield__icon--end" aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </div>
      {message && (
        <p className="sds-textfield__hint" id={hintId} role={hasError ? 'alert' : undefined}>
          {hintIcon && (
            <span className="sds-textfield__hint-icon" aria-hidden="true">
              {hintIcon}
            </span>
          )}
          <span className="sds-textfield__hint-text">{message}</span>
        </p>
      )}
    </div>
  );
});
