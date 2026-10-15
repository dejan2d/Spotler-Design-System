import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from 'react';
import './ActionChip.css';

export interface ActionChipProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Chip label (Figma `Text`, default "Actionable"). Text style Paragraph - Small. */
  children?: ReactNode;
  /**
   * Optional leading icon (Figma `Icon - Leading` + `Lead/Change`): a 16×16 Font Awesome
   * Duotone Regular node, e.g. `face-smile`. Decorative (aria-hidden). Coloured with the
   * Action Chip/<state>-icon token.
   */
  iconStart?: ReactNode;
  /**
   * Selected state (Figma `State=Selected`): selected background and stroke, label in
   * Paragraph - Small - Semi Bold. When the prop is set (`true` or `false`) the chip is a
   * toggle and exposes `aria-pressed`; leave it `undefined` for a plain action chip.
   */
  selected?: boolean;
  /**
   * Optional trailing action icon (Figma `Action` + the "Chip Action Icon" `Icon` swap,
   * 16×16, e.g. `xmark`). Never hardcoded here — pass the icon node.
   * - With `onAction`: rendered as its own button (e.g. "remove this filter"), with the
   *   Chip Action Icon `Hover` variant (Gray - 200 background, 4px radius) on hover.
   * - Without `onAction`: decorative part of the chip button; the chip's own `onClick`
   *   performs the action.
   */
  actionIcon?: ReactNode;
  /** Handler for the separate trailing action button. Requires `actionIcon`. */
  onAction?: MouseEventHandler<HTMLButtonElement>;
  /** Accessible name of the trailing action button. @default 'Remove' */
  actionLabel?: string;
}

/**
 * Action Chip — Spotler Design System (Figma "Action Chip", set 9359:1554,
 * page "Chips & Badges" 29:4).
 *
 * An interactive chip for selections, filters and removable items (e.g. "Country: NL").
 * The pointer cursor communicates clickability. Not for primary actions or navigation.
 *
 * Figma spec (every state): row, 24px tall (fixed), hugs its content, padding 4px 8px,
 * gap 8px, radius 8px (Corner radius/large), items centered; 1px INSIDE stroke (drawn as an
 * inset box-shadow so it never changes the size). Leading icon 16px, label
 * Paragraph - Small (Semi Bold when Selected), trailing action icon 16px.
 * - Default (9359:1430): Action Chip/rest-background, rest-stroke, rest-text, rest-icon.
 * - Hover (9359:1555): Action Chip/hover-*.
 * - Selected (9359:1575): Action Chip/selected-*, label Paragraph - Small - Semi Bold.
 * - Focused (9359:1595): Action Chip/focused-background + focused-border — applied on
 *   keyboard focus (`:focus-visible`) of the chip button.
 * - Disabled (9359:1609): Disabled/background, Disabled/stroke, Disabled/text,
 *   Disabled/icon; does not respond to hover, focus or selection.
 * The trailing action icon ("Chip Action Icon", set 9376:2129) is bound to
 * Monochrome/Gray - 1000 (Disabled/icon when disabled); its `Hover` variant (9376:2130)
 * adds a Monochrome/Gray - 200 background with a 4px radius.
 *
 * State combinations Figma does not draw: a selected chip keeps its selected look on
 * hover, and on keyboard focus keeps the selected background with the focused border.
 *
 * DOM: a `<span class="sds-action-chip">` box (receives `className` and `style`) holding
 * the chip `<button>` (receives `ref`, `onClick`, `aria-*` and all other props) and, when
 * `onAction` is set, a second `<button>` for the trailing action — buttons cannot nest.
 */
export const ActionChip = forwardRef<HTMLButtonElement, ActionChipProps>(function ActionChip(
  {
    iconStart,
    selected,
    actionIcon,
    onAction,
    actionLabel = 'Remove',
    disabled,
    className,
    style,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const hasActionButton = Boolean(actionIcon && onAction);

  const classes = [
    'sds-action-chip',
    selected && 'sds-action-chip--selected',
    disabled && 'sds-action-chip--disabled',
    hasActionButton && 'sds-action-chip--with-action',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span className={classes} style={style}>
      <button
        ref={ref}
        type={type}
        className="sds-action-chip__button"
        disabled={disabled}
        aria-pressed={selected}
        {...rest}
      >
        {iconStart && (
          <span className="sds-action-chip__icon" aria-hidden="true">
            {iconStart}
          </span>
        )}
        {children && <span className="sds-action-chip__label">{children}</span>}
        {actionIcon && !hasActionButton && (
          <span className="sds-action-chip__action" aria-hidden="true">
            {actionIcon}
          </span>
        )}
      </button>
      {hasActionButton && (
        <button
          type="button"
          className="sds-action-chip__action sds-action-chip__action--button"
          aria-label={actionLabel}
          disabled={disabled}
          onClick={onAction}
        >
          <span className="sds-action-chip__action-icon" aria-hidden="true">
            {actionIcon}
          </span>
        </button>
      )}
    </span>
  );
});
