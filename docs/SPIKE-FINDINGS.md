# Spike findings — official Figma MCP write capability (2026-07-28)

Question: can the whole Figma side of project setup + token sync run through the
**official Figma MCP (claude.ai connector)**, keeping figma-console (desktop plugin
bridge) out of the required toolchain?

**Answer: yes.** Tested against a scratch Figma design file created in the author's
org drafts for the purpose (safe to delete once findings are recorded here).

## Verified working via `use_figma`

- Variable **collections** with renamed + added **modes** (Light/Dark) — on an
  enterprise-tier org plan. Mode limits are plan-dependent: starter = 1,
  org/enterprise = 40+.
- **COLOR and FLOAT variables**, values per mode, `{r,g,b,a}` 0–1 format.
- **`VARIABLE_ALIAS`** — semantic → primitive references, resolving per mode.
- **`scopes`** and **`setVariableCodeSyntax('WEB', 'var(--…)')`**.
- **Text styles** (`createTextStyle` + font-load recipe).
- **Variable-bound fills/gaps** on frames; **mode-pinned frames** via
  `setExplicitVariableModeForCollection`.
- **Updating existing variable values** (the sync push case).

## Read-back via `get_variable_defs` (official read tool)

Returns the variables **consumed in the queried node's subtree**, keyed by **code
syntax** when set, with values **resolved for the node's active mode**:

- Light sheet: `{"var(--bg-default)": "#f5f2ed", "var(--fg-primary)": "#121212", …}`
- Dark-pinned clone: same keys, inverted values (`#121212` / `#f5f2ed`).

Design consequences baked into the skills:

1. **Code syntax is the Figma↔code name anchor** — set it on every variable at push
   time; match on it first at sync time.
2. **Token-sheet frames** (one per mode, pinned) are both the human styleguide and
   the machine read-points; their node ids live in `tokens.lock.json`.
3. Full-fidelity reads (all modes, alias structure, ids) use a **read-only
   `use_figma` script**; `get_variable_defs` on the sheets is the cheap freshness
   check.

## Gotchas hit during the spike

- `setValueForMode` with a mode id from a **different collection** throws
  `mode with id … not defined for variable`. Resolve mode ids from the variable's own
  `variableCollectionId`. (The failed script was atomic — nothing half-applied.)

## Still always-human (no API)

- Installing/uploading fonts into Figma (org fonts = admin upload).
- **Publishing** the library so other files can subscribe (UI button).

## Unlocked for later automation

On an **enterprise-tier Figma org**, the Variables REST API (enterprise-gated) is
plausibly available — the realistic headless write path for unattended code→Figma
sync later. Unverified; test against
`https://api.figma.com/v1/files/:key/variables` with an org token when that phase
starts.
