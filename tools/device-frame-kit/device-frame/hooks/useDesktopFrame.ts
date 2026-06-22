"use client";

import { useEffect, useState } from "react";
import type { DeviceFrameConfig } from "../lib/types";

export type FrameMode = "raw" | "framed";

/*
 * Decides whether to show the phone frame ("framed") or render the prototype
 * directly ("raw"). Raw is used inside the frame's own iframe (?embed=1) and
 * on real handheld devices, so none of the simulated chrome ever appears on
 * an actual phone.
 *
 * Heuristics (battle-tested in production prototypes): a wide viewport, a fine
 * pointer, or hover capability all indicate a desktop.
 * The fallback catches browser devtools mobile emulation, which reports a
 * narrow coarse-pointer viewport but no real touch digitizer.
 */
export function useDesktopFrame(config: DeviceFrameConfig): FrameMode {
  const [mode, setMode] = useState<FrameMode>("raw");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("embed")) return;

    const mqlWide = window.matchMedia(`(min-width: ${config.desktopBreakpoint}px)`);
    const mqlFine = window.matchMedia("(pointer: fine)");
    const mqlAnyFine = window.matchMedia("(any-pointer: fine)");
    const mqlHover = window.matchMedia("(hover: hover)");
    const mqlCoarse = window.matchMedia("(pointer: coarse)");
    const all = [mqlWide, mqlFine, mqlAnyFine, mqlHover, mqlCoarse];

    const apply = () => {
      let framed =
        mqlWide.matches || mqlFine.matches || mqlAnyFine.matches || mqlHover.matches;

      if (!framed) {
        const noDigitizer =
          typeof navigator.maxTouchPoints === "number" &&
          navigator.maxTouchPoints === 0;
        framed = !mqlWide.matches && mqlCoarse.matches && noDigitizer;
      }

      setMode(framed ? "framed" : "raw");
    };

    apply();
    all.forEach((m) => m.addEventListener("change", apply));
    return () => all.forEach((m) => m.removeEventListener("change", apply));
  }, [config.desktopBreakpoint]);

  return mode;
}
