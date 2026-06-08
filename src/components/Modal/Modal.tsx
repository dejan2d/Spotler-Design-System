import { forwardRef, useCallback, useEffect, useId, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Modal.css';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the modal is open. When false nothing renders. */
  open: boolean;
  /** Called when the user requests to close (Esc, scrim click, or close control). */
  onClose: () => void;
  /** Dialog title — rendered in the modal header and used as the accessible label. */
  title: ReactNode;
  /** Optional leading icon in the header. */
  icon?: ReactNode;
  /** Footer content (typically Primary + Secondary buttons). */
  footer?: ReactNode;
  /** When false, clicking the scrim does not close the modal. Defaults to true. */
  closeOnScrimClick?: boolean;
  children?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Modal — focused overlay dialog. Composes the Overlay surface tokens with the
 * Headers/Modal tokens. Spec: references/components/modal.md.
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  { open, onClose, title, icon, footer, closeOnScrimClick = true, className, children, ...rest },
  ref,
) {
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Remember the trigger and restore focus on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      // Move focus into the dialog.
      const node = dialogRef.current;
      const first = node?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node)?.focus();
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
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

  return (
    <div
      className="sds-modal__scrim"
      onClick={closeOnScrimClick ? onClose : undefined}
    >
      <div
        ref={(node) => {
          dialogRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={['sds-modal', className].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <header className="sds-modal__header">
          {icon && <span className="sds-modal__header-icon" aria-hidden="true">{icon}</span>}
          <h2 id={titleId} className="sds-modal__title">
            {title}
          </h2>
          <button
            type="button"
            className="sds-modal__close"
            aria-label="Close"
            onClick={onClose}
          >
            ✕
          </button>
        </header>
        <div className="sds-modal__body">{children}</div>
        {footer && <footer className="sds-modal__footer">{footer}</footer>}
      </div>
    </div>
  );
});
