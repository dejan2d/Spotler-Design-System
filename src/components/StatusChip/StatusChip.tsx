import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './StatusChip.css';

export type StatusChipVariant = 'default' | 'blue' | 'alert' | 'warning' | 'success';

export interface StatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  /** Color carries the meaning: default (neutral), blue (info), success, warning, alert (error). */
  variant?: StatusChipVariant;
  /** Optional leading icon (16px, FontAwesome Duotone node). */
  iconStart?: ReactNode;
  /** Chip label — keep the text; status must not rely on color alone. */
  children?: ReactNode;
}

/**
 * Status Chip — a non-interactive chip communicating an item's status through color.
 * Spec: references/components/status-chip.md. 24px tall, padding 4px 8px, radius large; cursor default.
 */
export const StatusChip = forwardRef<HTMLSpanElement, StatusChipProps>(function StatusChip(
  { variant = 'default', iconStart, className, children, ...rest },
  ref,
) {
  const classes = [
    'sds-status-chip',
    `sds-status-chip--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span ref={ref} className={classes} {...rest}>
      {iconStart && (
        <span className="sds-status-chip__icon" aria-hidden="true">
          {iconStart}
        </span>
      )}
      {children && <span className="sds-status-chip__label">{children}</span>}
    </span>
  );
});
