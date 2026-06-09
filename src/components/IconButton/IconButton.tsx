import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';

/** Visual emphasis. Mirrors the Spotler "Icon Button" component variants. */
export type IconButtonVariant = 'secondary' | 'tertiary';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual emphasis.
   * `secondary` (white background + border) is the default choice;
   * `tertiary` is the transparent, borderless lowest-emphasis ghost.
   * @default 'secondary'
   */
  variant?: IconButtonVariant;
  /**
   * Selected (toggle) state. Adds a 2px stroke + inset white ring and exposes
   * `aria-pressed` to assistive tech.
   * @default false
   */
  selected?: boolean;
  /**
   * REQUIRED accessible label — there is no visible text. Describes the action,
   * e.g. "Delete row" or "More options".
   */
  'aria-label': string;
  /** The centered 20px icon node (a FontAwesome Duotone icon in real use). */
  icon: ReactNode;
  /**
   * Reason shown as a tooltip when disabled. Per spec, disabled controls prefer
   * `aria-disabled` + a tooltip reason so the reason stays discoverable.
   */
  disabledReason?: string;
}

/**
 * IconButton — Spotler Design System.
 *
 * A compact, icon-only button for toolbars, row actions, and universally
 * understood controls where space is limited. Same hierarchy as Button, without
 * a visible label, so an `aria-label` is always required.
 *
 * Sizing: 36×36 visual box, padding 6px, border-radius circular, centered 20px
 * icon, with a ≥44px hit area for touch. Variants: Secondary (white + border),
 * Tertiary (transparent ghost). States: default, hover, selected, disabled.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  {
    variant = 'secondary',
    selected = false,
    icon,
    disabled,
    disabledReason,
    className,
    type = 'button',
    title,
    ...rest
  },
  ref,
) {
  const classes = [
    'sds-icon-button',
    `sds-icon-button--${variant}`,
    selected && 'sds-icon-button--selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      // Prefer aria-disabled + tooltip reason over a hard `disabled` so the reason is discoverable,
      // while still setting the native attribute to block activation.
      aria-disabled={disabled || undefined}
      disabled={disabled}
      aria-pressed={selected || undefined}
      title={disabled ? (disabledReason ?? title) : title}
      {...rest}
    >
      <span className="sds-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
});
