import { forwardRef, useEffect, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { ProgressBar } from '../ProgressBar';
import './Alert.css';

/**
 * Visual intent of the alert. Maps to the Figma `Type` property (set 100:262):
 * `Primary` → `primary`, `Regular` → `regular`, `Success` → `success`,
 * `Warning` → `warrning`, `Error` → `error`.
 * Note: `warrning` preserves the Figma/design-token spelling verbatim.
 */
export type AlertVariant = 'primary' | 'regular' | 'success' | 'warrning' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual intent (Figma `Type`). `primary` = Info, `regular` = Neutral, `success`,
   * `warrning` (Figma token spelling), `error`. Defaults to `primary`.
   */
  variant?: AlertVariant;
  /** Leading status icon (20×20, FontAwesome Duotone node) — variant-specific (Figma `Show Left Icon`). */
  iconStart?: ReactNode;
  /** Optional heading — Figma `Show Header` / `Header Text`, text style H4. */
  header?: ReactNode;
  /**
   * Body text (Figma `Text`), text style Paragraph - Regular.
   * Call-to-action links (`<a>`) inside the body render in Paragraph - Semi Bold + underline
   * on every variant. Separate multiple CTAs with a space or other text so the
   * underlines never connect.
   */
  children?: ReactNode;
  /**
   * Dismiss handler. Required for the close button and for auto-dismiss: when set, a
   * trailing close (fa-xmark) button renders (unless `dismissible` is false) and, while
   * `autoDismiss` is true, the alert auto-dismisses after `autoDismissMs`.
   */
  onDismiss?: () => void;
  /**
   * Show the trailing close button when `onDismiss` is set (Figma `Dismisable`).
   * Set to `false` to keep only the auto-dismiss loader.
   * @default true
   */
  dismissible?: boolean;
  /** Accessible label for the dismiss button. Defaults to `"Dismiss"`. */
  dismissLabel?: string;
  /**
   * Dismiss icon node (20×20, FontAwesome `fa-xmark` in real use).
   * Required to render the close affordance — never hardcoded as a glyph here.
   */
  dismissIcon?: ReactNode;
  /**
   * Show the auto-dismiss loader (Figma `Show Loader`, default on) and dismiss the alert
   * after `autoDismissMs`. Only takes effect when `onDismiss` is set. Pass `false` for
   * alerts that must persist until the user dismisses or resolves them.
   * @default true
   */
  autoDismiss?: boolean;
  /** Auto-dismiss duration in milliseconds. Defaults to `5000` (5s per the Figma animation note). */
  autoDismissMs?: number;
  /**
   * Conveys urgency to assistive tech: `'polite'` (default) maps to `role="status"`,
   * `'assertive'` maps to `role="alert"`. Use `assertive` for errors.
   */
  liveness?: 'polite' | 'assertive';
}

/**
 * Auto-dismiss loader — the Figma "Progress bar" instance embedded in every Alert variant
 * (Type=Neutral, Show Left Label on, Show Label Right off). Starts at 0% (the state Figma
 * shows) and fills to 100% over `durationMs`; the percentage label tracks it.
 */
function AlertLoader({ durationMs }: { durationMs: number }) {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      const begin = start ?? now;
      start = begin;
      const next = durationMs > 0 ? Math.min(100, Math.floor(((now - begin) / durationMs) * 100)) : 100;
      setPct((prev) => (prev === next ? prev : next));
      if (next < 100) frame = window.requestAnimationFrame(tick);
    };
    setPct(0);
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, [durationMs]);

  return (
    <ProgressBar
      className="sds-alert__progress"
      variant="neutral"
      value={pct}
      showLeftLabel
      showRightLabel={false}
      aria-hidden="true"
    />
  );
}

/**
 * Alert — informs users of issues, warnings, or important updates that require attention.
 *
 * Spotler Design System "Alert" (Figma set 100:262).
 * Container: column, gap 12px (row ↔ loader), padding 8px 16px, radius 8px (large),
 * min-width 500px. Row: icon, content and close button vertically centered, gap 8px.
 * Content: column, gap 4px — heading H4, body Paragraph - Regular, both `#353B40`.
 * Icon and close button 20×20. Loader: neutral Progress bar (8px track, left percentage
 * label, gap 12px), shown by default when `onDismiss` is set; the alert auto-dismisses
 * after 5s.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    variant = 'primary',
    iconStart,
    header,
    children,
    onDismiss,
    dismissible = true,
    dismissLabel = 'Dismiss',
    dismissIcon,
    autoDismiss = true,
    autoDismissMs = 5000,
    liveness = 'polite',
    className,
    ...rest
  },
  ref,
) {
  const showProgress = Boolean(onDismiss) && autoDismiss;
  const showDismiss = Boolean(onDismiss) && dismissible;

  // Auto-dismiss timer — fires onDismiss once after autoDismissMs.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  useEffect(() => {
    if (!showProgress) return undefined;
    const id = window.setTimeout(() => onDismissRef.current?.(), autoDismissMs);
    return () => window.clearTimeout(id);
  }, [showProgress, autoDismissMs]);

  const classes = [
    'sds-alert',
    `sds-alert--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      role={liveness === 'assertive' ? 'alert' : 'status'}
      aria-live={liveness}
      {...rest}
    >
      <div className="sds-alert__main">
        {iconStart && (
          <span className="sds-alert__icon-start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        <div className="sds-alert__content">
          {header && <p className="sds-alert__header">{header}</p>}
          {children && <div className="sds-alert__body">{children}</div>}
        </div>
        {showDismiss && (
          <button
            type="button"
            className="sds-alert__dismiss"
            aria-label={dismissLabel}
            onClick={onDismiss}
          >
            {dismissIcon && (
              <span className="sds-alert__icon-end" aria-hidden="true">
                {dismissIcon}
              </span>
            )}
          </button>
        )}
      </div>
      {showProgress && <AlertLoader durationMs={autoDismissMs} />}
    </div>
  );
});
