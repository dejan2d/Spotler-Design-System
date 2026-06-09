import { forwardRef, useEffect, useRef } from 'react';
import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import './Alert.css';

/**
 * Visual intent of the alert.
 * Note: `warrning` preserves the Figma/design-token spelling verbatim.
 */
export type AlertVariant = 'primary' | 'regular' | 'success' | 'warrning' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Visual intent. `primary` = Info, `regular` = Neutral (use for embedded CTA links),
   * `success`, `warrning` (Figma token spelling), `error`. Defaults to `primary`.
   */
  variant?: AlertVariant;
  /** Leading status icon (20×20, FontAwesome Duotone node) — variant-specific. */
  iconStart?: ReactNode;
  /** Optional H4 heading (17px/28px SemiBold). */
  header?: ReactNode;
  /** Body text (14px/20px Regular). */
  children?: ReactNode;
  /**
   * Dismiss handler. When set, a trailing close (fa-xmark) button is rendered and,
   * if `autoDismiss` is true, the alert auto-dismisses after `autoDismissMs`.
   */
  onDismiss?: () => void;
  /** Accessible label for the dismiss button. Defaults to `"Dismiss"`. */
  dismissLabel?: string;
  /**
   * Dismiss icon node (20×20, FontAwesome `fa-xmark` in real use).
   * Required to render the close affordance — never hardcoded as a glyph here.
   */
  dismissIcon?: ReactNode;
  /**
   * When true (and `onDismiss` is set), the alert shows a countdown progress bar
   * and auto-dismisses after `autoDismissMs`. Defaults to `false`.
   */
  autoDismiss?: boolean;
  /** Auto-dismiss duration in milliseconds. Defaults to `5000` (5s per spec). */
  autoDismissMs?: number;
  /**
   * Conveys urgency to assistive tech: `'polite'` (default) maps to `role="status"`,
   * `'assertive'` maps to `role="alert"`. Use `assertive` for errors.
   */
  liveness?: 'polite' | 'assertive';
}

/**
 * Alert — informs users of issues, warnings, or important updates that require attention.
 *
 * Spotler Design System "Alert".
 * Container: padding 8px 16px, gap 12px, radius 8px (large), min-width 500px.
 * Icon 20×20; heading H4 (17/28 SemiBold); body 14/20 Regular; both `#353B40`.
 * Optional 8px progress bar for auto-dismiss (5s). Persists until dismissed or resolved.
 */
export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  {
    variant = 'primary',
    iconStart,
    header,
    children,
    onDismiss,
    dismissLabel = 'Dismiss',
    dismissIcon,
    autoDismiss = false,
    autoDismissMs = 5000,
    liveness = 'polite',
    className,
    ...rest
  },
  ref,
) {
  const showProgress = Boolean(onDismiss) && autoDismiss;

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
    showProgress && 'sds-alert--auto-dismiss',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Custom property drives the progress-bar countdown duration in CSS.
  const progressStyle = {
    '--sds-alert-progress-duration': `${autoDismissMs}ms`,
  } as CSSProperties;

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
        {onDismiss && (
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
      {showProgress && (
        <div className="sds-alert__progress" aria-hidden="true" style={progressStyle}>
          <span className="sds-alert__progress-fill" />
        </div>
      )}
    </div>
  );
});
