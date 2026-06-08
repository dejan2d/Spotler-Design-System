import { forwardRef, useId } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import './SearchBar.css';

export interface SearchBarProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Accessible label. Rendered visually hidden unless you pass your own. */
  label?: string;
  /** Current query value (controlled). */
  value?: string;
  /** Called when the clear (xmark) control is pressed. */
  onClear?: () => void;
  /** Error state — e.g. an invalid query. */
  error?: boolean;
  /**
   * Empty state — emphasised "active but no results" styling.
   * Mirrors the Search Bar `empty-*` tokens.
   */
  empty?: boolean;
  /** Leading icon override (defaults to a magnifier glyph). */
  iconStart?: ReactNode;
}

/**
 * Search Bar — a text field specialised for queries with a leading search icon
 * and a trailing clear affordance when non-empty.
 * Spec: references/components/search-bar.md (Inputs system, Search Bar tokens).
 */
export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(function SearchBar(
  {
    label = 'Search',
    value,
    onClear,
    error,
    empty,
    iconStart,
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

  const classes = [
    'sds-search-bar',
    error && 'sds-search-bar--error',
    empty && 'sds-search-bar--empty',
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
        <span className="sds-search-bar__icon sds-search-bar__icon--start" aria-hidden="true">
          {iconStart ?? '🔍'}
        </span>
        <input
          ref={ref}
          id={fieldId}
          type="search"
          role="searchbox"
          className="sds-search-bar__input"
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          aria-invalid={error || undefined}
          {...rest}
        />
        {hasValue && !disabled && (
          <button
            type="button"
            className="sds-search-bar__clear"
            aria-label="Clear search"
            onClick={onClear}
          >
            <span className="sds-search-bar__icon sds-search-bar__icon--end" aria-hidden="true">
              ✕
            </span>
          </button>
        )}
      </div>
    </div>
  );
});
