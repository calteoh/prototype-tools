# Setting up {{PROJECT_NAME}}

This folder holds everything gathered before the project gets built. The agent
manages it for you — you share materials in chat and the agent puts them in the
right place.

**Nothing in here is blocking.** You can run `/project-create` right now and get
a working prototype on sensible defaults. Anything you add first makes the
result more like your project and less like a default one.

## How to add materials

Share them in chat, however is natural:

- **URLs** — paste them with a note about what matters: "Here's a reference:
  https://example.com — notice the calm editorial feel"
- **Screenshots and images** — attach them in chat (or drop into a folder below
  and tell the agent what they are)
- **PDFs, decks, font files** — drop them into the appropriate folder below, then
  tell the agent: "I put the brand guidelines in brand/ — the palette is on page 4"

The agent saves the file, records your context alongside it in `SETUP.md`, and
confirms what it understood. You never need to create annotation files or figure
out naming.

## The four folders

Put files in whichever folder fits. The agent can also sort them for you if you
tell it what something is.

| Folder | What goes in it |
| --- | --- |
| `brand/` | Brand guidelines, colour palettes, logos, decks — anything canonical |
| `fonts/` | The actual font files (`.woff2`, `.otf`, `.ttf`) |
| `context/` | The brief, kickoff notes, RFP — background material |
| `examples/` | Reference designs, competitor screens, moodboards, screenshots |

These folders stay on your machine (excluded from git). The exception is fonts:
the specific files the prototype needs get copied into the app, and those copies
are committed.

## The settings

`SETUP.md` next to this file holds every setting. The agent wrote it from your
answers. To change something, just tell the agent — "change the spacing base to
12" — and it updates the file. You can also edit `SETUP.md` directly if you
prefer; plain English is a valid value.

## When you're ready

```
/project-create
```

It reads `SETUP.md` and everything in this folder, tells you how it understood
all of it, and waits for you to confirm before writing anything.

You can run it more than once. If more material arrives next week, share it in
chat, then run `/project-create` again.
