import { forwardRef, useCallback, useEffect, useId, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './Modal.css';

/** Figma "Modal" `Size` property: Small 740px · Medium 1020px · Large 1920px wide. */
export type ModalSize = 'small' | 'medium' | 'large';

/**
 * Figma "Modal" `Type` property. The types share one surface; they differ in the footer
 * actions (Figma "Modal actions"):
 * - `regular` — Primary button.
 * - `warning` — Warning button, then a Tertiary button.
 * - `destructive` — Destructive button, then a Tertiary button.
 * `warning` and `destructive` are confirmations, so the dialog is exposed as `role="alertdialog"`.
 */
export type ModalType = 'regular' | 'warning' | 'destructive';

export interface ModalProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the modal is open. When `false` nothing renders. */
  open: boolean;
  /** Called when the user requests to close (Esc, scrim click, or the close control). */
  onClose: () => void;
  /**
   * Dialog title — rendered in the header (Figma Text Styles/Title Headings/H4,
   * Headers/Modal/text) and used as the accessible label (`aria-labelledby`).
   */
  title: ReactNode;
  /**
   * Figma `Size`: `small` 740px · `medium` 1020px · `large` 1920px wide (capped to the
   * viewport). Height hugs the content. Figma recommends `small` for Warning and Destructive.
   * @default 'small'
   */
  size?: ModalSize;
  /**
   * Figma `Type`. Put the matching buttons in `footer`: `regular` → `<Button variant="primary">`;
   * `warning` → `<Button variant="warning">` + `<Button variant="tertiary">`;
   * `destructive` → `<Button variant="destructive">` + `<Button variant="tertiary">`.
   * `warning` / `destructive` set `role="alertdialog"`.
   * @default 'regular'
   */
  type?: ModalType;
  /**
   * Optional leading icon in the header (Figma "Icon Left", 20×20, Headers/Modal/icon).
   * Use a FontAwesome Duotone icon node.
   */
  icon?: ReactNode;
  /**
   * Icon node for the header close control (Figma "Icon Right" = `xmark`, 20×20,
   * Headers/Modal/close-icon). When omitted a CSS-drawn cross mark is rendered.
   */
  closeIcon?: ReactNode;
  /** Accessible label for the header close control. @default 'Close' */
  closeLabel?: string;
  /**
   * Footer content (Figma "Modal actions"): buttons left-aligned, 8px apart, the main action
   * first. See `type` for which button variants to use.
   */
  footer?: ReactNode;
  /**
   * Draws the optional 1px Monochrome/Gray-400 rule between content and actions (Figma
   * "Modal actions" `Property 1=divider` / "modal content" `w - divider`).
   * @default false
   */
  footerDivider?: boolean;
  /**
   * When `false`, clicking the scrim does not close the modal (use for unsaved-work guards).
   * @default true
   */
  closeOnScrimClick?: boolean;
  /** Body content (Figma "modal content" slot). */
  children?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

/**
 * Modal — Spotler Design System (Figma "Modal" set 910:12628, page Modals).
 *
 * A focused overlay dialog that interrupts the flow for a task, confirmation, or detail view.
 *
 * Figma spec:
 * - Surface: width Small 740 / Medium 1020 / Large 1920, height hugs content, radius 8px
 *   (`--border-large`), effect Drop Shadow/200, Monochrome/White throughout.
 * - Header ("Modal header"): padding 24/40/16/40, gap 16, 1px Monochrome/Gray-400 bottom
 *   border; icon (20px) + title (H4) 8px apart; `xmark` close (20px) on the right.
 * - Content ("modal content"): padding 24/40/24/40, gap 8.
 * - Actions ("Modal actions"): padding 16/40/24/40, buttons left-aligned with 8px gap;
 *   optional top divider.
 * - Scrim ("Modal overlay" 910:23938): #0C0F16 at 50%.
 *
 * Accessibility: `role="dialog"` (`alertdialog` for Warning/Destructive) + `aria-modal="true"`,
 * labelled by its header, focus trapped while open, `Esc` to close, focus restored to the
 * trigger on close. States: open, closed (unmounted).
 */
export const Modal = forwardRef<HTMLDivElement, ModalProps>(function Modal(
  {
    open,
    onClose,
    title,
    size = 'small',
    type = 'regular',
    icon,
    closeIcon,
    closeLabel = 'Close',
    footer,
    footerDivider = false,
    closeOnScrimClick = true,
    className,
    children,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const titleId = `${reactId}-title`;
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

  const dialogClasses = [
    'sds-modal',
    `sds-modal--${size}`,
    `sds-modal--${type}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const footerClasses = ['sds-modal__footer', footerDivider && 'sds-modal__footer--divider']
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sds-modal__scrim" onClick={closeOnScrimClick ? onClose : undefined}>
      <div
        ref={(node) => {
          dialogRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        role={type === 'regular' ? 'dialog' : 'alertdialog'}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={dialogClasses}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        <header className="sds-modal__header">
          <div className="sds-modal__heading-group">
            {icon && (
              <span className="sds-modal__header-icon" aria-hidden="true">
                {icon}
              </span>
            )}
            <h2 id={titleId} className="sds-modal__title">
              {title}
            </h2>
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
        {footer && <footer className={footerClasses}>{footer}</footer>}
      </div>
    </div>
  );
});
