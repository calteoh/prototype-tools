---
name: project-setup
description: Scaffold a new agency prototyping project end to end — repo structure, designer-friendly docs, Expo and/or Next.js concept apps, brand-derived design tokens, and a populated Figma design library. Use when the user asks to set up a new prototyping project, initialize a project repo, or run project setup. Run by one semi-technical "setup operator"; the resulting repo serves designers, writers, and PMs.
---

# /project-setup — scaffold a prototyping project

You are setting up a **concepting-phase prototyping project** for an agency design
team. The output must let a designer open the repo tomorrow and start building with
AI, guided only by the docs you generate. High visual fidelity, not production code.

Templates live at `${CLAUDE_PLUGIN_ROOT}/templates/` (fall back to `../../templates/`
relative to this file). Read a template before instantiating it; every template's
`{{PLACEHOLDER}}` must be resolved and every `<!-- setup-skill: -->` comment removed
in the committed output.

## Step 0 — Preflight (hard-stop on failure)

Verify, in this order, and stop with a clear fix-it message if any fails:

1. **Figma connector**: call the Figma MCP `whoami`. Note the plan tier — mode limits
   depend on it (enterprise = full light/dark modes; starter = 1 mode per collection).
2. **Inputs from the operator** (ask for any that are missing):
   - Git repo URL (created beforehand, wherever your team hosts git) — or confirm local-only
     for now.
   - **Empty Figma design file** URL to become the design library.
   - Brand materials: PDFs, screenshots, Figma file URLs, or public web URLs.
   - Font files (or "use placeholders for now").
   - Optional: Notion link for tone-of-voice / copy source.
3. **Working directory**: an empty or new folder for the repo.

## Step 1 — Intake interview

One AskUserQuestion round (add a second only if answers conflict):

- **Project + client name**, one-line description.
- **Stack**: React Native (Expo) / responsive web (Next.js) / both.
- **Phases**: default `concepting/` active + `detailed-design/` placeholder.
- **Dark mode**: default **off** (halves the token surface; DESIGN.md records it as
  a to-do).
- **Breakpoint modes** (web): default single scale.
- **Spacing base**: default 8px. **Typescale**: default the minimum viable set in
  `tokens.example.json`.

Record every answer; they feed the templates. Anything answered "not sure" becomes a
`TBD` in the docs, never an invented value.

## Step 2 — Repo scaffold

1. `git init`, sensible `.gitignore` (node, `.expo`, `.next`, `dist/`, `out/`).
2. Instantiate from `templates/common/`: `README.template.md` → `README.md`,
   `GETTING-STARTED.template.md` → `GETTING-STARTED.md` (keep only applicable stack
   sections), `CLAUDE.template.md` → `CLAUDE.md`, `DESIGN.template.md` → `DESIGN.md`,
   `TONE-OF-VOICE.template.md` → `TONE-OF-VOICE.md`.
3. Create phase folders + `shared/` (with a one-line README: "copy from here, never
   import").
4. Web projects: copy `templates/common/hub/index.html` → `hub/index.html`,
   launchers + instantiated `HANDOVER.template.md` → `hub/`, and
   `templates/web-app/scripts/build-static.sh` → `scripts/`, concept list filled in.
5. Connect the remote if a URL was supplied. Commit when the operator confirms.

## Step 3 — Concept app scaffold(s)

Follow the stack procedure(s) **exactly** — they encode hard-won failures:

- Expo: `templates/expo-app/SCAFFOLD.md` (SDK pinning to live Expo Go first).
- Web: `templates/web-app/SCAFFOLD.md` (static export, `asset()` helper, stitching).

## Step 4 — Brand ingestion → tokens.json (draft, then review)

1. Read every supplied brand material (PDFs/images with Read, Figma URLs with the
   Figma read tools, web URLs with WebFetch).
2. Propose a draft: primitives (color palette with kebab names), semantic mappings
   (`fg/…`, `surface/…`, `brand/…`, `line/…`), `fontFamily`, and the typescale —
   shaped per `templates/common/tokens/TOKENS-FORMAT.md`.
3. **Present the draft as a table with sources** ("red-600 #E8112D — from brand PDF
   p.4") and get explicit operator approval; iterate until approved. This is a draft
   a human reviews, never a silent decision.
4. Write `tokens.json` into each app (`src/theme/` for Expo, `styles/` for web) and
   emit the surfaces: the Expo tailwind config already consumes it; for web, emit
   `styles/tokens.css`.
5. Values with no source in the materials: pick the smallest plausible option, mark
   the token with a `-tbd` comment in DESIGN.md's "To decide" list.

## Step 5 — Fonts

Copy supplied font files into `shared/fonts/` + each app; wire per stack procedure.
No files supplied → wire a free placeholder (e.g. Inter) and record the swap as a
DESIGN.md to-do. Figma-side font installation is **always human** — it goes on the
final checklist, never attempted programmatically.

## Step 6 — Figma design library

Invoke the **figma-library-push** skill against the supplied Figma file. It creates
collections, variables (with code syntax), text styles, and the token-sheet frames,
verifies by read-back, and writes `tokens.lock.json`.

## Step 7 — Definition of done (walk it, print it)

Print this checklist with pass/fail, fixing failures before finishing:

- [ ] App(s) boot: Expo → QR scan renders StarterScreen on a phone; web →
      `npm run dev` renders starter page. Tokens + fonts visibly applied.
- [ ] Web only: `./scripts/build-static.sh` succeeds; `dist/start-mac.command` opens
      the hub; concept loads with images intact.
- [ ] Figma: `get_variable_defs` on the token sheets returns the pushed tokens;
      `tokens.lock.json` exists.
- [ ] Docs: no `{{…}}` or `setup-skill` comments left anywhere; DESIGN.md "To decide"
      reflects every TBD; README links resolve.
- [ ] Human hand-off list printed: install/upload brand fonts in Figma, publish the
      library, review DESIGN.md to-dos, hub visual design pending.

## Rules

- **Never lorem ipsum** — placeholder copy follows TONE-OF-VOICE.md.
- **Ask before deciding anything load-bearing** (nav model, core layout,
  brand-critical). Small gaps: smallest plausible choice + `TODO(design)` + DESIGN.md
  entry.
- **No production scope**: no backend, auth, analytics, tests, CI, deploy config
  beyond the static build.
- Flag anything a client would notice in a walkthrough **before** it ships in one.
