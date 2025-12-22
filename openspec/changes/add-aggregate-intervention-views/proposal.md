# Change: Add Aggregate Intervention Views and Cached Runs in Web UI

## Why
Users want to compare interventions side-by-side (overlayed trajectories like the notebook plots) without manually switching tabs. Today, the UI reruns a single intervention on every click and lacks an aggregate view. We need to run all scenarios once, cache results, and render combined views similar to the notebook figures.

## What Changes
- Add an aggregate comparison view that overlays mean functional health (mean X) for all interventions, with healthspan/lifespan markers and thresholds.
- Introduce caching of one simulation per intervention (per config) so switching tabs doesn’t rerun the same scenario unless inputs change.
- Add a lightweight aggregate “summary” panel that pulls from cached results instead of re-simulating.
- Improve performance/UI structure to avoid redundant Pyodide calls.

## Impact
- Affected specs: `web-interface` (new aggregate comparison + caching behavior)
- Affected code: `web/app/page.tsx`, components for charts and intervention controls, Pyodide loader usage/caching layer.
- No changes to `src/aging_network` behavior.
