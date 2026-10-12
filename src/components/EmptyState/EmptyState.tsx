import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './EmptyState.css';

/**
 * Context variant. Maps to the Figma `Type` property (set 2477:44945):
 * `Table` → `table`, `Image` → `image`, `Loading` → `loading`, `Page` → `page`.
 * Drives the token set and (for `loading`) live-region behavior.
 */
export type EmptyStateVariant = 'page' | 'table' | 'image' | 'loading';

/** Semantic heading level used for the document outline. */
export type EmptyStateHeadingLevel = 1 | 2 | 3 | 4;

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Heading (Figma `Header Texxt`) — a real heading in the document outline. Keep it short.
   * Rendered at `headingLevel` (default `h2`) with H3 typography, centered.
   */
  heading: ReactNode;
  /**
   * Context variant (Figma `Type`).
   * - `table` — empty table body (Figma default).
   * - `page` — full-page empty / zero-data.
   * - `image` — media / gallery empty.
   * - `loading` — empty-while-loading; announced via a live region.
   * @default 'table'
   */
  variant?: EmptyStateVariant;
  /**
   * Centered 60×60 icon / illustration node (FontAwesome Duotone in real use; Figma uses
   * file-magnifying-glass for Table, image for Image, file-xmark for Page).
   * For `loading`, pass the Loader here (Figma: Loader Dots, size lg, Blue) — it keeps its
   * own size and colors.
   */
  icon?: ReactNode;
  /** Supportive help text below the heading (Figma `Help Text`), Paragraph - Regular. */
  helpText?: ReactNode;
  /**
   * Action (Figma `TextLink Text`) — an inline text link rendered on the same row right after
   * the help text (gap 4px): Paragraph - Regular, action-text color, underlined.
   */
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
 * Empty State — Spotler Design System (Figma set 2477:44945).
 *
 * A placeholder shown when there is no content yet: it explains why and offers a
 * next action. Use for empty lists/tables, no-search-results, first-run, and
 * empty-while-loading scenarios; do not use as a system-error page.
 *
 * Figma spec: column, centered, gap 12px, padding 24px, radius 8px (large); icon 60×60;
 * heading H3 (centered); then one centered row (gap 4px) holding the help text and an inline
 * text-link action, both Paragraph - Regular.
 * Variants: Table (default), Image, Loading, Page — each with its own background / icon /
 * heading / help-text / action-text tokens. The `loading` variant shows a Loader in the
 * icon slot and announces its content via an `aria-live` region so the change is not silent.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { heading, variant = 'table', icon, helpText, action, headingLevel = 2, className, ...rest },
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
      {icon && (
        <span className="sds-empty-state__icon" aria-hidden="true">
          {icon}
        </span>
      )}
      <Heading className="sds-empty-state__heading">{heading}</Heading>
      {(helpText || action) && (
        <div className="sds-empty-state__help">
          {helpText && <p className="sds-empty-state__help-text">{helpText}</p>}
          {action && <div className="sds-empty-state__action">{action}</div>}
        </div>
      )}
    </div>
  );
});
