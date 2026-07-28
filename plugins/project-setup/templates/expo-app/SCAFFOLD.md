# Expo app scaffold — procedure

Agent procedure for scaffolding one React Native concept app inside a phase folder.
Every config below is field-tested on a professional-sports client's native-mobile prototypes (Expo SDK 54). Do the steps in order.

## 1. Pin to the live Expo Go SDK — before anything else

`create-expo-app` defaults to the newest SDK, which the Expo Go app on reviewers'
phones usually **cannot run yet**. Find the SDK the live Expo Go supports and pin to
it:

1. Look up **Expo Go on the App Store** (`https://apps.apple.com/app/expo-go/id982107779`)
   and read its current version — the major version is the supported SDK (e.g. Expo Go
   `54.0.2` → SDK 54).
2. Scaffold with that template version:
   ```bash
   npx create-expo-app@latest <app-name> --template blank-typescript@sdk-<N>
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

**`tailwind.config.js`** — consumes the canonical tokens file directly:
```js
const tokens = require("./src/theme/tokens.json");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Every file that uses className must be matched here, or Tailwind purges the
  // classes and nothing is styled. Add new source folders as they appear.
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      // Synced from the Figma design library. Don't hand-edit the values:
      // run /sync-tokens, which rewrites tokens.json.
      // Editing this file needs `npx expo start -c` — Metro caches the config.
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
    },
  },
  plugins: [],
};
```

Import `global.css` at the top of `App.tsx`. If dark mode is enabled for the project,
tokens.json semantic colors are `{light, dark}` objects — emit them as
`{ DEFAULT: light, dark: dark }` nested keys or resolve to the light value and note
dark handling in DESIGN.md; keep it minimum-viable.

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
│   ├── theme/tokens.json    # canonical tokens (written by setup / sync-tokens)
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
- Long lists → `FlatList`; a few items → `ScrollView`.

## 8. Verify

`npx expo start` → scan QR on a real phone → StarterScreen renders with the project's
tokens and fonts, no red-box. On a firewalled Mac use `npm run phone` / `npm run ios`.
