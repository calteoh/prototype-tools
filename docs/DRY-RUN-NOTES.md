# Dry-run notes — 2026-07-28 (v0.1.0 → v0.2.0)

First full run of `/project-setup` + `/sync-tokens` on a local scratch project:
web-only, dark mode ON, brand ingested from a client's public brand-guidelines site,
Figma library pushed to an empty file on an enterprise org, then the three-scenario
sync round trip. Everything below was found in that run and fixed in the plugin.

## What worked first try

- Repo + docs scaffold, template placeholder conventions, launcher instantiation.
- Brand ingestion from a JS-heavy guidelines site (via its embedded JSON payload).
- Full Figma push through the official connector: two collections, light/dark modes,
  aliases, scopes, code syntax, nine text styles, mode-pinned token sheets — verified
  by `get_variable_defs` read-back in both modes.
- Static stitch build: hub 200, concept 200, `asset()`-routed image 200 under its
  sub-path, `{{BUILD_TIMESTAMP}}` substituted.
- Sync round trip: Figma-only edit auto-pulled to code; code-only edit pushed to
  Figma; both-sides edit surfaced as a plain-language conflict, resolved by prompt,
  lock consistent after each run.

## Findings → fixes (all applied to the skills/templates)

1. **Token-draft approval was missable.** The draft table lived in chat text above
   the approval prompt; the operator asked "where is the draft?" → the draft now
   must be embedded in the approval prompt itself (option preview).
2. **create-next-app emits its own `CLAUDE.md`/`AGENTS.md`/`README.md`** inside the
   app — they conflict with repo-level docs → scaffold procedure now deletes them.
3. **Default Next layout imports Google fonts (Geist) + its own theme vars** →
   procedure now rewrites `layout.tsx`/`globals.css` to token-driven versions.
4. **Missing create-next-app flags stall the run** on interactive prompts → the
   command now passes every flag explicitly.
5. **Remote Figma MCP font list ≠ operator's fonts.** Brand faces read as
   unavailable even when the org uses them daily; Inter-placeholder + human swap is
   the norm → noted in figma-library-push's failure modes.
6. **JS-heavy brand sites defeat WebFetch** (title only). standards.site pages embed
   full content as `var documentData = {…}` JSON → parse it directly; also, managed
   Macs' Python may lack SSL certs → fetch with curl, parse locally.
7. **Sync can silently resolve DESIGN.md "To decide" entries** (a designer settling
   a TBD value in Figma) → sync report now flags when a synced token matches an open
   DESIGN.md decision.

## Still untested

- The Expo scaffold path end-to-end (second dry run, on-device).
- The marketplace-install path (`/plugin marketplace add` in a fresh session, after
  push).
- `/import-copy` against a live Notion page.
- The second-operator test.
