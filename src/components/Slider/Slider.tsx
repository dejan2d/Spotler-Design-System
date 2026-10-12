import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import './Slider.css';

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Accessible name, associated via htmlFor. Required for accessibility.
   * The Figma Slider set has no visible label, so it is rendered visually hidden.
   */
  label: ReactNode;
  /** Minimum value. Shown as the left `*SliderValue Label` under the rail. @default 0 */
  min?: number;
  /** Maximum value. Shown as the right `*SliderValue Label` under the rail. @default 100 */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
  /**
   * Figma `Counter Toolbar` boolean: the value tooltip floating above the thumb.
   * @default true
   */
  showTooltip?: boolean;
  /**
   * Show the min / max labels below the rail (Figma `Values` row).
   * @default true
   */
  showMinMax?: boolean;
  /** Format the displayed value, tooltip and min/max labels (e.g. append a unit). */
  formatValue?: (value: number) => string;
}

/**
 * Slider — selects a single numeric value from a continuous range via a native range input.
 *
 * Figma: "Slider" component set 8247:42854 (page 93:103), Style=Single × Type=Rest|Hover|Disabled.
 * - Min width 150px (set description); it should match the width of the related input fields.
 * - No visible label: `label` is the visually hidden accessible name.
 * - Slider area 44px tall. Rail 4px, radius circular, `Slider/rest-range-slider-background`.
 *   Fill (`*SliderTrack`) 6px, radius circular, `Slider/rest-range-slider-fill`.
 *   Thumb 20×20 circle, `Slider/rest-range-slider-circle`.
 * - Counter tooltip 4px above the thumb: padding 8px 12px, radius 4px, `Slider/rest-range-background`,
 *   value in Paragraph - Regular `Slider/rest-text`, 16×8 arrow, effect style Drop Shadow/100.
 *   As in Figma it overflows above the component box; leave room above the slider.
 * - Values row under the rail: min (left) and max (right) in Paragraph - Regular `Slider/rest-range-text`.
 * - Hover: `Slider/hover-*` rail, fill, thumb and value-label tokens; the thumb gets Figma's four
 *   raw drop shadows (0 1px 4px — Gray 5%, 10%, black 25%, 25%).
 * - Disabled: rail `Disabled/background` at 38% opacity, fill and thumb `Disabled/icon`,
 *   thumb Drop Shadow/100, tooltip and value labels `Disabled/text`.
 *
 * Not implemented: Figma's Style=Range (two thumbs). The keyboard focus ring is not designed
 * in Figma; it is kept for accessibility.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    min = 0,
    max = 100,
    step = 1,
    showTooltip = true,
    showMinMax = true,
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

  const ratio = max > min ? Math.min(1, Math.max(0, (current - min) / (max - min))) : 0;
  const format = (n: number) => (formatValue ? formatValue(n) : String(n));
  const display = format(current);

  const classes = [
    'sds-slider',
    disabled && 'sds-slider--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Thumb position (0..1) drives the fill width and the tooltip offset.
  const controlStyle = { ['--sds-slider-pct' as string]: String(ratio) } as CSSProperties;

  return (
    <div className={classes}>
      <label className="sds-slider__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="sds-slider__control" style={controlStyle}>
        <span className="sds-slider__rail" aria-hidden="true" />
        <span className="sds-slider__fill" aria-hidden="true" />
        {showTooltip && (
          <span className="sds-slider__tooltip" aria-hidden="true">
            <span className="sds-slider__tooltip-bubble">{display}</span>
            <span className="sds-slider__tooltip-arrow" />
          </span>
        )}
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
          {...rest}
        />
      </div>
      {showMinMax && (
        <div className="sds-slider__values" aria-hidden="true">
          <span className="sds-slider__value-label">{format(min)}</span>
          <span className="sds-slider__value-label">{format(max)}</span>
        </div>
      )}
    </div>
  );
});
