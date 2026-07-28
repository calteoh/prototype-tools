<!-- setup-skill: agent-instantiated. If the operator supplied a Notion link or brand
     doc, populate from it via /import-copy and record the source. Otherwise keep the
     boilerplate structure with TODOs — never invent client voice. Delete these comments. -->
# TONE-OF-VOICE.md — {{PROJECT_NAME}}

Copy guidelines for everything written in these prototypes. All mock content — labels,
headlines, empty states, notifications — follows this file. **Never lorem ipsum.**

> Source: {{TOV_SOURCE}} <!-- e.g. "imported from <Notion link> on <date> via /import-copy",
> or "boilerplate — client voice TBD" -->
> To refresh from the source document, run `/import-copy {{TOV_SOURCE_LINK}}`.

## Voice

<!-- setup-skill: fill from source material only. -->
- {{VOICE_PRINCIPLE_1}} <!-- TODO(copy): confirm with client materials -->
- {{VOICE_PRINCIPLE_2}}

## We say / we don't say

| Say | Don't say | Why |
|---|---|---|
| {{TERM_PREFERRED}} | {{TERM_AVOIDED}} | {{TERM_REASON}} |

## Mock-content rules

- Plausible and clearly illustrative: real-looking names, dates, prices — never real
  private individuals' data, never implied endorsements.
- Locale-aware where visible: dates, times across time zones, currency. Consistent
  formatting throughout ({{LOCALE_FORMATS}}).
- Empty states, errors, and confirmations get written copy too — they're part of the
  walkthrough.

## Open questions

- [ ] {{TOV_OPEN_QUESTION}} — owner: {{TOV_OWNER}}
