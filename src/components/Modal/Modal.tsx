import { forwardRef, useCallback, useEffect, useId, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './Modal.css';

/** Layout treatment of the dialog surface. Mirrors the Spotler "Modal" variants. */
export type ModalVariant = 'default' | 'fullscreen';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the modal is open. When `false` nothing renders. */
  open: boolean;
  /** Called when the user requests to close (Esc, scrim click, or the close control). */
  onClose: () => void;
  /** Dialog title — rendered in the header and used as the accessible label (`aria-labelledby`). */
  title: ReactNode;
  /**
   * Layout treatment. `default` is a centred card; `fullscreen` fills the viewport
   * for editors / reports. In fullscreen the close action conventionally uses the
   * Tertiary button style with a text label in the footer.
   * @default 'default'
   */
  variant?: ModalVariant;
  /**
   * Optional supporting text rendered under the title and wired to the dialog via
   * `aria-describedby` so assistive tech announces it after the label.
   */
  description?: ReactNode;
  /** Optional leading icon in the header (20px). Use a FontAwesome Duotone icon node. */
  icon?: ReactNode;
  /**
   * Icon node for the header close control. Provide a FontAwesome Duotone icon
   * (e.g. `fa-xmark`). When omitted a CSS-drawn cross mark is rendered.
   */
  closeIcon?: ReactNode;
  /** Accessible label for the header close control. @default 'Close' */
  closeLabel?: string;
  /** Footer content (typically Primary + Secondary buttons; Tertiary close in fullscreen). */
  footer?: ReactNode;
  /**
   * When `false`, clicking the scrim does not close the modal (use for unsaved-work guards).
   * @default true
   */
  closeOnScrimClick?: boolean;
  /** Body content. */
  children?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Modal — Spotler Design System.
 *
 * A focused overlay dialog that interrupts the flow for a task, confirmation, or detail view.
 * Composes the Overlay surface tokens (header/footer `#FFFFFF`, body `#EAF6FF`) with the
 * Headers/Modal tokens (icon/text/close-icon `#353B40`). Sits above a scrim with the overlay shadow.
 *
 * Layout: centred card max-width 560px / max-height 90vh, radius 8px (`--border-large`),
 * header & footer padding 16px 24px, body padding 24px. `fullscreen` variant fills the viewport
 * for editors/reports. Accessibility: `role="dialog"` + `aria-modal="true"`, labelled by its
 * header, focus trapped while open, `Esc` to close, focus restored to the trigger on close.
 * Variants: Default, Fullscreen. States: open, closed (unmounted).
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    title,
    variant = 'default',
    description,
    icon,
    closeIcon,
    closeLabel = 'Close',
    footer,
    closeOnScrimClick = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const descriptionId = `${reactId}-description`;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Remember the trigger, move focus into the dialog on open, and restore it on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      const node = dialogRef.current;
      const first = node?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node)?.focus();
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // Lock background scroll while the modal is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const node = dialogRef.current;
      if (!node) return;
      const focusable = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement,
      );
      if (focusable.length === 0) {
        event.preventDefault();
        node.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [onClose],
  );

  if (!open) return null;

  const scrimClasses = [
    'sds-modal__scrim',
    variant === 'fullscreen' && 'sds-modal__scrim--fullscreen',
  ]
    .filter(Boolean)
    .join(' ');

  const dialogClasses = ['sds-modal', `sds-modal--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={scrimClasses} onClick={closeOnScrimClick ? onClose : undefined}>
      <div
        ref={(node) => {
          dialogRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className={dialogClasses}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <header className="sds-modal__header">
          {icon && (
            <span className="sds-modal__header-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          <div className="sds-modal__heading">
            <h2 id={titleId} className="sds-modal__title">
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className="sds-modal__description">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            className={[
              'sds-modal__close',
              !closeIcon && 'sds-modal__close--default-icon',
            ]
              .filter(Boolean)
              .join(' ')}
            aria-label={closeLabel}
            onClick={onClose}
          >
            {closeIcon && (
              <span className="sds-modal__close-icon" aria-hidden="true">
                {closeIcon}
              </span>
            )}
          </button>
        </header>
        <div className="sds-modal__body">{children}</div>
        {footer && <footer className="sds-modal__footer">{footer}</footer>}
      </div>
    </div>
  );
});
