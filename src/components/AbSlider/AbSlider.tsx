import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import './AbSlider.css';

export interface AbSliderProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'min' | 'max'> {
  /**
   * Accessible name, associated via htmlFor. Required for accessibility.
   * The Figma AB slider has no visible label, so it is rendered visually hidden.
   */
  label: ReactNode;
  /**
   * Figma `Support values`: shows the percentage and count under each group name.
   * @default true
   */
  showValues?: boolean;
  /**
   * Size of the whole audience. The count in brackets under each group is this total split by the
   * group's share (Figma shows `(25)` for 25% of 100).
   * @default 100
   */
  total?: number;
  /** Name of the first test group. @default 'A' */
  aLabel?: ReactNode;
  /** Name of the second test group. @default 'B' */
  bLabel?: ReactNode;
  /** Name of the remainder that receives the winner. @default 'Rest' */
  restLabel?: ReactNode;
}

/** Plain-text version of a group name for the announced value (falls back for non-text nodes). */
const nameText = (name: ReactNode, fallback: string) =>
  typeof name === 'string' || typeof name === 'number' ? String(name) : fallback;

/** Percentage text: whole numbers as-is, halves (odd test sizes) with one decimal. */
const formatPercent = (n: number) => `${Math.round(n * 10) / 10}%`;

/**
 * AB Slider — sets how much of an audience goes into an A/B test. The thumb sets the test share
 * (0–100%); it is split evenly into group A and group B, and the remainder is "Rest".
 *
 * Figma: "AB slider" component set 2087:72323 (page "Slider"),
 * Amount=Default|0 value|100% value|90% value × State=Default|Hover|Disabled, `Support values` boolean.
 * - 300px wide. Slider area 20px tall.
 * - Rail 4px, full width, radius circular, `Monochrome/Gray - 400`.
 * - Fill 6px from the start to the share: first half `Primary/Conceptual/Conceptual` (A, left end
 *   rounded), second half `Semantic/Green - Success/Success - Darker` (B, right end rounded).
 * - Thumb (`handle`) 20×20 circle `Monochrome/White`, 1px outside stroke `Monochrome/Gray - 200`,
 *   three raw drop shadows (0 1px 4px — Gray 5%, Gray 10%, black 10%).
 * - Legend 4px under the slider: one column per group (A, B, Rest), centred under its segment of
 *   the rail. Name in Paragraph - Regular `Monochrome/Gray - 1000`; `Support values` adds
 *   "NN%" and "(count)" on two lines in Paragraph - Small (count in `Monochrome/Gray - 600`).
 *   With a 0 share only Rest is shown; with 100% only A and B.
 * - Hover: thumb fill `Monochrome/Gray - 200` plus a fourth raw drop shadow (0 4px 4px black 10%).
 * - Disabled: rail and thumb stroke `Disabled/background`, fill at 50% opacity, legend `Disabled/text`.
 *
 * The thumb's hidden "counter tooltip" layer in Figma is not rendered. The keyboard focus ring is
 * not designed in Figma; it is kept for accessibility. Accessibility: a native range input with
 * an `aria-valuetext` that announces the A / B / Rest split.
 */
export const AbSlider = forwardRef<HTMLInputElement, AbSliderProps>(function AbSlider(
  {
    label,
    showValues = true,
    total = 100,
    aLabel = 'A',
    bLabel = 'B',
    restLabel = 'Rest',
    step = 1,
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
  const [internal, setInternal] = useState<number>(Number(value ?? defaultValue ?? 50));
  const share = Math.min(100, Math.max(0, isControlled ? Number(value) : internal));

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternal(Number(event.target.value));
    onChange?.(event);
  };

  // A and B split the test share evenly; Rest is what is left.
  const testCount = Math.round((total * share) / 100);
  const aCount = Math.ceil(testCount / 2);
  const bCount = testCount - aCount;
  const restCount = total - testCount;
  const half = share / 2;
  const restShare = 100 - share;

  const groups: { key: string; name: ReactNode; percent: number; count: number; centre: number }[] = [];
  if (share > 0) {
    groups.push({ key: 'a', name: aLabel, percent: half, count: aCount, centre: share / 4 });
    groups.push({ key: 'b', name: bLabel, percent: half, count: bCount, centre: (share * 3) / 4 });
  }
  if (share < 100) {
    groups.push({ key: 'rest', name: restLabel, percent: restShare, count: restCount, centre: (share + 100) / 2 });
  }

  const valueText = [
    share > 0 &&
      `${nameText(aLabel, 'A')} ${formatPercent(half)}, ${nameText(bLabel, 'B')} ${formatPercent(half)}`,
    share < 100 && `${nameText(restLabel, 'Rest')} ${formatPercent(restShare)}`,
  ]
    .filter(Boolean)
    .join(', ');

  const classes = ['sds-ab-slider', disabled && 'sds-ab-slider--disabled', className]
    .filter(Boolean)
    .join(' ');

  const style = { ['--sds-ab-slider-pct' as string]: String(share / 100) } as CSSProperties;

  return (
    <div className={classes} style={style}>
      <label className="sds-ab-slider__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="sds-ab-slider__control">
        <span className="sds-ab-slider__rail" aria-hidden="true" />
        {share > 0 && (
          <span className="sds-ab-slider__fill" aria-hidden="true">
            <span className="sds-ab-slider__segment sds-ab-slider__segment--a" />
            <span className="sds-ab-slider__segment sds-ab-slider__segment--b" />
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          type="range"
          className="sds-ab-slider__input"
          min={0}
          max={100}
          step={step}
          value={isControlled ? value : internal}
          disabled={disabled}
          aria-valuetext={valueText}
          onChange={handleChange}
          {...rest}
        />
      </div>
      <div className="sds-ab-slider__legend" aria-hidden="true">
        {groups.map((group) => (
          <span
            key={group.key}
            className="sds-ab-slider__group"
            style={{ ['--sds-ab-slider-centre' as string]: String(group.centre / 100) } as CSSProperties}
          >
            <span className="sds-ab-slider__group-name">{group.name}</span>
            {showValues && (
              <span className="sds-ab-slider__group-values">
                <span className="sds-ab-slider__group-percent">{formatPercent(group.percent)}</span>
                <span className="sds-ab-slider__group-count">({group.count})</span>
              </span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
});
