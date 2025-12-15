"""Definitions of interventions applied to the aging network."""

from dataclasses import dataclass
from typing import Callable, Dict

import numpy as np

from .config import InterventionConfig, SimulationConfig, SystemConfig
from .model import StepAdjustment


@dataclass
class InterventionContext:
    """Mutable context to track one-off events (e.g., organ replacement)."""

    organ_done: bool = False


InterventionFn = Callable[
    [float, SystemConfig, SimulationConfig, InterventionConfig, InterventionContext],
    StepAdjustment,
]


def apply_none(
    age: float,
    system: SystemConfig,
    sim: SimulationConfig,
    cfg: InterventionConfig,
    context: InterventionContext,
) -> StepAdjustment:
    """Baseline: no changes."""
    return StepAdjustment()


def apply_exercise(
    age: float,
    system: SystemConfig,
    sim: SimulationConfig,
    cfg: InterventionConfig,
    context: InterventionContext,
) -> StepAdjustment:
    """Exercise boosts recovery and lowers damage accrual once active."""
    if age < cfg.exercise_start_age:
        return StepAdjustment()
    return StepAdjustment(
        recovery_scale=1.0 + cfg.exercise_recovery_gain,
        alpha_damage_scale=1.0 - cfg.exercise_damage_reduction,
    )


def apply_drug(
    age: float,
    system: SystemConfig,
    sim: SimulationConfig,
    cfg: InterventionConfig,
    context: InterventionContext,
) -> StepAdjustment:
    """Drug reduces shock probability and magnitude after onset."""
    if age < cfg.drug_start_age:
        return StepAdjustment()
    return StepAdjustment(
        shock_prob=system.shock_prob_base * cfg.drug_shock_factor,
        shock_mean=system.shock_mean_base * cfg.drug_shock_factor,
    )


def apply_parabiosis(
    age: float,
    system: SystemConfig,
    sim: SimulationConfig,
    cfg: InterventionConfig,
    context: InterventionContext,
) -> StepAdjustment:
    """Parabiosis modulates recovery, decay, and damage channels for a window."""
    if age < cfg.parabiosis_start_age:
        return StepAdjustment()

    years_on_para = age - cfg.parabiosis_start_age
    if years_on_para > cfg.parabiosis_duration:
        return StepAdjustment()

    strength = float(np.exp(-cfg.parabiosis_strength_k * years_on_para))
    return StepAdjustment(
        recovery_scale=1.0 + cfg.parabiosis_recovery_gain * strength,
        decay_scale=1.0 - cfg.parabiosis_decay_reduction * strength,
        alpha_damage_scale=1.0 - cfg.parabiosis_alpha_reduction * strength,
        shock_damage_scale=1.0 - cfg.parabiosis_shock_damage_reduction * strength,
    )


def apply_organ_replacement(
    scenario: str,
    age: float,
    system: SystemConfig,
    sim: SimulationConfig,
    cfg: InterventionConfig,
    context: InterventionContext,
) -> StepAdjustment:
    """Reset selected organs' states at replacement age."""
    if context.organ_done or age < cfg.organ_replacement_age:
        return StepAdjustment()

    nodes = cfg.organ_scenarios[scenario]
    return StepAdjustment(
        replace_nodes=nodes,
        replacement_X=cfg.organ_replacement_X,
        replacement_D=cfg.organ_replacement_D,
    )


def make_organ_handler(scenario: str) -> InterventionFn:
    """Create a handler for a given organ replacement scenario."""

    def handler(
        age: float,
        system: SystemConfig,
        sim: SimulationConfig,
        cfg: InterventionConfig,
        context: InterventionContext,
    ) -> StepAdjustment:
        return apply_organ_replacement(scenario, age, system, sim, cfg, context)

    return handler


INTERVENTIONS: Dict[str, InterventionFn] = {
    "none": apply_none,
    "exercise": apply_exercise,
    "drug": apply_drug,
    "organ1": make_organ_handler("organ1"),
    "organ2": make_organ_handler("organ2"),
    "organ3": make_organ_handler("organ3"),
    "parabiosis": apply_parabiosis,
}
