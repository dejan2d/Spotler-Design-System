import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

/** Visual/structural variant. Only `product-specific` is selectable/stateful. */
export type CardVariant = 'info' | 'action' | 'item' | 'product-specific';

/** Aspect ratio of the `item` variant's leading image/media region. */
export type CardImageRatio = '4:3' | '13:9';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Structural variant. Only `product-specific` is selectable/stateful. @default 'info' */
  variant?: CardVariant;
  /** Optional heading icon (FontAwesome Duotone) shown before the heading. */
  headingIcon?: ReactNode;
  /** Optional heading text. */
  heading?: ReactNode;
  /**
   * `action` variant only — renders the close (xmark) control when set.
   * Provide the glyph via `closeIcon`; never hardcode a glyph.
   */
  onClose?: () => void;
  /** Glyph for the `action` close control (FontAwesome Duotone `xmark`). */
  closeIcon?: ReactNode;
  /** Accessible label for the `action` close control. @default 'Close' */
  closeLabel?: string;
  /**
   * `info` variant only — divider between heading and body.
   * @default true
   */
  divider?: boolean;
  /** `info` variant only — small helper text below the body. */
  helpText?: ReactNode;
  /**
   * `item` variant only — leading media. Pass an `<img>` (decorative images
   * MUST use empty `alt=""`) or a placeholder node; rendered inside a ratio box.
   */
  media?: ReactNode;
  /** `item` variant only — aspect ratio of the media region. @default '4:3' */
  imageRatio?: CardImageRatio;
  /** `item`/`action` variant — footer region for status badges and actions. */
  footer?: ReactNode;
  /** `product-specific` only — selected state. Sets `aria-pressed`. */
  selected?: boolean;
  /** `product-specific` only — disabled state. Removes interactivity. */
  disabled?: boolean;
  /** Body content. */
  children?: ReactNode;
}

/**
 * Card — Spotler Design System.
 * Groups related content/actions on a single raised surface.
 *
 * Variants: Info (read-only icon + heading, divider, body, helper),
 * Action (heading + xmark close + actions footer), Item (media + headline +
 * body + footer), Product Specific (the only selectable/stateful card).
 *
 * Spec: radius 4px (Border/Small), Drop Shadow/50 (0 0 4px), inner padding 24px,
 * region gap 24px. Headings #002A4D, body #353B40.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    variant = 'info',
    headingIcon,
    heading,
    onClose,
    closeIcon,
    closeLabel = 'Close',
    divider = true,
    helpText,
    media,
    imageRatio = '4:3',
    footer,
    selected = false,
    disabled = false,
    className,
    children,
    ...rest
  },
  ref,
) {
  const isSelectable = variant === 'product-specific';
  const showHeader = Boolean(heading || headingIcon || (variant === 'action' && onClose));
  const showDivider = variant === 'info' && divider && showHeader;
  const ratioModifier = imageRatio === '13:9' ? 'thirteen-nine' : 'four-three';

  const classes = [
    'sds-card',
    `sds-card--${variant}`,
    isSelectable && selected && 'sds-card--selected',
    isSelectable && disabled && 'sds-card--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      // Only the selectable variant is a real control. Use aria-pressed for the
      // selected toggle; never convey selection by color alone.
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable && !disabled ? 0 : undefined}
      aria-pressed={isSelectable ? selected : undefined}
      aria-disabled={isSelectable && disabled ? true : undefined}
      {...rest}
    >
      {variant === 'item' && media && (
        <div
          className={`sds-card__media sds-card__media--${ratioModifier}`}
          data-ratio={imageRatio}
        >
          {media}
        </div>
      )}

      {showHeader && (
        <div className="sds-card__header">
          {headingIcon && (
            <span className="sds-card__heading-icon" aria-hidden="true">
              {headingIcon}
            </span>
          )}
          {heading && <span className="sds-card__heading">{heading}</span>}
          {variant === 'action' && onClose && (
            <button
              type="button"
              className="sds-card__close"
              aria-label={closeLabel}
              onClick={onClose}
            >
              {closeIcon && (
                <span className="sds-card__close-icon" aria-hidden="true">
                  {closeIcon}
                </span>
              )}
            </button>
          )}
        </div>
      )}

      {showDivider && <hr className="sds-card__divider" aria-hidden="true" />}

      {children != null && children !== false && (
        <div className="sds-card__body">{children}</div>
      )}

      {variant === 'info' && helpText && (
        <p className="sds-card__help-text">{helpText}</p>
      )}

      {footer && (variant === 'item' || variant === 'action') && (
        <div className="sds-card__footer">{footer}</div>
      )}
    </div>
  );
});
