# INTEGRATION.md — runbook for AI assistants

You are integrating the **Device Frame Kit** into an existing Next.js project. Follow these steps in order. Human context: the kit wraps a mobile-web prototype in a simulated iPhone (frame, iOS status bar, collapsing Safari bar, page-jump drawer, QR code) when viewed on desktop, and renders the prototype untouched on real phones.

## Preconditions — verify before changing anything

1. The target project uses the **Next.js App Router**: an `app/` directory containing `layout.tsx` exists. If the project uses the Pages Router (`pages/` directory with `_app.tsx`), STOP and tell the user the kit supports the App Router only.
2. React 18+ and Next.js 14+ (the kit is developed against Next 15 / React 19).
3. The kit source is available (this repo/folder). The only thing to copy is the `device-frame/` directory.

## Step 1 — copy the kit folder

Copy the entire `device-frame/` directory into the **project root** (sibling of `app/`):

```
<project>/
├── app/
├── device-frame/   ← copied, unmodified
├── package.json
└── ...
```

Do not move files out of it or rename it; internal imports are relative and the folder is self-contained (no npm installs required).

## Step 2 — wrap the root layout

Edit `app/layout.tsx`. Import `DeviceFrame` and wrap the direct children of `<body>` (or the outermost provider stack inside body):

```diff
+ import { DeviceFrame } from "../device-frame/DeviceFrame";

  export default function RootLayout({ children }) {
    return (
      <html lang="en">
        <body>
-         {children}
+         <DeviceFrame>{children}</DeviceFrame>
        </body>
      </html>
    );
  }
```

If the layout nests providers (theme, state, etc.), keep them INSIDE `<DeviceFrame>` so they run in both the framed iframe and on real devices: `<DeviceFrame><Providers>{children}</Providers></DeviceFrame>`.

## Step 3 — generate the config

Edit `device-frame/device-frame.config.ts`:

1. Set `urlBarDomain` to the project's product domain (ask the user, or derive from the project name — it's display text only).
2. Build the `pages` array by enumerating the project's routes: every `app/**/page.tsx` maps to a route (directory path, minus route groups `(group)`, dynamic segments need a concrete example value). For dynamic routes like `app/p/[slug]/page.tsx`, look for mock data in the project to pick a real slug, or omit the route and tell the user.
3. If any page renders different states from query params, add one entry per state: `{ label: "Cart — error", path: "/cart?state=error", section: "Cart" }`.
4. Leave `statusBar`, `browserChrome`, `qrCode`, `pageNav` as `true` unless the user says otherwise. Leave `simulateTouch: false` unless the prototype has touch-only interactions (drag/swipe handlers using touch events).

## Step 4 — safe-area pass (only if the prototype has fixed chrome)

If the prototype has fixed/sticky chrome, pad it with the kit's safe-area variables. The status bar overlays the top 59px; the floating glass Safari bar and home indicator occupy the bottom.

```css
padding-top: var(--df-safe-area-top, env(safe-area-inset-top));
padding-bottom: var(--df-safe-area-bottom, env(safe-area-inset-bottom));
```

Do NOT hardcode pixel values. The `var(..., env(...))` form is mandatory — it degrades correctly on real devices and when `statusBar`/`browserChrome` are off. Note: `--df-safe-area-bottom` is dynamic — it tracks the floating URL bar's height (82px expanded / 46px scrolled) and animates on its own, so a fixed bottom CTA padded by it rides up and down with the bar.

## Step 5 — verify

1. Run the dev server. Open the app in a desktop-sized browser window (≥ 1024px wide).
2. Confirm: a black phone frame appears, the iframe URL contains `?embed=1`, the status bar and Safari bar render.
3. Scroll the prototype down ~100px: the floating Safari bar must shrink to a compact centered pill and the page content must scroll *behind* it (blurred through the glass). Scroll back to the top: it expands. The iframe height stays constant (the bar overlays, it does not resize the viewport).
4. Open the "Pages" drawer and click each entry: the iframe must load the route (full page load) and the active entry highlights.
5. Click the QR button: a QR code renders (encodes the page URL without `embed`).
6. Narrow the window below 768px with devtools device emulation (touch enabled): the frame must disappear and the prototype render raw.
7. Check the browser console for hydration warnings originating from the kit (there should be none).

## Known constraints

- The frame decision uses pointer/hover media queries plus a `maxTouchPoints === 0` fallback; desktop devtools mobile emulation intentionally still shows the frame.
- Each Pages-drawer jump is a full page load by design (iframe SPA routing is unreliable); prototype state resets between jumps.
- `simulateTouch: true` patches `matchMedia`/`maxTouchPoints` inside the iframe — prototypes that branch on pointer type will detect a touchscreen.
- Deploys under a sub-path require `NEXT_PUBLIC_BASE_PATH` at build time, and raw `public/` asset `src` strings must be prefixed via an `asset()` helper (see README "Sharing and deploying").
