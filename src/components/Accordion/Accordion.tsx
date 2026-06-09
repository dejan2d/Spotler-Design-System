import { forwardRef, useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Accordion.css';

/** Surface treatment of the accordion container. */
export type AccordionVariant = 'with-background' | 'no-background';

/** Side the chevron toggle sits on within the header row. */
export type AccordionChevronPosition = 'left' | 'right';

export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onToggle'> {
  /** Header label shown in the toggle button. */
  title: ReactNode;
  /** Surface variant: filled `with-background` or `no-background` (divider stroke). */
  variant?: AccordionVariant;
  /** Side the chevron sits on: `right` (default) or `left`. */
  chevronPosition?: AccordionChevronPosition;
  /** Optional leading icon before the title (20px). Use a FontAwesome Duotone icon node. */
  iconStart?: ReactNode;
  /**
   * Optional custom chevron node (20px). Defaults to a CSS-drawn chevron that
   * rotates 180° when expanded. Provide a FontAwesome Duotone icon to override.
   */
  chevron?: ReactNode;
  /** Controlled expanded state. Omit for uncontrolled. */
  expanded?: boolean;
  /** Uncontrolled initial expanded state. */
  defaultExpanded?: boolean;
  /** Disables the header toggle and dims the item. */
  disabled?: boolean;
  /** Called with the next expanded state when the header is toggled. */
  onToggle?: (expanded: boolean) => void;
  children?: ReactNode;
}

/**
 * Accordion — a header button that expands/collapses a content panel for
 * progressive disclosure. Spotler Design System "Accordion".
 *
 * Header padding 12px 16px, content padding 4px 16px 16px, radius 4px
 * (--border-small), 1px hairline divider/stroke from the foundation. Header is
 * a `button` with `aria-expanded` + `aria-controls`; the panel is a region
 * labelled by the header. Chevron rotates 180° as a non-color state cue and the
 * panel height animates on toggle.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    title,
    variant = 'with-background',
    chevronPosition = 'right',
    iconStart,
    chevron,
    expanded,
    defaultExpanded = false,
    disabled = false,
    onToggle,
    className,
    children,
    ...rest
  },
  ref,
) {
  const reactId = useId();
  const headerId = `${reactId}-header`;
  const panelId = `${reactId}-panel`;

  const isControlled = expanded !== undefined;
  const [internal, setInternal] = useState(defaultExpanded);
  const isOpen = isControlled ? expanded : internal;

  const handleToggle = () => {
    const next = !isOpen;
    if (!isControlled) setInternal(next);
    onToggle?.(next);
  };

  const classes = [
    'sds-accordion',
    `sds-accordion--${variant}`,
    `sds-accordion--chevron-${chevronPosition}`,
    isOpen && 'sds-accordion--expanded',
    disabled && 'sds-accordion--disabled',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} {...rest}>
      <button
        type="button"
        id={headerId}
        className="sds-accordion__header"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-disabled={disabled || undefined}
        disabled={disabled}
        onClick={handleToggle}
      >
        {iconStart && (
          <span className="sds-accordion__icon-start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        <span className="sds-accordion__heading">{title}</span>
        <span className="sds-accordion__chevron" aria-hidden="true">
          {chevron}
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="sds-accordion__panel"
        // Collapsed content stays in the DOM so its height can animate; it is
        // hidden from assistive tech (and CSS removes it from the tab order).
        aria-hidden={!isOpen || undefined}
      >
        <div className="sds-accordion__content">{children}</div>
      </div>
    </div>
  );
});

export interface AccordionGroupProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
}

/**
 * AccordionGroup — vertically stacks Accordion items with consistent spacing.
 */
export const AccordionGroup = forwardRef<HTMLDivElement, AccordionGroupProps>(
  function AccordionGroup({ className, children, ...rest }, ref) {
    const classes = ['sds-accordion-group', className].filter(Boolean).join(' ');
    return (
      <div ref={ref} className={classes} {...rest}>
        {children}
      </div>
    );
  },
);
