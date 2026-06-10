import { forwardRef, useCallback, useId, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './Calendar.css';

const WEEKDAYS = [
  { short: 'Mo', long: 'Monday' },
  { short: 'Tu', long: 'Tuesday' },
  { short: 'We', long: 'Wednesday' },
  { short: 'Th', long: 'Thursday' },
  { short: 'Fr', long: 'Friday' },
  { short: 'Sa', long: 'Saturday' },
  { short: 'Su', long: 'Sunday' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** Build the 6×7 grid of dates (Monday-first) that covers `month`, as six week rows. */
function buildWeeks(month: Date): Date[][] {
  const first = startOfMonth(month);
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first offset.
  const leading = (first.getDay() + 6) % 7;
  const start = addDays(first, -leading);
  const weeks: Date[][] = [];
  for (let w = 0; w < 6; w += 1) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d += 1) {
      week.push(addDays(start, w * 7 + d));
    }
    weeks.push(week);
  }
  return weeks;
}

export interface CalendarProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Month to display. Any date within the desired month works. Defaults to today. */
  month?: Date;
  /** Currently selected date. Pass `null` for no selection. */
  value?: Date | null;
  /** Called with the clicked / keyboard-activated day. */
  onSelect?: (date: Date) => void;
  /** Called whenever the visible month changes via the prev/next controls. */
  onMonthChange?: (month: Date) => void;
  /** Overrides "today" for the current-day marker (mainly for testing / time zones). */
  today?: Date;
  /** Predicate to disable individual days (e.g. min/max range). Disabled days are not selectable. */
  isDateDisabled?: (date: Date) => boolean;
  /** Accessible label for the whole calendar. Defaults to "Calendar". */
  ariaLabel?: string;
  /** Leading icon for the previous-month control. Use a FontAwesome Duotone icon node. */
  iconPrev?: ReactNode;
  /** Trailing icon for the next-month control. Use a FontAwesome Duotone icon node. */
  iconNext?: ReactNode;
}

/**
 * Calendar — the month-grid day surface shared with the Date Picker, usable inline or in a popover.
 *
 * Anatomy: month/year header + prev/next, weekday row, 6×7 day grid.
 * Day-cell states: default, hover, today (current-stroke), selected, out-of-month (previous), disabled.
 * Day cell 36×36, radius small (4px), gap 4px; container padding 12px, radius medium (6px).
 * Accessibility: role="grid" with arrow-key roving navigation, month paging, announced selection,
 * and non-color cues (stroke for today, bold weight for selected).
 *
 * Spec: Spotler Design System "Calendar" (shares the `Date Picker` token group).
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  {
    month,
    value,
    onSelect,
    onMonthChange,
    today,
    isDateDisabled,
    ariaLabel = 'Calendar',
    iconPrev,
    iconNext,
    className,
    ...rest
  },
  ref,
) {
  const initialMonth = month ?? new Date();
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(initialMonth));

  // Keep the view in sync when a controlled `month` prop changes.
  const controlledKey = month ? `${month.getFullYear()}-${month.getMonth()}` : null;
  const [lastKey, setLastKey] = useState<string | null>(controlledKey);
  if (controlledKey && controlledKey !== lastKey) {
    setLastKey(controlledKey);
    setViewMonth(startOfMonth(month!));
  }

  const labelId = useId();
  const statusId = useId();
  const todayDate = today ?? new Date();
  const weeks = useMemo(() => buildWeeks(viewMonth), [viewMonth]);

  // Roving-tabindex anchor: the one day cell that is focusable in the grid.
  // Prefer the selected day, then today, then the first day of the month.
  const activeDay = useMemo<Date>(() => {
    if (value && isSameMonth(value, viewMonth)) return value;
    if (isSameMonth(todayDate, viewMonth)) return todayDate;
    return startOfMonth(viewMonth);
  }, [value, todayDate, viewMonth]);

  const gridRef = useRef<HTMLDivElement>(null);

  const setMonth = useCallback(
    (next: Date) => {
      const normalized = startOfMonth(next);
      setViewMonth(normalized);
      onMonthChange?.(normalized);
    },
    [onMonthChange],
  );

  const goPrev = () => setMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1));
  const goNext = () => setMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1));

  /** Move keyboard focus to the cell for `target`, paging the month if it falls outside. */
  const focusDay = useCallback((target: Date) => {
    const grid = gridRef.current;
    if (!grid) return;
    const selector = `[data-day="${target.getFullYear()}-${target.getMonth()}-${target.getDate()}"]`;
    const cell = grid.querySelector<HTMLButtonElement>(selector);
    if (cell) cell.focus();
  }, []);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, day: Date) => {
    let next: Date | null = null;
    switch (event.key) {
      case 'ArrowLeft':
        next = addDays(day, -1);
        break;
      case 'ArrowRight':
        next = addDays(day, 1);
        break;
      case 'ArrowUp':
        next = addDays(day, -7);
        break;
      case 'ArrowDown':
        next = addDays(day, 7);
        break;
      case 'Home':
        next = addDays(day, -((day.getDay() + 6) % 7));
        break;
      case 'End':
        next = addDays(day, 6 - ((day.getDay() + 6) % 7));
        break;
      case 'PageUp':
        next = new Date(day.getFullYear(), day.getMonth() - 1, day.getDate());
        break;
      case 'PageDown':
        next = new Date(day.getFullYear(), day.getMonth() + 1, day.getDate());
        break;
      default:
        return;
    }
    event.preventDefault();
    if (!isSameMonth(next, viewMonth)) {
      setMonth(next);
    }
    // Defer focus so the grid has re-rendered with the (possibly) new month.
    requestAnimationFrame(() => focusDay(next!));
  };

  const selectedLabel =
    value
      ? `Selected ${value.getDate()} ${MONTHS[value.getMonth()]} ${value.getFullYear()}`
      : '';

  const classes = ['sds-calendar', className].filter(Boolean).join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      role="group"
      aria-label={ariaLabel}
      aria-describedby={statusId}
      {...rest}
    >
      <div className="sds-calendar__header">
        <button
          type="button"
          className="sds-calendar__nav"
          aria-label="Previous month"
          onClick={goPrev}
        >
          <span className="sds-calendar__nav-icon" aria-hidden="true">
            {iconPrev ?? <span className="sds-calendar__chevron sds-calendar__chevron--prev" />}
          </span>
        </button>
        <span className="sds-calendar__title" id={labelId}>
          {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
        </span>
        <button
          type="button"
          className="sds-calendar__nav"
          aria-label="Next month"
          onClick={goNext}
        >
          <span className="sds-calendar__nav-icon" aria-hidden="true">
            {iconNext ?? <span className="sds-calendar__chevron sds-calendar__chevron--next" />}
          </span>
        </button>
      </div>

      <div
        ref={gridRef}
        className="sds-calendar__grid"
        role="grid"
        aria-labelledby={labelId}
      >
        <div className="sds-calendar__weekdays" role="row">
          {WEEKDAYS.map((wd) => (
            <span
              key={wd.short}
              className="sds-calendar__weekday"
              role="columnheader"
              aria-label={wd.long}
            >
              {wd.short}
            </span>
          ))}
        </div>
        {weeks.map((week) => (
          <div key={week[0].toISOString()} className="sds-calendar__week" role="row">
            {week.map((day) => {
              const outside = !isSameMonth(day, viewMonth);
              const isToday = isSameDay(day, todayDate);
              const isSelected = value ? isSameDay(day, value) : false;
              const disabled = isDateDisabled ? isDateDisabled(day) : false;
              const isActive = isSameDay(day, activeDay);
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
                  data-day={`${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`}
                  className={cellClasses}
                  tabIndex={isActive ? 0 : -1}
                  aria-current={isToday ? 'date' : undefined}
                  aria-selected={isSelected}
                  aria-disabled={disabled || undefined}
                  aria-label={`${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`}
                  onClick={() => {
                    if (disabled) return;
                    if (outside) setMonth(day);
                    onSelect?.(day);
                  }}
                  onKeyDown={(event) => handleKeyDown(event, day)}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <span id={statusId} className="sds-calendar__status" role="status" aria-live="polite">
        {selectedLabel}
      </span>
    </div>
  );
});
