import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './EmptyState.css';

export type EmptyStateVariant = 'page' | 'table' | 'image' | 'loading';

export interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  /** Heading — a real heading in the document outline. */
  heading: ReactNode;
  /** Context variant. Drives token set and (for loading) a live-region announcement. */
  variant?: EmptyStateVariant;
  /** Centered icon/illustration. Not shown for the loading variant. */
  icon?: ReactNode;
  /** Supportive help text below the heading. */
  helpText?: ReactNode;
  /** Action affordance (Button or Link). Rendered after the help text. */
  action?: ReactNode;
  /** Heading level rendered. Defaults to h2. */
  headingLevel?: 1 | 2 | 3 | 4;
}

/**
 * Empty State — placeholder shown when there is no content yet.
 * Spec: references/components/empty-state.md. Tokens Empty States/<variant>-*.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { heading, variant = 'page', icon, helpText, action, headingLevel = 2, className, ...rest },
  ref,
) {
  const classes = [
    'sds-empty-state',
    `sds-empty-state--${variant}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Heading = `h${headingLevel}` as const;
  const isLoading = variant === 'loading';

  return (
    <div
      ref={ref}
      className={classes}
      aria-live={isLoading ? 'polite' : undefined}
      aria-busy={isLoading ? true : undefined}
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
