import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import './IconButton.css';

export type IconButtonVariant = 'secondary' | 'tertiary';

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual emphasis. `secondary` (white + border) is the default; `tertiary` is the lowest-emphasis ghost. */
  variant?: IconButtonVariant;
  /** Selected (toggle) state — adds the inset ring + border and sets aria-pressed. */
  selected?: boolean;
  /** REQUIRED accessible label — there is no visible text. */
  'aria-label': string;
  /** The 20px icon node (FontAwesome Duotone icon). */
  icon: ReactNode;
  /** Reason shown as a tooltip when disabled (also used as title). */
  disabledReason?: string;
}

/**
 * Icon Button — a compact, icon-only button for tight spaces or universally understood actions.
 * Spec: references/components/icon-button.md. 36×36, padding 6px, radius circular, 20px icon.
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
      aria-disabled={disabled || undefined}
      disabled={disabled}
      aria-pressed={selected || undefined}
      title={disabled ? disabledReason : undefined}
      {...rest}
    >
      <span className="sds-icon-button__icon" aria-hidden="true">
        {icon}
      </span>
    </button>
  );
});
