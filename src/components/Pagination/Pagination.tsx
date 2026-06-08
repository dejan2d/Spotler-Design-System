import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Pagination.css';

export interface PaginationProps extends Omit<HTMLAttributes<HTMLElement>, 'onChange'> {
  /** Current page (1-based). Marked aria-current="page". */
  page: number;
  /** Total number of pages. */
  pageCount: number;
  /** Fired with the requested page number. */
  onChange: (page: number) => void;
  /** Number of page buttons to show around the current page before collapsing to an ellipsis. */
  siblingCount?: number;
  /** Optional page-size changer. When provided, renders a small dropdown. */
  pageSize?: number;
  /** Available page sizes for the size changer. */
  pageSizeOptions?: number[];
  /** Fired when the page size changes. */
  onPageSizeChange?: (size: number) => void;
  /** Leading (previous) icon node. */
  prevIcon?: ReactNode;
  /** Trailing (next) icon node. */
  nextIcon?: ReactNode;
}

type PageEntry = number | 'ellipsis-prev' | 'ellipsis-next';

function buildRange(page: number, pageCount: number, siblingCount: number): PageEntry[] {
  const totalNumbers = siblingCount * 2 + 5; // first, last, current, 2 ellipses
  if (pageCount <= totalNumbers) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const left = Math.max(page - siblingCount, 2);
  const right = Math.min(page + siblingCount, pageCount - 1);
  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < pageCount - 1;

  const entries: PageEntry[] = [1];
  if (showLeftEllipsis) entries.push('ellipsis-prev');
  for (let i = left; i <= right; i++) entries.push(i);
  if (showRightEllipsis) entries.push('ellipsis-next');
  entries.push(pageCount);
  return entries;
}

/**
 * Pagination — controls for moving through paged data.
 * Spec: references/components/pagination.md.
 * Token names preserve the Figma typos: `nagivation` and `elipsis`.
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
    prevIcon = '‹',
    nextIcon = '›',
    className,
    ...rest
  },
  ref,
) {
  const classes = ['sds-pagination', className].filter(Boolean).join(' ');
  const entries = buildRange(page, pageCount, siblingCount);
  const atStart = page <= 1;
  const atEnd = page >= pageCount;

  return (
    <nav ref={ref} className={classes} aria-label="Pagination" {...rest}>
      <button
        type="button"
        className="sds-pagination__nav"
        aria-label="Go to previous page"
        disabled={atStart}
        onClick={() => !atStart && onChange(page - 1)}
      >
        <span className="sds-pagination__icon" aria-hidden="true">
          {prevIcon}
        </span>
      </button>

      <ul className="sds-pagination__list">
        {entries.map((entry, index) => {
          if (entry === 'ellipsis-prev' || entry === 'ellipsis-next') {
            return (
              <li key={`${entry}-${index}`} aria-hidden="true">
                <span className={`sds-pagination__ellipsis sds-pagination__ellipsis--${entry === 'ellipsis-prev' ? 'previous' : 'next'}`}>
                  &#8230;
                </span>
              </li>
            );
          }
          const isCurrent = entry === page;
          return (
            <li key={entry}>
              <button
                type="button"
                className={[
                  'sds-pagination__number',
                  isCurrent && 'sds-pagination__number--selected',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-label={`Go to page ${entry}`}
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
        className="sds-pagination__nav"
        aria-label="Go to next page"
        disabled={atEnd}
        onClick={() => !atEnd && onChange(page + 1)}
      >
        <span className="sds-pagination__icon" aria-hidden="true">
          {nextIcon}
        </span>
      </button>

      {pageSize !== undefined && onPageSizeChange && (
        <label className="sds-pagination__size-changer">
          <select
            className="sds-pagination__size-select"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            aria-label="Items per page"
          >
            {pageSizeOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt} / page
              </option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
});
