import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './Button.css';

export type ButtonVariant =
  | 'primary'
  | 'primary-accent'
  | 'secondary'
  | 'tertiary'
  | 'destructive'
  | 'destructive-outline'
  | 'warning';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis / intent. Only ONE `primary` per view. `primary-accent` is for creation actions only. */
  variant?: ButtonVariant;
  /** Selected (toggle) state — adds the inset ring + semibold label and sets aria-pressed. */
  selected?: boolean;
  /** Optional leading icon (20px). Use a FontAwesome Duotone icon node. */
  iconStart?: ReactNode;
  /** Optional trailing icon (20px). */
  iconEnd?: ReactNode;
  /** Reason shown as a tooltip when disabled (also used as title). */
  disabledReason?: string;
  children?: ReactNode;
}

/**
 * Button — initiates an action. Choose the variant by the action's importance.
 * Spec: references/components/button.md. Height 36px, padding 8px 16px, radius circular.
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
      // Prefer aria-disabled + tooltip reason over hard `disabled` so the reason is discoverable.
      aria-disabled={disabled || undefined}
      disabled={disabled}
      aria-pressed={selected || undefined}
      title={disabled ? disabledReason : undefined}
      {...rest}
    >
      {iconStart && <span className="sds-button__icon" aria-hidden="true">{iconStart}</span>}
      {children && <span className="sds-button__label">{children}</span>}
      {iconEnd && <span className="sds-button__icon" aria-hidden="true">{iconEnd}</span>}
    </button>
  );
});
