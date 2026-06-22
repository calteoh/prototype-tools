"use client";

import { useEffect, useRef, useState } from "react";
import { config } from "./device-frame.config";
import { useDesktopFrame } from "./hooks/useDesktopFrame";
import { useSafariChrome } from "./hooks/useSafariChrome";
import { installBridge } from "./lib/iframeBridge";
import { resolveDevice, safariSafeAreaBottom } from "./lib/constants";
import { PhoneShell } from "./components/PhoneShell";
import { StatusBar } from "./components/StatusBar";
import { SafariBar } from "./components/SafariBar";
import { PageNav, normalizePath } from "./components/PageNav";
import { QrToggle } from "./components/QrToggle";
import styles from "./styles/device-frame.module.css";

/*
 * DeviceFrame — wrap your root layout's children with this component.
 *
 * On a desktop browser it re-renders the prototype inside an iframe (same URL
 * + ?embed=1) and draws a phone shell, simulated iOS chrome, a Pages drawer
 * and a QR code around it. On a real phone (or inside its own iframe) it
 * renders children untouched, so none of the simulation ever reaches an
 * actual device.
 *
 * All options live in ./device-frame.config.ts — there is deliberately no
 * on-screen settings UI.
 */
export function DeviceFrame({ children }: { children: React.ReactNode }) {
  const mode = useDesktopFrame(config);
  const [embedUrl, setEmbedUrl] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [activePath, setActivePath] = useState("/");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const cursorRef = useRef<HTMLDivElement>(null);
  const chrome = useSafariChrome(config.browserChrome);

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
  // touch synthesis) on every full load of the iframe document.
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
        config,
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
  }, [mode, embedUrl, chrome.onScrollDelta, chrome.reset]);

  // Keep the prototype's <html data-df-chrome="..."> in sync so its CSS can
  // react to the collapse ([data-df-chrome="collapsed"] ...). The attribute
  // is only written from the first state CHANGE onward (state changes need a
  // user scroll, which is always after hydration) — writing it at load time
  // would race the prototype's hydration and trigger React mismatch warnings.
  // Absent attribute = expanded, so treat expanded as the default in CSS.
  useEffect(() => {
    if (mode !== "framed" || !config.browserChrome) return;
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
  }, [mode, chrome.state]);

  if (mode === "raw") return <>{children}</>;

  const device = resolveDevice(config.device);

  return (
    <div className={styles.host} style={{ background: config.backdrop }}>
      <PhoneShell device={device} frameColor={config.frameColor}>
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
              cursor: config.simulateTouch ? "none" : undefined,
            }}
          />
        )}
        {config.statusBar && <StatusBar />}
        {config.browserChrome && (
          <SafariBar
            state={chrome.state}
            domain={config.urlBarDomain}
            screenWidth={device.width}
            onExpandTap={chrome.expand}
          />
        )}
        {config.simulateTouch && (
          <div ref={cursorRef} className={styles.cursor} aria-hidden />
        )}
      </PhoneShell>

      {config.pageNav && config.pages.length > 0 && (
        <PageNav pages={config.pages} activePath={activePath} onNavigate={goTo} />
      )}
      {config.qrCode && <QrToggle shareUrl={shareUrl} />}
    </div>
  );
}
