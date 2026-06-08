import { forwardRef, useEffect, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './ContextMenu.css';

export interface ContextMenuItem {
  /** Visible label. */
  label: string;
  /** Stable identifier passed to onSelect. */
  value: string;
  /**
   * Item kind:
   * - `basic`   — leading icon + label (default).
   * - `specific`— label only, optional trailing checkmark for the chosen item.
   */
  kind?: 'basic' | 'specific';
  /** Leading icon (basic items only). */
  icon?: ReactNode;
  /** Selected/checked state — renders a trailing checkmark and sets aria-checked. */
  selected?: boolean;
  /** Marks the item as destructive (e.g. Delete) — rendered in the alert color. */
  destructive?: boolean;
  /** Disables the item. */
  disabled?: boolean;
}

export interface ContextMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** The action / option items, top to bottom. */
  items: ContextMenuItem[];
  /** Called with the chosen item's value. */
  onSelect: (value: string) => void;
  /** Called when the menu requests dismissal (Esc / item chosen). */
  onClose?: () => void;
  /** Accessible label for the menu. */
  'aria-label'?: string;
}

/**
 * Context Menu — a floating list of actions/options.
 * Spec: references/components/context-menu.md. role="menu"; full keyboard support;
 * focus moves into the menu on mount.
 */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { items, onSelect, onClose, className, ...rest },
  ref,
) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const enabledIndices = items
    .map((item, i) => (item.disabled ? -1 : i))
    .filter((i) => i >= 0);

  // Move focus into the menu on mount (first enabled item).
  useEffect(() => {
    const first = enabledIndices[0];
    if (first != null) itemRefs.current[first]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function focusItem(index: number) {
    itemRefs.current[index]?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent, index: number) {
    const pos = enabledIndices.indexOf(index);
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(enabledIndices[(pos + 1) % enabledIndices.length]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(enabledIndices[(pos - 1 + enabledIndices.length) % enabledIndices.length]);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(enabledIndices[0]);
        break;
      case 'End':
        event.preventDefault();
        focusItem(enabledIndices[enabledIndices.length - 1]);
        break;
      case 'Escape':
        event.preventDefault();
        onClose?.();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        choose(items[index]);
        break;
      default:
        break;
    }
  }

  function choose(item: ContextMenuItem) {
    if (item.disabled) return;
    onSelect(item.value);
    onClose?.();
  }

  const classes = ['sds-context-menu', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} role="menu" className={classes} {...rest}>
      {items.map((item, index) => {
        const kind = item.kind ?? 'basic';
        const checkable = item.kind === 'specific' || item.selected;
        return (
          <button
            key={item.value}
            ref={(node) => {
              itemRefs.current[index] = node;
            }}
            type="button"
            role={checkable ? 'menuitemradio' : 'menuitem'}
            aria-checked={checkable ? Boolean(item.selected) : undefined}
            aria-disabled={item.disabled || undefined}
            disabled={item.disabled}
            tabIndex={-1}
            className={[
              'sds-context-menu__item',
              `sds-context-menu__item--${kind}`,
              item.selected && 'sds-context-menu__item--selected',
              item.destructive && 'sds-context-menu__item--destructive',
            ]
              .filter(Boolean)
              .join(' ')}
            onClick={() => choose(item)}
            onKeyDown={(e) => onKeyDown(e, index)}
          >
            {kind === 'basic' && item.icon && (
              <span className="sds-context-menu__icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="sds-context-menu__label">{item.label}</span>
            {item.selected && (
              <span className="sds-context-menu__checkmark" aria-hidden="true">
                ✓
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
});
