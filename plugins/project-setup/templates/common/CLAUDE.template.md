# CLAUDE.md — {{PROJECT_NAME}} Prototypes

This project uses [`AGENTS.md`](AGENTS.md) as the canonical spec-for-agents.
Read it first. Everything Claude Code needs — project context, stack,
conventions, the design-token pipeline and the runbook triggers — lives there.

Slash commands `/sync-tokens` and `/figma-library-push` continue to work; their
adapters at `.claude/skills/*/SKILL.md` point at the canonical runbooks under
`.agents/runbooks/`.
