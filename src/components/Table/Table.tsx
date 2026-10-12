import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Checkbox } from '../Checkbox';
import './Table.css';

export type SortDirection = 'ascending' | 'descending';

export interface TableColumn<Row = TableRow> {
  /** Stable key; also used to read the cell value from a row when `render` is absent. */
  key: string;
  /** Header label (Figma "Header text", Paragraph - Regular; Semi Bold on the sorted column). */
  header: ReactNode;
  /** Whether this column can be sorted. Shows the Figma `sort` icon (16px) after the label. */
  sortable?: boolean;
  /**
   * Disables the column: its header uses the Figma "Table header row" `State=Disabled` and its
   * cells the "Table cell" `State=Disabled` (Disabled/background, Disabled/stroke,
   * Disabled/text, Disabled/icon); sorting is blocked.
   */
  disabled?: boolean;
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
  /** Key of the currently sorted column (rendered in the Figma header `State=Selected`). */
  sortKey?: string;
  /** Active sort direction for `sortKey`. */
  sortDirection?: SortDirection;
  /** Called when a sortable header is activated. */
  onSort?: (key: string) => void;
  /**
   * Enables row selection with the system Checkbox (Figma "Checkbox" option of the header
   * cell and cell), placed before the first column's content.
   */
  selectable?: boolean;
  /** Ids of selected rows (controlled). Selected rows use the Figma cell `State=Selected`. */
  selectedIds?: Array<string | number>;
  /** Ids of disabled rows: Figma cell `State=Disabled`, selection blocked. */
  disabledIds?: Array<string | number>;
  /** Disables the whole table (every header and cell in the Figma `State=Disabled`). */
  disabled?: boolean;
  /** Called when a row's selection is toggled. */
  onSelectRow?: (id: string | number, selected: boolean) => void;
  /**
   * Called when the header "select all" checkbox is toggled. The header box is only checked
   * (every selectable row selected) or unchecked — no partial state, per the Figma Checkbox.
   */
  onSelectAll?: (selected: boolean) => void;
  /** Accessible name for the table, rendered as a visually hidden `<caption>` (no visible caption in Figma). */
  caption?: ReactNode;
}

/*
 * Font Awesome Pro 7.1.0 by @fontawesome - https://fontawesome.com
 * License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc.
 * Duotone Regular `sort`, `sort-up`, `sort-down` (src/icons/duotone-regular), viewBox 0 0 640 640.
 */
const SORT_PATHS: Record<'none' | SortDirection, [string, string]> = {
  none: [
    'M198.6 240L441.4 240L320 118.6C279.5 159.1 239.1 199.5 198.6 240zM198.6 400L319.9 521.3C360.5 480.9 400.9 440.4 441.3 400L198.6 400z',
    'M320 118.6L198.6 240L441.4 240L320 118.6zM160 288C147.1 288 135.4 280.2 130.4 268.2C125.4 256.2 128.2 242.5 137.4 233.4L297.4 73.4C309.9 60.9 330.2 60.9 342.7 73.4L502.7 233.4C511.9 242.6 514.6 256.3 509.6 268.3C504.6 280.3 492.9 288 480 288L160 288zM320 521.4L441.4 400L198.6 400L320 521.4zM160 352L480 352C492.9 352 504.6 359.8 509.6 371.8C514.6 383.8 511.8 397.5 502.7 406.7L342.7 566.7C330.2 579.2 309.9 579.2 297.4 566.7L137.4 406.7C128.2 397.5 125.5 383.8 130.5 371.8C135.5 359.8 147.1 352 160 352z',
  ],
  ascending: [
    'M198.6 240L318.3 120.3C319.3 120.1 320.3 120 321.3 120L441.3 240L198.6 240z',
    'M198.6 240L320 118.6L441.4 240L198.6 240zM130.4 268.2C135.4 280.2 147 288 160 288L480 288C492.9 288 504.6 280.2 509.6 268.2C514.6 256.2 511.8 242.5 502.7 233.3L342.7 73.3C330.2 60.8 309.9 60.8 297.4 73.3L137.4 233.3C128.2 242.5 125.5 256.2 130.5 268.2z',
  ],
  descending: [
    'M198.6 400L441.3 400C400.9 440.4 360.4 480.9 319.9 521.3L198.6 400z',
    'M198.6 400L320 521.4L441.4 400L198.6 400zM130.4 371.8C135.4 359.8 147 352 160 352L480 352C492.9 352 504.6 359.8 509.6 371.8C514.6 383.8 511.8 397.5 502.7 406.7L342.7 566.7C330.2 579.2 309.9 579.2 297.4 566.7L137.4 406.7C128.2 397.5 125.5 383.8 130.5 371.8z',
  ],
};

function SortIcon({ direction }: { direction: 'none' | SortDirection }) {
  const [secondary, primary] = SORT_PATHS[direction];
  return (
    <svg className="sds-table__sort-svg" viewBox="0 0 640 640" focusable="false" aria-hidden="true">
      <path opacity=".4" fill="currentColor" d={secondary} />
      <path fill="currentColor" d={primary} />
    </svg>
  );
}

/**
 * Table — semantic data grid with sortable headers and optional row selection.
 * Figma page Table: "Table header row" (382:1963) and "Table cell" (382:1979).
 *
 * - Header cell: height 44, padding 8/16/8/8, gap 4, 1px bottom stroke; Paragraph - Regular
 *   (Semi Bold when selected/sorted); optional Checkbox, label, `sort` icon (16px).
 *   States: Default, Hover, Selected (sorted column), Disabled.
 * - Body cell: height 52, padding 12/16/12/8, gap 8, 1px bottom stroke; Paragraph - Regular
 *   (Semi Bold in Table/Cell/selected-text when the row is selected).
 *   States: Default, Hover, Selected, Disabled.
 * Tokens Table/Header/*, Table/Cell/*, Disabled/*. Selection uses the system Checkbox.
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
    disabledIds = [],
    disabled = false,
    onSelectRow,
    onSelectAll,
    caption,
    className,
    ...rest
  },
  ref,
) {
  const selectedSet = new Set(selectedIds);
  const disabledSet = new Set(disabledIds);
  const selectableRows = rows.filter((r) => !disabled && !disabledSet.has(r.id));
  // Figma Checkbox has only Checked True/False: the header box is checked only when every
  // selectable row is selected, otherwise unchecked (no partial state).
  const allSelected =
    selectableRows.length > 0 && selectableRows.every((r) => selectedSet.has(r.id));

  const classes = ['sds-table', disabled && 'sds-table--disabled', className]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="sds-table__container">
      <table ref={ref} className={classes} {...rest}>
        {caption && <caption className="sds-table__caption">{caption}</caption>}
        <thead className="sds-table__head">
          <tr>
            {columns.map((col, colIndex) => {
              const isSorted = sortKey === col.key;
              const colDisabled = disabled || Boolean(col.disabled);
              const ariaSort = col.sortable
                ? isSorted
                  ? sortDirection ?? 'ascending'
                  : 'none'
                : undefined;
              const headerClasses = [
                'sds-table__header',
                col.sortable && 'sds-table__header--sortable',
                isSorted && 'sds-table__header--active',
                colDisabled && 'sds-table__header--disabled',
              ]
                .filter(Boolean)
                .join(' ');
              const direction = isSorted ? sortDirection ?? 'ascending' : 'none';

              return (
                <th
                  key={col.key}
                  scope="col"
                  className={headerClasses}
                  aria-sort={ariaSort}
                  aria-disabled={colDisabled || undefined}
                >
                  <div className="sds-table__header-content">
                    {selectable && colIndex === 0 && (
                      <Checkbox
                        className="sds-table__checkbox"
                        label="Select all rows"
                        checked={allSelected}
                        disabled={disabled || selectableRows.length === 0}
                        onChange={(e) => onSelectAll?.(e.target.checked)}
                      />
                    )}
                    {col.sortable ? (
                      <button
                        type="button"
                        className="sds-table__sort-button"
                        disabled={colDisabled}
                        onClick={() => onSort?.(col.key)}
                      >
                        <span className="sds-table__header-label">{col.header}</span>
                        <span className="sds-table__sort-icon" aria-hidden="true">
                          <SortIcon direction={direction} />
                        </span>
                      </button>
                    ) : (
                      <span className="sds-table__header-label">{col.header}</span>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="sds-table__body">
          {rows.map((row) => {
            const isSelected = selectedSet.has(row.id);
            const rowDisabled = disabled || disabledSet.has(row.id);
            const rowClasses = [
              'sds-table__row',
              isSelected && 'sds-table__row--selected',
              rowDisabled && 'sds-table__row--disabled',
            ]
              .filter(Boolean)
              .join(' ');

            return (
              <tr
                key={row.id}
                className={rowClasses}
                aria-selected={selectable ? isSelected : undefined}
                aria-disabled={rowDisabled || undefined}
              >
                {columns.map((col, colIndex) => {
                  const cellDisabled = rowDisabled || Boolean(col.disabled);
                  const cellClasses = [
                    'sds-table__cell',
                    cellDisabled && 'sds-table__cell--disabled',
                  ]
                    .filter(Boolean)
                    .join(' ');
                  const value = col.render ? col.render(row) : (row[col.key] as ReactNode);

                  return (
                    <td key={col.key} className={cellClasses}>
                      {selectable && colIndex === 0 ? (
                        <div className="sds-table__cell-content">
                          <Checkbox
                            className="sds-table__checkbox"
                            label={`Select row ${row.id}`}
                            checked={isSelected}
                            disabled={rowDisabled}
                            onChange={(e) => onSelectRow?.(row.id, e.target.checked)}
                          />
                          {value}
                        </div>
                      ) : (
                        value
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
});
