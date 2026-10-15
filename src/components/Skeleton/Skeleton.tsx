import { forwardRef } from 'react';
import type { CSSProperties, HTMLAttributes } from 'react';
import './Skeleton.css';

/**
 * Placeholder shape.
 * - `text` — one line of text: as tall as the line box of the surrounding text style
 *   (19px for Paragraph - Regular, the Figma text row), full width by default.
 * - `block` — a value, chip, button or bar placeholder: full width × 24px by default
 *   (the Figma title and value bars; the button placeholder is 131×36).
 * - `circle` — an avatar or icon placeholder, `size` × `size`. Not drawn in the Figma
 *   examples; same colour and animation.
 */
export type SkeletonShape = 'text' | 'circle' | 'block';

export interface SkeletonProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
  /** @default 'text' */
  shape?: SkeletonShape;
  /** Width; a number is pixels. Defaults to `100%` for `text` and `block`. Ignored by `circle`. */
  width?: number | string;
  /** Height; a number is pixels. Defaults to the text line box (`text`) or 24px (`block`). Ignored by `circle`. */
  height?: number | string;
  /** Diameter of a `circle`; a number is pixels. @default 24 */
  size?: number | string;
}

const toLength = (value: number | string | undefined) =>
  typeof value === 'number' ? `${value}px` : value;

/**
 * Skeleton — Spotler Design System (Figma "Skeleton Loader", set 4343:41133,
 * page "Skeleton" 29:20).
 *
 * A placeholder that mimics the layout of content that is still loading. Use it when the
 * content structure is predictable (lists, grids, cards, dashboards); use a Loader when it
 * is not. Compose several shapes to match the final layout.
 *
 * Figma spec (Type=Load 1 4343:40028 … Load 4 4343:44166, then Loaded 4343:47462):
 * placeholders are pills with a 100px corner radius (unbound in Figma). Their fill
 * alternates Skeleton/content (#BBC5CA, Load 1 and 3) and Monochrome/Gray - 200
 * (#E7ECED, Load 2 and 4), Smart Animate ease-out, 800ms per step. Reproduced as a
 * looping 1.6s pulse; under `prefers-reduced-motion` the shape holds the Load 1 colour.
 *
 * Follow Figma: static labels (e.g. "Helper Text", "Small Title Helper Text") stay as real
 * text while loading — only the data (values, titles, actions) becomes a skeleton.
 *
 * Accessibility: every shape is `aria-hidden`. Mark the loading region itself with
 * `aria-busy="true"` while it loads, and give users a status — e.g. a visually hidden
 * "Loading campaign results" in a `role="status"` element — then remove both when the
 * content arrives.
 */
export const Skeleton = forwardRef<HTMLSpanElement, SkeletonProps>(function Skeleton(
  { shape = 'text', width, height, size = 24, className, style, ...rest },
  ref,
) {
  const classes = ['sds-skeleton', `sds-skeleton--${shape}`, className].filter(Boolean).join(' ');

  const dimensions: CSSProperties =
    shape === 'circle'
      ? { width: toLength(size), height: toLength(size) }
      : { width: toLength(width), height: toLength(height) };

  return (
    <span ref={ref} className={classes} aria-hidden="true" style={{ ...dimensions, ...style }} {...rest}>
      {/* A zero-width space gives the `text` shape the line box of the inherited text style. */}
      {shape === 'text' && '​'}
    </span>
  );
});
