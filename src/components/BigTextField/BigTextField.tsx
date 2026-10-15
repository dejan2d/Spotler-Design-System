import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, ReactNode, TextareaHTMLAttributes } from 'react';
import './BigTextField.css';

type TextareaValue = TextareaHTMLAttributes<HTMLTextAreaElement>['value'];

function hasContent(value: TextareaValue): boolean {
  return value != null && String(value).length > 0;
}

export interface BigTextFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Visible label. Required for accessibility — never rely on placeholder alone. */
  label: string;
  /**
   * Hides the label visually while keeping it as the accessible name
   * (Figma `Label` boolean = false).
   */
  hideLabel?: boolean;
  /** Marks the field optional; shows "(optional)" next to the label (Figma `Optional`). */
  optional?: boolean;
  /** Helper text shown below the field (Figma `Help Text`). */
  hint?: string;
  /**
   * Leading icon of the help / error message row (16×16, FontAwesome Duotone node —
   * `circle-info` in the Figma component). Rendered decorative.
   */
  hintIcon?: ReactNode;
  /** Error message. When set, the field renders in the Error state. */
  error?: string;
  /** Leading icon, top-aligned (20×20, FontAwesome Duotone node — Figma `Icon Start`). */
  iconStart?: ReactNode;
  /** Trailing icon, top-aligned (20×20, FontAwesome Duotone node — Figma `Icon End`). */
  iconEnd?: ReactNode;
  /** Status Chip slot shown before the text (pass a `<StatusChip>`). */
  statusChip?: ReactNode;
  /** Suffix text shown after the text, e.g. a unit (Figma `Sufix`). */
  suffix?: ReactNode;
}

/**
 * Big Text Field — multi-line text input (textarea) with label, helper text and validation.
 *
 * Figma: Inputs › Input Field (9396:14218), Size=Big Text Field
 * (Default 9396:14539, Hover 9396:14550, Focused 9396:14561, Filled 9396:14572,
 * Error 9396:14583, Disabled 9396:14594).
 * - Root: column, gap 4px, 122px tall in Figma. Label row (9506:6383): label
 *   (Paragraph - Semi Bold) + "(optional)" (Paragraph - Regular), gap 4px.
 * - Field (9396:14543): fills the remaining height (99px with the label shown and no help
 *   text), padding 8px 12px, gap 8px, radius 8px (Border/Large), 1px inside stroke, slots
 *   top-aligned. Slots in order: Icon Start (20px), Status Chip, text (Paragraph - Regular),
 *   Sufix (Paragraph - Regular), Icon End (20px).
 * - Help text row (9415:19784): 16px icon + Paragraph - Small, gap 4px.
 * - States bind the `Inputs/Big Text Field/<state>-*` tokens; Disabled uses `Disabled/*`.
 *
 * The textarea grows with `rows`; the field never renders shorter than the Figma 99px.
 */
export const BigTextField = forwardRef<HTMLTextAreaElement, BigTextFieldProps>(function BigTextField(
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

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    if (!isControlled) setUncontrolledFilled(event.target.value.length > 0);
    onChange?.(event);
  };

  const classes = [
    'sds-big-text-field',
    filled && 'sds-big-text-field--filled',
    hasError && 'sds-big-text-field--error',
    disabled && 'sds-big-text-field--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label
        className={['sds-big-text-field__label', hideLabel && 'sds-big-text-field__label--hidden']
          .filter(Boolean)
          .join(' ')}
        htmlFor={fieldId}
      >
        {label}
        {optional && (
          <>
            {' '}
            <span className="sds-big-text-field__optional">(optional)</span>
          </>
        )}
      </label>
      <div className="sds-big-text-field__field">
        {iconStart && (
          <span className="sds-big-text-field__icon sds-big-text-field__icon--start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        {statusChip && <span className="sds-big-text-field__status-chip">{statusChip}</span>}
        <textarea
          ref={ref}
          id={fieldId}
          className="sds-big-text-field__input"
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? hintId : undefined}
          {...rest}
        />
        {suffix && <span className="sds-big-text-field__suffix">{suffix}</span>}
        {iconEnd && (
          <span className="sds-big-text-field__icon sds-big-text-field__icon--end" aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </div>
      {message && (
        <p className="sds-big-text-field__hint" id={hintId} role={hasError ? 'alert' : undefined}>
          {hintIcon && (
            <span className="sds-big-text-field__hint-icon" aria-hidden="true">
              {hintIcon}
            </span>
          )}
          <span className="sds-big-text-field__hint-text">{message}</span>
        </p>
      )}
    </div>
  );
});
