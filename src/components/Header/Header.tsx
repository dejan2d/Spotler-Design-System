import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Header.css';

/** Visual context for the header band. Mirrors the Spotler "Header" component variants. */
export type HeaderVariant = 'page' | 'modal';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Title text rendered as the section/dialog heading. */
  title: ReactNode;
  /**
   * Visual variant. `page` titles a page or section (Conceptual darkest icon + text,
   * typically on the brand gradient or a light surface). `modal` titles a dialog
   * (gray-1000 icon + text) and reveals a right-aligned close control.
   * @default 'page'
   */
  variant?: HeaderVariant;
  /** Optional leading icon (FontAwesome Duotone node, rendered at 20px). */
  icon?: ReactNode;
  /**
   * Optional trailing actions (Buttons). By convention the Help button sits far-right
   * and the yellow Primary Accent (create) button sits to its left.
   */
  actions?: ReactNode;
  /**
   * Handler for the modal close control. The close button only renders for the
   * `modal` variant when this handler is provided.
   */
  onClose?: () => void;
  /**
   * Icon node for the modal close control (FontAwesome Duotone, e.g. `fa-xmark`).
   * Falls back to nothing visible if omitted — always supply an icon for the close button.
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
 * A page/section header band — leading icon (optional) + title, with optional
 * trailing actions. The `modal` variant titles a dialog and adds a right-aligned,
 * keyboard-reachable close control.
 *
 * Layout: row, centered, gap 8px. Title uses the h3 type ramp (22px / 32px / 600).
 * Icon renders at 20px. Page variant uses the Conceptual-darkest icon/text tokens;
 * modal uses the gray-1000 icon/text/close-icon tokens.
 *
 * Variants: Page/section, Modal. The title is the section/dialog heading in the
 * outline; the modal close exposes an accessible label and is keyboard reachable.
 */
export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  {
    title,
    variant = 'page',
    icon,
    actions,
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
  const showClose = variant === 'modal' && Boolean(onClose);

  return (
    <header ref={ref} className={classes} {...rest}>
      {icon && (
        <span className="sds-header__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <Heading id={headingId} className="sds-header__title">
        {title}
      </Heading>
      {actions && <div className="sds-header__actions">{actions}</div>}
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
