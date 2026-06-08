import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './TextField.css';

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label. Required for accessibility — never rely on placeholder alone. */
  label: string;
  /** Marks the field optional; shows "(optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the field. */
  hint?: string;
  /** Error message. When set, the field renders in the error state. */
  error?: string;
  /** Leading icon (FontAwesome Duotone node). */
  iconStart?: ReactNode;
  /** Trailing icon. */
  iconEnd?: ReactNode;
}

/**
 * Text Field — single-line text input with label, helper text, and validation.
 * Spec: references/components/text-field.md (shared Inputs system).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, optional, hint, error, iconStart, iconEnd, id, disabled, className, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  const classes = [
    'sds-textfield',
    hasError && 'sds-textfield--error',
    disabled && 'sds-textfield--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label className="sds-textfield__label" htmlFor={fieldId}>
        {label}
        {optional && <span className="sds-textfield__optional"> (optional)</span>}
      </label>
      <div className="sds-textfield__field">
        {iconStart && <span className="sds-textfield__icon" aria-hidden="true">{iconStart}</span>}
        <input
          ref={ref}
          id={fieldId}
          className="sds-textfield__input"
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? hintId : undefined}
          {...rest}
        />
        {iconEnd && <span className="sds-textfield__icon" aria-hidden="true">{iconEnd}</span>}
      </div>
      {message && (
        <p className="sds-textfield__hint" id={hintId}>
          {message}
        </p>
      )}
    </div>
  );
});
