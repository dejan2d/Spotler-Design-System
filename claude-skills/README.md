# Spotler Claude Skills

A complete skill library for designing and building Spotler product interfaces — in **Figma Make** and in **Claude Code**.

Skills give Claude deep context about what each Spotler product does and how the design system is applied. The right combination produces designs and code that look correct, use the right terminology, and reflect real product logic — without generic SaaS assumptions.

---

## How the skills work together

```
Product Skill          tells Claude WHAT the feature does (user roles, flows, terminology)
        +
Design System Skill    tells Claude HOW it should look (components, tokens, patterns)
        =
Accurate Spotler design, every time
```

There are three categories of skill. Use them in combination.

---

## Category 1 — Product Context Skills (Figma Make)

One skill per Spotler product. Attach the skill for the product you are designing.

| Skill file | Product |
|---|---|
| `spotler-activate.skill` | Spotler Activate — CDP for commerce: behavioural data, audiences, personalisation, journeys, testing |
| `spotler-activate-search.skill` | Spotler Activate Search — on-site search, ranking, suggestions, merchandising, analytics |
| `spotler-crm.skill` | Spotler CRM — leads, contacts, companies, pipeline, lead scoring, marketing-sales alignment |
| `spotler-engage.skill` | Spotler Engage — webcare, social publishing, media monitoring, WhatsApp, live chat |
| `spotler-mail-plus.skill` | Spotler Mail+ — email marketing, newsletters, automation, deliverability, CRM sync |
| `spotler-mail-pro.skill` | Spotler MailPro — advanced email platform, multi-brand, relational data, approval workflows |
| `spotler-message.skill` | Spotler Message — WhatsApp-first conversational messaging, campaigns, chatbots, routing |
| `spotler-momice.skill` | Momice by Spotler — event registration, websites, communications, ticketing, check-in |
| `spotler-send-pro.skill` | Spotler SendPro — transactional email and SMS, sources, flows, templates, deliverability |
| `spotler-up-visit.skill` | UpVisit — smart event app platform, 3D maps, matchmaking, exhibitor/sponsor tools |

---

## Category 2 — Design System Skills (Figma Make + Claude Code)

| Skill file | What it does |
|---|---|
| `spotler-design-system.skill` | **Claude Code** — the full design system for developers: all foundation tokens, 842 component tokens, per-component guidelines for all 36+ components. |
| `spotler-design-principles.skill` | The 6 Spotler design pillars (Design, Layout, Consistency, Interaction, Simplicity, Accessibility). Useful in both contexts. |

---

## How to install a skill

1. Download the `.skill` file(s) from this folder.
2. In **Figma Make** or **Claude.ai**: drag the `.skill` file into the prompt area, or use your client's "add skill" / "attach file" option.
3. In **Claude Code**: drag the `.skill` file into the chat.
4. Done — Claude now has full context for that product and design system.

You do not need to mention the skill by name. Just describe what you want to design.

---

## Recommended combinations by use case

### Designing a feature for a specific Spotler product (Figma Make)

Attach **two skills**:

| | |
|---|---|
| `spotler-<product>.skill` | Product context (what the feature does) |
| `spotler-design-system.skill` | Visual guidance (how it should look) |

Optionally also attach `spotler-design-principles.skill` for deeper brand alignment.

---

### Example — designing for Spotler Activate

**Skills to attach:**
- `spotler-activate.skill`
- `spotler-design-system.skill`

**Example prompts:**

> "Using the Spotler Activate Product Context Skill and the Spotler Design System Skill, design an abandoned cart campaign setup screen for an e-commerce marketer."

> "Design a real-time trigger configuration screen that shows behavioural events, audience conditions, and the resulting on-site personalisation."

> "Design an audience builder for creating segments based on product views, cart behaviour, and predicted customer lifetime value."

---

### Example — designing for Spotler CRM

**Skills to attach:**
- `spotler-crm.skill`
- `spotler-design-system.skill`

**Example prompt:**

> "Using the Spotler CRM Product Context Skill and the Spotler Design System Skill, design a contact detail page showing contact data, company context, activity history, email engagement, website visits, lead score, and linked opportunities."

---

### Example — designing for Spotler Engage

**Skills to attach:**
- `spotler-engage.skill`
- `spotler-design-system.skill`

**Example prompt:**

> "Using the Spotler Engage Product Context Skill and the Spotler Design System Skill, redesign the central webcare inbox for agents handling social comments, WhatsApp, live chat, and reviews."

---

### Building components in Claude Code

**Skills to attach:**
- `spotler-design-system.skill`
- `spotler-design-principles.skill`

**Example prompts:**

> "Build a contact detail page for Spotler CRM using the Spotler Design System."

> "Review this screen against our design system."

> "Which button variant should I use for a destructive action?"

---

## What the product skills prevent

Without a product skill, AI tools default to generic SaaS assumptions:
- Activate becomes a "dashboard" with generic charts
- CRM becomes a generic task manager
- Engage becomes a basic email inbox
- Search becomes a simple search bar

With the correct product skill, the AI understands user roles, real workflows, correct terminology, product-specific logic, and what to avoid.

---

## Keeping skills up to date

- **Product skills** — regenerate when product logic, user roles, or terminology changes.
- **Design system skills** — regenerate from the Spotler Kit when tokens or component specs change.
- Replace the files here to keep the whole team in sync.
