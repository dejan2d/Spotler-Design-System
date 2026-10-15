import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import './Slider.css';

/** Figma `Style`: `Single` (one thumb) → `single`, `Range` (two thumbs) → `range`. */
export type SliderVariant = 'single' | 'range';

/** A `[low, high]` pair for `variant="range"`. */
export type SliderRangeValue = [number, number];

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  /**
   * Accessible name, associated via htmlFor (single) or aria-labelledby (range).
   * Required for accessibility. The Figma Slider set has no visible label, so it is rendered
   * visually hidden.
   */
  label: ReactNode;
  /**
   * Figma `Style`: `single` is one thumb with the fill from the start; `range` is two thumbs
   * with the fill between them.
   * @default 'single'
   */
  variant?: SliderVariant;
  /** Minimum value. Shown as the left `*SliderValue Label` under the rail. @default 0 */
  min?: number;
  /** Maximum value. Shown as the right `*SliderValue Label` under the rail. @default 100 */
  max?: number;
  /** Step increment. @default 1 */
  step?: number;
  /**
   * Figma `Counter Toolbar` boolean: the value tooltip floating above the thumb
   * (above both thumbs for `range`).
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
  /** `range` only — controlled `[low, high]` value. */
  rangeValue?: SliderRangeValue;
  /** `range` only — initial `[low, high]` value when uncontrolled. @default [min, max] */
  defaultRangeValue?: SliderRangeValue;
  /** `range` only — called with the new `[low, high]` value when either thumb moves. */
  onRangeChange?: (value: SliderRangeValue) => void;
  /**
   * `range` only — accessible name of the lower thumb, announced after `label`
   * (e.g. "Price minimum").
   * @default 'minimum'
   */
  minThumbLabel?: string;
  /**
   * `range` only — accessible name of the upper thumb, announced after `label`.
   * @default 'maximum'
   */
  maxThumbLabel?: string;
}

const clamp = (n: number, low: number, high: number) => Math.min(high, Math.max(low, n));

/**
 * Slider — selects a single numeric value, or a `[low, high]` range, from a continuous range via
 * native range inputs.
 *
 * Figma: "Slider" component set 8247:42854 (page 93:103), Style=Single|Range × Type=Rest|Hover|Disabled.
 * - Min width 150px (set description); it should match the width of the related input fields.
 * - No visible label: `label` is the visually hidden accessible name.
 * - Slider area 44px tall. Rail 4px, radius circular, `Slider/rest-range-slider-background`.
 *   Fill (`*SliderTrack`) 6px, radius circular, `Slider/rest-range-slider-fill`.
 *   Thumb 20×20 circle, `Slider/rest-range-slider-circle`, three raw drop shadows
 *   (0 1px 4px — Gray 5%, 10%, black 25%).
 * - Counter tooltip 4px above the thumb: padding 8px 12px, radius 4px, `Slider/rest-range-background`,
 *   value in Paragraph - Regular `Slider/rest-text` (Hover: `Slider/hover-text`), 16×8 arrow,
 *   effect style Drop Shadow/50 (Style=Single) or Drop Shadow/100 (Style=Range).
 *   As in Figma it overflows above the component box; leave room above the slider.
 * - Values row under the rail: min (left) and max (right) in Paragraph - Regular `Slider/rest-range-text`.
 * - Style=Range (8247:42855 Rest, 8247:43050 Hover, 8247:43122 Disabled): two thumbs, each with
 *   its own counter tooltip; the fill runs between the two thumb centres. Everything else is
 *   identical to Single.
 * - Hover: `Slider/hover-*` rail, fill, thumb and value-label tokens; the thumb gets Figma's four
 *   raw drop shadows (0 1px 4px — Gray 5%, 10%, black 25%, 25%).
 * - Disabled: rail `Disabled/background` at 38% opacity, fill and thumb `Disabled/icon`,
 *   thumb Drop Shadow/100, tooltip and value labels `Disabled/text`.
 *
 * Range: two native inputs named "<label> minimum" / "<label> maximum"; the thumbs cannot
 * cross. `ref` points at the (lower) input; the rest props go to both inputs, and `name` gets a
 * `-min` / `-max` suffix. The keyboard focus ring is not designed in Figma; it is kept for
 * accessibility.
 */
export const Slider = forwardRef<HTMLInputElement, SliderProps>(function Slider(
  {
    label,
    variant = 'single',
    min = 0,
    max = 100,
    step = 1,
    showTooltip = true,
    showMinMax = true,
    formatValue,
    rangeValue,
    defaultRangeValue,
    onRangeChange,
    minThumbLabel = 'minimum',
    maxThumbLabel = 'maximum',
    value,
    defaultValue,
    id,
    name,
    disabled,
    className,
    onChange,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const isRange = variant === 'range';

  // ----- Single -----
  const isControlled = value !== undefined;
  const initial = Number(value ?? defaultValue ?? min);
  const [internal, setInternal] = useState<number>(initial);
  const current = isControlled ? Number(value) : internal;

  // ----- Range -----
  const isRangeControlled = rangeValue !== undefined;
  const [internalRange, setInternalRange] = useState<SliderRangeValue>(
    () => defaultRangeValue ?? [min, max],
  );
  const [rawLow, rawHigh] = rangeValue ?? internalRange;
  const low = clamp(Math.min(rawLow, rawHigh), min, max);
  const high = clamp(Math.max(rawLow, rawHigh), min, max);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternal(Number(event.target.value));
    onChange?.(event);
  };

  const commitRange = (next: SliderRangeValue) => {
    if (!isRangeControlled) setInternalRange(next);
    onRangeChange?.(next);
  };

  // The thumbs cannot cross: each one is clamped to the other's value.
  const handleLowChange = (event: ChangeEvent<HTMLInputElement>) => {
    commitRange([Math.min(Number(event.target.value), high), high]);
    onChange?.(event);
  };

  const handleHighChange = (event: ChangeEvent<HTMLInputElement>) => {
    commitRange([low, Math.max(Number(event.target.value), low)]);
    onChange?.(event);
  };

  const toRatio = (n: number) => (max > min ? clamp((n - min) / (max - min), 0, 1) : 0);
  const format = (n: number) => (formatValue ? formatValue(n) : String(n));

  const classes = [
    'sds-slider',
    isRange && 'sds-slider--range',
    disabled && 'sds-slider--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const renderTooltip = (display: string, modifier?: string) =>
    showTooltip && (
      <span
        className={['sds-slider__tooltip', modifier].filter(Boolean).join(' ')}
        aria-hidden="true"
      >
        <span className="sds-slider__tooltip-bubble">{display}</span>
        <span className="sds-slider__tooltip-arrow" />
      </span>
    );

  const valuesRow = showMinMax && (
    <div className="sds-slider__values" aria-hidden="true">
      <span className="sds-slider__value-label">{format(min)}</span>
      <span className="sds-slider__value-label">{format(max)}</span>
    </div>
  );

  if (isRange) {
    const labelId = `${fieldId}-label`;
    const minNameId = `${fieldId}-min-name`;
    const maxNameId = `${fieldId}-max-name`;
    // Thumb positions (0..1) drive the fill start / end and the tooltip offsets.
    const controlStyle = {
      ['--sds-slider-low' as string]: String(toRatio(low)),
      ['--sds-slider-high' as string]: String(toRatio(high)),
    } as CSSProperties;
    // When both thumbs sit together at the top end, lift the lower one so it can still be dragged.
    const lowOnTop = low === high && low > (min + max) / 2;

    return (
      <div className={classes}>
        <span className="sds-slider__label" id={labelId}>
          {label}
        </span>
        <span className="sds-slider__label" id={minNameId}>
          {minThumbLabel}
        </span>
        <span className="sds-slider__label" id={maxNameId}>
          {maxThumbLabel}
        </span>
        <div className="sds-slider__control" style={controlStyle}>
          <span className="sds-slider__rail" aria-hidden="true" />
          <span className="sds-slider__fill" aria-hidden="true" />
          {renderTooltip(format(low), 'sds-slider__tooltip--low')}
          {renderTooltip(format(high), 'sds-slider__tooltip--high')}
          <input
            ref={ref}
            id={fieldId}
            name={name ? `${name}-min` : undefined}
            type="range"
            className={[
              'sds-slider__input',
              'sds-slider__input--low',
              lowOnTop && 'sds-slider__input--top',
            ]
              .filter(Boolean)
              .join(' ')}
            min={min}
            max={max}
            step={step}
            value={low}
            disabled={disabled}
            aria-labelledby={`${labelId} ${minNameId}`}
            aria-valuetext={format(low)}
            onChange={handleLowChange}
            {...rest}
          />
          <input
            id={`${fieldId}-max`}
            name={name ? `${name}-max` : undefined}
            type="range"
            className="sds-slider__input sds-slider__input--high"
            min={min}
            max={max}
            step={step}
            value={high}
            disabled={disabled}
            aria-labelledby={`${labelId} ${maxNameId}`}
            aria-valuetext={format(high)}
            onChange={handleHighChange}
            {...rest}
          />
        </div>
        {valuesRow}
      </div>
    );
  }

  // Thumb position (0..1) drives the fill width and the tooltip offset.
  const controlStyle = { ['--sds-slider-pct' as string]: String(toRatio(current)) } as CSSProperties;

  return (
    <div className={classes}>
      <label className="sds-slider__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="sds-slider__control" style={controlStyle}>
        <span className="sds-slider__rail" aria-hidden="true" />
        <span className="sds-slider__fill" aria-hidden="true" />
        {renderTooltip(format(current))}
        <input
          ref={ref}
          id={fieldId}
          name={name}
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
      {valuesRow}
    </div>
  );
});
