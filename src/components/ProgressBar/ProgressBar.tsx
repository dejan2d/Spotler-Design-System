import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './ProgressBar.css';

/**
 * Color variant. Mirrors the Figma "Progress bar" `Type` property (set 670:14965):
 * `Primary` → `primary`, `Neutral` → `neutral`, `Disabled` → `disabled`.
 */
export type ProgressBarVariant = 'primary' | 'neutral' | 'disabled';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /**
   * Color variant (Figma `Type`).
   * - `primary` — blue fill; use on white backgrounds.
   * - `neutral` — gray fill; use on colored backgrounds (including inside alerts).
   * - `disabled` — Disabled/background track, Disabled/icon fill, Disabled/text labels.
   * @default 'primary'
   */
  variant?: ProgressBarVariant;
  /**
   * Completion value, clamped to `min`..`max`.
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
   * Show the label before the track (Figma `Show Left Label`).
   * @default true
   */
  showLeftLabel?: boolean;
  /**
   * Show the label after the track (Figma `Show Label Right`).
   * @default true
   */
  showRightLabel?: boolean;
  /**
   * Text of the visible labels. Defaults to the rounded percentage (e.g. `"70%"`), which is
   * what Figma's `Percentage` text layers show.
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
 * Progress Bar — Spotler Design System (Figma "Progress bar", set 670:14965).
 *
 * A linear indicator of completion toward a known total (uploads, multi-item processing,
 * completion meters). For unknown-duration waits use a Loader; progress bars are not
 * interactive (never a slider).
 *
 * Figma spec: horizontal row, gap 12px, items centered. Optional percentage label on each
 * side (both shown by default), text style Paragraph - Regular. Track 8px tall, radius 4px;
 * fill radius 4px. Types: Primary (Progress Bar/primary-*), Neutral (Progress Bar/neutral-*),
 * Disabled (Disabled/background, Disabled/icon, Disabled/text).
 *
 * Accessibility: renders `role="progressbar"` with `aria-valuenow/min/max`; the visible
 * labels are `aria-hidden` duplicates; `disabled` sets `aria-disabled`.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  {
    variant = 'primary',
    value = 0,
    min = 0,
    max = 100,
    showLeftLabel = true,
    showRightLabel = true,
    label,
    ariaLabel,
    className,
    ...rest
  },
  ref,
) {
  const safeMax = max > min ? max : min + 1;
  const clamped = clamp(value, min, safeMax);
  const pct = ((clamped - min) / (safeMax - min)) * 100;
  const labelText = label ?? `${Math.round(pct)}%`;

  const classes = [
    'sds-progress-bar',
    `sds-progress-bar--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} {...rest}>
      {showLeftLabel && labelText && (
        <span className="sds-progress-bar__label sds-progress-bar__label--left" aria-hidden="true">
          {labelText}
        </span>
      )}
      <div
        className="sds-progress-bar__track"
        role="progressbar"
        aria-valuemin={min}
        aria-valuemax={safeMax}
        aria-valuenow={clamped}
        aria-disabled={variant === 'disabled' || undefined}
        aria-label={ariaLabel ?? label ?? 'Progress'}
        aria-valuetext={label}
      >
        <div className="sds-progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      {showRightLabel && labelText && (
        <span className="sds-progress-bar__label sds-progress-bar__label--right" aria-hidden="true">
          {labelText}
        </span>
      )}
    </div>
  );
});
