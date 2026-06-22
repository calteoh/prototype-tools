"use client";

import { useCallback, useRef, useState } from "react";
import { COLLAPSE_THRESHOLD_PX, EXPAND_THRESHOLD_PX } from "../lib/constants";

export type ChromeState = "expanded" | "collapsed";

/*
 * Threshold-triggered Safari toolbar state machine. Mirrors real iOS Safari:
 * - collapse after ~30px of accumulated downward scroll
 * - expand after a short upward scroll, on reaching the top of the scroller,
 *   or on tapping the collapsed pill
 * - any inner overflow scroller counts, not just the window (Safari 15+)
 * The in-between animation is handled by CSS transitions on the consumers;
 * real Safari's 60%-commit/revert mid-gesture behavior is approximated by
 * the accumulator thresholds.
 */
export function useSafariChrome(enabled: boolean) {
  const [state, setState] = useState<ChromeState>("expanded");
  const stateRef = useRef<ChromeState>("expanded");
  const acc = useRef(0); // signed scroll accumulator; positive = downward

  const set = useCallback((next: ChromeState) => {
    stateRef.current = next;
    acc.current = 0;
    setState(next);
  }, []);

  const onScrollDelta = useCallback(
    (delta: number, atTop: boolean) => {
      if (!enabled) return;
      if (atTop) {
        if (stateRef.current === "collapsed") set("expanded");
        return;
      }
      // Direction change resets the accumulator, like Safari's gesture tracking.
      if (delta !== 0 && Math.sign(delta) !== Math.sign(acc.current)) acc.current = 0;
      acc.current += delta;
      if (stateRef.current === "expanded" && acc.current > COLLAPSE_THRESHOLD_PX) {
        set("collapsed");
      } else if (stateRef.current === "collapsed" && acc.current < -EXPAND_THRESHOLD_PX) {
        set("expanded");
      }
    },
    [enabled, set],
  );

  const expand = useCallback(() => set("expanded"), [set]);
  // Each page-nav jump is a full load; Safari always starts expanded.
  const reset = useCallback(() => set("expanded"), [set]);

  return { state, onScrollDelta, expand, reset };
}
