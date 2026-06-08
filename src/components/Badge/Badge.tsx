import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Badge.css';

export type BadgeVariant = 'dot' | 'circle';

/** Note: `warrning` preserves the Figma token typo verbatim. */
export type BadgeColor = 'neutral' | 'primary' | 'inactive' | 'warrning' | 'active';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `dot` (8px, no text) or `circle` (16px, shows a number). */
  variant?: BadgeVariant;
  /** Color/status. `warrning` keeps the Figma token spelling. */
  color?: BadgeColor;
  /** Number shown inside the `circle` variant. Ignored by `dot`. */
  count?: number;
  /** Accessible label (e.g. "3 unread" / "online"). Read-only indicator. */
  'aria-label'?: string;
}

/**
 * Badge — a minimal read-only indicator: a status dot or a small numeric counter.
 * Spec: references/components/badge.md. Dot 8px; Circle 16px (radius circular).
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'dot', color = 'neutral', count, className, children, ...rest },
  ref,
) {
  const classes = [
    'sds-badge',
    `sds-badge--${variant}`,
    `sds-badge--${color}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span ref={ref} className={classes} {...rest}>
      {variant === 'circle' && (count ?? children)}
    </span>
  );
});
