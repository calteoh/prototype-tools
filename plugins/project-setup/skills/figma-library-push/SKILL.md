---
name: figma-library-push
description: Create or update a project's Figma design library (variable collections, modes, aliases, text styles, token-sheet frames) from the canonical tokens.json, verify by read-back, and write tokens.lock.json. Used by /project-setup and /sync-tokens; also directly when the user asks to push tokens to Figma or rebuild the design library.
---

# figma-library-push — tokens.json → Figma design library

Writes the design-system values layer into the project's Figma file. Verified
end-to-end (2026-07) through the **official Figma MCP** (claude.ai connector) — no
desktop plugin needed. Everything here is idempotent: inspect first, update what
exists, create only what's missing, never duplicate.

## Before any write

1. Load the Figma **figma-use** guidance: the `/figma-use` skill if installed, else
   read `skill://figma/figma-use/SKILL.md` via the Figma MCP, plus
   `references/variable-patterns.md` (and `text-style-patterns.md` when creating text
   styles). Non-negotiable — it prevents the known failure modes.
2. `whoami` → note plan tier. Starter tier allows **1 mode per collection**: if the
   project wants light/dark on a starter-tier file, fall back to light-only, record
   the limitation in DESIGN.md, and tell the operator.
3. Read `tokens.json` and, if present, `tokens.lock.json`.
4. Inspect the file: existing collections, variables, text styles
   (`getLocalVariableCollectionsAsync` etc.). Match existing conventions.

## Write path (in order of preference)

1. **Official Figma MCP `use_figma`** — primary, proven for: collections, modes,
   COLOR/FLOAT/STRING variables, `VARIABLE_ALIAS`, scopes, `setVariableCodeSyntax`,
   text styles, mode-pinned frames, value updates.
2. **figma-console MCP** (if the user has it) — fallback only. Known quirks: verify
   `figma.fileKey` before any write (navigate lies); delete via `figma_delete_node`.
3. **Manual fallback** — never dead-end: print a formatted token sheet (name, value
   per mode, scope, code syntax) the operator can enter by hand, plus the checklist.

## Procedure (small incremental calls — ≤10 logical ops each, return IDs every call)

1. **Primitives collection** (single mode, rename it "Value"): one variable per
   `primitives.color.*` / `primitives.spacing.*`. Scopes: primitives get `[]`
   (hidden from pickers — they exist to be aliased). Code syntax
   `WEB → var(--color-<name>)`.
2. **Semantic collection**: modes from the project config (Light, + Dark if enabled).
   One variable per semantic token path (`colors.fg.primary` → `fg/primary`).
   Values: `{primitives.…}` references become `VARIABLE_ALIAS`; literals stay
   literal. Scopes by role: `FRAME_FILL, SHAPE_FILL` for surfaces, `TEXT_FILL` for
   fg, both for brand, `STROKE_COLOR` for line. **Code syntax always**:
   `WEB → var(--<kebab-path>)` — this is the name anchor /sync-tokens matches on.
3. **Text styles**: one per `fontSize` entry, named exactly like the key. Follow the
   canonical font recipe: `listAvailableFontsAsync` to verify the family/style string,
   `loadFontAsync`, then create. Brand font not available in Figma → build the style
   with Inter at the correct size/line-height, and add "swap text styles to <font>
   after installing it in Figma" to the human checklist.
4. **Token sheets** (the styleguide + machine read-point): a "Tokens — Light" frame
   with one row per semantic variable (swatch bound to the variable + name label) and
   one line per text style. If dark mode: clone → "Tokens — Dark" →
   `setExplicitVariableModeForCollection(semantic, darkModeId)`. Screenshot both.
5. **Verify**: `get_variable_defs` on each sheet node — every token must come back,
   keyed by its code syntax, with the right resolved value per mode.
6. **Write `tokens.lock.json`** next to tokens.json (shape in
   `templates/common/tokens/TOKENS-FORMAT.md`): fileKey, collection/mode/variable
   ids, token-sheet node ids, and the flat value snapshot. Timestamp from
   `date -u +%Y-%m-%dT%H:%M:%SZ`.

## Known failure modes (learned the hard way — don't relearn)

- **The remote MCP's font list is NOT the user's font list.** `listAvailableFontsAsync`
  in the connector environment doesn't see fonts installed on the operator's machine
  or uploaded to their org — brand faces will read as missing even when designers use
  them daily in the same file. Expect the Inter-placeholder path to be the norm, not
  the exception; the swap always goes on the human checklist.

- **Mode ids belong to their own collection.** `setValueForMode` with another
  collection's mode id throws `mode with id … not defined for variable`. Always
  resolve the mode id from the variable's own `variableCollectionId`.
- Failed `use_figma` scripts are **atomic** — nothing applied. Read the error, fix,
  retry once; don't blind-retry.
- COLOR variable values take `{r,g,b,a}` (0–1); paints take `{r,g,b}`. Don't mix.
- `"Semi Bold"` not `"SemiBold"` — verify font style strings, never guess.

## Always-human steps (no API exists — print, don't attempt)

- Installing/uploading brand fonts into Figma (org font upload is an admin action).
- **Publishing the library** so other project files can use it (Figma UI button).
- Restyling the token sheets to taste.
