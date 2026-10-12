import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { StatusChip } from '../StatusChip';
import './KpiCard.css';

/**
 * Trend / state of a KPI value, rendered as a Status Chip.
 * Mirrors the Spotler "Status Chip" states: Default, Success, Warning, Alert, Neutral/Blue (`blue`).
 */
export type KpiCardStatus = 'default' | 'success' | 'warning' | 'alert' | 'blue';

/** Heading level for the card title, so it sits correctly in the document outline. */
export type KpiCardHeadingLevel = 'h2' | 'h3' | 'h4';

export interface KpiCardValueProps extends HTMLAttributes<HTMLDivElement> {
  /** The main metric value — Title Headings/H4, `Diagrams/KPI/value-area-text`. Figma "Value Text". */
  value: ReactNode;
  /**
   * Optional small label above the value — Body/Paragraph - Regular,
   * `Diagrams/KPI/value-area-title`. Figma "Small Title Text".
   */
  label?: ReactNode;
  /** Optional leading 16px icon on the label row (`value-area-start-icon`). Figma "Start Small Title Icon". */
  labelIconStart?: ReactNode;
  /** Optional trailing 16px icon on the label row (`value-area-end-icon`). Figma "End Small Title Icon". */
  labelIconEnd?: ReactNode;
  /**
   * Muted helper text on the label row, placed directly after the label (8px gap, not
   * right-aligned) — Body/Paragraph - Regular, `value-area-title-help-text`.
   * Figma "Small Title Helper Text".
   */
  labelHelpText?: ReactNode;
  /**
   * State of the Status Chip in the value row.
   * Omit `trend` to hide the chip entirely (Figma "Value Tag" off).
   * @default 'default'
   */
  status?: KpiCardStatus;
  /**
   * Visible Status Chip text (e.g. "Down 5%"). Keep this text — never rely on the chip
   * color alone to convey the trend.
   */
  trend?: ReactNode;
  /** Optional 16px icon inside the Status Chip, tinted with the chip's icon token. */
  trendIcon?: ReactNode;
  /**
   * Accessible name for the Status Chip, set as its `aria-label`. Supply this when the
   * visible `trend` is icon-only or otherwise not self-describing; when omitted, the
   * visible chip text is used as the accessible name. Never rely on chip color alone.
   */
  trendLabel?: string;
  /**
   * Short helper line shown below the value — Body/Paragraph - Small,
   * `value-area-help-information`. Figma "Value Helper Text".
   */
  helpText?: ReactNode;
}

// `title` is re-typed as a ReactNode heading, so omit the native string `title`
// attribute from the base to avoid the incompatible-override error (TS2430).
export interface KpiCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * KPI title — Title Headings/H3, `Diagrams/KPI/title`. Figma "KPI Title Text".
   * Omit it (and the other header parts) to hide the header row (Figma "KPI Title" off).
   */
  title?: ReactNode;
  /** Optional leading 24px icon next to the title (`title-start-icon`). Figma "Header Icon". */
  iconStart?: ReactNode;
  /**
   * Optional tag right after the title. Pass a Spotler `<StatusChip>` — Figma
   * "KPI Title Tag" is a Status Chip instance.
   */
  titleTag?: ReactNode;
  /**
   * Optional trailing 20px icon (`title-end-icon`), placed right after the title / tag
   * (8px gap, not pushed to the card edge). Figma "KPI Title End Icon".
   */
  iconEnd?: ReactNode;
  /**
   * Optional header action, placed after the end icon. Pass a Spotler `<Button
   * variant="secondary">` — Figma "Header Button" is a Secondary Button instance.
   */
  headerAction?: ReactNode;
  /**
   * Heading level for the title, to keep the document outline correct.
   * @default 'h3'
   */
  headingLevel?: KpiCardHeadingLevel;
  /**
   * The card body, in Figma order: one or more `KpiCardValue` areas (each carries a 1px
   * bottom separator), then any of the remaining optional Figma parts — Progress bar +
   * Divider, the "Last update" help line, a metrics `Table`, and a Tertiary `Button`.
   */
  children: ReactNode;
}

/**
 * KpiCardValue — a single "Value Area" inside a {@link KpiCard}.
 *
 * Figma "Value Area": vertical, gap 8px, padding 8px 0, 1px bottom stroke
 * (`Monochrome/Gray - 200`). Anatomy, all packed to the start with 8px gaps:
 * - label row: 16px start icon + label + helper text + 16px end icon;
 * - value row: H4 value + Status Chip;
 * - optional Paragraph - Small helper line.
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
          <StatusChip
            variant={status}
            iconStart={trendIcon}
            aria-label={trendLabel}
          >
            {trend}
          </StatusChip>
        )}
      </div>

      {helpText && <p className="sds-kpi-card__help-text">{helpText}</p>}
    </div>
  );
});

/**
 * KpiCard — Spotler Design System (Figma "KPI", Diagrams & Stats).
 *
 * A raised surface that surfaces one or more metrics with a value, a Status Chip
 * trend/state, and supporting helper text. Used on dashboards and detail pages.
 *
 * Figma spec: vertical, gap 8px, padding 24px 32px, radius Border/Large (8px),
 * 1px inside stroke `Diagrams/KPI/stroke`, fill `Diagrams/KPI/background`,
 * effect style Drop Shadow/100. Header row (gap 8px, packed to the start):
 * 24px start icon, H3 title, title tag (Status Chip), 20px end icon, header Button.
 *
 * Variants (composed via children): Single value, Stacked values, With metrics table.
 * Each value area is a {@link KpiCardValue}; add a Spotler `Table` after the values
 * for the embedded metrics-table variant.
 */
export const KpiCard = forwardRef<HTMLDivElement, KpiCardProps>(function KpiCard(
  {
    title,
    iconStart,
    titleTag,
    iconEnd,
    headerAction,
    headingLevel = 'h3',
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = ['sds-kpi-card', className].filter(Boolean).join(' ');
  const Heading = headingLevel;
  const hasHeader = Boolean(title || iconStart || titleTag || iconEnd || headerAction);

  return (
    <div ref={ref} className={classes} {...rest}>
      {hasHeader && (
        <div className="sds-kpi-card__header">
          {iconStart && (
            <span className="sds-kpi-card__title-icon sds-kpi-card__title-icon--start" aria-hidden="true">
              {iconStart}
            </span>
          )}
          {title && <Heading className="sds-kpi-card__title">{title}</Heading>}
          {titleTag && <span className="sds-kpi-card__title-tag">{titleTag}</span>}
          {iconEnd && (
            <span className="sds-kpi-card__title-icon sds-kpi-card__title-icon--end" aria-hidden="true">
              {iconEnd}
            </span>
          )}
          {headerAction && <span className="sds-kpi-card__header-action">{headerAction}</span>}
        </div>
      )}

      {children}
    </div>
  );
});
