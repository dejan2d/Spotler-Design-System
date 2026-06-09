import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

/** Visual emphasis / intent. Mirrors the Spotler "Button" component variants. */
export type ButtonVariant =
  | 'primary'
  | 'primary-accent'
  | 'secondary'
  | 'tertiary'
  | 'textlink'
  | 'destructive'
  | 'destructive-outline'
  | 'warning';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Visual emphasis / intent. Only ONE `primary` per view.
   * `primary-accent` (yellow) is for creation actions only and should always carry a `+` / `fa-plus` icon.
   * `textlink` renders an inline, frameless link-styled action.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Selected (toggle) state. Adds a 2px stroke + inset white ring and a Semi-Bold label,
   * and exposes `aria-pressed` to assistive tech.
   * @default false
   */
  selected?: boolean;
  /** Optional leading icon (20px). Use a FontAwesome Duotone icon node. */
  iconStart?: ReactNode;
  /** Optional trailing icon (20px). Use a FontAwesome Duotone icon node. */
  iconEnd?: ReactNode;
  /**
   * Reason shown as a tooltip when disabled. Per spec, disabled buttons prefer
   * `aria-disabled` + a tooltip reason so the reason stays discoverable.
   */
  disabledReason?: string;
  /** Visible label. Icon-only buttons must instead provide `aria-label`. */
  children?: ReactNode;
}

/**
 * Button — Spotler Design System.
 *
 * An interactive element that initiates an action (submit, confirm, navigate, open).
 * Choose the variant by the action's importance; only one `primary` per view.
 *
 * Sizing: height 36px, min-width 80px, padding 8px 16px, gap 8px, border-radius circular.
 * Optional 20px leading/trailing icon. Variants: Primary, Primary Accent, Secondary,
 * Tertiary, TextLink, Destructive, Destructive Outline, Warning.
 * States: rest, hover, selected, disabled.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    selected = false,
    iconStart,
    iconEnd,
    disabled,
    disabledReason,
    className,
    children,
    type = 'button',
    title,
    ...rest
  },
  ref,
) {
  const classes = [
    'sds-button',
    `sds-button--${variant}`,
    selected && 'sds-button--selected',
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
      {iconStart && (
        <span className="sds-button__icon" aria-hidden="true">
          {iconStart}
        </span>
      )}
      {children && <span className="sds-button__label">{children}</span>}
      {iconEnd && (
        <span className="sds-button__icon" aria-hidden="true">
          {iconEnd}
        </span>
      )}
    </button>
  );
});
