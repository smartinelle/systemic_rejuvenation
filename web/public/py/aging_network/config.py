"""Configuration objects for the aging network simulation."""

from dataclasses import dataclass, field
from typing import Dict, Sequence

import numpy as np
from numpy.typing import NDArray

Array = NDArray[np.float64]


@dataclass
class SimulationConfig:
    """Time-grid and threshold settings for a simulation run."""

    start_age: float = 30.0
    years: float = 90.0  # simulate 90 years → up to age 120
    dt: float = 0.1
    func_threshold: float = 0.60
    death_threshold: float = 0.25
    noise_std: float = 0.005

    @property
    def timesteps(self) -> int:
        return int(self.years / self.dt)


@dataclass
class SystemConfig:
    """Baseline parameters for the coupled organ systems."""

    n_nodes: int
    node_names: Sequence[str]
    X0: Array
    D0: Array
    base_decay: Array
    beta_decay: Array
    base_recovery: Array
    gamma_recovery: Array
    k_ceiling: Array
    C_base: Array
    gamma_coupling: float
    shock_prob_base: Array
    shock_mean_base: Array
    shock_std_base: Array
    alpha_damage_from_low_X_base: float
    beta_damage_from_shock: float


@dataclass
class InterventionConfig:
    """Parameters controlling each intervention scenario."""

    exercise_start_age: float
    exercise_recovery_gain: float
    exercise_damage_reduction: float

    drug_start_age: float
    drug_shock_factor: float

    organ_replacement_age: float
    organ_scenarios: Dict[str, Array]
    organ_replacement_D: Array
    organ_replacement_X: Array

    parabiosis_start_age: float
    parabiosis_duration: float
    parabiosis_strength_k: float
    parabiosis_recovery_gain: float
    parabiosis_decay_reduction: float
    parabiosis_alpha_reduction: float
    parabiosis_shock_damage_reduction: float


def default_simulation_config() -> SimulationConfig:
    """Return defaults matching the original notebook."""
    return SimulationConfig()


def default_system_config() -> SystemConfig:
    """Baseline coupled-system parameters."""
    return SystemConfig(
        n_nodes=3,
        node_names=("Cardio", "Musc", "Neuro"),
        X0=np.array([0.9, 0.9, 0.9], dtype=float),
        D0=np.array([0.1, 0.1, 0.1], dtype=float),
        base_decay=np.array([0.020, 0.020, 0.020], dtype=float),
        beta_decay=np.array([1.5, 1.5, 1.5], dtype=float),
        base_recovery=np.array([0.30, 0.25, 0.20], dtype=float),
        gamma_recovery=np.array([1.0, 1.0, 1.0], dtype=float),
        k_ceiling=np.array([0.6, 0.6, 0.6], dtype=float),
        C_base=np.array(
            [
                [0.0, 0.10, 0.10],
                [0.10, 0.0, 0.10],
                [0.10, 0.10, 0.0],
            ],
            dtype=float,
        ),
        gamma_coupling=1.0,
        shock_prob_base=np.array([0.018, 0.018, 0.018], dtype=float),
        shock_mean_base=np.array([0.04, 0.04, 0.04], dtype=float),
        shock_std_base=np.array([0.015, 0.015, 0.015], dtype=float),
        alpha_damage_from_low_X_base=0.03,
        beta_damage_from_shock=0.4,
    )


def default_intervention_config() -> InterventionConfig:
    """Intervention-specific timing and strengths."""
    organ_scenarios = {
        "organ1": np.array([0], dtype=int),
        "organ2": np.array([0, 1], dtype=int),
        "organ3": np.array([0, 1, 2], dtype=int),
    }
    return InterventionConfig(
        exercise_start_age=45.0,
        exercise_recovery_gain=0.3,
        exercise_damage_reduction=0.3,
        drug_start_age=60.0,
        drug_shock_factor=0.4,
        organ_replacement_age=65.0,
        organ_scenarios=organ_scenarios,
        organ_replacement_D=np.array([0.15, 0.15, 0.25], dtype=float),
        organ_replacement_X=np.array([0.90, 0.90, 0.85], dtype=float),
        parabiosis_start_age=55.0,
        parabiosis_duration=8.0,
        parabiosis_strength_k=0.6,
        parabiosis_recovery_gain=0.40,
        parabiosis_decay_reduction=0.20,
        parabiosis_alpha_reduction=0.40,
        parabiosis_shock_damage_reduction=0.30,
    )


DEFAULT_SCENARIOS = (
    "none",
    "exercise",
    "drug",
    "organ1",
    "organ2",
    "organ3",
    "parabiosis",
)
