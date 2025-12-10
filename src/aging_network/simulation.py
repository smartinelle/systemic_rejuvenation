"""Simulation orchestration for the aging network model."""

from dataclasses import dataclass
from typing import Dict, Optional, Tuple

import numpy as np
from numpy.typing import NDArray

from .config import (
    DEFAULT_SCENARIOS,
    InterventionConfig,
    SimulationConfig,
    SystemConfig,
    default_intervention_config,
    default_simulation_config,
    default_system_config,
)
from .interventions import INTERVENTIONS, InterventionContext, InterventionFn
from .model import StepResult, step_state

Array = NDArray[np.float64]


@dataclass
class SimulationResult:
    """Outputs from a single stochastic run."""

    age: Array
    X_hist: Array
    D_hist: Array
    healthspan: Optional[float]
    lifespan: Optional[float]
    cause_of_death: Optional[int]


def _select_intervention(name: str) -> InterventionFn:
    if name not in INTERVENTIONS:
        valid = ", ".join(INTERVENTIONS.keys())
        raise ValueError(f"Unknown intervention '{name}'. Valid options: {valid}")
    return INTERVENTIONS[name]


def run_sim(
    intervention: str = "none",
    sim_config: Optional[SimulationConfig] = None,
    system_config: Optional[SystemConfig] = None,
    intervention_config: Optional[InterventionConfig] = None,
    rng_seed: Optional[int] = None,
) -> SimulationResult:
    """
    Run one simulation for a chosen intervention.

    Parameters
    ----------
    intervention:
        Key selecting the intervention strategy.
    sim_config, system_config:
        Optional overrides; defaults mirror the notebook.
    rng_seed:
        Seed for reproducibility; if None, uses NumPy's default.
    """
    sim = sim_config or default_simulation_config()
    system = system_config or default_system_config()
    inter_cfg = intervention_config or default_intervention_config()

    handler = _select_intervention(intervention)
    rng = np.random.default_rng(rng_seed)

    X = system.X0.copy()
    D = system.D0.copy()
    context = InterventionContext()

    history_X = []
    history_D = []
    history_age = []

    healthspan_age: Optional[float] = None
    death_age: Optional[float] = None
    cause_of_death: Optional[int] = None

    for t in range(sim.timesteps):
        age = sim.start_age + t * sim.dt

        history_age.append(age)
        history_X.append(X.copy())
        history_D.append(D.copy())

        adjustment = handler(age, system, sim, inter_cfg, context)
        step: StepResult = step_state(X, D, age, sim, system, adjustment, rng)

        if step.replacement_applied:
            context.organ_done = True

        mean_X = step.X_new.mean()
        if healthspan_age is None and mean_X < sim.func_threshold:
            healthspan_age = age

        if np.any(step.X_new < sim.death_threshold):
            death_age = age
            deficits = np.maximum(sim.death_threshold - step.X_new, 0.0)
            if deficits.sum() > 0:
                probs = deficits / deficits.sum()
                cause_idx = int(rng.choice(np.arange(system.n_nodes), p=probs))
            else:
                cause_idx = int(np.argmin(step.X_new))
            cause_of_death = cause_idx

            history_X[-1] = step.X_new.copy()
            history_D[-1] = step.D_new.copy()
            break

        X, D = step.X_new, step.D_new

    return SimulationResult(
        age=np.array(history_age),
        X_hist=np.array(history_X),
        D_hist=np.array(history_D),
        healthspan=healthspan_age,
        lifespan=death_age,
        cause_of_death=cause_of_death,
    )


def run_many(
    intervention: str,
    n_runs: int = 100,
    sim_config: Optional[SimulationConfig] = None,
    system_config: Optional[SystemConfig] = None,
    intervention_config: Optional[InterventionConfig] = None,
    rng_seed: Optional[int] = None,
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Run multiple stochastic simulations and collect healthspan/lifespan.

    Parameters
    ----------
    intervention:
        Intervention key to simulate.
    n_runs:
        Number of Monte Carlo trajectories.
    sim_config, system_config, intervention_config:
        Optional parameter overrides.
    rng_seed:
        Seed for reproducibility across the ensemble.
    """
    hs = []
    ls = []
    base_rng = np.random.default_rng(rng_seed)
    for _ in range(n_runs):
        seed = int(base_rng.integers(0, 2**32 - 1))
        result = run_sim(
            intervention,
            sim_config=sim_config,
            system_config=system_config,
            intervention_config=intervention_config,
            rng_seed=seed,
        )
        hs.append(result.healthspan if result.healthspan is not None else np.nan)
        ls.append(result.lifespan if result.lifespan is not None else np.nan)
    return np.array(hs), np.array(ls)


def run_all_scenarios(
    scenarios=DEFAULT_SCENARIOS,
    sim_config: Optional[SimulationConfig] = None,
    system_config: Optional[SystemConfig] = None,
    intervention_config: Optional[InterventionConfig] = None,
    rng_seed: Optional[int] = None,
) -> Dict[str, SimulationResult]:
    """Convenience helper to simulate a set of interventions."""
    results: Dict[str, SimulationResult] = {}
    base_rng = np.random.default_rng(rng_seed)
    for scenario in scenarios:
        seed = int(base_rng.integers(0, 2**32 - 1))
        results[scenario] = run_sim(
            scenario,
            sim_config=sim_config,
            system_config=system_config,
            intervention_config=intervention_config,
            rng_seed=seed,
        )
    return results
