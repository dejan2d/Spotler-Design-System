import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './StatusChip.css';

/**
 * Status color. Maps to the Figma `State` property (set 9359:1696):
 * `Default` → `default` (gray), `Neutral/Blue` → `blue` (info), `Success` → `success`,
 * `Warning` → `warning`, `Alert` → `alert` (error).
 */
export type StatusChipVariant = 'default' | 'blue' | 'alert' | 'warning' | 'success';

export interface StatusChipProps extends HTMLAttributes<HTMLSpanElement> {
  /**
   * Color carries the meaning (Figma `State`): default (gray), blue (Figma Neutral/Blue — info,
   * in progress), success, warning, alert (failed, blocked, error). Defaults to `default`.
   */
  variant?: StatusChipVariant;
  /**
   * Optional leading icon (Figma `Icon` / `Icon Change`): 16×16 FontAwesome Duotone node.
   * The icon is decorative (aria-hidden).
   */
  iconStart?: ReactNode;
  /**
   * Chip label — keep the text; status must not rely on color alone.
   * Icon-only chips (no visible label) must instead provide `aria-label`
   * so the status has an accessible name and isn't conveyed by color alone.
   */
  children?: ReactNode;
}

/**
 * Status Chip — a non-interactive chip communicating an item's status through color.
 *
 * Spotler Design System "Status Chip" (Figma set 9359:1696). Row, 24px tall, padding 4px 8px,
 * gap 8px, radius 8px (large), items centered; 16px icon; label text style Paragraph - Small.
 * Colors from the Status Chip/<state>-background|text|icon tokens. Cursor default.
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
