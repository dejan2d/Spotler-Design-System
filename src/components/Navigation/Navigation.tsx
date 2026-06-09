import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Navigation.css';

/** A single first-level routing destination in the sidebar. */
export interface NavigationItem {
  /** Stable value used for selection and `onSelect`. */
  value: string;
  /** Visible label (hidden in the collapsed state). 14/20 Regular, SemiBold when selected. */
  label: ReactNode;
  /** Leading icon (20×20 FontAwesome duotone). Always visible, in both states. */
  icon?: ReactNode;
  /** Optional trailing badge (expanded state only). */
  badge?: ReactNode;
  /** Disables the item (Regular 14/20, `#9FACB3`, non-interactive). */
  disabled?: boolean;
  /**
   * Accessible label used as the collapsed-state tooltip / `aria-label` when `label`
   * is not a plain string. Recommended for any item whose `label` is a node.
   */
  ariaLabel?: string;
}

/** A group of items, optionally headed by a section label (e.g. CRM "SALES"). */
export interface NavigationSection {
  /** Optional section heading (SemiBold 14/28, `#E7ECED`). Shown in the expanded state only. */
  label?: ReactNode;
  /** Items in this section. */
  items: NavigationItem[];
}

export interface NavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Grouped nav items. Consecutive sections are separated by a hairline divider. */
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
  /** Bottom profile-footer content (company / user / logout). Sits on the `#001D34` band. */
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
 * Sizing: expanded 220px / collapsed 60px; items 52px tall, radius 4px
 * (padding 12px 8px 12px 16px expanded, 12px 8px collapsed); icon 20×20;
 * logo area 96px; collapse toggle 32×32 round.
 * States (per item): Default, Hover, Selected, Focused, Disabled.
 * The active item always shows the Selected state (`#005499`).
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
            {sectionIndex > 0 && (
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
                  item.disabled && 'sds-navigation__item--disabled',
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
