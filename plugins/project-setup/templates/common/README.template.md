<!-- setup-skill: agent-instantiated. Replace {{...}}, keep only the stack rows that
     apply, fill the structure tree with the real folders you scaffolded, delete these
     comments. Never leave a {{...}} in the committed file. -->
# {{PROJECT_NAME}} — Prototypes

Design prototypes for **{{PROJECT_NAME}}** — {{ONE_LINE_PROJECT_DESCRIPTION}}.

These are **{{PROTOTYPE_KIND}}**: {{PROTOTYPE_EXPLANATION}}. They exist to make design
concepts feel real — **high visual fidelity, not production code.**

> **New to running prototypes? Start here → [`GETTING-STARTED.md`](GETTING-STARTED.md)**
> It assumes zero prior experience and walks you from nothing to a running prototype.

## Run the current prototype (30-second version)

```bash
cd {{CURRENT_CONCEPT_PATH}}
npm install        # first time only
{{RUN_COMMAND}}
```

## How this repo is organized — by **phase**

```
{{REPO_NAME}}/
├── README.md              ← you are here
├── GETTING-STARTED.md     ← beginner onboarding
├── AGENTS.md              ← canonical spec-for-agents (any AI assistant reads this first)
├── CLAUDE.md              ← one-paragraph pointer to AGENTS.md
├── DESIGN.md              ← design-system identity (colours, base type, base spacing, motion)
├── IMPLEMENT.web.md       ← design-system web behaviour (breakpoints, responsive overrides, grid)
├── TONE-OF-VOICE.md       ← copy guidelines (drives all mock content)
├── .cursor/rules/         ← Cursor's always-apply rule pointing at AGENTS.md
├── .agents/runbooks/      ← agent-agnostic procedures (sync-tokens, figma-library-push)
├── shared/                ← cross-phase reference & source assets (copy from, don't import)
├── {{PHASE_1_FOLDER}}/    ← Phase 1 (active)
└── {{PHASE_2_FOLDER}}/    ← Phase 2 (placeholder)
```

Each **phase** is a top-level folder. Inside a phase, each **concept** is its own
self-contained app — "cd in and run." Concepts are siblings, not dependencies: if two
share something, copy it, don't import across them.

## For AI agents

This project is **agent-agnostic**. [`AGENTS.md`](AGENTS.md) at the repo root is
the canonical spec-for-agents — any AI assistant should read it first. Three
targets are wired out of the box: **Claude Code** (via `CLAUDE.md`'s pointer and
the `/sync-tokens` and `/figma-library-push` slash commands), **Cursor** (via
the always-apply rule at `.cursor/rules/agents.mdc`), and **Codex CLI** (which
reads `AGENTS.md` natively). Anything else — point it at `AGENTS.md`. The
maintenance procedures live as plain markdown at
[`.agents/runbooks/`](.agents/runbooks/) so any agent can follow them.

## Design tokens

Design-system values live in **two canonical files for the whole project** —
[`DESIGN.md`](DESIGN.md) for **identity** (colours, base type sizes, base
spacing, motion durations and easings) and
[`IMPLEMENT.web.md`](IMPLEMENT.web.md) for **web behaviour** (breakpoints,
container max, responsive typography and spacing, plus placeholders for motion
assignments, grid, component responsive behaviour, image aspects and colour
modes). The app's CSS custom properties (with `@media` overrides), its
Tailwind theme and the project's **Figma design library** are all generated
from the pair by the sync-tokens runbook (Claude Code: `/sync-tokens`; Cursor /
Codex / others: follow [`.agents/runbooks/sync-tokens.md`](.agents/runbooks/sync-tokens.md)),
and none of them should ever be edited by hand.

That includes Figma. In this version tokens flow one way — out of the two
canonical files — so a variable changed in Figma will be overwritten the next
time anyone syncs. Change the value in DESIGN.md (identity) or
IMPLEMENT.web.md (behaviour) and let it propagate.

- **Figma design library:** {{FIGMA_LIBRARY_URL}}

## Current status

- **Phase:** {{CURRENT_PHASE}}
- **Deliverable:** {{CURRENT_DELIVERABLE}}
- **Platform target:** {{PLATFORM_TARGET}}

## Where to look next

| If you want to… | Go to |
|---|---|
| Get set up and run a prototype | [`GETTING-STARTED.md`](GETTING-STARTED.md) |
| Understand the stack, conventions, and do/don'ts (or brief an AI agent) | [`AGENTS.md`](AGENTS.md) |
| See design-system identity (colours, type, spacing) | [`DESIGN.md`](DESIGN.md) |
| See design-system web behaviour (breakpoints, responsive overrides) | [`IMPLEMENT.web.md`](IMPLEMENT.web.md) |
| Write or edit copy | [`TONE-OF-VOICE.md`](TONE-OF-VOICE.md) |
| Reuse a font, logo, or exported frame | [`shared/`](shared/) |
