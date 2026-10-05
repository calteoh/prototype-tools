---
name: sync-tokens
description: Regenerate everything derived from the project's canonical design-system files — DESIGN.md for identity and IMPLEMENT.web.md for web behaviour — into CSS custom properties (with media-query overrides), the Tailwind/NativeWind theme, the Figma variable library, the mode-pinned token sheets, and tokens.lock.json. One direction only, code-led. Use when the user runs /sync-tokens, says they edited DESIGN.md or IMPLEMENT.web.md or changed a token, asks to rebuild or refresh the Figma library, or asks why a token change has not shown up yet. Also use when the user says something changed in Figma, to explain that reading Figma back is not supported in v1.
---

# /sync-tokens

The canonical procedure for this command lives at
[`.agents/runbooks/sync-tokens.md`](../../../.agents/runbooks/sync-tokens.md)
inside the target project — one runbook, followed identically in Claude Code,
Cursor and Codex.

Read that file in full and follow it. Every step, every guardrail, every rule.

If the runbook is missing (the generated project pre-dates the multi-agent
refactor), this project has an older layout — the previous canonical content
used to live here. Ask the user to run `/project-create` again to refresh, or
hand-copy the current runbook from the plugin's templates.
