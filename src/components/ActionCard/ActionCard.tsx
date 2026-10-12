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
   * Leading 20px glyph rendered inside the 36x36 tile (FontAwesome Duotone in real use,
   * e.g. `tickets`). Omit to render the row with no leading tile. Figma "Icon Instance".
   */
  icon?: ReactNode;
  /**
   * Item title — Body/Paragraph - Semi Bold, `Diagrams/Action Card/internal-area-h2`.
   * Figma "Title Text".
   */
  label: ReactNode;
  /** Supporting description — Body/Paragraph - Regular, `internal-area-body-text`. Figma "Body Text". */
  description?: ReactNode;
  /** Where the row navigates to. When set the row renders as an anchor. */
  href?: string;
  /** Click handler — the whole row is the target. */
  onClick?: MouseEventHandler<HTMLElement>;
  /**
   * Trailing affordance:
   * - `'chevron'` (default) — decorative `angle-right` drawn as a Tertiary Icon Button
   *   (36x36, circular, `Icon Button/Tertiary/default-icon`); the row is the target.
   *   Figma "Icon Button" on.
   * - `'button'` — pass a real Button via `trailing`; the row is made non-interactive.
   *   Figma "Button" on.
   * - `'none'` — no trailing affordance (Figma "Icon Button" and "Button" off).
   */
  trailingKind?: ActionCardTrailing;
  /**
   * Node for the trailing affordance.
   * - With `trailingKind="chevron"` this overrides the default 20px glyph inside the
   *   36x36 Tertiary Icon Button box (pass a FontAwesome Duotone node).
   * - With `trailingKind="button"` pass the actual Button/CTA element.
   */
  trailing?: ReactNode;
}

// `title` is re-typed as a ReactNode heading, so omit the native string `title` attribute
// from the base to avoid the incompatible-override error (TS2430).
export interface ActionCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /**
   * Card title — Title Headings/H4, `Diagrams/Action Card/heading`. Figma "Title Text";
   * omit to hide it (Figma "Title" off). Rendered as an `<h2>` by default; override with
   * `headingLevel`.
   */
  title?: ReactNode;
  /** Semantic heading level for the group title. Defaults to `2`. */
  headingLevel?: 2 | 3 | 4 | 5 | 6;
  /**
   * Internal action rows ("Action card - internal Area" instances), stacked 8px apart.
   * Every row uses the same Figma row style.
   */
  items?: ActionCardItem[];
  /** Content rendered after the rows — Figma "Instance Swap" (Instance stack slot). */
  children?: ReactNode;
}

/**
 * Default glyph for a `chevron` row: Font Awesome Pro 7.1.0 Duotone Regular `angle-right`
 * (src/icons/duotone-regular/angle-right.svg), the icon Figma places in the trailing
 * Tertiary Icon Button.
 */
const AngleRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 640 640" focusable="false" aria-hidden="true">
    <path
      fill="currentColor"
      d="M433.5 303C442.9 312.4 442.9 327.6 433.5 336.9L273.5 497C264.1 506.4 248.9 506.4 239.6 497C230.3 487.6 230.2 472.4 239.6 463.1L382.6 320.1L239.6 177.1C230.2 167.7 230.2 152.5 239.6 143.2C249 133.9 264.2 133.8 273.5 143.2L433.5 303.2z"
    />
  </svg>
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
          {kind === 'chevron' ? (
            // Decorative Tertiary Icon Button look — not a nested control, the row is the target.
            <span className="sds-action-card__chevron" aria-hidden="true">
              {item.trailing ?? <AngleRightIcon />}
            </span>
          ) : (
            item.trailing
          )}
        </span>
      )}
    </>
  );
}

/**
 * Action Card — groups one or more navigable internal action items under an H4 title.
 *
 * Figma spec ("Action Card" 3352:20493 + "Action card - internal Area" 3352:17425):
 * - Card: vertical, padding 24px 32px, gap 8px, radius Border/Large (8px), 1px inside
 *   stroke `Diagrams/Action Card/stroke`, fill `Diagrams/Action Card/background`,
 *   effect style Drop Shadow/100. Title: Title Headings/H4, `Diagrams/Action Card/heading`.
 * - Row: horizontal, padding 12px 16px, gap 8px, radius Border/Large (8px), 1px stroke
 *   `internal-area-stroke`, fill `internal-area-background`, Drop Shadow/100.
 * - Leading tile: 36x36, padding 8px, radius Border/Small (4px), 1px `Monochrome/White`
 *   stroke, fill `internal-area-icon-start-background`, 20px glyph `internal-area-icon-start`.
 * - Text: vertical, gap 4px — title Paragraph - Semi Bold (`internal-area-h2`), body
 *   Paragraph - Regular (`internal-area-body-text`).
 * - Trailing: Tertiary Icon Button, 36x36 circular, 20px `angle-right`
 *   (`Icon Button/Tertiary/default-icon`).
 *
 * Figma has a single Action Card layout with no variants: optional title, one or more
 * internal rows (each with optional icon, title, body and trailing Icon Button or Button),
 * then an optional slot (`children`).
 *
 * Figma defines no row states (no hover). The keyboard focus ring (`:focus-visible`,
 * `--cards-product-specific-focus-stroke`) is the one code-only state, kept for accessibility.
 *
 * Tokens: `--diagrams-action-card-*` + `--icon-button-tertiary-default-icon` +
 * `--cards-product-specific-focus-stroke` + foundations.
 */
export const ActionCard = forwardRef<HTMLDivElement, ActionCardProps>(function ActionCard(
  { title, headingLevel = 2, items = [], className, children, ...rest },
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

      {children}
    </div>
  );
});
