"use client";

import { useEffect, useState } from "react";

/*
 * Home — a text-free "status dashboard" reduced to its container shapes: a
 * heading, a hero block, and a long stack of empty cards. Demonstrates two
 * scroll-reactive patterns:
 *   1. A page-level sticky header that collapses on scroll-down (distinct from
 *      the OS Safari chrome the kit collapses separately).
 *   2. A fixed bottom tab bar that expands/contracts with the Safari bar, via
 *      the kit's dynamic --df-safe-area-bottom variable.
 */
export default function Home() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setCollapsed(window.scrollY > 32);
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="demo-statusfill" />

      <div className="demo-feed">
        {/* collapsing header: title + subtitle ghosts, logo ghost */}
        <header className="demo-stickyhead screen" data-collapsed={collapsed}>
          <div className="demo-stickyhead-row">
            <div className="demo-stickyhead-titles">
              <div className="gh gh-strong" style={{ height: 15, width: 92 }} />
              <div className="gh demo-stickyhead-sub" style={{ height: 11, width: 150 }} />
            </div>
            <div className="demo-logo">
              <span style={{ height: 9 }} />
              <span style={{ height: 16 }} />
              <span style={{ height: 7 }} />
              <span style={{ height: 13 }} />
              <span style={{ height: 18 }} />
              <span style={{ height: 9 }} />
            </div>
          </div>
        </header>

        {/* hero metric block */}
        <div className="demo-hero">
          <div className="demo-hero-value" />
        </div>

        {/* stack of empty container boxes */}
        <div className="demo-stack">
          <div className="card" style={{ height: 120, background: "var(--g-mid)" }} />
          <div className="demo-row2">
            <div className="card" style={{ height: 188 }} />
            <div className="card" style={{ height: 188 }} />
          </div>
          {Array.from({ length: 18 }, (_, i) => (
            <div className="card" key={i} style={{ height: 132 }} />
          ))}
        </div>
      </div>

      {/* fixed tab bar — four ghost icons only; rides the chrome */}
      <nav className="demo-tabbar">
        {[0, 1, 2, 3].map((i) => (
          <div className="demo-tab" key={i}>
            <div className="gh-icon" style={{ width: 24, height: 24 }} />
          </div>
        ))}
      </nav>
    </>
  );
}
