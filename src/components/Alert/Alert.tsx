import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Alert.css';

/** Note: `warrning` preserves the Figma token typo verbatim. */
export type AlertVariant = 'primary' | 'regular' | 'success' | 'warrning' | 'error';

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  /** Visual intent. `warrning` keeps the Figma token spelling. */
  variant?: AlertVariant;
  /** Leading status icon (20px, FontAwesome Duotone node) — variant-specific. */
  iconStart?: ReactNode;
  /** Optional H4 heading. */
  header?: ReactNode;
  /** Body text. */
  children?: ReactNode;
  /** Dismiss handler — when set, a trailing close (fa-xmark) button is shown. */
  onDismiss?: () => void;
  /** Accessible label for the dismiss button. */
  dismissLabel?: string;
  /** Custom dismiss icon node (defaults to a × glyph). */
  dismissIcon?: ReactNode;
}

/**
 * Alert — informs users of issues, warnings, or important updates that require attention.
 * Spec: references/components/alert.md. role="alert"; min-width 500px; radius large.
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
    className,
    ...rest
  },
  ref,
) {
  const classes = ['sds-alert', `sds-alert--${variant}`, className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} role="alert" {...rest}>
      {iconStart && (
        <span className="sds-alert__icon-start" aria-hidden="true">
          {iconStart}
        </span>
      )}
      <div className="sds-alert__content">
        {header && <p className="sds-alert__header">{header}</p>}
        {children && <p className="sds-alert__body">{children}</p>}
      </div>
      {onDismiss && (
        <button
          type="button"
          className="sds-alert__dismiss"
          aria-label={dismissLabel}
          onClick={onDismiss}
        >
          <span className="sds-alert__icon-end" aria-hidden="true">
            {dismissIcon ?? '×'}
          </span>
        </button>
      )}
    </div>
  );
});
