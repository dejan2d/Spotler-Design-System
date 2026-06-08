import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Folders.css';

export interface FolderItem {
  /** Stable value used for selection and onSelect. */
  value: string;
  /** Visible label. */
  label: ReactNode;
  /** Leading icon (20px duotone). Defaults to a file glyph. */
  icon?: ReactNode;
  /** Disables the item (non-interactive; hides actions). */
  disabled?: boolean;
}

export interface FoldersProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Header title (H4). */
  title: ReactNode;
  /** Folder items, rendered in a scrollable list. */
  items: FolderItem[];
  /** Value of the currently selected item. */
  value?: string;
  /** Fired with the selected item value. */
  onSelect?: (value: string) => void;
  /** Fired when the per-item actions (ellipsis) control is clicked. */
  onItemActions?: (value: string) => void;
  /** Fired when the header "add" (plus) action is clicked. */
  onAdd?: () => void;
  /** Fired when the header "sort" action is clicked. */
  onSort?: () => void;
  /**
   * When set, renders an inline-edit ("new") row at the bottom of the list.
   * Confirmed via the confirm button, which calls onConfirmNew with the typed name.
   */
  newItem?: boolean;
  /** Fired with the entered name when the inline "new" row is confirmed. */
  onConfirmNew?: (name: string) => void;
}

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
 * Folders — a sidebar folder menu: header + scrollable list of folder items.
 * Spec: references/components/folders.md.
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
    onConfirmNew,
    className,
    ...rest
  },
  ref,
) {
  const [draft, setDraft] = useState('');
  const classes = ['sds-folders', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...rest}>
      <div className="sds-folders__header">
        <span className="sds-folders__title">{title}</span>
        <div className="sds-folders__header-actions">
          <button
            type="button"
            className="sds-folders__header-action"
            aria-label="Add folder"
            onClick={onAdd}
          >
            +
          </button>
          <button
            type="button"
            className="sds-folders__header-action"
            aria-label="Sort folders"
            onClick={onSort}
          >
            ⇅
          </button>
        </div>
      </div>
      <span className="sds-folders__divider" aria-hidden="true" />

      <ul className="sds-folders__list">
        {items.map((item) => {
          const selected = item.value === value;
          return (
            <li key={item.value}>
              <div
                className={[
                  'sds-folders__item',
                  selected && 'sds-folders__item--selected',
                  item.disabled && 'sds-folders__item--disabled',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <button
                  type="button"
                  className="sds-folders__item-button"
                  aria-current={selected ? 'true' : undefined}
                  disabled={item.disabled}
                  onClick={() => !item.disabled && onSelect?.(item.value)}
                >
                  <span className="sds-folders__item-icon" aria-hidden="true">
                    {item.icon ?? FileIcon}
                  </span>
                  <span className="sds-folders__item-label">{item.label}</span>
                </button>
                {!item.disabled && (
                  <button
                    type="button"
                    className="sds-folders__item-actions"
                    aria-label="Item actions"
                    onClick={() => onItemActions?.(item.value)}
                  >
                    ⋮
                  </button>
                )}
              </div>
            </li>
          );
        })}

        {newItem && (
          <li>
            <div className="sds-folders__item sds-folders__item--new">
              <input
                className="sds-folders__new-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                aria-label="New folder name"
                autoFocus
              />
              <button
                type="button"
                className="sds-folders__new-confirm"
                aria-label="Confirm new folder"
                onClick={() => {
                  onConfirmNew?.(draft);
                  setDraft('');
                }}
              >
                ✓
              </button>
            </div>
          </li>
        )}
      </ul>
    </div>
  );
});
