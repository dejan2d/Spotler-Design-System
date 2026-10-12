import { forwardRef, useId, useState } from 'react';
import type { ChangeEvent, CSSProperties, InputHTMLAttributes, ReactNode } from 'react';
import './ColorPicker.css';

/* Built-in Font Awesome Pro 7.1.0 Duotone Regular icons (src/icons/duotone-regular/).
   Font Awesome Pro by @fontawesome — https://fontawesome.com (Commercial License), © 2025 Fonticons, Inc. */
const XmarkIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      fill="currentColor"
      d="M135.5 169C126.1 159.6 126.1 144.4 135.5 135.1C144.9 125.8 160.1 125.7 169.4 135.1L320.4 286.1L471.4 135.1C480.8 125.7 496 125.7 505.3 135.1C514.6 144.5 514.7 159.7 505.3 169L354.3 320L505.3 471C514.7 480.4 514.7 495.6 505.3 504.9C495.9 514.2 480.7 514.3 471.4 504.9L320.4 353.9L169.4 504.9C160 514.3 144.8 514.3 135.5 504.9C126.2 495.5 126.1 480.3 135.5 471L286.5 320L135.5 169z"
    />
  </svg>
);

const CircleInfoIcon = () => (
  <svg viewBox="0 0 640 640" width="1em" height="1em" focusable="false" aria-hidden="true">
    <path
      opacity=".4"
      fill="currentColor"
      d="M112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112C205.1 112 112 205.1 112 320zM256 312C256 298.7 266.7 288 280 288L328 288C341.3 288 352 298.7 352 312L352 400L360 400C373.3 400 384 410.7 384 424C384 437.3 373.3 448 360 448L280 448C266.7 448 256 437.3 256 424C256 410.7 266.7 400 280 400L304 400L304 336L280 336C266.7 336 256 325.3 256 312zM352 224C352 241.7 337.7 256 320 256C302.3 256 288 241.7 288 224C288 206.3 302.3 192 320 192C337.7 192 352 206.3 352 224z"
    />
    <path
      fill="currentColor"
      d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM280 400C266.7 400 256 410.7 256 424C256 437.3 266.7 448 280 448L360 448C373.3 448 384 437.3 384 424C384 410.7 373.3 400 360 400L352 400L352 312C352 298.7 341.3 288 328 288L280 288C266.7 288 256 298.7 256 312C256 325.3 266.7 336 280 336L304 336L304 400L280 400zM320 256C337.7 256 352 241.7 352 224C352 206.3 337.7 192 320 192C302.3 192 288 206.3 288 224C288 241.7 302.3 256 320 256z"
    />
  </svg>
);

const HEX = /^#[0-9a-fA-F]{6}$/;

export interface ColorPickerProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'value' | 'defaultValue' | 'disabled'> {
  /** Visible label (Paragraph - Semi Bold). Required for accessibility — associated via htmlFor. */
  label: ReactNode;
  /** Helper text shown below the control, after the hint icon (Figma `Hint Message`). */
  hint?: string;
  /**
   * Hint icon node (16×16). Defaults to the built-in Font Awesome `circle-info`, as in Figma.
   * Pass `null` to render the hint without an icon.
   */
  hintIcon?: ReactNode;
  /** Controlled hex value (e.g. "#005499"). */
  value?: string;
  /** Uncontrolled initial hex value. */
  defaultValue?: string;
  /** Fired with the new hex string whenever the color changes (an empty string when cleared). */
  onValueChange?: (hex: string) => void;
  /**
   * Figma `End Icon`: a trailing `xmark` button that clears the value.
   * @default true
   */
  clearable?: boolean;
  /** Icon node for the clear button (16×16). Defaults to the built-in Font Awesome `xmark`. */
  clearIcon?: ReactNode;
}

/**
 * Color Picker — a colour indicator paired with a text field showing the selected hex value.
 *
 * Figma: "Color Picker" component set 5197:1404 (page 93:33), Type=Empty|Filled.
 * - Root column, gap 4px. Label: Paragraph - Semi Bold, `Color Picker/label`.
 * - Field 36px tall, padding 8px 12px, gap 8px, radius 8px (Border/Large), 1px inside stroke.
 *   Empty: `Color Picker/empty-background` + `empty-border`, placeholder `empty-text`.
 *   Filled: `Color Picker/filled-background` + `filled-stroke`, value `filled-text`. Text: Paragraph - Regular.
 * - Start icon "Color indicator" 20×20, radius 4px.
 *   Empty (Color=Transparent): Monochrome/White with a 1px Monochrome/Gray - 200 inside stroke and a
 *   red Semantic/Red - Alert/Alert diagonal slash. Filled (Color=Color picked): the picked colour, no stroke.
 * - End icon: 16×16 `xmark` clear control in Monochrome/Gray - 600 at 40% opacity.
 * - Hint row: 16px `circle-info` in `Color Picker/hint-message-icon` + Paragraph - Small in
 *   `Color Picker/hint-message`, gap 4px.
 *
 * Figma has Empty/Filled only, so there is no disabled state (`disabled` is not accepted).
 * The keyboard focus ring is not designed in Figma; it is kept.
 */
export const ColorPicker = forwardRef<HTMLInputElement, ColorPickerProps>(function ColorPicker(
  {
    label,
    hint,
    hintIcon,
    value,
    defaultValue,
    onValueChange,
    clearable = true,
    clearIcon,
    id,
    className,
    ...rest
  },
  ref,
) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const hintId = `${fieldId}-hint`;

  const isControlled = value !== undefined;
  const [internal, setInternal] = useState<string>(defaultValue ?? '');
  const current = isControlled ? value : internal;
  const hasValue = Boolean(current);
  const isValidHex = HEX.test(current ?? '');

  const update = (hex: string) => {
    if (!isControlled) setInternal(hex);
    onValueChange?.(hex);
  };

  const handleSwatch = (event: ChangeEvent<HTMLInputElement>) => {
    update(event.target.value);
  };

  const handleText = (event: ChangeEvent<HTMLInputElement>) => {
    update(event.target.value);
  };

  // The native color input requires a valid 7-char hex; it is invisible (the indicator is drawn
  // by the wrapper), so this fallback only seeds the browser's colour dialog.
  const swatchValue = isValidHex ? (current as string) : '#000000';

  const classes = [
    'sds-color-picker',
    hasValue ? 'sds-color-picker--filled' : 'sds-color-picker--empty',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Filled indicator shows the picked colour (user data, not a design colour).
  const swatchStyle: CSSProperties | undefined = isValidHex
    ? ({ ['--sds-color-picker-swatch' as string]: current } as CSSProperties)
    : undefined;

  const labelText = typeof label === 'string' ? label : 'Color';

  return (
    <div className={classes}>
      <label className="sds-color-picker__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="sds-color-picker__field">
        <span
          className={[
            'sds-color-picker__swatch',
            isValidHex ? 'sds-color-picker__swatch--picked' : 'sds-color-picker__swatch--transparent',
          ].join(' ')}
          style={swatchStyle}
        >
          <input
            ref={ref}
            id={fieldId}
            type="color"
            className="sds-color-picker__swatch-input"
            value={swatchValue}
            aria-label={`${labelText} swatch`}
            onChange={handleSwatch}
            {...rest}
          />
        </span>
        <input
          type="text"
          className="sds-color-picker__text"
          value={current ?? ''}
          placeholder="#000000"
          aria-describedby={hint ? hintId : undefined}
          onChange={handleText}
        />
        {clearable && (
          <button
            type="button"
            className="sds-color-picker__clear"
            aria-label={`Clear ${labelText}`}
            onClick={() => update('')}
          >
            <span className="sds-color-picker__clear-icon" aria-hidden="true">
              {clearIcon ?? <XmarkIcon />}
            </span>
          </button>
        )}
      </div>
      {hint && (
        <p className="sds-color-picker__hint" id={hintId}>
          {hintIcon !== null && (
            <span className="sds-color-picker__hint-icon" aria-hidden="true">
              {hintIcon ?? <CircleInfoIcon />}
            </span>
          )}
          <span className="sds-color-picker__hint-text">{hint}</span>
        </p>
      )}
    </div>
  );
});
