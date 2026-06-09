import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode, MouseEventHandler, AnchorHTMLAttributes } from 'react';
import './ActionCard.css';

/**
 * The trailing affordance kind for an internal action row.
 *
 * - `chevron` — a decorative `angle-right` glyph (default). The whole row is the target.
 * - `button` — a real Button/CTA you pass via `item.trailing`. The row becomes non-interactive
 *   so there are not two competing targets (per the Action Card accessibility spec).
 * - `none` — no trailing affordance.
 */
export type ActionCardTrailing = 'chevron' | 'button' | 'none';

export interface ActionCardItem {
  /** Stable key for the row. */
  id: string;
  /**
   * Leading 20px glyph rendered inside the 40x40 tile (FontAwesome Duotone in real use,
   * e.g. `tickets`). Omit to render the row with no leading tile.
   */
  icon?: ReactNode;
  /** Item title — Body/Paragraph - Semi Bold (or Small - Semi Bold when `compact`). */
  label: ReactNode;
  /** Supporting description — Body/Paragraph - Regular. */
  description?: ReactNode;
  /** Where the row navigates to. When set the row renders as an anchor. */
  href?: string;
  /** Click handler — the whole row is the target. */
  onClick?: MouseEventHandler<HTMLElement>;
  /** Render the row in the compact (stacked) style with the smaller 12/16 title. */
  compact?: boolean;
  /**
   * Trailing affordance:
   * - `'chevron'` (default) — decorative `angle-right`, row is the target.
   * - `'button'` — pass a real Button via `trailing`; the row is made non-interactive.
   * - `'none'` — no trailing affordance.
   */
  trailingKind?: ActionCardTrailing;
  /**
   * Node for the trailing affordance.
   * - With `trailingKind="chevron"` this overrides the default chevron glyph (pass the
   *   FontAwesome `angle-right` Duotone node).
   * - With `trailingKind="button"` pass the actual Button/CTA element.
   */
  trailing?: ReactNode;
}

export interface ActionCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Group heading — H4. Rendered as an `<h2>` styled to H4 by default; override with `headingLevel`. */
  title?: ReactNode;
  /** Semantic heading level for the group title. Defaults to `2`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /** Internal action items. */
  items?: ActionCardItem[];
  /**
   * Full-width CTA for the "Header + CTA only" variant — a single action for the whole card,
   * rendered below the title with no internal item. Pass a Button element.
   */
  cta?: ReactNode;
  /** Escape hatch for bespoke content rendered after the items / CTA. */
  children?: ReactNode;
}

/** Default decorative chevron when no `trailing` node is supplied for a `chevron` row. */
const DefaultChevron = () => (
  <span className="sds-action-card__chevron" aria-hidden="true">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" focusable="false">
      <path
        d="M7.5 4.5L13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </span>
);

interface ActionCardRowProps {
  item: ActionCardItem;
}

/** Renders the inner content shared by every row regardless of element. */
function RowBody({ item }: ActionCardRowProps) {
  const kind: ActionCardTrailing = item.trailingKind ?? 'chevron';
  const describedById = item.description ? `${item.id}-desc` : undefined;

  return (
    <>
      {item.icon && (
        <span className="sds-action-card__item-icon" aria-hidden="true">
          {item.icon}
        </span>
      )}
      <span className="sds-action-card__item-body">
        <span className="sds-action-card__item-label">{item.label}</span>
        {item.description && (
          <span className="sds-action-card__item-description" id={describedById}>
            {item.description}
          </span>
        )}
      </span>
      {kind !== 'none' && (
        <span className="sds-action-card__item-trailing">
          {kind === 'chevron' ? item.trailing ?? <DefaultChevron /> : item.trailing}
        </span>
      )}
    </>
  );
}

/**
 * Action Card — groups one or more navigable internal action items under an H4 title.
 *
 * Spec: Spotler "Action Card". Outer card padding 24px 32px, internal gap 8px,
 * radius Border/Large (8px), 1px stroke, resting Drop Shadow/50. Internal row padding
 * 12px 16px, gap 10px, radius Border/Large (8px). Leading tile 40x40, padding 10px,
 * radius Border/Small (4px), 20px glyph.
 *
 * Variants (driven by props, not a single union):
 * - Single item — one row with a trailing chevron Icon Button affordance.
 * - Single item + Button — one row whose `trailingKind="button"` carries a real CTA (row non-interactive).
 * - Stacked items — a primary row plus `compact` rows using the smaller 12/16 title.
 * - Header + CTA only — `title` + `cta` (full-width Button) with no internal item.
 *
 * Tokens: `--diagrams-action-card-*` + `--cards-product-specific-*` + foundations.
 */
export const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(function ActionCard(
  { title, headingLevel = 2, items = [], cta, className, children, ...rest },
  ref,
) {
  const classes = ['sds-action-card', className].filter(Boolean).join(' ');
  const Heading = `h${headingLevel}` as const;

  return (
    <div ref={ref} className={classes} {...rest}>
      {title && <Heading className="sds-action-card__heading">{title}</Heading>}

      {items.length > 0 && (
        <ul className="sds-action-card__items">
          {items.map((item) => {
            const kind: ActionCardTrailing = item.trailingKind ?? 'chevron';
            const interactive = kind !== 'button';
            const describedBy = item.description ? `${item.id}-desc` : undefined;

            const itemClasses = [
              'sds-action-card__item',
              item.compact && 'sds-action-card__item--compact',
              !interactive && 'sds-action-card__item--static',
            ]
              .filter(Boolean)
              .join(' ');

            let control: ReactNode;
            if (!interactive) {
              // A real Button is the action — keep the row itself non-interactive.
              control = (
                <div className={itemClasses}>
                  <RowBody item={item} />
                </div>
              );
            } else if (item.href) {
              const anchorProps: AnchorHTMLAttributes<HTMLAnchorElement> = {
                className: itemClasses,
                href: item.href,
                onClick: item.onClick,
                'aria-describedby': describedBy,
              };
              control = (
                <a {...anchorProps}>
                  <RowBody item={item} />
                </a>
              );
            } else {
              control = (
                <button
                  type="button"
                  className={itemClasses}
                  onClick={item.onClick}
                  aria-describedby={describedBy}
                >
                  <RowBody item={item} />
                </button>
              );
            }

            return (
              <li key={item.id} className="sds-action-card__item-wrap">
                {control}
              </li>
            );
          })}
        </ul>
      )}

      {cta && <div className="sds-action-card__cta">{cta}</div>}

      {children}
    </div>
  );
});
