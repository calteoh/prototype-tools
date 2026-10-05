# Web app scaffold — procedure

Agent procedure for scaffolding one responsive-web concept app inside a phase folder.
Conventions are field-tested on a luxury-retail client's web prototypes (Next.js 15, React 19, Tailwind v4,
static export, 11 sibling apps stitched under one hub). Do the steps in order.

## 1. Scaffold

```bash
npx create-next-app@latest <app-name> --typescript --tailwind --eslint --app --no-src-dir --use-npm --import-alias "@/*" --turbopack
```

(Pass every flag — any omitted one becomes an interactive prompt that stalls the run.)

Then three cleanups, verified necessary on current create-next-app output:

- **Delete the generated `README.md`, `CLAUDE.md`, and `AGENTS.md` inside the app** —
  create-next-app now emits its own agent docs, and they fight the repo-level
  CLAUDE.md's conventions.
- **Rewrite `app/layout.tsx`** — the default imports Geist via `next/font/google`
  (network-dependent, off-token); replace with a plain layout that sets
  `data-theme="light"` on `<html>` and imports `globals.css` only.
- **Rewrite `app/globals.css`** — drop the default `--background`/`--foreground`
  theme variables and the `@theme inline` block; import `../styles/tokens.css` and
  set `body` from semantic tokens.

Then replace `next.config.ts` with the copy in this folder — it encodes the three
load-bearing conventions:

- **`output: "export"`** — the build emits plain HTML/CSS/JS. No server, no
  serverless functions; hostable anywhere, launchable from a folder.
- **`basePath`/`assetPrefix` from `NEXT_PUBLIC_BASE_PATH`** — lets the stitch script
  build each concept under a sub-path (`/final/`, `/explorations/`).
- **`typescript: { ignoreBuildErrors: true }`** — prototype-grade on purpose; a type
  error never blocks a client demo.

## 2. The asset() helper — copy it in on day one

Copy `lib/asset.ts` from this folder into the app. Next does **not** rewrite raw
`<img src>`, `<video src>`, or `background-image: url()` strings when `basePath` is
set — assets work in `npm run dev` and 404 in the stitched build. Every `/`-prefixed
public asset path goes through `asset()`:

```tsx
import { asset } from "@/lib/asset";
<img src={asset("/images/hero.jpg")} />
```

## 3. Tokens

- Canonical files: `DESIGN.md` (identity — colours, base type, base spacing,
  motion durations/easings) and `IMPLEMENT.web.md` (web behaviour —
  breakpoints, container max, responsive typography and spacing overrides, plus
  the empty prompt sections for motion assignments, grid, component behaviour,
  image aspects, colour modes), both at the repo root. Their front matter is
  the token set. See `../common/DESIGN.template.md` and
  `../common/IMPLEMENT.web.template.md`. No `tokens.json` is emitted.
- Emitted file: `styles/tokens.css` — CSS custom properties on `:root` from
  DESIGN.md, one `--kebab-name` per semantic token, plus `.t-<style>` classes
  per `fontSize` entry. Responsive overrides come from IMPLEMENT.web.md's
  `responsive` block, wrapped in a single `@media (min-width: <breakpoints.large>)`
  block. Import it in `app/globals.css`. Dark mode (if enabled) emits a
  `[data-theme="dark"]` block overriding the semantic colors.
- Tailwind is **layout shorthand** (`flex`, `grid`, `absolute inset-0`, `truncate`);
  token values reach it via arbitrary values: `text-[var(--fg-primary)]`,
  `p-[var(--side-pad)]`. Don't rebuild the token layer inside Tailwind's `@theme` —
  one source of truth, and `/sync-tokens` rewrites `tokens.css` only.

Example emission for one token: `colors.fg.primary: "#121212"` →
`--fg-primary: #121212;` and Figma code syntax `var(--fg-primary)`.

## 4. Sibling concepts, stitched at build time

Each concept is its own self-contained Next app; nothing imports across concepts. The
repo-root `scripts/build-static.sh` (copy from this folder, edit the concept list):

1. builds each concept with `NEXT_PUBLIC_BASE_PATH=/<subpath>` into `dist/<subpath>/`,
2. copies the hub page over the top as `dist/index.html` (substituting
   `{{BUILD_TIMESTAMP}}`),
3. copies `HANDOVER.md` + the double-click launchers into `dist/`.

`dist/` is then a complete, self-contained review artifact: zip it, send it, done.
One broken concept never takes down the others.

## 5. App structure

```
<app-name>/
├── next.config.ts           # from this template — do not simplify away the basePath wiring
├── lib/asset.ts             # from this template
├── app/
│   ├── layout.tsx
│   ├── globals.css          # imports ./tokens.css (relative import from styles/)
│   └── page.tsx             # starter page, token-styled
├── styles/
│   └── tokens.css           # emitted from DESIGN.md + IMPLEMENT.web.md (never hand-edit)
└── public/                  # images, fonts — referenced via asset()
```

Starter page shows the project name styled entirely with token CSS vars and the brand
fonts — proof on first run that the token pipeline works.

## 6. Fonts

`@font-face` in `globals.css`, files in `public/fonts/`, `src` paths through
`asset()`-compatible relative URLs (`url("../public/fonts/…")` resolves at build
time; verify in the stitched build, not just dev). One `@font-face` per weight file;
font-family names must match the `fontFamily` values in DESIGN.md.

## 7. Animation

`npm install motion` (Framer Motion). Match the Figma prototype's feel: ~200–300ms
eased transitions, springs for playful moments.

## 8. Verify

`npm run dev` → starter page renders with tokens + fonts. Then the real check:
`./scripts/build-static.sh` → double-click `dist/start-mac.command` → hub opens →
concept loads **with images intact** (the asset() proof).
