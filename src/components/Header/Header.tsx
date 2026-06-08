import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Header.css';

export type HeaderVariant = 'page' | 'modal';

export interface HeaderProps extends HTMLAttributes<HTMLElement> {
  /** Title text shown as the heading. */
  title: ReactNode;
  /** Visual variant: page/section band, or the modal dialog header. */
  variant?: HeaderVariant;
  /** Optional leading icon (FontAwesome Duotone node). */
  icon?: ReactNode;
  /** Optional trailing actions (buttons). */
  actions?: ReactNode;
  /** For the modal variant: handler for the close control. */
  onClose?: () => void;
  /** Heading level rendered for the title. Defaults to h2. */
  headingLevel?: 1 | 2 | 3 | 4;
  /** Id applied to the heading element — useful for `aria-labelledby`. */
  headingId?: string;
}

/**
 * Header — page/section header band with a modal-specific variant.
 * Spec: references/components/header.md. Page tokens Headers/*, modal tokens Headers/Modal/*.
 */
export const Header = forwardRef<HTMLElement, HeaderProps>(function Header(
  { title, variant = 'page', icon, actions, onClose, headingLevel = 2, headingId, className, ...rest },
  ref,
) {
  const classes = [
    'sds-header',
    `sds-header--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Heading = `h${headingLevel}` as const;

  return (
    <header ref={ref} className={classes} {...rest}>
      {icon && <span className="sds-header__icon" aria-hidden="true">{icon}</span>}
      <Heading id={headingId} className="sds-header__title">
        {title}
      </Heading>
      {actions && <div className="sds-header__actions">{actions}</div>}
      {variant === 'modal' && onClose && (
        <button
          type="button"
          className="sds-header__close"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>
      )}
    </header>
  );
});
