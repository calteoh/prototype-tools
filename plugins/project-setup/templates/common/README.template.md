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
├── CLAUDE.md              ← working conventions (read before building / with Claude)
├── DESIGN.md              ← design-system decisions & open questions
├── TONE-OF-VOICE.md       ← copy guidelines (drives all mock content)
├── shared/                ← cross-phase reference & source assets (copy from, don't import)
├── {{PHASE_1_FOLDER}}/    ← Phase 1 (active)
└── {{PHASE_2_FOLDER}}/    ← Phase 2 (placeholder)
```

Each **phase** is a top-level folder. Inside a phase, each **concept** is its own
self-contained app — "cd in and run." Concepts are siblings, not dependencies: if two
share something, copy it, don't import across them.

## Design tokens

Design-system values (colors, type, spacing) live in **one canonical file per app**
(`tokens.json`) and in the project's **Figma design library** — kept aligned with the
`/sync-tokens` command. See [`DESIGN.md`](DESIGN.md) before changing any of them.

- **Figma design library:** {{FIGMA_LIBRARY_URL}}

## Current status

- **Phase:** {{CURRENT_PHASE}}
- **Deliverable:** {{CURRENT_DELIVERABLE}}
- **Platform target:** {{PLATFORM_TARGET}}

## Where to look next

| If you want to… | Go to |
|---|---|
| Get set up and run a prototype | [`GETTING-STARTED.md`](GETTING-STARTED.md) |
| Understand the stack, conventions, and do/don'ts | [`CLAUDE.md`](CLAUDE.md) |
| See design-system decisions and to-dos | [`DESIGN.md`](DESIGN.md) |
| Write or edit copy | [`TONE-OF-VOICE.md`](TONE-OF-VOICE.md) |
| Reuse a font, logo, or exported frame | [`shared/`](shared/) |
