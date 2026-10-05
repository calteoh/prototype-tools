---
version: alpha
name: {{PROJECT_NAME}}
description: Design system for {{CLIENT_NAME}}. Prototyping only — not production.
primitives:
  {{PRIMITIVE_ENTRIES}}
colors:
  primary: "{primitives.{{PRIMARY_PRIMITIVE}}}"  # Brand actions and key accents.
  accent: "{primitives.{{ACCENT_PRIMITIVE}}}"  # Secondary emphasis. Links inherit this via components.
  fg-primary: "{{FG_PRIMARY}}"  # Default body text. Maintain 4.5:1 on surface-primary.
  fg-secondary: "{{FG_SECONDARY}}"  # Supporting text, captions, metadata.
  fg-on-primary: "{{FG_ON_BRAND}}"  # Text and icons sitting on primary.
  fg-on-inverse: "{{FG_ON_INVERSE}}"  # Text sitting on surface-inverse.
  surface-primary: "{{SURFACE_PRIMARY}}"  # Default page and card background.
  surface-secondary: "{{SURFACE_SECONDARY}}"  # Recessed surfaces, wells, secondary buttons.
  surface-inverse: "{{SURFACE_INVERSE}}"  # Inverted bands. Pair with fg-on-inverse.
  line-primary: "{{LINE_PRIMARY}}"  # Hairline borders and dividers. Maintain 3:1 on its surface.
  state-hover: "rgba(0, 0, 0, 0.04)"  # Neutral 4% overlay. Fill on interactive surfaces, not a text colour.
  state-pressed: "rgba(0, 0, 0, 0.08)"  # Neutral 8% overlay for pressed.
  state-selected: "rgba(0, 0, 0, 0.12)"  # Neutral 12% overlay for selected.
  focus-ring: "{colors.primary}"  # Focus indicator. Never remove without a replacement.
typography:
  display:  # Hero type. Grows at Large; the override lives in IMPLEMENT.web.md.
    fontFamily: {{FONT_DISPLAY}}
    fontSize: 33px
    lineHeight: 36px
    fontWeight: 600
    letterSpacing: -0.02em
  heading-1:
    fontFamily: {{FONT_DISPLAY}}
    fontSize: 28px
    lineHeight: 32px
    fontWeight: 600
    letterSpacing: -0.01em
  heading-2:
    fontFamily: {{FONT_DISPLAY}}
    fontSize: 23px
    lineHeight: 28px
    fontWeight: 600
  body:  # Default reading size. Holds at both layout modes.
    fontFamily: {{FONT_BODY}}
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 400
  body-emphasis:
    fontFamily: {{FONT_BODY}}
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 600
  body-link:
    fontFamily: {{FONT_BODY}}
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 400
  caption:
    fontFamily: {{FONT_BODY}}
    fontSize: 13px
    lineHeight: 20px
    fontWeight: 400
  caption-link:
    fontFamily: {{FONT_BODY}}
    fontSize: 13px
    lineHeight: 20px
    fontWeight: 400
  cta-label:
    fontFamily: {{FONT_BODY}}
    fontSize: 16px
    lineHeight: 24px
    fontWeight: 600
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 16px  # In-component horizontal padding. Grows at Large.
  margin: 16px  # Page margin. Grows at Large.
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
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.fg-on-primary}"
    rounded: "{rounded.sm}"
    padding: 12px
    typography: "{typography.cta-label}"
  button-secondary:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.fg-primary}"
    rounded: "{rounded.sm}"
    padding: 12px
    typography: "{typography.cta-label}"
  card:
    backgroundColor: "{colors.surface-primary}"
    textColor: "{colors.fg-primary}"
    rounded: "{rounded.md}"
    padding: 24px
  link:
    textColor: "{colors.accent}"
    typography: "{typography.body-link}"
  caption-block:
    backgroundColor: "{colors.surface-secondary}"
    textColor: "{colors.fg-secondary}"
    rounded: "{rounded.sm}"
    padding: 8px
    typography: "{typography.caption}"
  banner-inverse:
    backgroundColor: "{colors.surface-inverse}"
    textColor: "{colors.fg-on-inverse}"
    rounded: "{rounded.md}"
    padding: 24px
---

# {{PROJECT_NAME}} — Design System

**This file is canonical for identity.** The values above are the design
system's identity layer — one value per token, the answer to *what is this
colour, this type size, this base gap*. The prose below explains why they are
what they are.

**Behaviour lives in [`IMPLEMENT.web.md`](IMPLEMENT.web.md)** — how these tokens
resolve on the web at a specific viewport (breakpoints, container max, the
responsive typography and spacing overrides), plus the placeholder sections for
motion assignments, grid, component responsive behaviour, image aspects and
colour modes. The two files are siblings, and `/sync-tokens` reads both.

Four things are generated from the pair, and none of them is ever edited by
hand:

- `styles/tokens.css` — the CSS custom properties the screens actually use, plus
  `@media` overrides driven by IMPLEMENT.web.md
- the Tailwind theme, so utility classes resolve to these values
- the variables and text styles in the project's Figma library, including each
  variable's Description field
- `tokens.lock.json` — a machine-kept record of what Figma currently holds

Change identity here, or behaviour in IMPLEMENT.web.md, then run **`/sync-tokens`**
to push both through all four. Editing a generated file directly appears to
work until the next run, and then the change is gone with nothing to say it
ever existed.

Two things follow from that. Any value a screen needs belongs in the front
matter of one of the two files, not hardcoded in a component. And the prose
below is read by the agent building those screens, so it is instruction rather
than commentary — a rule written here is a rule that gets followed.

A trailing `#` comment on a token's YAML line is the Figma variable
description — the "How to use this variable" field. `/sync-tokens` copies it
on every push and clears the field when there is no comment. Keep it to one
sentence. Do not add a new YAML key for this; the linter would treat it as
unknown.

Prototyping only. Not production.

## Overview

{{BRAND_SUMMARY}}

<!-- Replace with a real description of the look and feel: brand personality,
     the audience, and the emotional register the UI should hit. This is what an
     agent reads when a specific rule does not cover the case in front of it. -->

## Primitives

The raw values discovered from brand materials — hex codes, specific numbers,
named references — before they are assigned a semantic role. Everything in the
brand lands here first.

A value like `"{primitives.brand-red}"` in the `colors` block is an alias to a
primitive. Unassigned primitives (values in this block that no semantic token
references yet) are the "captured but not yet placed" list — they represent
decisions still to be made about where a value lives in the system.

Adding a new brand colour? Put it here first, then assign it to a semantic role
in `colors`. Changing which primitive a semantic token points to is a one-line
edit rather than a search-and-replace across every surface.

## Colors

{{COLOR_RATIONALE}}

Names describe **role, never appearance**. `surface-primary` rather than
`surface-white`, so that a change of palette — or an inverted mode added later —
is a change of value rather than a rename that touches every screen and every
Figma binding.

This system ships **one colour mode**. Dark mode is detailed-design work, and
concepting happens in a single mode. The inversion pair `surface-inverse` and
`fg-on-inverse` exists already, so a second mode is an addition rather than a
redesign.

### Interaction states

Three neutral overlays plus a focus ring. The overlays modify whatever surface
sits underneath rather than naming a colour, which is why one value works on a
button, a list row, a card and a tab alike.

A branded hover colour for a specific component is a component decision, made
when that component is built. It does not belong here.

## Typography

{{TYPE_RATIONALE}}

Nine styles, sized from a 16px base on a 1.2 ratio.

Body and caption hold their size across both layout modes — 16px reads correctly
on a phone and on a laptop. Only the three display and heading styles grow at
Large. That growth — how much each grows and where the threshold is — lives in
`IMPLEMENT.web.md` under `responsive.typography`, not here.

Line heights are dimensions, never unitless multipliers. Unitless values are
silently dropped by the exporter.

## Layout

Layout behaviour — breakpoints, container max, and the responsive spacing and
typography overrides — lives in [`IMPLEMENT.web.md`](IMPLEMENT.web.md). This
file carries only the base spacing values, one per key, because behaviour and
identity split by design. See IMPLEMENT.web.md for the threshold, the container
cap, and which spacing steps grow at Large.

## Shapes

Two radii and a pill. {{SHAPE_RATIONALE}}

## Components

Six starting definitions, enough to prove the tokens reach a rendered screen.
This is not a component library and is not trying to become one — real components
are built as screens need them.

## Do's and Don'ts

- Do maintain 4.5:1 contrast for body text. The linter enforces this.
- Do maintain 3:1 contrast for borders, icons and focus indicators. The linter
  does **not** check this — it only looks at component text-on-background pairs.
- Do keep interactive targets at 24×24 CSS px or larger. That is the WCAG 2.2 AA
  floor; 44px is more comfortable and is never wrong.
- Do keep focus visible. Never remove an outline without replacing it.
- Do respect reduced-motion preferences. Both durations collapse to zero.
- Don't invent a value that belongs in this file. Add it here first.
- Don't hand-edit any generated file — the change will be overwritten.
- Don't name a token after how it looks.
- Don't add a YAML key for a Figma variable description. Put it in a `#`
  comment on that token's line.

## Still to decide

<!-- The agent fills this during setup with anything it could not infer, and the
     team empties it over time. An empty section is a finished design system,
     which is rare and worth noticing. -->

- {{OPEN_DECISION}}
