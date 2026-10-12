import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './Switch.css';

export interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Optional label to the RIGHT of the switch (Figma `Label Right`, hidden by default).
   * Without any visible label, pass `aria-label` or `aria-labelledby` so the switch
   * still has an accessible name.
   */
  label?: ReactNode;
  /** Optional label to the LEFT of the switch (Figma `Label Left`, hidden by default). */
  labelLeft?: ReactNode;
}

/** True when a ReactNode would render something visible. */
function hasContent(node: ReactNode): boolean {
  return node !== undefined && node !== null && node !== false && node !== '';
}

/**
 * Switch — an instant binary on/off toggle that takes effect immediately.
 * Uses a native checkbox with role="switch".
 *
 * Figma: "Switch" component set 458:12084 (page 29:21), Checked × State.
 * Box: padding 2px, gap 8px between the optional labels and the toggle (32×20 with no
 * labels). Toggle: 28×16 pill track with a 12×12 handle inset 2px; the handle moves
 * 12px to the right when on and carries a 10×10 check icon (Switch/selected-icon).
 * Off: Switch/rest-background track, Switch/rest-circle handle.
 * On: Switch/selected-background track, Switch/selected-circle handle.
 * Disabled: Disabled/background track, Disabled/icon handle, Disabled/stroke check.
 * Labels: Paragraph - Regular, Monochrome/Gray-1000 (Disabled/text when disabled),
 * optional on the left and/or right — both hidden by default.
 * The keyboard focus ring is not designed in Figma; it is kept for accessibility.
 */
export const Switch = forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, labelLeft, id, disabled, className, checked, defaultChecked, ...rest },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;

  const classes = ['sds-switch', disabled && 'sds-switch--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      {hasContent(labelLeft) && (
        <label className="sds-switch__label sds-switch__label--left" htmlFor={fieldId}>
          {labelLeft}
        </label>
      )}
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
          <span className="sds-switch__knob">
            {/* Figma "check" icon (7×5 glyph in a 10×10 box), shown only when on. */}
            <svg className="sds-switch__check" viewBox="-1.5 -2.5 10 10" focusable="false">
              <path
                fill="currentColor"
                d="M6.854 0.146C7.049 0.342 7.049 0.659 6.854 0.854L2.854 4.854C2.659 5.049 2.342 5.049 2.146 4.854L0.146 2.854C-0.049 2.659 -0.049 2.341 0.146 2.146C0.342 1.951 0.659 1.951 0.854 2.146L2.501 3.791L6.147 0.146C6.343 -0.049 6.66 -0.049 6.855 0.146Z"
              />
            </svg>
          </span>
        </span>
      </span>
      {hasContent(label) && (
        <label className="sds-switch__label sds-switch__label--right" htmlFor={fieldId}>
          {label}
        </label>
      )}
    </div>
  );
});
