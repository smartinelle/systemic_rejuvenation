# Aging Network Model

Network-based dynamical model of aging that tracks fast functional health (`X`) and slow structural damage (`D`) across coupled subsystems (cardio, musculoskeletal, neuro). It includes stochastic shocks, damage/recovery feedbacks, and intervention hooks (exercise, drug, organ replacement, parabiosis).

## Why it’s interesting
- Captures interaction between acute shocks and slow degeneration in a compact model.
- Supports explicit interventions with different mechanistic levers.
- Fast to run; easy to extend for hackathon experiments or teaching.

## Repository layout
- `src/aging_network/` – package code
  - `config.py` – dataclasses and defaults for simulation/system/intervention parameters
  - `model.py` – core dynamical equations and one-step integrator
  - `interventions.py` – intervention definitions and mapping
  - `simulation.py` – high-level run functions (`run_sim`, `run_many`, `run_all_scenarios`)
  - `plotting.py` – reusable matplotlib plots
- `web/` – Next.js interactive frontend (client-side Pyodide)
  - Runs the model in the browser via Pyodide (no backend)
  - Uses a generated model bundle under `web/public/py/aging_network/` synced from `src/aging_network/` (single source of truth)
- `examples/run_demo.py` – CLI demo: single trajectories + Monte Carlo scatter
- `notebooks/01_exploration.ipynb` – quick sanity checks
- `notebooks/02_main_results.ipynb` – reproduces key figures
- `model.ipynb` – original notebook (monolithic prototype) kept for reference

## Model presentation
A short LaTeX write-up of the model equations and assumptions lives in `systemic_rejuvenation.pdf` (repo root) if you prefer a concise, typeset overview.

## Setup
```bash
python -m venv .venv
source .venv/bin/activate
# install deps
pip install -r requirements.txt
# install the package in editable mode
pip install -e .
```

## Quickstart
Run the demo (shows figures; optionally save them):
```bash
python examples/run_demo.py --runs 80 --output figs
# omit --output to open interactive windows instead of saving
```

## Reproduce the main figures
1. Launch Jupyter: `jupyter lab` (or `jupyter notebook`).
2. Open `notebooks/02_main_results.ipynb`.
3. Run all cells. The notebook calls into `aging_network` to generate the time-series plots and the healthspan vs lifespan scatter.

## API highlights
```python
from aging_network import run_sim, run_many, default_simulation_config

cfg = default_simulation_config()
result = run_sim("exercise", sim_config=cfg)
hs, ls = run_many("parabiosis", n_runs=200, sim_config=cfg)
```

## Dependencies
- Python >= 3.9
- numpy
- matplotlib

Install via the included `pyproject.toml` with `pip install -e .`.
