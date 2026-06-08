import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode, MouseEventHandler } from 'react';
import './ActionCard.css';

export interface ActionCardItem {
  /** Stable key for the row. */
  id: string;
  /** Leading 20px glyph rendered inside the 40x40 tile. */
  icon?: ReactNode;
  /** Item title — Body/Paragraph - Semi Bold (or Small Semi Bold when `compact`). */
  label: ReactNode;
  /** Supporting description — Body/Paragraph - Regular. */
  description?: ReactNode;
  /** Where the row navigates to. When set the row renders as an anchor. */
  href?: string;
  /** Click handler — the whole row is the target. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Render the row in the compact (stacked) style with the smaller title. */
  compact?: boolean;
  /**
   * Trailing affordance node. A decorative chevron is rendered by default.
   * Pass a real Button here only for non-navigable rows (the row won't be the target then).
   */
  trailing?: ReactNode;
  /** When true, the row is not itself interactive (use when `trailing` is a real Button). */
  nonInteractive?: boolean;
}

export interface ActionCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Group heading — H4. */
  title?: ReactNode;
  /** Internal action items. */
  items?: ActionCardItem[];
  children?: ReactNode;
}

const Chevron = () => (
  <span className="sds-action-card__chevron" aria-hidden="true">
    ›
  </span>
);

/**
 * Action Card — groups navigable internal action items under a title.
 * Spec: kit/guidelines/components/action-card.md. Outer card radius Border/Large (8px),
 * padding 24px 32px, resting Drop Shadow/50. Tokens: `--diagrams-action-card-*` + `--cards-action-*`.
 */
export const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(function ActionCard(
  { title, items = [], className, children, ...rest },
  ref,
) {
  const classes = ['sds-action-card', className].filter(Boolean).join(' ');

  return (
    <div ref={ref} className={classes} {...rest}>
      {title && <h4 className="sds-action-card__heading">{title}</h4>}

      {items.map((item) => {
        const itemClasses = [
          'sds-action-card__item',
          item.compact && 'sds-action-card__item--compact',
          item.nonInteractive && 'sds-action-card__item--static',
        ]
          .filter(Boolean)
          .join(' ');

        const body = (
          <>
            {item.icon && (
              <span className="sds-action-card__item-icon" aria-hidden="true">
                {item.icon}
              </span>
            )}
            <span className="sds-action-card__item-body">
              <span className="sds-action-card__item-label">{item.label}</span>
              {item.description && (
                <span className="sds-action-card__item-description">{item.description}</span>
              )}
            </span>
            <span className="sds-action-card__item-trailing">
              {item.trailing ?? (!item.nonInteractive && <Chevron />)}
            </span>
          </>
        );

        if (item.nonInteractive) {
          return (
            <div key={item.id} className={itemClasses}>
              {body}
            </div>
          );
        }

        if (item.href) {
          return (
            <a key={item.id} className={itemClasses} href={item.href} onClick={item.onClick}>
              {body}
            </a>
          );
        }

        return (
          <button key={item.id} type="button" className={itemClasses} onClick={item.onClick}>
            {body}
          </button>
        );
      })}

      {children}
    </div>
  );
});
