import type { DeviceFrameConfig, DeviceSpec } from "./types";

export const DEVICE_PRESETS: Record<string, DeviceSpec> = {
  // iPhone 14/15 class logical viewport. Bezel/radius are presentation-only.
  "iphone-14": { width: 390, height: 844, bezel: 10, radius: 44 },
};

export function resolveDevice(device: DeviceFrameConfig["device"]): DeviceSpec {
  if (typeof device === "string") {
    return DEVICE_PRESETS[device] ?? DEVICE_PRESETS["iphone-14"];
  }
  return {
    width: device.width,
    height: device.height,
    bezel: device.bezel ?? 10,
    radius: device.radius ?? 44,
  };
}

/*
 * iOS 26 "Liquid Glass" Safari chrome metrics (iPhone 14/15 class), matched to
 * the iOS 26 Safari reference.
 *
 * iOS 26 replaced the docked toolbar with FLOATING glass elements above the
 * page; content scrolls underneath, so the glass blur refracts it. The
 * simulation overlays the floating chrome on a full-height iframe rather than
 * shrinking it.
 *
 * Expanded = three pills (back · search bar · more) with wide edge/bottom
 * margins, plus a contrast fade from the chrome down to the bottom edge.
 * Scrolled = a single compact domain pill near the bottom, no fade.
 *
 * Threshold-triggered: minimizes after ~30pt of accumulated downward scroll,
 * expands on a short upward scroll, on reaching the top, or on tapping it.
 */
export const STATUS_BAR_H = 59; // Dynamic Island devices: 59pt status bar

// Expanded chrome (three-pill row), from the Figma "Chrome / Default" instance.
export const SAFARI_SIDE_MARGIN = 32; // left/right inset of the pill row
export const SAFARI_EXPANDED_BOTTOM = 34; // gap from the screen bottom
export const SAFARI_PILL_H = 48; // pill / circular-button height
export const SAFARI_PILL_GAP = 10; // gap between the three pills

// Scrolled chrome (single compact pill), from the Figma "Chrome / Scroll" instance.
// The center search bar morphs to this; the side buttons fade away.
export const SAFARI_SCROLLED_H = 32;
export const SAFARI_SCROLLED_W = 108;
export const SAFARI_SCROLLED_BOTTOM = 14;

// Contrast fade behind the expanded chrome (transparent -> light at the edge).
export const SAFARI_FADE_H = 150;

/*
 * Drives --df-safe-area-bottom: the height the floating chrome occupies from
 * the bottom edge (its bottom offset + pill height). This tracks the chrome
 * state, so a fixed bottom element padded by the var rides up and down with
 * the URL bar instead of being overlaid. On a real device the env() fallback
 * (the home indicator, ~34px) takes over.
 */
export function safariSafeAreaBottom(state: "expanded" | "collapsed"): number {
  return state === "expanded"
    ? SAFARI_EXPANDED_BOTTOM + SAFARI_PILL_H // 34 + 48 = 82
    : SAFARI_SCROLLED_BOTTOM + SAFARI_SCROLLED_H; // 14 + 32 = 46
}

export const COLLAPSE_THRESHOLD_PX = 30; // accumulated downward scroll to collapse
export const EXPAND_THRESHOLD_PX = 10; // accumulated upward scroll to expand

// Approximates Safari's two-phase (0.1s linear + 0.2s ease) toolbar animation.
export const CHROME_TRANSITION = "0.3s cubic-bezier(0.25, 0.1, 0.25, 1)";
