import { forwardRef, useRef } from 'react';
import type { HTMLAttributes, KeyboardEvent, ReactNode } from 'react';
import './SegmentedButton.css';

/** A single mutually-exclusive option rendered as one joined segment. */
export interface SegmentedButtonOption {
  /** Visible label. Optional when an icon is provided (icon-only segment). */
  label?: string;
  /** Underlying value reported on selection. Must be unique within the group. */
  value: string;
  /** Optional leading icon (FontAwesome Duotone node, rendered at 20px — Figma `Icon`). */
  icon?: ReactNode;
  /** Accessible label — REQUIRED when the segment is icon-only (no `label`). */
  ariaLabel?: string;
}

export interface SegmentedButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The 2–6 mutually-exclusive options shown as joined segments (Figma `Number` 2–6). */
  options: SegmentedButtonOption[];
  /** Currently selected value (controlled). Pass `''` for no initial selection. */
  value: string;
  /** Called with the chosen segment's `value` when selection changes. */
  onChange: (value: string) => void;
  /** Accessible group label describing what the options switch between. */
  'aria-label'?: string;
}

/**
 * SegmentedButton — Spotler Design System.
 *
 * A compact, single-select group of mutually-exclusive options shown as joined
 * segments inside one white, outlined container (e.g. list/grid, day/week/month).
 * Use for 2–6 short options in a tight space; not a replacement for Tabs.
 *
 * Figma: "Segmented group" 9323:16759 (Number 2–6) of "Segmented-Button" 9323:15207.
 * Group: height 36px, radius 16px (--border-x-large), Monochrome/White fill, 1px
 * Segmented Button/stroke outside, no gap. Segment: padding 8px 12px, gap 8px,
 * radius 16px, 20px icon, Paragraph - Regular (14px), no dividers.
 * States: Default (no fill, muted text/icon), Hover (blue text/icon, Drop Shadow/50
 * cast by the content), Active = selected (light-blue fill, Drop Shadow/50,
 * darker text/icon, Paragraph - Semi Bold so selection is not conveyed by color
 * alone). There is no disabled state — Figma has none.
 * The keyboard focus ring is not designed in Figma; it is kept for accessibility.
 *
 * Exposed as a `radiogroup` of `radio` segments with roving tabindex; Arrow /
 * Home / End keys move selection across the segments.
 */
export const SegmentedButton = forwardRef<HTMLDivElement, SegmentedButtonProps>(
  function SegmentedButton(
    { options, value, onChange, className, ...rest },
    ref,
  ) {
    const refs = useRef<Array<HTMLButtonElement | null>>([]);
    const count = options.length;

    /** Index that should be in the tab order (the roving tabindex anchor). */
    const selectedIndex = options.findIndex((option) => option.value === value);
    const tabbableIndex = selectedIndex >= 0 ? selectedIndex : 0;

    function focusAndSelect(index: number) {
      refs.current[index]?.focus();
      onChange(options[index].value);
    }

    function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
      let nextIndex: number;
      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          nextIndex = (index + 1) % count;
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          nextIndex = (index - 1 + count) % count;
          break;
        case 'Home':
          nextIndex = 0;
          break;
        case 'End':
          nextIndex = count - 1;
          break;
        default:
          return;
      }

      event.preventDefault();
      focusAndSelect(nextIndex);
    }

    const classes = ['sds-segmented-button', className].filter(Boolean).join(' ');

    return (
      <div ref={ref} role="radiogroup" className={classes} {...rest}>
        {options.map((option, index) => {
          const isSelected = option.value === value;
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
              tabIndex={index === tabbableIndex ? 0 : -1}
              className={[
                'sds-segmented-button__segment',
                isSelected && 'sds-segmented-button__segment--selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onChange(option.value)}
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
