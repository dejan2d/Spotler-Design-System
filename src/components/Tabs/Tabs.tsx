import { forwardRef, useId, useRef } from 'react';
import type { HTMLAttributes, ReactNode, KeyboardEvent } from 'react';
import './Tabs.css';

export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabItem {
  /** Stable value used for selection and onChange. */
  value: string;
  /** Visible tab label. */
  label: ReactNode;
  /** Optional leading icon (20px). */
  icon?: ReactNode;
  /** Disables this tab. */
  disabled?: boolean;
}

export interface TabsProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  /** The tabs to render. One panel is shown at a time. */
  tabs: TabItem[];
  /** The value of the currently selected tab. One tab is always selected. */
  value: string;
  /** Fired with the newly selected tab value. */
  onChange: (value: string) => void;
  /** Layout direction. */
  orientation?: TabsOrientation;
  /** Content of the active panel. Rendered in the tabpanel region. */
  children?: ReactNode;
}

/**
 * Tabs — switch between peer views within the same context, showing one panel at a time.
 * Spec: references/components/tabs.md. Roving tabindex + arrow-key navigation.
 */
export const Tabs = forwardRef<HTMLDivElement, TabsProps>(function Tabs(
  { tabs, value, onChange, orientation = 'horizontal', className, children, ...rest },
  ref,
) {
  const baseId = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const classes = ['sds-tabs', `sds-tabs--${orientation}`, className]
    .filter(Boolean)
    .join(' ');

  const enabledIndexes = tabs
    .map((tab, i) => (tab.disabled ? -1 : i))
    .filter((i) => i >= 0);

  const focusTab = (index: number) => {
    const el = tabRefs.current[index];
    if (el) {
      el.focus();
      onChange(tabs[index].value);
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, currentIndex: number) => {
    const nextKey = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft';
    const pos = enabledIndexes.indexOf(currentIndex);

    if (event.key === nextKey) {
      event.preventDefault();
      focusTab(enabledIndexes[(pos + 1) % enabledIndexes.length]);
    } else if (event.key === prevKey) {
      event.preventDefault();
      focusTab(enabledIndexes[(pos - 1 + enabledIndexes.length) % enabledIndexes.length]);
    } else if (event.key === 'Home') {
      event.preventDefault();
      focusTab(enabledIndexes[0]);
    } else if (event.key === 'End') {
      event.preventDefault();
      focusTab(enabledIndexes[enabledIndexes.length - 1]);
    }
  };

  return (
    <div ref={ref} className={classes} {...rest}>
      <div
        className="sds-tabs__list"
        role="tablist"
        aria-orientation={orientation}
      >
        {tabs.map((tab, index) => {
          const selected = tab.value === value;
          return (
            <button
              key={tab.value}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.value}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel-${tab.value}`}
              tabIndex={selected ? 0 : -1}
              disabled={tab.disabled}
              aria-disabled={tab.disabled || undefined}
              className={[
                'sds-tabs__tab',
                selected && 'sds-tabs__tab--selected',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => !tab.disabled && onChange(tab.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
            >
              {tab.icon && (
                <span className="sds-tabs__icon" aria-hidden="true">
                  {tab.icon}
                </span>
              )}
              <span className="sds-tabs__label">{tab.label}</span>
            </button>
          );
        })}
      </div>
      <div
        className="sds-tabs__panel"
        role="tabpanel"
        id={`${baseId}-panel-${value}`}
        aria-labelledby={`${baseId}-tab-${value}`}
        tabIndex={0}
      >
        {children}
      </div>
    </div>
  );
});
