import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './SearchBar.css';

/**
 * Visual state of the Search Bar. Mirrors the Figma Search Bar (9450:6392) `State`
 * variants and the `Inputs/Search Bar/*` token groups:
 * Default, Hover, Focused, Selected, No Results (`empty` tokens), Error, Disabled.
 *
 * `default`, `hover`, `focused` and the filled Selected look resolve automatically
 * (CSS interaction pseudo-classes + a non-empty `value`). Pass an explicit state only
 * to force `selected` (a closed field holding an entered query) or `empty`
 * (Figma "No Results": the query matched nothing).
 */
export type SearchBarState = 'default' | 'selected' | 'empty';

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /**
   * Accessible label for the input. Rendered visually hidden so the field stays
   * compact; pass your own visible label markup if you need one on screen.
   * @default 'Search'
   */
  label?: string;
  /** Current query value (controlled). */
  value?: string;
  /**
   * Forced visual state. Leave unset for the standard default/hover/focus/filled
   * model driven by CSS and `value`.
   * - `selected`: Figma State=Selected — a closed field holding an entered query
   *   (`selected-*` tokens). Also applied automatically when `value` is non-empty
   *   and the field is not focused.
   * - `empty`: Figma State=No Results — the query matched nothing (`empty-*` tokens).
   * @default 'default'
   */
  state?: SearchBarState;
  /**
   * Error state — e.g. an invalid query. Sets `aria-invalid` and applies the
   * Search Bar `error-*` tokens. Takes precedence over `state` styling.
   * @default false
   */
  error?: boolean;
  /** Called when the trailing clear (`xmark`) control is pressed. */
  onClear?: () => void;
  /**
   * Accessible label for the clear control.
   * @default 'Clear search'
   */
  clearLabel?: string;
  /**
   * Leading icon slot (search/magnifier), 20×20. Use a FontAwesome Duotone icon node
   * (e.g. `fa-magnifying-glass`). Rendered decorative (`aria-hidden`).
   */
  iconStart?: ReactNode;
  /**
   * Trailing clear-icon slot (`xmark`), 20×20. Use a FontAwesome Duotone icon node.
   * Rendered inside the clear button, which carries the accessible label.
   */
  iconClear?: ReactNode;
  /**
   * Whether a suggestions overlay is currently open. When provided, the input
   * follows the WAI-ARIA combobox pattern (`role="combobox"`, `aria-expanded`).
   */
  expanded?: boolean;
  /**
   * `id` of the listbox element holding suggestions, for the combobox pattern
   * (`aria-controls`). Only meaningful alongside `expanded`.
   */
  controlsId?: string;
  /**
   * `id` of the currently highlighted suggestion option
   * (`aria-activedescendant`). Only meaningful alongside `expanded`.
   */
  activeDescendantId?: string;
}

/**
 * Search Bar — Spotler Design System.
 *
 * A text field specialised for queries: a leading search (`magnifying-glass`) icon,
 * a placeholder, and a trailing clear (`xmark`) control that appears when the
 * field is non-empty.
 *
 * Figma: Inputs › Search Bar (9450:6392). Field 40px tall, padding 8px 12px,
 * gap 8px, 1px stroke, radius 8px (Border/Large); icons 20×20; value in
 * Paragraph - Regular. States: Default, Hover, Focused, Selected (filled),
 * No Results (`state="empty"`), Error, Disabled — bound to `Inputs/Search Bar/*`
 * (Disabled uses `Disabled/*`, including `Disabled/icon` for the magnifier).
 *
 * Optionally drives the WAI-ARIA combobox pattern for a suggestions overlay
 * (`expanded` / `controlsId` / `activeDescendantId`). The Figma suggestion list
 * (a Dropdown Menu below the Focused field) is not rendered by this component.
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    label = 'Search',
    value,
    state = 'default',
    error = false,
    onClear,
    clearLabel = 'Clear search',
    iconStart,
    iconClear,
    expanded,
    controlsId,
    activeDescendantId,
    placeholder = 'Search…',
    disabled,
    className,
    id,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hasValue = value != null && value !== '';
  const isCombobox = expanded !== undefined;

  const classes = [
    'sds-search-bar',
    error && 'sds-search-bar--error',
    hasValue && !disabled && 'sds-search-bar--filled',
    state === 'selected' && 'sds-search-bar--selected',
    state === 'empty' && 'sds-search-bar--empty',
    disabled && 'sds-search-bar--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <label className="sds-search-bar__visually-hidden" htmlFor={fieldId}>
        {label}
      </label>
      <div className="sds-search-bar__field">
        {iconStart && (
          <span className="sds-search-bar__icon sds-search-bar__icon--start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        <input
          ref={ref}
          id={fieldId}
          type="search"
          className="sds-search-bar__input"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error || undefined}
          role={isCombobox ? 'combobox' : undefined}
          aria-expanded={isCombobox ? expanded : undefined}
          aria-controls={isCombobox ? controlsId : undefined}
          aria-activedescendant={isCombobox ? activeDescendantId : undefined}
          aria-autocomplete={isCombobox ? 'list' : undefined}
          {...rest}
        />
        {hasValue && !disabled && (
          <button
            type="button"
            className="sds-search-bar__clear"
            aria-label={clearLabel}
            onClick={onClear}
          >
            {iconClear && (
              <span
                className="sds-search-bar__icon sds-search-bar__icon--end"
                aria-hidden="true"
              >
                {iconClear}
              </span>
            )}
          </button>
        )}
      </div>
    </div>
  );
});
