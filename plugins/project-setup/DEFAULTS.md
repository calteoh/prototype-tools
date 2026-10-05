---
version: 1
name: Project Setup Defaults
description: >-
  Every Defaulted-tier value in one place. Skills read this file rather than
  restating values in prose. A generated project's DESIGN.md is seeded from the
  identity blocks (colours, spacing, typography, rounded, extensions) and its
  IMPLEMENT.web.md is seeded from the `implement-web` block.
scale:
  spacing-base: 8px
  type-base: 16px
  type-ratio: 1.2
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 16px
  margin: 16px
typography:
  display:
    fontSize: 33px
    lineHeight: 36px
    fontWeight: 600
    letterSpacing: -0.02em
  heading-1:
    fontSize: 28px
    lineHeight: 32px
    fontWeight: 600
    letterSpacing: -0.01em
  heading-2:
    fontSize: 23px
    lineHeight: 28px
    fontWeight: 600
  body:
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 400
  body-emphasis:
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 600
  body-link:
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 400
  caption:
    fontSize: 13px
    lineHeight: 20px
    fontWeight: 400
  caption-link:
    fontSize: 13px
    lineHeight: 20px
    fontWeight: 400
  cta-label:
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 600
rounded:
  sm: 4px
  md: 8px
  full: 9999px
extensions:
  motion:
    duration-fast: 150ms
    duration-base: 300ms
    easing-standard: cubic-bezier(0.2, 0, 0, 1)
    easing-decelerate: cubic-bezier(0, 0, 0, 1)
  opacity:
    disabled: 0.38
  border:
    hairline: 1px
  focus:
    width: 2px
    offset: 2px
semantic-naming:
  brand: primary, accent
  foreground: fg-*
  background: surface-*
  border: line-*
  states: state-*
expected-lint-findings:
  - rule: token-like-ignored
    path: extensions
    reason: Motion, opacity, border and focus geometry have no schema home. One key, one warning.
  - rule: orphaned-tokens
    path: colors.line-primary
    reason: No valid component property for a border colour. Screens use it directly.
  - rule: orphaned-tokens
    path: colors.state-hover
    reason: Overlays modify a surface at render time and are never a component's own colour.
  - rule: orphaned-tokens
    path: colors.state-pressed
    reason: As above.
  - rule: orphaned-tokens
    path: colors.state-selected
    reason: As above.
accessibility:
  text-contrast: 4.5
  non-text-contrast: 3
  target-size: 24px
  focus-visible: always
  reduced-motion: respected
posture:
  colour-modes: 1
  layout-modes: 2
  git: local-first
  phases: all folders created
  active-phase: concepting
  platform: web
implement-web:
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

# Project Setup Defaults

This is the only place a Defaulted-tier value is written down. Skills read it;
they never restate a number in prose. A generated project's `DESIGN.md` and its
`IMPLEMENT.web.md` are both seeded from these values, so the templates and the
skills cannot disagree.

The two output files split by purpose. `DESIGN.md` carries **identity** — one
value per token, the answer to *what is this colour, this type size, this base
gap*. `IMPLEMENT.web.md` carries **platform behaviour** — how those tokens
resolve on the web at a specific viewport, plus the empty sections for motion
assignments, grid, component responsive behaviour, image aspects, and colour
modes. This file mirrors that split: the top-level blocks seed DESIGN.md, and
`implement-web` seeds IMPLEMENT.web.md.

Changing a default is a one-line edit here. Existing projects do not move —
tooling is frozen per project, and each records the version that scaffolded it.

## How to change a default

Edit the value, add a line to the changelog at the bottom, and bump `version`.
The next project picks it up; older projects keep what they were built with.

The signal for *when* to change one: every setup run records which defaults the
operator overrode and why. **A default overridden on three consecutive projects
is not a default, it is a wrong guess.**

## Spacing

An 8px base with a 4px half-step for micro-adjustment. Seven steps is enough for
a prototype and few enough to hold in your head.

**Base values only live here.** Every spacing key holds one value — the value at
Small — because this file is identity, not behaviour. The Large-mode overrides
for the larger steps live in `implement-web` below, keyed by the same names, so
`spacing.lg` is one token with two behaviours rather than two tokens with
similar names. `xs`, `sm` and `md` have no `@large` entry because small gaps do
not want to grow.

## Typography

16px base on a 1.2 minor-third ratio, giving 13 / 16 / 19 / 23 / 28 / 33 / 40 /
48. Nine named styles, which is the minimum that covers a real screen without
inviting invention.

Body and caption sizes hold across both layout modes — 16px reads correctly on a
phone and on a laptop. The three display and heading styles grow at Large, which
is where responsive type actually matters — that growth is described in
`implement-web` below, not here.

**Line heights are always a dimension, never a unitless multiplier.** This is not
a stylistic preference. The `design.md` exporter silently drops unitless line
heights from every output format — no warning, no error, they simply do not
appear — while dimension values survive. The spec recommends the unitless form,
which makes this a trap worth writing down.

## Primitives

The primitives block is a flat list of raw colour values discovered from brand
materials — hex codes, named colours, specific values — before they are assigned
a semantic role. Every brand colour lands here first; semantic assignment happens
as a separate step using the alias syntax `"{primitives.name}"`.

This serves three purposes:

1. **Capture before categorise.** During early concepting you know a brand has
   specific values but not yet which semantic role each fills. Primitives are
   the holding pen.
2. **Visibility of unassigned values.** A primitive that no semantic token
   references is visibly "captured but not placed" — it appears in "Still to
   decide" rather than being silently lost.
3. **One source for each raw value.** Changing the brand red is a one-line edit
   in primitives rather than finding every place the hex was copied.

The Figma push creates a single-mode **Primitives collection** from this block.

## Colour

One mode, named for the brand's actual default rather than assumed to be light.
Semantic names describe **role, never appearance**: `surface/primary`, never
`surface-white`. That single rule is what makes adding an inverted mode later an
addition rather than a rename.

The inversion pair — `surface/inverse` and `fg/on-inverse` — ships even in one
mode. It costs two tokens and it forces role-thinking from the first screen.

## Layout

Two modes. **Small** covers modern mobile viewports; **Large** applies at 960px
and above, which is where 14-inch laptops and larger sit.

One threshold rather than two, because tablets are deliberately not a mode. A
portrait tablet takes the Small scale, which suits its reading distance, and
landscape takes Large.

The threshold itself and the container max sit under `implement-web` rather
than in `spacing`, because they are behavioural values — how a page composes at
a viewport width — rather than identity. A change here would seed `IMPLEMENT.web.md`,
not `DESIGN.md`.

## Platform overrides

The `implement-web` block above is where **behaviour** lives — the values that
answer *how does this token resolve on the web at Large?* rather than *what is
this token?* Its shape mirrors the identity blocks it overrides:

- `breakpoints.large` — the min-width threshold above which Large applies.
- `container.max` — the maximum content width at Large.
- `responsive.typography.<name>."@large"` — the fontSize/lineHeight of a base
  typography style at Large. Only the styles that actually grow appear here.
- `responsive.spacing.<name>."@large"` — the Large-mode value of a base spacing
  step. Only the steps that actually grow appear here (`xs`, `sm`, `md` don't).

Five empty blocks (`motion-assignments`, `grid`, `component-behavior`,
`image-aspects`, `color-modes`) round out the shape. They ship empty rather
than defaulted because a bad default in these areas is worse than no default —
they are prompts for a specific project, filled in as the project needs them.

An `IMPLEMENT.web.md` reference under `responsive.*` must name a token that
exists in `DESIGN.md`. `/sync-tokens` validates this at emission time; a typo
fails the run rather than emitting a broken CSS variable.

## Interaction states

Five values, not a state system. Three neutral overlays, one disabled opacity,
one focus ring.

The overlays are surface-agnostic by design — they modify whatever is underneath
rather than specifying a colour, which is why one value works on a button, a list
row, a card and a tab alike. A primary button's branded hover colour stays a
component decision, made when the component is built.

## Motion

Two durations and two easings, as a place to start. Fast for state changes on a
single element; base for anything that moves or resizes.

Reduced-motion preferences are respected, which is part of the accessibility
floor rather than a nicety — shipping motion without it ships a known problem.

## Accessibility floor

Text contrast is **enforced**: the `design.md` linter fails on pairs below 4.5:1.
The rest is **instructed** through the generated `DESIGN.md`, which lands harder
than usual because the agent writing the screens reads that file every time.

Non-text contrast at 3:1 covers the linter's blind spot — borders, icons, and the
focus ring itself. Target size is the WCAG 2.2 AA floor of 24×24 CSS px; note
this is smaller than the 44px people assume, which is the AAA level, so guidance
may still recommend larger without changing the stated conformance level.

## The expected lint findings

A freshly generated `DESIGN.md` lints with **zero errors and five warnings**, and
those five are listed above with reasons. `/project-check` matches findings
against that list and reports anything outside it.

This matters more than it looks. A permanent warning nobody has accounted for
teaches a team to skim the report, and then a real finding goes unnoticed. Five
named exceptions with recorded reasons is auditable; "there are always some
warnings" is not.

Four of the five are `orphaned-tokens`, which fires on any colour no component
references. It is a reasonable rule that does not fit how this system is used:
the state overlays modify a surface at render time rather than being any
component's own colour, and there is no valid component property for a border
colour. The tokens are used by screens, which the linter cannot see.

## The `extensions` key

Motion, opacity, border width and focus geometry have no home in the `design.md`
schema. They live under one custom `extensions` key rather than four, because an
unknown top-level key produces one lint warning and four would produce four.

That warning is expected and allowlisted by name in `/project-check`. It is not a
warning to be ignored generally — it is a specific known finding with a recorded
reason, which is the only honest way to carry a permanent warning without
training everyone to skim past the report.

Values under `extensions` are dropped by the official `export` command, so the
emission step writes them itself.

## Changelog

- **v2** — Split identity from behaviour. Removed every `-lg` twin from
  `spacing` and `typography`, and moved `breakpoint-large` / `container-max` out
  of `scale`. Added `implement-web`, whose shape mirrors the front matter of
  `IMPLEMENT.web.md` (breakpoints, container, `responsive.typography`,
  `responsive.spacing`, plus empty prompt blocks for motion assignments, grid,
  component behaviour, image aspects and colour modes). DESIGN.md now seeds
  from identity blocks only; IMPLEMENT.web.md seeds from `implement-web`.
- **v1** — Initial set, from the plan review of Jul–Aug 2026.
