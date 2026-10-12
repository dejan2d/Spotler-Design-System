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
   * Visual emphasis / intent (Figma `Variant`). Only ONE `primary` per view.
   * Icon rules from the Figma Button page notes:
   * - `primary` (blue): no icon.
   * - `primary-accent` (yellow): creation actions only; always a `+` (`plus`) icon.
   * - `secondary`, `tertiary`: icon optional — only when it helps communicate the action.
   * - `textlink`: icon optional. Renders a frameless text run, underlined on hover.
   * - `destructive`, `warning`: no icon.
   * - `destructive-outline`: always a trash icon; not in modals or context menus and
   *   never combined with a `destructive` button.
   * @default 'primary'
   */
  variant?: ButtonVariant;
  /**
   * Selected (toggle) state (Figma `State=Selected`). Adds a 2px inside stroke with a
   * 2px white inner ring (no ring on `textlink`) and a Paragraph - Semi Bold label.
   * Exposes `aria-pressed` to assistive tech.
   * @default false
   */
  selected?: boolean;
  /** Optional leading icon (20px, Figma `Icon Start`). Use a FontAwesome Duotone icon node. */
  iconStart?: ReactNode;
  /** Optional trailing icon (20px, Figma `Icon End`). Use a FontAwesome Duotone icon node. */
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
 * Figma: "Button" component set 458:12420 (page 29:5).
 * Sizing: height 36px, min-width 80px (hugs wider labels), padding 8px 16px, gap 8px,
 * border-radius circular. Label: Paragraph - Regular (14px); Semi Bold when selected.
 * Optional 20px leading/trailing icon. Strokes sit inside and never change the size.
 * Variants: Primary, Primary Accent, Secondary, Tertiary, TextLink, Destructive,
 * Destructive Outline, Warning. States: rest, hover, selected, disabled.
 *
 * Per-variant specifics (Figma):
 * - Secondary: 1px stroke, no fill at rest; Tertiary: no fill, no stroke at rest.
 * - Destructive Outline: on hover the red stroke disappears and only the fill shows.
 * - TextLink: frameless text run — no padding, no fixed height, no min-width, no fill
 *   or stroke; underlined on hover only.
 * - Disabled: filled variants get the Disabled/background fill; Secondary and
 *   Destructive Outline keep only a Disabled/stroke outline; Tertiary and TextLink
 *   have no fill and no stroke. Text/icon use Disabled/text and Disabled/icon.
 * The keyboard focus ring is not designed in Figma; it is kept for accessibility.
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
