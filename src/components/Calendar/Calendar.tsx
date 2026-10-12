import { forwardRef, useCallback, useId, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './Calendar.css';

/* Figma weekday header row: single letters, Monday first. */
const WEEKDAYS = [
  { short: 'M', long: 'Monday' },
  { short: 'T', long: 'Tuesday' },
  { short: 'W', long: 'Wednesday' },
  { short: 'T', long: 'Thursday' },
  { short: 'F', long: 'Friday' },
  { short: 'S', long: 'Saturday' },
  { short: 'S', long: 'Sunday' },
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/* Built-in Font Awesome Pro 7.1.0 Duotone Regular icons (src/icons/duotone-regular/).
   Font Awesome Pro by @fontawesome — https://fontawesome.com (Commercial License), © 2025 Fonticons, Inc. */
const AngleLeftIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      fill="currentColor"
      d="M207.5 303C198.1 312.4 198.1 327.6 207.5 336.9L367.5 496.9C376.9 506.3 392.1 506.3 401.4 496.9C410.7 487.5 410.8 472.3 401.4 463L258.4 320L401.4 177C410.8 167.6 410.8 152.4 401.4 143.1C392 133.8 376.8 133.7 367.5 143.1L207.5 303z"
    />
  </svg>
);

const AngleRightIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      fill="currentColor"
      d="M433.5 303C442.9 312.4 442.9 327.6 433.5 336.9L273.5 497C264.1 506.4 248.9 506.4 239.6 497C230.3 487.6 230.2 472.4 239.6 463.1L382.6 320.1L239.6 177.1C230.2 167.7 230.2 152.5 239.6 143.2C249 133.9 264.2 133.8 273.5 143.2L433.5 303.2z"
    />
  </svg>
);

const AngleDownIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      fill="currentColor"
      d="M337.5 433C328.1 442.4 312.9 442.4 303.6 433L143.5 273C134.1 263.6 134.1 248.4 143.5 239.1C152.9 229.8 168.1 229.7 177.4 239.1L320.4 382.1L463.4 239.1C472.8 229.7 488 229.7 497.3 239.1C506.6 248.5 506.7 263.7 497.3 273L337.3 433z"
    />
  </svg>
);

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

/**
 * Build the Monday-first week rows that cover `month`. Like the Figma Date picker, only the
 * weeks the month needs are rendered (usually 5), padded with previous / next month days.
 */
function buildWeeks(month: Date): Date[][] {
  const first = startOfMonth(month);
  // JS getDay(): 0=Sun..6=Sat. Convert to Monday-first offset.
  const leading = (first.getDay() + 6) % 7;
  const daysInMonth = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  const weekCount = Math.ceil((leading + daysInMonth) / 7);
  const start = addDays(first, -leading);
  const weeks: Date[][] = [];
  for (let w = 0; w < weekCount; w += 1) {
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
  /** Called whenever the visible month changes (prev/next controls or the Month / Year selects). */
  onMonthChange?: (month: Date) => void;
  /** Overrides "today" for the current-day marker (mainly for testing / time zones). */
  today?: Date;
  /** Accessible label for the whole calendar. Defaults to "Calendar". */
  ariaLabel?: string;
  /** Icon for the previous-month control (20×20). Defaults to the built-in Font Awesome `angle-left`. */
  iconPrev?: ReactNode;
  /** Icon for the next-month control (20×20). Defaults to the built-in Font Awesome `angle-right`. */
  iconNext?: ReactNode;
  /** First year offered in the Year select. @default today's year − 100 */
  minYear?: number;
  /** Last year offered in the Year select. @default today's year + 20 */
  maxYear?: number;
}

/**
 * Calendar — the month-grid day surface shared with the Date Picker, usable inline or in a popover.
 *
 * Figma: "Date picker" 1302:11951 and "Calendar Item" set 1302:2058 (page 29:7). 316px wide.
 * - Header 60px: Month and Year selects on the left (Input Field State=Default, Size=Regular,
 *   110×40, radius 8px, gap 20px, `angle-down`), `angle-left` / `angle-right` 20×20 controls on the
 *   right in `Date Picker/icon`.
 * - Weekday row: M T W T F S S as Calendar Item Default cells (Paragraph - Regular,
 *   `Date Picker/default-text`), 1px Monochrome/Gray - 200 bottom stroke.
 * - Week rows: padding 0 4px, no gap; only the weeks the month needs.
 * - Day cell (Calendar Item) 44×44, circular, Paragraph - Regular in every state:
 *   Default `default-*`, Hover `hover-*`, Current Day 1px `current-stroke` + `current-text`,
 *   Previous Month (any day outside the month) `previous-*`, selected `selected-background` +
 *   `selected-text` (the Figma DR fill).
 *
 * The keyboard focus rings are not designed in Figma; they are kept for accessibility.
 * Not implemented: Figma's date-range (DR - Left / Center / Right) selection.
 * Accessibility: role="grid" with arrow-key roving navigation, month paging and announced selection.
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  {
    month,
    value,
    onSelect,
    onMonthChange,
    today,
    ariaLabel = 'Calendar',
    iconPrev,
    iconNext,
    minYear,
    maxYear,
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
  const monthSelectId = useId();
  const yearSelectId = useId();
  const todayDate = today ?? new Date();
  const weeks = useMemo(() => buildWeeks(viewMonth), [viewMonth]);

  const viewYear = viewMonth.getFullYear();
  const firstYear = Math.min(minYear ?? todayDate.getFullYear() - 100, viewYear);
  const lastYear = Math.max(maxYear ?? todayDate.getFullYear() + 20, viewYear);
  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = firstYear; y <= lastYear; y += 1) list.push(y);
    return list;
  }, [firstYear, lastYear]);

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

  const goPrev = () => setMonth(new Date(viewYear, viewMonth.getMonth() - 1, 1));
  const goNext = () => setMonth(new Date(viewYear, viewMonth.getMonth() + 1, 1));

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
        <div className="sds-calendar__selects">
          <div className="sds-calendar__select">
            <select
              id={monthSelectId}
              className="sds-calendar__select-input"
              aria-label="Month"
              value={viewMonth.getMonth()}
              onChange={(e) => setMonth(new Date(viewYear, Number(e.target.value), 1))}
            >
              {MONTHS.map((name, index) => (
                <option key={name} value={index}>
                  {name}
                </option>
              ))}
            </select>
            <span className="sds-calendar__select-icon" aria-hidden="true">
              <AngleDownIcon />
            </span>
          </div>
          <div className="sds-calendar__select">
            <select
              id={yearSelectId}
              className="sds-calendar__select-input"
              aria-label="Year"
              value={viewYear}
              onChange={(e) => setMonth(new Date(Number(e.target.value), viewMonth.getMonth(), 1))}
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <span className="sds-calendar__select-icon" aria-hidden="true">
              <AngleDownIcon />
            </span>
          </div>
        </div>
        <div className="sds-calendar__navs">
          <button
            type="button"
            className="sds-calendar__nav"
            aria-label="Previous month"
            onClick={goPrev}
          >
            <span className="sds-calendar__nav-icon" aria-hidden="true">
              {iconPrev ?? <AngleLeftIcon />}
            </span>
          </button>
          <button
            type="button"
            className="sds-calendar__nav"
            aria-label="Next month"
            onClick={goNext}
          >
            <span className="sds-calendar__nav-icon" aria-hidden="true">
              {iconNext ?? <AngleRightIcon />}
            </span>
          </button>
        </div>
        {/* Visible month is shown by the selects; this hidden label names the grid. */}
        <span className="sds-calendar__title" id={labelId}>
          {MONTHS[viewMonth.getMonth()]} {viewYear}
        </span>
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
              key={wd.long}
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
                  aria-label={`${day.getDate()} ${MONTHS[day.getMonth()]} ${day.getFullYear()}`}
                  onClick={() => {
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
