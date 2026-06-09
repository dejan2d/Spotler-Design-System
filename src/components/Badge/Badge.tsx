import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

/**
 * Visual form of the badge.
 * - `dot` — an 8px status circle with no text.
 * - `circle` — a 16px counter circle showing a centered number (Open Sans Semi-Bold 12).
 *   Matches the Spotler "Counter" variant; named `circle` to mirror the Figma `Badges/Circle` tokens.
 */
export type BadgeVariant = 'dot' | 'circle';

/**
 * Color / status of the badge.
 * Note: `warrning` preserves the Figma token spelling (double 'r') verbatim.
 */
export type BadgeColor = 'neutral' | 'primary' | 'inactive' | 'warrning' | 'active';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `dot` (8px, no text) or `circle` (16px counter, shows a number). Defaults to `dot`. */
  variant?: BadgeVariant;
  /** Color / status. `warrning` keeps the Figma token spelling. Defaults to `neutral`. */
  color?: BadgeColor;
  /** Number shown inside the `circle` variant. Ignored by `dot`. */
  count?: number;
  /**
   * Pin the badge to the top-right of a host icon/avatar and add a white separating stroke.
   * Wrap the host element and the overlay badge in a positioned container.
   */
  overlay?: boolean;
  /** Custom content for the `circle` variant when `count` is not supplied (e.g. "9+"). Ignored by `dot`. */
  children?: ReactNode;
  /**
   * Accessible label, e.g. `"3 unread"` or `"online"`. Required when the badge conveys
   * information not already in adjacent visible text; omit (and add `aria-hidden`) when it
   * is a purely decorative duplicate of visible text.
   */
  'aria-label'?: string;
}

/**
 * Badge — a minimal read-only indicator: a status dot or a small numeric counter.
 *
 * Spotler Design System component "Badge". Dot is an 8px circle; Circle (Counter) is a
 * 16px circle with circular radius and a centered Open Sans Semi-Bold 12 number. The
 * `overlay` prop pins it to the top-right of a host icon/avatar with a white separating stroke.
 * Colors: neutral, primary, inactive (red), warrning, active (green).
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'dot', color = 'neutral', count, overlay = false, className, children, ...rest },
  ref,
) {
  const classes = [
    'sds-badge',
    `sds-badge--${variant}`,
    `sds-badge--${color}`,
    overlay && 'sds-badge--overlay',
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
