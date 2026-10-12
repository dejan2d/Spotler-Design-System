import { forwardRef, useEffect, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './ContextMenu.css';

/**
 * Item kind (Figma Context item `Type`):
 * - `specific` — label only, no leading icon (Figma default).
 * - `basic`    — leading icon + label.
 *
 * Both kinds support `selected`, which renders a trailing checkmark and the
 * conceptual-blue selected background per the Spotler "Context Menu" spec.
 */
export type ContextMenuItemKind = 'basic' | 'specific';

export interface ContextMenuItem {
  /** Visible label. */
  label: string;
  /** Stable identifier passed to `onSelect`. */
  value: string;
  /**
   * Item kind. `specific` is label-only; `basic` shows a leading icon.
   * @default 'specific'
   */
  kind?: ContextMenuItemKind;
  /** Leading icon in a 20×20 slot (basic items only). FontAwesome Duotone node in real use. */
  icon?: ReactNode;
  /** Selected/checked state — Semi Bold label, tinted background, trailing checkmark; sets `aria-checked`. */
  selected?: boolean;
  /**
   * Shows the trailing checkmark on a selected item (Figma "Show check").
   * @default true
   */
  showCheck?: boolean;
  /** Disables the item — non-focusable, non-activatable, desaturated. */
  disabled?: boolean;
  /**
   * Inserts a divider above this item, visually separating it from the group
   * above. Use to group related actions/options.
   */
  dividerBefore?: boolean;
}

export interface ContextMenuProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** The action / option items, top to bottom. */
  items: ContextMenuItem[];
  /** Called with the chosen item's `value`. */
  onSelect: (value: string) => void;
  /** Called when the menu requests dismissal (Esc, or after an item is chosen). */
  onClose?: () => void;
  /**
   * Custom trailing checkmark glyph for selected items. Supply a FontAwesome
   * Duotone node (e.g. `fa-check`). When omitted, a built-in SVG checkmark is used.
   */
  checkmarkIcon?: ReactNode;
  /** Accessible label for the menu (required when there is no visible labelling element). */
  'aria-label'?: string;
}

/** Built-in fallback checkmark (20×20 slot, like Figma's `check` icon) so consumers needn't always pass an icon node. */
const DefaultCheckmark = (
  <svg viewBox="0 0 16 16" width="20" height="20" focusable="false" aria-hidden="true">
    <path
      d="M6.2 11.3 3 8.1l1.1-1.1 2.1 2.1 5-5L12.3 5.2z"
      fill="currentColor"
    />
  </svg>
);

/**
 * Context Menu — Spotler Design System.
 *
 * A floating list of actions/options triggered by right-click or a more-actions
 * affordance. Items come in two kinds: `basic` (leading icon + label) and
 * `specific` (label only); both support a `selected` state with a trailing
 * checkmark in conceptual blue. Optional `dividerBefore` groups related items.
 *
 * Figma (Context Menu 968:47065, Context item 849:8010, Context List 849:8047):
 * Frame: white, 1px Context Menu/frame-border (inside), radius 4px, 8px padding,
 * 2px between items, effect Drop Shadow/50. Group divider: 1px Monochrome/Gray - 200.
 * Items: 36px tall, radius 4px, 8px padding on all sides, 8px gap, 20×20 icon and
 * checkmark slots. Text Paragraph - Regular; selected Paragraph - Semi Bold.
 * States: rest (Default), hover, selected, disabled.
 *
 * Accessibility: `role="menu"` with `menuitem`/`menuitemradio` children; full
 * keyboard support (Arrow Up/Down, Home, End, Enter/Space, Esc); focus moves
 * into the menu on open and returns to the trigger on close; selected items
 * expose `aria-checked`.
 */
export const ContextMenu = forwardRef<HTMLDivElement, ContextMenuProps>(function ContextMenu(
  { items, onSelect, onClose, checkmarkIcon, className, ...rest },
  ref,
) {
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  // Element that had focus before the menu opened, so we can restore it on close.
  const triggerRef = useRef<Element | null>(null);

  const enabledIndices = items
    .map((item, i) => (item.disabled ? -1 : i))
    .filter((i) => i >= 0);

  // On mount: remember the trigger and move focus to the first enabled item.
  // On unmount: return focus to the trigger.
  useEffect(() => {
    triggerRef.current = document.activeElement;
    const first = enabledIndices[0];
    if (first != null) itemRefs.current[first]?.focus();
    return () => {
      const trigger = triggerRef.current;
      if (trigger instanceof HTMLElement) trigger.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function focusItem(index: number) {
    itemRefs.current[index]?.focus();
  }

  function choose(item: ContextMenuItem) {
    if (item.disabled) return;
    onSelect(item.value);
    onClose?.();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const pos = enabledIndices.indexOf(index);
    const count = enabledIndices.length;
    if (count === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusItem(enabledIndices[(pos + 1) % count]);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusItem(enabledIndices[(pos - 1 + count) % count]);
        break;
      case 'Home':
        event.preventDefault();
        focusItem(enabledIndices[0]);
        break;
      case 'End':
        event.preventDefault();
        focusItem(enabledIndices[count - 1]);
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

  const classes = ['sds-context-menu', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} role="menu" className={classes} {...rest}>
      {items.map((item, index) => {
        const kind: ContextMenuItemKind = item.kind ?? 'specific';
        // Selectable items expose radio semantics + aria-checked.
        const selectable = Boolean(item.selected);
        const itemClasses = [
          'sds-context-menu__item',
          `sds-context-menu__item--${kind}`,
          item.selected && 'sds-context-menu__item--selected',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={item.value}
            role="presentation"
            className="sds-context-menu__row"
          >
            {item.dividerBefore && index > 0 && (
              <div className="sds-context-menu__divider" role="separator" />
            )}
            <button
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role={selectable ? 'menuitemradio' : 'menuitem'}
              aria-checked={selectable ? Boolean(item.selected) : undefined}
              aria-disabled={item.disabled || undefined}
              disabled={item.disabled}
              tabIndex={-1}
              className={itemClasses}
              onClick={() => choose(item)}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {kind === 'basic' && item.icon && (
                <span className="sds-context-menu__icon" aria-hidden="true">
                  {item.icon}
                </span>
              )}
              <span className="sds-context-menu__label">{item.label}</span>
              {item.selected && item.showCheck !== false && (
                <span className="sds-context-menu__checkmark" aria-hidden="true">
                  {checkmarkIcon ?? DefaultCheckmark}
                </span>
              )}
            </button>
          </div>
        );
      })}
    </div>
  );
});
