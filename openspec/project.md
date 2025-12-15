# Project Context

## Purpose
A network-based dynamical model of aging that simulates interactions between fast functional health (X) and slow structural damage (D) across coupled subsystems (cardiovascular, musculoskeletal, neurological). The model captures acute shocks and slow degeneration with support for explicit interventions like exercise, drugs, organ replacement, and parabiosis. Designed for research, hackathon experiments, and teaching about aging dynamics.

## Tech Stack
- Python >= 3.9
- NumPy (numerical computation and dynamics)
- Matplotlib (visualization)
- Jupyter (interactive notebooks)
- setuptools (package building)

## Project Conventions

### Code Style
- Use dataclasses for configuration objects (see [config.py](src/aging_network/config.py))
- Type hints throughout (Callable, Dict, Optional, etc.)
- Docstrings for all public functions
- Snake_case for variables and functions
- CamelCase for classes
- Lowercase with underscores for module names

### Architecture Patterns
- **Configuration-driven design**: All parameters exposed via dataclasses ([config.py](src/aging_network/config.py))
- **Separation of concerns**:
  - [model.py](src/aging_network/model.py): Core dynamics and integrator
  - [interventions.py](src/aging_network/interventions.py): Intervention definitions
  - [simulation.py](src/aging_network/simulation.py): High-level simulation API
  - [plotting.py](src/aging_network/plotting.py): Visualization utilities
- **Functional core**: Pure functions for dynamics; mutable context only where necessary (InterventionContext)
- **Simple abstractions**: Prefer flat structure; no deep inheritance hierarchies
- **Intervention pattern**: Registry-based system (INTERVENTIONS dict) with factory functions for parameterized variants

### Testing Strategy
- Currently uses Jupyter notebooks for validation ([01_exploration.ipynb](notebooks/01_exploration.ipynb), [02_main_results.ipynb](notebooks/02_main_results.ipynb))
- Manual sanity checks via CLI demo ([run_demo.py](examples/run_demo.py))
- Visual inspection of time-series plots and Monte Carlo scatter results
- No formal unit test suite yet

### Git Workflow
- Main branch for stable code
- Keep original prototype notebook ([model.ipynb](model.ipynb)) for reference
- LaTeX write-up ([systemic_rejuvenation.pdf](systemic_rejuvenation.pdf)) for model documentation
- Commit plots and results to track model behavior changes

## Domain Context

### Aging Model Concepts
- **X (functional health)**: Fast-changing variable representing acute system function (0-1 scale)
- **D (structural damage)**: Slow-accumulating variable representing irreversible wear (0-1 scale)
- **Subsystems**: Three coupled nodes representing cardio, musculoskeletal, and neurological systems
- **Thresholds**:
  - `func_threshold`: Loss of healthspan (typically 0.4)
  - `death_threshold`: Loss of lifespan (typically 0.2)
- **Dynamics**: X recovers/decays; D accumulates via aging and damage mechanisms
- **Shocks**: Stochastic acute events that impact X and D
- **Interventions**: External modifications to recovery, damage, decay, or shock parameters

### Key Metrics
- **Healthspan**: Years until mean X falls below functional threshold
- **Lifespan**: Years until mean X falls below death threshold
- **Mean X/D**: Average across subsystems for trajectory visualization

### Intervention Types
- `none`: Baseline (no intervention)
- `exercise`: Boosts recovery, reduces damage accumulation
- `drug`: Reduces shock probability and magnitude
- `organ1/2/3`: One-time replacement of single/multiple subsystems
- `parabiosis`: Time-limited boost to recovery with exponential decay

## Important Constraints
- Model runs fast (suitable for Monte Carlo with 100+ runs)
- Keep code simple enough for hackathon/teaching use
- Parameters must be interpretable (biological plausibility preferred)
- Maintain reproducibility via fixed random seeds when needed
- Avoid heavy dependencies (only numpy + matplotlib core)

## External Dependencies
None. This is a self-contained simulation with no external APIs, databases, or services.
