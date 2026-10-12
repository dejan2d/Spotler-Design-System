import { forwardRef, useCallback, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './Tooltip.css';

/** Where the tooltip surface sits relative to its anchor. */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * Figma `Pointer pozition` (set 458:11945) — which edge of the tooltip carries the pointer.
 * The pointer faces the anchor, so the surface sits on the opposite side:
 * `top` → surface below (`placement="bottom"`), `down` → above (`"top"`),
 * `left` → right of the anchor (`"right"`), `right` → left of it (`"left"`).
 */
export type TooltipPointerPosition = 'top' | 'down' | 'left' | 'right';

const POINTER_TO_PLACEMENT: Record<TooltipPointerPosition, TooltipPlacement> = {
  top: 'bottom',
  down: 'top',
  left: 'right',
  right: 'left',
};

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** The short transient label shown on hover/focus. */
  label: ReactNode;
  /**
   * Where the tooltip surface sits relative to its anchor. Defaults to `bottom` — the Figma
   * default `Pointer pozition=Top` (pointer up, tooltip below; use when there is space below).
   * @default 'bottom'
   */
  placement?: TooltipPlacement;
  /**
   * Figma-named alternative to `placement` (`Pointer pozition`: top | down | left | right).
   * When set, it takes precedence over `placement`.
   */
  pointerPosition?: TooltipPointerPosition;
  /**
   * Show the 16×8 pointer (arrow) toward the anchor (Figma `Pointer`).
   * @default true
   */
  pointer?: boolean;
  /**
   * Delay before opening on hover/focus, in ms (Figma: 150–200ms).
   * @default 150
   */
  openDelay?: number;
  /**
   * Delay before closing on mouse-out/blur, in ms (Figma: 100ms). Esc closes immediately.
   * @default 100
   */
  closeDelay?: number;
  /** The anchor element the tooltip describes. */
  children: ReactNode;
}

/**
 * Tooltip — a small transient label shown on hover/focus to explain an element.
 *
 * Spotler Design System "Tooltip" (Figma set 458:11945).
 * Surface: padding 16px, radius 8px (large), max width 300px (wraps beyond), hugs shorter
 * text; text Paragraph - Regular; Tooltip/background + Tooltip/text. Pointer: 16×8 triangle
 * centered on the edge facing the anchor, 4px from the anchor. Shadow: Figma's effect style
 * "OBSOLETE - Drop Shadow/100" (0 1px 4px #0C0C0D @5% + 0 1px 4px #0C0C0D @10%) applied to
 * surface and pointer together. Opens after 150ms, closes after 100ms.
 *
 * Accessibility: role="tooltip"; associated via aria-describedby; reachable on keyboard
 * focus, dismissed on blur/mouse-out and Esc.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  {
    label,
    placement = 'bottom',
    pointerPosition,
    pointer = true,
    openDelay = 150,
    closeDelay = 100,
    className,
    children,
    ...rest
  },
  ref,
) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const clearTimer = useCallback(() => {
    if (timer.current !== undefined) {
      window.clearTimeout(timer.current);
      timer.current = undefined;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const show = useCallback(() => {
    clearTimer();
    timer.current = window.setTimeout(() => setOpen(true), openDelay);
  }, [clearTimer, openDelay]);

  const hide = useCallback(() => {
    clearTimer();
    timer.current = window.setTimeout(() => setOpen(false), closeDelay);
  }, [clearTimer, closeDelay]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        clearTimer();
        setOpen(false);
      }
    },
    [clearTimer],
  );

  const side = pointerPosition ? POINTER_TO_PLACEMENT[pointerPosition] : placement;

  const classes = ['sds-tooltip', className].filter(Boolean).join(' ');
  const surfaceClasses = [
    'sds-tooltip__surface',
    `sds-tooltip__surface--${side}`,
    pointer && 'sds-tooltip__surface--pointer',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span
      ref={ref}
      className={classes}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onKeyDown={onKeyDown}
      {...rest}
    >
      <span className="sds-tooltip__anchor" aria-describedby={open ? tooltipId : undefined}>
        {children}
      </span>
      <span id={tooltipId} role="tooltip" className={surfaceClasses} hidden={!open}>
        {label}
        {pointer && <span className="sds-tooltip__pointer" aria-hidden="true" />}
      </span>
    </span>
  );
});
