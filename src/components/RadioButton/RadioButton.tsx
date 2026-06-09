import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './RadioButton.css';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label. Required for accessibility — associated to the input via htmlFor. */
  label: ReactNode;
  /**
   * Shared group name. Every radio in one mutually-exclusive set MUST share the same
   * `name` so the browser enforces a single selection and arrow keys move between them.
   * Wrap the group in a fieldset/legend that states the group question.
   */
  name: string;
  /** Optional helper text shown below the control (Body/Paragraph - Caption). */
  hint?: string;
}

/**
 * Radio Button — Spotler Design System.
 *
 * A control for selecting exactly one option from a small (2–~6), mutually
 * exclusive set shown together. Built on a native input[type=radio] with an
 * associated label so it is fully accessible by default; present radios in a
 * group sharing one `name`, wrapped in a fieldset/legend.
 *
 * Sizing: 20px circular control (Border/Circular), 10px inner dot, 12px label gap.
 * Label & hint use Body/Paragraph. States: default, checked — each combinable
 * with hover / focus / disabled. Default border resolves to #D4DBDE; the checked
 * dot is Primary (#005499) with a #BBC5CA border.
 */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  { label, name, hint, id, disabled, className, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;

  const classes = ['sds-radio', disabled && 'sds-radio--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="sds-radio__row">
        <span className="sds-radio__control">
          <input
            ref={ref}
            id={fieldId}
            type="radio"
            name={name}
            className="sds-radio__input"
            disabled={disabled}
            aria-describedby={hint ? hintId : undefined}
            {...rest}
          />
          <span className="sds-radio__circle" aria-hidden="true">
            <span className="sds-radio__dot" />
          </span>
        </span>
        <label className="sds-radio__label" htmlFor={fieldId}>
          {label}
        </label>
      </div>
      {hint && (
        <p className="sds-radio__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  );
});
