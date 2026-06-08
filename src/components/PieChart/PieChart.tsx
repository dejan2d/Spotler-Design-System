import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './PieChart.css';

/**
 * The categorical chart color tokens as CSS variable references. The Pie Chart token
 * group ships 10 slice colors and (unlike Bar/Line) has no dedicated "other" bucket,
 * so this array has 10 entries. Series beyond 10 reuse the last color.
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

export interface PieChartSeries {
  /** Legend label. */
  label: ReactNode;
  /** Optional value shown beside the label. */
  value?: ReactNode;
  /** Optional explicit color (CSS var or value). Defaults to `pieChartColors[index]`. */
  color?: string;
}

export interface PieChartProps extends HTMLAttributes<HTMLDivElement> {
  /** Chart title (header text). */
  title?: ReactNode;
  /** Optional leading header icon. */
  icon?: ReactNode;
  /** Slot for a period picker rendered in the header. */
  periodPicker?: ReactNode;
  /** Series used to build the legend. */
  series?: PieChartSeries[];
  /** The plotted chart goes here. */
  children?: ReactNode;
}

/**
 * PieChart — presentational, token-driven wrapper providing an accessible container
 * with a header (title + period picker), a legend, and a slot for the plotted chart.
 * It does NOT render slices itself. Tokens: `--diagrams-pie-chart-*`.
 */
export const PieChart = forwardRef<HTMLDivElement, PieChartProps>(function PieChart(
  { title, icon, periodPicker, series = [], className, children, ...rest },
  ref,
) {
  const classes = ['sds-pie-chart', className].filter(Boolean).join(' ');
  const labelledById = title ? (rest.id ? `${rest.id}-title` : undefined) : undefined;

  return (
    <div
      ref={ref}
      className={classes}
      role="group"
      aria-label={typeof title === 'string' ? title : undefined}
      {...rest}
    >
      {(title || icon || periodPicker) && (
        <div className="sds-pie-chart__header">
          {icon && (
            <span className="sds-pie-chart__header-icon" aria-hidden="true">
              {icon}
            </span>
          )}
          {title && (
            <span className="sds-pie-chart__header-text" id={labelledById}>
              {title}
            </span>
          )}
          {periodPicker && <span className="sds-pie-chart__period-picker">{periodPicker}</span>}
        </div>
      )}

      <div className="sds-pie-chart__plot">{children}</div>

      {series.length > 0 && (
        <ul className="sds-pie-chart__legend">
          {series.map((s, i) => (
            <li className="sds-pie-chart__legend-item" key={i}>
              <span
                className="sds-pie-chart__legend-swatch"
                aria-hidden="true"
                style={{ backgroundColor: s.color ?? pieChartColors[Math.min(i, pieChartColors.length - 1)] }}
              />
              <span className="sds-pie-chart__legend-label">{s.label}</span>
              {s.value != null && <span className="sds-pie-chart__legend-value">{s.value}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
