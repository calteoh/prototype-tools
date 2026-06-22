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

  // ── Simulated phone chrome ──
  statusBar: true, // iOS status bar (9:41, Dynamic Island, battery)
  browserChrome: true, // Safari bottom bar, collapses/expands on scroll
  urlBarDomain: "example.com", // domain shown in the Safari URL pill

  // ── Presenter tools (host layer, outside the phone) ──
  qrCode: true, // QR button to open the prototype on a real phone
  pageNav: true, // "Pages" quick-jump drawer
  pages: [
    { label: "Home", path: "/" },
    { label: "Gallery", path: "/gallery" },
    { label: "Carousel", path: "/touch", section: "Interactions" },
  ],

  // ── Behavior ──
  simulateTouch: true, // mouse acts as a finger inside the phone
};
