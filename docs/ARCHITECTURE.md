# Architecture — how this system is put together

Read this first when picking the project up. It covers the shape of the system, the
decisions already locked, what's verified vs. assumed, and what's next. The **journey**
this serves — what a designer actually experiences — is in
[WORKFLOW-MODEL.md](WORKFLOW-MODEL.md).

## Three layers

**1 · Distribution — a marketplace repo.** This repo carries
`.claude-plugin/marketplace.json`, which makes it installable in Claude Code:

```
/plugin marketplace add calteoh/prototype-tools
/plugin install project-setup@prototype-tools
```

Updates flow through `/plugin marketplace update prototype-tools`. Currently hosted
personally and framed as experimental; graduating to an official org home means copying
`plugins/project-setup/` into a new repo with its own marketplace file — installed
users just add the new shelf. The plugin folder is deliberately self-contained so the
shelf stays disposable.

**2 · Skills — the commands.** Each is a `SKILL.md` of instructions, not code:

| Skill | Role |
|---|---|
| `project-setup` | Orchestrator: preflight → intake → scaffold → verify |
| `figma-library-push` | tokens.json → Figma variables/styles/sheets; writes the sync baseline |
| `sync-tokens` | Three-way diff between Figma and code; applies both directions |
| `import-copy` | One-way import of writer content (Notion → repo markdown) |

**3 · Templates — what gets instantiated.** `templates/common` (docs, hub page,
launchers, token schema), `templates/expo-app` and `templates/web-app` (scaffold
procedures + the config files that encode hard-won conventions). Templates use
`{{PLACEHOLDER}}` markers and `<!-- setup-skill: -->` instructions that must be fully
resolved and stripped in generated output.

## The token pipeline

`tokens.json` (schema `prototype-tokens-v1`) is canonical. Everything else is an
emission of it:

```
                    ┌──▶ styles/tokens.css        (web: CSS custom properties,
                    │                              + [data-theme="dark"] block)
   tokens.json  ────┼──▶ tailwind.config.js       (native: consumed directly by
                    │                              NativeWind — no translation step)
                    └──▶ Figma variables          (Primitives + Semantic collections)

   tokens.lock.json ─── the last-synced snapshot: ids + flat values
```

Semantic tokens reference primitives (`{primitives.color.x}` → `VARIABLE_ALIAS` in
Figma). Dark mode is a `{light, dark}` value pair on semantic colours only. Emitted
files are never hand-edited.

## The sync engine

`tokens.lock.json` is the **base** of a three-way diff: code vs lock, Figma vs lock.
One-sided changes auto-apply; both-sides changes are conflicts surfaced in plain
language. This is the single most reusable idea in the system — the same merge serves
**reference supersession** (base = what the old reference produced, ours = current
value, theirs = what the new reference implies). One engine, two applications.

## The Figma write path

Verified working through the **official Figma MCP** (claude.ai connector) — collections,
light/dark modes, aliases, scopes, `setVariableCodeSyntax`, text styles, mode-pinned
frames, value updates. Details and gotchas in [SPIKE-FINDINGS.md](SPIKE-FINDINGS.md).

Three layers of fallback so a run never dead-ends: **official MCP → figma-console →
printed manual checklist**. Two anchors make it work:

- **Code syntax is the name bridge.** Every variable gets `var(--kebab-name)`, so
  Figma↔code matching is by code syntax first, name-path second.
- **Token-sheet frames are the read points.** One per mode, mode-pinned; their node ids
  live in the lock file and `get_variable_defs` on them returns mode-resolved values.

**Always human, no API exists:** installing fonts into Figma, publishing the library.
Also: the remote MCP cannot see the operator's installed fonts, so brand faces read as
missing and the Inter-placeholder + human swap is the normal path, not the exception.

## Verified vs. assumed

**Verified** (dry run, 2026-07-28 — see [DRY-RUN-NOTES.md](DRY-RUN-NOTES.md)): the web
path end to end — repo + docs scaffold, brand ingestion from a JS-heavy guidelines site,
tokens emitted to CSS with dark mode, full Figma library push with read-back in both
modes, stitched static build (hub 200, concept 200, `asset()` image 200 under its
sub-path), and all three sync scenarios (pull, push, conflict).

**Not yet verified:** the Expo path end to end (needs a device) · the marketplace-install
path in a fresh session (needs the repo pushed) · `/import-copy` against a live Notion
page · the second-operator test (a colleague running setup from the README alone).

## Where it stands

v0.2.0. Four commits local and **unpushed**. The scratch project used for the dry run
lives outside this repo and is client-named — local only, never published.

## Backlog — from the journey model

The gap between what's built and the model in WORKFLOW-MODEL.md, roughly in dependency
order:

1. **`references/` folder + `INGESTED.md` provenance ledger** — the foundation; nothing
   in the reference lifecycle works without derivation links recorded at ingest.
2. **`BRIEF.md`** — intake's visible output; the minimum viable project context.
3. **Local-first preflight** — promote "local-only for now" from an option to the
   default, track the pending remote, emit the repo request text.
4. **Resumable, self-locating `/project-setup`** — read repo state, resume at the right
   stage.
5. **Orient as a real stage** (and the joiner path — run once per person).
6. **`/design-audit`** — read-only drift report across surfaces *and* sources.
7. **Per-layer source-of-truth table** in DESIGN.md, honoured by sync.
8. **Reference lifecycle verbs** — supersede and retire, on top of (1).

Longer-range ideas live in [FUTURE-DIRECTIONS.md](FUTURE-DIRECTIONS.md).

## Doc map

| Doc | What it's for |
|---|---|
| [WORKFLOW-MODEL.md](WORKFLOW-MODEL.md) | The designer's journey: stages, entry points, reference lifecycle, principles |
| [ARCHITECTURE.md](ARCHITECTURE.md) | This file — system shape, state, backlog |
| [SPIKE-FINDINGS.md](SPIKE-FINDINGS.md) | What the official Figma MCP can and can't do, verified |
| [DRY-RUN-NOTES.md](DRY-RUN-NOTES.md) | First full run: what broke, what changed as a result |
| [FUTURE-DIRECTIONS.md](FUTURE-DIRECTIONS.md) | Recorded but not built |
| `../README.md` | Operator-facing: install, prerequisites, troubleshooting |
