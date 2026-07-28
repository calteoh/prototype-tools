---
name: sync-tokens
description: Keep design tokens in sync between the project's Figma design library and code (tokens.json + emitted surfaces), in either direction. Runs a three-way diff against tokens.lock.json, auto-applies one-sided changes, and surfaces genuine conflicts in plain language. Use when the user runs /sync-tokens, says tokens/variables changed in Figma or code, or asks whether Figma and code are in sync.
---

# /sync-tokens — Figma ↔ code design-token sync

Anyone on the team can run this — assume **zero git or Figma-plugin knowledge**.
Everything the user sees must be plain language ("Figma changed brand/primary to
#E8112D"), never ids or diffs in JSON.

Modes: default is **bidirectional**. "pull" = Figma→code only. "push" = code→Figma
only. Infer from the user's words ("pull what changed in Figma") when stated.

## Step 1 — Locate the token set

Find `tokens.json` files with `_meta.schema == "prototype-tokens-v1"`. More than one
concept app → ask which one is being synced (offer to copy the result to the others
afterwards — sibling apps share by copy, never by import). A `tokens.lock.json` must
sit next to it; **if missing, stop**: "This project hasn't had its Figma library set
up yet — run /project-setup (or /figma-library-push) first."

## Step 2 — Read both sides

- **Code side**: parse `tokens.json` → flat map `token-path → value` (per mode when
  values are `{light, dark}` objects).
- **Figma side** (read-only `use_figma` script — load the figma-use skill first, or
  the `skill://figma/figma-use/SKILL.md` resource): dump every variable in the
  collections named in the lock file — name, id, resolved type, **code syntax**,
  value per mode (resolving aliases to both the alias target and the resolved
  value) — plus local text styles. Match Figma variables to token paths **by code
  syntax first** (`var(--fg-primary)` ↔ `colors.fg.primary`), falling back to
  name-path mapping (`fg/primary`), and only then report unmatchable entries.
- Quick freshness check (optional, cheap): `get_variable_defs` on the token-sheet
  node ids in the lock file.

## Step 3 — Three-way diff against the lock

For every token path, compare `code` vs `lock` and `figma` vs `lock`:

| code vs lock | figma vs lock | Classification | Action |
|---|---|---|---|
| same | same | in sync | nothing |
| same | changed | Figma edit | apply to code |
| changed | same | code edit | apply to Figma |
| changed | changed (same value) | convergent | update lock only |
| changed | changed (different) | **conflict** | ask the user |
| added in code | absent | new token | create in Figma |
| absent | added in Figma | new variable | add to tokens.json |
| deleted in code | present | deletion | **confirm** before archiving in Figma |
| present | deleted in Figma | deletion | **confirm** before removing from code |

In pull/push mode, apply only that direction and *report* (don't apply) the other.

## Step 4 — Confirm

Present a short plain-language summary first: "3 changes from Figma, 1 from code,
1 conflict." Auto-applicable changes proceed without a prompt. **Conflicts and
deletions always prompt** (AskUserQuestion, one question per conflict, values shown
with where each came from). Never delete anything on either side without an explicit
yes; on the Figma side prefer moving retired variables into an `archive/` name group
over deleting.

## Step 5 — Apply

- **Code**: rewrite `tokens.json`, then re-emit surfaces — web: regenerate
  `styles/tokens.css`; Expo: nothing to regenerate (tailwind config reads
  tokens.json), but remind that Metro needs `npx expo start -c` to pick up config
  changes. If the user opted to propagate, copy the updated files to sibling apps.
- **Figma** (via figma-library-push conventions): update values with the lock file's
  variable ids — resolve each mode id **from the variable's own collection** (a
  foreign mode id throws `mode … not defined for variable`); create new variables
  with scopes + code syntax per the figma-library-push skill; refresh the token-sheet
  frames if tokens were added/removed.
- Failed `use_figma` scripts are atomic — nothing applied; fix and retry once.

## Step 6 — Update the lock, report

Rewrite `tokens.lock.json`: new value snapshot, any new variable ids, `syncedAt` from
`date -u +%Y-%m-%dT%H:%M:%SZ`. Then report in plain language: what moved in which
direction, what was skipped, whether the sheet frames changed — and, only when
relevant, the human reminders (new fonts must be installed in Figma by a person;
library changes need re-publishing in the Figma UI).

## Guardrails

- Never write either side before the diff is fully computed and summarized.
- Bidirectional runs write both sides or neither — if the Figma write path is
  unavailable mid-run, stop before touching code, report, and suggest pull-only.
- Never hand-edit or merge-resolve `tokens.lock.json`; a corrupted lock →
  re-baseline by running /figma-library-push (it rewrites the lock from live state
  after reconciling with the user).
