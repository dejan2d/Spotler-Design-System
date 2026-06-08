import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Switch.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label describing what the switch turns on/off. Required for accessibility. */
  label: ReactNode;
}

/**
 * Switch — an instant binary on/off toggle that takes effect immediately.
 * Spec: references/components/switch.md. Uses a native checkbox with role="switch".
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, id, disabled, className, checked, defaultChecked, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  const classes = ['sds-switch', disabled && 'sds-switch--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <span className="sds-switch__control">
        <input
          ref={ref}
          id={fieldId}
          type="checkbox"
          role="switch"
          className="sds-switch__input"
          disabled={disabled}
          checked={checked}
          defaultChecked={defaultChecked}
          {...rest}
        />
        <span className="sds-switch__track" aria-hidden="true">
          <span className="sds-switch__knob" />
        </span>
      </span>
      <label className="sds-switch__label" htmlFor={fieldId}>
        {label}
      </label>
    </div>
  );
});
