import { forwardRef, useEffect, useRef, useState } from 'react';
import type {
  ChangeEvent,
  HTMLAttributes,
  KeyboardEvent,
  ReactNode,
} from 'react';
import './Folders.css';

/**
 * A single row in the Folders list.
 *
 * Anatomy (left → right): leading checkbox (multi-select), leading icon
 * (`fa-file-lines` 20×20), label, trailing ellipsis (`fa-ellipsis-vertical`,
 * shown on hover), trailing checkbox (multi-select).
 */
export interface FolderItem {
  /** Stable value used for selection, multi-select and callbacks. */
  value: string;
  /** Visible label. Item label (default) is 14/20 Regular; selected is 14/20 SemiBold. */
  label: ReactNode;
  /**
   * Leading icon slot (20×20 duotone, e.g. FontAwesome `fa-file-lines`).
   * Falls back to the component's `itemIcon` and then a built-in file glyph.
   */
  icon?: ReactNode;
  /** Disables the row: non-interactive, hides ellipsis and checkboxes. */
  disabled?: boolean;
}

export interface FoldersProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Header title, rendered as an H4 (17/28 SemiBold). */
  title: ReactNode;
  /** Folder items, rendered in a scrollable list beneath the header divider. */
  items: FolderItem[];
  /** Value of the currently selected (active) item. */
  value?: string;
  /** Fired with the item value when a (non-disabled) row is activated. */
  onSelect?: (value: string) => void;
  /** Fired with the item value when its ellipsis (per-item actions) control is clicked. */
  onItemActions?: (value: string) => void;
  /** Fired when the header "add" (`fa-plus-large`) action is clicked. */
  onAdd?: () => void;
  /** Fired when the header "sort" (`fa-sort`) action is clicked. */
  onSort?: () => void;
  /**
   * When `true`, renders an inline-edit ("new") row at the bottom of the list:
   * a text input bordered with the conceptual color plus a circular confirm button.
   */
  newItem?: boolean;
  /** Initial value for the inline "new" row's text input. @default '' */
  newItemDefaultValue?: string;
  /** Fired with the entered name when the inline "new" row is confirmed. */
  onConfirmNew?: (name: string) => void;
  /**
   * Enables multi-select. Leading + trailing checkboxes become visible for
   * non-disabled rows; `selectedValues` controls which are checked.
   * @default false
   */
  multiSelect?: boolean;
  /** Checked values when `multiSelect` is on. */
  selectedValues?: string[];
  /** Fired with the next set of checked values when a checkbox is toggled. */
  onSelectedValuesChange?: (values: string[]) => void;
  /**
   * Default leading icon for every item (overridable per `FolderItem.icon`).
   * Use a 20×20 FontAwesome Duotone node; defaults to a built-in file glyph.
   */
  itemIcon?: ReactNode;
  /** Header "add" icon slot (20×20, e.g. `fa-plus-large`). */
  addIcon?: ReactNode;
  /** Header "sort" icon slot (20×20, e.g. `fa-sort`). */
  sortIcon?: ReactNode;
  /** Per-item actions icon slot (20×20, e.g. `fa-ellipsis-vertical`). */
  actionsIcon?: ReactNode;
  /** Confirm icon slot for the inline "new" row (e.g. `fa-circle-check`). */
  confirmIcon?: ReactNode;
  /** Accessible label for the header "add" action. @default 'Add folder' */
  addLabel?: string;
  /** Accessible label for the header "sort" action. @default 'Sort folders' */
  sortLabel?: string;
  /** Accessible label for the per-item actions control. @default 'Item actions' */
  actionsLabel?: string;
}

/** Built-in fallback leading icon (`fa-file-lines` analogue, 20×20). */
const FileIcon = (
  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true">
    <path
      d="M5 2.5h6L15 6v11.5H5V2.5z"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
    />
    <path d="M11 2.5V6h4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
  </svg>
);

/**
 * Folders — Spotler Design System.
 *
 * A sidebar panel for organising and navigating file items: a Folder Menu
 * container (header + divider) above a scrollable list of Folder Items.
 *
 * Container: padding 8px, item gap 4px, radius 4px, optional 1px hairline border.
 * Header: height 44px, padding 8px 12px, H4 title (17/28 SemiBold) + add/sort icons.
 * Item: min-height 36px, padding 8px, radius 4px, 20×20 leading icon, 14/20 label.
 * States: default, hover (ellipsis revealed), selected (SemiBold + tinted),
 * new (inline edit), disabled. Optional multi-select checkboxes.
 */
export const Folders = forwardRef<HTMLDivElement, FoldersProps>(function Folders(
  {
    title,
    items,
    value,
    onSelect,
    onItemActions,
    onAdd,
    onSort,
    newItem = false,
    newItemDefaultValue = '',
    onConfirmNew,
    multiSelect = false,
    selectedValues,
    onSelectedValuesChange,
    itemIcon,
    addIcon,
    sortIcon,
    actionsIcon,
    confirmIcon,
    addLabel = 'Add folder',
    sortLabel = 'Sort folders',
    actionsLabel = 'Item actions',
    className,
    ...rest
  },
  ref,
) {
  const [draft, setDraft] = useState(newItemDefaultValue);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset and focus the inline-edit row each time it is opened.
  useEffect(() => {
    if (newItem) {
      setDraft(newItemDefaultValue);
      inputRef.current?.focus();
    }
  }, [newItem, newItemDefaultValue]);

  const classes = ['sds-folders', className].filter(Boolean).join(' ');
  const checked = selectedValues ?? [];

  const toggleChecked = (itemValue: string) => {
    const next = checked.includes(itemValue)
      ? checked.filter((v) => v !== itemValue)
      : [...checked, itemValue];
    onSelectedValuesChange?.(next);
  };

  const confirmNew = () => {
    onConfirmNew?.(draft);
    setDraft('');
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      confirmNew();
    }
  };

  return (
    <div ref={ref} className={classes} {...rest}>
      <div className="sds-folders__header">
        <h4 className="sds-folders__title">{title}</h4>
        <div className="sds-folders__header-actions">
          <button
            type="button"
            className="sds-folders__header-action"
            aria-label={addLabel}
            onClick={onAdd}
          >
            <span className="sds-folders__icon" aria-hidden="true">
              {addIcon}
            </span>
          </button>
          <button
            type="button"
            className="sds-folders__header-action"
            aria-label={sortLabel}
            onClick={onSort}
          >
            <span className="sds-folders__icon" aria-hidden="true">
              {sortIcon}
            </span>
          </button>
        </div>
      </div>

      <span className="sds-folders__divider" aria-hidden="true" />

      <ul className="sds-folders__list">
        {items.map((item) => {
          const selected = item.value === value;
          const isChecked = checked.includes(item.value);
          const itemClasses = [
            'sds-folders__item',
            selected && 'sds-folders__item--selected',
            item.disabled && 'sds-folders__item--disabled',
            multiSelect && 'sds-folders__item--multiselect',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <li key={item.value} className="sds-folders__list-item">
              <div className={itemClasses}>
                {multiSelect && !item.disabled && (
                  <input
                    type="checkbox"
                    className="sds-folders__checkbox sds-folders__checkbox--lead"
                    checked={isChecked}
                    onChange={() => toggleChecked(item.value)}
                    aria-label={`Select ${typeof item.label === 'string' ? item.label : item.value}`}
                  />
                )}
                <button
                  type="button"
                  className="sds-folders__item-button"
                  aria-current={selected ? 'true' : undefined}
                  aria-disabled={item.disabled || undefined}
                  disabled={item.disabled}
                  onClick={() => !item.disabled && onSelect?.(item.value)}
                >
                  <span className="sds-folders__item-icon" aria-hidden="true">
                    {item.icon ?? itemIcon ?? FileIcon}
                  </span>
                  <span className="sds-folders__item-label">{item.label}</span>
                </button>
                {!item.disabled && (
                  <button
                    type="button"
                    className="sds-folders__item-actions"
                    aria-label={actionsLabel}
                    onClick={() => onItemActions?.(item.value)}
                  >
                    <span className="sds-folders__icon" aria-hidden="true">
                      {actionsIcon}
                    </span>
                  </button>
                )}
                {multiSelect && !item.disabled && (
                  <input
                    type="checkbox"
                    className="sds-folders__checkbox sds-folders__checkbox--trail"
                    checked={isChecked}
                    onChange={() => toggleChecked(item.value)}
                    aria-label={`Select ${typeof item.label === 'string' ? item.label : item.value}`}
                  />
                )}
              </div>
            </li>
          );
        })}

        {newItem && (
          <li className="sds-folders__list-item">
            <div className="sds-folders__item sds-folders__item--new">
              <input
                ref={inputRef}
                className="sds-folders__new-input"
                value={draft}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setDraft(event.target.value)}
                onKeyDown={handleInputKeyDown}
                aria-label="New folder name"
              />
              <button
                type="button"
                className="sds-folders__new-confirm"
                aria-label="Confirm new folder"
                onClick={confirmNew}
              >
                <span className="sds-folders__icon" aria-hidden="true">
                  {confirmIcon}
                </span>
              </button>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
});
