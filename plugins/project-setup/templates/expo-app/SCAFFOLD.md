# Expo app scaffold — procedure

Agent procedure for scaffolding one React Native concept app inside a phase folder.
Every config below is field-tested on a professional-sports client's native-mobile prototypes (Expo SDK 54). Do the steps in order.

## 1. Pin to the live Expo Go SDK — before anything else

`create-expo-app` defaults to the newest SDK, which the Expo Go app on reviewers'
phones usually **cannot run yet** (Expo ships SDKs on npm before the matching Expo Go
clears App Store review). Procedure adapted from Julian Stahl's `mobile-prototype`
skill (`github.com/juliansthl/agent-skills`):

1. Look up the shipping Expo Go version via the iTunes Search API — its **major
   version equals the SDK it targets** (e.g. `54.0.2` → SDK 54):
   ```bash
   curl -s "https://itunes.apple.com/lookup?id=982107779&country=us" \
     | python3 -c "import json,sys; print(json.load(sys.stdin)['results'][0]['version'])"
   ```
   If the major doesn't look like a plausible SDK number, check
   https://docs.expo.dev/versions/latest/ and confirm with the operator.
2. Scaffold, then pin. Don't guess per-SDK template tags — scaffold latest and
   reconcile:
   ```bash
   npx create-expo-app@latest <app-name> --template blank-typescript --no-install
   cd <app-name>
   # if package.json's expo major ≠ the SDK from step 1:
   npm install expo@~<SDK_VERSION>.0.0
   npx expo install --fix     # reconciles react-native, react, and all expo-* peers
   npm install
   ```
3. Record the pinned SDK in the project's CLAUDE.md and GETTING-STARTED.md
   (`{{EXPO_SDK}}` placeholders).

Never run `expo upgrade` afterwards; never let a dependency bump pull a newer SDK.

## 2. Wire NativeWind v4 (Tailwind v3 — NOT v4)

```bash
npm install nativewind tailwindcss@^3.4 prettier-plugin-tailwindcss
```

Five files, exact contents:

**`babel.config.js`**
```js
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      // jsxImportSource: "nativewind" lets className flow onto RN components.
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // The Reanimated/Worklets babel plugin is added automatically by
    // babel-preset-expo when react-native-reanimated is installed —
    // do not add it manually or you'll get a "duplicate plugin" error.
  };
};
```

**`metro.config.js`**
```js
const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// `input` must point at the global.css that holds the @tailwind directives.
module.exports = withNativeWind(config, { input: "./global.css" });
```

**`global.css`**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**`nativewind-env.d.ts`**
```ts
/// <reference types="nativewind/types" />
```

**`src/theme/tokens.js`** — generated from `DESIGN.md` by `/sync-tokens`, never
hand-edited. A plain JS module rather than JSON so NativeWind consumes it with no
translation step:
```js
// Generated from DESIGN.md. Do not edit — run /sync-tokens.
module.exports = {
  colors: { "fg-primary": "#121212", /* … */ },
  fontFamily: { /* … */ },
  fontSize: { /* … */ },
  spacing: { /* … */ },
  borderRadius: { /* … */ },
};
```

**`tailwind.config.js`** — hand-written, and the one file in this pair that a person
owns:
```js
const tokens = require("./src/theme/tokens");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Every file that uses className must be matched here, or Tailwind purges the
  // classes and nothing is styled. Add new source folders as they appear.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Values come from DESIGN.md. Don't hand-edit them here or in tokens.js:
      // change DESIGN.md and run /sync-tokens.
      // Editing this file needs `npx expo start -c` — Metro caches the config.
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
    },
  },
  plugins: [],
};
```

Import `global.css` at the top of `App.tsx`.

Two things the emission does differently on native. Projects ship **one colour mode**,
so semantic colours are flat strings rather than light/dark pairs. And of the two
layout modes, only **base (Small) values** are emitted here — responsive behaviour
lives in `IMPLEMENT.web.md` on the web path, and **there is no `IMPLEMENT.native.md`
in v1**. Native is the basic-support platform; a native project that genuinely needs
both widths handles it in the screens and records that in DESIGN.md. When native
gets promoted to full support, an `IMPLEMENT.native.md` template lands alongside
`IMPLEMENT.web.template.md`.

## 3. Baseline dependencies

```bash
npx expo install expo-font react-native-safe-area-context moti react-native-reanimated react-native-gesture-handler
npm install --save-dev @expo/ngrok
```

Moti for declarative animation, Reanimated for gesture/scroll work, safe-area for
notches, ngrok for the managed-Mac tunnel workflow.

## 4. package.json scripts (managed-Mac-friendly)

```json
"scripts": {
  "start": "expo start",
  "ios": "expo start --ios --localhost",
  "phone": "expo start --tunnel",
  "web": "expo start --web"
}
```

`--localhost` fixes the Simulator on firewalled Macs; `--tunnel` fixes real phones on
them (and enables remote client reviews).

## 5. App structure

```
<app-name>/
├── App.tsx                  # shell: SafeAreaProvider, font loading, current screen
├── global.css
├── src/
│   ├── screens/StarterScreen.tsx
│   ├── components/
│   ├── theme/tokens.js      # emitted from DESIGN.md (never hand-edit)
│   ├── theme/fonts.ts       # useFonts map, one entry per weight file
│   └── data/mock.ts         # mock content, tone-of-voice compliant
└── assets/fonts/            # copied in from /shared — never require() across roots
```

`App.tsx` gates render on `useFonts` loaded, wraps everything in `SafeAreaProvider`,
and renders `StarterScreen`. StarterScreen shows the project name in a token-styled
layout — proof on first run that tokens, fonts, and NativeWind all work.

## 6. Fonts

Load per weight with `useFonts`, each file its own family name
(`"Brand-Bold": require("./assets/fonts/Brand-Bold.ttf")`), gate render until loaded.
RN does not synthesize bold/italic reliably — never rely on `fontWeight` to swap
custom faces. **Do not use the `expo-font` config plugin** (needs a dev build; won't
run in Expo Go).

## 7. Know-before-you-build gotchas (put in front of the agent, not the human)

- All text inside `<Text>`; a bare string in a `<View>` crashes.
- Flexbox only, default direction is `column`; no CSS Grid, no hover — use
  `Pressable` + pressed state.
- Unitless density-independent pixels (`padding: 16`, NativeWind `p-4`).
- `require()` paths must be static string literals; for image sets build a static map
  object.
- Remote images need explicit `width`/`height` or they render 0×0.
- iOS shadows (`shadowColor/Offset/Opacity/Radius`) and Android `elevation` are both
  needed and won't match exactly.
- Rounded corners clip children only with `overflow: 'hidden'`; truncate with
  `numberOfLines`.
- Long lists → **FlashList** (`@shopify/flash-list`; swapping in early beats a
  painful later migration) or `FlatList`; a few items → `ScrollView`.
- Prefer `expo-image` over RN's `Image` (caching, transitions, remote handling);
  in lists, always set explicit `width`/`height` so layout doesn't jump as images
  load.
- Animate only `transform` and `opacity` with Reanimated — they run on the UI
  thread without re-rendering. For taps that must feel native, `Gesture.Tap` from
  `react-native-gesture-handler` beats `Pressable`.

Deeper references when needed: Expo's official building-native-ui skill
(`github.com/expo/skills`) and `vercel-labs/agent-skills` react-native skills.

## 8. Verify

`npx expo start` → scan QR on a real phone → StarterScreen renders with the project's
tokens and fonts, no red-box. On a firewalled Mac use `npm run phone` / `npm run ios`.
