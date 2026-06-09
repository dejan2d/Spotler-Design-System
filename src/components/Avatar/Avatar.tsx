import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Avatar.css';

/**
 * Avatar sizes (px), matching the Spotler "Avatar" spec:
 * small 16 (S) · medium 20 (M) · large 32 (L) · x-large 40 (XL) · xx-large 52 (XXL).
 */
export type AvatarSize = 'small' | 'medium' | 'large' | 'x-large' | 'xx-large';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Accessible name of the person/entity. Required so screen readers announce who this is. */
  name: string;
  /** Photo URL. When set (and it loads), renders the image fill; otherwise the tonal placeholder shows. */
  src?: string;
  /**
   * Initials to show on the tonal placeholder when there is no photo.
   * Derived from `name` (first + last initial) when omitted.
   */
  initials?: string;
  /** Icon node to show on the tonal placeholder instead of initials. FontAwesome Duotone in real use. */
  icon?: ReactNode;
  /** Visual size. small 16 · medium 20 · large 32 · x-large 40 · xx-large 52 (px). */
  size?: AvatarSize;
}

/** First + last initial of a name, e.g. "Ada Lovelace" -> "AL". */
function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Avatar — circular representation of a person or entity.
 * Spec: Spotler "Avatar". Circular (Border/Circular); photo fill, or initials/icon on the
 * tonal placeholder (Avatar/background + Avatar/person) when no image is available.
 * Sizes: S 16 · M 20 · L 32 · XL 40 · XXL 52 (px).
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, initials, icon, size = 'medium', className, ...rest },
  ref,
) {
  // Fall back to initials/icon if the photo fails to load.
  const [imageFailed, setImageFailed] = useState(false);

  const classes = [
    'sds-avatar',
    `sds-avatar--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const showImage = Boolean(src) && !imageFailed;
  const fallback = icon ?? initials ?? deriveInitials(name);

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
          {fallback}
        </span>
      )}
    </span>
  );
});

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Avatar elements to lay out as an overlapping stack. */
  children: ReactNode;
  /** Maximum number of avatars to show before the rest roll into a `+N` count badge. */
  max?: number;
  /**
   * Size applied to the trailing `+N` overflow badge so it matches the avatars.
   * Defaults to `medium`.
   */
  size?: AvatarSize;
  /**
   * Accessible label for the `+N` overflow badge, e.g. "3 more people".
   * Falls back to "{N} more" when omitted.
   */
  overflowLabel?: string;
}

/**
 * AvatarGroup — overlapping avatars with a trailing `+N` count badge for overflow.
 * Keeps overlap and ring consistent; caps the visible count and rolls the rest into `+N`.
 * Spec: Spotler "Avatar" → Avatar group.
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
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} className={classes} role="group" {...rest}>
      {visible.map((child, index) => (
        <span key={index} className="sds-avatar-group__item">
          {child}
        </span>
      ))}
      {overflow > 0 && (
        <span
          className={`sds-avatar-group__item sds-avatar sds-avatar--${size} sds-avatar-group__overflow`}
          role="img"
          aria-label={overflowLabel ?? `${overflow} more`}
        >
          <span className="sds-avatar__fallback" aria-hidden="true">
            {`+${overflow}`}
          </span>
        </span>
      )}
    </div>
  );
});
