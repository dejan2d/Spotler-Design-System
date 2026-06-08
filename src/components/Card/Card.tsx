import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

export type CardVariant = 'info' | 'action' | 'product-specific';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card variant. Only `product-specific` is selectable/stateful. */
  variant?: CardVariant;
  /** Optional heading icon (FontAwesome Duotone). */
  headingIcon?: ReactNode;
  /** Optional heading text. */
  heading?: ReactNode;
  /** For `action` variant: handler for the close (xmark) control. */
  onClose?: () => void;
  /** For `product-specific`: selected state. */
  selected?: boolean;
  children?: ReactNode;
}

/**
 * Card — groups related content on a single raised surface.
 * Spec: references/components/card.md. radius 4px, Drop Shadow/50, padding 24px.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'info', headingIcon, heading, onClose, selected, className, children, ...rest },
  ref,
) {
  const isSelectable = variant === 'product-specific';
  const classes = [
    'sds-card',
    `sds-card--${variant}`,
    selected && 'sds-card--selected',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      tabIndex={isSelectable ? 0 : undefined}
      aria-selected={isSelectable ? Boolean(selected) : undefined}
      {...rest}
    >
      {(heading || headingIcon || variant === 'action') && (
        <div className="sds-card__header">
          {headingIcon && <span className="sds-card__heading-icon" aria-hidden="true">{headingIcon}</span>}
          {heading && <span className="sds-card__heading">{heading}</span>}
          {variant === 'action' && onClose && (
            <button type="button" className="sds-card__close" aria-label="Close" onClick={onClose}>
              ✕
            </button>
          )}
        </div>
      )}
      <div className="sds-card__body">{children}</div>
    </div>
  );
});
