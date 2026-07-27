# Icons

Spotler Design System icon assets.

## `duotone-regular/`

4,701 SVGs — **Font Awesome Pro 7.1.0**, Duotone Regular (400) style. Duotone
Regular is the Spotler default: it is the weight our components document and the
one `IconButton` expects for its centered 20px icon node.

Each file is named after its Font Awesome icon name, so the `fa-*` class names
already referenced across the component library map directly to a file:

| Reference in code      | File                          |
| ---------------------- | ----------------------------- |
| `fa-magnifying-glass`  | `duotone-regular/magnifying-glass.svg` |
| `fa-xmark`             | `duotone-regular/xmark.svg`    |
| `fa-check`             | `duotone-regular/check.svg`    |

### Anatomy

Duotone icons are two `<path>` elements on a `0 0 640 640` viewBox:

```svg
<path opacity=".4" fill="currentColor" d="…"/>  <!-- secondary layer -->
<path fill="currentColor" d="…"/>               <!-- primary layer -->
```

Both paths use `fill="currentColor"`, so an icon inherits the surrounding text
colour. The secondary layer carries `opacity=".4"` — that opacity is what
produces the duotone effect. Don't strip it.

## License

Font Awesome Pro is **commercial software that requires a paid license**
(<https://fontawesome.com/license>). These assets are included under Spotler's
Font Awesome Pro license and are not covered by this repository's own terms.
The per-file copyright comment inside each SVG must be preserved.

Brand icons are trademarks of their respective owners and are not included in
this set.
