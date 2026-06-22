import type { DeviceFrameConfig } from "./types";
import { CHROME_TRANSITION, STATUS_BAR_H, safariSafeAreaBottom } from "./constants";
import {
  hideInnerCursor,
  patchTouchSurface,
  synthesizeTouch,
  trackCursor,
} from "./touchSynthesis";

export type BridgeCallbacks = {
  /**
   * Signed scroll delta from any scroller inside the iframe (positive =
   * downward) plus whether that scroller is at its top.
   */
  onScrollDelta: (delta: number, atTop: boolean) => void;
};

/*
 * Runs against the same-origin iframe document after each load. Responsible
 * for everything that has to live *inside* the simulated phone:
 *
 * - safe-area CSS custom properties (--df-safe-area-top/-bottom) so the
 *   prototype can pad itself under the simulated status bar with
 *   `padding-top: var(--df-safe-area-top, env(safe-area-inset-top))` —
 *   the var() fallback means the exact same CSS works on a real phone,
 *   where this bridge never runs.
 * - data-df-chrome attribute on <html> (kept in sync by DeviceFrame) so
 *   prototypes can restyle on collapse: [data-df-chrome="collapsed"] ...
 * - scroll listening: ONE capture-phase listener on the document sees the
 *   window scroll and every inner overflow scroller, matching Safari 15+
 *   which collapses its bar on any scroll, not just the body.
 * - hidden scrollbars (a phone never shows desktop scrollbars)
 * - optional touch synthesis (config.simulateTouch)
 */
export function installBridge(
  iframe: HTMLIFrameElement,
  config: DeviceFrameConfig,
  callbacks: BridgeCallbacks,
  cursorEl: HTMLDivElement | null,
): (() => void) | undefined {
  const win = iframe.contentWindow;
  const doc = iframe.contentDocument;
  if (!win || !doc || !doc.documentElement) return;

  const cleanups: Array<() => void> = [];

  /*
   * Safe-area vars go in via a <style> tag, NOT inline styles on <html> —
   * mutating attributes of the iframe's documentElement before its React
   * app finishes hydrating triggers a hydration-mismatch warning inside the
   * prototype. Extra head nodes are ignored by hydration. (Same reason
   * data-df-chrome is only set on the first real state change — see
   * DeviceFrame.) Also hides desktop scrollbars; a phone never shows them.
   *
   * The bottom var tracks the floating chrome's height (DeviceFrame updates it
   * per state). It starts at the expanded footprint; registering it via
   * @property + a :root transition makes it ANIMATE, so a fixed bottom element
   * padded by var(--df-safe-area-bottom) rides up/down with the URL bar for
   * free — no transition needed on the consumer.
   */
  const safeBottom = config.browserChrome
    ? `${safariSafeAreaBottom("expanded")}px`
    : "0px";
  const style = doc.createElement("style");
  style.setAttribute("data-device-frame", "bridge");
  style.textContent = `
    @property --df-safe-area-bottom {
      syntax: "<length>";
      inherits: true;
      initial-value: 0px;
    }
    :root {
      --df-safe-area-top: ${config.statusBar ? `${STATUS_BAR_H}px` : "0px"};
      --df-safe-area-bottom: ${safeBottom};
      transition: --df-safe-area-bottom ${CHROME_TRANSITION};
    }
    * { scrollbar-width: none !important; -ms-overflow-style: none !important; }
    *::-webkit-scrollbar { display: none !important; width: 0 !important; height: 0 !important; }
  `;
  (doc.head || doc.documentElement).appendChild(style);
  cleanups.push(() => style.remove());

  if (config.browserChrome) {
    const lastTops = new WeakMap<object, number>();
    // Seed the window scroller so its first event reports a true delta.
    // Other scrollers default to a baseline of 0 on first sight — otherwise
    // a single-jump scroll (anchor link, scrollTo) would be swallowed as
    // baseline-setting and never collapse the bar.
    const pageScroller = (doc.scrollingElement ?? doc.documentElement) as Element;
    lastTops.set(pageScroller, pageScroller.scrollTop);
    const onScroll = (e: Event) => {
      const target = e.target as { scrollTop?: number } | null;
      const el =
        target && typeof target.scrollTop === "number"
          ? (target as unknown as Element)
          : pageScroller;
      const top = el.scrollTop;
      const last = lastTops.get(el) ?? 0;
      lastTops.set(el, top);
      callbacks.onScrollDelta(top - last, top <= 0);
    };
    doc.addEventListener("scroll", onScroll, { capture: true, passive: true });
    cleanups.push(() =>
      doc.removeEventListener("scroll", onScroll, { capture: true } as EventListenerOptions),
    );
  }

  if (config.simulateTouch) {
    patchTouchSurface(win);
    hideInnerCursor(doc);
    cleanups.push(synthesizeTouch(doc));
    cleanups.push(trackCursor(doc, iframe, cursorEl));
  }

  return () => cleanups.forEach((fn) => fn());
}
