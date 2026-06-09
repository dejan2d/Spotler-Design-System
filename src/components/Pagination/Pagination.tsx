import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Pagination.css';

/** A rendered entry in the page list: a real page number or one of the two overflow ellipses. */
export type PaginationEntry = number | 'ellipsis-previous' | 'ellipsis-next';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page (1-based). The matching number button is marked `aria-current="page"`. */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Fired with the requested 1-based page number when a page or arrow is activated. */
  onChange: (page: number) => void;
  /**
   * How many page buttons to show on each side of the current page before
   * collapsing the gap into an ellipsis.
   * @default 1
   */
  siblingCount?: number;
  /** Current page size. When provided together with `onPageSizeChange`, renders the size changer. */
  pageSize?: number;
  /**
   * Selectable page sizes for the size changer.
   * @default [10, 25, 50, 100]
   */
  pageSizeOptions?: number[];
  /** Fired with the chosen page size when the size changer value changes. */
  onPageSizeChange?: (size: number) => void;
  /** Leading (previous) navigation icon. Use a FontAwesome Duotone icon node (20px). */
  prevIcon?: ReactNode;
  /** Trailing (next) navigation icon. Use a FontAwesome Duotone icon node (20px). */
  nextIcon?: ReactNode;
  /** Trailing chevron icon for the size changer. Use a FontAwesome Duotone icon node. */
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
   * Renders the visible/accessible label of a number button. Override to localise.
   * @default (page) => `Go to page ${page}`
   */
  itemAriaLabel?: (page: number) => string;
  /**
   * Renders the visible text of a size-changer option.
   * @default (size) => `${size} / page`
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
 * navigation arrows, overflow ellipses, and an optional page-size changer.
 *
 * Sizing: 36px circular number/navigation controls, 20px icons, 4px gaps.
 * Parts: Number, Navigation Item (prev/next), Ellipsis, Size Changer.
 * States per part: default, hover, selected; navigation also has disabled (at bounds).
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
    siblingCount = 1,
    pageSize,
    pageSizeOptions = [10, 25, 50, 100],
    onPageSizeChange,
    prevIcon,
    nextIcon,
    sizeChangerIcon,
    prevLabel = 'Go to previous page',
    nextLabel = 'Go to next page',
    sizeChangerLabel = 'Items per page',
    itemAriaLabel = (n: number) => `Go to page ${n}`,
    formatPageSizeOption = (size: number) => `${size} / page`,
    className,
    ...rest
  },
  ref,
) {
  const classes = ['sds-pagination', className].filter(Boolean).join(' ');
  const entries = buildRange(page, pageCount, siblingCount);
  const atStart = page <= 1;
  const atEnd = page >= pageCount;
  const showSizeChanger = pageSize !== undefined && onPageSizeChange !== undefined;

  return (
    <nav ref={ref} className={classes} aria-label="Pagination" {...rest}>
      <button
        type="button"
        className="sds-pagination__nav sds-pagination__nav--previous"
        aria-label={prevLabel}
        disabled={atStart}
        aria-disabled={atStart || undefined}
        onClick={() => {
          if (!atStart) onChange(page - 1);
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
                <span
                  className={`sds-pagination__ellipsis sds-pagination__ellipsis--${modifier}`}
                  aria-hidden="true"
                >
                  &#8230;
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
        disabled={atEnd}
        aria-disabled={atEnd || undefined}
        onClick={() => {
          if (!atEnd) onChange(page + 1);
        }}
      >
        {nextIcon && (
          <span className="sds-pagination__icon" aria-hidden="true">
            {nextIcon}
          </span>
        )}
      </button>

      {showSizeChanger && (
        <div className="sds-pagination__size-changer">
          <select
            className="sds-pagination__size-select"
            value={pageSize}
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
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
      )}
    </nav>
  );
});
