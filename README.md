# Systemic Damage Accumulation Model

A minimal dynamical systems model illustrating why reactive interventions fail in non-stationary biological systems — and how systemic strategies can change long-term outcomes.

The model represents aging as coupled subsystems (cardio, musculoskeletal, neuro) with:
- fast functional health states (X)
- slow, accumulating structural damage (D)
- stochastic shocks
- feedback between damage and recovery capacity

While developed in the context of aging, the abstraction is intentionally general and applies to any biological system where targets drift over time (e.g. tumour evolution vs immune targeting).

## What the model captures
- Coupled subsystems with asymmetric failure propagation
- Separation between fast functional variables and slow structural damage
- Stochastic shocks and recovery limits
- Explicit intervention hooks with different mechanistic levers:
  - exercise-like resilience
  - drug-like rate modulation
  - replacement / rejuvenation events
  - parabiosis-like systemic effects

The model is fast, interpretable, and designed for experimentation.

## Live demo
👉 Interactive frontend (Vercel):  
[<your-vercel-link>](https://systemic-rejuvenation.vercel.app/)

The demo allows you to:
- run single trajectories
- compare interventions
- visualize regime shifts and collapse dynamics

## Model overview
A concise LaTeX presentation of the equations and assumptions is available here:

📄 [systemic_rejuvenation.pdf](https://github.com/smartinelle/systemic_rejuvenation/blob/main/systemic_rejuvenation.pdf)

This includes:
- state variables
- update equations
- coupling structure
- intervention mappings

## Repository layout
- `src/aging_network/`
  - `config.py` – parameter definitions
  - `model.py` – core dynamical equations
  - `interventions.py` – intervention definitions
  - `simulation.py` – single and Monte Carlo runs
  - `plotting.py` – reusable visualizations
- `web/` – Next.js interactive frontend (Pyodide)
  - runs the model client-side via a bundle synced from `src/aging_network/`
- `examples/run_demo.py` – CLI demo
- `notebooks/`
  - `01_exploration.ipynb` – sanity checks
  - `02_main_results.ipynb` – main figures
- `model.ipynb` – original monolithic prototype (reference)

## Quickstart
```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .
python examples/run_demo.py --runs 80 --output figs
```

## Run the web app (Pyodide frontend)
```bash
cd web
npm install          # first time
npm run dev          # auto-syncs Python bundle from ../src
# open http://localhost:3000
```

## Notes & extensions
- An experimental branch explores calibration and ML-based parameter inference. This is intentionally kept separate from the core model.
