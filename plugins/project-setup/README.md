# project-setup — a Claude Code plugin

> **Status: personal experiment, shared for testing.** Not an official agency tool
> (yet). Feedback and bug reports → Calvin Teoh.

A Claude Code plugin that scaffolds a **new prototyping project** across both
surfaces design teams work in — a **GitHub repo** (Expo and/or Next.js concept apps,
designer-friendly docs, launchers, hub page) and a **Figma design library**
(variables, text styles, token sheets) — then keeps design tokens **in sync between
the two** with `/sync-tokens`.

Distilled from two shipped agency prototyping engagements: a native-mobile
(React Native / Expo) project and a responsive-web (Next.js, 11 stitched concept
apps) project.

## Who runs what

- **Setup operator (you, reading this):** one semi-technical person per project runs
  `/project-setup` once. You need the prerequisites below.
- **Everyone else** (designers, writers, PMs): they never touch this plugin. The
  scaffolded repo's `GETTING-STARTED.md`, launchers, and docs are their interface.
  `/sync-tokens` is designed to be runnable by anyone once the project exists.

## Install (one-time)

In Claude Code:

```
/plugin marketplace add calteoh/prototype-tools
/plugin install project-setup@prototype-tools
```

Update later with `/plugin marketplace update prototype-tools`.

## Prerequisites (gather before running /project-setup)

1. **A git repo** for the project (wherever your team hosts git) — created and empty.
2. **An empty Figma design file** that will become the design library, in the
   client's team/org space.
3. **Figma connector authorized** in Claude (claude.ai connectors → Figma). The whole
   Figma side runs through the official connector — no desktop plugin needed. Note:
   light/dark **modes need an org/enterprise Figma plan**; a starter-tier file gets
   light-only.
4. **Brand materials**: PDFs, screenshots, Figma links, or public URLs the token
   draft can be inferred from.
5. **Font files** for the brand faces (or accept placeholders).
6. Optional: a **Notion link** with tone-of-voice / copy source (Notion connector
   authorized if so).

Then, in an empty project folder: run `/project-setup` and follow the interview.

## What you get

```
<project-repo>/
├── README / GETTING-STARTED / CLAUDE.md / DESIGN.md / TONE-OF-VOICE.md
├── shared/                    # fonts, logos, exports — copy from, never import
├── concepting/<concept-app>/  # self-contained Expo and/or Next.js app, tokens wired
├── hub/ + scripts/            # (web) static hub page, launchers, build-static.sh
└── …tokens.json + tokens.lock.json inside each app
```

…and a populated Figma library with Primitives + Semantic collections, text styles,
and "Tokens" sheet frames — verified by read-back.

## The commands

| Command | What it does |
|---|---|
| `/project-setup` | The full scaffold, run once per project. |
| `/figma-library-push` | (Re)build the Figma library from tokens.json; writes the sync baseline. |
| `/sync-tokens` | Bidirectional Figma↔code token sync — three-way diff, plain-language conflicts. |
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

- `skills/` — the four commands above (each a SKILL.md recipe Claude follows).
- `templates/` — docs, hub page, launchers, token schema, and the Expo/web scaffold
  procedures the skills instantiate.
- Design rationale for the Figma integration lives in the repo's
  [`docs/SPIKE-FINDINGS.md`](../../docs/SPIKE-FINDINGS.md) — what the official Figma
  MCP can and can't do, verified.

## Versioning

Bump `.claude-plugin/plugin.json` `version` on any behavior change; note it in the
commit. Installed users pick changes up via
`/plugin marketplace update prototype-tools`.
