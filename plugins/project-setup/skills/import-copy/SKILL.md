---
name: import-copy
description: One-way import of copy and tone-of-voice content from a Notion page (or pasted text / local doc) into the project repo's markdown — TONE-OF-VOICE.md or screen copy in mock data. Use when the user shares a Notion link for copy, asks to refresh the tone-of-voice doc, or a writer's content needs to reach the prototypes. Import only — never writes back to Notion.
---

# /import-copy — writer content → repo markdown

Writers work in Notion and rarely touch GitHub or markdown. This skill moves their
content into the repo in agent-friendly form. **Strictly one-way** (source → repo):
never write to the source, never claim the repo copy is "synced" — it's an import
with a date.

## Sources, in order of preference

1. **Notion page URL** — fetch via the Notion MCP (`notion-fetch`). If the Notion
   connector isn't authorized, say so and offer option 3.
2. **Local file** (exported doc, PDF) — Read it.
3. **Pasted text** — accept as-is.

## Import targets

- **Tone-of-voice / brand-voice content** → `TONE-OF-VOICE.md`, restructured into
  that file's sections (Voice / Say-Don't-say / Mock-content rules / Open questions).
  Keep the writer's actual language — restructure, don't rewrite. Anything that
  doesn't fit the structure goes under a faithful "Source notes" section rather than
  being dropped.
- **Screen or feature copy** (labels, headlines, empty states) → the relevant app's
  mock data (`src/data/…`). Show the operator a before/after of each string that
  would change and apply on confirmation.

## Provenance (required)

Update the target file's source line every run:

```
> Source: imported from <link or filename> on <YYYY-MM-DD> via /import-copy.
> To refresh, run /import-copy <link> again.
```

On re-import, show what changed since the last import before overwriting; content the
team edited locally that the source doesn't have → ask keep/replace, don't silently
lose either.

## Guardrails

- Never invent voice or copy — everything traceable to the source or explicitly
  marked TODO.
- Real names / private data in the source: flag before it lands in mock content.
- If the source conflicts with existing DESIGN.md decisions (terminology, casing),
  surface the conflict instead of picking a side.
