<!-- setup-skill: agent-instantiated. Fill what the brand materials and intake answers
     established; leave everything genuinely undecided as an unchecked to-do with a
     one-line note of what would decide it. This file follows the design.md idea
     (github.com/google-labs-code/design.md): design decisions live next to the code,
     immature ones captured as to-dos designers evolve over time. Delete these comments. -->
# DESIGN.md — {{PROJECT_NAME}}

The living record of design-system decisions for this project. **If a value or rule
isn't recorded here (or in `tokens.json`), it isn't decided yet** — make the smallest
plausible choice, mark it `TODO(design)` at the site, and add a to-do below.

## Source of truth

- **Token values:** `tokens.json` in each app, mirrored in the
  [Figma design library]({{FIGMA_LIBRARY_URL}}). Aligned with `/sync-tokens` — never
  hand-edit an emitted file (`tokens.css`, tailwind theme).
- **Anything visual not covered by tokens:** the Figma designs are the reference.
  Code follows Figma, not the other way around.

## Decided

| Decision | Value | Why / source |
|---|---|---|
| Spacing base | {{SPACING_BASE}}px | {{SPACING_SOURCE}} |
| Type scale | see `tokens.json` `fontSize` | {{TYPESCALE_SOURCE}} |
| Color modes | {{COLOR_MODES}} | {{COLOR_MODES_SOURCE}} |
| Breakpoints | {{BREAKPOINTS}} | {{BREAKPOINTS_SOURCE}} |

## To decide

<!-- setup-skill: seed with the real gaps found during brand ingestion. Keep the format:
     what's open, what would settle it, who owns it. -->
- [ ] {{OPEN_DECISION_1}} — settled by: {{HOW_IT_GETS_DECIDED}}
- [ ] Semantic color coverage beyond the starter set (states, feedback, overlays) —
  settled by: first screens that need them
- [ ] Real brand fonts confirmed & licensed for prototype use — settled by:
  {{FONT_OWNER}}

## Type styles

The `fontSize` keys in `tokens.json` are the project's text styles — the same names
exist as Figma text styles. Current set: {{TEXT_STYLE_LIST}}.

## Conventions

- Semantic tokens (`fg/…`, `surface/…`, `brand/…`) are what components reference;
  primitives exist to be aliased, never used directly in a screen.
- Dark mode: {{DARK_MODE_STATUS}}.
- Locale-visible formatting (dates, currency, units): {{LOCALE_NOTE}}.
