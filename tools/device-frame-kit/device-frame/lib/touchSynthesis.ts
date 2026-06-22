/*
 * Opt-in touch simulation inside the phone iframe (config.simulateTouch).
 * Battle-tested in production infinite-canvas prototypes:
 * - patchTouchSurface: makes the iframe report itself as a touch device
 *   (maxTouchPoints, ontouchstart, coarse-pointer media queries)
 * - synthesizeTouch: mirrors mouse input as touchstart/touchmove/touchend,
 *   suppressing the trailing click after a drag (like a real mobile browser)
 * - trackCursor / hideInnerCursor: replaces the OS cursor with a round
 *   finger-sized dot so screen shares read as touch
 */

export function hideInnerCursor(doc: Document) {
  const style = doc.createElement("style");
  style.setAttribute("data-device-frame", "cursor-hide");
  style.textContent = `
    *, *::before, *::after { cursor: none !important; }
  `;
  (doc.head || doc.documentElement).appendChild(style);
}

export function patchTouchSurface(win: Window) {
  try {
    Object.defineProperty(win.navigator, "maxTouchPoints", {
      configurable: true,
      get: () => 5,
    });
  } catch {}
  try {
    Object.defineProperty(win, "ontouchstart", {
      configurable: true,
      value: null,
    });
  } catch {}

  const originalMM = win.matchMedia.bind(win);
  const coerced = (query: string, matches: boolean): MediaQueryList => ({
    matches,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
  (win as unknown as { matchMedia: (q: string) => MediaQueryList }).matchMedia =
    (query: string) => {
      if (/pointer\s*:\s*coarse/.test(query)) return coerced(query, true);
      if (/pointer\s*:\s*fine/.test(query)) return coerced(query, false);
      if (/hover\s*:\s*none/.test(query)) return coerced(query, true);
      if (/hover\s*:\s*hover/.test(query)) return coerced(query, false);
      if (/any-pointer\s*:\s*coarse/.test(query)) return coerced(query, true);
      if (/any-hover\s*:\s*none/.test(query)) return coerced(query, true);
      return originalMM(query);
    };
}

export function synthesizeTouch(doc: Document): () => void {
  const win = doc.defaultView as (Window & typeof globalThis) | null;
  if (!win) return () => {};
  const TouchCtor = (win as unknown as { Touch?: typeof Touch }).Touch;
  const TouchEventCtor = (win as unknown as { TouchEvent?: typeof TouchEvent })
    .TouchEvent;
  if (!TouchCtor || !TouchEventCtor) return () => {};

  // Mobile browsers suppress `click` when the finger travels past ~10px
  // between touchstart and touchend. Desktop fires `click` regardless, so
  // any drag would also register as a tap on release. Track drag distance
  // and cancel the trailing click when it exceeds the threshold.
  const TAP_SLOP_PX = 8;

  let active = false;
  let touchId = 0;
  let startX = 0;
  let startY = 0;
  let maxMove = 0;
  let suppressNextClick = false;

  const fire = (
    type: "touchstart" | "touchmove" | "touchend",
    e: MouseEvent,
  ) => {
    const target = e.target as EventTarget | null;
    if (!target) return;
    const touch = new TouchCtor({
      identifier: touchId,
      target,
      clientX: e.clientX,
      clientY: e.clientY,
      screenX: e.screenX,
      screenY: e.screenY,
      pageX: e.pageX,
      pageY: e.pageY,
      radiusX: 10,
      radiusY: 10,
      force: 1,
    });
    const touches = type === "touchend" ? [] : [touch];
    const event = new TouchEventCtor(type, {
      bubbles: true,
      cancelable: true,
      touches,
      targetTouches: touches,
      changedTouches: [touch],
    });
    target.dispatchEvent(event);
  };

  const onDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    active = true;
    touchId++;
    startX = e.clientX;
    startY = e.clientY;
    maxMove = 0;
    fire("touchstart", e);
  };
  const onMove = (e: MouseEvent) => {
    if (!active) return;
    const dist = Math.hypot(e.clientX - startX, e.clientY - startY);
    if (dist > maxMove) maxMove = dist;
    fire("touchmove", e);
  };
  const onUp = (e: MouseEvent) => {
    if (!active) return;
    active = false;
    suppressNextClick = maxMove > TAP_SLOP_PX;
    fire("touchend", e);
  };
  const onClick = (e: MouseEvent) => {
    if (!suppressNextClick) return;
    suppressNextClick = false;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
  };

  doc.addEventListener("mousedown", onDown, true);
  doc.addEventListener("mousemove", onMove, true);
  doc.addEventListener("mouseup", onUp, true);
  doc.addEventListener("click", onClick, true);
  return () => {
    doc.removeEventListener("mousedown", onDown, true);
    doc.removeEventListener("mousemove", onMove, true);
    doc.removeEventListener("mouseup", onUp, true);
    doc.removeEventListener("click", onClick, true);
  };
}

export function trackCursor(
  doc: Document,
  iframe: HTMLIFrameElement,
  cursor: HTMLDivElement | null,
): () => void {
  if (!cursor) return () => {};
  const root = doc.documentElement;
  const show = () => {
    cursor.style.opacity = "1";
  };
  const hide = () => {
    cursor.style.opacity = "0";
  };
  // Show + position together: mousemove fires continuously while inside the
  // frame (including across cards and the gaps between them), so visibility is
  // never derived from per-element enter/leave.
  const move = (e: MouseEvent) => {
    const rect = iframe.getBoundingClientRect();
    const parentRect = (
      cursor.offsetParent as HTMLElement | null
    )?.getBoundingClientRect();
    if (!parentRect) return;
    cursor.style.left = `${rect.left - parentRect.left + e.clientX}px`;
    cursor.style.top = `${rect.top - parentRect.top + e.clientY}px`;
    show();
  };
  const press = () => {
    cursor.style.transform = "translate(-50%, -50%) scale(0.7)";
    cursor.style.background = "rgba(0,0,0,0.35)";
  };
  const release = () => {
    cursor.style.transform = "translate(-50%, -50%) scale(1)";
    cursor.style.background = "rgba(0,0,0,0.15)";
  };

  doc.addEventListener("mousemove", move, true);
  // mouseover (bubbles) gives an immediate re-show on re-entry before the
  // first move; idempotent so repeats between elements are harmless.
  doc.addEventListener("mouseover", show, true);
  doc.addEventListener("mousedown", press, true);
  doc.addEventListener("mouseup", release, true);
  // Hide only when the pointer truly leaves the frame. mouseleave on the <html>
  // element itself does NOT fire when moving between its descendants (unlike a
  // capture listener on the document), so card-to-card movement never hides it.
  root.addEventListener("mouseleave", hide);
  // starts hidden (.cursor { opacity: 0 }); first move/over reveals it
  return () => {
    doc.removeEventListener("mousemove", move, true);
    doc.removeEventListener("mouseover", show, true);
    doc.removeEventListener("mousedown", press, true);
    doc.removeEventListener("mouseup", release, true);
    root.removeEventListener("mouseleave", hide);
  };
}
