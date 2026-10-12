import { forwardRef } from 'react';
import type {
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  ReactNode,
} from 'react';
import './Card.css';

/**
 * Structural variant, one per Figma Cards component:
 * `info` (Info card 864:67419), `content` (Content card 861:9052), `item` (Item card 864:67420),
 * `product-specific` (Product specific card 864:64294 — the only selectable/stateful card).
 */
export type CardVariant = 'info' | 'content' | 'item' | 'product-specific';

/**
 * Ratio of the media region (Figma "image placeholder" 861:9119):
 * `4:3` 320×240 · `13:9` 320×180 · `header` 320×130 (Figma "header img").
 */
export type CardImageRatio = '4:3' | '13:9' | 'header';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Structural variant. @default 'info' */
  variant?: CardVariant;
  /**
   * Optional heading icon (FontAwesome Duotone) shown before the heading, 8px apart.
   * 32px on `info`, 20px elsewhere.
   */
  headingIcon?: ReactNode;
  /**
   * Optional heading text. Figma text style: H4 on `info`, H3 on `content` and `item`.
   */
  heading?: ReactNode;
  /**
   * `content` variant only — renders the close (`xmark`, 20px) control when set.
   * Provide the glyph via `closeIcon`; never hardcode a glyph.
   */
  onClose?: () => void;
  /** Glyph for the `content` close control (FontAwesome Duotone `xmark`). */
  closeIcon?: ReactNode;
  /** Accessible label for the `content` close control. @default 'Close' */
  closeLabel?: string;
  /**
   * `info` variant only — 1px Monochrome/Gray-200 rule under the heading, 16px below it.
   * @default true
   */
  divider?: boolean;
  /** `info` variant only — small helper text below the body (Paragraph - Small). */
  helpText?: ReactNode;
  /**
   * `item` and `content` variants — leading media (Figma "image placeholder", radius 4).
   * Pass an `<img>` (decorative images MUST use empty `alt=""`) or a placeholder node;
   * rendered inside a ratio box with the Monochrome/Gray-600 placeholder fill.
   */
  media?: ReactNode;
  /** `item` / `content` — ratio of the media region. @default '4:3' */
  imageRatio?: CardImageRatio;
  /**
   * `item` variant only — the Figma "In stock + price" row (24px padding, items spread
   * apart, Paragraph - Small in Cards/Action/additional-text), e.g. a label and a StatusChip.
   */
  meta?: ReactNode;
  /**
   * `item` / `content` — actions row (Figma "Actions": padding 8/24/24/24). Buttons sit
   * left, 8px apart.
   */
  footer?: ReactNode;
  /**
   * `item` / `content` — trailing control pushed to the right end of the actions row
   * (Figma: a Secondary Icon button, 36px).
   */
  trailingAction?: ReactNode;
  /** `product-specific` only — selected state. Sets `aria-pressed`. */
  selected?: boolean;
  /** `product-specific` only — disabled state. Removes interactivity. */
  disabled?: boolean;
  /** Body content. */
  children?: ReactNode;
}

const RATIO_MODIFIER: Record<CardImageRatio, string> = {
  '4:3': 'four-three',
  '13:9': 'thirteen-nine',
  header: 'header',
};

/**
 * Card — Spotler Design System (Figma page Cards).
 * Groups related content/actions on a single raised surface.
 *
 * All cards: radius 4px (Border/Small), effect Drop Shadow/50.
 * - Info: padding 24, gap 24; 32px icon + H4 heading over a 1px Monochrome/Gray-200 rule
 *   (16px below), body, helper (Paragraph - Small).
 * - Content: header 16/24 (20px icon + H3 + `xmark` close), content 16/24/24/24
 *   (media + body, gap 24), actions 8/24/24/24.
 * - Item: content 24/24/16/24 (media, then H3 headline + body 16px apart, body inset 8px),
 *   "In stock + price" row 24, actions 8/24/24/24.
 * - Product Specific: padding 24, gap 24; Default / Hover / Focus / Selected / Disabled
 *   (Disabled keeps the shadow and has no border).
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
    meta,
    footer,
    trailingAction,
    selected = false,
    disabled = false,
    className,
    children,
    onClick,
    onKeyDown,
    ...rest
  },
  ref,
) {
  const isSelectable = variant === 'product-specific';
  const isSectioned = variant === 'content' || variant === 'item';
  const showHeader = Boolean(heading || headingIcon || (variant === 'content' && onClose));
  const showDivider = variant === 'info' && divider && showHeader;
  const hasBody = children != null && children !== false;
  const isInert = isSelectable && disabled;

  // The selectable variant is a real control: block activation when disabled and
  // mirror native button keyboard activation (Enter / Space) for the role="button".
  const handleClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (isInert) return;
    onClick?.(event);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (!isSelectable || disabled || event.defaultPrevented) return;
    if (event.key === 'Enter' || event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault();
      event.currentTarget.click();
    }
  };

  const classes = [
    'sds-card',
    `sds-card--${variant}`,
    isSelectable && selected && 'sds-card--selected',
    isSelectable && disabled && 'sds-card--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const mediaNode = isSectioned && media && (
    <div
      className={`sds-card__media sds-card__media--${RATIO_MODIFIER[imageRatio]}`}
      data-ratio={imageRatio}
    >
      {media}
    </div>
  );

  const headerNode = showHeader && (
    <div
      className={['sds-card__header', showDivider && 'sds-card__header--divider']
        .filter(Boolean)
        .join(' ')}
    >
      {headingIcon && (
        <span className="sds-card__heading-icon" aria-hidden="true">
          {headingIcon}
        </span>
      )}
      {heading && <span className="sds-card__heading">{heading}</span>}
      {variant === 'content' && onClose && (
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
  );

  const bodyNode = hasBody && <div className="sds-card__body">{children}</div>;

  const footerNode = isSectioned && (footer || trailingAction) && (
    <div className="sds-card__footer">
      {footer}
      {trailingAction && <span className="sds-card__trailing-action">{trailingAction}</span>}
    </div>
  );

  let content: ReactNode;
  if (variant === 'content') {
    content = (
      <>
        {headerNode}
        {(mediaNode || bodyNode) && (
          <div className="sds-card__main">
            {mediaNode}
            {bodyNode}
          </div>
        )}
        {footerNode}
      </>
    );
  } else if (variant === 'item') {
    content = (
      <>
        {(mediaNode || headerNode || bodyNode) && (
          <div className="sds-card__main">
            {mediaNode}
            {(headerNode || bodyNode) && (
              <div className="sds-card__text">
                {headerNode}
                {bodyNode}
              </div>
            )}
          </div>
        )}
        {meta && <div className="sds-card__meta">{meta}</div>}
        {footerNode}
      </>
    );
  } else {
    content = (
      <>
        {headerNode}
        {bodyNode}
        {variant === 'info' && helpText && <p className="sds-card__help-text">{helpText}</p>}
      </>
    );
  }

  return (
    <div
      ref={ref}
      className={classes}
      // Only the selectable variant is a real control. Use aria-pressed for the
      // selected toggle; never convey selection by color alone.
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable && !disabled ? 0 : undefined}
      aria-pressed={isSelectable ? selected : undefined}
      aria-disabled={isInert ? true : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      {content}
    </div>
  );
});
