/*
 * Pick a readable icon color (near-black or white) for a given canvas backdrop
 * so the host toggles keep adequate contrast on any background. Resolves
 * arbitrary CSS colors (hex, rgb(), named) via a 1px canvas, then compares WCAG
 * contrast against black vs white and returns whichever wins. Client-side only;
 * falls back to dark during SSR.
 */
const ICON_DARK = "#1b1b1b";
const ICON_LIGHT = "#ffffff";

export function readableIconColor(backdrop: string): string {
  if (typeof document === "undefined") return ICON_DARK;
  const rgb = resolveRgb(backdrop);
  if (!rgb) return ICON_DARK;
  const L = relativeLuminance(rgb);
  const vsBlack = (L + 0.05) / 0.05; // contrast ratio against black
  const vsWhite = 1.05 / (L + 0.05); // contrast ratio against white
  return vsBlack >= vsWhite ? ICON_DARK : ICON_LIGHT;
}

function resolveRgb(color: string): [number, number, number] | null {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.fillStyle = "#000";
  ctx.fillStyle = color; // an invalid color leaves the previous value in place
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function relativeLuminance([r, g, b]: [number, number, number]): number {
  const lin = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}
