import { forwardRef, useEffect, useId, useRef } from 'react';
import type { InputHTMLAttributes, MutableRefObject, ReactNode } from 'react';
import './Checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label. Required for accessibility — associated to the input via htmlFor. */
  label: ReactNode;
  /** Helper text shown below the control (Body/Paragraph - Regular / Small). */
  hint?: string;
  /**
   * Error message. When set, the control renders in the error state, the input is
   * marked aria-invalid, and the message is exposed to screen readers via aria-describedby.
   */
  error?: string;
  /**
   * Partial-selection state (e.g. a "select all" parent). Renders the dash glyph,
   * syncs the native `indeterminate` DOM property, and sets aria-checked="mixed".
   */
  indeterminate?: boolean;
}

/**
 * Checkbox — selects one or more independent options, including indeterminate
 * (partial) selection. Built on a native input[type=checkbox] with an associated
 * label so it is fully accessible by default.
 *
 * Spotler Design System component: Checkbox.
 * 20px square box, Border/Small radius, 20px label gap; label & help text use
 * Body/Paragraph - Regular / Small. Default / checked / error states, each
 * combinable with hover / focus / disabled.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, indeterminate = false, id, disabled, className, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const messageId = `${fieldId}-message`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  const innerRef = useRef<HTMLInputElement>(null);

  // The visual dash + AT "mixed" state both derive from the native DOM property,
  // which has no JSX attribute — keep it in sync imperatively.
  useEffect(() => {
    if (innerRef.current) {
      innerRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const setRefs = (node: HTMLInputElement | null) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) (ref as MutableRefObject<HTMLInputElement | null>).current = node;
  };

  const classes = [
    'sds-checkbox',
    hasError && 'sds-checkbox--error',
    disabled && 'sds-checkbox--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="sds-checkbox__row">
        <span className="sds-checkbox__control">
          <input
            ref={setRefs}
            id={fieldId}
            type="checkbox"
            className="sds-checkbox__input"
            disabled={disabled}
            aria-checked={indeterminate ? 'mixed' : undefined}
            aria-invalid={hasError || undefined}
            aria-describedby={message ? messageId : undefined}
            {...rest}
          />
          <span className="sds-checkbox__box" aria-hidden="true">
            <svg className="sds-checkbox__check" viewBox="0 0 16 16" fill="none">
              <path
                d="M3.5 8.5L6.5 11.5L12.5 4.5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="sds-checkbox__dash" />
          </span>
        </span>
        <label className="sds-checkbox__label" htmlFor={fieldId}>
          {label}
        </label>
      </div>
      {message && (
        <p className="sds-checkbox__message" id={messageId}>
          {message}
        </p>
      )}
    </div>
  );
});
