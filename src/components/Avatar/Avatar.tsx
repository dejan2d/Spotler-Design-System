import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Avatar.css';

/**
 * Avatar sizes (px), matching the Figma "Avatar" set 331:683:
 * small 16 (S) · medium 20 (M — the Figma variant is labelled "M 24x24" but measures 20×20)
 * · large 32 (L) · x-large 40 (XL) · xx-large 52 (XXL).
 */
export type AvatarSize = 'small' | 'medium' | 'large' | 'x-large' | 'xx-large';

/** Avatar group sizes that exist in Figma ("Avatar group" 406:8756): 16 · 20 · 32 · 40px. */
export type AvatarGroupSize = Exclude<AvatarSize, 'xx-large'>;

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Accessible name of the person/entity. Required so screen readers announce who this is. */
  name: string;
  /**
   * Photo URL. When set (and it loads), renders the image fill; otherwise the Figma person
   * glyph placeholder shows.
   */
  src?: string;
  /** Visual size. small 16 · medium 20 · large 32 · x-large 40 · xx-large 52 (px). */
  size?: AvatarSize;
}

/**
 * Default placeholder — the Figma person glyph: an Avatar/person head and shoulders on the
 * Avatar/background circle (geometry from the 32px variant 331:864, clipped by the circle).
 */
function PersonGlyph() {
  return (
    <svg
      className="sds-avatar__person"
      viewBox="0 0 32 32"
      focusable="false"
      aria-hidden="true"
    >
      <circle cx="16" cy="13.6" r="5.76" fill="currentColor" />
      <ellipse cx="16" cy="28.16" rx="12.16" ry="7.04" fill="currentColor" />
    </svg>
  );
}

/**
 * Avatar — circular representation of a person or entity.
 * Figma "Avatar" (331:683): circular (Border/Circular); photo fill, or the person glyph
 * (Avatar/person on Avatar/background) when no image is available or it fails to load.
 * Sizes: S 16 · M 20 · L 32 · XL 40 · XXL 52 (px).
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, size = 'medium', className, ...rest },
  ref,
) {
  // Fall back to the placeholder if the photo fails to load.
  const [imageFailed, setImageFailed] = useState(false);

  const classes = [
    'sds-avatar',
    `sds-avatar--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showImage = Boolean(src) && !imageFailed;

  return (
    <span ref={ref} className={classes} role="img" aria-label={name} {...rest}>
      {showImage ? (
        <img
          className="sds-avatar__image"
          src={src}
          alt=""
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className="sds-avatar__fallback" aria-hidden="true">
          <PersonGlyph />
        </span>
      )}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar elements to lay out as an overlapping stack. */
  children: ReactNode;
  /**
   * Maximum number of avatars to show before the rest roll into a `+N` count badge.
   * Figma: group more than 4 users.
   */
  max?: number;
  /**
   * Size of the stack — only the Figma "Avatar group" (406:8756) sizes: small 16 · medium 20 ·
   * large 32 · x-large 40. Figma draws the `+N` overflow for the 16 and 20px groups.
   * @default 'medium'
   */
  size?: AvatarGroupSize;
  /**
   * Accessible label for the `+N` overflow badge, e.g. "3 more people".
   * Falls back to "{N} more" when omitted.
   */
  overflowLabel?: string;
}

/**
 * AvatarGroup — overlapping avatars with a trailing `+N` count badge for overflow.
 * Figma "Avatar group" (406:8756): each avatar carries Drop Shadow/100 (no ring); avatars
 * overlap by 4px, or by 8px when the `+N` badge is shown; the leftmost avatar sits on top.
 * The `+N` badge is the Badge Counter (Neutral) on Monochrome/Gray-200 with Monochrome/Gray-1000
 * Open Sans SemiBold text — 8px in the 16px group, 12px otherwise — overlapping the last avatar.
 */
export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(function AvatarGroup(
  { children, max, size = 'medium', overflowLabel, className, ...rest },
  ref,
) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children];
  const limit = typeof max === 'number' && max > 0 ? max : items.length;
  const visible = items.slice(0, limit);
  const overflow = items.length - visible.length;

  const classes = [
    'sds-avatar-group',
    `sds-avatar-group--${size}`,
    overflow > 0 && 'sds-avatar-group--overflow',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} role="group" {...rest}>
      {visible.map((child, index) => (
        <span
          key={index}
          className="sds-avatar-group__item"
          // Figma stacks the leftmost avatar on top.
          style={{ zIndex: visible.length - index }}
        >
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className="sds-avatar-group__overflow"
          role="img"
          aria-label={overflowLabel ?? `${overflow} more`}
        >
          <span aria-hidden="true">{`+${overflow}`}</span>
        </span>
      )}
    </div>
  );
});
