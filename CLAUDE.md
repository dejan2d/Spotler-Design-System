# Spotler Design System — working notes for Claude

React + TypeScript component library implementing the Spotler Design System.
41 components, driven entirely by design tokens. See `README.md` for the
library itself and `CONTRIBUTING.md` for the full component authoring guide.

## Always load these skills

Any design, UI, or component work in this repo — building a screen, adding or
editing a component, reviewing a layout, choosing a component or a colour —
uses these three together, without being asked:

| Skill | Role |
|---|---|
| `spotler-design-system` | Tokens, the 3-column layout, per-component guidelines |
| `spotler-icons` | Which icon, and never a placeholder |
| `spotler-design-principles` | The 6 Spotler pillars |

Add the matching product skill (`spotler-crm`, `spotler-feedback`, …) when the
work targets a specific product.

They live in `claude-skills/` as packed `.skill` bundles. Claude Code loads
skills from `~/.claude/skills/`, so a `git pull` alone does **not** install
them — copy the bundle across and start a fresh session:

```bash
cp claude-skills/*.skill ~/.claude/skills/
```

For Figma Make and claude.ai there is no filesystem: attach the `.skill` file
to the chat (or a claude.ai Project) instead, and replace the old copy rather
than adding a second one.

## Non-negotiables

**Tokens, never hardcoded values.** Every colour, and most spacing and radii,
references a CSS variable: `var(--button-primary-rest-background)`, not
`#005499`. Tokens are generated from the Spotler kit — regenerate them, don't
hand-edit `src/styles/tokens.css` or `component-tokens.css`.

**Token names keep the kit's original typos** — `Warrning`, `alet-darker`,
`backgorund`, `Uplifiting`. They map to Figma variable IDs. Do not "fix" them.

**Icons: Font Awesome Pro 7.1.0 Duotone Regular only**, from the 4,701 in
`src/icons/duotone-regular/`. Verify a name exists before using it, use the
canonical name (`pen-to-square`, not `edit` — the alias has no Figma
component, so an instance swap silently fails), and never leave a placeholder
or unswapped default icon in a design. Full rules in the `spotler-icons`
skill.

**`CHANGELOG.md` is generated** by `.github/workflows/changelog.yml` on every
push to `main`. Never hand-edit it. If a pull conflicts on it, discard the
local copy.

## Component conventions

`forwardRef`, exported typed `Props`, merged `className`, spread `...rest`.
BEM classes prefixed `sds-`. All states present (rest/hover/focus/selected/
disabled/error as relevant). Register in `src/index.ts` (alphabetical) and add
to `demo.html`. Then:

```bash
npx tsc --noEmit
```

## Commits

Every commit gets a headline **plus a bullet-point body** explaining what
changed and why — read the diff and write it. The bodies feed `CHANGELOG.md`,
the auto-posted GitHub commit comment, and the Figma changelog mirror, so a
one-line commit message leaves three places under-documented.

Branch off `main` (`feat/<component>`, `fix/<thing>`). Pull with `--rebase`;
the changelog bot commits to `main` on every push and plain merges leave noise.
