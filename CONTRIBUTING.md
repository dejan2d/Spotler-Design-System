# Contributing to Spotler React Components

Thanks for helping maintain the Spotler component library! This guide explains how the project is structured and how to add or change components consistently.

## Getting started

```bash
git clone <repo-url>
cd spotler-react-components
npm install
npx tsc --noEmit   # typecheck
open demo.html     # visual preview (no build needed)
```

Requires Node 18+, React 18+. Open Sans must be loaded (see README).

## Project structure

```
src/
├── index.ts                   # barrel — re-exports every component
├── styles/
│   ├── tokens.css             # foundation tokens (color, spacing, radius, type, elevation)
│   ├── component-tokens.css   # all 842 component tokens
│   └── global.css             # imports both + base .sds-root styles
└── components/<PascalName>/
    ├── <PascalName>.tsx
    ├── <PascalName>.css
    └── index.ts
```

## Design tokens are the source of truth

Tokens are **generated** from the Spotler kit, not hand-written. The CSS files in `src/styles/` come from `spotler-make-kit/kit/guidelines/`. If a token value changes in the kit, regenerate — don't edit `tokens.css` / `component-tokens.css` by hand.

**Never hardcode colors.** Every color, and most spacing/radius, must reference a CSS variable:

```css
/* ✅ Do */
background: var(--button-primary-rest-background);
padding: var(--spacing-s-8) var(--spacing-s-16);
border-radius: var(--border-circular);

/* ❌ Don't */
background: #005499;
padding: 8px 16px;
```

> Token names preserve the kit's original spelling, **including typos** (`Warrning`, `alet-darker`, `backgorund`, `Uplifiting`). Keep them — they map to Figma variable IDs.

## Adding or editing a component

Follow the pattern set by `Button/` and `TextField/` (the canonical exemplars):

1. **Read the spec** in the Spotler kit: `spotler-make-kit/kit/guidelines/components/<name>.md`.
2. **Create the folder** `src/components/<PascalName>/` with three files.
3. **`<PascalName>.tsx`**:
   - Use `forwardRef`.
   - Export a typed `Props` interface (extend the right HTML attributes).
   - Spread `...rest` to the root element; merge incoming `className`.
   - Implement accessibility per the spec (roles, `aria-*`, label association, focus).
4. **`<PascalName>.css`**:
   - BEM-style classes prefixed `sds-` → `sds-<kebab>`, `sds-<kebab>--<variant>`, `sds-<kebab>__<part>`.
   - States via `:hover`, `:focus-visible`, and modifier classes (`--selected`, `--error`, `--disabled`).
   - 150ms `ease-in-out` transitions for color/background/border.
   - Only CSS variable tokens — no hardcoded hex.
5. **`index.ts`**: `export { X } from './X'; export type { XProps } from './X';`
6. **Register it** in `src/index.ts` (keep the list alphabetical).
7. **Add it to `demo.html`** under the right category section so it's visually reviewable.
8. Run `npx tsc --noEmit` and check `demo.html`.

## Conventions checklist (before opening a PR)

- [ ] `forwardRef` + exported typed `Props`
- [ ] `className` merged, `...rest` spread
- [ ] All states present (rest/hover/focus/selected/disabled/error as relevant)
- [ ] Zero hardcoded colors — tokens only
- [ ] Keyboard + screen-reader accessible; visible focus ring
- [ ] Added to `src/index.ts` and `demo.html`
- [ ] `npx tsc --noEmit` passes

## Branching & commits

- Branch off `main`: `feat/<component>` or `fix/<thing>`.
- Keep commits focused; reference the component name.
- Open a PR; include a screenshot from `demo.html` for visual changes.
