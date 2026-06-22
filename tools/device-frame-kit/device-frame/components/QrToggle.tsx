"use client";

import { useMemo, useState } from "react";
import styles from "../styles/device-frame.module.css";
import { qrSvgPath } from "../lib/qr";

/*
 * QR toggle in the host layer. Encodes the share URL (without ?embed=1) so a
 * reviewer can point a phone camera at the screen and open the prototype
 * frameless on the real device.
 */
export function QrToggle({ shareUrl }: { shareUrl: string }) {
  const [visible, setVisible] = useState(false);

  const qr = useMemo(() => {
    if (!visible || !shareUrl) return null;
    return qrSvgPath(shareUrl);
  }, [visible, shareUrl]);

  return (
    <button
      type="button"
      className={styles.qrToggle}
      onClick={() => setVisible((v) => !v)}
      aria-label={visible ? "Hide QR code" : "Show QR code"}
    >
      {qr ? (
        // 4-module quiet zone via the viewBox, per the QR spec.
        <svg
          width="160"
          height="160"
          viewBox={`-4 -4 ${qr.size + 8} ${qr.size + 8}`}
          shapeRendering="crispEdges"
          style={{ display: "block" }}
        >
          <rect x="-4" y="-4" width={qr.size + 8} height={qr.size + 8} fill="#fff" />
          <path d={qr.d} fill="#000" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden style={{ display: "block" }}>
          <path d="M1 1h6v6H1V1zm1 1v4h4V2H2zm7-1h6v6H9V1zm1 1v4h4V2h-4zM1 9h6v6H1V9zm1 1v4h4v-4H2zm7 0h2v2H9v-2zm4 0h2v2h-2v-2zm-4 4h2v2H9v-2zm2-2h2v2h-2v-2zm2 2h2v2h-2v-2z" />
        </svg>
      )}
    </button>
  );
}
