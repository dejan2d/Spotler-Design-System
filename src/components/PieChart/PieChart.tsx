import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Divider } from '../Divider';
import './PieChart.css';

/**
 * The 10 categorical slice color tokens (`Diagrams/Pie Chart/chart-1..10`) as CSS variable
 * references. Unlike Bar/Line, the Pie Chart token group has no "Other" bucket.
 *
 * Default slice colors cycle through chart-1..chart-10: an 11th series starts again at
 * chart-1 (Figma note "Extra colors": "11th will be the first color").
 */
export const pieChartColors = [
  'var(--diagrams-pie-chart-chart-1)',
  'var(--diagrams-pie-chart-chart-2)',
  'var(--diagrams-pie-chart-chart-3)',
  'var(--diagrams-pie-chart-chart-4)',
  'var(--diagrams-pie-chart-chart-5)',
  'var(--diagrams-pie-chart-chart-6)',
  'var(--diagrams-pie-chart-chart-7)',
  'var(--diagrams-pie-chart-chart-8)',
  'var(--diagrams-pie-chart-chart-9)',
  'var(--diagrams-pie-chart-chart-10)',
] as const;

/** Number of cycling slice colors (chart-1..chart-10). */
const SERIES_COLOR_COUNT = pieChartColors.length;

/** Where the legend sits relative to the plot. Mirrors Figma "Legend position". */
export type PieChartLegendPosition = 'under' | 'right';

export interface PieChartSeries {
  /** Legend label — Body/Paragraph - Regular, `Diagrams/Pie Chart/legend-text`. */
  label: ReactNode;
  /**
   * Optional explicit color (CSS var or value). Defaults to
   * `pieChartColors[index % 10]` (chart-1..chart-10, cycling).
   */
  color?: string;
}

// `title` is re-typed as a ReactNode heading, so omit the native string `title`
// attribute from the base to avoid the incompatible-override error (TS2430).
export interface PieChartProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Chart name — Title Headings/H4, `Diagrams/Pie Chart/header-text`. Figma "Chart name". */
  title?: ReactNode;
  /**
   * Label in front of the period picker — Body/Paragraph - Small,
   * `Diagrams/Pie Chart/period-picker`. Figma "Prediction period".
   */
  periodLabel?: ReactNode;
  /** Slot for the period picker (a Spotler Dropdown in Figma). Figma "Show Date picker". */
  periodPicker?: ReactNode;
  /**
   * Trailing settings control at the end of the top nav — an `ellipsis-vertical` trigger,
   * 20px glyph tinted `Diagrams/Pie Chart/header-icon`. Figma "Show Settings".
   */
  settings?: ReactNode;
  /**
   * Legend placement. `under` — legend centered and wrapping below the plot (full-width
   * graphs). `right` — legend stacked to the right of the plot, vertically centered.
   * @default 'under'
   */
  legendPosition?: PieChartLegendPosition;
  /** Slices used to build the legend (up to 7). */
  series?: PieChartSeries[];
  /** The plotted chart (pie, up to 7 slices) goes here. */
  children?: ReactNode;
}

/**
 * PieChart — Spotler Design System (Figma "Graph", Graph Type=Pie).
 *
 * Presentational, token-driven wrapper: it does NOT render slices itself.
 * Use up to 7 slices (Figma "Number of Data" 1–7); group smaller slices into one.
 *
 * Figma spec — frameless (no fill, stroke, radius, shadow or padding), vertical, gap 24px:
 * 1. Top nav (shown when any header part is set): Chart name (H4) growing, then the period
 *    area (Paragraph - Small label + picker, gap 10px), then the settings control;
 *    gap 32px, vertically centered.
 * 2. Horizontal Divider under the top nav.
 * 3. Graph + legend, gap 32px. Legend items: 16x16 colour indicator (radius Border/Small)
 *    + Paragraph - Regular label, gap 8px; items gap 16px (under) or 12px (right).
 *
 * Tokens: `--diagrams-pie-chart-*`.
 */
export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(function PieChart(
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
  const classes = ['sds-pie-chart', `sds-pie-chart--legend-${legendPosition}`, className]
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
          <div className="sds-pie-chart__header">
            <span className="sds-pie-chart__header-text" id={labelledById}>
              {title}
            </span>
            {(periodLabel || periodPicker) && (
              <span className="sds-pie-chart__period">
                {periodLabel && <span className="sds-pie-chart__period-label">{periodLabel}</span>}
                {periodPicker && <span className="sds-pie-chart__period-picker">{periodPicker}</span>}
              </span>
            )}
            {settings && <span className="sds-pie-chart__settings">{settings}</span>}
          </div>
          <Divider className="sds-pie-chart__divider" />
        </>
      )}

      <div className="sds-pie-chart__body">
        <div className="sds-pie-chart__plot">{children}</div>

        {series.length > 0 && (
          <ul className="sds-pie-chart__legend">
            {series.map((s, i) => (
              <li className="sds-pie-chart__legend-item" key={i}>
                <span
                  className="sds-pie-chart__legend-swatch"
                  aria-hidden="true"
                  style={{ backgroundColor: s.color ?? pieChartColors[i % SERIES_COLOR_COUNT] }}
                />
                <span className="sds-pie-chart__legend-label">{s.label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});
