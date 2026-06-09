import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, MutableRefObject, ReactNode } from 'react';
import './DropdownMenu.css';

/** A single selectable entry rendered as a List Item inside the menu. */
export interface DropdownMenuOption {
  /** Visible label for the option. */
  label: string;
  /** Underlying value submitted/reported on selection. Must be unique within `options`. */
  value: string;
  /** Optional leading icon (FontAwesome Duotone node), shown before the label. */
  icon?: ReactNode;
  /** Disables this single option without disabling the whole control. */
  disabled?: boolean;
}

/**
 * Visual state of the trigger field. Mirrors the Spotler "Dropdown Menu" Inputs token states.
 * `default`/`hover`/`focused`/`selected` are driven automatically; `error` and `disabled`
 * are derived from the `error` / `disabled` props.
 */
export type DropdownMenuState = 'default' | 'hover' | 'focused' | 'selected' | 'error' | 'disabled';

interface DropdownMenuBaseProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** Visible label. Required for accessibility — never rely on the placeholder alone. */
  label: string;
  /** Options to choose from. */
  options: DropdownMenuOption[];
  /** Placeholder shown when nothing is selected. @default 'Select…' */
  placeholder?: string;
  /** Marks the field optional; appends "(optional)" next to the label. */
  optional?: boolean;
  /** Helper text shown below the field. Hidden when `error` is set. */
  hint?: string;
  /** Optional icon shown beside the hint / error message (FontAwesome Duotone node). */
  hintIcon?: ReactNode;
  /** Error message. When set, the trigger renders in the error state and exposes `aria-invalid`. */
  error?: string;
  /** When true, shows a filter input that narrows the option list as you type. @default false */
  searchable?: boolean;
  /** Message shown inside the menu when no option matches the current filter. @default 'No results' */
  noResultsLabel?: string;
  /** Placeholder for the searchable filter input. @default 'Search…' */
  searchPlaceholder?: string;
  /** Disables the whole control. */
  disabled?: boolean;
  /**
   * Trailing chevron icon (FontAwesome Duotone node). Rotates 180° while open.
   * Falls back to a built-in inline SVG chevron when omitted.
   */
  chevronIcon?: ReactNode;
  /** Leading icon for the search input (FontAwesome Duotone node). */
  searchIcon?: ReactNode;
}

/** Single-select Dropdown (default): one value at a time; selecting closes the menu. */
export interface DropdownMenuSingleProps extends DropdownMenuBaseProps {
  /** Selection mode. @default 'single' */
  multiple?: false;
  /** Currently selected value (controlled). */
  value?: string;
  /** Called with the chosen option's value when a selection is made. */
  onChange?: (value: string) => void;
}

/** Multi-select Dropdown: several values; the menu stays open and chosen items show a checkmark. */
export interface DropdownMenuMultipleProps extends DropdownMenuBaseProps {
  /** Selection mode. */
  multiple: true;
  /** Currently selected values (controlled). */
  value?: string[];
  /** Called with the full next array of selected values when an option is toggled. */
  onChange?: (value: string[]) => void;
}

export type DropdownMenuProps = DropdownMenuSingleProps | DropdownMenuMultipleProps;

/**
 * Dropdown Menu — Spotler Design System.
 *
 * A field-triggered menu for choosing one (single) or several (multiple) values from a
 * medium-to-large option set, optionally searchable. Composes the Inputs "Dropdown Menu"
 * trigger with a Context Menu / List Item list on the overlay surface.
 *
 * Trigger: input-style field, padding 8px 12px, gap 8px, radius small (4px), 1px stroke,
 * inheriting input states (default / hover / focused / selected / error / disabled).
 * Menu: overlay surface, radius medium (6px), 4px padding, overlay elevation; chosen items
 * show a checkmark in the conceptual blue (#005499 token). Variants: single / multiple,
 * searchable. States: default, hover, focused, selected, error, disabled.
 *
 * Accessibility: combobox/listbox pattern — trigger exposes `aria-haspopup="listbox"`,
 * `aria-expanded`, `aria-controls`; options use `role="option"` with `aria-selected`;
 * the active option is tracked via `aria-activedescendant`. Full keyboard support and
 * focus returns to the trigger on close.
 */
export const DropdownMenu = forwardRef<HTMLDivElement, DropdownMenuProps>(function DropdownMenu(
  props,
  ref,
) {
  const {
    label,
    options,
    placeholder = 'Select…',
    optional,
    hint,
    hintIcon,
    error,
    searchable = false,
    noResultsLabel = 'No results',
    searchPlaceholder = 'Search…',
    disabled,
    chevronIcon,
    searchIcon,
    id,
    className,
    multiple,
    value,
    onChange,
    ...rest
  } = props as DropdownMenuBaseProps & {
    multiple?: boolean;
    value?: string | string[];
    onChange?: (value: never) => void;
  };

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
  const listRef = useRef<HTMLUListElement | null>(null);

  const hasError = Boolean(error);
  const message = error ?? hint;

  // Normalize the controlled value into a set regardless of selection mode.
  const selectedValues = useMemo<string[]>(() => {
    if (multiple) return Array.isArray(value) ? value : [];
    return typeof value === 'string' && value.length > 0 ? [value] : [];
  }, [multiple, value]);

  const selectedOptions = useMemo(
    () => options.filter((option) => selectedValues.includes(option.value)),
    [options, selectedValues],
  );

  const triggerLabel = multiple
    ? selectedOptions.map((option) => option.label).join(', ')
    : (selectedOptions[0]?.label ?? '');
  const hasSelection = selectedOptions.length > 0;

  const visibleOptions = useMemo(() => {
    if (!searchable) return options;
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) return options;
    return options.filter((option) => option.label.toLowerCase().includes(needle));
  }, [options, searchable, query]);

  // Close the menu when clicking outside the control.
  useEffect(() => {
    if (!open) return undefined;
    function onDocPointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('pointerdown', onDocPointerDown);
    return () => document.removeEventListener('pointerdown', onDocPointerDown);
  }, [open]);

  // Move keyboard focus to the right element when the menu opens.
  useEffect(() => {
    if (!open) return;
    if (searchable) searchRef.current?.focus();
    else listRef.current?.focus();
  }, [open, searchable]);

  const openMenu = useCallback(() => {
    if (disabled) return;
    setQuery('');
    const firstSelected = options.findIndex((option) => selectedValues.includes(option.value));
    setActiveIndex(firstSelected);
    setOpen(true);
  }, [disabled, options, selectedValues]);

  const closeMenu = useCallback((returnFocus = true) => {
    setOpen(false);
    if (returnFocus) triggerRef.current?.focus();
  }, []);

  const selectOption = useCallback(
    (option: DropdownMenuOption) => {
      if (option.disabled) return;
      if (multiple) {
        const next = selectedValues.includes(option.value)
          ? selectedValues.filter((v) => v !== option.value)
          : [...selectedValues, option.value];
        (onChange as ((value: string[]) => void) | undefined)?.(next);
        // Multi-select keeps the menu open per spec.
      } else {
        (onChange as ((value: string) => void) | undefined)?.(option.value);
        closeMenu();
      }
    },
    [multiple, selectedValues, onChange, closeMenu],
  );

  const moveActive = useCallback(
    (delta: number) => {
      if (visibleOptions.length === 0) return;
      setActiveIndex((prev) => {
        let next = prev < 0 ? (delta > 0 ? -1 : 0) : prev;
        for (let i = 0; i < visibleOptions.length; i += 1) {
          next = (next + delta + visibleOptions.length) % visibleOptions.length;
          if (!visibleOptions[next]?.disabled) return next;
        }
        return prev;
      });
    },
    [visibleOptions],
  );

  function onTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!open && (event.key === 'ArrowDown' || event.key === 'ArrowUp' || event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      openMenu();
    }
  }

  function onMenuKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        moveActive(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        moveActive(-1);
        break;
      case 'Home':
        event.preventDefault();
        setActiveIndex(0);
        moveActive(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(visibleOptions.length - 1);
        break;
      case 'Enter':
      case ' ':
        // Space selects only when not typing in the search field.
        if (event.key === ' ' && searchable && event.target === searchRef.current) break;
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

  const activeOption = activeIndex >= 0 ? visibleOptions[activeIndex] : undefined;
  const activeId = activeOption ? `${listId}-opt-${activeOption.value}` : undefined;

  const classes = [
    'sds-dropdown-menu',
    hasError && 'sds-dropdown-menu--error',
    open && 'sds-dropdown-menu--open',
    hasSelection && 'sds-dropdown-menu--selected',
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
            !hasSelection && 'sds-dropdown-menu__value--placeholder',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {hasSelection ? triggerLabel : placeholder}
        </span>
        <span className="sds-dropdown-menu__chevron" aria-hidden="true">
          {chevronIcon ?? (
            <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false">
              <path
                d="M4 6l4 4 4-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </span>
      </button>

      {open && (
        <div className="sds-dropdown-menu__popover" onKeyDown={onMenuKeyDown}>
          {searchable && (
            <div className="sds-dropdown-menu__search">
              {searchIcon && (
                <span className="sds-dropdown-menu__search-icon" aria-hidden="true">
                  {searchIcon}
                </span>
              )}
              <input
                ref={searchRef}
                type="text"
                role="combobox"
                className="sds-dropdown-menu__search-input"
                placeholder={searchPlaceholder}
                value={query}
                aria-label="Filter options"
                aria-expanded={open}
                aria-controls={listId}
                aria-activedescendant={activeId}
                autoComplete="off"
                onChange={(event) => {
                  setQuery(event.target.value);
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
            aria-multiselectable={multiple || undefined}
            aria-activedescendant={searchable ? undefined : activeId}
            tabIndex={searchable ? -1 : 0}
            ref={listRef}
          >
            {visibleOptions.length === 0 && (
              <li className="sds-dropdown-menu__empty" role="presentation" aria-live="polite">
                {noResultsLabel}
              </li>
            )}
            {visibleOptions.map((option, index) => {
              const isSelected = selectedValues.includes(option.value);
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
                  {isSelected && (
                    <span className="sds-dropdown-menu__option-check" aria-hidden="true">
                      <svg viewBox="0 0 16 16" width="1em" height="1em" focusable="false">
                        <path
                          d="M3.5 8.5l3 3 6-6.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {message && (
        <p className="sds-dropdown-menu__hint" id={hintId}>
          {hintIcon && (
            <span className="sds-dropdown-menu__hint-icon" aria-hidden="true">
              {hintIcon}
            </span>
          )}
          <span className="sds-dropdown-menu__hint-text">{message}</span>
        </p>
      )}
    </div>
  );
});
