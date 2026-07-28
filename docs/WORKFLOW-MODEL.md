# The workflow model — how a designer moves through an AI-assisted project

The journey this plugin is built to serve, from a project spinning up to a design
system evolving over months. Written at the workflow altitude: what the human does and
why, not what the skills do. Implementation follows this, not the other way round.

The visual version lives in the FigJam board "Figma — Claude Project Setup"
(section *Proposed journey v1*).

## The shape: a line and a loop, sharing a spine

Setup is a line you walk once. Evolution is a loop you walk forever. They're joined by
a **spine** — the persistent context surfaces that setup creates and evolution feeds.

```
  A. Founding operator ──▶ PREFLIGHT ──▶ INTAKE ──▶ SCAFFOLD ──┐
     (post-RFP/discovery)   the gate    the brief   the build   │
                                          ↻ resumable           ▼
  B. Joiner ─────────────────────────────────────────────▶ ORIENT
     (project exists)                                           │
                                                                ▼
                                                       ✦ DESIGN WORK ✦
                                                                │
                                              ┌───── EVOLVE ────┴──────┐
                                              │ capture → audit →      │
                                              │ decide → propagate →   │
                                              │ record ──┐             │
                                              └──────────┴─ next lap ──┘

  SPINE: references/ (+INGESTED.md) · BRIEF.md · DESIGN.md ·
         tokens.json + tokens.lock.json · Figma library · shared/
```

**Design work sits in the middle on purpose.** The loop exists to keep foundations
honest while real design happens. If the map reads as pure plumbing, the tooling has
been mistaken for the point.

## Two entry points

**A — the founding operator.** Post-RFP or post-discovery. One semi-technical person
sets up the workspace from zero and walks the whole line.

**B — the joiner.** The project already exists; a designer onboards in month three and
needs to get running. They enter at **Orient** and skip the setup line entirely.

This distinction matters more than it looks: over a project's life, **one person sets
up and five people join**. Orient is therefore run once per *person*, not once per
project, and it carries more of the adoption load than setup does.

## The five stages

### 1 · Preflight — the gate
*What can't I proceed without?*

Project and client name · platform (responsive web / native / both) · **a folder on your
machine** · an empty Figma design file · connectors authorised.

**The rule that defines this stage: preflight is what blocks the first hour.** Only what
the agent cannot create for you, and only what you genuinely can't start without. That
keeps the front door to about four questions instead of twenty.

*Out → a local repo and a Figma library, both live in minutes.*

#### Blocking vs parallel — never gate on org provisioning

A git repo is **not** a GitHub repo. `git init` is local, instant, and needs no ticket,
no network, and no permission — the whole dry run (docs, tokens, Figma push, static
build, sync round trip) ran on a local repo with no remote.

Org-provisioned things — a git remote (often 2–3 days), Figma seats for the client team,
font licences, Notion access — go on a **parallel track**: filed on day 0, checkpointed
later, blocking nothing. A gate that waits on the slowest organizational dependency
isn't a gate, it's a stall.

The remote's checkpoint sits at **Orient**, which is exactly when other people need
access:

```bash
git remote add origin <url> && git push -u origin main
```

Full history transfers; nothing from days 0–2 is redone. Request the repo **empty** — an
auto-created README diverges the histories and costs you a rebase on day 3.

While local-only, back the work up: Time Machine, or
`git bundle create backup.bundle --all` into cloud storage. **Never let a file-sync
client live-sync an active `.git` directory** — it corrupts silently.

Preflight should also emit the **repo request text** (name, private, org/team, access
list, "create empty"), because a rejected request restarts the 2–3 day clock.

### 2 · Intake — the brief
*What informs the foundations, and what do we decide up front?*

Materials go into **`references/`** — brand, fonts, icons, inspiration, content, plus a
`links.md` for the things that are URLs rather than files. The agent **reads what's
there first**, then asks only the gaps it couldn't infer. Decisions get made here too:
dark mode, breakpoints, spacing base, typescale, phases, and the source-of-truth table.

Two properties make or break this stage:

- **No question blocks progress.** Unanswered becomes a recorded gap in DESIGN.md, not
  a stop. A fixed questionnaire is a wall, and designers bounce off walls.
- **It is resumable.** Materials arrive over days — the licensed font lands Thursday.
  The stage must survive being left and returned to.

*Out → `BRIEF.md` (what I understood about this project) + `INGESTED.md` (what was
read, when, and what it produced).*

`BRIEF.md` answers the original spec's open question about minimum viable context: the
brief **is** that context, and CLAUDE.md just routes to it.

### 3 · Scaffold — the build
*What actually gets created?*

Repo and docs · concept app(s) (Expo pinned to the live Expo Go SDK, and/or Next.js
static export) · `tokens.json` emitted to CSS custom properties and/or a Tailwind theme
· the Figma library (collections, light/dark modes, text styles, token sheets) · the
review hub page and double-click launchers.

*Out → a repo that runs, a library designers can use, and `tokens.lock.json` — the
baseline every future sync diffs against.*

### 4 · Orient — the handoff
*How do I actually work in this?*

Run it and see it in the first minute · a tour of where tokens, mock data, and
decisions live · the one command you'll use most · what's still open in DESIGN.md · the
human checklist (install fonts in Figma, publish the library — no API does these).

Scaffold ends when the agent stops; orient is where the human starts. Different actor,
often a different day, sometimes a different person entirely.

*Out → a person who can work unaided.*

### 5 · Evolve — the loop
*How do decisions propagate across Figma and code?*

Triggered by any of: a designer edits a variable in Figma · a dev edits a token in code
· new brand material arrives · a decision gets made in a review.

1. **Capture** — new material lands in `references/`; a decision gets recorded.
2. **Audit** — read-only. What differs across surfaces: values, styles, open decisions.
3. **Decide** — the per-layer source of truth resolves most of it; genuine conflicts
   get asked in plain language.
4. **Propagate** — apply to Figma, code, and docs. All three, or none.
5. **Record** — DESIGN.md decision log and `tokens.lock.json` become the new baseline.

**Audit-first is deliberate.** A read-only drift report before any write is safer for
non-technical users, and gives a reason to open the tool on a Monday without a specific
task in mind — which is what adoption actually looks like.

## Two principles worth stating separately

**Materials are a place, not a stage.** "Where do I put references at the start?" and
"how do I add references later?" have one answer: `references/`, every time, with
`INGESTED.md` recording what's been processed. Conversational intake evaporates when
the session ends; a folder and a manifest don't.

**Source of truth is per layer, not per project.** A single project-wide toggle feels
wrong within a week. Token values may flow Figma → code (designers own colour), copy
flows Notion → repo, component structure in a prototyping context often flows code →
Figma. Declared as a small table in DESIGN.md, the audit knows which direction is
normal and which is drift worth flagging.

## Command shape

**One resumable `/project-setup`.** It reads the repo, works out which stage you're in,
and picks up there — so the journey survives being spread across days and people, and
there's one thing to remember rather than four in the right order.

The loop gets its own verbs: **`/design-audit`** (read-only, safe any time) →
**`/sync-tokens`** → **`/import-copy`**.

## Where the current plugin stands (v0.2.0)

**Exists:** preflight · intake (conversational) · scaffold · `/sync-tokens` ·
`/import-copy`.

**This model adds:** the `references/` folder + `INGESTED.md` manifest · `BRIEF.md` ·
Orient as a real stage · the joiner path · audit-first `/design-audit` · the per-layer
source-of-truth table · resumable, self-locating entry · **local-first preflight with a
parallel track for org provisioning, and a remote-attach checkpoint at Orient**.

Note that `plugins/project-setup/skills/project-setup/SKILL.md` already accepts
"local-only for now" as an option in its preflight — this model promotes that from an
afterthought clause to the **default path**, with the pending remote tracked so its
checkpoint can't be silently forgotten.

That gap list is the backlog. Sequence it after the model is agreed — not before.
