# Design: Web ↔ Model Single Source of Truth

## Context
The Next.js app in `web/` runs simulations client-side via Pyodide (`web/app/layout.tsx:34`). The repository also contains a canonical Python package in `src/aging_network/`.

Currently, the web runtime does **not** import the Python package from `web/public/py/aging_network/`; instead it executes a separate, inlined Python implementation embedded in `web/lib/pyodide-loader.ts:46`. This breaks the “single model” expectation and makes it easy for web and `src` behavior to diverge.

## Goals / Non-Goals

### Goals
- Make `src/aging_network/` the ground truth for model behavior.
- Ensure the web app executes a bundle derived from `src`, not a separately maintained implementation.
- Provide verifiable provenance (what commit/files the browser is running).
- Keep the app deployable as a static site (no backend).
- Avoid loading heavyweight Python deps in the browser when they are not needed for simulation.

### Non-Goals
- Changing model behavior or refactoring `src/aging_network/` in this change.
- Replacing Pyodide with a server-side API.
- Adding new UI features (parameter controls, new plots, etc.).

## Decisions

### Decision: Generate a browser-consumable “model bundle” from `src`
**Decision**: Introduce a deterministic sync step that packages the model sources from `src/aging_network/` into `web/public/py/` as a generated artifact + manifest.

**Rationale**:
- Keeps `src` as the canonical source while enabling client-side execution.
- Removes the need to maintain duplicated/inlined Python logic.
- Allows simple provenance reporting (manifest).

**Alternatives considered**:
1) **Keep inlining but auto-generate** `web/lib/pyodide-loader.ts` from `src`  
   - Pros: single HTTP fetch, simplest runtime.  
   - Cons: bundling Python into TS remains awkward; harder to audit; encourages “just tweak it here” edits.
2) **Build a wheel from the repo and install via `micropip`** in Pyodide  
   - Pros: standard packaging, single file artifact.  
   - Cons: the package currently pulls in plotting exports via `aging_network/__init__.py` which may drag `matplotlib` into browser load; may require a follow-up to make plotting optional.
3) **Copy sources into `web/public/py/aging_network/`** and fetch/write each `.py` into Pyodide FS  
   - Pros: minimal tooling.  
   - Cons: multiple fetches; still needs a provenance mechanism; still needs a strategy for optional plotting deps.

**Chosen approach**:
- Start with option (3) as the simplest implementation (few files, minimal tooling) but make it **generated + verified**, not manually edited.
- Keep option (2) as a follow-up improvement once plotting imports are made optional in `src` (separate change).

### Decision: Treat plotting as non-web (for now)
**Decision**: The web runtime MUST be able to import and run the simulation without requiring `matplotlib`.

**Rationale**:
- The web UI uses Plotly/JS for visualization.
- Loading `matplotlib` in Pyodide increases bundle size and startup latency.

**Implementation strategy (Phase 1)**:
- During bundling, generate a small web-specific `aging_network/__init__.py` that re-exports simulation symbols but does not import `aging_network.plotting`.
  - Core modules (`config.py`, `model.py`, `interventions.py`, `simulation.py`) are copied verbatim from `src`.
  - The “shim” file is the only intentional divergence and is generated (not hand-edited).

**Follow-up (Phase 2, separate change)**:
- Make plotting imports optional in `src/aging_network/__init__.py` and move `matplotlib` behind an optional extra. Then the web can install the same wheel without shims.

## Risks / Trade-offs
- **Risk**: A shim `__init__.py` means the browser package is not byte-for-byte identical to `src`.  
  **Mitigation**: Keep the shim minimal, generated, and record provenance (manifest) with file hashes for the copied core modules.
- **Risk**: Two-step process (sync + runtime load) can fail if not automated.  
  **Mitigation**: Add `predev`/`prebuild` hooks and a check script that fails CI/build when out of sync.

## Migration Plan
1) Add a sync script that copies core Python modules from `src/aging_network/` to `web/public/py/aging_network/` and writes a `model-manifest.json`.
2) Update the Pyodide loader to load these files into the Pyodide FS and import `aging_network.simulation.run_sim` from that source (remove inlined model code).
3) Add a verification step (local command + CI hook) to ensure the web bundle matches `src`.
4) Document the workflow for updating the model and verifying the web bundle.

## Open Questions
- Do we want the manifest to record a git SHA, file hashes, or both?
- Should the web UI display the model version/commit in the header for transparency?
- Do we want to support a “dev mode” that loads directly from `src` on localhost (no copied files), or always go through the generated bundle?

