# Implementation Tasks

## 1. Caching & Orchestration
- [ ] 1.1 Add a client-side cache keyed by intervention + current config hash (e.g., JSON string) to avoid reruns when switching tabs
- [ ] 1.2 Add a “run all interventions” helper that fires once per config change and populates the cache
- [ ] 1.3 Ensure baseline (“none”) is always present and reused across views

## 2. Aggregate Views
- [ ] 2.1 Create an overlay chart component that plots mean_X vs age for all interventions (similar to notebook figs), including threshold lines and per-intervention death markers
- [ ] 2.2 Add healthspan/lifespan marker lines per intervention on the overlay chart (dashed, color-coded)
- [ ] 2.3 Add a compact summary panel pulling from cached results (no re-sim) showing key metrics per intervention

## 3. UI Flow
- [ ] 3.1 Load/calc all interventions once after Pyodide init or when config changes; show progress state
- [ ] 3.2 Allow switching interventions without rerun if cached; rerun only on config change
- [ ] 3.3 Keep existing single-intervention view (TrajectoryChart, Metrics) but source data from cache

## 4. Performance & UX
- [ ] 4.1 Debounce “run all” after config changes; cancel stale runs if config changes mid-flight
- [ ] 4.2 Ensure UI stays responsive (no blocking) while batch runs happen; show progress/step label
- [ ] 4.3 Log/emit cache status for debugging

## 5. Documentation
- [ ] 5.1 Update `web/README.md` to describe aggregate comparison and caching behavior
- [ ] 5.2 Note how to trigger full rerun (e.g., changing any slider)
