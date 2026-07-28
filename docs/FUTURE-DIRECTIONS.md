# Future directions (recorded, not built)

- **Figma Templates file as a component source.** The hub page template in
  `templates/common/hub/` implements a design maintained in a Figma "Templates"
  file. That file may grow into a small library of reusable template components —
  token specimens, type-style specimens, cover pages. When it does,
  `figma-library-push` should instantiate those components for its token-sheet
  frames (via component keys) instead of drawing generic swatch rows, so pushed
  libraries inherit the house style automatically.
- **Unattended sync staging.** v2: scheduled pull-only run (Figma→code) opening a
  PR when the library drifts from `tokens.lock.json` — safe because read-only on
  the Figma side. v3: unattended code→Figma via the enterprise Variables REST API
  (see SPIKE-FINDINGS.md). The lock-file three-way diff is shared logic across all
  stages; only trigger and confirmation policy change.
- **Second-operator test** before calling the plugin shareable: a colleague runs a
  full setup using only the READMEs, no verbal help.
