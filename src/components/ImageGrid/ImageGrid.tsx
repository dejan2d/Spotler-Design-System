import { forwardRef } from 'react';
import type { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';
import './ImageGrid.css';

/**
 * Figma "Image grid" `Size` (set 2912:124565): how many of the 12 layout-grid columns each
 * image spans — `2` → 6 images per row, `3` → 4 per row, `4` → 3 per row, `6` → 2 per row.
 * (Figma variant names: "2 column", "3 colums", "4 column", "6 column".)
 */
export type ImageGridSize = 2 | 3 | 4 | 6;

export interface ImageGridItem {
  /** Image source (Figma image fill, scale mode Fill → `object-fit: cover`). */
  src: string;
  /**
   * Alternative text. Use `''` only for purely decorative images; when `name` already
   * describes the image fully, an empty `alt` avoids double announcement.
   */
  alt: string;
  /**
   * File name / metadata line under the image (Figma `Text` property, default
   * "construction site_01.jpeg"; Paragraph - Regular, Monochrome/Gray-1000).
   */
  name?: ReactNode;
  /** Stable React key. Falls back to `src`. */
  key?: string;
  /** Extra attributes for the `<img>` (e.g. `loading`, `srcSet`, `sizes`). */
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
}

export interface ImageGridProps extends HTMLAttributes<HTMLUListElement> {
  /** Images to show, in reading order. */
  items: ImageGridItem[];
  /**
   * Figma `Size`: the number of the 12 layout-grid columns EACH IMAGE SPANS — not the number
   * of images per row. Resulting images per row: `2` → 6 · `3` → 4 · `4` → 3 · `6` → 2.
   * Pick a larger span (fewer, bigger images) when detail matters.
   * @default 2
   */
  size?: ImageGridSize;
  /**
   * Figma `Name+metadata` boolean: show each item's `name` line under its image.
   * @default true
   */
  showNames?: boolean;
}

/**
 * ImageGrid — Spotler Design System (Figma "Image grid" set 2912:124565, page "Image grid";
 * variants Size=2 column 2912:124564, 3 colums 2912:124566, 4 column 2912:124569,
 * 6 column 2912:124572).
 *
 * Displays images on the 12-column layout grid with consistent spans and gutters — galleries,
 * media pickers, portfolios.
 *
 * Figma spec:
 * - Tile: vertical stack, gap 16 — image, then the name line (`Name+metadata`, on by
 *   default). Image is 4:3 (250×188 · 385×290 · 522×393 · 797×600 for spans 2/3/4/6),
 *   radius 0, image fill scaled to Fill.
 * - Name: Text Styles/Body/Paragraph - Regular, Monochrome/Gray - 1000.
 * - Grid (page examples, "24 (fixed gutter)"): tiles wrap with a 24px gap on both axes.
 *
 * Accessibility: rendered as a list (`<ul>`/`<li>`); every image needs meaningful `alt`
 * (or `''` when decorative). Purely presentational — no interactive states in Figma.
 */
export const ImageGrid = forwardRef<HTMLUListElement, ImageGridProps>(function ImageGrid(
  { items, size = 2, showNames = true, className, ...rest },
  ref,
) {
  const classes = ['sds-image-grid', `sds-image-grid--span-${size}`, className]
    .filter(Boolean)
    .join(' ');

  return (
    <ul ref={ref} className={classes} {...rest}>
      {items.map((item) => (
        <li key={item.key ?? item.src} className="sds-image-grid__item">
          <img
            {...item.imgProps}
            className={['sds-image-grid__image', item.imgProps?.className]
              .filter(Boolean)
              .join(' ')}
            src={item.src}
            alt={item.alt}
          />
          {showNames && item.name !== undefined && item.name !== null && (
            <span className="sds-image-grid__name">{item.name}</span>
          )}
        </li>
      ))}
    </ul>
  );
});
