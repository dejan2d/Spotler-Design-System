import { forwardRef, useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Accordion.css';

/** Surface treatment of the accordion container. */
export type AccordionVariant = 'with-background' | 'no-background';

/** Side the chevron toggle sits on within the header row. */
export type AccordionChevronPosition = 'left' | 'right';

export interface AccordionProps
  extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onToggle'> {
  /** Header label shown in the toggle button (Figma "Heading Text", Paragraph - Regular). */
  title: ReactNode;
  /**
   * Surface variant (Figma "Background"): `no-background` = white fill with a
   * 1px bottom divider and no radius (Figma default); `with-background` =
   * Accordion/with-background-fill with a 4px radius.
   * @default 'no-background'
   */
  variant?: AccordionVariant;
  /** Side the chevron sits on (Figma "Chevron"). @default 'left' */
  chevronPosition?: AccordionChevronPosition;
  /**
   * Optional leading icon before the title (20px, Figma "Show Filter"; shown
   * in the Chevron=Right variants). Use a FontAwesome Duotone icon node.
   */
  iconStart?: ReactNode;
  /**
   * Optional custom chevron node (20px). Defaults to a CSS-drawn angle-down.
   * As in Figma, the chevron is angle-down in both states (no rotation).
   * Provide a FontAwesome Duotone icon to override.
   */
  chevron?: ReactNode;
  /** Controlled expanded state. Omit for uncontrolled. */
  expanded?: boolean;
  /** Uncontrolled initial expanded state (Figma "Expanded"). @default true */
  defaultExpanded?: boolean;
  /** Called with the next expanded state when the header is toggled. */
  onToggle?: (expanded: boolean) => void;
  children?: ReactNode;
}

/**
 * Accordion — a header button that expands/collapses a content panel for
 * progressive disclosure. Spotler Design System "Accordion" (Figma 1555:18885).
 *
 * Figma defaults: Expanded=True, Chevron=Left, Background=False.
 * Layout: 8px outer padding; header row padding 8px 4px, radius 4px, 20px icons,
 * 4px gap after the start icon and 8px between title and chevron (collapsed row
 * = 52px); panel padding 8px. Heading and paragraph: Paragraph - Regular (14px).
 * No-background: white fill, 1px bottom stroke (Accordion/no-background-stroke),
 * no radius. With-background: Accordion/with-background-fill, radius 4px.
 *
 * Header is a `button` with `aria-expanded` + `aria-controls`; the panel is a
 * region labelled by the header; `aria-expanded` conveys the state. The chevron
 * is angle-down in both states (Figma) and the panel height animates on toggle. Figma defines no hover or disabled
 * state, so there is none (the keyboard focus ring stays).
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    title,
    variant = 'no-background',
    chevronPosition = 'left',
    iconStart,
    chevron,
    expanded,
    defaultExpanded = true,
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
        onClick={handleToggle}
      >
        {iconStart && (
          <span className="sds-accordion__icon-start" aria-hidden="true">
            {iconStart}
          </span>
        )}
        <span className="sds-accordion__title-row">
          <span className="sds-accordion__heading">{title}</span>
          <span className="sds-accordion__chevron" aria-hidden="true">
            {chevron}
          </span>
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
 * AccordionGroup — vertically stacks Accordion items edge to edge
 * (Figma "Accordion group" 1578:22656: gap 0).
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
