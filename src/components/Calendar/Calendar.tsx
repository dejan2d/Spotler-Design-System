import { forwardRef, useId, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import './Calendar.css';

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Build the 6×7 grid of dates (Monday-first) that covers `month`. */
function buildGrid(month: Date): Date[] {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const first = new Date(year, monthIndex, 1);
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first offset.
  const leading = (first.getDay() + 6) % 7;
  const start = new Date(year, monthIndex, 1 - leading);
  const days: Date[] = [];
  for (let i = 0; i < 42; i += 1) {
    days.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return days;
}

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Month to display. Any date within the desired month works. Defaults to today. */
  month?: Date;
  /** Currently selected date. */
  value?: Date | null;
  /** Called with the clicked day. */
  onSelect?: (date: Date) => void;
  /** Overrides "today" for the current-day marker (mainly for testing). */
  today?: Date;
}

/**
 * Calendar — month-grid day picker. Inline grid shared with the Date Picker.
 * Spec: references/components/calendar.md (Date Picker token group).
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  { month, value, onSelect, today, className, ...rest },
  ref,
) {
  const initialMonth = month ?? new Date();
  const [viewMonth, setViewMonth] = useState<Date>(
    () => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1),
  );
  // Keep the view in sync when a controlled `month` prop changes.
  const controlledKey = month ? `${month.getFullYear()}-${month.getMonth()}` : null;
  const [lastKey, setLastKey] = useState<string | null>(controlledKey);
  if (controlledKey && controlledKey !== lastKey) {
    setLastKey(controlledKey);
    setViewMonth(new Date(month!.getFullYear(), month!.getMonth(), 1));
  }

  const labelId = useId();
  const todayDate = today ?? new Date();
  const days = useMemo(() => buildGrid(viewMonth), [viewMonth]);

  const goPrev = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  const goNext = () =>
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));

  const classes = ['sds-calendar', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} role="group" aria-labelledby={labelId} {...rest}>
      <div className="sds-calendar__header">
        <button
          type="button"
          className="sds-calendar__nav"
          aria-label="Previous month"
          onClick={goPrev}
        >
          <span aria-hidden="true">‹</span>
        </button>
        <span className="sds-calendar__title" id={labelId} aria-live="polite">
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button
          type="button"
          className="sds-calendar__nav"
          aria-label="Next month"
          onClick={goNext}
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      <div className="sds-calendar__grid" role="grid">
        <div className="sds-calendar__weekdays" role="row">
          {WEEKDAYS.map((wd) => (
            <span key={wd} className="sds-calendar__weekday" role="columnheader">
              {wd}
            </span>
          ))}
        </div>
        <div className="sds-calendar__weeks">
          {days.map((day) => {
            const outside = day.getMonth() !== viewMonth.getMonth();
            const isToday = isSameDay(day, todayDate);
            const isSelected = value ? isSameDay(day, value) : false;
            const cellClasses = [
              'sds-calendar__day',
              outside && 'sds-calendar__day--previous',
              isToday && 'sds-calendar__day--current',
              isSelected && 'sds-calendar__day--selected',
            ]
              .filter(Boolean)
              .join(' ');
            return (
              <button
                key={day.toISOString()}
                type="button"
                role="gridcell"
                className={cellClasses}
                aria-current={isToday ? 'date' : undefined}
                aria-selected={isSelected || undefined}
                aria-label={`${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`}
                onClick={() => onSelect?.(day)}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});
