import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Checkbox.css';

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label. Required for accessibility — associated to the input via htmlFor. */
  label: ReactNode;
  /**
   * Side of the box the label sits on (Figma `Left Label` / `Right Label`).
   * @default 'right'
   */
  labelPosition?: 'left' | 'right';
  /** Help text shown under the label (Paragraph - Small, `Checkbox/help-text`). */
  hint?: string;
  /**
   * Error message. When set, the box gets the error border, the input is marked
   * aria-invalid, and the message is shown below the control (Paragraph - Small,
   * `Checkbox/error-text`) and exposed to screen readers via aria-describedby.
   * The label keeps its regular colour.
   */
  error?: string;
  /**
   * Leading icon of the error message (16×16, FontAwesome Duotone node — `circle-info`
   * in the Figma component). Coloured with `Checkbox/error-icon`; rendered decorative.
   */
  errorIcon?: ReactNode;
}

/**
 * Checkbox — selects one or more independent options. Built on a native
 * input[type=checkbox] with an associated label so it is fully accessible by default.
 *
 * Figma: Selectors › Checkbox (184:3150).
 * - 20×20 control with 2px padding around a 16×16 box (radius 4px, Border/Small,
 *   1px inside stroke); 10×10 checkmark (`Checkbox/checked-checkmark`).
 * - 8px gap between box and label; label Paragraph - Regular (`Checkbox/label`);
 *   help text under the label (8px gap), Paragraph - Small (`Checkbox/help-text`).
 * - States (Checked False/True): Default, Hover (`Checkbox/hover-*`,
 *   `Checkbox/checked-hover-*`), Disabled (`Disabled/*`), Error (unchecked:
 *   `Checkbox/error-border`; label unchanged; message row below the control with
 *   an icon, 8px gaps).
 * - A 2px keyboard focus ring is added in code (no Figma Focused variant).
 * - No indeterminate state: the Figma set has Checked False/True only.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    labelPosition = 'right',
    hint,
    error,
    errorIcon,
    id,
    disabled,
    className,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const errorId = `${fieldId}-error`;
  const hasError = Boolean(error);
  const describedBy = [hint && hintId, hasError && errorId].filter(Boolean).join(' ') || undefined;

  const classes = [
    'sds-checkbox',
    labelPosition === 'left' && 'sds-checkbox--label-left',
    hasError && 'sds-checkbox--error',
    disabled && 'sds-checkbox--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const text = (
    <span className="sds-checkbox__text">
      <label className="sds-checkbox__label" htmlFor={fieldId}>
        {label}
      </label>
      {hint && (
        <span className="sds-checkbox__hint" id={hintId}>
          {hint}
        </span>
      )}
    </span>
  );

  return (
    <div className={classes}>
      <div className="sds-checkbox__row">
        {labelPosition === 'left' && text}
        <span className="sds-checkbox__control">
          <input
            ref={ref}
            id={fieldId}
            type="checkbox"
            className="sds-checkbox__input"
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy}
            {...rest}
          />
          <span className="sds-checkbox__box" aria-hidden="true">
            {/* Figma `internal-check` (10×10) with its 7×5 check vector at (1.5, 2.5). */}
            <svg className="sds-checkbox__check" viewBox="0 0 10 10" fill="none">
              <path
                transform="translate(1.5 2.506)"
                d="M6.854 0.14C7.049 0.336 7.049 0.653 6.854 0.848L2.854 4.847C2.659 5.043 2.342 5.043 2.146 4.847L0.146 2.848C-0.049 2.653 -0.049 2.335 0.146 2.14C0.342 1.945 0.659 1.945 0.854 2.14L2.501 3.785L6.147 0.14C6.343 -0.055 6.67 -0.042 6.866 0.153L6.854 0.14Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="0.9"
              />
            </svg>
          </span>
        </span>
        {labelPosition !== 'left' && text}
      </div>
      {hasError && (
        <p className="sds-checkbox__message" id={errorId}>
          {errorIcon && (
            <span className="sds-checkbox__message-icon" aria-hidden="true">
              {errorIcon}
            </span>
          )}
          <span className="sds-checkbox__message-text">{error}</span>
        </p>
      )}
    </div>
  );
});
