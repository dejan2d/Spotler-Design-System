import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './EmptyState.css';

/** Context variant. Drives the token set and (for `loading`) live-region behavior. */
export type EmptyStateVariant = 'page' | 'table' | 'image' | 'loading';

/** Semantic heading level used for the document outline. */
export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4;

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Heading — a real heading in the document outline. Keep it short.
   * Rendered at `headingLevel` (default `h2`) with H3 typography.
   */
  heading: ReactNode;
  /**
   * Context variant.
   * - `page` — full-page empty / zero-data.
   * - `table` — empty table body.
   * - `image` — media / gallery empty.
   * - `loading` — empty-while-loading (no icon; announced via a live region).
   * @default 'page'
   */
  variant?: EmptyStateVariant;
  /**
   * Centered icon / illustration node (FontAwesome Duotone in real use).
   * Not rendered for the `loading` variant, which has no icon token.
   */
  icon?: ReactNode;
  /** Supportive help text below the heading. */
  helpText?: ReactNode;
  /** Action affordance (Button or Link), rendered after the help text. */
  action?: ReactNode;
  /**
   * Semantic heading level for the document outline.
   * @default 2
   */
  headingLevel?: EmptyStateHeadingLevel;
}

const HEADING_TAGS: Record<EmptyStateHeadingLevel, 'h1' | 'h2' | 'h3' | 'h4'> = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
};

/**
 * Empty State — Spotler Design System.
 *
 * A placeholder shown when there is no content yet: it explains why and offers a
 * next action. Use for empty lists/tables, no-search-results, first-run, and
 * empty-while-loading scenarios; do not use as a system-error page.
 *
 * Anatomy: centered icon/illustration, a short heading, supportive help text, and a
 * primary action (Button or Link), stacked and centered.
 * Layout: column, centered, gap 12px, padding 32px; icon 32px; H3 heading typography.
 * Variants: Page, Table, Image, Loading — each with its own background / icon /
 * heading / help-text / action-text tokens. The `loading` variant omits the icon and
 * announces its content via an `aria-live` region so the change is not silent.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { heading, variant = 'page', icon, helpText, action, headingLevel = 2, className, ...rest },
  ref,
) {
  const classes = ['sds-empty-state', `sds-empty-state--${variant}`, className]
    .filter(Boolean)
    .join(' ');

  const Heading = HEADING_TAGS[headingLevel];
  const isLoading = variant === 'loading';

  return (
    <div
      ref={ref}
      className={classes}
      aria-live={isLoading ? 'polite' : undefined}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {!isLoading && icon && (
        <span className="sds-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <Heading className="sds-empty-state__heading">{heading}</Heading>
      {helpText && <p className="sds-empty-state__help-text">{helpText}</p>}
      {action && <div className="sds-empty-state__action">{action}</div>}
    </div>
  );
});
