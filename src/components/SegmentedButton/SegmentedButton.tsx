import { forwardRef, useRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './SegmentedButton.css';

export interface SegmentedButtonOption {
  /** Visible label. Optional when an icon is provided. */
  label?: string;
  /** Underlying value reported on selection. */
  value: string;
  /** Optional icon (FontAwesome Duotone node). */
  icon?: ReactNode;
  /** Accessible label — required when the segment is icon-only. */
  ariaLabel?: string;
  /** Disables the individual segment. */
  disabled?: boolean;
}

export interface SegmentedButtonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The mutually-exclusive options shown as joined segments. */
  options: SegmentedButtonOption[];
  /** Currently selected value (controlled). */
  value: string;
  /** Called with the chosen segment's value. */
  onChange: (value: string) => void;
  /** Accessible group label. */
  'aria-label'?: string;
}

/**
 * Segmented Button — a single-select group of joined segments.
 * Spec: references/components/segmented-button.md. Exposed as a radiogroup;
 * arrow keys move selection.
 */
export const SegmentedButton = forwardRef<HTMLDivElement, SegmentedButtonProps>(
  function SegmentedButton({ options, value, onChange, className, ...rest }, ref) {
    const refs = useRef<Array<HTMLButtonElement | null>>([]);

    function focusIndex(index: number) {
      const node = refs.current[index];
      node?.focus();
    }

    function selectableIndices() {
      return options.map((o, i) => (o.disabled ? -1 : i)).filter((i) => i >= 0);
    }

    function onKeyDown(event: React.KeyboardEvent, index: number) {
      const order = selectableIndices();
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
        focusIndex(nextIndex);
        onChange(options[nextIndex].value);
      }
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
              disabled={option.disabled}
              tabIndex={isSelected || (value === '' && index === 0) ? 0 : -1}
              className={[
                'sds-segmented-button__segment',
                isSelected && 'sds-segmented-button__segment--selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => !option.disabled && onChange(option.value)}
              onKeyDown={(e) => onKeyDown(e, index)}
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
