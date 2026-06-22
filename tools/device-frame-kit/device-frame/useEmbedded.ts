"use client";

import { useEffect, useState } from "react";

/*
 * True when the prototype is running inside the DeviceFrame iframe (?embed=1).
 * Use it for the rare thing that should only exist in the desktop simulation,
 * never on a real phone. Also sets data-embed="1" on <html> so plain CSS can
 * target the embedded state: [data-embed="1"] .thing { ... }
 *
 * Returns false on first render (and always on the server), then updates —
 * gate presentation-only details with it, not layout-critical logic.
 */
export function useEmbedded(): boolean {
  const [embedded, setEmbedded] = useState(false);

  useEffect(() => {
    const isEmbedded = new URLSearchParams(window.location.search).has("embed");
    setEmbedded(isEmbedded);
    if (isEmbedded) {
      document.documentElement.dataset.embed = "1";
    }
  }, []);

  return embedded;
}
