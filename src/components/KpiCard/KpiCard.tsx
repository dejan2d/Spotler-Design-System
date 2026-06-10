import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './KpiCard.css';

/**
 * Trend / state of a KPI value, rendered as a Status Chip.
 * Mirrors the Spotler "Status Chip" palette: Default, Success, Warning, Alert, Blue.
 */
export type KpiCardStatus = 'default' | 'success' | 'warning' | 'alert' | 'blue';

/** Heading level for the card title, so it sits correctly in the document outline. */
export type KpiCardHeadingLevel = 'h2' | 'h3' | 'h4';

export interface KpiCardValueProps extends HTMLAttributes<HTMLDivElement> {
  /** The main metric value (H4, Semi-Bold). */
  value: ReactNode;
  /** Optional small label above the value (Body/Paragraph - Regular, 14/20). */
  label?: ReactNode;
  /** Optional leading 16px category/topic glyph on the label row. */
  labelIconStart?: ReactNode;
  /** Optional trailing 16px icon on the label row. */
  labelIconEnd?: ReactNode;
  /** Right-aligned muted helper text on the label row (e.g. "vs last week"). */
  labelHelpText?: ReactNode;
  /**
   * Trend / state palette for the Status Chip in the value row.
   * Omit `trend` to hide the chip entirely.
   * @default 'default'
   */
  status?: KpiCardStatus;
  /**
   * Visible chip content (e.g. "Down 5%"). Keep this text — never rely on the chip
   * color alone to convey the trend.
   */
  trend?: ReactNode;
  /** Optional 16px icon inside the Status Chip, tinted to match the chip text. */
  trendIcon?: ReactNode;
  /**
   * Accessible name for the Status Chip, set as its `aria-label`. Supply this when the
   * visible `trend` is icon-only or otherwise not self-describing; when omitted, the
   * visible chip text is used as the accessible name. Never rely on chip color alone.
   */
  trendLabel?: string;
  /** Short helper line shown below the value (Body/Paragraph - Small, 12/16). */
  helpText?: ReactNode;
}

export interface KpiCardProps extends HTMLAttributes<HTMLDivElement> {
  /** KPI group title (rendered as the card heading). */
  title: ReactNode;
  /** Optional leading 24px context icon next to the title. */
  iconStart?: ReactNode;
  /** Optional trailing 20px info / credit-card icon next to the title. */
  iconEnd?: ReactNode;
  /**
   * Heading level for the title, to keep the document outline correct.
   * @default 'h3'
   */
  headingLevel?: KpiCardHeadingLevel;
  /**
   * One or more value areas. Each `KpiCardValue` is divided from the next by a
   * 1px separator (the "Stacked values" variant). Compose freely with an embedded
   * `Table` after the values for the "With metrics table" variant.
   */
  children: ReactNode;
}

/**
 * KpiCardValue — a single value area inside a {@link KpiCard}.
 *
 * Anatomy: optional label row (leading 16px icon + label + right-aligned muted helper
 * + trailing 16px icon), a value row (H4 number + Status Chip), and an optional small
 * helper line below. Stack several inside one KpiCard for the "Stacked values" variant;
 * each area carries a 1px bottom separator.
 */
export const KpiCardValue = forwardRef<HTMLDivElement, KpiCardValueProps>(function KpiCardValue(
  {
    value,
    label,
    labelIconStart,
    labelIconEnd,
    labelHelpText,
    status = 'default',
    trend,
    trendIcon,
    trendLabel,
    helpText,
    className,
    ...rest
  },
  ref,
) {
  const classes = ['sds-kpi-card__value-area', className].filter(Boolean).join(' ');
  const hasLabelRow = Boolean(label || labelIconStart || labelIconEnd || labelHelpText);

  return (
    <div ref={ref} className={classes} {...rest}>
      {hasLabelRow && (
        <div className="sds-kpi-card__label-row">
          {labelIconStart && (
            <span className="sds-kpi-card__label-icon sds-kpi-card__label-icon--start" aria-hidden="true">
              {labelIconStart}
            </span>
          )}
          {label && <span className="sds-kpi-card__label">{label}</span>}
          {labelHelpText && <span className="sds-kpi-card__label-help">{labelHelpText}</span>}
          {labelIconEnd && (
            <span className="sds-kpi-card__label-icon sds-kpi-card__label-icon--end" aria-hidden="true">
              {labelIconEnd}
            </span>
          )}
        </div>
      )}

      <div className="sds-kpi-card__value-row">
        <span className="sds-kpi-card__value">{value}</span>
        {trend != null && trend !== false && (
          <span
            className={`sds-kpi-card__chip sds-kpi-card__chip--${status}`}
            aria-label={trendLabel}
          >
            {trendIcon && (
              <span className="sds-kpi-card__chip-icon" aria-hidden="true">
                {trendIcon}
              </span>
            )}
            <span className="sds-kpi-card__chip-label">{trend}</span>
          </span>
        )}
      </div>

      {helpText && <p className="sds-kpi-card__help-text">{helpText}</p>}
    </div>
  );
});

/**
 * KpiCard — Spotler Design System.
 *
 * A raised surface that surfaces one or more metrics with a value, a Status Chip
 * trend/state, and supporting helper text. Used on dashboards and detail pages to
 * surface key numbers at a glance.
 *
 * Sizing: padding 24px 32px, internal gap 8px, border-radius Border/Large (8px),
 * 1px border, resting Drop Shadow/50. Header icon 24px, trailing icon 20px,
 * label/helper/chip icons 16px.
 *
 * Variants (composed via children): Single value, Stacked values, With metrics table.
 * Each value area is a {@link KpiCardValue}; add a Spotler `Table` after the values
 * for the embedded metrics-table variant.
 */
export const KpiCard = forwardRef<HTMLDivElement, KpiCardProps>(function KpiCard(
  { title, iconStart, iconEnd, headingLevel = 'h3', className, children, ...rest },
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

      {children}
    </div>
  );
});
