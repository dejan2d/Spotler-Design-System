import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './KpiCard.css';

export type KpiCardStatus = 'default' | 'success' | 'warning' | 'alert' | 'blue';

export interface KpiCardProps extends HTMLAttributes<HTMLDivElement> {
  /** KPI group title (rendered as the card heading, H3). */
  title: ReactNode;
  /** Optional leading 24px context icon next to the title. */
  iconStart?: ReactNode;
  /** Optional trailing 20px info/context icon next to the title. */
  iconEnd?: ReactNode;
  /** The main metric value (H4, Semi-Bold). */
  value: ReactNode;
  /** Short helper line shown below the value (Body/Paragraph - Small). */
  helpText?: ReactNode;
  /** Trend / state shown as a Status Chip in the value row. */
  status?: KpiCardStatus;
  /** Trend label rendered inside the status chip (e.g. "Down 5%"). Keep this text — don't rely on color alone. */
  trend?: ReactNode;
  /** Optional heading level for the title. Defaults to `h3`. */
  headingLevel?: 'h2' | 'h3' | 'h4';
  children?: ReactNode;
}

/**
 * KPI Card — surfaces a single metric with value, status/trend, and supporting helper text.
 * Spec: kit/guidelines/components/kpi-card.md. radius Border/Large (8px), padding 24px 32px,
 * resting Drop Shadow/50. Tokens: `--diagrams-kpi-*` + Status Chip palette.
 */
export const KpiCard = forwardRef<HTMLDivElement, KpiCardProps>(function KpiCard(
  {
    title,
    iconStart,
    iconEnd,
    value,
    helpText,
    status = 'default',
    trend,
    headingLevel = 'h3',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = ['sds-kpi-card', className].filter(Boolean).join(' ');
  const Heading = headingLevel;

  return (
    <div ref={ref} className={classes} {...rest}>
      <div className="sds-kpi-card__header">
        {iconStart && (
          <span className="sds-kpi-card__title-icon sds-kpi-card__title-icon--start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        <Heading className="sds-kpi-card__title">{title}</Heading>
        {iconEnd && (
          <span className="sds-kpi-card__title-icon sds-kpi-card__title-icon--end" aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </div>

      <div className="sds-kpi-card__value-area">
        <div className="sds-kpi-card__value-row">
          <span className="sds-kpi-card__value">{value}</span>
          {trend && (
            <span className={`sds-kpi-card__chip sds-kpi-card__chip--${status}`}>{trend}</span>
          )}
        </div>
        {helpText && <p className="sds-kpi-card__help-text">{helpText}</p>}
      </div>

      {children}
    </div>
  );
});
