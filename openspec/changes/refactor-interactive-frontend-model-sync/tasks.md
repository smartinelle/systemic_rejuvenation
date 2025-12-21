# Implementation Tasks

## 1. Bundle + Provenance
- [x] 1.1 Define the “core” model file list to ship (expected: `config.py`, `model.py`, `interventions.py`, `simulation.py`, plus a web-safe `__init__.py`)
- [x] 1.2 Add `web/scripts/sync-aging-network-model` to generate `web/public/py/aging_network/` from `src/aging_network/`
- [x] 1.3 Generate `web/public/py/model-manifest.json` containing at least: git SHA (if available), file list, and file hashes
- [x] 1.4 Add `web/scripts/check-aging-network-model-sync` that fails if `web/public/py/aging_network/` differs from `src/aging_network/` (excluding the generated shim + manifest)
- [x] 1.5 Wire the sync/check into `web/package.json` (`predev`, `prebuild`, and/or `prestart`)

## 2. Pyodide Loader Refactor
- [x] 2.1 Remove the inlined Python model code block from `web/lib/pyodide-loader.ts`
- [x] 2.2 Implement runtime loading: fetch the Python files from `web/public/py/aging_network/` and write them into the Pyodide FS
- [x] 2.3 Import and execute `aging_network.simulation.run_sim` from the loaded package
- [x] 2.4 Keep output schema stable for the UI (`SimulationResult` in `web/lib/types.ts`)
- [x] 2.5 Ensure the simulation import path does not require `matplotlib` (per design decision)
- [x] 2.6 Surface the manifest version in the loader (log or exported getter) to support debugging

## 3. Regression Checks (No Model Behavior Changes Intended)
- [ ] 3.1 Add a small “sanity compare” script that runs `src` locally and compares basic output shapes against the web-loaded model (deterministic seed)
- [ ] 3.2 Manual verification: run the web app and confirm results match the Python CLI demo qualitatively for the same scenario

## 4. Documentation
- [x] 4.1 Update `README.md` with an “Architecture” note explaining: `src` is ground truth; web runs via Pyodide from a generated bundle
- [x] 4.2 Add `web/README.md` (or a short section in root README) describing the sync/check commands for contributors

## 5. Follow-up (Separate Change)
- [ ] 5.1 Make plotting exports optional in `src/aging_network/__init__.py` and move `matplotlib` behind an extra so the web can install the same wheel directly (no shims)
