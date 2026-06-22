"use client";

import styles from "../styles/device-frame.module.css";
import type { DeviceSpec } from "../lib/types";

/** The phone hardware: bezel, corner radii, drop shadow, screen clipping. */
export function PhoneShell({
  device,
  frameColor,
  frame,
  children,
}: {
  device: DeviceSpec;
  frameColor: string;
  /** When false, drop the shell (bezel, corners, shadow) and show the raw viewport. */
  frame: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${styles.shell}${frame ? "" : ` ${styles.shellBare}`}`}
      style={{
        padding: frame ? device.bezel : 0,
        borderRadius: frame ? device.radius : 0,
        background: frame ? frameColor : "transparent",
      }}
    >
      <div
        className={styles.screen}
        style={{
          width: device.width,
          height: device.height,
          borderRadius: frame ? Math.max(device.radius - device.bezel, 0) : 0,
        }}
      >
        {children}
      </div>
    </div>
  );
}
