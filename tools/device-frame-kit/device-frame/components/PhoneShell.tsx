"use client";

import styles from "../styles/device-frame.module.css";
import type { DeviceSpec } from "../lib/types";

/** The phone hardware: bezel, corner radii, drop shadow, screen clipping. */
export function PhoneShell({
  device,
  frameColor,
  children,
}: {
  device: DeviceSpec;
  frameColor: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={styles.shell}
      style={{
        padding: device.bezel,
        borderRadius: device.radius,
        background: frameColor,
      }}
    >
      <div
        className={styles.screen}
        style={{
          width: device.width,
          height: device.height,
          borderRadius: Math.max(device.radius - device.bezel, 0),
        }}
      >
        {children}
      </div>
    </div>
  );
}
