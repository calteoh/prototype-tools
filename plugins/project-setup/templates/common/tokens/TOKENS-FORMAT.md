# tokens.json — the canonical design-token source

`src/theme/tokens.json` (Expo apps) / `styles/tokens.json` (web apps) is the **single
source of truth for design-system values** in a scaffolded project. Everything else is
an emission of it:

| Surface | Emitted artifact | Consumed by |
|---|---|---|
| React Native | `tailwind.config.js` reads `tokens.json` directly | NativeWind `className` |
| Web | `styles/tokens.css` (CSS custom properties) | plain CSS + Tailwind arbitrary values |
| Figma | Variables + text styles in the project's design library | designers |

`/sync-tokens` keeps all three aligned. **Never hand-edit an emitted artifact** — edit
`tokens.json` (or the Figma library) and run `/sync-tokens`.

## Shape (v1)

The shape is deliberately Tailwind-theme-compatible — proven in a shipped client prototype, where
`tailwind.config.js` consumes it with zero translation:

```json
{
  "_meta": {
    "schema": "prototype-tokens-v1",
    "generated": "by /project-setup — edit values, keep the shape",
    "figma": {
      "fileKey": "<design library file key>",
      "collections": { "primitives": "Primitives", "semantic": "Semantic" }
    }
  },
  "primitives": {
    "color": { "red-600": "#E8112D", "ink-900": "#121212", "paper-50": "#F5F2ED" },
    "spacing": { "base": 8 }
  },
  "colors": {
    "fg": { "primary": "#121212", "secondary": "#6B6760" },
    "surface": { "primary": "#F5F2ED" },
    "brand": { "primary": "{primitives.color.red-600}" }
  },
  "fontFamily": {
    "display": ["PlaceholderSerif-Bold"],
    "body": ["PlaceholderSans-Regular"]
  },
  "fontSize": {
    "display": ["48px", { "lineHeight": "52.8px", "letterSpacing": "-0.96px" }],
    "heading-1": ["32px", { "lineHeight": "36px" }],
    "heading-2": ["24px", { "lineHeight": "28px" }],
    "body": ["16px", { "lineHeight": "24px" }],
    "body-emphasized": ["16px", { "lineHeight": "24px" }],
    "caption": ["12px", { "lineHeight": "16px" }],
    "cta-label": ["14px", { "lineHeight": "16px", "letterSpacing": "0.06em" }]
  }
}
```

## Rules

- **`colors` holds semantic tokens** (what components reference). `primitives` holds
  raw values. A semantic value may be a literal (`"#121212"`) or a reference
  (`"{primitives.color.red-600}"`) — references become variable aliases in Figma.
- **Dark mode is opt-in.** Single-mode projects use plain string values (above). A
  project with dark mode uses `{ "light": ..., "dark": ... }` objects for semantic
  colors only — primitives never have modes:

  ```json
  "surface": { "primary": { "light": "{primitives.color.paper-50}",
                            "dark":  "{primitives.color.ink-900}" } }
  ```
- **`fontSize` keys are the project's text styles.** Each becomes a Figma text style
  and a Tailwind `text-*` utility. Start from the minimum viable set (display,
  heading-1, heading-2, body, body-emphasized, body-inline-link, caption,
  caption-inline-link, cta-label) and delete what the project doesn't need.
- **Spacing default is an 8px base.** Only record a `spacing` scale here if the
  project deviates from Tailwind's default scale; otherwise the base note is enough.
- **Naming:** kebab-case, `/`-grouped in Figma (`fg/primary`), `.`-nested here
  (`colors.fg.primary`), `--`-flattened in CSS (`--fg-primary`). The Figma variable's
  **code syntax** stores the CSS name (`var(--fg-primary)`) — that mapping is written
  by `/figma-library-push` and is what makes `/sync-tokens` name-matching reliable.

## tokens.lock.json

Written next to `tokens.json` by `/figma-library-push` and updated by every
`/sync-tokens` run. It records the last-synced snapshot of every token value plus the
Figma ids needed to diff and write back:

```json
{
  "syncedAt": "<ISO timestamp>",
  "figma": {
    "fileKey": "...",
    "collections": { "primitives": "VariableCollectionId:…", "semantic": "VariableCollectionId:…" },
    "modes": { "light": "…", "dark": "…" },
    "variables": { "colors.fg.primary": "VariableID:…" },
    "tokenSheets": { "light": "<nodeId>", "dark": "<nodeId>" }
  },
  "values": { "colors.fg.primary": "#121212" }
}
```

It is machine-maintained. Never edit it by hand; never resolve a merge conflict in it
manually — re-run `/sync-tokens` instead.
