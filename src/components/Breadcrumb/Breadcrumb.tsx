import { forwardRef } from 'react';
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
   * Back-link form — renders a single "back to ancestor" link instead of the full trail.
   * Useful on narrow screens. Uses the second-to-last item (the immediate parent) by default.
   */
  back?: boolean;
  /** Separator glyph between segments. Decorative (aria-hidden). */
  separator?: ReactNode;
}

/**
 * Breadcrumb — a horizontal trail showing the user's location in the hierarchy.
 * Spec: references/components/breadcrumb.md. Composes from Link + Monochrome grays.
 */
export const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(function Breadcrumb(
  { items, back = false, separator = '/', className, ...rest },
  ref,
) {
  const classes = ['sds-breadcrumb', className].filter(Boolean).join(' ');

  // Back-link form: link to the immediate parent (second-to-last item).
  if (back) {
    const parent = items.length >= 2 ? items[items.length - 2] : items[0];
    return (
      <nav ref={ref} className={classes} aria-label="Breadcrumb" {...rest}>
        <a
          className="sds-breadcrumb__back"
          href={parent?.href}
        >
          <span className="sds-breadcrumb__back-icon" aria-hidden="true">
            &#8592;
          </span>
          <span>{parent?.label}</span>
        </a>
      </nav>
    );
  }

  return (
    <nav ref={ref} className={classes} aria-label="Breadcrumb" {...rest}>
      <ol className="sds-breadcrumb__list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
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
        })}
      </ol>
    </nav>
  );
});
