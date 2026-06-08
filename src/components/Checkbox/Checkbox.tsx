import { forwardRef, useEffect, useId, useRef } from 'react';
import type { InputHTMLAttributes, MutableRefObject, ReactNode } from 'react';
import './Checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label. Required for accessibility — associated via htmlFor. */
  label: ReactNode;
  /** Helper text shown below the control. */
  hint?: string;
  /** Error message. When set, the control renders in the error state and is exposed via aria-describedby. */
  error?: string;
  /** Partial-selection state (e.g. "select all"). Renders a dash glyph and sets aria-checked="mixed". */
  indeterminate?: boolean;
}

/**
 * Checkbox — selects one or more independent options, including indeterminate (partial) selection.
 * Spec: references/components/checkbox.md.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, error, indeterminate = false, id, disabled, className, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const hasError = Boolean(error);
  const message = error ?? hint;

  const innerRef = useRef<HTMLInputElement>(null);

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
            aria-describedby={message ? hintId : undefined}
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
        <p className="sds-checkbox__hint" id={hintId}>
          {message}
        </p>
      )}
    </div>
  );
});
