import { forwardRef, useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import type { HTMLAttributes, KeyboardEvent, MutableRefObject, ReactNode } from 'react';
import './DropdownMenu.css';

/**
 * A single selectable entry rendered as a Figma `List Item` (9422:99325) inside the menu.
 * Slot order follows Figma: Checkbox Left, Icon Left, label, Checkbox Right, Badge, Icon Right.
 */
export interface DropdownMenuOption {
  /** Visible label for the option. */
  label: string;
  /** Underlying value submitted/reported on selection. Must be unique within `options`. */
  value: string;
  /** Leading icon — Figma `Icon Left` (20×20, FontAwesome Duotone node). */
  icon?: ReactNode;
  /** Trailing icon — Figma `Icon Right` (20×20, FontAwesome Duotone node). */
  iconRight?: ReactNode;
  /**
   * Badge after the label — Figma `Badge` (a 16px Counter badge, Neutral in the List Item,
   * e.g. `<Badge variant="circle" color="neutral" count={4} />`).
   */
  badge?: ReactNode;
}

/** Side of the label the List Item checkbox sits on (Figma `Checkbox Left` / `Checkbox Right`). */
export type DropdownMenuCheckboxPosition = 'left' | 'right';

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
  /**
   * Leading icon of the hint / error message row (16×16, FontAwesome Duotone node —
   * `circle-info` in the Figma component).
   */
  hintIcon?: ReactNode;
  /** Error message. When set, the trigger renders in the error state and exposes `aria-invalid`. */
  error?: string;
  /**
   * Message shown inside the menu when `options` is empty (Figma Dropdown Menu
   * "No result" List Item). @default 'No results'
   */
  noResultsLabel?: string;
  /**
   * Leading icon of the no-results row (20×20, FontAwesome Duotone node — `circle-info`
   * in the Figma Dropdown Menu).
   */
  noResultsIcon?: ReactNode;
  /** Disables the whole control. */
  disabled?: boolean;
  /**
   * Trailing chevron icon (20×20, FontAwesome Duotone node — `angle-down` in Figma).
   * Rotates 180° while open. Falls back to a built-in inline SVG chevron when omitted.
   */
  chevronIcon?: ReactNode;
  /**
   * Badge slot between the value and the chevron (Figma Dropdown `Badge`: a 16px Counter
   * badge, `Badges/Circle/primary-background`, e.g.
   * `<Badge variant="circle" color="primary" count={3} />` for a selection count).
   */
  badge?: ReactNode;
  /**
   * Shows a checkbox in every List Item (Figma `Checkbox Left` / `Checkbox Right`), checked
   * when the option is selected. Pass `false` to hide it.
   * @default 'left' when `multiple`, otherwise no checkbox
   */
  checkbox?: DropdownMenuCheckboxPosition | false;
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
 * Visual-only Checkbox inside a List Item (the option itself carries `aria-selected`).
 * Mirrors Figma Checkbox 184:3150: 20×20 frame, 2px padding, 16×16 box (radius 4px,
 * 1px stroke), 10×10 checkmark; `Checkbox/default-*` unchecked, `Checkbox/checked-*` checked.
 */
function OptionCheckbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={[
        'sds-dropdown-menu__option-checkbox',
        checked && 'sds-dropdown-menu__option-checkbox--checked',
      ]
        .filter(Boolean)
        .join(' ')}
      aria-hidden="true"
    >
      <span className="sds-dropdown-menu__option-checkbox-box">
        {checked && (
          <svg className="sds-dropdown-menu__option-checkbox-check" viewBox="0 0 10 10" fill="none">
            <path
              transform="translate(1.5 2.506)"
              d="M6.854 0.14C7.049 0.336 7.049 0.653 6.854 0.848L2.854 4.847C2.659 5.043 2.342 5.043 2.146 4.847L0.146 2.848C-0.049 2.653 -0.049 2.335 0.146 2.14C0.342 1.945 0.659 1.945 0.854 2.14L2.501 3.785L6.147 0.14C6.343 -0.055 6.67 -0.042 6.866 0.153L6.854 0.14Z"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.9"
            />
          </svg>
        )}
      </span>
    </span>
  );
}

/**
 * Dropdown Menu — Spotler Design System.
 *
 * A field-triggered menu for choosing one (single) or several (multiple) values from a
 * medium-to-large option set.
 *
 * Figma (Inputs page):
 * - Trigger = `Dropdown` (9422:104912). Root column gap 4px; label row gap 4px
 *   (label Paragraph - Semi Bold, "(optional)" Paragraph - Regular). Field 40px tall,
 *   padding 8px 12px, gap 8px, radius 8px (Border/Large), 1px stroke; value Paragraph -
 *   Regular; optional Badge; 20px `angle-down` chevron. Hint row: 16px icon +
 *   Paragraph - Small, gap 4px. States Default / Hover / Focused (open or keyboard focus) /
 *   Selected (has a value) / Error / Disabled, bound to `Inputs/Dropdown Menu/<state>-*`
 *   (Disabled uses `Disabled/*`).
 * - Menu = `Dropdown Menu` (9445:23950): 4px below the field, padding 12px, gap 4px,
 *   radius 8px, white, no border, Drop Shadow/50.
 * - Options = `List Item` (9422:99325): 40px tall, padding 8px 12px, gap 8px, radius 8px.
 *   Slots: Checkbox Left / Icon Left (20px) / label / Checkbox Right / Badge (16px) /
 *   Icon Right (20px). States: Default, Hover (`Inputs/List Item/hover-*`), Selected
 *   (9422:99322: `Inputs/List Item/selected-background` + Paragraph - Semi Bold, no
 *   checkmark). Multi-select shows a checkbox per item (checked = selected).
 * - No search/filter field: the Figma Dropdown and Dropdown Menu have none.
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
    noResultsLabel = 'No results',
    noResultsIcon,
    disabled,
    chevronIcon,
    badge,
    checkbox,
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
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);

  const hasError = Boolean(error);
  const message = error ?? hint;
  const checkboxPosition = checkbox ?? (multiple ? 'left' : false);

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

  // Move keyboard focus to the listbox when the menu opens.
  useEffect(() => {
    if (open) listRef.current?.focus();
  }, [open]);

  const openMenu = useCallback(() => {
    if (disabled) return;
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
      const count = options.length;
      if (count === 0) return;
      setActiveIndex((prev) => {
        if (prev < 0) return delta > 0 ? 0 : count - 1;
        return (prev + delta + count) % count;
      });
    },
    [options],
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
        if (options.length > 0) setActiveIndex(0);
        break;
      case 'End':
        event.preventDefault();
        setActiveIndex(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (activeIndex >= 0 && options[activeIndex]) {
          selectOption(options[activeIndex]);
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

  const activeOption = activeIndex >= 0 ? options[activeIndex] : undefined;
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
        else if (ref) (ref as MutableRefObject<HTMLDivElement | null>).current = node;
      }}
      className={classes}
      {...rest}
    >
      <span className="sds-dropdown-menu__label" id={labelId}>
        {label}
        {optional && (
          <>
            {' '}
            <span className="sds-dropdown-menu__optional">(optional)</span>
          </>
        )}
      </span>

      <div className="sds-dropdown-menu__anchor">
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
          {badge && <span className="sds-dropdown-menu__badge">{badge}</span>}
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
            <ul
              id={listId}
              role="listbox"
              className="sds-dropdown-menu__list"
              aria-labelledby={labelId}
              aria-multiselectable={multiple || undefined}
              aria-activedescendant={activeId}
              tabIndex={0}
              ref={listRef}
            >
              {options.length === 0 && (
                <li className="sds-dropdown-menu__empty" role="presentation" aria-live="polite">
                  {noResultsIcon && (
                    <span className="sds-dropdown-menu__empty-icon" aria-hidden="true">
                      {noResultsIcon}
                    </span>
                  )}
                  <span className="sds-dropdown-menu__empty-label">{noResultsLabel}</span>
                </li>
              )}
              {options.map((option, index) => {
                const isSelected = selectedValues.includes(option.value);
                const isActive = index === activeIndex;
                return (
                  <li
                    key={option.value}
                    id={`${listId}-opt-${option.value}`}
                    role="option"
                    aria-selected={isSelected}
                    className={[
                      'sds-dropdown-menu__option',
                      isSelected && 'sds-dropdown-menu__option--selected',
                      isActive && 'sds-dropdown-menu__option--active',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => selectOption(option)}
                  >
                    {checkboxPosition === 'left' && <OptionCheckbox checked={isSelected} />}
                    {option.icon && (
                      <span className="sds-dropdown-menu__option-icon" aria-hidden="true">
                        {option.icon}
                      </span>
                    )}
                    <span className="sds-dropdown-menu__option-label">{option.label}</span>
                    {checkboxPosition === 'right' && <OptionCheckbox checked={isSelected} />}
                    {option.badge && (
                      <span className="sds-dropdown-menu__option-badge">{option.badge}</span>
                    )}
                    {option.iconRight && (
                      <span className="sds-dropdown-menu__option-icon" aria-hidden="true">
                        {option.iconRight}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

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
