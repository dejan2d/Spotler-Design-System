import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './RadioButton.css';

export interface RadioButtonProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /** Visible label. Required for accessibility — associated to the input via htmlFor. */
  label: ReactNode;
  /**
   * Hides the label visually while keeping it as the accessible name
   * (Figma `Label Right` boolean = false). @default false
   */
  hideLabel?: boolean;
  /**
   * Shared group name. Every radio in one mutually-exclusive set MUST share the same
   * `name` so the browser enforces a single selection and arrow keys move between them.
   * Wrap the group in a fieldset/legend that states the group question.
   */
  name: string;
}

/**
 * Radio Button — Spotler Design System.
 *
 * A control for selecting exactly one option from a small (2–~6), mutually
 * exclusive set shown together. Built on a native input[type=radio] with an
 * associated label so it is fully accessible by default; present radios in a
 * group sharing one `name`, wrapped in a fieldset/legend.
 *
 * Figma: Selectors › Radio button (232:591).
 * - 4px component padding; 16×16 circle (Border/Circular, 1px inside stroke),
 *   8×8 checked dot, 8px gap to the label; row vertically centred.
 * - Label: Paragraph - Regular (`Radio Button/label`); `hideLabel` mirrors the Figma
 *   `Label Right` boolean (label visually hidden, still the accessible name).
 * - States (Check true/false): Default (`Radio Button/default-*`, `checked-*`),
 *   Hover (`Radio Button/hover-*`, `checked-hover-*` — background changes, border
 *   unchanged), Disabled (`Disabled/background`, `Disabled/stroke`, dot `Disabled/icon`,
 *   label `Disabled/text`).
 * - A 2px keyboard focus ring is added in code (no Figma Focused variant).
 * - No help text: the Figma set has only `Label Right` and `Text` properties.
 */
export const RadioButton = forwardRef<HTMLInputElement, RadioButtonProps>(function RadioButton(
  { label, hideLabel = false, name, id, disabled, className, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;

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
            {...rest}
          />
          <span className="sds-radio__circle" aria-hidden="true">
            <span className="sds-radio__dot" />
          </span>
        </span>
        <label
          className={['sds-radio__label', hideLabel && 'sds-radio__label--hidden']
            .filter(Boolean)
            .join(' ')}
          htmlFor={fieldId}
        >
          {label}
        </label>
      </div>
    </div>
  );
});
