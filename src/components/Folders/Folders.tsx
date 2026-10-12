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
 * Anatomy (left → right, Figma Folder item 849:8070): leading icon
 * (`fa-file-lines` 20×20), label, trailing ellipsis (`fa-ellipsis-vertical`,
 * shown on hover).
 */
export interface FolderItem {
  /** Stable value used for selection, multi-select and callbacks. */
  value: string;
  /** Visible label. Paragraph - Regular; the selected item is Paragraph - Semi Bold. */
  label: ReactNode;
  /**
   * Leading icon slot (20×20 duotone, e.g. FontAwesome `fa-file-lines`).
   * Falls back to the component's `itemIcon` and then a built-in file glyph.
   */
  icon?: ReactNode;
  /** Disables the row: non-interactive, hides the ellipsis. */
  disabled?: boolean;
}

export interface FoldersProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Header title, rendered as an H4 (Text Styles/Title Headings/H4). */
  title: ReactNode;
  /**
   * Optional supportive text under the title (Figma Folder header "Supportive text",
   * hidden by default there). Paragraph - Small.
   */
  supportiveText?: ReactNode;
  /**
   * Shows the Divider/horizontal line under the header (Figma Folder header "Show divider").
   * @default true
   */
  showDivider?: boolean;
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
   * a text input with a 1px Folders/item-new-stroke outline plus a 36×36 circular
   * confirm button (icon in Folders/item-new-icon).
   */
  newItem?: boolean;
  /** Initial value for the inline "new" row's text input. @default '' */
  newItemDefaultValue?: string;
  /** Fired with the entered name when the inline "new" row is confirmed. */
  onConfirmNew?: (name: string) => void;
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
 * Figma (Folder menu 849:8105, Folder header 968:39833, Folder item 849:8070):
 * Container: 304px, padding 8px, 4px gap, radius 4px, 1px Folders/frame-stroke outside.
 * Header: 40px, padding 8px, 12px gap, H4 title (+ optional supportive text,
 * Paragraph - Small) + add (`plus-large`) / sort icons, Divider/horizontal underneath
 * (`showDivider`, default true).
 * Items: stacked with no gap, 36px, padding 8px, radius 4px, 20×20 leading icon,
 * Paragraph - Regular label.
 * States: default, hover (ellipsis revealed), selected (Semi Bold + tinted),
 * new (inline edit: 36px input, 1px outside stroke, 36×36 confirm button with
 * Folders/item-new-icon), disabled.
 */
export const Folders = forwardRef<HTMLDivElement, FoldersProps>(function Folders(
  {
    title,
    supportiveText,
    showDivider = true,
    items,
    value,
    onSelect,
    onItemActions,
    onAdd,
    onSort,
    newItem = false,
    newItemDefaultValue = '',
    onConfirmNew,
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
        <div className="sds-folders__header-content">
          <h4 className="sds-folders__title">{title}</h4>
          {supportiveText && (
            <p className="sds-folders__supportive-text">{supportiveText}</p>
          )}
        </div>
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

      {showDivider && <span className="sds-folders__divider" aria-hidden="true" />}

      <ul className="sds-folders__list">
        {items.map((item) => {
          const selected = item.value === value;
          const itemClasses = [
            'sds-folders__item',
            selected && 'sds-folders__item--selected',
            item.disabled && 'sds-folders__item--disabled',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <li key={item.value} className="sds-folders__list-item">
              <div className={itemClasses}>
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
