import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  /** Visible label for the segment. */
  label: ReactNode;
  /** Destination. Omit on the last (current) segment to render plain text. */
  href?: string;
}

export interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  /** Ordered trail from root to current page. The last item is the current location. */
  items: BreadcrumbItem[];
  /**
   * Separator between segments. Decorative (aria-hidden). Defaults to a slash.
   * Pass a FontAwesome Duotone chevron node to match Figma if required.
   */
  separator?: ReactNode;
  /**
   * Collapse threshold. When the trail has more items than this, the middle
   * segments fold into a single ellipsis (`…`) button that expands on click.
   * The first item and the last `itemsAfterCollapse` items always stay visible.
   * Omit (or set `0`) to never collapse.
   */
  maxItems?: number;
  /**
   * How many trailing segments to keep visible when collapsed (in addition to
   * the first item). Defaults to `1` so the current page is always shown.
   */
  itemsAfterCollapse?: number;
  /**
   * Accessible label for the ellipsis "expand" control shown when collapsed.
   * Defaults to "Show hidden navigation levels".
   */
  expandLabel?: string;
  /**
   * Back-link form — renders a single "back to ancestor" link instead of the
   * full trail. Useful on narrow screens. Targets the immediate parent
   * (second-to-last item) by default.
   */
  back?: boolean;
  /**
   * Leading icon for the back-link form. Decorative (aria-hidden). Pass a
   * FontAwesome Duotone arrow node; defaults to a text arrow when omitted.
   */
  backIcon?: ReactNode;
}

const DEFAULT_SEPARATOR = '/';
const ELLIPSIS = '…';
const DEFAULT_BACK_ICON = '←';

/**
 * Breadcrumb — a horizontal trail showing the user's location in the app
 * hierarchy and letting them jump back to an ancestor level.
 *
 * Spotler component: Breadcrumb. Single line, Body/Paragraph - Regular (14/20),
 * no wrapping — long trails collapse the middle into an ellipsis. Has no
 * dedicated color tokens: ancestor segments use the Link color
 * (rest `#005499`, hover `#003560`, underlined) and the current segment is
 * static gray text. Separators use the muted gray.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  {
    items,
    separator = DEFAULT_SEPARATOR,
    maxItems = 0,
    itemsAfterCollapse = 1,
    expandLabel = 'Show hidden navigation levels',
    back = false,
    backIcon = DEFAULT_BACK_ICON,
    className,
    ...rest
  },
  ref,
) {
  const [expanded, setExpanded] = useState(false);
  const classes = ['sds-breadcrumb', className].filter(Boolean).join(' ');

  // Back-link form: link to the immediate parent (second-to-last item).
  if (back) {
    const parent = items.length >= 2 ? items[items.length - 2] : items[0];
    return (
      <nav ref={ref} className={classes} aria-label="Breadcrumb" {...rest}>
        <a className="sds-breadcrumb__back" href={parent?.href}>
          <span className="sds-breadcrumb__back-icon" aria-hidden="true">
            {backIcon}
          </span>
          <span className="sds-breadcrumb__back-label">{parent?.label}</span>
        </a>
      </nav>
    );
  }

  // Determine which items to hide when collapsing long trails.
  const shouldCollapse =
    !expanded && maxItems > 0 && items.length > maxItems && items.length > itemsAfterCollapse + 1;

  // Indices of items kept visible: the first, plus the trailing `itemsAfterCollapse`.
  const collapseEnd = shouldCollapse ? items.length - itemsAfterCollapse : items.length;
  const lastIndex = items.length - 1;

  const renderSegment = (item: BreadcrumbItem, index: number) => {
    const isLast = index === lastIndex;
    return (
      <li key={index} className="sds-breadcrumb__item">
        {isLast || !item.href ? (
          <span
            className="sds-breadcrumb__current"
            aria-current={isLast ? 'page' : undefined}
          >
            {item.label}
          </span>
        ) : (
          <a className="sds-breadcrumb__link" href={item.href}>
            {item.label}
          </a>
        )}
        {!isLast && (
          <span className="sds-breadcrumb__separator" aria-hidden="true">
            {separator}
          </span>
        )}
      </li>
    );
  };

  return (
    <nav ref={ref} className={classes} aria-label="Breadcrumb" {...rest}>
      <ol className="sds-breadcrumb__list">
        {items.map((item, index) => {
          if (shouldCollapse && index >= 1 && index < collapseEnd) {
            // Render the ellipsis control once, in place of the first hidden item.
            if (index !== 1) return null;
            return (
              <li key="collapse" className="sds-breadcrumb__item">
                <button
                  type="button"
                  className="sds-breadcrumb__ellipsis"
                  aria-label={expandLabel}
                  onClick={() => setExpanded(true)}
                >
                  {ELLIPSIS}
                </button>
                <span className="sds-breadcrumb__separator" aria-hidden="true">
                  {separator}
                </span>
              </li>
            );
          }
          return renderSegment(item, index);
        })}
      </ol>
    </nav>
  );
});
