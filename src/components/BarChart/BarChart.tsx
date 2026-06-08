import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './BarChart.css';

/**
 * The 10 categorical chart color tokens plus the "other" bucket, as CSS variable
 * references. Index into this to color a series; series beyond 10 fall back to `other`.
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

export interface BarChartSeries {
  /** Legend label. */
  label: ReactNode;
  /** Optional value shown beside the label. */
  value?: ReactNode;
  /** Optional explicit color (CSS var or value). Defaults to `barChartColors[index]`. */
  color?: string;
}

export interface BarChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Chart title (header text). */
  title?: ReactNode;
  /** Optional leading header icon. */
  icon?: ReactNode;
  /** Slot for a period picker rendered in the header. */
  periodPicker?: ReactNode;
  /** Series used to build the legend. */
  series?: BarChartSeries[];
  /** The plotted chart goes here. */
  children?: ReactNode;
}

/**
 * BarChart — presentational, token-driven wrapper providing an accessible container
 * with a header (title + period picker), a legend, and a slot for the plotted chart.
 * It does NOT render bars itself. Tokens: `--diagrams-bar-chart-*`.
 */
export const BarChart = forwardRef<HTMLDivElement, BarChartProps>(function BarChart(
  { title, icon, periodPicker, series = [], className, children, ...rest },
  ref,
) {
  const classes = ['sds-bar-chart', className].filter(Boolean).join(' ');
  const labelledById = title ? rest.id ? `${rest.id}-title` : undefined : undefined;

  return (
    <div
      ref={ref}
      className={classes}
      role="group"
      aria-label={typeof title === 'string' ? title : undefined}
      {...rest}
    >
      {(title || icon || periodPicker) && (
        <div className="sds-bar-chart__header">
          {icon && (
            <span className="sds-bar-chart__header-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {title && (
            <span className="sds-bar-chart__header-text" id={labelledById}>
              {title}
            </span>
          )}
          {periodPicker && <span className="sds-bar-chart__period-picker">{periodPicker}</span>}
        </div>
      )}

      <div className="sds-bar-chart__plot">{children}</div>

      {series.length > 0 && (
        <ul className="sds-bar-chart__legend">
          {series.map((s, i) => (
            <li className="sds-bar-chart__legend-item" key={i}>
              <span
                className="sds-bar-chart__legend-swatch"
                aria-hidden="true"
                style={{ backgroundColor: s.color ?? barChartColors[Math.min(i, barChartColors.length - 1)] }}
              />
              <span className="sds-bar-chart__legend-label">{s.label}</span>
              {s.value != null && <span className="sds-bar-chart__legend-value">{s.value}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
