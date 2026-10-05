---
version: 1
platform: web
extends: ../DESIGN.md
breakpoints:
  large: 960px
container:
  max: 1200px
responsive:
  typography:
    display:
      "@large": { fontSize: 48px, lineHeight: 52px }
    heading-1:
      "@large": { fontSize: 40px, lineHeight: 44px }
    heading-2:
      "@large": { fontSize: 28px, lineHeight: 36px }
  spacing:
    lg:     { "@large": 32px }
    xl:     { "@large": 48px }
    2xl:    { "@large": 64px }
    3xl:    { "@large": 96px }
    gutter: { "@large": 24px }
    margin: { "@large": 48px }
motion-assignments: {}
grid: {}
component-behavior: {}
image-aspects: {}
color-modes: {}
---

# {{PROJECT_NAME}} — Web Implementation

**This file is canonical for web behaviour.** Its front matter answers *how does
a token from `DESIGN.md` resolve on the web at a given viewport?* — breakpoints,
container max, the typography and spacing values that change at Large, and the
placeholder sections for motion assignments, grid, component responsive
behaviour, image aspects and colour modes.

Identity lives in [`DESIGN.md`](DESIGN.md); this file is its sibling.

## How the two files combine at emission

`DESIGN.md` provides the base value for every token. This file provides
overrides at named breakpoints. `/sync-tokens` reads both and emits:

- `styles/tokens.css` — `:root` custom properties from DESIGN.md, plus a
  `@media (min-width: <breakpoints.large>)` block whose contents come from the
  `responsive` table.
- the Tailwind theme — maps names to `var(--…)`, so the media query above is
  the single place a responsive value is decided.
- the Figma library — Scale collection carries two modes, Small and Large; the
  Large-mode value of a variable comes from this file rather than from a `-lg`
  suffixed twin in DESIGN.md.

A `responsive.<block>.<name>` reference **must** name a token that exists in
DESIGN.md. `/sync-tokens` validates this before emitting anything; a typo fails
the run rather than emitting a broken CSS variable.

## Breakpoints and container

`breakpoints.large` is the min-width above which Large applies — 960px covers
14-inch laptops and larger. Portrait tablets take Small (which suits their
reading distance); landscape takes Large. Tablets are deliberately not a mode.

`container.max` caps the content column at Large. It shows up in code as the
max-width of the layout container, not as a spacing token.

Multi-breakpoint (`@tablet`, `@wide`) drops in later without a schema change —
add a new key under `breakpoints` and reference it as `"@tablet"` in the
`responsive` table.

## Responsive typography

`responsive.typography.<name>."@large"` overrides fontSize and lineHeight of the
base style with the same name at Large. **Absence means the style holds its base
value at every width** — body, caption and the CTA label do not appear here
because 16px reads correctly on a phone and on a laptop. Only the display and
heading styles grow, because that is where responsive type actually matters.

Line heights stay dimensions, never unitless multipliers. Unitless values are
silently dropped by the exporter.

## Responsive spacing

`responsive.spacing.<name>."@large"` overrides the value of the base spacing
step with the same name at Large. **Absence means the step holds its base value
at every width** — `xs`, `sm` and `md` do not appear here because small gaps do
not want to grow.

## Motion assignments

*To be authored.* Base durations and easings live in DESIGN.md under
`extensions.motion` as identity — `duration-fast`, `duration-base`,
`easing-standard`, `easing-decelerate`. This section assigns those pairs to
specific interactions: hover, page change, sheet open, dialog dismiss, list
reorder. An assignment is behaviour, not identity, which is why it lives here.

Fill this in when the project starts hitting real interactions. An empty block
is not a bug — it is a prompt.

## Grid

*To be authored.* Column counts per breakpoint (typical: 4 at Small, 12 at
Large), the gutter's relationship to `spacing.gutter`, and any layout-specific
overrides (product grid, media grid). Blank means the project has not yet
committed to a grid.

## Component responsive behaviour

*To be authored.* Behaviours that a component takes on at a specific breakpoint
— full-width buttons on Small, cards stacking into a single column, a
horizontal nav collapsing into a hamburger. These are decisions about how
components respond, and they belong in one place rather than embedded in
individual component files.

## Image aspect ratios

*To be authored.* Per-breakpoint aspect ratios for hero, card, tile, thumbnail
and any other image role the project uses. A hero that is 3:2 on Small and 21:9
on Large is a common pattern; write it down once here rather than repeating it
in every hero.

## Colour modes

*To be authored.* v1 ships one mode. If a project adds a second, this block
maps identity tokens (`fg/primary`, `surface/primary`, etc.) to their values in
the second mode. Adding a mode later is an addition here, not a rename in
DESIGN.md — which is why the inversion pair `surface/inverse` and `fg/on-inverse`
already ships in DESIGN.md's identity layer.
