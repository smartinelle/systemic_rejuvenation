"""Core dynamical equations for the aging network model."""

from dataclasses import dataclass
from typing import Optional

import numpy as np
from numpy.typing import NDArray

from .config import SimulationConfig, SystemConfig

Array = NDArray[np.float64]


def effective_decay(D: Array, system: SystemConfig) -> Array:
    """Compute damage-dependent decay rates."""
    return system.base_decay * (1.0 + system.beta_decay * np.clip(D, 0.0, 1.0))


def effective_recovery(D: Array, system: SystemConfig) -> Array:
    """Compute recovery rates slowed by accumulated structural damage."""
    return system.base_recovery * (1.0 - system.gamma_recovery * np.clip(D, 0.0, 1.0))


def max_health(D: Array, system: SystemConfig) -> Array:
    """Damage-limited ceiling for functional health."""
    return 1.0 - system.k_ceiling * np.clip(D, 0.0, 1.0)


def coupling_matrix(D: Array, system: SystemConfig) -> Array:
    """Shock propagation matrix amplified by mean damage between subsystems."""
    D_clipped = np.clip(D, 0.0, 1.0)
    avg_damage = (D_clipped[None, :] + D_clipped[:, None]) / 2.0
    return system.C_base * (1.0 + system.gamma_coupling * avg_damage)


def update_structural_damage(
    D: Array,
    X: Array,
    total_shock_mag: Array,
    alpha_damage_from_low_X: float,
    beta_damage_from_shock: float,
    dt: float,
    shock_damage_scale: float = 1.0,
) -> Array:
    """Slow structural damage update driven by low function and shocks."""
    D_new = D.copy()
    D_new += alpha_damage_from_low_X * (1.0 - np.clip(X, 0.0, 1.0)) * dt
    D_new += beta_damage_from_shock * (total_shock_mag * shock_damage_scale) * dt
    return np.clip(D_new, 0.0, 1.5)


@dataclass
class StepAdjustment:
    """Per-step intervention modifiers."""

    decay_scale: float = 1.0
    recovery_scale: float = 1.0
    alpha_damage_scale: float = 1.0
    shock_prob: Optional[Array] = None
    shock_mean: Optional[Array] = None
    shock_damage_scale: float = 1.0
    replace_nodes: Optional[np.ndarray] = None
    replacement_X: Optional[Array] = None
    replacement_D: Optional[Array] = None


@dataclass
class StepResult:
    """State after one integration step."""

    X_new: Array
    D_new: Array
    total_shock: Array
    replacement_applied: bool


def step_state(
    X: Array,
    D: Array,
    age: float,
    sim: SimulationConfig,
    system: SystemConfig,
    adjustment: StepAdjustment,
    rng: np.random.Generator,
) -> StepResult:
    """
    Advance the system by one time step, applying intervention adjustments.

    Parameters
    ----------
    X, D:
        Current functional health and structural damage vectors.
    age:
        Current age in years.
    sim, system:
        Simulation and system configurations.
    adjustment:
        Per-step intervention modifiers.
    rng:
        Random generator for shocks and noise.
    """
    dec = effective_decay(D, system) * adjustment.decay_scale
    rec = effective_recovery(D, system) * adjustment.recovery_scale
    Xmax = max_health(D, system)
    C = coupling_matrix(D, system)

    shock_prob = adjustment.shock_prob if adjustment.shock_prob is not None else system.shock_prob_base
    shock_mean = adjustment.shock_mean if adjustment.shock_mean is not None else system.shock_mean_base
    shock_std = system.shock_std_base

    # sample local shocks
    hits = rng.random(system.n_nodes) < shock_prob
    magnitudes = rng.normal(shock_mean, shock_std)
    magnitudes = np.maximum(magnitudes, 0.0)
    local_shock = np.where(hits, magnitudes, 0.0)

    propagated_shock = C @ local_shock
    total_shock = local_shock + propagated_shock

    dX_decay = -dec * X * sim.dt
    X_after_shock = X + dX_decay - total_shock

    rec_clamped = np.clip(rec, 0.0, None)
    dX_recovery = rec_clamped * (Xmax - X_after_shock) * sim.dt
    X_new = X_after_shock + dX_recovery
    X_new += rng.normal(0.0, sim.noise_std, size=system.n_nodes)
    X_new = np.clip(X_new, 0.0, 1.0)

    alpha_damage = system.alpha_damage_from_low_X_base * adjustment.alpha_damage_scale
    D_new = update_structural_damage(
        D,
        X_new,
        total_shock,
        alpha_damage,
        system.beta_damage_from_shock,
        sim.dt,
        shock_damage_scale=adjustment.shock_damage_scale,
    )

    replacement_applied = False
    if adjustment.replace_nodes is not None:
        nodes = adjustment.replace_nodes
        if adjustment.replacement_D is not None:
            D_new[nodes] = adjustment.replacement_D[nodes]
        if adjustment.replacement_X is not None:
            X_new[nodes] = adjustment.replacement_X[nodes]
        replacement_applied = True

    return StepResult(
        X_new=X_new,
        D_new=D_new,
        total_shock=total_shock,
        replacement_applied=replacement_applied,
    )
