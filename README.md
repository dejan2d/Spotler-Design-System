# Spotler React Components

A React + TypeScript component library implementing the **Spotler Design System**. Every component is driven entirely by design tokens (CSS custom properties) generated directly from the Spotler kit — no hardcoded colors, spacing, or radii.

## What's inside

- **41 components** across 6 categories (buttons, inputs, display, feedback, navigation, dashboard)
- **Design tokens as CSS variables** — 50 foundation colors, the 4px spacing scale, corner radius, elevation, typography, plus all **842 component-level tokens**
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
│   ├── component-tokens.css      # all 842 component tokens
│   └── global.css                # imports both + base .sds-root styles
└── components/
    ├── Button/ Button.tsx Button.css index.ts
    ├── TextField/ ...
    └── … (41 components)
```

## Components

**Buttons & actions:** Button, IconButton, Link, SegmentedButton
**Inputs & forms:** TextField, SearchBar, DropdownMenu, Checkbox, RadioButton, Switch, Slider, DatePicker, TimePicker, Calendar, Upload, ColorPicker
**Display:** Card, ActionCard, KpiCard, Avatar, Table, Header, Modal, Divider
**Feedback:** Alert, Badge, StatusChip, ProgressBar, Tooltip, EmptyState
**Navigation:** Navigation, Folders, Tabs, Breadcrumb, ContextMenu, Pagination, Stepper, Accordion
**Dashboard:** BarChart, LineChart, PieChart (presentational wrappers — bring your own plotting)

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

> **Token names preserve the kit's original spelling**, including known typos (`Warrning`, `alet-darker`, `backgorund`, `Uplifiting`) so they stay linked to the Figma variable IDs. Don't "fix" them.

## Conventions

- **Variants** via a `variant` prop; **states** handled in CSS (`:hover`, `:focus-visible`, `--selected`, `--error`, `--disabled`)
- Components use `forwardRef` and spread extra props to the root element
- BEM-style class names prefixed `sds-` (e.g. `sds-button`, `sds-button--primary`, `sds-button__label`)

## Preview

Open `demo.html` in a browser to see components rendered with the real tokens (no build step required).

## Notes & known gaps

- A few components compose foundation tokens where the kit has no dedicated component token (e.g. Breadcrumb, Modal scrim). These are documented inline in the component CSS.
- The chart components are **presentational wrappers** (header, legend, color exports) — plug in your charting library of choice for the actual plots.
