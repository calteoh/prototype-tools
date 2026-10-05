<!-- setup-skill: agent-instantiated. Keep only the stack sections that apply (Expo /
     web). Replace {{...}}; where an intake answer was "not decided", keep the line and
     mark it TBD rather than inventing a value. Delete these comments. -->
# AGENTS.md — {{PROJECT_NAME}} Prototypes

> New here? Read [`GETTING-STARTED.md`](GETTING-STARTED.md) first. This file is the
> working reference for **how we build** once you're set up.

## Project Context

- This is a **concepting-phase prototype** for **{{PROJECT_NAME}}** — {{PROJECT_DESCRIPTION}}.
- Current phase: **{{CURRENT_PHASE}}**. The immediate goal is {{CURRENT_DELIVERABLE}}.
- Audience: internal + **client concept reviews / walkthroughs**. These are not end
  users and this is not a production build.
- Fidelity bar: **interactive prototypes that feel real.** High visual fidelity,
  **not production code.** Optimize for fidelity and fast iteration over robustness.
- Detail design, a real design system, a11y certification, and production builds are
  **later phases, owned by others. Do not preempt them.** Build the concept, not the
  system.

## For AI agents

**`AGENTS.md` is canonical.** Every agent working on this project should read this
file first — project context, stack, conventions, do/don'ts, the design-token
pipeline and the maintenance triggers all live here. Anywhere else (a Cursor rule,
a Claude Code adapter) points back to it.

**Maintenance procedures live at [`.agents/runbooks/`](.agents/runbooks/):**

- [`.agents/runbooks/sync-tokens.md`](.agents/runbooks/sync-tokens.md) — regenerate
  every derived surface from `DESIGN.md` and `IMPLEMENT.web.md`.
- [`.agents/runbooks/figma-library-push.md`](.agents/runbooks/figma-library-push.md) —
  create or rebuild the project's Figma design library from the same two files.

These are agent-agnostic prose. One runbook per procedure, single source of truth.

**Platform-specific triggers.** Same runbooks, different discovery paths:

- **Claude Code** sees `/sync-tokens` and `/figma-library-push` as slash commands.
  The adapters at `.claude/skills/*/SKILL.md` carry the frontmatter Claude Code
  needs and delegate to the runbook.
- **Cursor** picks up the always-apply rule at
  [`.cursor/rules/agents.mdc`](.cursor/rules/agents.mdc) and follows the runbook
  named by intent when the user asks to sync tokens, push tokens to Figma, or
  rebuild the design library.
- **Codex CLI** reads `AGENTS.md` natively and follows a named runbook when asked.
- **Any other agentic assistant** works too — point it at `AGENTS.md` at the repo
  root and let it read from there.

**Capability boundary.** The runbooks assume the reader can execute shell
commands, run `npx`, and call the Figma MCP. Sub-agentic assistants (Copilot
completions, plain LLM chat) are out of scope for the runbooks — they can read
this project's code fine, but they cannot run `/sync-tokens` or push a library.

## Repo routing — where context lives

Keep concerns separated; pull context from the owning file instead of restating it:

| Topic | File |
|---|---|
| Design-system **identity** — colours, base type, base spacing, radii, motion durations/easings, open design questions | [`DESIGN.md`](DESIGN.md) |
| Design-system **web behaviour** — breakpoints, container max, responsive typography and spacing, plus motion assignments, grid, component behaviour, image aspects, colour modes | [`IMPLEMENT.web.md`](IMPLEMENT.web.md) |
| Copy voice, terminology, mock-content rules | [`TONE-OF-VOICE.md`](TONE-OF-VOICE.md) |
| Environment setup, run instructions, newcomer pitfalls | [`GETTING-STARTED.md`](GETTING-STARTED.md) |
| What exists, current status | [`README.md`](README.md) |

**Read both design-system files before touching styles.** Identity (a colour,
a base type size, the base of a spacing scale) is a change to DESIGN.md.
Behaviour (a breakpoint threshold, a Large-mode override, a motion assignment,
a grid definition, an image aspect at a viewport) is a change to
IMPLEMENT.web.md. Putting behaviour in DESIGN.md, or identity in
IMPLEMENT.web.md, means the two files start disagreeing — the split exists so
that either one can be read on its own and understood.

## Stack

<!-- setup-skill: EXPO SECTION — keep only for React Native projects -->
- **Framework:** **Expo** (managed workflow) + **React Native**.
- **Expo SDK: {{EXPO_SDK}}** — deliberately pinned to match the **Expo Go build
  currently on the App Store**. **⚠️ Do not `expo upgrade` to a newer SDK** — the app
  on reviewers' phones (Expo Go) only runs SDK {{EXPO_SDK}}; a newer SDK breaks
  on-device preview. If you scaffold a new app, re-pin to the live Expo Go SDK.
- **Styling: NativeWind v4** (`className`) with **Tailwind v3** (`tailwindcss@^3.4`) —
  NativeWind v4 is not compatible with Tailwind v4. Config lives in five files:
  `babel.config.js`, `metro.config.js`, `global.css`, `tailwind.config.js`,
  `nativewind-env.d.ts`. **If you add a source folder, add it to `content` in
  `tailwind.config.js`** or its classes silently won't apply.
- **Animation:** **Moti** by default; **Reanimated** for gesture/scroll choreography.
  Both run in Expo Go. Don't hand-roll animations with `setState`.
- **Fonts:** **`expo-font` `useFonts` hook** at runtime. **Do NOT use the `expo-font`
  config plugin** — it needs a development build and won't run in Expo Go. Load each
  weight as its own family; don't rely on `fontWeight` to swap custom faces.
- **Navigation:** none until a 2nd screen appears, then **React Navigation**
  (`@react-navigation/native` + `native-stack`).

<!-- setup-skill: WEB SECTION — keep only for responsive-web projects -->
- **Framework:** **Next.js** (App Router) + **Tailwind v4**, **static export**
  (`output: "export"` — plain HTML/CSS/JS, no server, hostable anywhere).
- **Prototype-grade config is a feature:** `typescript: { ignoreBuildErrors: true }` —
  type errors never block a client demo.
- **⚠️ The `basePath` asset trap:** Next does not rewrite raw `<img src>`,
  `<video src>`, or `background-image: url()` strings. Every `/`-prefixed public
  asset path must go through the local `asset()` helper (`lib/asset.ts`). Symptom:
  images work in `dev` and 404 on the deployed sub-path.
- **Animation:** **Motion (Framer Motion)** by default.

<!-- setup-skill: SHARED — always keep -->
- **Design tokens:** canonical **[`DESIGN.md`](DESIGN.md)** (identity) plus
  **[`IMPLEMENT.web.md`](IMPLEMENT.web.md)** (web behaviour) — their front
  matter holds every value, their prose says why. A trailing `#` comment on a
  token's YAML line is the Figma variable description and is pushed with the
  value. The CSS custom properties
  (with `@media` overrides), the Tailwind theme and the
  [Figma design library]({{FIGMA_LIBRARY_URL}}) are all generated from the
  pair. Change the appropriate file, then: Claude Code — run `/sync-tokens`.
  Cursor / Codex / others — follow
  [`.agents/runbooks/sync-tokens.md`](.agents/runbooks/sync-tokens.md).
  Never hand-edit an emitted file, and never hardcode a value a screen could
  read from a token.
- **Language:** TypeScript, **loose** (`"strict": false`). `any` is fine to move fast.
- **State:** React local state. No Redux/Zustand/data-fetching libraries.

## Conventions

- Work is organized by **phase**; each concept is its **own self-contained app**
  inside its phase folder — "cd in and run." **Do not cross-import between concepts —
  copy, don't share.**
- Within an app: `src/screens` (one file per screen), `src/components`
  (reused-within-this-app UI), `src/theme` (tokens + non-utility constants),
  `src/data` (mock content), `assets/` (fonts + images this app uses).
- Keep it flat. **No abstraction until a pattern repeats ~3×.**
- **Copy** shared assets from `/shared` into the app's own folder. Never import
  across app roots.

## Content & copy

- **Plausible, on-voice copy — never lorem ipsum.** Follow
  [`TONE-OF-VOICE.md`](TONE-OF-VOICE.md).
- **Real-ish, clearly illustrative mock data.** No real private data; don't imply
  real endorsements.
- **Imagery is Figma / client-provided only.** Use neutral placeholders where imagery
  is missing; don't source new imagery off the web.

## Accessibility

WCAG as a **guiding principle**: color contrast, ≥44pt touch targets, labels on
icon-only controls. Formal certification is a later phase — don't block iteration.

## Handling missing design decisions

- If a decision is **load-bearing** for a review (core layout, nav model,
  brand-critical) → **ask first.**
- Otherwise make the **smallest plausible choice**, add a `// TODO(design):` at the
  exact site, record it in [`DESIGN.md`](DESIGN.md) → "To decide", and prefer a
  visible placeholder over a silently invented final value.
- **Never invent brand voice or claims** — pull from the Figma, or ask.
- **Flag any assumption that will be visible in a walkthrough before the
  walkthrough.** Surprises in review are the highest-cost failure mode.

## Do Not

- Do not build production code. No backend/API/auth/analytics/push. No tests/CI. No
  App Store / hosting config beyond the static build.
- Do not add state-management or data-fetching libraries. Mock inline or in `src/data`.
- Do not create component factories / premature abstractions.
- Do not cross-import between concepts or from `/shared` — copy assets in.
<!-- setup-skill: keep the stack-specific do-nots that apply -->
- Do not `expo upgrade` past the on-device Expo Go SDK ({{EXPO_SDK}}).
- Do not use the `expo-font` config plugin or dynamic `require()` paths.
- Do not use Tailwind v4 in the Expo app (NativeWind v4 needs v3).
- Do not bypass the `asset()` helper for public asset paths in the web app.
- Do not hand-edit emitted token files (`tokens.css`, the Tailwind theme) — edit
  `DESIGN.md` (identity) or `IMPLEMENT.web.md` (behaviour), then re-sync tokens
  (Claude Code: `/sync-tokens`; Cursor / Codex / others: follow
  `.agents/runbooks/sync-tokens.md`).
- Do not edit tokens in Figma expecting them to come back. v1 pushes one direction
  only, and the next sync overwrites Figma-side edits without warning.

## Verification

- **Primary (fidelity is judged here):** {{PRIMARY_VERIFICATION}}
- **No automated tests for prototypes.** "Verified" = it runs, matches the Figma, the
  flow is walkable, and the console shows no errors.
