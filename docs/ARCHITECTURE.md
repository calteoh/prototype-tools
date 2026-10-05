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
| `project-start` | Six questions, `git init`, and the `_setup/` folder. Deliberately builds nothing else |
| `project-create` | Reads the sheet and the dropped materials → the whole project. One checkpoint, at the inferred palette |
| `figma-library-push` | DESIGN.md + IMPLEMENT.web.md → Figma variables/styles/sheets; writes the phase-keyed lock file |
| `sync-tokens` | DESIGN.md + IMPLEMENT.web.md → every derived surface. One direction, emission only |
| `import-copy` | One-way import of writer content (Notion → repo markdown) |

**3 · Templates — what gets instantiated.** `templates/common` (docs, the settings
sheet, hub page, launchers), `templates/expo-app` and `templates/web-app` (scaffold
procedures + the config files that encode hard-won conventions). Templates use
`{{PLACEHOLDER}}` markers and `<!-- setup-skill: -->` instructions that must be fully
resolved and stripped in generated output.

Defaulted-tier values live in exactly one place: `plugins/project-setup/DEFAULTS.md`.
Skills read it rather than restating a number, so a template and a skill cannot
disagree about what the spacing base is.

## The token pipeline

**Two canonical inputs, one emission path.** `DESIGN.md` — the
[design.md format](https://github.com/google-labs-code/design.md) by Google
Labs, currently alpha — carries **identity**: colours, base type sizes, base
spacing, radii, and the `extensions` block (motion durations/easings, opacity,
border, focus geometry). `IMPLEMENT.web.md` carries **web behaviour**:
breakpoints, container max, the responsive typography and spacing overrides at
Large, and placeholder sections for motion assignments, grid, component
responsive behaviour, image aspect ratios and colour-mode mapping. Each file's
YAML front matter holds the values and its prose holds the reasoning, so a
number and its justification cannot drift apart. **No `tokens.json` is emitted
at all.** Everything below is derived:

```
   DESIGN.md ────────┐                    ┌──▶ styles/tokens.css        (web: CSS custom
   (identity)        │                    │                              properties from DESIGN.md
                     │                    │                              + @media overrides from
                     ├── /sync-tokens ────┤                              IMPLEMENT.web.md's
                     │                    │                              `responsive` block)
   IMPLEMENT.web.md ─┘                    ├──▶ Tailwind / NativeWind    (native: consumed
   (web behaviour)                        │    theme                     directly; base values
                                          │                              only in v1, no
                                          │                              IMPLEMENT.native.md yet)
                                          │
                                          └──▶ Figma variables          (Colour: one mode.
                                                                         Scale: Small from
                                                                         DESIGN.md + Large from
                                                                         IMPLEMENT.web.md)

   tokens.lock.json ─── what Figma actually holds, keyed by phase
```

There is **no primitives layer** — `colors` is one flat block in which
`"{colors.primary}"` is an alias, becoming a `VARIABLE_ALIAS` in Figma. That is why
two collections cover the whole system where the old shape needed Primitives plus
Semantic.

**One colour mode**, named for what the brand actually is rather than assumed to be
light. The inversion pair `surface-inverse` / `fg-on-inverse` ships anyway, so adding
a second mode later is an addition rather than a rename.

**Two layout modes.** Base (Small) values live in `DESIGN.md`; Large-mode
overrides live in `IMPLEMENT.web.md` under `responsive.<block>.<name>."@large"`.
One Figma variable, two modes, two sources — `space/lg` holds 24px at Small
(from DESIGN.md) and 32px at Large (from IMPLEMENT.web.md). Absence of a
responsive entry means the token holds its base value at both widths. Large
starts at **960px**, sourced from `breakpoints.large` in IMPLEMENT.web.md.

Emitted files are never hand-edited. Values under the custom `extensions` key —
motion, opacity, border, focus geometry — are silently dropped by the official
exporter, so the emission step writes those itself.

## Emission is one-directional in v1

`/sync-tokens` pushes DESIGN.md and IMPLEMENT.web.md outward and reads nothing
back. That makes it a pure function of two files, which is what makes it safe
to re-run and puts it in the maintenance family alongside `/project-check` and
`/project-share`.

Reading Figma back is **deferred to v2** and is not a missing feature so much as an
undesigned one: it needs a reconciliation policy — which side wins, per layer, and
what happens when both moved — and that policy has not been written. A half-built
merge is worse than none, because it looks like the whole thing at the moment it
matters.

`tokens.lock.json` already carries what that work will need: the full value snapshot
per phase, which is the **base** leg of a three-way diff (code vs lock, Figma vs
lock). That merge is the single most reusable idea in the system — the same shape
serves **reference supersession**, where base is what the old reference produced,
ours is the current value, and theirs is what the new reference implies. One engine,
two applications, neither built yet.

The lock file is keyed by phase because a project can hold a **frozen** concepting
library and a live detailed-design one at once. Nothing ever writes to a frozen
entry or reports drift against it — a frozen library diverging from DESIGN.md
or IMPLEMENT.web.md is the correct end state, not a problem.

## Agent surface

The plugin itself runs in Claude Code — `/project-start` and `/project-create`
are Claude Code slash commands. **Generated projects are agent-agnostic.**

`AGENTS.md` at the repo root is canonical for any agent — project context,
stack, conventions, the design-token pipeline and the runbook triggers all
live there. Anywhere else that mentions how agents work with the project
points back to it.

Three first-class bindings:

- **Claude Code** — `CLAUDE.md` at the repo root is a one-paragraph pointer to
  `AGENTS.md` (keeping Claude Code's file-discovery working), and the two
  maintenance commands live at `.claude/skills/sync-tokens/SKILL.md` and
  `.claude/skills/figma-library-push/SKILL.md` as thin adapters — frontmatter
  for slash-command discovery, body pointing at the runbook.
- **Cursor** — `.cursor/rules/agents.mdc` is an `alwaysApply: true` rule that
  points at `AGENTS.md` and names the two runbooks by intent. No per-command
  Cursor file; the always-apply rule covers both.
- **Codex CLI** — reads `AGENTS.md` natively; no separate binding needed.
  `AGENTS.md`'s coverage of the runbooks is what makes Codex first-class.

Everyone else — any other agentic assistant — points at `AGENTS.md` and reads
from there.

`.agents/runbooks/sync-tokens.md` and `.agents/runbooks/figma-library-push.md`
are the **single source of truth** for the two maintenance procedures — plain
markdown, agent-agnostic prose. Every binding above delegates to one of these
files rather than restating its content, so a procedure can only be right or
wrong once.

**Capability boundary named plainly.** The runbooks assume the reader can
execute shell commands, run `npx`, and call the Figma MCP. That is the
capability floor for "any agent" — Claude Code, Cursor, Codex CLI and
comparable agentic assistants all clear it. Sub-agentic tooling (Copilot
completions, plain LLM chat) is deliberately out of scope for the runbooks:
they can read this project's code fine, but they cannot run `/sync-tokens` or
push a library.

## Platform posture

**One platform per project, chosen at setup.** Responsive web is comprehensively
supported; a native app gets basic support in v1. Not both in the same project.

The dual path was the thing most likely to make this complicated faster than it made
it useful — two scaffolds, two token emission targets, two review stories — against a
goal of standing a team up quickly. Web earns the depth because the review surface
only works there: a stitched static build behind a URL is something a client can open,
and there is no equivalent for a native build without provisioning profiles and
TestFlight. So the hub handles web outputs only, even when a native project exists.

**Git is local-first.** `git init` needs no ticket, no network and no permission,
while an org-provisioned remote often takes 2–3 days. Org-dependent things — the
remote, Figma seats, Notion access — go on a parallel track that blocks nothing, with
the remote attached later as its own event. A gate that waits on the slowest
organizational dependency is not a gate, it is a stall.

## The Figma write path

Verified working through the **official Figma MCP** (claude.ai connector) — collections,
multiple modes, aliases, scopes, `setVariableCodeSyntax`, text styles, mode-pinned
frames, value updates. Variable `description` (`variable.description = "…"`) is a
writable Plugin API string; it was not in the 2026-07 spike and is treated as
write-anyway, skip-if-throws. Details and gotchas in
[SPIKE-FINDINGS.md](SPIKE-FINDINGS.md).

Those individual calls are proven. The **arrangement** changed twice since: in
2026-08 when DESIGN.md became canonical — Colour and Scale rather than
Primitives and Semantic — and again with the identity/behaviour split, where
Scale's Large-mode value now comes from IMPLEMENT.web.md's `responsive` block
rather than from `-lg` twins in DESIGN.md. That combination has not had a full
run yet. Binding text-style properties to Scale variables so one style
resolves at both widths is the specific unverified step; the fallback is two
flat styles.

Three layers of fallback so a run never dead-ends: **official MCP → figma-console →
printed manual checklist**. Two anchors make it work:

- **Code syntax is the name bridge.** Every variable gets `var(--kebab-name)`, so
  Figma↔code matching is by code syntax first, name-path second.
- **Token-sheet frames are the read points.** One per layout mode — Small and Large —
  each pinned with `setExplicitVariableModeForCollection`; their node ids live in the
  lock file and `get_variable_defs` on them returns mode-resolved values. Both sheets
  exist even though colour is identical across them, because a mode with no frame
  pinned to it cannot be read back at all.

**Description is usage metadata, not an anchor.** A trailing `#` comment on the
token's YAML line in DESIGN.md is copied to `variable.description` on every
push, and cleared when there is no comment. It is never matched on.
`get_variable_defs` does not return descriptions; those are read back with a
small `use_figma` script.

**Always human, no API exists:** installing fonts into Figma, publishing the library.
Also: the remote MCP cannot see the operator's installed fonts, so brand faces read as
missing and the Inter-placeholder + human swap is the normal path, not the exception.

## Verified vs. assumed

**Verified** (dry run, 2026-07-28 — see [DRY-RUN-NOTES.md](DRY-RUN-NOTES.md)): the web
path end to end — repo + docs scaffold, brand ingestion from a JS-heavy guidelines site,
tokens emitted to CSS, full Figma library push with read-back in both modes, stitched
static build (hub 200, concept 200, `asset()` image 200 under its sub-path), and the
token sync round trip.

**What the format change invalidated.** That run used `tokens.json`, two colour modes
and the Primitives/Semantic split, and it exercised pull and conflict paths that are
now deliberately out of scope. The Figma *mechanics* it proved still hold; the shape
they were proving has been replaced. Treat the dry run as evidence about the API, not
about the current pipeline.

**Not yet verified:** the DESIGN.md pipeline end to end (the next test run) · binding
text-style properties to Scale variables · writing `variable.description` from
DESIGN.md `#` comments · the Expo path end to end (needs a device) ·
the marketplace-install path in a fresh session (needs the repo pushed) ·
`/import-copy` against a live Notion page · the second-operator test (a colleague
running setup from the README alone).

## Where it stands

v0.5.0. Local and **unpushed**. The scratch project used for the dry run lives outside
this repo and is client-named — local only, never published.

v0.5.0 makes generated projects **agent-agnostic**: `AGENTS.md` becomes the
canonical spec-for-agents, `CLAUDE.md` shrinks to a one-paragraph pointer, a
new always-apply Cursor rule (`.cursor/rules/agents.mdc`) handles Cursor, and
the two maintenance procedures move to `.agents/runbooks/` as single-source-of-truth
prose with thin per-platform adapters (`.claude/skills/*/SKILL.md`). Codex CLI
is covered by the native `AGENTS.md` read. The plugin itself remains a Claude
Code plugin.

v0.4.0 (its predecessor) split the design-system canonical file in two —
`DESIGN.md` for identity and `IMPLEMENT.web.md` for web behaviour — and updated
every skill, template, doc and canvas that assumed a single file with a `-lg`
reserved suffix rule. v0.3.0 narrowed `/sync-tokens` to emission and split the
single orchestrator into `/project-start` and `/project-create`. All of that is
written and none of it is proven end to end — the next thing that should
happen to this repo is somebody running it on a real project.

## Backlog — from the journey model

The gap between what's built and the model in WORKFLOW-MODEL.md, roughly in dependency
order:

1. **`references/` folder + `INGESTED.md` provenance ledger** — the foundation; nothing
   in the reference lifecycle works without derivation links recorded at ingest.
2. **`BRIEF.md`** — intake's visible output; the minimum viable project context.
3. **`/project-check` and `/project-share`** — the maintenance pair the command split
   assumes. `/project-check` is the more urgent: `/project-create`'s hand-off already
   computes everything it would report, so it is largely that summary extracted and
   made runnable on its own, and it is the joiner's first command as much as the
   operator's.
4. **Attaching a git remote as its own event** — track the pending remote so its
   checkpoint can't be silently forgotten, and emit the repo request text, since a
   rejected request restarts the 2–3 day clock.
5. **Orient as a real stage** (and the joiner path — run once per person).
6. **`/design-audit`** — read-only drift report across surfaces *and* sources. This is
   the first half of the deferred v2 sync work, and it comes before reconciliation on
   purpose.
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
