import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Navigation.css';

export interface NavigationItem {
  /** Stable value used for selection and onSelect. */
  value: string;
  /** Visible label (hidden when collapsed). */
  label: ReactNode;
  /** Leading icon (20px duotone). Always visible. */
  icon?: ReactNode;
  /** Optional trailing badge. */
  badge?: ReactNode;
  /** Disables the item. */
  disabled?: boolean;
}

export interface NavigationSection {
  /** Optional section heading (shown in expanded state only). */
  label?: ReactNode;
  /** Items in this section. */
  items: NavigationItem[];
}

export interface NavigationProps extends Omit<HTMLAttributes<HTMLElement>, 'onSelect'> {
  /** Grouped nav items. Sections are separated by a divider. */
  sections: NavigationSection[];
  /** Value of the currently selected item. */
  value: string;
  /** Fired with the selected item value. */
  onSelect: (value: string) => void;
  /** Collapsed (60px, icons only) vs expanded (220px). */
  collapsed?: boolean;
  /** Top area content (logo / grid switcher / collapse button). */
  header?: ReactNode;
  /** Bottom profile footer content. */
  footer?: ReactNode;
}

/**
 * Navigation — left-side primary navigation. Expanded (220px) / collapsed (60px).
 * Spec: references/components/navigation.md.
 */
export const Navigation = forwardRef<HTMLElement, NavigationProps>(function Navigation(
  { sections, value, onSelect, collapsed = false, header, footer, className, ...rest },
  ref,
) {
  const classes = [
    'sds-navigation',
    collapsed ? 'sds-navigation--collapsed' : 'sds-navigation--expanded',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <nav ref={ref} className={classes} aria-label="Primary" {...rest}>
      {header && <div className="sds-navigation__header">{header}</div>}

      <ul className="sds-navigation__items">
        {sections.map((section, sectionIndex) => (
          <li key={sectionIndex} className="sds-navigation__section">
            {sectionIndex > 0 && (
              <span className="sds-navigation__divider" aria-hidden="true" />
            )}
            {section.label && !collapsed && (
              <span className="sds-navigation__section-label">{section.label}</span>
            )}
            <ul className="sds-navigation__section-items">
              {section.items.map((item) => {
                const selected = item.value === value;
                return (
                  <li key={item.value}>
                    <button
                      type="button"
                      className={[
                        'sds-navigation__item',
                        selected && 'sds-navigation__item--selected',
                      ]
                        .filter(Boolean)
                        .join(' ')}
                      aria-current={selected ? 'page' : undefined}
                      disabled={item.disabled}
                      aria-disabled={item.disabled || undefined}
                      title={collapsed && typeof item.label === 'string' ? item.label : undefined}
                      onClick={() => !item.disabled && onSelect(item.value)}
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
