import { forwardRef, useId, useState, useCallback } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Tooltip.css';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'content'> {
  /** The short transient label shown on hover/focus. */
  label: ReactNode;
  /** Where the tooltip surface sits relative to its anchor. */
  placement?: TooltipPlacement;
  /** The anchor element the tooltip describes. */
  children: ReactNode;
}

/**
 * Tooltip — a small transient label shown on hover/focus to explain an element.
 * Spec: references/components/tooltip.md. role="tooltip"; associated via aria-describedby;
 * reachable on keyboard focus, dismissed on blur/mouse-out and Esc. Overlay elevation.
 */
export const Tooltip = forwardRef<HTMLSpanElement, TooltipProps>(function Tooltip(
  { label, placement = 'top', className, children, ...rest },
  ref,
) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  const show = useCallback(() => setOpen(true), []);
  const hide = useCallback(() => setOpen(false), []);

  const onKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  const classes = ['sds-tooltip', className].filter(Boolean).join(' ');

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
      <span
        id={tooltipId}
        role="tooltip"
        className={`sds-tooltip__surface sds-tooltip__surface--${placement}`}
        hidden={!open}
      >
        {label}
      </span>
    </span>
  );
});
