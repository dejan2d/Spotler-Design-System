import { forwardRef, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './SegmentedButton.css';

/** A single mutually-exclusive option rendered as one joined segment. */
export interface SegmentedButtonOption {
  /** Visible label. Optional when an icon is provided (icon-only segment). */
  label?: string;
  /** Underlying value reported on selection. Must be unique within the group. */
  value: string;
  /** Optional leading icon (FontAwesome Duotone node, rendered at 16px). */
  icon?: ReactNode;
  /** Accessible label — REQUIRED when the segment is icon-only (no `label`). */
  ariaLabel?: string;
  /** Disables this individual segment; it is skipped by keyboard navigation. */
  disabled?: boolean;
}

export interface SegmentedButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The 2–4 mutually-exclusive options shown as joined segments. */
  options: SegmentedButtonOption[];
  /** Currently selected value (controlled). Pass `''` for no initial selection. */
  value: string;
  /** Called with the chosen segment's `value` when selection changes. */
  onChange: (value: string) => void;
  /**
   * Disables the entire group. Individual segments can also be disabled via
   * `option.disabled`.
   * @default false
   */
  disabled?: boolean;
  /** Accessible group label describing what the options switch between. */
  'aria-label'?: string;
}

/**
 * SegmentedButton — Spotler Design System.
 *
 * A compact, single-select group of mutually-exclusive options shown as joined
 * segments inside one bordered container (e.g. list/grid, day/week/month). Use
 * for 2–4 short options in a tight space; not a replacement for Tabs.
 *
 * Sizing: padding 8px 12px, gap 8px, radius 4px (--border-small), 1px hairline
 * group stroke + per-segment dividers, body type (14px/20px), 16px icons.
 * States: rest (muted text/icon), hover, selected (filled background + darker
 * text/icon + Semi-Bold label so selection is not conveyed by color alone),
 * disabled (group or per-segment).
 *
 * Exposed as a `radiogroup` of `radio` segments with roving tabindex; Arrow /
 * Home / End keys move selection across enabled segments.
 */
export const SegmentedButton = forwardRef<HTMLDivElement, SegmentedButtonProps>(
  function SegmentedButton(
    { options, value, onChange, disabled = false, className, ...rest },
    ref,
  ) {
    const refs = useRef<Array<HTMLButtonElement | null>>([]);

    const isSegmentDisabled = (option: SegmentedButtonOption) =>
      disabled || Boolean(option.disabled);

    /** Indices of segments that can receive focus / selection. */
    const selectableIndices = () =>
      options
        .map((option, index) => (isSegmentDisabled(option) ? -1 : index))
        .filter((index) => index >= 0);

    /** Index that should be in the tab order (the roving tabindex anchor). */
    const order = selectableIndices();
    const selectedIndex = options.findIndex((option) => option.value === value);
    const tabbableIndex =
      selectedIndex >= 0 && !isSegmentDisabled(options[selectedIndex])
        ? selectedIndex
        : (order[0] ?? -1);

    function focusAndSelect(index: number) {
      refs.current[index]?.focus();
      onChange(options[index].value);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
      const pos = order.indexOf(index);
      if (pos === -1) return;

      let nextIndex: number | null = null;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = order[(pos + 1) % order.length];
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = order[(pos - 1 + order.length) % order.length];
          break;
        case 'Home':
          nextIndex = order[0];
          break;
        case 'End':
          nextIndex = order[order.length - 1];
          break;
        default:
          return;
      }

      if (nextIndex != null) {
        event.preventDefault();
        focusAndSelect(nextIndex);
      }
    }

    const classes = [
      'sds-segmented-button',
      disabled && 'sds-segmented-button--disabled',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} role="radiogroup" aria-disabled={disabled || undefined} className={classes} {...rest}>
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const segmentDisabled = isSegmentDisabled(option);
          return (
            <button
              key={option.value}
              ref={(node) => {
                refs.current[index] = node;
              }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={option.ariaLabel ?? (option.label ? undefined : option.value)}
              disabled={segmentDisabled}
              tabIndex={index === tabbableIndex ? 0 : -1}
              className={[
                'sds-segmented-button__segment',
                isSelected && 'sds-segmented-button__segment--selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => {
                if (!segmentDisabled) onChange(option.value);
              }}
              onKeyDown={(event) => handleKeyDown(event, index)}
            >
              {option.icon && (
                <span className="sds-segmented-button__icon" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              {option.label && (
                <span className="sds-segmented-button__label">{option.label}</span>
              )}
            </button>
          );
        })}
      </div>
    );
  },
);
