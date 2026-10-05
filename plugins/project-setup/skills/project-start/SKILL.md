---
name: project-start
description: Begin a new prototyping project — ask a few short questions conversationally, create the git repo, and scaffold a _setup/ folder with a machine-written settings record. The operator never edits raw markdown; they share materials and context in chat and the agent files everything. Stops after setup; /project-create does the building. Use when the user wants to start, begin, kick off or set up a new prototyping project, or asks where to put brand materials for a project that does not exist yet.
---

# /project-start — ask, then make a place to put things

This is the first of two setup commands. It asks a few questions conversationally,
creates the repo, and builds a folder the operator can drop materials into. **Then
it stops.**

**It must not scaffold anything.** No app, no `DESIGN.md`, no docs, no Figma. Those
are `/project-create`'s job, and the split exists because gathering materials takes
days — a font file lands Thursday. A single command would have to either block on
that or pretend it did not happen. Two commands make the waiting a stage with a name
instead of an awkward pause in a conversation someone feels guilty about leaving open.

Templates live at `${CLAUDE_PLUGIN_ROOT}/templates/` (fall back to `../../templates/`
relative to this file). Defaults live at `${CLAUDE_PLUGIN_ROOT}/DEFAULTS.md`. Read a
template before instantiating it; every `{{PLACEHOLDER}}` must be resolved in the
written output.

## The conversational principle

**The operator talks. The agent writes files.** The operator never needs to:
- Edit a markdown table
- Create a text file to hold a URL
- Figure out which folder something belongs in
- Learn any file format

Everything the operator shares — names, descriptions, URLs, context about a PDF they
dropped — goes through conversation. The agent writes `SETUP.md`, organises materials
into folders, and confirms what it understood. `SETUP.md` is a machine-written record
of decisions, not a form the operator fills in.

## Step 0 — Look before asking

1. **Check the working directory.** An existing `_setup/SETUP.md` means this project
   has already been started. **Never overwrite it** — see "Re-running" below.
2. **Read what the operator already said.** If they opened with "set up a project for
   Acme's rebrand", the client name is answered. Asking again reads as not listening,
   and it is the fastest way to lose someone in the first minute.
3. An existing `.git` is fine — skip `git init`, use the repo that is there.

No Figma check, no connector check, no plan-tier check. Nothing here touches Figma, so
a preflight gate would be blocking on a dependency this command does not have.

## Step 1 — Questions

Ask only what is genuinely unanswered. Two interactions at most.

**Free text — names, description and URLs:**

1a. **Client name.** The organisation — e.g. "WTA", "Acme Corp". Ask this as its own
    distinct question, never combined with the project name.

1b. **Project name.** The thing being made — e.g. "Rebrand", "Member Portal". Ask
    separately from client name to avoid ambiguity (a combined answer like "WTA
    Rebrand" leaves it unclear which part is which).

    In the same breath as the project name, invite a short description of what is
    being made *and how it should feel* — a paragraph is fine, and it is what
    `/project-create` will read as the primary input in description-mode. A
    **specific reference** (an artifact, a magazine, a physical object, a URL)
    carries more than a list of adjectives; if prose comes back without a concrete
    anchor, nudge for one.

6. **The Figma file URL, if there is one.** Explicitly skippable — say so in the same
   breath as asking. An empty Figma file can be made any time and pasted into the
   sheet later.

**`AskUserQuestion` — one round, these five together:**

2. **Start from...**
   - `Brand materials` (default) — the operator has canonical guidelines to
     transcribe. `_setup/brand/` gets palettes, logos and decks; `_setup/fonts/` gets
     the font files. Values in the sheet are sourced literally from what lands there.
   - `Description + references` — the brand is a paragraph plus visual references.
     The paragraph lives in `SETUP.md § Description`; screenshots, moodboards and
     URLs go into `_setup/examples/`. `/project-create` infers values from these and
     the checkpoint labels every source as "inferred from...".

   This is not a small choice, and it changes how `/project-create` reads the folder
   later — canonical materials in `brand/` are transcribed literally, referential
   materials in `examples/` shape prose and negative constraints but never override
   a literal token value without the operator saying so at the checkpoint. Getting
   this wrong is not fatal: the fork can be flipped later by telling the agent.

3. **What are you making?**
   - `Responsive web` — fully supported
   - `Mobile app` — basic support in v1

   One platform per project. **There is no "both" option and you must not offer one.**
   If the operator asks for both, explain: the dual path doubles the scaffold, the
   emission targets and the review story, and the review surface only works on web
   anyway — a stitched static build is something a client can open, and there is no
   equivalent for a native build without provisioning profiles. Suggest picking the
   primary one and starting a second project if the other genuinely materialises.

4. **What stage is this?**
   - `Concepting` (default) — divergent, many directions
   - `Detailed design` — converging on one system to specify

   Both phase folders get created either way, whichever is chosen.

5. **What do you already have?** Multi-select, and **nothing here blocks**:
   - A brief or kickoff doc
   - Brand guidelines
   - The font files
   - An empty Figma file
   - Reference designs
   - Nothing yet

   This shapes the gathering guidance and nothing else. "Nothing yet" is a completely
   normal answer — say so rather than letting it feel like a confession.

7. **Review the defaults now, or later?**
   - `Later` (default) — eleven settings, all pre-filled with sensible values
   - `Walk me through them now`

   Choosing "now" means walking the settings conversationally and writing the answers
   into SETUP.md. Choosing "later" is not deferral — the defaults are chosen to work
   unremarkably, and most projects never touch them.

Anything answered "not sure" becomes the default, recorded as a default. Never invent
a value and never leave a field blank.

### The description-mode without a description

If Q2 came back as `Description + references` and Q1b came back without a description,
ask one small follow-up before writing the sheet: "Give a short description of the
feel — a paragraph is fine, and please include at least one concrete reference." This
is the one place a third interaction is worth its cost, because the primary input has
to exist before the sheet becomes a useful record. If the operator declines with "use
the defaults and I'll fill it in later," write `_None yet — add one here any time._`
in the Description section and continue; the sheet is a live document either way.

## Step 2 — The repo

1. `git init` if there is no `.git` already. **Local only.** Do not ask for a remote
   URL, do not offer to create one, and do not treat its absence as incomplete —
   `git init` needs no ticket and an org-provisioned remote often takes days. It gets
   attached later as its own small event.
2. Write `.gitignore`:

```gitignore
# Dependencies and build output
node_modules/
.next/
.expo/
dist/
out/
.DS_Store

# Setup materials stay on this machine.
# Brand decks and client documents are often confidential, and these can be large.
_setup/brand/
_setup/fonts/
_setup/context/
_setup/examples/
```

`_setup/SETUP.md` and `_setup/README.md` are **tracked** — they are small, they are
the record of what was decided, and a joiner cloning the repo should see them. The
four drop folders are not. Font files reach the repo later, when `/project-create`
copies the specific faces the app needs into the app itself.

3. **Do not commit yet.** Let the operator look first. Offer, don't perform.

## Step 3 — The `_setup/` folder

Create, on disk:

```
_setup/
├── README.md      from SETUP-README.template.md
├── SETUP.md       from SETUP.template.md
├── brand/         empty
├── fonts/         empty
├── context/       empty
└── examples/      empty
```

The four folders are empty and ignored, so git will not carry them. That is correct —
they exist for a human to drop files into, not for git to track.

**Placeholders to resolve:**

| Placeholder | From |
| --- | --- |
| `{{PROJECT_NAME}}`, `{{CLIENT_NAME}}` | Questions 1a (client) and 1b (project) — two separate answers |
| `{{DESCRIPTION}}` | The free-text description from question 1b, or the follow-up in description-mode. In brand-materials mode this may be a one-liner or empty; in description-mode it is the load-bearing paragraph. If empty, write `_None yet — add one here any time._` in italics. |
| `{{START_MODE}}` | Question 2 — write it as it appears in the option label (`Brand materials` or `Description + references`) |
| `{{PLATFORM}}` | Question 3 — write it as the operator would say it |
| `{{ACTIVE_PHASE}}` | Question 4 |
| `{{FIGMA_URL}}` | Question 6, or `not yet — paste one here any time` |
| `{{DEFAULTS_VERSION}}` | The `version` field in `DEFAULTS.md` |

## Step 4 — Say where things stand

The closing message is the point of the whole command, so write it in plain, short
language, ending on the fact that nothing is blocking.

**Brand materials mode:**

```
Created <project>/ — a git repo with a _setup/ folder in it.

  _setup/SETUP.md      your settings, all filled in
  _setup/README.md     how to add materials
  _setup/brand/        empty — drop brand guidelines, palettes, logos, decks
  _setup/fonts/        empty — drop font files
  _setup/context/      empty — drop the brief, kickoff notes
  _setup/examples/     empty — drop reference designs, competitor screens

Start mode  Brand materials
Blocking    nothing

You can run /project-create right now and get a working prototype on neutral
defaults, or share materials first and run it later. Both work, and the second
one just gets you something that looks more like <client>.

To add materials: share them here in chat — paste a URL, attach a screenshot,
or drop files in the folders above and tell me what they are. I'll file
everything and record your context.

  Next:  share materials   or   /project-create
```

**Description + references mode:**

```
Created <project>/ — a git repo with a _setup/ folder in it.

  _setup/SETUP.md      your settings, plus your description
  _setup/README.md     how to add materials
  _setup/brand/        empty — canonical brand assets if any turn up later
  _setup/fonts/        empty — drop font files
  _setup/context/      empty — drop the brief, kickoff notes
  _setup/examples/     empty — drop reference designs, moodboards, screenshots

Start mode  Description + references
Blocking    nothing

You can run /project-create right now and it will infer values from your
description. Sharing references first grounds the inference against something
specific instead of a paragraph on its own. Both work.

To add materials: share them here in chat — paste a URL with a note about
what you like, attach a screenshot, or drop files in the folders above and
tell me what they are. I'll file everything and record your context.

  Next:  share materials   or   /project-create
```

**Ending on "nothing is blocking" is deliberate and not decoration.** The most common
way a setup tool fails is by presenting a wall of prerequisites, which reads as "come
back when you are organised" and gets closed.

**Say the start mode out loud in the closing.** It is the line the operator most
often forgets they answered, and it changes what `/project-create` will do next.

## Gathering phase — handling materials after /project-start

After the closing message, the operator may share materials in the same conversation
or come back later. The agent handles all three lanes:

### URLs

The operator pastes a URL with context:
> "Here's a reference: https://competitor.com — we want to feel calmer than this"

The agent:
1. Saves `_setup/examples/competitor-com.txt` containing the URL
2. Appends to the `materials:` block in `_setup/SETUP.md`
3. Confirms: "Saved competitor.com as a reference — noted that you want to feel calmer
   than this, especially compared to their [whatever you noticed]."

### Images and screenshots

Attached in chat or dropped in a folder:
> [attachment] "This is their current app — notice the density"

Or:
> "I put a screenshot in examples/ — it's their current app, notice the density"

The agent:
1. If attached: saves to the appropriate `_setup/` subfolder
2. Records in `materials:` with the operator's context
3. Confirms the file and what it understood

### Large files (PDFs, font files, decks)

Always dropped in folder (too large for chat):
> "Brand guidelines are in brand/ — key palette is page 4, ignore page 6"

The agent:
1. Verifies the file exists in the named folder
2. Records in `materials:` with the operator's context
3. Confirms and asks if there's anything else to note about it

### What the agent writes in SETUP.md

For every material received, append to the `materials:` YAML block in SETUP.md:

```yaml
materials:
  - file: brand/acme-guidelines.pdf
    type: brand-guidelines
    context: "Key palette on page 4. Secondary palette on page 6 is outdated."
  - file: fonts/OhnoBlazeface-Regular.woff2
    type: font
    context: "Display headings only."
  - url: https://competitor.com
    folder: examples
    context: "Competitor — we want to feel calmer than this, especially typography."
  - file: examples/competitor-screenshot.png
    type: reference
    context: "Their current app. Notice density and monospace type."
```

### Changing settings conversationally

The operator can also change settings at any time:
> "Actually, change the spacing base to 12"
> "Make the radius scale tighter — 2 / 4 / full"

The agent updates the relevant line in `_setup/SETUP.md` and confirms the change.

### Figma URLs — detecting pre-populated files

When the operator shares a Figma URL (at question time or during gathering), check
whether the file already has variable collections. If it does, acknowledge it:

> "I can see that Figma file already has a design system in it — looks like a
> starter kit with [N] colour variables and [M] spacing values. When you run
> /project-create, I'll read those as a starting point and map them into the
> project's structure. Your brand materials will override where they conflict."

This is information, not a decision point. The operator does not need to choose a
different path — `/project-create` handles library-first detection automatically.
The acknowledgement exists so the operator knows their starter kit was noticed and
will be used, not ignored.

If the file is empty (no variables), say nothing special — an empty file is the
normal case and does not need commentary.

## Re-running

`_setup/SETUP.md` already exists → **do not overwrite it.** It may hold gathered
materials and context that took thought, and losing those to a re-run is the kind of
thing people do not forgive a tool for.

Instead: read it, show what it currently says, and offer to revise specific values.
Change only what is being changed, leave everything else exactly as found.

If the project has already been built — the app and `DESIGN.md` exist, and `SETUP.md`
is stamped superseded — say so and stop. This command has nothing left to do at that
point, and the settings sheet is no longer the live answer to anything.

## Rules

- **Never scaffold.** If the operator asks to just build it now, run `/project-create`
  rather than doing it here. One command, one job.
- **No question blocks progress** except the client and project names. Everything else
  has a default, and a default is a real answer.
- **The agent writes all files.** The operator should never need to open a markdown
  file, figure out table syntax, or create annotation documents. If they want to edit
  directly, that is fine — but it is never required.
- Keep every printed string in plain language. The reader is a designer, not an
  engineer: "font files" not "typeface assets", "nothing is blocking" not "no
  outstanding preconditions".
- Do not print a summary of all settings in chat. They are in the sheet, and restating
  them makes the folder look more complicated than it is.
- **Handle materials as they arrive.** When the operator shares something — a URL, a
  screenshot, a note about a PDF they dropped — file it immediately, record it in
  SETUP.md, and confirm. Don't defer to `/project-create`.
