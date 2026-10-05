---
name: project-create
description: Build the project from the settings sheet — read _setup/SETUP.md and the dropped brand materials, propose colours, type and voice with sources for confirmation, then scaffold the app, write the canonical DESIGN.md, emit tokens, push the Figma library and verify it all runs. The second of the two setup commands. Use when the user runs /project-create, or says they are ready to build, scaffold or generate a project whose _setup/ folder already exists.
---

# /project-create — read the sheet, build the project

The second of two setup commands. `/project-start` made a folder and asked six
questions; this reads what is in that folder and builds the whole project from it.

Templates live at `${CLAUDE_PLUGIN_ROOT}/templates/` (fall back to `../../templates/`
relative to this file). Defaults live at `${CLAUDE_PLUGIN_ROOT}/DEFAULTS.md`. Read a
template before instantiating it; every `{{PLACEHOLDER}}` must be resolved and every
`<!-- setup-skill: -->` comment removed in the written output.

## It stops exactly once, and this is why

There is one checkpoint, at step 3, and nothing else pauses.

Reading a colour palette out of a brand PDF is the **only** step where the agent is
genuinely guessing. Everything else is deterministic (emission, linting, the Figma
push) or trivially reversible (a scaffolded file you can delete). Stopping anywhere
else would be ceremony — and ceremony teaches operators to click through prompts,
which costs you the one prompt that actually mattered.

So: gather everything, form a complete proposal, show it **with its sources**, and
then do not interrupt again.

## Step 0 — Work out what is already true

Before anything else, inventory the working directory and decide which of three
situations this is.

| What you find | What to do |
| --- | --- |
| No `_setup/SETUP.md` | Stop. This project has not been started — run `/project-start` first. Do not improvise a sheet. |
| A sheet, and nothing built | Normal path. Run every step. |
| A sheet, and *some* of the build present | **Resume.** Detect what exists, skip it, continue from the first gap. |
| `SETUP.md` stamped superseded, and the build present | **Refuse.** See below. |

**Resuming is a stated behaviour, not a repair mode.** A run can be interrupted by a
dropped connection, a Figma timeout, or someone closing a laptop, and the honest
design is one that picks up rather than starting over or, worse, duplicating. Check
for each of: the app folder, `DESIGN.md`, `styles/tokens.css` or `src/theme/tokens.js`,
`tokens.lock.json`, the hub, and the phase folders. Anything present and complete is
skipped and reported as skipped.

**Refusing to re-run a finished project is also deliberate.** Once the build has
succeeded, `SETUP.md` is superseded — DESIGN.md is where values live now, and re-reading
the sheet would quietly regress the project to its setup-time state, discarding every
token decision made since. Say exactly that, and point at the alternatives: change a
value in DESIGN.md and run `/sync-tokens`, or scaffold an additional concept app
directly.

## Step 1 — Read

1. **Parse `_setup/SETUP.md`.** The consumer is you, not a parser, so read it
   generously: `8 px`, `8px` and "about 8" are the same answer. A cell you genuinely
   cannot interpret becomes a question at the step 3 checkpoint, never a silent guess
   and never a crash.
2. **Note the `Start from` field.** The value is either `Brand materials` or
   `Description + references`, and it changes how the rest of the run reads the
   folder. Brand-materials mode transcribes literal values from `_setup/brand/`;
   description-mode infers them from the paragraph in `## Description` and shapes
   them against what is in `_setup/examples/`. Carry this mode forward — step 2's
   inference rules and step 3's source labels both depend on it.
3. **Read the `## Description` section carefully.** In description-mode this is the
   load-bearing input, so it deserves the same weight as a brand PDF would in
   brand-materials mode — turn every concrete reference in it (an artifact, a
   magazine, a physical object, a URL) into evidence for atmosphere and prose. In
   brand-materials mode it is context; still worth reading, but not the primary
   source of values.
4. **Read the `## Materials` section.** This YAML block lists every file and URL the
   operator shared, with their context annotation. Use this as your guided index into
   the drop folders — it tells you not just what is there, but what the operator said
   matters about each item (e.g. "palette on page 4, ignore page 6"). If a file
   exists in a folder but is not listed in materials, it was dropped without context;
   still read it, but note the gap.
5. **Read the `## Anything else` section carefully.** It is free text and it is
   where the operator put the practical constraints that did not fit elsewhere — "the
   client hates rounded corners", "their green is on page 4, not the one in the
   logo". Turn each into a decision and carry it to the checkpoint. Ignoring this
   section is the single easiest way to make an operator feel unheard.
6. **Inventory the four drop folders.** List what is in each, cross-referencing
   against the `materials:` block for context.
7. **Report what arrived and what did not**, in one short paragraph, before doing any
   work. Include the start mode plainly ("Start mode: Description + references"),
   because it changes what "arrived" is supposed to mean — an empty `brand/` is
   expected in description-mode and worrying in brand-materials mode. An operator who
   dropped a PDF into the wrong folder finds out here, in seconds, rather than after
   a five-minute build produced defaults.
8. **If a Figma URL is present, inspect it now.** Call `get_variable_defs` (or
   `use_figma` with `getLocalVariableCollectionsAsync`). If the file contains
   existing variable collections with defined values, this is a **library-first
   project**. Report it plainly: "The Figma file already has a design system —
   [N] variables across [M] collections. I'll read those as an input alongside
   your other materials."

   An empty file (no variables, or only Figma's defaults) takes the normal path.
   A file with variables triggers the library-first behaviour described below in
   steps 2 and 3 — the existing values become a co-authoritative input, and the
   checkpoint shows how they map to our structure.

Missing materials are not an error. Build on defaults and record the gap.

## Step 2 — Infer

**The highest-risk step in the system.** Everything downstream inherits whatever
happens here, and it is the one place the agent is reasoning rather than executing.

Read every supplied material: PDFs and images with Read, Figma URLs with the Figma
read tools, web URLs with WebFetch. Two field-tested fallbacks, both learned the hard
way:

- JS-heavy brand sites often embed their full content as JSON in the HTML.
  standards.site pages carry a `var documentData = {…}` payload — `curl` the page and
  parse that when WebFetch returns only a title.
- On managed Macs, Python's `urllib` may lack SSL certificates. Download with `curl`
  and parse the local file.

### Which materials are authoritative, per mode

The `Start from` row from step 1 chooses one of two shapes for this step. In both
modes `examples/` is **referential** — it shapes atmosphere and negative constraints
but never overrides a literal token value.

| Start mode | Authoritative source of literal values | Referential source |
| --- | --- | --- |
| Brand materials | `_setup/brand/` and `_setup/fonts/` — colours, type, spacing come literally from what lands there | `_setup/examples/` — feel and negative constraints only |
| Description + references | `SETUP.md § Description` — the paragraph is read for stated colours, type intent, feel | `_setup/examples/` — feel and negative constraints, plus supporting evidence for the description |

### Library-first: when the Figma file already has variables

If step 1 detected existing variables in the Figma file, the authority model gains a
layer. The starter kit's values become **co-authoritative** — they provide structure
and defaults that the operator's other materials can override.

| Start mode | Figma has variables? | How they interact |
| --- | --- | --- |
| Brand materials | Yes | Figma values provide structural completeness (full spacing scale, state tokens, type ramp). Brand materials **override** where they conflict — the brand is newer than the boilerplate. A brand PDF specifying `#E8112D` as primary wins over the starter kit's `#1B4DE4`. |
| Description + references | Yes | Figma values provide the **bones** (structure, scale, sensible defaults). The description overrides the **skin** (feel, specific colours, atmosphere). Operator brought a starting point and is customising it. |
| Either mode | No | Normal path — ignore this section entirely. |

**Reading the starter kit:**

1. **Extract every colour variable** into primitives. Name them by their original
   boilerplate name, prefixed to avoid collision: `kit-primary`, `kit-neutral-100`,
   `kit-accent-500`, etc. These are raw values, not yet assigned semantic roles.
2. **Map structural tokens** (spacing, radii, type sizes) to our scale. Sort spacing
   values by size and align to `xs/sm/md/lg/xl/2xl/3xl`. Map radii to `sm/md/full`.
   Match type sizes to our 9-style hierarchy by nearest value.
3. **Read text styles** for font family and weight information. These inform
   `{{FONT_DISPLAY}}` and `{{FONT_BODY}}`.
4. **Record every value's source** as "from starter kit variable `<original-name>`"
   in the tracking. This is what makes the checkpoint honest.

**Colour mapping heuristics** (for assigning starter kit primitives to semantic roles):

- Names containing `primary`, `brand`, `accent` → candidate for `colors.primary`, `colors.accent`
- Names containing `neutral`, `gray`, `grey` + low numbers (50, 100) → candidate for `colors.surface-primary`, `colors.surface-secondary`
- Names containing `neutral` + high numbers (800, 900) → candidate for `colors.fg-primary`
- Names containing `surface`, `background`, `bg` → candidate for `colors.surface-*`
- Names containing `text`, `foreground`, `fg` → candidate for `colors.fg-*`
- Names containing `border`, `stroke`, `line`, `divider` → candidate for `colors.line-*`
- Anything that does not map cleanly → stays as a named primitive, shown at checkpoint as "captured but not yet assigned to a role"

These are heuristics, not rules — every assignment is shown at the checkpoint and the
operator approves or rejects each one. The heuristics exist to propose a reasonable
first draft, not to decide.

**Override priority** (highest wins):

1. Operator's explicit statement (in "Anything else" or at checkpoint)
2. Brand materials (PDFs, guidelines) — the brand is newer than the boilerplate
3. Description (in description-mode)
4. Starter kit values (the Figma file)
5. Plugin defaults (from `DEFAULTS.md`)

**Referential means: shape the prose, not the numbers.** A screenshot of the New
York Times R&D microsite in `examples/` tells you the feel is editorial and calm; it
does not tell you the primary colour is `#000000`. Pulling colours off a reference
image without confirmation is the failure mode this rule exists to prevent — every
literal value must trace back to an authoritative source or to a default, never to
a screenshot in `examples/`.

**Promotion is a real move**, but it happens at the checkpoint. If the operator says
"use exactly this palette" about a reference, move that specific file from
`_setup/examples/` into `_setup/brand/` and re-infer only the values it authorises.
Not the whole run — just the section that changed. Full protocol in step 3.

### What to derive

- **Primitives first.** Extract every distinct colour value discovered from the
  materials into named primitives — `brand-red`, `brand-navy`, `warm-grey`, `ink`,
  etc. Names describe the value's origin or character, never its eventual role:
  `brand-red` not `primary`. This is the "known values" bucket. Every hex code,
  every named colour from a brand PDF, every colour picked from an authoritative
  source lands here first.
- **Semantic colours second.** For every `colors.*` key in `DESIGN.template.md`,
  assign a primitive using the alias syntax `"{primitives.brand-red}"`. This is a
  separate, explicit step — the operator sees which primitive maps to which role at
  the checkpoint. Unassigned primitives (values captured but not yet placed in a
  semantic role) stay in the primitives block and appear in "Still to decide."
  Names describe **role, never appearance**: `surface-primary`, never `surface-white`.
- **Fonts** — `{{FONT_DISPLAY}}` and `{{FONT_BODY}}`. The same family for both is a
  perfectly good answer.
- **Voice** — enough to write `TONE-OF-VOICE.md` and the prose placeholders
  (`{{BRAND_SUMMARY}}`, `{{COLOR_RATIONALE}}`, `{{TYPE_RATIONALE}}`,
  `{{SHAPE_RATIONALE}}`).

### The specific-reference rule

When writing `{{BRAND_SUMMARY}}`, prefer at least one **concrete reference** — an
artifact, a magazine, a physical object, a URL — over a list of adjectives. "A 1970s
graduate lecture handout in the tradition of an old established university" carries
more than "modern, clean, professional, premium", because a specific reference brings
its negative constraints with it. A lecture handout is not glossy, does not glow,
does not use gradients — those unstated constraints do most of the work of pinning
down the feel, and they only arrive when the reference is specific enough.

If neither the materials nor the `## Description` section offer a concrete reference,
do not invent one. **Ask at the checkpoint.** "Is there an object or a publication
this should feel like?" is a two-second question that shifts the design system by a
noticeable amount, and the checkpoint is the right moment to spend it.

### Tracking sources

**Track the source of every single value as you go** — which PDF and page, which
token it was aliased from, "inferred from your description", "inferred from
`examples/nyt-r-and-d.png` combined with your description", or "default". You cannot
reconstruct this afterwards, and step 3 is worthless without it.

Values with no source in the materials: take the smallest plausible option, mark it
`default`, and add it to DESIGN.md's "Still to decide" list as `{{OPEN_DECISION}}`
entries. Never invent a value and present it as derived.

## Step 3 — Checkpoint

Print every proposed value **with its source and its target file**. Identity
values land in `DESIGN.md`, behaviour values land in `IMPLEMENT.web.md` — the
operator sees both up front rather than being surprised when a second file
appears at scaffold time.

**Show primitives and semantic assignments separately.** The operator should see
the raw values first (primitives), then how they map to roles (semantic colours).
Unassigned primitives are surfaced explicitly — "captured but not yet assigned
to a role."

**The source column reads differently by start mode.** In brand-materials mode
it cites the PDF page or the alias a value came from. In description-mode it
says "inferred from your description" or "inferred from `examples/...`" — the
honesty of that column is what makes the checkpoint a real review rather than
a rubber stamp. Values with no source in either mode are honestly marked
`default`.

**Primitives → `DESIGN.md` — brand-materials mode:**

| Primitive | Value | Where it came from |
| --- | --- | --- |
| `brand-red` | `#E8112D` | brand guidelines PDF, p.4 |
| `brand-navy` | `#1B2B4A` | brand guidelines PDF, p.4 |
| `warm-grey` | `#F4F1EB` | brand guidelines PDF, p.5 |
| `ink` | `#1A1A1A` | brand guidelines PDF, p.3 |

**Semantic assignments → `DESIGN.md`:**

| Token | Assigned to | Reason |
| --- | --- | --- |
| `colors.primary` | `{primitives.brand-red}` | the dominant brand colour |
| `colors.surface-secondary` | `{primitives.warm-grey}` | warm background from guidelines |
| `colors.fg-primary` | `{primitives.ink}` | body text colour |
| `colors.surface-inverse` | `{primitives.brand-navy}` | dark inverse surface |

**Primitives → `DESIGN.md` — description + references mode:**

| Primitive | Value | Where it came from |
| --- | --- | --- |
| `deep-blue` | `#1E3A5F` | inferred from your description ("editorial, dense, ink on paper") |
| `warm-cream` | `#F4F1EB` | inferred from `examples/nyt-r-and-d.png` — warm off-white |
| `ink` | `#1A1A1A` | default body text |

**Semantic assignments → `DESIGN.md`:**

| Token | Assigned to | Reason |
| --- | --- | --- |
| `colors.primary` | `{primitives.deep-blue}` | editorial ink colour from description |
| `colors.surface-secondary` | `{primitives.warm-cream}` | warm background matching "handout" reference |

**Web behaviour → `IMPLEMENT.web.md`:**

| Setting | Value | Where it came from |
| --- | --- | --- |
| `breakpoints.large` | `960px` | default — Small/Large threshold |
| `container.max` | `1200px` | default |
| `responsive.typography.display."@large".fontSize` | `48px` | default — display grows at Large |
| `responsive.spacing.lg."@large"` | `32px` | default — larger gaps grow at Large |

Only surface responsive rows that were inferred from a material or that the
operator asked about. If everything on the behaviour side is defaults, one line
saying so is enough — do not paste the full table just to fill space.

### Library-first checkpoint (when Figma file had existing variables)

When step 1 detected a pre-populated Figma file, the checkpoint shows three
additional sections before the normal approval:

**1. What was in the starter kit:**

```
The Figma file "Luxury E-com Design System Starter Kit" contains 47 variables
across 2 collections:
  - "Colors" (1 mode, 28 variables): primary/500, neutral/50–900, accent/...
  - "Spacing" (1 mode, 19 variables): 4, 8, 12, 16, 24, 32, 48, 64...
  - 9 text styles: Display, H1–H4, Body, Caption, Label, Overline
```

**2. Proposed mapping — starter kit → our structure:**

| Starter kit variable | Value | Our primitive | Our semantic role |
| --- | --- | --- | --- |
| `Colors/primary/500` | `#1B4DE4` | `kit-primary` | `colors.primary` |
| `Colors/neutral/50` | `#FAFAFA` | `kit-neutral-50` | `colors.surface-primary` |
| `Colors/neutral/100` | `#F5F5F5` | `kit-neutral-100` | `colors.surface-secondary` |
| `Colors/neutral/900` | `#171717` | `kit-neutral-900` | `colors.fg-primary` |
| `Colors/neutral/700` | `#404040` | `kit-neutral-700` | `colors.fg-secondary` |
| `Colors/accent/500` | `#F59E0B` | `kit-accent` | `colors.accent` |
| `Colors/neutral/300` | `#D4D4D4` | `kit-neutral-300` | `colors.line-primary` |
| `Spacing/16` | `16px` | — | `spacing.md` (matches our default) |
| `Spacing/24` | `24px` | — | `spacing.lg` (matches our default) |

**3. Overrides from your brand materials:**

| Token | Starter kit had | Your materials say | Decision |
| --- | --- | --- | --- |
| `colors.primary` | `#1B4DE4` | `#E8112D` (brand PDF p.4) | **brand wins** — `kit-primary` updated to `#E8112D` |
| `spacing.md` | `16px` | (no override) | keep starter kit value |
| `FONT_DISPLAY` | `Inter` | `Ohno Blazeface` (brand guidelines) | **brand wins** |

Values from the starter kit that have no semantic mapping are listed as
unassigned primitives in "Still to decide."

The operator can:
- Accept the mapping as proposed
- Reject specific assignments: "don't use their spacing scale, use the defaults"
- Keep a token as an unassigned primitive: "not sure about that neutral yet"
- Override any value: "actually use #222 for fg-primary, not their 900"

**Put the proposal inside the approval prompt itself**, in the `AskUserQuestion`
option preview. Chat text above a prompt gets missed, and the operator ends up
approving something they never actually saw. This was learned from a real run.

Also surface here, in the same prompt:

- Anything read out of `## Description` and `## Anything else` and what you did with it.
- Any cell in the sheet you could not interpret.
- **If `{{BRAND_SUMMARY}}` still lacks a concrete reference**, ask now. This is the
  specific-reference rule from step 2 — the checkpoint is the moment it costs least.
- Any colour pair that will fail the contrast floor at step 5 — flag it **now**,
  while the operator is already deciding about colours, rather than as a lint failure
  four steps later.

### The promote-to-canonical move

If the operator responds with something like "actually use exactly the palette from
`examples/whatever.png`", treat that as a **promotion** of that file from
referential to canonical:

1. Move the file from `_setup/examples/` into `_setup/brand/`.
2. Re-infer only the values it authorises — the palette, in this case — and update
   the source column to read from the new `brand/` location.
3. Show the revised rows in the same checkpoint prompt, without restarting.

Do not re-run the whole inference. The point of the referential/canonical split is
that the operator can nudge a specific piece across the line at the checkpoint
without paying for a full rebuild.

Iterate until approved. This is a draft a human reviews, never a silent decision.

## Step 4 — Scaffold

**Docs**, from `templates/common/`, keeping only the sections that apply to the one
chosen platform:

| Template | Becomes |
| --- | --- |
| `README.template.md` | `README.md` |
| `GETTING-STARTED.template.md` | `GETTING-STARTED.md` |
| `AGENTS.template.md` | `AGENTS.md` |
| `CLAUDE.template.md` | `CLAUDE.md` |
| `cursor-rules-agents.mdc.template` | `.cursor/rules/agents.mdc` |
| `DESIGN.template.md` | `DESIGN.md` |
| `IMPLEMENT.web.template.md` | `IMPLEMENT.web.md` |
| `TONE-OF-VOICE.template.md` | `TONE-OF-VOICE.md` |

`AGENTS.md` is the canonical spec-for-agents — meaningful content lives here.
`CLAUDE.md` is now a **pointer** that keeps Claude Code's file-discovery working;
it names AGENTS.md as the source of truth and stays under 10 lines. The Cursor
rule is the equivalent pointer for Cursor's rule engine — an `alwaysApply: true`
rule that points at AGENTS.md and names the two maintenance runbooks by intent.

**`DESIGN.md` and `IMPLEMENT.web.md` are the important ones.** Seed DESIGN.md from
`DESIGN.template.md` with the confirmed identity values, and IMPLEMENT.web.md from
`IMPLEMENT.web.template.md` with the confirmed behaviour values. Everything not
confirmed at the checkpoint keeps the template's default, because those defaults
come from `DEFAULTS.md` and are already correct. Four things not to break:

- **Line heights are always a dimension, never a unitless multiplier.** The exporter
  silently drops unitless line heights from every output format — no warning, no
  error, they simply do not appear. The template has this right; do not "tidy" it.
- **Responsive behaviour lives in `IMPLEMENT.web.md`, not `DESIGN.md`.** Don't put
  breakpoint-dependent values in DESIGN.md — no `-lg` suffixed twins, no
  `breakpoint-large`, no `container-max`. Those belong in IMPLEMENT.web.md's
  `responsive`, `breakpoints` and `container` blocks. DESIGN.md is identity.
- **Every `responsive.*` reference in IMPLEMENT.web.md must name a token that exists
  in DESIGN.md.** `/sync-tokens` fails the run on a dangling reference at emission
  time, which is the right time to catch it — before four surfaces have been
  written from a broken source.
- **Keep the trailing `#` comments on DESIGN.md token lines.** They are the Figma
  variable descriptions. Substituting a placeholder must not strip the comment
  on that line. Adding a new token without a usage note is fine — the field
  stays empty. Inventing a comment is not.

**Structure:**

- `concepting/` and `detailed-design/`, **both**, each with a one-line README saying
  what belongs there. Both exist whichever phase is active — detailed-design work
  sometimes needs a step back into concepting, and a missing folder at that moment is
  friction for no reason.
- `shared/`, with a README carrying the copy-from-here-never-import rule.
- Web only: `hub/index.html`, the `start-mac.command` and `start-windows.bat`
  launchers, an instantiated `HANDOVER.md` into `hub/`, and
  `templates/web-app/scripts/build-static.sh` into `scripts/` with the concept list
  filled in.

**The concept app**, following the one applicable procedure **exactly** — they encode
hard-won failures and are not a starting point to improvise from:

- Web: `templates/web-app/SCAFFOLD.md` — static export, the `asset()` helper, stitching.
- Native: `templates/expo-app/SCAFFOLD.md` — pin the SDK to the live Expo Go SDK first.

**Fonts.** Copy supplied files from `_setup/fonts/` into `shared/fonts/` and into the
app, and wire them per the stack procedure. Those copies **are** committed even though
`_setup/fonts/` is ignored — a joiner cloning the repo should see the real typeface
rather than a silent fallback. No files supplied → wire Inter as a placeholder and
record the swap in DESIGN.md's "Still to decide".

**Committed maintenance surfaces.** For each of the two maintenance commands
(`sync-tokens`, `figma-library-push`), emit three files into the generated repo:

- `.agents/runbooks/<name>.md` — copied verbatim from the runbook template at
  `templates/common/runbooks/<name>.md.template` with placeholders substituted.
  **This is the canonical procedural content**, agent-agnostic prose, single
  source of truth.
- `.claude/skills/<name>/SKILL.md` — copied from the adapter under
  `plugins/project-setup/skills/<name>/SKILL.md` (already thin: frontmatter for
  Claude Code discovery plus a body that points at the runbook). Do not copy the
  old fat SKILL.md content — the runbook is the truth now.
- **No per-command Cursor file.** The always-applied rule at
  `.cursor/rules/agents.mdc` covers both runbooks by naming them by intent.

A joiner should install nothing: they clone the repo and the commands that
maintain it are already there. This is true regardless of which supported agent
they use — Claude Code, Cursor, or Codex CLI.

## Step 5 — Lint

```bash
npx --yes @google/design.md lint DESIGN.md
```

**Zero errors is required.** Do not proceed past an error and do not work around one.

`IMPLEMENT.web.md` is not linted by the design.md CLI — its shape is ours, not
Google's. `/sync-tokens` parses it as YAML at emission time and fails the run
on either a parse error or a `responsive.*` reference that names a token not
present in `DESIGN.md`. A typo in IMPLEMENT.web.md is caught before any surface
is written.

**Exactly five warnings are expected**, and they are allowlisted by name in
`DEFAULTS.md` under `expected-lint-findings`: one `token-like-ignored` on `extensions`,
and four `orphaned-tokens` on `colors.line-primary`, `colors.state-hover`,
`colors.state-pressed` and `colors.state-selected`. Each has a recorded reason.

**Anything outside those five is a real finding and must be reported.** Do not add it
to the allowlist. Five named exceptions with recorded reasons is auditable; "there are
always some warnings" trains a team to skim the report, and then a genuine finding
goes unnoticed.

The failure worth anticipating: **a contrast error on a brand colour.** The linter
fails component text-on-background pairs below 4.5:1, and a brand primary with white
text at 4.1:1 is common and real. **Do not quietly darken the brand colour to pass.**
Report it plainly — "Acme's red at #E8112D gives 4.1:1 against white text, below the
4.5:1 floor" — and offer the honest options: darken it slightly for UI use while
keeping the brand red for large display type, use dark text on it instead, or accept
and record it. That is a design decision, not a lint fix.

## Step 6 — Emit

Generated whole, overwritten in place, never merged into.

**Web** — `styles/tokens.css`: one `--kebab-name` per token on `:root` from
DESIGN.md, plus `.t-<style>` classes per typography entry. Overrides come from
`IMPLEMENT.web.md`'s `responsive` table, wrapped in a `@media` block whose
threshold is `breakpoints.large`. Screens reference one name at every width:

```css
:root { --space-lg: 24px; }
@media (min-width: 960px) { :root { --space-lg: 32px; } }
```

The base value (`24px`) comes from `spacing.lg` in DESIGN.md; the override
(`32px`) comes from `responsive.spacing.lg."@large"` in IMPLEMENT.web.md;
the threshold (`960px`) comes from `breakpoints.large` in IMPLEMENT.web.md. All
three are read live — never hardcoded here.

Tailwind emission follows the same rule: names map to `var(--…)`, so the media
query above is the single place a responsive value is decided.

**Native** — `src/theme/tokens.js`, a generated JS module the hand-written
`tailwind.config.js` requires. **Base values only** in v1 — native has no
`IMPLEMENT.native.md`, and the responsive tier is a web concern.

**Both** — the `extensions` block (motion, opacity, border, focus geometry) is silently
dropped by the official exporter, so emit those values yourself.

## Step 7 — Figma

Skip entirely and report as skipped if no Figma URL was given. It is optional, and a
project without it is still a working project.

Otherwise: check the connector with `whoami`, note the plan tier, then invoke
**figma-library-push**. Follow it exactly — the Primitives, Colour and Scale
collections, the Large-mode source (IMPLEMENT.web.md's `responsive` block),
scopes, code syntax, variable descriptions, the font recipe, specimen sheets
and the lock file shape all live there and are not restated here.

Starter-tier files allow one mode per collection: push Small (base) values only,
note the limitation in DESIGN.md, and tell the operator.

Installing brand fonts into Figma and publishing the library are **always human** — no
API exists. They go on the hand-off checklist and are never attempted programmatically.

## Step 8 — Verify

Walk this and fix failures before finishing. An unverified scaffold is a guess.

- [ ] The app boots. Web: `npm run dev` renders the starter page. Native: the Expo QR
      renders StarterScreen on a phone. Tokens and fonts **visibly** applied.
- [ ] **Screenshot a rendered screen** and look at it. This catches the whole class of
      failures where every file is correct and the result still looks wrong.
- [ ] Web only: `./scripts/build-static.sh` succeeds, `dist/start-mac.command` opens
      the hub, the concept loads, and an `asset()` image returns 200 under its
      sub-path.
- [ ] Figma: `get_variable_defs` on all token sheets returns the pushed tokens at the
      right values per mode. Primitives, Colour, and Scale sheets all present.
- [ ] Figma: specimen sheets (Colour, Type, Spacing) created on the "Specimens" page,
      swatches bound to live variables.
- [ ] `tokens.lock.json` written, keyed by the active phase.
- [ ] `IMPLEMENT.web.md` written, no `{{…}}` remaining, and every
      `responsive.*` reference names a token that exists in DESIGN.md.
- [ ] `AGENTS.md` written, meaningful content (~140 lines), no `{{…}}` remaining.
- [ ] `CLAUDE.md` is a short pointer to `AGENTS.md` (under 10 lines), not a copy
      of the substantive content.
- [ ] `.cursor/rules/agents.mdc` written, `alwaysApply: true`, names both
      runbooks by intent.
- [ ] `.agents/runbooks/sync-tokens.md` and `.agents/runbooks/figma-library-push.md`
      written, no `{{…}}` remaining.
- [ ] `.claude/skills/sync-tokens/SKILL.md` and
      `.claude/skills/figma-library-push/SKILL.md` adapters written, frontmatter
      intact, body under 15 lines.
- [ ] No `{{…}}` placeholders and no `setup-skill` comments anywhere in the output.
- [ ] DESIGN.md's "Still to decide" reflects every gap. README links resolve.

## Step 9 — Hand off

**Stamp `SETUP.md` superseded, in place.** Insert at the top, keeping the rest of the
file exactly as it is:

```markdown
> **Superseded on 7 August 2026.** This sheet was the input to /project-create and is
> kept as a record of what was decided at setup. It is not the answer to "what is this
> value now" — that is DESIGN.md (identity) and IMPLEMENT.web.md (web behaviour).
```

Keeping it matters: it answers "what did we decide at setup", which is a different and
sometimes important question. What it must not do is stay live, because then the
spacing base is written in two places and they will disagree.

Then print, in plain language: what exists and how to open it, what was skipped and
why, and what is outstanding. **Describe outstanding work in prose rather than naming
commands** — `/project-check` and `/project-share` do not exist yet, and pointing at a
command that cannot be run is worse than pointing at nothing.

Always include the human-only items: install or upload the brand fonts in Figma,
publish the library so other files can subscribe, and review the "Still to decide"
list in DESIGN.md.

The project works out of the box in Claude Code, Cursor and Codex CLI. Anyone
using a different agentic assistant can point it at `AGENTS.md`.

Offer to commit. Do not commit unasked.

## Rules

- **Never lorem ipsum.** Placeholder copy follows TONE-OF-VOICE.md.
- **One platform per project.** The sheet says which. Do not scaffold both.
- **Ask before deciding anything load-bearing** — nav model, core layout,
  brand-critical colour. Small gaps take the smallest plausible choice plus a
  `TODO(design)` and a DESIGN.md entry.
- **No production scope**: no backend, auth, analytics, tests, CI, or deploy config
  beyond the static build.
- Flag anything a client would notice in a walkthrough **before** it ships in one.
- Every printed string is read by a designer. "The app runs" not "build succeeded with
  exit code 0".
- **The project is agent-agnostic.** Do not restate substantive content in
  `CLAUDE.md`; do not create per-command Cursor files (the always-apply rule at
  `.cursor/rules/agents.mdc` covers all runbooks). `AGENTS.md` and the runbooks
  under `.agents/runbooks/` are the single source of truth for their respective
  content.
