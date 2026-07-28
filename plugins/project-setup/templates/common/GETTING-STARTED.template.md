<!-- setup-skill: agent-instantiated. Keep the shared sections plus only the stack
     section(s) that apply. Replace {{...}}. For Expo projects, fill {{EXPO_SDK}} with
     the SDK the app was pinned to at scaffold time. Delete these comments. -->
# Getting Started — prototyping {{PROJECT_NAME}}

This guide assumes **zero prior experience**. If you can edit a file and run a command
in a terminal, you can run these prototypes. Take it step by step.

## 1. What this repo is

We build **prototypes** of {{PROJECT_NAME}} — {{PROTOTYPE_EXPLANATION}}. They exist to
make design concepts feel real. The goal is **visual fidelity**, not production code.

## 2. What you need first (one-time)

- A code editor — **VS Code** is the easy choice.
- **Node.js (LTS)** on your computer. Check:
  ```bash
  node -v
  ```
  If that prints a version (e.g. `v20.x` or newer), you're good. If not, install from
  [nodejs.org](https://nodejs.org).
<!-- setup-skill: EXPO-ONLY prerequisites -->
- The **Expo Go** app on your phone (App Store / Google Play).
- **Your phone and your computer on the same Wi-Fi network.** This is the single most
  common thing that trips people up.

<!-- setup-skill: EXPO SECTION — keep only for React Native projects -->
## 3. Phone prototypes (Expo) — the three words you'll hear

- **React Native** — the toolkit that turns the TypeScript we write into a *real*
  native app (real iOS/Android UI, not a web page in disguise).
- **Expo** — a friendly layer on top of React Native that handles the painful native
  setup, so you can just write screens.
- **Expo Go** — a **free app on your phone** that runs our prototype instantly when
  you scan a QR code. No App Store, no Xcode, no waiting.

**How they fit together:** you edit code → Expo bundles it → **Expo Go on your phone
runs it live.** Save a file and the phone updates in about a second.

### Daily workflow

```bash
cd {{CURRENT_CONCEPT_PATH}}
npm install          # first time only
npx expo start       # then scan the QR code
```

- **iPhone:** open the **Camera** app, point at the QR code, tap the banner → opens in
  Expo Go.
- **Android:** open **Expo Go → Scan QR code**.

Edit a file, save, and the phone updates almost instantly (Fast Refresh). Handy keys
while it runs: `r` reload · `i` iOS Simulator (Mac + Xcode) · `w` rough web preview ·
`Ctrl+C` stop.

### Why "just update everything" breaks it (please read)

Expo Go on your phone only runs apps built for **the Expo SDK version it supports**.
Right now that's **SDK {{EXPO_SDK}}**, so **this app is deliberately pinned to
SDK {{EXPO_SDK}}.** Two rules:

1. **Don't run `expo upgrade` or bump the Expo version** to "get the latest." Newer
   usually means *newer than your Expo Go* → broken preview.
2. If you ever **scaffold a brand-new app**, pin it to whatever Expo Go currently
   supports — look up the Expo Go version live on the App Store and match the SDK.

Seeing *"Project is incompatible with this version of Expo Go"*? **Update Expo Go**
from the app store first. If it persists, ask whoever set up the repo.

### Managed / IT-locked Mac? (firewall blocks the default connection)

Company-managed Macs often silently block incoming connections to `node`, so plain
`npx expo start` fails for both a real phone and the Simulator (*"The network
connection was lost"*):

- **iOS Simulator:** `npx expo start --ios --localhost` — loopback, no network hop.
- **Real phone:** `npx expo start --tunnel` — routes through a public relay instead of
  your Wi-Fi. First run installs `@expo/ngrok`; say yes. Slower to load, and briefly
  internet-reachable while running.

### Sharing a review remotely

`npx expo start --tunnel`, send the QR/link it prints, the client opens it in the free
Expo Go app — no shared Wi-Fi needed. Keep your laptop open; closing it ends their
session. Anything a client can open *on their own, anytime* means a real build +
TestFlight — that's production-adjacent work for the technology partners, not a
designer solo task.

<!-- setup-skill: WEB SECTION — keep only for responsive-web projects -->
## 4. Web prototypes (Next.js)

### Daily workflow

```bash
cd {{CURRENT_CONCEPT_PATH}}
npm install          # first time only
npm run dev          # then open the printed http://localhost:3000
```

Edit a file, save, and the browser updates instantly. Check mobile widths with the
browser dev-tools device toolbar — but **judge fidelity at real size on a real
device** when it matters.

### Building the shareable version

```bash
./scripts/build-static.sh
```

This builds every concept into `dist/` as a plain, self-contained website: the hub
page (`index.html`) linking every concept, plus double-click launchers
(`start-mac.command` / `start-windows.bat`) so a non-technical reviewer can open it
locally. `dist/HANDOVER.md` explains it to the recipient — send them the folder,
nothing else needed.

### One gotcha that will bite you

Raw asset paths (`<img src="/photo.jpg">`) work in `npm run dev` and **404 in the
deployed build** when concepts live under sub-paths. Always use the `asset()` helper
(`lib/asset.ts`): `<img src={asset("/photo.jpg")} />`. If an image works locally but
disappears on the shared build, this is why.

<!-- setup-skill: SHARED — always keep -->
## 5. Top newcomer pitfalls (and the fix)

1. **`npm install` errors / "module not found."** → Make sure you're **inside the
   concept folder** ({{CURRENT_CONCEPT_PATH}}), not the repo root. Delete
   `node_modules` and `npm install` again if stuck.
2. **My changes aren't showing up.** → Save the file. Reload (`r` in Expo / browser
   refresh). Still stuck: restart with a cleared cache
   (`npx expo start -c` / delete `.next` and `npm run dev`).
3. **A red error screen.** → Read the message; it's usually a typo{{RN_TEXT_PITFALL}}.
4. **Styles silently not applying (Tailwind/NativeWind).** → The file's folder isn't
   in `content` in `tailwind.config.js`. Add it, restart with cache cleared.

## 6. Where things live

| Path | What |
|---|---|
| [`CLAUDE.md`](CLAUDE.md) | How we build — stack, conventions, do/don'ts. |
| [`DESIGN.md`](DESIGN.md) | Design-system decisions, tokens, open questions. |
| [`TONE-OF-VOICE.md`](TONE-OF-VOICE.md) | How we write copy. |
| `{{CURRENT_CONCEPT_PATH}}/` | The current prototype (the app you run). |
| `shared/` | Fonts, logos, exported frames to **copy** into an app. |

---

**You're set.** `cd {{CURRENT_CONCEPT_PATH}}`, run it, and edit a screen to watch it
update. When you're ready to build for real, skim [`CLAUDE.md`](CLAUDE.md).
