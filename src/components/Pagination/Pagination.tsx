import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Pagination.css';

/** A rendered entry in the page list: a real page number or one of the two overflow ellipses. */
export type PaginationEntry = number | 'ellipsis-previous' | 'ellipsis-next';

/**
 * Figma "Version":
 * - `large` — full-width bar: "Show" label + size changer + range label on the
 *   left, page controls on the right (padding 16px 8px).
 * - `small` — page controls only (padding 12px 8px); no size changer or range label.
 */
export type PaginationSize = 'large' | 'small';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page (1-based). The matching number button is marked `aria-current="page"`. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Fired with the requested 1-based page number when a page or arrow is activated. */
  onChange: (page: number) => void;
  /**
   * Figma "Version". `small` never renders the size changer or the range label.
   * @default 'large'
   */
  size?: PaginationSize;
  /**
   * Figma State=Disabled: disables every number, the prev/next arrows and the
   * size changer, and applies the Disabled/* tokens.
   * @default false
   */
  disabled?: boolean;
  /**
   * How many page buttons to show on each side of the current page before
   * collapsing the gap into an ellipsis.
   * @default 1
   */
  siblingCount?: number;
  /** Current page size. When provided together with `onPageSizeChange`, renders the size changer (large only). */
  pageSize?: number;
  /**
   * Selectable page sizes for the size changer.
   * @default [10, 25, 50, 100]
   */
  pageSizeOptions?: number[];
  /** Fired with the chosen page size when the size changer value changes. */
  onPageSizeChange?: (size: number) => void;
  /**
   * Visible label in front of the size changer (Figma text "Show").
   * @default 'Show'
   */
  pageSizeLabel?: ReactNode;
  /**
   * Total number of items. With `pageSize`, renders the range label
   * (Figma "1-10 of 138 total entries.") — large only.
   */
  totalItems?: number;
  /**
   * Renders the range label text.
   * @default (from, to, total) => `${from}-${to} of ${total} total entries.`
   */
  formatRange?: (from: number, to: number, total: number) => ReactNode;
  /** Leading (previous) navigation icon. Use a FontAwesome Duotone icon node (12px, Figma `angle`). */
  prevIcon?: ReactNode;
  /** Trailing (next) navigation icon. Use a FontAwesome Duotone icon node (12px, Figma `angle`). */
  nextIcon?: ReactNode;
  /** Trailing chevron icon for the size changer. Use a FontAwesome Duotone icon node (20px). */
  sizeChangerIcon?: ReactNode;
  /**
   * Accessible label for the previous-page control.
   * @default 'Go to previous page'
   */
  prevLabel?: string;
  /**
   * Accessible label for the next-page control.
   * @default 'Go to next page'
   */
  nextLabel?: string;
  /**
   * Accessible label for the size changer.
   * @default 'Items per page'
   */
  sizeChangerLabel?: string;
  /**
   * Renders the accessible label of a number button. Override to localise.
   * @default (page) => `Go to page ${page}`
   */
  itemAriaLabel?: (page: number) => string;
  /**
   * Renders the visible text of a size-changer option (Figma shows the bare number, e.g. "10").
   * @default (size) => `${size}`
   */
  formatPageSizeOption?: (size: number) => string;
}

/**
 * Builds the displayed sequence of page entries, inserting at most two ellipses
 * so the control stays a fixed width regardless of `pageCount`.
 */
function buildRange(page: number, pageCount: number, siblingCount: number): PaginationEntry[] {
  // first + last + current + 2 siblings each side + 2 ellipses
  const totalNumbers = siblingCount * 2 + 5;
  if (pageCount <= totalNumbers) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const left = Math.max(page - siblingCount, 2);
  const right = Math.min(page + siblingCount, pageCount - 1);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pageCount - 1;

  const entries: PaginationEntry[] = [1];
  if (showLeftEllipsis) entries.push('ellipsis-previous');
  for (let i = left; i <= right; i++) entries.push(i);
  if (showRightEllipsis) entries.push('ellipsis-next');
  entries.push(pageCount);
  return entries;
}

/**
 * Pagination — Spotler Design System.
 *
 * Controls for moving through paged data: numbered page buttons, prev/next
 * navigation arrows, overflow ellipses, and (large only) a "Show" page-size
 * changer plus a range label.
 *
 * Figma (Pagination 298:24472, default Version=Large / State=Normal):
 * - Large: full width, padding 16px 8px, options group left (8px gaps),
 *   controls right; Small: padding 12px 8px, controls only.
 * - Controls: 32×32 circles, 8px apart; 12px prev/next icon; numbers Paragraph -
 *   Regular, selected Paragraph - Semi Bold; ellipsis 32×32 with a 20px glyph.
 * - Size changer: 80×32, radius 4px, padding 4px 8px, 20px chevron.
 * - Disabled: Disabled/background + Disabled/stroke fills, Disabled/text and
 *   Disabled/icon (prev/next at the bounds use the same look).
 *
 * Accessibility: rendered as `nav[aria-label="Pagination"]`; the current page
 * carries `aria-current="page"`; every control is a real button with a label;
 * prev/next are disabled at the bounds.
 *
 * Token names preserve the Figma typos verbatim: `nagivation` and `elipsis`.
 */
export const Pagination = forwardRef<HTMLElement, PaginationProps>(function Pagination(
  {
    page,
    pageCount,
    onChange,
    size = 'large',
    disabled = false,
    siblingCount = 1,
    pageSize,
    pageSizeOptions = [10, 25, 50, 100],
    onPageSizeChange,
    pageSizeLabel = 'Show',
    totalItems,
    formatRange = (from: number, to: number, total: number) =>
      `${from}-${to} of ${total} total entries.`,
    prevIcon,
    nextIcon,
    sizeChangerIcon,
    prevLabel = 'Go to previous page',
    nextLabel = 'Go to next page',
    sizeChangerLabel = 'Items per page',
    itemAriaLabel = (n: number) => `Go to page ${n}`,
    formatPageSizeOption = (option: number) => `${option}`,
    className,
    ...rest
  },
  ref,
) {
  const selectId = useId();
  const classes = [
    'sds-pagination',
    `sds-pagination--${size}`,
    disabled && 'sds-pagination--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  const entries = buildRange(page, pageCount, siblingCount);
  const atStart = page <= 1;
  const atEnd = page >= pageCount;
  const prevDisabled = disabled || atStart;
  const nextDisabled = disabled || atEnd;

  const isLarge = size === 'large';
  const showSizeChanger =
    isLarge && pageSize !== undefined && onPageSizeChange !== undefined;
  // Range label (Figma "1-10 of 138 total entries."): needs both the total and the page size.
  let range: ReactNode = null;
  if (isLarge && totalItems !== undefined && pageSize !== undefined) {
    const from = totalItems > 0 ? (page - 1) * pageSize + 1 : 0;
    const to = Math.min(page * pageSize, totalItems);
    range = formatRange(from, to, totalItems);
  }
  const showRange = range !== null;

  return (
    <nav ref={ref} className={classes} aria-label="Pagination" {...rest}>
      {(showSizeChanger || showRange) && (
        <div className="sds-pagination__options">
          {showSizeChanger && (
            <>
              <label className="sds-pagination__label" htmlFor={selectId}>
                {pageSizeLabel}
              </label>
              <div className="sds-pagination__size-changer">
                <select
                  id={selectId}
                  className="sds-pagination__size-select"
                  value={pageSize}
                  disabled={disabled}
                  onChange={(event) => onPageSizeChange?.(Number(event.target.value))}
                  aria-label={sizeChangerLabel}
                >
                  {pageSizeOptions.map((option) => (
                    <option key={option} value={option}>
                      {formatPageSizeOption(option)}
                    </option>
                  ))}
                </select>
                {sizeChangerIcon && (
                  <span className="sds-pagination__size-icon" aria-hidden="true">
                    {sizeChangerIcon}
                  </span>
                )}
              </div>
            </>
          )}
          {showRange && (
            <span className="sds-pagination__range">{range}</span>
          )}
        </div>
      )}

      <div className="sds-pagination__controls">
        <button
          type="button"
          className="sds-pagination__nav sds-pagination__nav--previous"
          aria-label={prevLabel}
          disabled={prevDisabled}
          aria-disabled={prevDisabled || undefined}
          onClick={() => {
            if (!prevDisabled) onChange(page - 1);
          }}
        >
          {prevIcon && (
            <span className="sds-pagination__icon" aria-hidden="true">
              {prevIcon}
            </span>
          )}
        </button>

        <ul className="sds-pagination__list">
          {entries.map((entry, index) => {
            if (entry === 'ellipsis-previous' || entry === 'ellipsis-next') {
              const modifier = entry === 'ellipsis-previous' ? 'previous' : 'next';
              return (
                <li key={`${entry}-${index}`} className="sds-pagination__item">
                  {/* Figma Ellipsis: dots at rest; on hover a 12px angle pointing
                      previous/next (visual only — no jump behaviour). */}
                  <span
                    className={`sds-pagination__ellipsis sds-pagination__ellipsis--${modifier}`}
                    aria-hidden="true"
                  >
                    <span className="sds-pagination__ellipsis-dots">&#8230;</span>
                    <span className="sds-pagination__ellipsis-arrow" />
                  </span>
                </li>
              );
            }

            const isCurrent = entry === page;
            return (
              <li key={entry} className="sds-pagination__item">
                <button
                  type="button"
                  className={[
                    'sds-pagination__number',
                    isCurrent && 'sds-pagination__number--selected',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  aria-label={itemAriaLabel(entry)}
                  aria-current={isCurrent ? 'page' : undefined}
                  disabled={disabled}
                  onClick={() => onChange(entry)}
                >
                  {entry}
                </button>
              </li>
            );
          })}
        </ul>

        <button
          type="button"
          className="sds-pagination__nav sds-pagination__nav--next"
          aria-label={nextLabel}
          disabled={nextDisabled}
          aria-disabled={nextDisabled || undefined}
          onClick={() => {
            if (!nextDisabled) onChange(page + 1);
          }}
        >
          {nextIcon && (
            <span className="sds-pagination__icon" aria-hidden="true">
              {nextIcon}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
});
