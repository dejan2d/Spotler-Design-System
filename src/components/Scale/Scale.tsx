import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Divider } from '../Divider';
import './Scale.css';

/** Curve of the scale (Figma `Type`): `Exponential` → `exponential`, `Linear` → `linear`. */
export type ScaleType = 'exponential' | 'linear';

/** Figma `Size`: `Small` (141px wide) → `small`, `Big` (609px wide) → `big`. */
export type ScaleSize = 'small' | 'big';

/** Figma `Color`: `Default` (blue) → `default`, `AI` (purple) → `ai`. */
export type ScaleColor = 'default' | 'ai';

/** Figma `Number of elements` — 2 to 10 bars. */
export type ScaleElements = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export interface ScaleProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color'> {
  /** Shape of the scale (Figma `Type`). @default 'exponential' */
  type?: ScaleType;
  /** Figma `Size`. @default 'small' */
  size?: ScaleSize;
  /** Number of bars (Figma `Number of elements`). @default 10 */
  elements?: ScaleElements;
  /** Figma `Color`: `ai` swaps the blue fills for the purple AI fills. @default 'default' */
  color?: ScaleColor;
  /**
   * How many bars are filled, counted from the left (clamped to `0`..`elements`).
   * Filled bars use `fill-dark-*`, the rest `background-light-*`.
   */
  value: number;
  /** Title above the scale (Figma `Scale name`, H4). */
  name?: ReactNode;
  /** Text under the title (Figma `Current Value`, Paragraph - Regular). */
  currentValue?: ReactNode;
  /** Figma `Show name`: shows the title, the current value and the divider under them. @default true */
  showName?: boolean;
  /** Figma `Show labels`: shows the min / max labels under the scale. @default true */
  showLabels?: boolean;
  /** Left label under the scale (Figma `Min Value`, Paragraph - Small). */
  minLabel?: ReactNode;
  /** Right label under the scale (Figma `Max Value`, Paragraph - Small). */
  maxLabel?: ReactNode;
  /**
   * Accessible name of the meter. Defaults to the `name` text (via aria-labelledby) when it is
   * shown; pass this when `showName` is false or `name` is not plain text.
   */
  ariaLabel?: string;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Scale — a stepped, read-only score bar: N bars under an exponential or linear outline, the first
 * `value` bars filled.
 *
 * Figma: "Scale" component set 5790:55967 (page "Diagrams & Stats"),
 * Type=Exponential|Linear × Size=Small|Big × Number of elements=2–10 × Color=Default|AI.
 * - Fixed width: Small 141px, Big 609px. Column gap 8px: Name + Value, Divider, Graph + Value.
 * - Name + Value (Figma `Show name`): gap 2px; `Scale name` in H4 `Diagrams/Scale/title`,
 *   `Current Value` in Paragraph - Regular `Diagrams/Scale/value`. The Divider instance
 *   (Orientation=Horizontal, `Divider/horizontal`) is bound to the same boolean.
 * - Graph + Value: gap 8px. The graph is a row of equal bars, no radius, gap 4px (Small) /
 *   6px (Big); filled bars `Diagrams/Scale/fill-dark-blue` (AI: `fill-dark-purple`), the rest
 *   `Diagrams/Scale/background-light-blue` (AI: `background-light-purple`). The row is masked by
 *   the `Scale mask` vector: an exponential curve or a straight diagonal (bottom-left to top-right).
 *   Graph height: Small 41px (Exponential) / 42px (Linear); Big 129px / 127px.
 * - Values (Figma `Show labels`): min left, max right (space-between), Paragraph - Small
 *   `Diagrams/Scale/labels`.
 *
 * Accessibility: `role="meter"` with `aria-valuenow` = filled bars, `aria-valuemax` = `elements`;
 * the bars are decorative.
 */
export const Scale = forwardRef<HTMLDivElement, ScaleProps>(function Scale(
  {
    type = 'exponential',
    size = 'small',
    elements = 10,
    color = 'default',
    value,
    name,
    currentValue,
    showName = true,
    showLabels = true,
    minLabel,
    maxLabel,
    ariaLabel,
    className,
    ...rest
  },
  ref,
) {
  const nameId = useId();
  const count = clamp(Math.round(elements), 2, 10);
  const filled = clamp(Math.round(value), 0, count);
  const hasName = showName && name !== undefined && name !== null;

  const classes = [
    'sds-scale',
    `sds-scale--${type}`,
    `sds-scale--${size}`,
    color === 'ai' && 'sds-scale--ai',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      role="meter"
      aria-valuemin={0}
      aria-valuemax={count}
      aria-valuenow={filled}
      aria-valuetext={typeof currentValue === 'string' ? currentValue : `${filled} of ${count}`}
      aria-label={ariaLabel}
      aria-labelledby={!ariaLabel && hasName ? nameId : undefined}
      {...rest}
    >
      {showName && (
        <>
          <div className="sds-scale__header">
            {name !== undefined && name !== null && (
              <span className="sds-scale__name" id={nameId}>
                {name}
              </span>
            )}
            {currentValue !== undefined && currentValue !== null && (
              <span className="sds-scale__value">{currentValue}</span>
            )}
          </div>
          <Divider className="sds-scale__divider" />
        </>
      )}
      <div className="sds-scale__body">
        <div className="sds-scale__graph" aria-hidden="true">
          {Array.from({ length: count }, (_, index) => (
            <span
              key={index}
              className={[
                'sds-scale__bar',
                index < filled && 'sds-scale__bar--filled',
              ]
                .filter(Boolean)
                .join(' ')}
            />
          ))}
        </div>
        {showLabels && (
          <div className="sds-scale__labels" aria-hidden="true">
            <span className="sds-scale__label">{minLabel}</span>
            <span className="sds-scale__label">{maxLabel}</span>
          </div>
        )}
      </div>
    </div>
  );
});
