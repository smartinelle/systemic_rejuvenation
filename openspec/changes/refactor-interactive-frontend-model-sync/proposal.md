# Change: Refactor Web Model Loading to Use `src` as Ground Truth

## Why
Today the repository contains **three** sources of model logic:
- The canonical Python package in `src/aging_network/`
- A copied package in `web/public/py/aging_network/`
- An additional **inlined** Python implementation embedded in `web/lib/pyodide-loader.ts:46`

Because the web app executes the inlined code, changes to `src/aging_network/` do not affect the frontend, which creates drift and confusion about which model is “real”.

## What Changes
- Define `src/aging_network/` as the single source of truth for model behavior.
- Replace the inlined Python model in `web/lib/pyodide-loader.ts` with a loader that executes a **generated bundle** produced from `src/aging_network/` (served from `web/public/py/` and loaded into Pyodide at runtime).
- Add an explicit “model provenance” manifest (e.g., git SHA + file hashes) so the UI/runtime can verify which source the browser is executing.
- Add a sync/check workflow so the web bundle cannot silently drift from `src`.

## Impact
- Affected specs: `web-interface` (MODIFIED + ADDED requirements)
- Affected code (implementation phase):
  - `web/lib/pyodide-loader.ts` (stop inlining, load bundle)
  - `web/public/py/` (generated artifact + manifest)
  - `web/package.json` (prebuild/predev sync hooks)
  - New: `web/scripts/` (sync + verification utilities)
- Non-goals (this change):
  - No backend API (Pyodide remains the execution engine)
  - No changes to the model equations/behavior in `src/aging_network/`
  - No expansion of UI controls/parameters beyond what already exists

## Notes
This is a refactor for correctness/maintainability: it makes the browser-run model traceable to `src`, eliminates accidental divergence, and restores the original intent of “one model, two frontends (CLI/notebook and web UI)”.

