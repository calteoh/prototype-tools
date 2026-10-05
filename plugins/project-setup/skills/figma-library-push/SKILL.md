---
name: figma-library-push
description: Create or update a project's Figma design library (variable collections, modes, aliases, scopes, code syntax, descriptions, text styles, token-sheet frames) from the canonical design-system files — DESIGN.md for identity and, on a web project, IMPLEMENT.web.md for Large-mode behaviour — verify by read-back, and write tokens.lock.json. Used by /project-create and /sync-tokens; also directly when the user asks to push tokens to Figma or rebuild the design library.
---

# /figma-library-push

The canonical procedure for this command lives at
[`.agents/runbooks/figma-library-push.md`](../../../.agents/runbooks/figma-library-push.md)
inside the target project — one runbook, followed identically in Claude Code,
Cursor and Codex.

Read that file in full and follow it. Every step, every guardrail, every rule.

If the runbook is missing (the generated project pre-dates the multi-agent
refactor), this project has an older layout — the previous canonical content
used to live here. Ask the user to run `/project-create` again to refresh, or
hand-copy the current runbook from the plugin's templates.
