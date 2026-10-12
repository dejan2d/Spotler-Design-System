import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Navigation.css';

/** A single first-level routing destination in the sidebar. */
export interface NavigationItem {
  /** Stable value used for selection and `onSelect`. */
  value: string;
  /** Visible label (hidden in the collapsed state). Paragraph - Regular; Paragraph - Semi Bold when selected or focused. */
  label: ReactNode;
  /** Leading icon (20×20 FontAwesome duotone). Always visible, in both states. */
  icon?: ReactNode;
  /** Optional trailing badge (expanded state only). */
  badge?: ReactNode;
  /** Disables the item (Paragraph - Regular, Disabled/text + Disabled/icon, non-interactive). */
  disabled?: boolean;
  /**
   * Accessible label used as the collapsed-state tooltip / `aria-label` when `label`
   * is not a plain string. Recommended for any item whose `label` is a node.
   */
  ariaLabel?: string;
}

/** A group of items, optionally headed by a section label (e.g. CRM "SALES"). */
export interface NavigationSection {
  /**
   * Optional section heading (Figma CRM Left Navigation: H4, Monochrome/Gray - 200,
   * padding 0 16px). Shown in the expanded state only; when collapsed, a divider
   * takes its place.
   */
  label?: ReactNode;
  /** Items in this section. */
  items: NavigationItem[];
}

export interface NavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /**
   * Grouped nav items. Consecutive sections are separated by a 1px divider
   * (Monochrome/Gray - 600) — except in the expanded state when the section has a
   * label, where the label separates it (as in the Figma CRM navigation).
   */
  sections: NavigationSection[];
  /** Value of the currently selected (active) item. Renders the Selected state. */
  value: string;
  /** Fired with the selected item's `value`. Not fired for disabled items. */
  onSelect: (value: string) => void;
  /**
   * Collapsed (60px, icons only) vs expanded (220px, icon + label).
   * @default false
   */
  collapsed?: boolean;
  /** Top area content (product logo / grid switcher). Sits in the 96px logo area. */
  header?: ReactNode;
  /**
   * Fires when the built-in collapse toggle is pressed. When provided, a 32×32
   * round toggle button (`fa-chevron-left`) is rendered in the header area.
   */
  onToggleCollapse?: () => void;
  /** Icon for the collapse toggle (e.g. `fa-chevron-left`). Required visual when `onToggleCollapse` is set. */
  toggleIcon?: ReactNode;
  /** Accessible label for the collapse toggle. @default 'Collapse navigation' / 'Expand navigation' */
  toggleLabel?: string;
  /**
   * Bottom profile-footer content (company / user / logout). Sits on the
   * Navigation/Expanded Menu/background band; text is Navigation/Expanded Menu/text
   * (#FFFFFF), centred, 4px apart — as in the Figma Profile component.
   */
  footer?: ReactNode;
  /** Accessible name for the landmark. @default 'Primary' */
  'aria-label'?: string;
}

/**
 * Navigation — Spotler Design System.
 *
 * Left-side primary navigation shared across Spotler products (Activate, CRM, Engage).
 * Provides first-level routing between major product sections.
 *
 * Figma (page "Navigation": Navigation Item 4228:9237, Spotler Activate / CRM /
 * Engage Left Navigation, Profile 1887:56096):
 * - Sidebar: expanded 220px / collapsed 60px, Rest/Knowledge/Knowledge - Info.
 * - Logo area 96px (padding 20px 0, row padding-left 16px, gap 12px); collapse
 *   toggle 32×32 round, hanging 13px past the sidebar edge when expanded.
 * - Items area padding 0 8px; items stack with no gap; dividers take no space.
 * - Item: 52px, radius 4px, padding 12px 8px 12px 16px (Large) / 12px 8px (Small),
 *   icon-label gap 12px, 20×20 icon, Paragraph - Regular.
 * - States: Default, Hover, Selected (Semi Bold), Focused (1px white stroke,
 *   Semi Bold, selected text/icon colours), Disabled (Disabled/text, Disabled/icon).
 * - Section labels (CRM): H4, Monochrome/Gray - 200, padding 0 16px.
 * The active item always shows the Selected state.
 *
 * Not built: the Figma Profile component (Opened/Closed menu with My Profile /
 * Settings / Academy and logout) — compose it in the `footer` slot.
 */
export const Navigation = forwardRef<HTMLElement, NavigationProps>(function Navigation(
  {
    sections,
    value,
    onSelect,
    collapsed = false,
    header,
    onToggleCollapse,
    toggleIcon,
    toggleLabel,
    footer,
    className,
    'aria-label': ariaLabel = 'Primary',
    ...rest
  },
  ref,
) {
  const classes = [
    'sds-navigation',
    collapsed ? 'sds-navigation--collapsed' : 'sds-navigation--expanded',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const resolvedToggleLabel =
    toggleLabel ?? (collapsed ? 'Expand navigation' : 'Collapse navigation');

  const showHeader = Boolean(header) || Boolean(onToggleCollapse);

  return (
    <nav ref={ref} className={classes} aria-label={ariaLabel} {...rest}>
      {showHeader && (
        <div className="sds-navigation__header">
          {header && <div className="sds-navigation__brand">{header}</div>}
          {onToggleCollapse && (
            <button
              type="button"
              className="sds-navigation__toggle"
              aria-label={resolvedToggleLabel}
              aria-expanded={!collapsed}
              title={resolvedToggleLabel}
              onClick={onToggleCollapse}
            >
              <span className="sds-navigation__toggle-icon" aria-hidden="true">
                {toggleIcon}
              </span>
            </button>
          )}
        </div>
      )}

      <ul className="sds-navigation__items">
        {sections.map((section, sectionIndex) => (
          <li key={sectionIndex} className="sds-navigation__section">
            {/* Figma: CRM expanded separates sections with labels only; collapsed
                (and label-less sections) use a divider. */}
            {sectionIndex > 0 && (collapsed || !section.label) && (
              <span className="sds-navigation__divider" role="separator" aria-hidden="true" />
            )}
            {section.label && !collapsed && (
              <span className="sds-navigation__section-label">{section.label}</span>
            )}
            <ul className="sds-navigation__section-items">
              {section.items.map((item) => {
                const selected = item.value === value;
                const accessibleName =
                  item.ariaLabel ?? (typeof item.label === 'string' ? item.label : undefined);
                const itemClasses = [
                  'sds-navigation__item',
                  selected && 'sds-navigation__item--selected',
                ]
                  .filter(Boolean)
                  .join(' ');

                return (
                  <li key={item.value} className="sds-navigation__list-item">
                    <button
                      type="button"
                      className={itemClasses}
                      aria-current={selected ? 'page' : undefined}
                      // Keep the item discoverable for assistive tech while blocking activation.
                      disabled={item.disabled}
                      aria-disabled={item.disabled || undefined}
                      // In the collapsed state labels are hidden, so expose the name via aria-label + tooltip.
                      aria-label={collapsed ? accessibleName : undefined}
                      title={collapsed ? accessibleName : undefined}
                      onClick={() => {
                        if (!item.disabled) onSelect(item.value);
                      }}
                    >
                      {item.icon && (
                        <span className="sds-navigation__icon" aria-hidden="true">
                          {item.icon}
                        </span>
                      )}
                      {!collapsed && (
                        <span className="sds-navigation__label">{item.label}</span>
                      )}
                      {!collapsed && item.badge && (
                        <span className="sds-navigation__badge">{item.badge}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>

      {footer && <div className="sds-navigation__footer">{footer}</div>}
    </nav>
  );
});
