# Setup — {{PROJECT_NAME}}

> This file is written and maintained by the agent. You do not need to edit it
> directly — tell the agent what to change and it updates this record. If you do
> edit it, that is also fine; `/project-create` reads it generously.

<!-- Scaffolded from DEFAULTS.md v{{DEFAULTS_VERSION}} -->

## Project

- **Client:** {{CLIENT_NAME}}
- **Project:** {{PROJECT_NAME}}
- **Platform:** {{PLATFORM}}
- **Active phase:** {{ACTIVE_PHASE}}
- **Start from:** {{START_MODE}}
- **Figma file:** {{FIGMA_URL}}

## Description

In brand-materials mode this is optional context — a line about what is being
made is enough. In description-mode this is the primary input `/project-create`
reads to infer colours, type and feel. Either way, a **concrete reference** — an
artifact, a magazine, a physical object, a URL — carries more than a list of
adjectives.

{{DESCRIPTION}}

## Materials

Everything the operator has shared — files dropped into folders, URLs pasted in
chat, screenshots attached — with context about what matters in each.

```yaml
materials: []
# Each entry looks like:
#   - file: brand/acme-guidelines.pdf
#     type: brand-guidelines
#     context: "Key palette on page 4. Page 6 is outdated."
#   - url: https://competitor.com
#     folder: examples
#     context: "We want to feel calmer than this."
#   - file: examples/screenshot.png
#     type: reference
#     context: "Their current app. Notice the density."
```

## Settings

Values marked `(default)` were chosen for you. Tell the agent to change any of
them at any time — or edit this file directly if you prefer.

### Spacing and type

- **Spacing base:** 8px `(default)`
- **Type base:** 16px `(default)`
- **Type scale:** 1.2 minor third `(default)`
- **Large layout starts at:** 960px `(default)`

### Colour and shape

- **Colour mode:** Light `(default)`
- **Semantic naming:** primary / accent / fg / surface / line `(default)`
- **Radius scale:** 4 / 8 / full `(default)`
- **Content max width:** 1200px `(default)`

### Feel and floor

- **Motion:** 150ms fast / 300ms base `(default)`
- **Text contrast floor:** WCAG AA, 4.5:1 `(default)`
- **Minimum target size:** 24px `(default)`

## Anything else

Free text. This section is for the practical constraints that did not fit above —
the client's opinions, a specific reference to avoid, notes about the timeline.
`/project-create` reads this and turns what it can into decisions.

<!-- The agent appends here when the operator mentions constraints in conversation. -->
