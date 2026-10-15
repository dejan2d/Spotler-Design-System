import { forwardRef, useCallback, useId, useRef, useState } from 'react';
import type { ChangeEvent, InputHTMLAttributes, ReactNode, Ref } from 'react';
import './NumberInput.css';

type InputValue = InputHTMLAttributes<HTMLInputElement>['value'];

function hasContent(value: InputValue): boolean {
  return value != null && String(value).length > 0;
}

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === 'function') ref(node);
  else if (ref) (ref as { current: T | null }).current = node;
}

/* Built-in Font Awesome Pro 7.1.0 Duotone Regular icons, copied from
   src/icons/duotone-regular/circle-minus.svg and circle-plus.svg — the stepper icons
   the Figma component uses. Font Awesome Pro by @fontawesome — https://fontawesome.com
   (Commercial License), © 2025 Fonticons, Inc. They render at 1em and inherit
   currentColor, so the per-state icon-decrement / icon-increment tokens colour them. */
const CircleMinusIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      opacity=".4"
      fill="currentColor"
      d="M112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320zM208 320C208 306.7 218.7 296 232 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L232 344C218.7 344 208 333.3 208 320z"
    />
    <path
      fill="currentColor"
      d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM232 296C218.7 296 208 306.7 208 320C208 333.3 218.7 344 232 344L408 344C421.3 344 432 333.3 432 320C432 306.7 421.3 296 408 296L232 296z"
    />
  </svg>
);

const CirclePlusIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      opacity=".4"
      fill="currentColor"
      d="M112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320zM208 320C208 306.7 218.7 296 232 296L296 296L296 232C296 218.7 306.7 208 320 208C333.3 208 344 218.7 344 232L344 296L408 296C421.3 296 432 306.7 432 320C432 333.3 421.3 344 408 344L344 344L344 408C344 421.3 333.3 432 320 432C306.7 432 296 421.3 296 408L296 344L232 344C218.7 344 208 333.3 208 320z"
    />
    <path
      fill="currentColor"
      d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM296 408C296 421.3 306.7 432 320 432C333.3 432 344 421.3 344 408L344 344L408 344C421.3 344 432 333.3 432 320C432 306.7 421.3 296 408 296L344 296L344 232C344 218.7 333.3 208 320 208C306.7 208 296 218.7 296 232L296 296L232 296C218.7 296 208 306.7 208 320C208 333.3 218.7 344 232 344L296 344L296 408z"
    />
  </svg>
);

export interface NumberInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'type' | 'prefix' | 'min' | 'max' | 'step'> {
  /** Visible label (Paragraph - Semi Bold). Required — the Figma component always shows it. */
  label: string;
  /** Marks the field optional; shows "(optional)" next to the label (Figma `Optional`). */
  optional?: boolean;
  /** Helper text shown below the field (Figma `Help Text`). */
  hint?: string;
  /**
   * Leading icon of the help / error message row (16×16, FontAwesome Duotone node —
   * `circle-info` in the Figma component). Rendered decorative.
   */
  hintIcon?: ReactNode;
  /** Error message. When set, the field renders in the Error state. */
  error?: string;
  /** Leading icon (20×20, FontAwesome Duotone node — Figma `Icon Start`). */
  iconStart?: ReactNode;
  /** Trailing icon before the stepper (20×20, FontAwesome Duotone node — Figma `Icon End`). */
  iconEnd?: ReactNode;
  /** Prefix text shown before the value, e.g. a currency sign (Figma `Prefix`). */
  prefix?: ReactNode;
  /** Suffix text shown after the value, e.g. a unit such as "px" (Figma `Sufix`). */
  suffix?: ReactNode;
  /** Lowest allowed value; the decrement button and ArrowDown stop here. */
  min?: number;
  /** Highest allowed value; the increment button and ArrowUp stop here. */
  max?: number;
  /** Amount each step changes the value by. Defaults to 1. */
  step?: number;
  /** Accessible name of the decrement (`circle-minus`) button. */
  decrementLabel?: string;
  /** Accessible name of the increment (`circle-plus`) button. */
  incrementLabel?: string;
}

/**
 * Number Input — numeric input with label, increment / decrement stepper, helper text and
 * validation.
 *
 * Figma: Inputs › Number Input (9414:19701), State=Default/Hover/Focused/Filled/Error/Disabled.
 * - Root (9414:19700): column, gap 4px, hugs height.
 * - Label row (9412:19372): label (Paragraph - Semi Bold) + "(optional)" (Paragraph - Regular),
 *   gap 4px.
 * - Field (9412:19375): 40px tall, padding 8px 12px, gap 8px, radius 8px (Border/Large), 1px
 *   inside stroke. Slots in order: Icon Start (20px), Prefix, value (Paragraph - Regular),
 *   Sufix, Icon End (20px), `circle-minus` decrement (20px), `circle-plus` increment (20px).
 * - Help text row (9415:19790): 16px icon + Paragraph - Small, gap 4px.
 * - States bind the `Inputs/Number Input/<state>-*` tokens; Disabled uses `Disabled/*`.
 *
 * Renders a native `type="number"` input (spinbutton role, ArrowUp/ArrowDown, min/max/step)
 * with the browser spinners hidden; the two stepper buttons call `stepUp()` / `stepDown()` and
 * fire a regular `onChange`, so controlled and uncontrolled use both work.
 */
export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(function NumberInput(
  {
    label,
    optional,
    hint,
    hintIcon,
    error,
    iconStart,
    iconEnd,
    prefix,
    suffix,
    min,
    max,
    step = 1,
    decrementLabel = 'Decrease value',
    incrementLabel = 'Increase value',
    id,
    disabled,
    readOnly,
    className,
    value,
    defaultValue,
    onChange,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;
  const hasError = Boolean(error);
  const message = error ?? hint;
  const inputRef = useRef<HTMLInputElement | null>(null);

  const setRefs = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );

  // Filled state: controlled fields read `value`; uncontrolled fields track input events.
  const isControlled = value !== undefined;
  const [uncontrolledFilled, setUncontrolledFilled] = useState(() => hasContent(defaultValue));
  const filled = isControlled ? hasContent(value) : uncontrolledFilled;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setUncontrolledFilled(event.target.value.length > 0);
    onChange?.(event);
  };

  const stepBy = (direction: 1 | -1) => {
    const input = inputRef.current;
    if (!input || disabled || readOnly) return;
    if (direction === 1) input.stepUp();
    else input.stepDown();
    // stepUp/stepDown bypass React's value setter, so this native event reaches onChange.
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const classes = [
    'sds-number-input',
    filled && 'sds-number-input--filled',
    hasError && 'sds-number-input--error',
    disabled && 'sds-number-input--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const stepperDisabled = disabled || readOnly;

  return (
    <div className={classes}>
      <label className="sds-number-input__label" htmlFor={fieldId}>
        {label}
        {optional && (
          <>
            {' '}
            <span className="sds-number-input__optional">(optional)</span>
          </>
        )}
      </label>
      <div className="sds-number-input__field">
        {iconStart && (
          <span className="sds-number-input__icon sds-number-input__icon--start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        {prefix && <span className="sds-number-input__prefix">{prefix}</span>}
        <input
          ref={setRefs}
          id={fieldId}
          type="number"
          inputMode="decimal"
          className="sds-number-input__input"
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          readOnly={readOnly}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          aria-invalid={hasError || undefined}
          aria-describedby={message ? hintId : undefined}
          {...rest}
        />
        {suffix && <span className="sds-number-input__suffix">{suffix}</span>}
        {iconEnd && (
          <span className="sds-number-input__icon sds-number-input__icon--end" aria-hidden="true">
            {iconEnd}
          </span>
        )}
        <button
          type="button"
          className="sds-number-input__step sds-number-input__step--decrement"
          aria-label={decrementLabel}
          aria-controls={fieldId}
          disabled={stepperDisabled}
          onClick={() => stepBy(-1)}
        >
          <CircleMinusIcon />
        </button>
        <button
          type="button"
          className="sds-number-input__step sds-number-input__step--increment"
          aria-label={incrementLabel}
          aria-controls={fieldId}
          disabled={stepperDisabled}
          onClick={() => stepBy(1)}
        >
          <CirclePlusIcon />
        </button>
      </div>
      {message && (
        <p className="sds-number-input__hint" id={hintId} role={hasError ? 'alert' : undefined}>
          {hintIcon && (
            <span className="sds-number-input__hint-icon" aria-hidden="true">
              {hintIcon}
            </span>
          )}
          <span className="sds-number-input__hint-text">{message}</span>
        </p>
      )}
    </div>
  );
});
