import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Divider } from '../Divider';
import './BarChart.css';

/**
 * The 10 categorical chart color tokens (`Diagrams/Bar Chart/chart-1..10`) plus the
 * "Other" bucket (`other-charts`, index 10), as CSS variable references.
 *
 * Default series colors cycle through chart-1..chart-10: the 11th series starts again at
 * chart-1 (Figma note "Extra colors": "11th will be the first color"). `other-charts` is
 * never assigned automatically — pass `barChartColors[10]` as a series `color` for a
 * grouped "Others" series or for inactive data.
 */
export const barChartColors = [
  'var(--diagrams-bar-chart-chart-1)',
  'var(--diagrams-bar-chart-chart-2)',
  'var(--diagrams-bar-chart-chart-3)',
  'var(--diagrams-bar-chart-chart-4)',
  'var(--diagrams-bar-chart-chart-5)',
  'var(--diagrams-bar-chart-chart-6)',
  'var(--diagrams-bar-chart-chart-7)',
  'var(--diagrams-bar-chart-chart-8)',
  'var(--diagrams-bar-chart-chart-9)',
  'var(--diagrams-bar-chart-chart-10)',
  'var(--diagrams-bar-chart-other-charts)',
] as const;

/** Number of cycling series colors (chart-1..chart-10); `other-charts` is excluded. */
const SERIES_COLOR_COUNT = 10;

/** Where the legend sits relative to the plot. Mirrors Figma "Legend position". */
export type BarChartLegendPosition = 'under' | 'right';

export interface BarChartSeries {
  /** Legend label — Body/Paragraph - Regular, `Diagrams/Bar Chart/legend-text`. */
  label: ReactNode;
  /**
   * Optional explicit color (CSS var or value). Defaults to
   * `barChartColors[index % 10]` (chart-1..chart-10, cycling).
   */
  color?: string;
}

// `title` is re-typed as a ReactNode heading, so omit the native string `title`
// attribute from the base to avoid the incompatible-override error (TS2430).
export interface BarChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Chart name — Title Headings/H4, `Diagrams/Bar Chart/header-text`. Figma "Chart name". */
  title?: ReactNode;
  /**
   * Label in front of the period picker — Body/Paragraph - Small,
   * `Diagrams/Bar Chart/period-picker`. Figma "Prediction period".
   */
  periodLabel?: ReactNode;
  /** Slot for the period picker (a Spotler Dropdown in Figma). Figma "Show Date picker". */
  periodPicker?: ReactNode;
  /**
   * Trailing settings control at the end of the top nav — an `ellipsis-vertical` trigger,
   * 20px glyph tinted `Diagrams/Bar Chart/header-icon`. Figma "Show Settings".
   */
  settings?: ReactNode;
  /**
   * Legend placement. `under` — legend centered and wrapping below the plot (full-width
   * graphs). `right` — legend stacked to the right of the plot, vertically centered.
   * @default 'under'
   */
  legendPosition?: BarChartLegendPosition;
  /** Series used to build the legend. */
  series?: BarChartSeries[];
  /** The plotted chart (vertical columns) goes here. */
  children?: ReactNode;
}

/**
 * BarChart — Spotler Design System (Figma "Graph", Graph Type=Column).
 *
 * Presentational, token-driven wrapper: it does NOT render bars itself. Bars are
 * vertical (grouped columns) only — Figma has no horizontal or stacked variant.
 * Figma recommends up to 4 data series (variants offer 1–7).
 *
 * Figma spec — frameless (no fill, stroke, radius, shadow or padding), vertical, gap 24px:
 * 1. Top nav (shown when any header part is set): Chart name (H4) growing, then the period
 *    area (Paragraph - Small label + picker, gap 10px), then the settings control;
 *    gap 32px, vertically centered.
 * 2. Horizontal Divider under the top nav.
 * 3. Graph + legend, gap 32px. Legend items: 16x16 colour indicator (radius Border/Small)
 *    + Paragraph - Regular label, gap 8px; items gap 16px (under) or 12px (right).
 *
 * Tokens: `--diagrams-bar-chart-*`.
 */
export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  {
    title,
    periodLabel,
    periodPicker,
    settings,
    legendPosition = 'under',
    series = [],
    className,
    children,
    ...rest
  },
  ref,
) {
  const classes = ['sds-bar-chart', `sds-bar-chart--legend-${legendPosition}`, className]
    .filter(Boolean)
    .join(' ');
  const labelledById = title ? (rest.id ? `${rest.id}-title` : undefined) : undefined;
  const hasTopNav = Boolean(title || periodLabel || periodPicker || settings);

  return (
    <div
      ref={ref}
      className={classes}
      role="group"
      aria-label={typeof title === 'string' ? title : undefined}
      {...rest}
    >
      {hasTopNav && (
        <>
          <div className="sds-bar-chart__header">
            <span className="sds-bar-chart__header-text" id={labelledById}>
              {title}
            </span>
            {(periodLabel || periodPicker) && (
              <span className="sds-bar-chart__period">
                {periodLabel && <span className="sds-bar-chart__period-label">{periodLabel}</span>}
                {periodPicker && <span className="sds-bar-chart__period-picker">{periodPicker}</span>}
              </span>
            )}
            {settings && <span className="sds-bar-chart__settings">{settings}</span>}
          </div>
          <Divider className="sds-bar-chart__divider" />
        </>
      )}

      <div className="sds-bar-chart__body">
        <div className="sds-bar-chart__plot">{children}</div>

        {series.length > 0 && (
          <ul className="sds-bar-chart__legend">
            {series.map((s, i) => (
              <li className="sds-bar-chart__legend-item" key={i}>
                <span
                  className="sds-bar-chart__legend-swatch"
                  aria-hidden="true"
                  style={{ backgroundColor: s.color ?? barChartColors[i % SERIES_COLOR_COUNT] }}
                />
                <span className="sds-bar-chart__legend-label">{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});
