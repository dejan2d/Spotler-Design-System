import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes, ReactNode } from 'react';
import './ColorPicker.css';

export interface ColorPickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue'> {
  /** Visible label. Required for accessibility — associated via htmlFor. */
  label: ReactNode;
  /** Helper text shown below the control. */
  hint?: string;
  /** Controlled hex value (e.g. "#005499"). */
  value?: string;
  /** Uncontrolled initial hex value. */
  defaultValue?: string;
  /** Fired with the new hex string whenever the color changes. */
  onValueChange?: (hex: string) => void;
}

/**
 * Color Picker — a swatch box paired with a text field showing the selected hex value.
 * No spec file; built from --color-picker-* tokens.
 */
export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(function ColorPicker(
  { label, hint, value, defaultValue, onValueChange, id, disabled, className, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>(defaultValue ?? '');
  const current = isControlled ? value : internal;
  const hasValue = Boolean(current);

  const update = (hex: string) => {
    if (!isControlled) setInternal(hex);
    onValueChange?.(hex);
  };

  const handleSwatch = (event: ChangeEvent<HTMLInputElement>) => {
    update(event.target.value);
  };

  const handleText = (event: ChangeEvent<HTMLInputElement>) => {
    update(event.target.value);
  };

  // The native color input requires a valid 7-char hex; fall back to black for the picker UI.
  const swatchValue = /^#[0-9a-fA-F]{6}$/.test(current ?? '') ? (current as string) : '#000000';

  const classes = [
    'sds-color-picker',
    hasValue ? 'sds-color-picker--filled' : 'sds-color-picker--empty',
    disabled && 'sds-color-picker--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label className="sds-color-picker__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="sds-color-picker__field">
        <span className="sds-color-picker__swatch">
          <input
            ref={ref}
            id={fieldId}
            type="color"
            className="sds-color-picker__swatch-input"
            value={swatchValue}
            disabled={disabled}
            aria-label={`${typeof label === 'string' ? label : 'Color'} swatch`}
            onChange={handleSwatch}
            {...rest}
          />
        </span>
        <input
          type="text"
          className="sds-color-picker__text"
          value={current ?? ''}
          placeholder="#000000"
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          onChange={handleText}
        />
      </div>
      {hint && (
        <p className="sds-color-picker__hint" id={hintId}>
          {hint}
        </p>
      )}
    </div>
  );
});
