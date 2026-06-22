export type DeviceFramePage = {
  /** Text shown in the Pages drawer. */
  label: string;
  /**
   * Route loaded into the phone when clicked. May include query params to
   * deep-link a prototype state, e.g. "/detail?state=b". Each jump is a full
   * page load, so any URL your prototype can boot from is a valid entry.
   */
  path: string;
  /** Optional group header. Entries with the same section are listed together. */
  section?: string;
};

export type DeviceSpec = {
  width: number;
  height: number;
  bezel: number;
  radius: number;
};

export type DeviceFrameConfig = {
  /** Simulated iOS status bar (time, Dynamic Island, signal/wifi/battery). */
  statusBar: boolean;
  /** Simulated Safari bottom bar with scroll-driven collapse/expand. */
  browserChrome: boolean;
  /** Domain text shown in the Safari URL pill, e.g. "example.com". */
  urlBarDomain: string;
  /** QR-code toggle button (top right) for handing the link to a real phone. */
  qrCode: boolean;
  /** "Pages" quick-jump drawer (top left). */
  pageNav: boolean;
  /** Entries for the Pages drawer. Ignored when pageNav is false. */
  pages: DeviceFramePage[];
  /**
   * Synthesize touch events from the mouse inside the phone (touchstart /
   * touchmove / touchend, coarse-pointer media queries, round finger cursor).
   * Needed for touch-only interactions like drag carousels. Off by default
   * because prototypes that branch on pointer type will see "touch" on desktop.
   */
  simulateTouch: boolean;
  /** Viewports at least this wide get the phone frame. Default 768. */
  desktopBreakpoint: number;
  /** Device preset or custom dimensions (CSS px, logical viewport). */
  device: "standard" | "large" | { width: number; height: number; bezel?: number; radius?: number };
  /**
   * Draw the physical phone shell (curved corners, bezel, drop shadow). When
   * false the prototype renders at its exact viewport size with no shell, for a
   * true space-available view. Status bar and Safari bar are unaffected.
   */
  frame: boolean;
  /**
   * Show the Dynamic Island notch in the status bar. Turn off to hide the notch
   * while keeping the status bar's time/battery indicators and 59px spacing.
   * Ignored when `statusBar` is false.
   */
  dynamicIsland: boolean;
  /** Bezel color of the phone shell. */
  frameColor: string;
  /** Background of the page behind the phone. */
  backdrop: string;
};

export const defaultConfig: DeviceFrameConfig = {
  statusBar: true,
  browserChrome: true,
  urlBarDomain: "example.com",
  qrCode: true,
  pageNav: true,
  pages: [{ label: "Home", path: "/" }],
  simulateTouch: false,
  desktopBreakpoint: 768,
  device: "standard",
  frame: true,
  dynamicIsland: true,
  frameColor: "#000",
  backdrop: "#f5f5f4",
};
