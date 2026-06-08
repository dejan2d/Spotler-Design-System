import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './ProgressBar.css';

export type ProgressBarVariant = 'primary' | 'neutral';

export interface ProgressBarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'role'> {
  /** Color variant. */
  variant?: ProgressBarVariant;
  /** Completion value, 0–100. */
  value: number;
  /** Optional label shown alongside the track (e.g. a percentage). */
  label?: string;
}

const clamp = (n: number) => Math.max(0, Math.min(100, n));

/**
 * Progress Bar — a linear indicator of completion toward a known total.
 * Spec: references/components/progress-bar.md. role="progressbar" with aria-valuenow/min/max.
 */
export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(function ProgressBar(
  { variant = 'primary', value, label, className, ...rest },
  ref,
) {
  const pct = clamp(value);

  const classes = [
    'sds-progress-bar',
    `sds-progress-bar--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} {...rest}>
      <div
        className="sds-progress-bar__track"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div className="sds-progress-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      {label && <span className="sds-progress-bar__label">{label}</span>}
    </div>
  );
});
