import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Divider.css';

/** Layout direction of the rule. Mirrors the Spotler "Divider" variants. */
export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Layout direction of the rule.
   * `horizontal` is a full-width 1px rule between stacked blocks.
   * `vertical` is a 1px rule between inline items (e.g. toolbar groups) and
   * needs a defined height from its container.
   * @default 'horizontal'
   */
  orientation?: DividerOrientation;
  /**
   * When `true` the divider conveys a real grouping boundary and is exposed to
   * assistive tech as a semantic separator (`role="separator"` + `aria-orientation`).
   * When `false` (default) it is purely decorative and hidden from AT via `aria-hidden`.
   * @default false
   */
  semantic?: boolean;
}

/**
 * Divider — Spotler Design System.
 *
 * A thin, non-interactive 1px rule that separates content groups (sections,
 * list rows, toolbar groups) where whitespace alone isn't enough. Purely visual.
 *
 * Sizing: 1px thickness, color Divider/horizontal|vertical (Monochrome/Gray-200).
 * The divider has no padding of its own — control the gap with surrounding spacing tokens.
 *
 * Variants: Horizontal (full-width), Vertical (needs a defined container height).
 * Accessibility: decorative and hidden by default; pass `semantic` to expose it as a
 * `role="separator"` when it marks a real grouping boundary.
 */
export const Divider = forwardRef<HTMLDivElement, DividerProps>(function Divider(
  { orientation = 'horizontal', semantic = false, className, ...rest },
  ref,
) {
  const classes = [
    'sds-divider',
    `sds-divider--${orientation}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      ref={ref}
      className={classes}
      role={semantic ? 'separator' : undefined}
      aria-orientation={semantic ? orientation : undefined}
      aria-hidden={semantic ? undefined : true}
      {...rest}
    />
  );
});
