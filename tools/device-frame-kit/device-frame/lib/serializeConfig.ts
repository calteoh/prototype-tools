import type { DeviceFrameConfig, DeviceFramePage } from "./types";

/*
 * Turn a live DeviceFrameConfig back into the exact text of
 * device-frame.config.ts, including the inline doc comments. The config panel
 * (dev only) uses this so a designer can copy/download the result, paste it
 * over the file and commit — the team then inherits the settings via git.
 *
 * The comments are authored here on purpose: this file owns the canonical
 * format, so a Save → paste round-trips cleanly. Only the field VALUES vary.
 */
export function serializeConfig(settings: DeviceFrameConfig): string {
  return `import { defaultConfig, type DeviceFrameConfig } from "./lib/types";

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
  device: ${serializeDevice(settings.device)},
  frame: ${settings.frame}, // false = raw viewport: no shell, corners or shadow
  backdrop: ${str(settings.backdrop)}, // canvas color behind the phone

  // ── Simulated phone chrome ──
  statusBar: ${settings.statusBar}, // iOS status bar (9:41, Dynamic Island, battery)
  dynamicIsland: ${settings.dynamicIsland}, // false = hide notch, keep status-bar spacing/indicators
  browserChrome: ${settings.browserChrome}, // Safari bottom bar, collapses/expands on scroll
  urlBarDomain: ${str(settings.urlBarDomain)}, // domain shown in the Safari URL pill

  // ── Presenter tools (host layer, outside the phone) ──
  qrCode: ${settings.qrCode}, // QR button to open the prototype on a real phone
  pageNav: ${settings.pageNav}, // "Pages" quick-jump drawer
  pages: ${serializePages(settings.pages)},

  // ── Behavior ──
  simulateTouch: ${settings.simulateTouch}, // mouse acts as a finger inside the phone
};
`;
}

/** Double-quoted string literal with quotes/backslashes escaped. */
function str(value: string): string {
  return JSON.stringify(value);
}

function serializeDevice(device: DeviceFrameConfig["device"]): string {
  if (typeof device === "string") return str(device);
  const parts = [`width: ${device.width}`, `height: ${device.height}`];
  if (device.bezel != null) parts.push(`bezel: ${device.bezel}`);
  if (device.radius != null) parts.push(`radius: ${device.radius}`);
  return `{ ${parts.join(", ")} }`;
}

function serializePages(pages: DeviceFramePage[]): string {
  if (!pages.length) return "[]";
  const rows = pages.map((p) => {
    const parts = [`label: ${str(p.label)}`, `path: ${str(p.path)}`];
    if (p.section) parts.push(`section: ${str(p.section)}`);
    return `    { ${parts.join(", ")} },`;
  });
  return `[\n${rows.join("\n")}\n  ]`;
}
