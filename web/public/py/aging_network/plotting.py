"""Reusable plotting utilities for the aging network model."""

from typing import Dict, Optional, Tuple

import matplotlib.pyplot as plt
import numpy as np

from .config import SimulationConfig
from .simulation import SimulationResult


def plot_mean_X_D_over_time(
    result: SimulationResult,
    func_threshold: float,
    death_threshold: float,
    ax: Optional[plt.Axes] = None,
    title: Optional[str] = None,
) -> plt.Axes:
    """
    Plot mean functional health vs structural damage over age for one run.

    Parameters
    ----------
    result:
        SimulationResult containing trajectories.
    func_threshold, death_threshold:
        Thresholds for healthspan and death detection.
    ax:
        Matplotlib axis to draw on; if None, a new figure/axis is created.
    title:
        Optional plot title.
    """
    if ax is None:
        _, ax = plt.subplots(figsize=(10, 5))

    mean_X = result.X_hist.mean(axis=1)
    mean_D = result.D_hist.mean(axis=1)

    ax.plot(result.age, mean_X, label="Mean functional health (X)", linewidth=2)
    ax.plot(result.age, mean_D, label="Mean structural damage (D)", linewidth=2)
    ax.axhline(func_threshold, color="green", linestyle="--", alpha=0.5, label="functional threshold")
    ax.axhline(death_threshold, color="red", linestyle="--", alpha=0.5, label="death threshold")

    if result.lifespan is not None:
        ax.axvline(result.lifespan, color="gray", linestyle="--", alpha=0.7, label="death")
    if result.healthspan is not None:
        ax.axvline(result.healthspan, color="gray", linestyle=":", alpha=0.6, label="healthspan end")

    ax.set_xlabel("Age (years)")
    ax.set_ylabel("Value")
    if title:
        ax.set_title(title)
    ax.legend()
    ax.grid(True, alpha=0.3)

    xmax = result.lifespan + 1.0 if result.lifespan is not None else result.age[-1] + 1.0
    ax.set_xlim(result.age[0], xmax)
    return ax


def plot_healthspan_vs_lifespan(
    mc_results: Dict[str, Tuple[np.ndarray, np.ndarray]],
    config: SimulationConfig,
    ax: Optional[plt.Axes] = None,
    color_map: Optional[Dict[str, str]] = None,
) -> plt.Axes:
    """
    Scatter plot of healthspan vs lifespan for multiple interventions.

    Parameters
    ----------
    mc_results:
        Mapping intervention -> (healthspan array, lifespan array).
    config:
        Simulation configuration (used for identity line).
    ax:
        Optional Matplotlib axis to draw on.
    color_map:
        Optional mapping intervention -> color string.
    """
    if ax is None:
        _, ax = plt.subplots(figsize=(8, 7))
    if color_map is None:
        color_map = {
            "none": "black",
            "exercise": "green",
            "drug": "blue",
            "organ1": "orange",
            "organ2": "darkorange",
            "organ3": "gold",
            "parabiosis": "purple",
        }

    for mode, (hs, ls) in mc_results.items():
        hs_clean = np.array(hs, dtype=float)
        ls_clean = np.array(ls, dtype=float)
        mask = ~np.isnan(hs_clean) & ~np.isnan(ls_clean)
        if not mask.any():
            continue
        ax.scatter(hs_clean[mask], ls_clean[mask], alpha=0.5, s=15, color=color_map.get(mode, None), label=mode)

    start = config.start_age
    ax.plot(
        [start, start + config.years],
        [start, start + config.years],
        linestyle="--",
        color="gray",
        alpha=0.5,
    )

    ax.set_xlabel("Healthspan (age when mean X < threshold)")
    ax.set_ylabel("Lifespan (death age)")
    ax.set_title("Healthspan vs Lifespan across stochastic runs")
    ax.legend()
    ax.grid(True, alpha=0.3)
    return ax
