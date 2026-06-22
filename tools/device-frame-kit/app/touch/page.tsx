"use client";

import { useRef, useState } from "react";

/*
 * Carousel — listens to touch events only. On desktop it works inside the
 * frame because simulateTouch synthesizes touchstart/move/end from the mouse
 * (and suppresses the trailing click after a drag). Text-free: soft ghost-shape
 * cards, one in the accent colour.
 */
const SLIDES = [false, true, false, false]; // which slide uses the accent
const SLIDE_STEP = 270; // 256 slide + 14 gap

export default function CarouselDemo() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const drag = useRef({ active: false, startX: 0, startOffset: 0 });

  const maxOffset = -(SLIDES.length - 1) * SLIDE_STEP;

  const onTouchStart = (e: React.TouchEvent) => {
    drag.current = { active: true, startX: e.touches[0].clientX, startOffset: offset };
    if (trackRef.current) trackRef.current.style.transition = "none";
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!drag.current.active) return;
    const dx = e.touches[0].clientX - drag.current.startX;
    setOffset(Math.min(0, Math.max(maxOffset, drag.current.startOffset + dx)));
  };

  const onTouchEnd = () => {
    if (!drag.current.active) return;
    drag.current.active = false;
    if (trackRef.current) trackRef.current.style.transition = "transform 0.3s ease-out";
    setOffset((o) => Math.round(o / SLIDE_STEP) * SLIDE_STEP);
  };

  return (
    <>
      <div className="demo-statusfill" />
      <header className="demo-head">
        <div className="gh gh-strong" style={{ height: 15, width: 110 }} />
      </header>

      <main>
        <div
          className="demo-carousel"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            ref={trackRef}
            className="demo-carousel-track"
            style={{ transform: `translateX(${offset}px)` }}
          >
            {SLIDES.map((accent, i) => (
              <div
                key={i}
                className={`demo-carousel-slide${accent ? " card--accent" : ""}`}
              >
                <div className="card-top">
                  <div className="gh" style={{ height: 13, width: 96 }} />
                  <div className="gh-pill" style={{ height: 18, width: 56 }} />
                </div>
                <div className="gh-icon" style={{ width: 34, height: 34 }} />
                <div className="gh gh-strong" style={{ height: 34, width: 130, marginTop: 16 }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
