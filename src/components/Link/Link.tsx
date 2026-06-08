import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import './Link.css';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /** Selected/active state — semi-bold + darker text. */
  selected?: boolean;
  /** Visually disable the link (removes href, sets aria-disabled). */
  disabled?: boolean;
  children?: ReactNode;
}

/**
 * Link — an inline text link for navigation or low-emphasis actions within body copy.
 * Spec: references/components/link.md. Renders a real <a>; always underlined.
 * Reuses Button/TextLink color tokens (no separate Link token group exists).
 */
export const Link = forwardRef<HTMLAnchorElement, LinkProps>(function Link(
  { selected = false, disabled = false, href, className, children, ...rest },
  ref,
) {
  const classes = [
    'sds-link',
    selected && 'sds-link--selected',
    disabled && 'sds-link--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <a
      ref={ref}
      className={classes}
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      aria-current={selected ? 'page' : undefined}
      {...rest}
    >
      {children}
    </a>
  );
});
