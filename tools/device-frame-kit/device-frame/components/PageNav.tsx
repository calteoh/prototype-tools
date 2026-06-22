"use client";

import { useState } from "react";
import styles from "../styles/device-frame.module.css";
import type { DeviceFramePage } from "../lib/types";

/*
 * "Pages" quick-jump drawer in the host layer. Entries come from the config
 * file; each click does a full page load in the phone iframe, so any URL the
 * prototype can boot from (including ?state=... deep links) is a valid jump
 * target — no coupling to the prototype's router.
 */
export function PageNav({
  pages,
  activePath,
  onNavigate,
}: {
  pages: DeviceFramePage[];
  activePath: string;
  onNavigate: (path: string) => void;
}) {
  const [open, setOpen] = useState(false);

  // Group consecutive entries by section, preserving config order.
  const groups: Array<{ section?: string; items: DeviceFramePage[] }> = [];
  for (const page of pages) {
    const last = groups[groups.length - 1];
    if (last && last.section === page.section) last.items.push(page);
    else groups.push({ section: page.section, items: [page] });
  }

  return (
    <div className={styles.pageNav}>
      <button
        type="button"
        className={styles.pageToggle}
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Hide pages" : "Show pages"}
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M3 4H21V6H3V4ZM3 11H21V13H3V11ZM3 18H21V20H3V18Z" />
        </svg>
      </button>

      {open && (
        <nav className={styles.drawer}>
          {groups.map((group, gi) => (
            <div key={gi} style={{ display: "contents" }}>
              {group.section && (
                <div className={styles.drawerSection}>{group.section}</div>
              )}
              {group.items.map((page) => {
                const isActive = normalizePath(page.path) === normalizePath(activePath);
                return (
                  <button
                    key={page.path}
                    type="button"
                    onClick={() => onNavigate(page.path)}
                    aria-current={isActive ? "page" : undefined}
                    className={`${styles.drawerItem} ${isActive ? styles.drawerItemActive : ""}`}
                  >
                    {page.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      )}
    </div>
  );
}

/** "/detail/?state=b" and "/detail?state=b" should compare equal. */
export function normalizePath(p: string): string {
  const [path, qs = ""] = p.split("?");
  const cleaned = path.replace(/\/+$/, "") || "/";
  return qs ? `${cleaned}?${qs}` : cleaned;
}
