import { forwardRef, useId } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Table.css';

export type SortDirection = 'ascending' | 'descending';

export interface TableColumn<Row = TableRow> {
  /** Stable key; also used to read the cell value from a row when `render` is absent. */
  key: string;
  /** Header label. */
  header: ReactNode;
  /** Whether this column can be sorted. */
  sortable?: boolean;
  /** Custom cell renderer. Falls back to `row[key]`. */
  render?: (row: Row) => ReactNode;
}

export interface TableRow {
  /** Stable row identifier — used for keys and selection. */
  id: string | number;
  [key: string]: unknown;
}

export interface TableProps extends Omit<HTMLAttributes<HTMLTableElement>, 'onSelect'> {
  /** Column definitions, left to right. */
  columns: TableColumn[];
  /** Row data. Each row needs a unique `id`. */
  rows: TableRow[];
  /** Key of the currently sorted column. */
  sortKey?: string;
  /** Active sort direction for `sortKey`. */
  sortDirection?: SortDirection;
  /** Called when a sortable header is activated. */
  onSort?: (key: string) => void;
  /** Enables the leading selection checkbox column. */
  selectable?: boolean;
  /** Ids of selected rows (controlled). */
  selectedIds?: Array<string | number>;
  /** Called when a row's selection is toggled. */
  onSelectRow?: (id: string | number, selected: boolean) => void;
  /** Called when the header "select all" checkbox is toggled. */
  onSelectAll?: (selected: boolean) => void;
  /** Accessible caption for the table. */
  caption?: ReactNode;
}

/**
 * Table — semantic data grid with sortable headers and optional row selection.
 * Spec: references/components/table.md. Tokens Table/cell-* and Table/header-*.
 */
export const Table = forwardRef<HTMLTableElement, TableProps>(function Table(
  {
    columns,
    rows,
    sortKey,
    sortDirection,
    onSort,
    selectable = false,
    selectedIds = [],
    onSelectRow,
    onSelectAll,
    caption,
    className,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const selectedSet = new Set(selectedIds);
  const allSelected = rows.length > 0 && rows.every((r) => selectedSet.has(r.id));
  const someSelected = rows.some((r) => selectedSet.has(r.id)) && !allSelected;

  const classes = ['sds-table', className].filter(Boolean).join(' ');

  return (
    <div className="sds-table__container">
      <table ref={ref} className={classes} {...rest}>
        {caption && <caption className="sds-table__caption">{caption}</caption>}
        <thead className="sds-table__head">
          <tr>
            {selectable && (
              <th scope="col" className="sds-table__header sds-table__header--select">
                <input
                  type="checkbox"
                  className="sds-table__checkbox"
                  aria-label="Select all rows"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = someSelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                />
              </th>
            )}
            {columns.map((col) => {
              const isSorted = sortKey === col.key;
              const ariaSort = col.sortable
                ? isSorted
                  ? sortDirection ?? 'ascending'
                  : 'none'
                : undefined;
              const headerClasses = [
                'sds-table__header',
                col.sortable && 'sds-table__header--sortable',
                isSorted && 'sds-table__header--active',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <th
                  key={col.key}
                  scope="col"
                  className={headerClasses}
                  aria-sort={ariaSort}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      className="sds-table__sort-button"
                      onClick={() => onSort?.(col.key)}
                    >
                      <span className="sds-table__header-label">{col.header}</span>
                      <span className="sds-table__sort-icon" aria-hidden="true">
                        {isSorted ? (sortDirection === 'descending' ? '▼' : '▲') : '↕'}
                      </span>
                    </button>
                  ) : (
                    <span className="sds-table__header-label">{col.header}</span>
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="sds-table__body">
          {rows.map((row) => {
            const isSelected = selectedSet.has(row.id);
            const rowClasses = [
              'sds-table__row',
              isSelected && 'sds-table__row--selected',
            ]
              .filter(Boolean)
              .join(' ');
            const checkboxId = `${reactId}-row-${row.id}`;

            return (
              <tr key={row.id} className={rowClasses} aria-selected={selectable ? isSelected : undefined}>
                {selectable && (
                  <td className="sds-table__cell sds-table__cell--select">
                    <input
                      id={checkboxId}
                      type="checkbox"
                      className="sds-table__checkbox"
                      aria-label={`Select row ${row.id}`}
                      checked={isSelected}
                      onChange={(e) => onSelectRow?.(row.id, e.target.checked)}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className="sds-table__cell">
                    {col.render ? col.render(row) : (row[col.key] as ReactNode)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
