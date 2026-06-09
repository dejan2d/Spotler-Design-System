import { forwardRef } from 'react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';
import './Link.css';

export interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * Selected / active state — renders the darker text color with a Semi-Bold
   * weight and exposes `aria-current="page"` to assistive tech.
   * @default false
   */
  selected?: boolean;
  /**
   * Visually and functionally disable the link. Removes `href` (so it is no
   * longer focusable as a link target), sets `aria-disabled`, and blocks
   * pointer activation. The underline is kept as the non-color cue.
   * @default false
   */
  disabled?: boolean;
  /**
   * Link text. Must describe the destination — avoid "click here".
   * The underline is always rendered so the link is distinguishable without
   * relying on color alone.
   */
  children?: ReactNode;
}

/**
 * Link — Spotler Design System.
 *
 * An inline text link for navigation or low-emphasis actions within or
 * alongside body copy (the former TextLink action, rendered as a real link).
 * Renders a semantic `<a>` and is always underlined so it stays distinguishable
 * without relying on color alone.
 *
 * Sizing: inherits the surrounding text size; standalone default is
 * Body/Paragraph - Regular (14/20).
 * States: rest (Primary/Conceptual), hover (Primary/Conceptual darker),
 * selected/active (darker + Semi-Bold), disabled (#9FACB3).
 *
 * Reuses the TextLink color values from the Spotler "Button" component
 * (`Button/TextLink/*`); no separate Link token group exists.
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
      // Drop the destination when disabled so the link is no longer a valid
      // navigation target, while keeping it discoverable via aria-disabled.
      href={disabled ? undefined : href}
      aria-disabled={disabled || undefined}
      aria-current={selected ? 'page' : undefined}
      {...rest}
    >
      {children}
    </a>
  );
});
