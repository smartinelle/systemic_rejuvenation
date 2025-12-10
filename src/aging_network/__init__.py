"""Aging network dynamical model with intervention hooks."""

from .config import (
    DEFAULT_SCENARIOS,
    SimulationConfig,
    SystemConfig,
    default_intervention_config,
    default_simulation_config,
    default_system_config,
)
from .simulation import SimulationResult, run_all_scenarios, run_many, run_sim
from .plotting import plot_healthspan_vs_lifespan, plot_mean_X_D_over_time

__all__ = [
    "DEFAULT_SCENARIOS",
    "SimulationConfig",
    "SystemConfig",
    "SimulationResult",
    "default_simulation_config",
    "default_system_config",
    "default_intervention_config",
    "run_sim",
    "run_many",
    "run_all_scenarios",
    "plot_mean_X_D_over_time",
    "plot_healthspan_vs_lifespan",
]
