import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './ProgressBar.css';

/** Color variant. Mirrors the Spotler "Progress Bar" component variants. */
export type ProgressBarVariant = 'primary' | 'neutral';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /**
   * Color variant.
   * `primary` fills with the conceptual blue; `neutral` fills with monochrome gray.
   * @default 'primary'
   */
  variant?: ProgressBarVariant;
  /**
   * Completion value, clamped to `min`..`max`. Ignored when `indeterminate` is set.
   * @default 0
   */
  value?: number;
  /**
   * Lower bound of the range.
   * @default 0
   */
  min?: number;
  /**
   * Upper bound of the range.
   * @default 100
   */
  max?: number;
  /**
   * Indeterminate (unknown total) progress. Animates a moving fill and omits
   * `aria-valuenow` per the spec. Prefer a Loader for unknown-duration waits.
   * @default false
   */
  indeterminate?: boolean;
  /**
   * Optional visible label shown alongside the track (e.g. "Uploading" or "60%").
   * Never rely on color alone to convey state — pair the bar with a label or percentage.
   */
  label?: string;
  /**
   * Accessible name for the progress bar. Required when no visible `label` is
   * provided so assistive tech can announce what is progressing.
   */
  ariaLabel?: string;
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * Progress Bar — Spotler Design System.
 *
 * A linear indicator of completion or ongoing progress toward a known total
 * (uploads, multi-item processing, completion meters). For unknown-duration waits
 * use a Loader; progress bars are not interactive (never a slider).
 *
 * Anatomy: rounded track (8px tall, radius small) with a filled portion proportional
 * to value; optional percentage/label. Fill changes animate smoothly. Variants:
 * Primary, Neutral. States: determinate, indeterminate.
 *
 * Accessibility: renders `role="progressbar"` with `aria-valuenow/min/max`. For
 * indeterminate work `aria-valuenow` is omitted and `aria-busy` is set.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  {
    variant = 'primary',
    value = 0,
    min = 0,
    max = 100,
    indeterminate = false,
    label,
    ariaLabel,
    className,
    ...rest
  },
  ref,
) {
  const safeMax = max > min ? max : min + 1;
  const pct = indeterminate ? 0 : ((clamp(value, min, safeMax) - min) / (safeMax - min)) * 100;

  const classes = [
    'sds-progress-bar',
    `sds-progress-bar--${variant}`,
    indeterminate && 'sds-progress-bar--indeterminate',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} {...rest}>
      <div
        className="sds-progress-bar__track"
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={safeMax}
        aria-valuenow={indeterminate ? undefined : clamp(value, min, safeMax)}
        aria-busy={indeterminate || undefined}
        aria-label={ariaLabel ?? label ?? 'Progress'}
        aria-valuetext={!indeterminate && label ? label : undefined}
      >
        <div
          className="sds-progress-bar__fill"
          style={indeterminate ? undefined : { width: `${pct}%` }}
        />
      </div>
      {label && (
        <span className="sds-progress-bar__label" aria-hidden="true">
          {label}
        </span>
      )}
    </div>
  );
});
