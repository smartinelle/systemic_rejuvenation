"""CLI demo for the aging network model."""

import argparse
from pathlib import Path
from typing import Optional

import matplotlib.pyplot as plt

try:
    from aging_network import (
        DEFAULT_SCENARIOS,
        default_simulation_config,
        plot_healthspan_vs_lifespan,
        plot_mean_X_D_over_time,
        run_many,
        run_sim,
    )
except ModuleNotFoundError:
    # Allow running the script without installing the package (dev mode).
    import sys

    repo_root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(repo_root / "src"))
    from aging_network import (
        DEFAULT_SCENARIOS,
        default_simulation_config,
        plot_healthspan_vs_lifespan,
        plot_mean_X_D_over_time,
        run_many,
        run_sim,
    )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run demo simulations for the aging network model.")
    parser.add_argument(
        "--runs",
        type=int,
        default=80,
        help="Number of Monte Carlo runs per intervention for the scatter plot.",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Optional directory to save figures; if omitted, figures are shown only.",
    )
    parser.add_argument(
        "--scenarios",
        nargs="*",
        default=["none", "exercise", "drug", "organ3", "parabiosis"],
        help="Intervention scenarios to simulate.",
    )
    parser.add_argument(
        "--no-show",
        action="store_true",
        help="Skip displaying figures (useful for headless runs when saving to disk).",
    )
    return parser.parse_args()


def maybe_save(fig: plt.Figure, output_dir: Optional[Path], name: str) -> None:
    if output_dir is None:
        return
    output_dir.mkdir(parents=True, exist_ok=True)
    fig.savefig(output_dir / f"{name}.png", dpi=150, bbox_inches="tight")


def main() -> None:
    args = parse_args()
    sim_cfg = default_simulation_config()

    print("Running single trajectories...")
    single_results = {mode: run_sim(mode, sim_config=sim_cfg) for mode in args.scenarios}

    for mode, result in single_results.items():
        fig, ax = plt.subplots(figsize=(10, 5))
        plot_mean_X_D_over_time(
            result,
            func_threshold=sim_cfg.func_threshold,
            death_threshold=sim_cfg.death_threshold,
            ax=ax,
            title=f"Structural damage vs functional health: {mode}",
        )
        maybe_save(fig, args.output, f"time_series_{mode}")

    print("Running Monte Carlo ensemble...")
    mc_results = {
        mode: run_many(mode, n_runs=args.runs, sim_config=sim_cfg)
        for mode in args.scenarios
        if mode in DEFAULT_SCENARIOS
    }
    fig, ax = plt.subplots(figsize=(8, 7))
    plot_healthspan_vs_lifespan(mc_results, config=sim_cfg, ax=ax)
    maybe_save(fig, args.output, "healthspan_vs_lifespan")

    if not args.no_show:
        plt.show()
    else:
        print(f"Figures saved to {args.output.resolve()}")


if __name__ == "__main__":
    main()
