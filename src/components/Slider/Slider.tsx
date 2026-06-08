import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import './Slider.css';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label. Required for accessibility — associated via htmlFor. */
  label: ReactNode;
  /** Minimum value. */
  min?: number;
  /** Maximum value. */
  max?: number;
  /** Step increment. */
  step?: number;
  /** Show the current value next to the label. */
  showValue?: boolean;
  /** Format the displayed value (e.g. append a unit). */
  formatValue?: (value: number) => string;
}

/**
 * Slider — selects a single numeric value from a continuous range via a native range input.
 * No spec file; built from --slider-* tokens with standard range-slider semantics.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    min = 0,
    max = 100,
    step = 1,
    showValue = true,
    formatValue,
    value,
    defaultValue,
    id,
    disabled,
    className,
    onChange,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  const isControlled = value !== undefined;
  const initial = Number(value ?? defaultValue ?? min);
  const [internal, setInternal] = useState<number>(initial);
  const current = isControlled ? Number(value) : internal;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternal(Number(event.target.value));
    onChange?.(event);
  };

  const pct = max > min ? ((current - min) / (max - min)) * 100 : 0;
  const display = formatValue ? formatValue(current) : String(current);

  const classes = ['sds-slider', disabled && 'sds-slider--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <div className="sds-slider__header">
        <label className="sds-slider__label" htmlFor={fieldId}>
          {label}
        </label>
        {showValue && (
          <span className="sds-slider__value" aria-hidden="true">
            {display}
          </span>
        )}
      </div>
      <input
        ref={ref}
        id={fieldId}
        type="range"
        className="sds-slider__input"
        min={min}
        max={max}
        step={step}
        value={isControlled ? value : internal}
        disabled={disabled}
        onChange={handleChange}
        style={{ ['--sds-slider-fill' as string]: `${pct}%` }}
        {...rest}
      />
    </div>
  );
});
