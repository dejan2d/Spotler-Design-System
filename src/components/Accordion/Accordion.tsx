import { forwardRef, useId, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Accordion.css';

export type AccordionVariant = 'with-background' | 'no-background';

export interface AccordionProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'onToggle'> {
  /** Header label. */
  title: ReactNode;
  /** Surface variant: filled `with-background` or `no-background` (divider stroke). */
  variant?: AccordionVariant;
  /** Optional leading icon before the title. */
  iconStart?: ReactNode;
  /** Controlled expanded state. Omit for uncontrolled. */
  expanded?: boolean;
  /** Uncontrolled initial expanded state. */
  defaultExpanded?: boolean;
  /** Called with the next expanded state when the header is toggled. */
  onToggle?: (expanded: boolean) => void;
  children?: ReactNode;
}

/**
 * Accordion — expand/collapse a content section behind a button header.
 * Spec: references/components/accordion.md. Tokens Accordion/<variant>-*.
 */
export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(function Accordion(
  {
    title,
    variant = 'with-background',
    iconStart,
    expanded,
    defaultExpanded = false,
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
        <span className="sds-accordion__heading">{title}</span>
        <span className="sds-accordion__chevron" aria-hidden="true">
          ⌄
        </span>
      </button>
      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="sds-accordion__panel"
        hidden={!isOpen}
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
