import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import './Avatar.css';

export type AvatarSize = 'small' | 'medium' | 'large';

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  /** Accessible name of the person/entity. Required for a meaningful text alternative. */
  name: string;
  /** Photo URL. When set, renders the image fill. */
  src?: string;
  /** Initials to show on the tonal placeholder when there is no photo. Derived from `name` if omitted. */
  initials?: string;
  /** Icon node to show on the tonal placeholder instead of initials. */
  icon?: ReactNode;
  /** Visual size. small / medium / large. */
  size?: AvatarSize;
}

function deriveInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Avatar — circular representation of a person or entity.
 * Spec: references/components/avatar.md. Circular; photo OR initials/icon on the tonal placeholder.
 */
export const Avatar = forwardRef<HTMLSpanElement, AvatarProps>(function Avatar(
  { name, src, initials, icon, size = 'medium', className, ...rest },
  ref,
) {
  const classes = [
    'sds-avatar',
    `sds-avatar--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const fallback = icon ?? initials ?? deriveInitials(name);

  return (
    <span ref={ref} className={classes} role="img" aria-label={name} {...rest}>
      {src ? (
        <img className="sds-avatar__image" src={src} alt="" />
      ) : (
        <span className="sds-avatar__fallback" aria-hidden="true">
          {fallback}
        </span>
      )}
    </span>
  );
});
