# Spotler React Components

A React + TypeScript component library implementing the **Spotler Design System**. Every component is driven entirely by design tokens (CSS custom properties) that mirror the Spotler Figma library — no hardcoded colors, spacing, or radii. Figma is the source of truth: components follow it variant for variant, state for state.

## What's inside

- **49 components** across 6 categories (buttons, inputs, display, feedback, navigation, dashboard)
- **Design tokens as CSS variables** — 50 foundation colors, the 4px spacing scale, corner radius, elevation, typography, breakpoints, plus all **852 component-level tokens**
- **Accessibility built in** — semantic elements, ARIA, keyboard support, visible focus states
- **One folder per component**: `Component.tsx` + `Component.css` + `index.ts`

## Installation

```bash
npm install
```

Peer dependencies: `react >= 18`, `react-dom >= 18`.

You also need **Open Sans** loaded (the system typeface). Either self-host or add to your app `<head>`:

```html
<link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
```

## Usage

Import the global stylesheet **once** at your app root (it pulls in all tokens), then use components:

```tsx
import '@spotler/react-components/src/styles/global.css';
import { Button, TextField, Card } from '@spotler/react-components';

function Example() {
  return (
    <div className="sds-root">
      <Card variant="info" heading="Welcome">
        <TextField label="Email" placeholder="you@company.com" />
        <Button variant="primary">Save changes</Button>
      </Card>
    </div>
  );
}
```

Wrap your app (or any subtree) in `className="sds-root"` to apply the base font and color.

## Project structure

```
src/
├── index.ts                      # barrel — re-exports every component
├── styles/
│   ├── tokens.css                # foundation tokens (color, spacing, radius, type, elevation)
│   ├── component-tokens.css      # all 852 component tokens
│   └── global.css                # imports both + base .sds-root styles
└── components/
    ├── Button/ Button.tsx Button.css index.ts
    ├── TextField/ ...
    └── … (49 components)
```

## Components

**Buttons & actions:** Button (incl. TextLink), IconButton, SegmentedButton
**Inputs & forms:** TextField, BigTextField, NumberInput, SearchBar, DropdownMenu, Checkbox, RadioButton, Switch, Slider (single and range), AbSlider, DatePicker, TimePicker, Calendar (single date and range), Upload, ColorPicker
**Display:** Card, ActionCard, KpiCard, Avatar, Table, Header, Modal, Overlay, ImageGrid, Divider, ActionChip
**Feedback:** Alert, Badge, StatusChip, ProgressBar, Loader, Skeleton, Tooltip, EmptyState
**Navigation:** Navigation, Folders, Tabs, ContextMenu, Pagination, Stepper, Accordion, Breadcrumb (deprecated)
**Dashboard:** BarChart, LineChart, PieChart (presentational wrappers — bring your own plotting), Scale

## Design tokens

All styling references CSS variables. Examples:

```css
/* Foundation */
--primary-conceptual-conceptual: #005499;   /* brand primary */
--secondary-spirit-spirit: #F0E306;          /* accent yellow (creation only) */
--monochrome-gray-1000: #353B40;             /* default text */
--spacing-s-16: 16px;
--border-small: 4px;

/* Component-level (prefer these) */
--button-primary-rest-background: #005499;
--inputs-regular-text-field-focused-stroke: #005499;
```

> **Token names preserve Figma's original spelling**, including known typos (`Warrning`, `alet-darker`, `backgorund`, `Uplifiting`) so they stay linked to the Figma variable IDs. Don't "fix" them.

## Conventions

- **Variants** via a `variant` prop; **states** handled in CSS (`:hover`, `:focus-visible`, `--selected`, `--error`, `--disabled`)
- Components use `forwardRef` and spread extra props to the root element
- BEM-style class names prefixed `sds-` (e.g. `sds-button`, `sds-button--primary`, `sds-button__label`)

## Notes & known gaps

- A few components compose foundation tokens where Figma has no dedicated component token (e.g. Modal scrim). These are documented inline in the component CSS.
- **Breadcrumb is deprecated** — Figma marks it "don't use". It stays for existing screens only.
- Keyboard focus rings are the one state not drawn in Figma; they are kept for accessibility.
- The chart components are **presentational wrappers** (header, legend, color exports) — plug in your charting library of choice for the actual plots.
