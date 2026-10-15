import { forwardRef, useCallback, useEffect, useId, useRef } from 'react';
import type { CSSProperties, HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import { Divider } from '../Divider';
import { IconButton } from '../IconButton';
import './Overlay.css';

/* Built-in icons — Font Awesome Pro 7.1.0 Duotone Regular, copied from
   src/icons/duotone-regular/<name>.svg (the icons the Figma "Overlay header" uses).
   Font Awesome Pro by @fontawesome — https://fontawesome.com (Commercial License), © 2025 Fonticons, Inc.
   Each renders at 1em and inherits currentColor, so the Overlay / Icon Button tokens colour them. */

/** `xmark` — Figma "Icon button" (Tertiary) in "Overlay header" 11157:52101. */
const XmarkIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      fill="currentColor"
      d="M135.5 169C126.1 159.6 126.1 144.4 135.5 135.1C144.9 125.8 160.1 125.7 169.4 135.1L320.4 286.1L471.4 135.1C480.8 125.7 496 125.7 505.3 135.1C514.6 144.5 514.7 159.7 505.3 169L354.3 320L505.3 471C514.7 480.4 514.7 495.6 505.3 504.9C495.9 514.2 480.7 514.3 471.4 504.9L320.4 353.9L169.4 504.9C160 514.3 144.8 514.3 135.5 504.9C126.2 495.5 126.1 480.3 135.5 471L286.5 320L135.5 169z"
    />
  </svg>
);

/** `circle-info` — Figma "Overlay header" `Header Icon` 5539:106878 (16px). */
const CircleInfoIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      opacity=".4"
      fill="currentColor"
      d="M112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320zM256 312C256 298.7 266.7 288 280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312zM352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224z"
    />
    <path
      fill="currentColor"
      d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM280 400C266.7 400 256 410.7 256 424C256 437.3 266.7 448 280 448L360 448C373.3 448 384 437.3 384 424C384 410.7 373.3 400 360 400L352 400L352 312C352 298.7 341.3 288 328 288L280 288C266.7 288 256 298.7 256 312C256 325.3 266.7 336 280 336L304 336L304 400L280 400zM320 256C337.7 256 352 241.7 352 224C352 206.3 337.7 192 320 192C302.3 192 288 206.3 288 224C288 241.7 302.3 256 320 256z"
    />
  </svg>
);

export interface OverlayProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Whether the overlay is open. When `false` nothing renders. */
  open: boolean;
  /** Called when the user requests to close (Esc, the header `xmark`, or a scrim click). */
  onClose: () => void;
  /**
   * Header title (Figma "Overlay header" text: Text Styles/Title Headings/H4,
   * Overlay/header-text). Also the accessible name (`aria-labelledby`).
   * Omitting it mirrors the Figma `Header` boolean switched off — then pass `aria-label`.
   */
  title?: ReactNode;
  /**
   * Figma `Header Icon` (5539:106878): a 16px icon 8px after the title, Overlay/header-icon.
   * `true` renders the built-in `circle-info`; pass a FontAwesome Duotone node to swap it.
   * Decorative — wrap it in a Tooltip yourself if it carries information.
   * @default false
   */
  headerIcon?: boolean | ReactNode;
  /** Accessible label for the header close control (`xmark` Icon button). @default 'Close' */
  closeLabel?: string;
  /**
   * Footer actions (Figma "Overlay footer" 5539:106655 — `Button 1` Primary, `Button 2`
   * Tertiary, optional `Button 3` Tertiary). Pass current `<Button>` components; they sit
   * left-aligned, 16px apart, under a Divider. Omit to render no footer (Figma guideline:
   * "Footer (Optional)").
   */
  footer?: ReactNode;
  /**
   * Panel width. Figma component width is 600px; guideline: "Default width: 600–800px".
   * Numbers are px. Capped to the viewport minus the 20px edge offsets.
   * @default 600
   */
  width?: number | string;
  /**
   * Distance from the viewport top. Figma guideline: the overlay starts at the bottom of the
   * application's top header and runs to 20px above the bottom edge. Pass your app header
   * height here. Numbers are px.
   * @default 20 (Spacing/S-20, matching the right and bottom offsets)
   */
  offsetTop?: number | string;
  /**
   * Figma guideline: "The background behind the overlay can be optionally dimmed to create
   * focus". `true` renders the scrim and makes the overlay modal (`aria-modal`, focus trap,
   * background scroll lock). `false` leaves the page visible and usable (non-modal dialog):
   * focus still moves in on open and back on close, and Esc still closes from inside.
   * @default true
   */
  dimmed?: boolean;
  /**
   * When `dimmed`, clicking the scrim closes the overlay. Set `false` for unsaved-work guards.
   * @default true
   */
  closeOnScrimClick?: boolean;
  /** Body content (Figma "Overlay body" 5539:106816 — detach and fill in Figma). */
  children?: ReactNode;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

const toLength = (value: number | string) => (typeof value === 'number' ? `${value}px` : value);

/**
 * Overlay — Spotler Design System (Figma page "Overlay": "Overlay Template" 5539:106957
 * composing "Overlay header" 5539:106654, "Overlay body" 5539:106816 and
 * "Overlay footer" 5539:106655).
 *
 * A right-aligned slide-in panel for task-focused content on top of the current screen
 * (editing, creation, AI-assisted tools) without navigating away. Use a Modal instead for
 * critical or destructive confirmations.
 *
 * Figma spec:
 * - Panel (Template): 600 wide, vertical stack, no gap, effect Drop Shadow/200.
 *   Placement (page guidelines): right-aligned, 20px from the right and bottom edges, full
 *   height from the app header down, slides in from the right.
 * - Header: Overlay/header-background, radius 4/4/0/0, padding 16/32/16/24, gap 16. Row
 *   (space-between, gap 16): title (H4, Overlay/header-text) + optional 16px `circle-info`
 *   (Overlay/header-icon) 8px apart; Icon button Tertiary `xmark` (36px). Then a horizontal
 *   Divider (Divider/horizontal).
 * - Body: Overlay/body-background, padding 16/24/16/24, gap 16; text Paragraph - Regular,
 *   Monochrome/Gray-1000.
 * - Footer: Overlay/footer-background, radius 0/0/4/4, padding 16/32/16/24, gap 16. Divider,
 *   then Buttons (Primary, Tertiary[, Tertiary]) left-aligned, 16px apart.
 *
 * Accessibility: `role="dialog"`, labelled by the title. With `dimmed` (default) it is
 * `aria-modal="true"` with a focus trap and background scroll lock. `Esc` closes; focus moves
 * into the panel on open and back to the trigger on close. States: open, closed (unmounted).
 */
export const Overlay = forwardRef<HTMLDivElement, OverlayProps>(function Overlay(
  {
    open,
    onClose,
    title,
    headerIcon = false,
    closeLabel = 'Close',
    footer,
    width = 600,
    offsetTop,
    dimmed = true,
    closeOnScrimClick = true,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const titleId = `${reactId}-title`;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Remember the trigger, move focus into the panel on open, and restore it on close.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      const node = panelRef.current;
      const first = node?.querySelector<HTMLElement>(FOCUSABLE);
      (first ?? node)?.focus();
    } else if (triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [open]);

  // Lock background scroll while a dimmed (modal) overlay is open.
  useEffect(() => {
    if (!open || !dimmed) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open, dimmed]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.stopPropagation();
        onClose();
        return;
      }
      // Focus is only trapped when the overlay is modal (dimmed).
      if (event.key !== 'Tab' || !dimmed) return;

      const node = panelRef.current;
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
    [onClose, dimmed],
  );

  if (!open) return null;

  const hasTitle = title !== undefined && title !== null && title !== false;
  const icon = headerIcon === true ? <CircleInfoIcon /> : headerIcon || null;

  const panelClasses = ['sds-overlay', className].filter(Boolean).join(' ');

  const panelStyle = {
    '--sds-overlay-width': toLength(width),
    ...(offsetTop !== undefined ? { '--sds-overlay-offset-top': toLength(offsetTop) } : {}),
    ...style,
  } as CSSProperties;

  const panel = (
    <div
      ref={(node) => {
        panelRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) ref.current = node;
      }}
      role="dialog"
      aria-modal={dimmed ? 'true' : undefined}
      aria-labelledby={hasTitle ? titleId : undefined}
      tabIndex={-1}
      className={panelClasses}
      style={panelStyle}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={handleKeyDown}
      {...rest}
    >
      <header className="sds-overlay__header">
        <div className="sds-overlay__header-row">
          {hasTitle && (
            <div className="sds-overlay__heading-group">
              <h2 id={titleId} className="sds-overlay__title">
                {title}
              </h2>
              {icon && (
                <span className="sds-overlay__header-icon" aria-hidden="true">
                  {icon}
                </span>
              )}
            </div>
          )}
          <IconButton
            variant="tertiary"
            className="sds-overlay__close"
            aria-label={closeLabel}
            icon={<XmarkIcon />}
            onClick={onClose}
          />
        </div>
        <Divider />
      </header>
      <div className="sds-overlay__body">{children}</div>
      {footer && (
        <footer className="sds-overlay__footer">
          <Divider />
          <div className="sds-overlay__actions">{footer}</div>
        </footer>
      )}
    </div>
  );

  if (!dimmed) return panel;

  return (
    <div className="sds-overlay__scrim" onClick={closeOnScrimClick ? onClose : undefined}>
      {panel}
    </div>
  );
});
