import { defaultConfig, type DeviceFrameConfig } from "./lib/types";

/*
 * ─── Device frame configuration ──────────────────────────────────────────
 * This is the only file you need to edit. Every option is typed — your
 * editor will autocomplete and explain each field.
 *
 * None of this renders on a real phone: below the desktop breakpoint the
 * prototype is shown raw, with no simulated chrome.
 */
export const config: DeviceFrameConfig = {
  ...defaultConfig,

  // ── Device & canvas ──
  // Screen size. Use a preset name, or your own size in curly braces.
  //   Presets:  "standard" (390×844)   "large" (430×932)
  //   Custom size (keeps the default border thickness + corners):
  //     device: { width: 360, height: 780 },
  //   Fully custom (also set the border thickness "bezel" and corner "radius"):
  //     device: { width: 360, height: 780, bezel: 12, radius: 50 },
  device: "standard",
  frame: true, // false = raw viewport: no shell, corners or shadow
  backdrop: "#f5f5f4", // canvas color behind the phone

  // ── Simulated phone chrome ──
  statusBar: true, // iOS status bar (9:41, Dynamic Island, battery)
  dynamicIsland: false, // false = hide notch, keep status-bar spacing/indicators
  browserChrome: true, // Safari bottom bar, collapses/expands on scroll
  urlBarDomain: "example.com", // domain shown in the Safari URL pill

  // ── Presenter tools (host layer, outside the phone) ──
  qrCode: true, // QR button to open the prototype on a real phone
  pageNav: true, // "Pages" quick-jump drawer
  pages: [
    { label: "Page with fixed elements", path: "/" },
    { label: "Page", path: "/gallery" },
    { label: "Carousel", path: "/touch", section: "Interactions" },
  ],

  // ── Behavior ──
  simulateTouch: true, // mouse acts as a finger inside the phone
};
