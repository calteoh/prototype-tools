# prototype-tools

Boilerplates for prototypes, not presentations.

A small collection of self-contained tools for building front-end prototypes that feel real on a
screen share. Each tool lives in its own folder under [`tools/`](tools/), is independent (its own
`package.json` and lockfile), and is meant to be **copied into your project** rather than installed as
a package.

## Tools

| Tool | What it does | Demo |
| --- | --- | --- |
| [`device-frame-kit`](tools/device-frame-kit/) | Wrap any App-Router Next.js prototype in a realistic iPhone + iOS 26 "Liquid Glass" Safari frame — status bar, collapsing Safari bar, a Pages quick-jump drawer, and a QR code to open it on a real phone. On an actual phone it renders full-screen with no frame. | [Live demo ↗](https://calteoh.github.io/prototype-tools/device-frame-kit/) |

## Using a tool

Open the tool's folder and follow its own README — each is standalone:

```bash
cd tools/device-frame-kit
pnpm install
pnpm dev
```

## Claude Code plugins

Unlike `tools/` (copied into a project), plugins install into [Claude Code](https://claude.com/claude-code)
and add slash-commands to it. This repo doubles as a plugin **marketplace** named
`prototype-tools`:

```
/plugin marketplace add calteoh/prototype-tools
/plugin install project-setup@prototype-tools
```

| Plugin | What it adds | Status |
| --- | --- | --- |
| [`project-setup`](plugins/project-setup/) | `/project-start` then `/project-create` scaffold a whole prototyping project (repo, docs, a Next.js or Expo app, a Figma design library inferred from brand materials), with `DESIGN.md` as the canonical source; `/sync-tokens` regenerates everything derived from it; plus `/figma-library-push` and `/import-copy`. | Experimental |

The plugin runs in Claude Code, but **generated projects are agent-agnostic:**
`AGENTS.md` is the canonical spec-for-agents, with Claude Code, Cursor and Codex
CLI first-class out of the box and anything else that reads `AGENTS.md` supported
as a fallback.

Update installed plugins with `/plugin marketplace update prototype-tools`.

## License

[MIT](LICENSE) © Calvin Teoh
