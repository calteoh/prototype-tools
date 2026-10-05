# project-setup — a Claude Code plugin

> **Status: personal experiment, shared for testing.** Not an official agency tool
> (yet). Feedback and bug reports → Calvin Teoh.

A Claude Code plugin that scaffolds a **new prototyping project** across both
surfaces design teams work in — a **git repo** (a Next.js or Expo concept app,
designer-friendly docs, launchers, hub page) and a **Figma design library**
(variables, text styles, token sheets) — with `DESIGN.md` as the one canonical source
that `/sync-tokens` pushes out to both.

**One platform per project**: responsive web is comprehensively supported, native gets
basic support in v1. The repo starts **local** — `git init` needs no ticket, and a
hosted remote gets attached whenever it turns up.

Distilled from two shipped agency prototyping engagements: a native-mobile
(React Native / Expo) project and a responsive-web (Next.js, 11 stitched concept
apps) project.

The plugin itself runs in Claude Code. **Generated projects are agent-agnostic:**
`AGENTS.md` is the canonical spec-for-agents; Claude Code, Cursor and Codex CLI
are first-class out of the box (via a `CLAUDE.md` pointer, an always-apply Cursor
rule at `.cursor/rules/agents.mdc`, and Codex's native `AGENTS.md` read); anything
else that reads `AGENTS.md` works too. Maintenance procedures live once at
`.agents/runbooks/` and are followed identically by every agent.

## Who runs what

- **Setup operator (you, reading this):** one semi-technical person per project runs
  `/project-start`, gathers materials over however many days that takes, then runs
  `/project-create`.
- **Everyone else** (designers, writers, PMs): they never touch this plugin. The
  scaffolded repo's `GETTING-STARTED.md`, launchers, and docs are their interface.
  `/sync-tokens` is designed to be runnable by anyone once the project exists, and it
  is committed into the generated repo so a joiner installs nothing.

## Install (one-time)

In Claude Code:

```
/plugin marketplace add calteoh/prototype-tools
/plugin install project-setup@prototype-tools
```

Update later with `/plugin marketplace update prototype-tools`.

## How it runs

**Two commands, with your own gathering time in between.**

```
/project-start   →   gather materials (days, or minutes)   →   /project-create
```

`/project-start` asks six short questions and makes a `_setup/` folder with a
pre-filled settings sheet and four folders to drop things into. `/project-create`
reads all of that and builds the project. The gap between them exists because brand
material arrives when it arrives, and a single command would have to either block on
that or pretend it did not happen.

**What you need to begin:** an empty folder on your machine and a project name. That
is genuinely it. `git init` is local, instant, and needs no ticket.

**What makes the result better, none of it blocking:**

- Brand materials — PDFs, screenshots, Figma links, public URLs
- The font files for the brand faces
- An empty Figma design file in the client's team space, to become the design library
- The brief or kickoff notes
- Optional: a Notion link for tone of voice (Notion connector authorized if so)

You can run `/project-create` with an empty `_setup/` folder and get a working
prototype on neutral defaults. Gathering first gets you one that looks like the
client.

**Figma notes.** Authorize the connector in Claude (claude.ai → Settings →
Connectors → Figma); the whole Figma side runs through it, with no desktop plugin.
**Multiple modes per collection need an org/enterprise plan** — on a starter-tier file
the two layout modes collapse to Small only, and Large becomes a code-only concern.

## What you get

```
<project-repo>/
├── README / GETTING-STARTED / CLAUDE.md / DESIGN.md / TONE-OF-VOICE.md
├── shared/                    # fonts, logos, exports — copy from, never import
├── concepting/<concept-app>/  # self-contained Next.js or Expo app, tokens wired
├── hub/ + scripts/            # (web) static hub page, launchers, build-static.sh
└── tokens.lock.json           # what Figma holds, keyed by phase
```

`DESIGN.md` is canonical — its front matter holds every token value. The CSS custom
properties, the Tailwind/NativeWind theme and the Figma library are all generated from
it and are never hand-edited. **One platform per project**: responsive web is fully
supported, native gets basic support.

…and a populated Figma library with a Colour collection (one mode) and a Scale
collection (Small and Large), text styles, and mode-pinned "Tokens" sheet frames —
verified by read-back.

## The commands

| Command | What it does |
|---|---|
| `/project-start` | Seven questions (including how you're starting — from canonical brand materials, or from a description plus references), then a git repo and a `_setup/` folder to drop materials into. Builds nothing. |
| `/project-create` | Reads the settings sheet and the dropped materials and builds the project. Stops once, to confirm the colours it inferred. |
| `/figma-library-push` | (Re)build the Figma library from DESIGN.md; writes the phase-keyed lock file. |
| `/sync-tokens` | Regenerate everything derived from DESIGN.md — CSS, theme, Figma, lock file. One direction; Figma is not read back in v1. |
| `/import-copy` | One-way import of writer content (Notion → repo markdown). |

## Troubleshooting

- **Figma tools missing / unauthorized** → claude.ai → Settings → Connectors →
  Figma. Re-run.
- **"mode … not defined for variable"** during a push → known: a mode id from the
  wrong collection; the skills guard against it, but if you hand-script Figma writes,
  resolve mode ids from the variable's own collection.
- **Managed/IT-locked Mac, Expo preview fails** → the scaffolded GETTING-STARTED.md
  covers it (`--tunnel` for phones, `--localhost` for the Simulator).
- **Corrupted or conflicted tokens.lock.json** → never hand-fix; re-run
  `/figma-library-push` to re-baseline.

## What's in this folder

- `skills/` — the five commands above (each a SKILL.md recipe Claude follows).
- `templates/` — docs, the settings sheet, hub page, launchers, and the Expo/web
  scaffold procedures the skills instantiate.
- `DEFAULTS.md` — every defaulted value, in one place. Skills read it rather than
  restating numbers, so a template and a skill can't disagree.
- Design rationale for the Figma integration lives in the repo's
  [`docs/SPIKE-FINDINGS.md`](../../docs/SPIKE-FINDINGS.md) — what the official Figma
  MCP can and can't do, verified.

## Versioning

Bump `.claude-plugin/plugin.json` `version` on any behavior change; note it in the
commit. Installed users pick changes up via
`/plugin marketplace update prototype-tools`.
