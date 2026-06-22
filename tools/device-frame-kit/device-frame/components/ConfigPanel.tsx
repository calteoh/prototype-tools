"use client";

import { useEffect, useState } from "react";
import styles from "./ConfigPanel.module.css";
import type { DeviceFrameConfig, DeviceSpec } from "../lib/types";
import { resolveDevice } from "../lib/constants";
import { serializeConfig } from "../lib/serializeConfig";

/*
 * Dev-only control panel. Lets a designer configure the frame visually, see it
 * update live, then copy/download the result back into device-frame.config.ts
 * so the whole team inherits it via git.
 *
 * Deliberately invisible on the canvas: there is no on-screen trigger. Open it
 * with ⇧⌘. (⇧Ctrl. on Windows/Linux) or by visiting the page with ?config=1.
 * DeviceFrame only mounts this in development and outside the embed iframe, so
 * it is tree-shaken out of the exported (presentation) build entirely.
 */
export function ConfigPanel({
  settings,
  onChange,
  seed,
}: {
  settings: DeviceFrameConfig;
  onChange: (next: DeviceFrameConfig) => void;
  seed: DeviceFrameConfig;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Open on ?config=1; toggle on ⇧⌘. / ⇧Ctrl. ; close on Esc.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("config") === "1") {
      setOpen(true);
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && (e.key === "." || e.code === "Period")) {
        e.preventDefault();
        setOpen((v) => !v);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!open) return null;

  // Single-field updater that preserves the rest of the config.
  const set = <K extends keyof DeviceFrameConfig>(key: K, value: DeviceFrameConfig[K]) =>
    onChange({ ...settings, [key]: value });

  const deviceKind: "standard" | "large" | "custom" =
    typeof settings.device === "string" ? settings.device : "custom";
  const custom: DeviceSpec = resolveDevice(settings.device);

  const setDeviceKind = (kind: "standard" | "large" | "custom") => {
    if (kind === "custom") {
      // Seed the custom fields from whatever is currently resolved.
      set("device", { width: custom.width, height: custom.height, bezel: custom.bezel, radius: custom.radius });
    } else {
      set("device", kind);
    }
  };

  const setCustom = (patch: Partial<DeviceSpec>) =>
    set("device", { width: custom.width, height: custom.height, bezel: custom.bezel, radius: custom.radius, ...patch });

  const configText = serializeConfig(settings);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(configText);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (rare on localhost) — fall back to a download.
      download();
    }
  };

  const download = () => {
    const blob = new Blob([configText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "device-frame.config.ts";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.cfgPanel} role="dialog" aria-label="Device frame settings">
      <div className={styles.cfgHeader}>
        <span className={styles.cfgTitle}>Device frame</span>
        <button type="button" className={styles.cfgClose} onClick={() => setOpen(false)} aria-label="Close settings">
          ✕
        </button>
      </div>

      <div className={styles.cfgBody}>
        {/* ── Device & canvas ── */}
        <div className={styles.cfgGroup}>Device &amp; canvas</div>

        <Row label="Size">
          <div className={styles.cfgSegmented}>
            {(["standard", "large", "custom"] as const).map((k) => (
              <button
                key={k}
                type="button"
                className={deviceKind === k ? styles.cfgSegActive : styles.cfgSeg}
                onClick={() => setDeviceKind(k)}
              >
                {k === "standard" ? "Standard" : k === "large" ? "Large" : "Custom"}
              </button>
            ))}
          </div>
        </Row>

        {deviceKind === "custom" && (
          <>
            <Row label="Width × Height">
              <div className={styles.cfgPair}>
                <NumberInput value={custom.width} onChange={(n) => setCustom({ width: n })} />
                <span className={styles.cfgTimes}>×</span>
                <NumberInput value={custom.height} onChange={(n) => setCustom({ height: n })} />
              </div>
            </Row>
            <Row label="Bezel · Radius">
              <div className={styles.cfgPair}>
                <NumberInput value={custom.bezel} onChange={(n) => setCustom({ bezel: n })} />
                <NumberInput value={custom.radius} onChange={(n) => setCustom({ radius: n })} />
              </div>
            </Row>
          </>
        )}

        <Toggle label="Frame (shell, corners, shadow)" checked={settings.frame} onChange={(v) => set("frame", v)} />

        <Row label="Canvas color">
          <ColorInput value={settings.backdrop} onChange={(v) => set("backdrop", v)} />
        </Row>
        <Row label="Frame color">
          <ColorInput value={settings.frameColor} onChange={(v) => set("frameColor", v)} />
        </Row>

        {/* ── Chrome ── */}
        <div className={styles.cfgGroup}>Simulated chrome</div>
        <Toggle label="Status bar" checked={settings.statusBar} onChange={(v) => set("statusBar", v)} />
        <Toggle label="Dynamic Island (notch)" checked={settings.dynamicIsland} onChange={(v) => set("dynamicIsland", v)} />
        <Toggle label="Safari bar" checked={settings.browserChrome} onChange={(v) => set("browserChrome", v)} />
        <Row label="URL domain">
          <TextInput value={settings.urlBarDomain} onChange={(v) => set("urlBarDomain", v)} />
        </Row>

        {/* ── Presenter tools ── */}
        <div className={styles.cfgGroup}>Presenter tools</div>
        <Toggle label="QR code" checked={settings.qrCode} onChange={(v) => set("qrCode", v)} />
        <Toggle label="Pages drawer" checked={settings.pageNav} onChange={(v) => set("pageNav", v)} />
        <Toggle label="Simulate touch" checked={settings.simulateTouch} onChange={(v) => set("simulateTouch", v)} />
        <Row label="Desktop breakpoint">
          <NumberInput value={settings.desktopBreakpoint} onChange={(n) => set("desktopBreakpoint", n)} />
        </Row>
        <p className={styles.cfgNote}>Pages are edited in the config file; your list is preserved on save.</p>
      </div>

      <div className={styles.cfgActions}>
        <button type="button" className={styles.cfgPrimary} onClick={copy}>
          {copied ? "Copied ✓" : "Copy config"}
        </button>
        <button type="button" className={styles.cfgSecondary} onClick={download}>
          Download
        </button>
        <button type="button" className={styles.cfgSecondary} onClick={() => onChange(seed)}>
          Reset to file
        </button>
      </div>
      <p className={styles.cfgHint}>Paste over device-frame/device-frame.config.ts and commit.</p>
    </div>
  );
}

/* ---------- small control primitives (local to the panel) ---------- */

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.cfgRow}>
      <span className={styles.cfgLabel}>{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className={styles.cfgRow}>
      <span className={styles.cfgLabel}>{label}</span>
      <input type="checkbox" className={styles.cfgCheck} checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function TextInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input type="text" className={styles.cfgText} value={value} onChange={(e) => onChange(e.target.value)} />;
}

function NumberInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <input
      type="number"
      className={styles.cfgNumber}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(e.target.valueAsNumber || 0)}
    />
  );
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <span className={styles.cfgColor}>
      <input type="color" value={toHex(value)} onChange={(e) => onChange(e.target.value)} aria-label="color" />
      <input type="text" className={styles.cfgText} value={value} onChange={(e) => onChange(e.target.value)} />
    </span>
  );
}

/** <input type="color"> needs a #rrggbb value; pass other formats through best-effort. */
function toHex(value: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";
}
