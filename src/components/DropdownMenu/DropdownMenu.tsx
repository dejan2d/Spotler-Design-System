import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './DropdownMenu.css';

export interface DropdownMenuOption {
  /** Visible label for the option. */
  label: string;
  /** Underlying value submitted/reported on selection. */
  value: string;
  /** Optional leading icon (FontAwesome Duotone node). */
  icon?: ReactNode;
  /** Disables the individual option. */
  disabled?: boolean;
}

export interface DropdownMenuProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visible label. Required for accessibility — never rely on placeholder alone. */
  label: string;
  /** Options to choose from. */
  options: DropdownMenuOption[];
  /** Currently selected value (controlled). */
  value?: string;
  /** Called with the chosen option's value when a selection is made. */
  onChange?: (value: string) => void;
  /** Placeholder shown when nothing is selected. */
  placeholder?: string;
  /** Marks the field optional; shows "(optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the field. */
  hint?: string;
  /** Error message. When set, the trigger renders in the error state. */
  error?: string;
  /** When true, shows a filter input that narrows the option list as you type. */
  searchable?: boolean;
  /** Disables the whole control. */
  disabled?: boolean;
}

/**
 * Dropdown Menu — a field-triggered list for choosing one value from a set.
 * Spec: references/components/dropdown-menu.md. Composes the Inputs trigger with a List Item menu.
 */
export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu(
  {
    label,
    options,
    value,
    onChange,
    placeholder = 'Select…',
    optional,
    hint,
    error,
    searchable = false,
    disabled,
    id,
    className,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const listId = `${fieldId}-list`;
  const hintId = `${fieldId}-hint`;
  const labelId = `${fieldId}-label`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  const hasError = Boolean(error);
  const message = error ?? hint;
  const selected = options.find((o) => o.value === value);

  const visibleOptions = searchable
    ? options.filter((o) => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  // Close on outside click.
  useEffect(() => {
    if (!open) return;
    function onDocPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [open]);

  // Focus the search input when opening a searchable menu.
  useEffect(() => {
    if (open && searchable) {
      searchRef.current?.focus();
    }
  }, [open, searchable]);

  function openMenu() {
    if (disabled) return;
    setQuery('');
    const startIndex = options.findIndex((o) => o.value === value);
    setActiveIndex(startIndex);
    setOpen(true);
  }

  function closeMenu(returnFocus = true) {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }

  function selectOption(option: DropdownMenuOption) {
    if (option.disabled) return;
    onChange?.(option.value);
    closeMenu();
  }

  function moveActive(delta: number) {
    if (visibleOptions.length === 0) return;
    setActiveIndex((prev) => {
      let next = prev;
      for (let i = 0; i < visibleOptions.length; i += 1) {
        next = (next + delta + visibleOptions.length) % visibleOptions.length;
        if (!visibleOptions[next]?.disabled) return next;
      }
      return prev;
    });
  }

  function onTriggerKeyDown(event: React.KeyboardEvent) {
    if (disabled) return;
    if (!open && (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openMenu();
      return;
    }
  }

  function onMenuKeyDown(event: React.KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Enter':
        event.preventDefault();
        if (activeIndex >= 0 && visibleOptions[activeIndex]) {
          selectOption(visibleOptions[activeIndex]);
        }
        break;
      case 'Escape':
        event.preventDefault();
        closeMenu();
        break;
      case 'Tab':
        closeMenu(false);
        break;
      default:
        break;
    }
  }

  const activeId =
    activeIndex >= 0 && visibleOptions[activeIndex]
      ? `${listId}-opt-${visibleOptions[activeIndex].value}`
      : undefined;

  const classes = [
    'sds-dropdown-menu',
    hasError && 'sds-dropdown-menu--error',
    open && 'sds-dropdown-menu--open',
    disabled && 'sds-dropdown-menu--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={(node) => {
        containerRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={classes}
      {...rest}
    >
      <span className="sds-dropdown-menu__label" id={labelId}>
        {label}
        {optional && <span className="sds-dropdown-menu__optional"> (optional)</span>}
      </span>

      <button
        ref={triggerRef}
        type="button"
        id={fieldId}
        className="sds-dropdown-menu__trigger"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-labelledby={`${labelId} ${fieldId}`}
        aria-invalid={hasError || undefined}
        aria-describedby={message ? hintId : undefined}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={onTriggerKeyDown}
      >
        <span
          className={[
            'sds-dropdown-menu__value',
            !selected && 'sds-dropdown-menu__value--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {selected ? selected.label : placeholder}
        </span>
        <span className="sds-dropdown-menu__chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {open && (
        <div className="sds-dropdown-menu__popover" onKeyDown={onMenuKeyDown}>
          {searchable && (
            <div className="sds-dropdown-menu__search">
              <input
                ref={searchRef}
                type="text"
                className="sds-dropdown-menu__search-input"
                placeholder="Search…"
                value={query}
                aria-label="Filter options"
                aria-controls={listId}
                aria-activedescendant={activeId}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
              />
            </div>
          )}
          <ul
            id={listId}
            role="listbox"
            className="sds-dropdown-menu__list"
            aria-labelledby={labelId}
            aria-activedescendant={activeId}
            tabIndex={searchable ? -1 : 0}
            ref={(node) => {
              if (node && !searchable) node.focus();
            }}
          >
            {visibleOptions.length === 0 && (
              <li className="sds-dropdown-menu__empty" role="presentation">
                No results
              </li>
            )}
            {visibleOptions.map((option, index) => {
              const isSelected = option.value === value;
              const isActive = index === activeIndex;
              return (
                <li
                  key={option.value}
                  id={`${listId}-opt-${option.value}`}
                  role="option"
                  aria-selected={isSelected}
                  aria-disabled={option.disabled || undefined}
                  className={[
                    'sds-dropdown-menu__option',
                    isSelected && 'sds-dropdown-menu__option--selected',
                    isActive && 'sds-dropdown-menu__option--active',
                    option.disabled && 'sds-dropdown-menu__option--disabled',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => selectOption(option)}
                >
                  {option.icon && (
                    <span className="sds-dropdown-menu__option-icon" aria-hidden="true">
                      {option.icon}
                    </span>
                  )}
                  <span className="sds-dropdown-menu__option-label">{option.label}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {message && (
        <p className="sds-dropdown-menu__hint" id={hintId}>
          {message}
        </p>
      )}
    </div>
  );
});
