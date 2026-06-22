"use client";

import styles from "../styles/device-frame.module.css";

/*
 * Simulated iOS status bar for Dynamic Island devices (59px tall). Pure
 * overlay: the prototype renders behind it, exactly like a real page renders
 * behind the status bar in Safari. Prototypes pad themselves with
 * `padding-top: var(--df-safe-area-top, env(safe-area-inset-top))`.
 *
 * "9:41" is Apple's canonical marketing time. Dark glyphs by default — suits
 * light designs; theming can come later if a direction needs it.
 */
export function StatusBar({ dynamicIsland }: { dynamicIsland: boolean }) {
  return (
    <div className={styles.statusBar} aria-hidden>
      <div className={styles.statusTime}>9:41</div>
      {dynamicIsland && <div className={styles.statusIsland} />}
      <div className={styles.statusIcons}>
        {/* Cellular signal */}
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="7.5" width="3" height="4.5" rx="1" />
          <rect x="5" y="5" width="3" height="7" rx="1" />
          <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
          <rect x="15" y="0" width="3" height="12" rx="1" />
        </svg>
        {/* Wi-Fi */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <path d="M8.5 9.6a1.7 1.7 0 0 1 1.2.5l-1.2 1.45L7.3 10.1a1.7 1.7 0 0 1 1.2-.5z" />
          <path d="M8.5 5.9c1.4 0 2.7.5 3.7 1.4l-1.3 1.55a3.5 3.5 0 0 0-4.8 0L4.8 7.3a5.6 5.6 0 0 1 3.7-1.4z" />
          <path d="M8.5 2.2c2.4 0 4.6.85 6.3 2.3l-1.3 1.55A7.7 7.7 0 0 0 8.5 4.3c-1.9 0-3.7.65-5 1.75L2.2 4.5a9.8 9.8 0 0 1 6.3-2.3z" />
        </svg>
        {/* Battery */}
        <svg width="28" height="13" viewBox="0 0 28 13" fill="none">
          <rect x="0.5" y="0.5" width="24" height="12" rx="3.5" stroke="currentColor" opacity="0.35" />
          <rect x="2" y="2" width="21" height="9" rx="2" fill="currentColor" />
          <path
            d="M26 4.5v4a2.2 2.2 0 0 0 0-4z"
            fill="currentColor"
            opacity="0.4"
          />
        </svg>
      </div>
    </div>
  );
}
