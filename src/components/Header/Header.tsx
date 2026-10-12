import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Divider } from '../Divider';
import './Header.css';

/**
 * Visual context for the header band. `page` mirrors the Figma "Header" component
 * (4661:20796); `modal` mirrors the Figma "Modal header" set (833:32979).
 */
export type HeaderVariant = 'page' | 'modal';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /**
   * Title text. `page`: Text Styles/Display Headings/H2, Headers/text.
   * `modal`: Text Styles/Title Headings/H4, Headers/Modal/text.
   */
  title: ReactNode;
  /**
   * Visual variant.
   * - `page` (Figma "Header"): Monochrome/White band, min-height 68px, 1px Monochrome/Gray-200
   *   bottom border, no padding, left and right content 16px apart.
   * - `modal` (Figma "Modal header"): Monochrome/White, padding 24/40/16/40, 1px
   *   Monochrome/Gray-400 bottom border; reveals a right-aligned close control.
   * @default 'page'
   */
  variant?: HeaderVariant;
  /**
   * Optional leading icon (FontAwesome Duotone node). Figma "Header Icon" / "Icon Left":
   * 28px on `page` (Headers/icon), 20px on `modal` (Headers/Modal/icon).
   */
  icon?: ReactNode;
  /**
   * `page` only — Figma "Left Content" slots (e.g. filters or a selector) shown 24px after the
   * title, 16px apart.
   */
  leftContent?: ReactNode;
  /**
   * `page` only — trailing actions (Figma "Right Content"; Buttons, 16px apart). By convention
   * the Help button sits far-right and the yellow Primary Accent (create) button sits to its
   * left. The Figma Modal header has no actions slot.
   */
  actions?: ReactNode;
  /**
   * `page` only — show the vertical Divider (Divider/vertical, 28px tall) that opens the left
   * and right content groups (Figma "Header Divider" / "Right Divider", both on by default).
   * @default true
   */
  dividers?: boolean;
  /**
   * Handler for the modal close control. The close button only renders for the
   * `modal` variant when this handler is provided.
   */
  onClose?: () => void;
  /**
   * Icon node for the modal close control (Figma "Icon Right" = FontAwesome Duotone `xmark`,
   * 20px, Headers/Modal/close-icon). Always supply an icon for the close button.
   */
  closeIcon?: ReactNode;
  /**
   * Accessible label for the modal close control.
   * @default 'Close'
   */
  closeLabel?: string;
  /**
   * Heading level rendered for the title, mapping to the section/dialog outline.
   * @default 2
   */
  headingLevel?: 1 | 2 | 3 | 4;
  /** Id applied to the heading element — useful for wiring a dialog's `aria-labelledby`. */
  headingId?: string;
}

/**
 * Header — Spotler Design System.
 *
 * `page` (Figma "Header" 4661:20796): white band, min-height 68px, 1px Monochrome/Gray-200
 * bottom border, gap 16, content spread left/right. Left: icon (28px) + H2 title 8px apart,
 * then optional left content 24px later. Right: actions. Vertical Dividers open each
 * content group.
 *
 * `modal` (Figma "Modal header" 833:32979): white, padding 24/40/16/40, gap 16, 1px
 * Monochrome/Gray-400 bottom border; icon (20px) + H4 title 8px apart; `xmark` close (20px).
 *
 * The title is the section/dialog heading in the outline; the modal close exposes an
 * accessible label and is keyboard reachable.
 */
export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  {
    title,
    variant = 'page',
    icon,
    leftContent,
    actions,
    dividers = true,
    onClose,
    closeIcon,
    closeLabel = 'Close',
    headingLevel = 2,
    headingId,
    className,
    ...rest
  },
  ref,
) {
  const classes = ['sds-header', `sds-header--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  const Heading = `h${headingLevel}` as const;
  const isPage = variant === 'page';
  const showClose = variant === 'modal' && Boolean(onClose);
  const showDividers = isPage && dividers;

  return (
    <header ref={ref} className={classes} {...rest}>
      <div className="sds-header__left">
        <div className="sds-header__heading">
          {icon && (
            <span className="sds-header__icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <Heading id={headingId} className="sds-header__title">
            {title}
          </Heading>
        </div>
        {isPage && leftContent && (
          <div className="sds-header__left-content">
            {showDividers && (
              <Divider orientation="vertical" className="sds-header__divider" />
            )}
            {leftContent}
          </div>
        )}
      </div>
      {isPage && actions && (
        <div className="sds-header__actions">
          {showDividers && <Divider orientation="vertical" className="sds-header__divider" />}
          {actions}
        </div>
      )}
      {showClose && (
        <button
          type="button"
          className="sds-header__close"
          aria-label={closeLabel}
          onClick={onClose}
        >
          {closeIcon && (
            <span className="sds-header__close-icon" aria-hidden="true">
              {closeIcon}
            </span>
          )}
        </button>
      )}
    </header>
  );
});
