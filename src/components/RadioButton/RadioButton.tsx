import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './RadioButton.css';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label. Required for accessibility — associated via htmlFor. */
  label: ReactNode;
  /**
   * Shared group name. All radios in one mutually-exclusive set must share the same `name`.
   * Wrap the group in a fieldset/legend for the group question.
   */
  name: string;
}

/**
 * Radio Button — selects exactly one option from a small, mutually exclusive set.
 * Spec: references/components/radio-button.md. Use within a fieldset/legend group.
 */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  { label, name, id, disabled, className, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  const classes = ['sds-radio', disabled && 'sds-radio--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <span className="sds-radio__control">
        <input
          ref={ref}
          id={fieldId}
          type="radio"
          name={name}
          className="sds-radio__input"
          disabled={disabled}
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
  );
});
