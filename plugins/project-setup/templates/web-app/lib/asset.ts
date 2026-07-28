const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Next.js does not rewrite raw <img src>, <video src>, or CSS url() strings when
// basePath is set — every /-prefixed public asset path must go through here or it
// 404s in the stitched build.
export function asset(path: string): string {
  if (!path || !path.startsWith("/")) return path;
  return `${base}${path}`;
}
