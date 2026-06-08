import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import './Divider.css';

export type DividerOrientation = 'horizontal' | 'vertical';

export interface DividerProps extends HTMLAttributes<HTMLDivElement> {
  /** Layout direction of the rule. Vertical needs a defined height from its container. */
  orientation?: DividerOrientation;
  /**
   * When true the divider conveys a real grouping boundary and is exposed as a
   * semantic separator. When false (default) it is decorative and hidden from AT.
   */
  semantic?: boolean;
}

/**
 * Divider — a thin 1px rule that separates content groups.
 * Spec: references/components/divider.md. Color Divider/horizontal|vertical (#E7ECED).
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
