# Spotler Claude Skills

These are **Claude skills** that make Claude aware of the Spotler Design System. Once installed, Claude automatically applies Spotler's design principles, tokens, and components whenever you work on UI — in Claude Code or Claude.ai.

## Skills

| File | What it does |
|------|--------------|
| `spotler-design-system.skill` | The full design system — design philosophy, the 3-column layout, all foundation tokens (color, typography, spacing, radius, elevation, 842 component tokens), and authoritative per-component guidelines for all 36+ components. |
| `spotler-design-principles.skill` | The Spotler design philosophy and the 6 guiding pillars (Design, Layout, Consistency, Interaction, Simplicity, Accessibility). |

## How to install

1. Download the `.skill` file(s) from this folder.
2. **In Claude Code or Claude.ai**, drag the `.skill` file into the chat (or use your client's "install skill" option).
3. That's it — Claude will now use the Spotler design system automatically when you ask it to build, review, or design any UI for Spotler products.

## When they trigger

You don't need to mention the skill by name. Just ask naturally, e.g.:
- "Build a contact detail page for Spotler CRM"
- "Review this screen against our design system"
- "Which button should I use for a delete action?"

Claude consults the skill and responds using real Spotler tokens, components, and rules.

## Keeping them up to date

These skills are generated from the Spotler kit. If the design system changes, regenerate the skills and replace the files here so the whole team stays in sync.
