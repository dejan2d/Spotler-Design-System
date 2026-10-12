import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Badge.css';

/**
 * Visual form of the badge. Maps to the Figma `Type` property (set 455:7448):
 * - `circle` — Figma `Counter`: a 16px-tall counter pill showing a centered number
 *   (12px Semi Bold). Named `circle` to mirror the `Badges/Circle` tokens.
 * - `dot` — Figma `Dot`: an 8px status circle with no text.
 */
export type BadgeVariant = 'dot' | 'circle';

/**
 * Color / status of the badge. Maps to the Figma `Color` property:
 * `Neutral` → `neutral`, `Primary` → `primary`, `Red` → `inactive`,
 * `Yellow` → `warrning`, `Green` → `active`.
 * Note: `warrning` preserves the Figma token spelling (double 'r') verbatim.
 */
export type BadgeColor = 'neutral' | 'primary' | 'inactive' | 'warrning' | 'active';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** `circle` (Figma Counter, shows a number) or `dot` (8px, no text). Defaults to `circle` (Figma default). */
  variant?: BadgeVariant;
  /** Color / status. `warrning` keeps the Figma token spelling. Defaults to `neutral`. */
  color?: BadgeColor;
  /** Number shown inside the `circle` variant (Figma `Input`). Ignored by `dot`. */
  count?: number;
  /**
   * Overlay the badge on a host icon/avatar (Figma "Badge with instance", set 455:7775).
   * Wrap the host element and the badge in a `position: relative` container sized to the host.
   * Placement follows Figma: a counter sits at the top-right corner, a dot at the
   * bottom-right corner. Only the neutral dot gets the 1px white separating ring
   * (Badges/Dot/neutral-stroke), as in Figma.
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
 * Badge — a minimal read-only indicator: a numeric counter or a status dot.
 *
 * Spotler Design System component "Badge" (Figma set 455:7448, default Type=Counter,
 * Color=Neutral). Counter: 16px tall, min 16px wide, padding 2px 4.5px, circular radius,
 * centered 12px Semi Bold number (line height 90%). Dot: 8px circle, no stroke.
 * The `overlay` prop pins it to a host icon/avatar (counter top-right, dot bottom-right).
 * Colors: neutral, primary, inactive (red), warrning (yellow), active (green).
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { variant = 'circle', color = 'neutral', count, overlay = false, className, children, ...rest },
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
