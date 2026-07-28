#!/usr/bin/env bash
# Builds every concept into dist/ as one self-contained static site behind the hub
# page, ready to zip and hand over. Edit the build_concept lines as concepts appear.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST="$ROOT/dist"

echo "→ Cleaning $DIST"
rm -rf "$DIST"
mkdir -p "$DIST"

build_concept() {
  local name="$1"
  local subpath="$2"
  local dir="$ROOT/$name"

  echo "→ Building $name at base path $subpath"
  cd "$dir"
  npm install
  NEXT_PUBLIC_BASE_PATH="$subpath" npm run build
  mkdir -p "$DIST$subpath"
  cp -R out/. "$DIST$subpath/"
  cd "$ROOT"
}

# One line per concept: path-in-repo, then the sub-path it lives under in the build.
# setup-skill: replace with the project's real phase/concept folders.
build_concept "{{PHASE_1_FOLDER}}/{{CONCEPT_FOLDER}}" "/{{CONCEPT_SUBPATH}}"

echo "→ Copying hub page"
BUILD_TIMESTAMP="$(date '+%b %-d, %Y at %-I:%M %p %Z')"
sed "s|{{BUILD_TIMESTAMP}}|$BUILD_TIMESTAMP|g" "$ROOT/hub/index.html" > "$DIST/index.html"

echo "→ Copying handover guide + launchers"
cp "$ROOT/hub/HANDOVER.md"       "$DIST/HANDOVER.md"
cp "$ROOT/hub/start-mac.command" "$DIST/start-mac.command"
cp "$ROOT/hub/start-windows.bat" "$DIST/start-windows.bat"
chmod +x "$DIST/start-mac.command"

echo "✓ Done. Output in $DIST"
