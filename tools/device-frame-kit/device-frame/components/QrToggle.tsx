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
      className={`${styles.qrToggle}${qr ? ` ${styles.qrOpen}` : ""}`}
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden style={{ display: "block" }}>
          <path d="M16 17V16H13V13H16V15H18V17H17V19H15V21H13V18H15V17H16ZM21 21H17V19H19V17H21V21ZM3 3H11V11H3V3ZM5 5V9H9V5H5ZM13 3H21V11H13V3ZM15 5V9H19V5H15ZM3 13H11V21H3V13ZM5 15V19H9V15H5ZM18 13H21V15H18V13ZM6 6H8V8H6V6ZM6 16H8V18H6V16ZM16 6H18V8H16V6Z" />
        </svg>
      )}
    </button>
  );
}
