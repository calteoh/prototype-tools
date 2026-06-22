"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { config } from "./device-frame.config";
import type { DeviceFrameConfig } from "./lib/types";
import { readableIconColor } from "./lib/contrast";
import { useDesktopFrame } from "./hooks/useDesktopFrame";
import { useSafariChrome } from "./hooks/useSafariChrome";
import { useEmbedded } from "./useEmbedded";
import { installBridge } from "./lib/iframeBridge";
import { resolveDevice, safariSafeAreaBottom } from "./lib/constants";
import { PhoneShell } from "./components/PhoneShell";
import { StatusBar } from "./components/StatusBar";
import { SafariBar } from "./components/SafariBar";
import { PageNav, normalizePath } from "./components/PageNav";
import { QrToggle } from "./components/QrToggle";
import dynamic from "next/dynamic";
import styles from "./styles/device-frame.module.css";

// Dev-only config panel, loaded via a gated dynamic import. The
// process.env.NODE_ENV ternary lets the bundler drop the import() (and the
// whole ConfigPanel + serializer chunk) from production — a NODE_ENV check at
// the render site alone would keep the dead code in the shipped bundle.
const ConfigPanel =
  process.env.NODE_ENV === "development"
    ? dynamic(() => import("./components/ConfigPanel").then((m) => m.ConfigPanel), { ssr: false })
    : null;

/*
 * DeviceFrame — wrap your root layout's children with this component.
 *
 * On a desktop browser it re-renders the prototype inside an iframe (same URL
 * + ?embed=1) and draws a phone shell, simulated iOS chrome, a Pages drawer
 * and a QR code around it. On a real phone (or inside its own iframe) it
 * renders children untouched, so none of the simulation ever reaches an
 * actual device.
 *
 * Options live in ./device-frame.config.ts. In development that file seeds a
 * live, in-memory copy that the hidden config panel (⇧⌘. or ?config=1) can
 * tweak and serialize back to the file. The panel is dev-only and never ships
 * in the exported build.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  // The file config is the seed; in dev the panel mutates this in-memory copy
  // so the frame previews live. Production builds only ever read the seed.
  const [settings, setSettings] = useState<DeviceFrameConfig>(config);

  const mode = useDesktopFrame(settings);
  const embedded = useEmbedded();
  const [embedUrl, setEmbedUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [activePath, setActivePath] = useState("/");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const chrome = useSafariChrome(settings.browserChrome);

  // Icon color for the host toggles, chosen for contrast against the backdrop
  // (flips black/white). Resolves client-side; harmless default during SSR.
  const iconColor = useMemo(() => readableIconColor(settings.backdrop), [settings.backdrop]);

  // Prepend basePath so jump URLs resolve on sub-path deploys (empty in dev).
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  // Entering framed mode: mirror the current URL into the iframe.
  useEffect(() => {
    if (mode !== "framed") return;
    const u = new URL(window.location.href);
    u.searchParams.set("embed", "1");
    setEmbedUrl(u.toString());
    setShareUrl(window.location.href);

    const path = window.location.pathname.slice(basePath.length) || "/";
    const search = new URLSearchParams(window.location.search);
    search.delete("embed");
    const qs = search.toString();
    setActivePath(normalizePath(qs ? `${path}?${qs}` : path));
  }, [mode, basePath]);

  // Rewrite the iframe source (and keep the QR in sync) to load a target route.
  const goTo = (path: string) => {
    const u = new URL(`${window.location.origin}${basePath}${path}`);
    u.searchParams.set("embed", "1");
    setEmbedUrl(u.toString());
    setShareUrl(`${window.location.origin}${basePath}${path}`);
    setActivePath(normalizePath(path));
    chrome.reset();
  };

  // Install the in-iframe bridge (safe-area vars, scroll listening, optional
  // touch synthesis) on every full load of the iframe document. Re-runs when
  // the chrome/touch settings change so the panel previews them live; toggling
  // simulateTouch may need an iframe reload to fully unpatch (dev-tool caveat).
  useEffect(() => {
    if (mode !== "framed") return;
    const iframe = iframeRef.current;
    if (!iframe) return;

    let cleanup: (() => void) | undefined;
    const onLoad = () => {
      cleanup?.();
      chrome.reset();
      cleanup = installBridge(
        iframe,
        settings,
        { onScrollDelta: chrome.onScrollDelta },
        cursorRef.current,
      );
    };
    iframe.addEventListener("load", onLoad);
    // The iframe may already be loaded at effect time (bfcache / fast loads).
    if (iframe.contentDocument?.readyState === "complete") onLoad();
    return () => {
      iframe.removeEventListener("load", onLoad);
      cleanup?.();
    };
  }, [
    mode,
    embedUrl,
    chrome.onScrollDelta,
    chrome.reset,
    settings.statusBar,
    settings.browserChrome,
    settings.simulateTouch,
  ]);

  // Keep the prototype's <html data-df-chrome="..."> in sync so its CSS can
  // react to the collapse ([data-df-chrome="collapsed"] ...). The attribute
  // is only written from the first state CHANGE onward (state changes need a
  // user scroll, which is always after hydration) — writing it at load time
  // would race the prototype's hydration and trigger React mismatch warnings.
  // Absent attribute = expanded, so treat expanded as the default in CSS.
  useEffect(() => {
    if (mode !== "framed" || !settings.browserChrome) return;
    const root = iframeRef.current?.contentDocument?.documentElement;
    if (!root) return;
    if (chrome.state === "collapsed" || root.hasAttribute("data-df-chrome")) {
      root.setAttribute("data-df-chrome", chrome.state);
      // Track the chrome height so fixed bottom content rides with the bar
      // (animates via the @property transition the bridge registered).
      root.style.setProperty(
        "--df-safe-area-bottom",
        `${safariSafeAreaBottom(chrome.state)}px`,
      );
    }
  }, [mode, chrome.state, settings.browserChrome]);

  // Host-document-only (never inside the embed iframe). ConfigPanel is null in
  // production builds, so this is a no-op there.
  const panel =
    ConfigPanel && !embedded ? (
      <ConfigPanel settings={settings} onChange={setSettings} seed={config} />
    ) : null;

  if (mode === "raw") {
    return (
      <>
        {children}
        {panel}
      </>
    );
  }

  const device = resolveDevice(settings.device);

  return (
    <div
      className={styles.host}
      style={{ background: settings.backdrop, ["--df-icon-color" as string]: iconColor } as React.CSSProperties}
    >
      <PhoneShell device={device} frameColor={settings.frameColor} frame={settings.frame}>
        {/* iOS 26 model: the iframe is full height and the page scrolls behind
            the floating glass Safari bar, so the bar's blur refracts it. */}
        {embedUrl && (
          <iframe
            ref={iframeRef}
            src={embedUrl}
            title="Prototype preview"
            className={styles.iframe}
            style={{
              height: device.height,
              cursor: settings.simulateTouch ? "none" : undefined,
            }}
          />
        )}
        {settings.statusBar && <StatusBar dynamicIsland={settings.dynamicIsland} />}
        {settings.browserChrome && (
          <SafariBar
            state={chrome.state}
            domain={settings.urlBarDomain}
            screenWidth={device.width}
            onExpandTap={chrome.expand}
          />
        )}
        {settings.simulateTouch && (
          <div ref={cursorRef} className={styles.cursor} aria-hidden />
        )}
      </PhoneShell>

      {settings.pageNav && settings.pages.length > 0 && (
        <PageNav pages={settings.pages} activePath={activePath} onNavigate={goTo} />
      )}
      {settings.qrCode && <QrToggle shareUrl={shareUrl} />}

      {panel}
    </div>
  );
}
