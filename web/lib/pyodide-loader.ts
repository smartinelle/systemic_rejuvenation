import type { SimulationConfig, SimulationResult, InterventionType } from './types';

// Use global loadPyodide from CDN script
declare global {
  interface Window {
    loadPyodide: (config: { indexURL: string }) => Promise<any>;
  }
}

let pyodideInstance: any = null;
let initPromise: Promise<any> | null = null;

export interface LoadingProgress {
  stage: 'pyodide' | 'numpy' | 'package' | 'complete';
  progress: number;
}

export async function initializePyodide(
  onProgress?: (progress: LoadingProgress) => void
): Promise<any> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Wait for window.loadPyodide to be available from CDN script
      while (typeof window === 'undefined' || !window.loadPyodide) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Load Pyodide
      onProgress?.({ stage: 'pyodide', progress: 0.25 });
      const pyodide = await window.loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
      });

      // Load NumPy
      onProgress?.({ stage: 'numpy', progress: 0.5 });
      await pyodide.loadPackage('numpy');

      // Load inlined Python simulation code - matches backend model exactly
      onProgress?.({ stage: 'package', progress: 0.75 });
      await pyodide.runPythonAsync(`
import numpy as np

# ========== Configuration Classes ==========

class SimulationConfig:
    def __init__(self, start_age=30.0, years=90.0, dt=0.1,
                 func_threshold=0.6, death_threshold=0.25, noise_std=0.005):
        self.start_age = start_age
        self.years = years
        self.dt = dt
        self.func_threshold = func_threshold
        self.death_threshold = death_threshold
        self.noise_std = noise_std

    @property
    def timesteps(self):
        return int(self.years / self.dt)

class SystemConfig:
    def __init__(self):
        self.n_nodes = 3
        self.node_names = ["Cardio", "Musc", "Neuro"]
        self.X0 = np.array([0.9, 0.9, 0.9], dtype=float)
        self.D0 = np.array([0.1, 0.1, 0.1], dtype=float)
        self.base_decay = np.array([0.020, 0.020, 0.020], dtype=float)
        self.beta_decay = np.array([1.5, 1.5, 1.5], dtype=float)
        self.base_recovery = np.array([0.30, 0.25, 0.20], dtype=float)
        self.gamma_recovery = np.array([1.0, 1.0, 1.0], dtype=float)
        self.k_ceiling = np.array([0.6, 0.6, 0.6], dtype=float)
        self.C_base = np.array([
            [0.0, 0.10, 0.10],
            [0.10, 0.0, 0.10],
            [0.10, 0.10, 0.0]
        ], dtype=float)
        self.gamma_coupling = 1.0
        self.shock_prob_base = np.array([0.018, 0.018, 0.018], dtype=float)
        self.shock_mean_base = np.array([0.04, 0.04, 0.04], dtype=float)
        self.shock_std_base = np.array([0.015, 0.015, 0.015], dtype=float)
        self.alpha_damage_from_low_X_base = 0.03
        self.beta_damage_from_shock = 0.4

class InterventionConfig:
    def __init__(self):
        self.exercise_start_age = 40.0
        self.exercise_recovery_gain = 0.3
        self.exercise_damage_reduction = 0.3

        self.drug_start_age = 60.0
        self.drug_shock_factor = 0.4

        self.organ_replacement_age = 65.0
        self.organ_scenarios = {
            "organ1": np.array([0], dtype=int),
            "organ2": np.array([0, 1], dtype=int),
            "organ3": np.array([0, 1, 2], dtype=int)
        }
        self.organ_replacement_D = np.array([0.15, 0.15, 0.25], dtype=float)
        self.organ_replacement_X = np.array([0.90, 0.90, 0.85], dtype=float)

        self.parabiosis_start_age = 55.0
        self.parabiosis_duration = 8.0
        self.parabiosis_strength_k = 0.6
        self.parabiosis_recovery_gain = 0.40
        self.parabiosis_decay_reduction = 0.20
        self.parabiosis_alpha_reduction = 0.40
        self.parabiosis_shock_damage_reduction = 0.30

class InterventionContext:
    def __init__(self):
        self.organ_done = False

# ========== Model Functions ==========

def effective_decay(D, system):
    """Compute damage-dependent decay rates."""
    return system.base_decay * (1.0 + system.beta_decay * np.clip(D, 0.0, 1.0))

def effective_recovery(D, system):
    """Compute recovery rates slowed by accumulated structural damage."""
    return system.base_recovery * (1.0 - system.gamma_recovery * np.clip(D, 0.0, 1.0))

def max_health(D, system):
    """Damage-limited ceiling for functional health."""
    return 1.0 - system.k_ceiling * np.clip(D, 0.0, 1.0)

def coupling_matrix(D, system):
    """Shock propagation matrix amplified by mean damage between subsystems."""
    D_clipped = np.clip(D, 0.0, 1.0)
    avg_damage = (D_clipped[None, :] + D_clipped[:, None]) / 2.0
    return system.C_base * (1.0 + system.gamma_coupling * avg_damage)

def update_structural_damage(D, X, total_shock_mag, alpha_damage_from_low_X,
                             beta_damage_from_shock, dt, shock_damage_scale=1.0):
    """Slow structural damage update driven by low function and shocks."""
    D_new = D.copy()
    D_new += alpha_damage_from_low_X * (1.0 - np.clip(X, 0.0, 1.0)) * dt
    D_new += beta_damage_from_shock * (total_shock_mag * shock_damage_scale) * dt
    return np.clip(D_new, 0.0, 1.5)

class StepAdjustment:
    def __init__(self, decay_scale=1.0, recovery_scale=1.0, alpha_damage_scale=1.0,
                 shock_prob=None, shock_mean=None, shock_damage_scale=1.0,
                 replace_nodes=None, replacement_X=None, replacement_D=None):
        self.decay_scale = decay_scale
        self.recovery_scale = recovery_scale
        self.alpha_damage_scale = alpha_damage_scale
        self.shock_prob = shock_prob
        self.shock_mean = shock_mean
        self.shock_damage_scale = shock_damage_scale
        self.replace_nodes = replace_nodes
        self.replacement_X = replacement_X
        self.replacement_D = replacement_D

def step_state(X, D, age, sim, system, adjustment, rng):
    """Advance the system by one time step, applying intervention adjustments."""
    dec = effective_decay(D, system) * adjustment.decay_scale
    rec = effective_recovery(D, system) * adjustment.recovery_scale
    Xmax = max_health(D, system)
    C = coupling_matrix(D, system)

    shock_prob = adjustment.shock_prob if adjustment.shock_prob is not None else system.shock_prob_base
    shock_mean = adjustment.shock_mean if adjustment.shock_mean is not None else system.shock_mean_base
    shock_std = system.shock_std_base

    # Sample local shocks
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
        D, X_new, total_shock, alpha_damage,
        system.beta_damage_from_shock, sim.dt,
        shock_damage_scale=adjustment.shock_damage_scale
    )

    replacement_applied = False
    if adjustment.replace_nodes is not None:
        nodes = adjustment.replace_nodes
        if adjustment.replacement_D is not None:
            D_new[nodes] = adjustment.replacement_D[nodes]
        if adjustment.replacement_X is not None:
            X_new[nodes] = adjustment.replacement_X[nodes]
        replacement_applied = True

    return X_new, D_new, replacement_applied

# ========== Intervention Logic ==========

def apply_none(age, system, sim, cfg, context):
    """Baseline: no changes."""
    return StepAdjustment()

def apply_exercise(age, system, sim, cfg, context):
    """Exercise boosts recovery and lowers damage accrual once active."""
    if age < cfg.exercise_start_age:
        return StepAdjustment()
    return StepAdjustment(
        recovery_scale=1.0 + cfg.exercise_recovery_gain,
        alpha_damage_scale=1.0 - cfg.exercise_damage_reduction
    )

def apply_drug(age, system, sim, cfg, context):
    """Drug reduces shock probability and magnitude after onset."""
    if age < cfg.drug_start_age:
        return StepAdjustment()
    return StepAdjustment(
        shock_prob=system.shock_prob_base * cfg.drug_shock_factor,
        shock_mean=system.shock_mean_base * cfg.drug_shock_factor
    )

def apply_parabiosis(age, system, sim, cfg, context):
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
        shock_damage_scale=1.0 - cfg.parabiosis_shock_damage_reduction * strength
    )

def apply_organ_replacement(scenario, age, system, sim, cfg, context):
    """Reset selected organs' states at replacement age."""
    if context.organ_done or age < cfg.organ_replacement_age:
        return StepAdjustment()

    nodes = cfg.organ_scenarios[scenario]
    return StepAdjustment(
        replace_nodes=nodes,
        replacement_X=cfg.organ_replacement_X,
        replacement_D=cfg.organ_replacement_D
    )

INTERVENTIONS = {
    "none": apply_none,
    "exercise": apply_exercise,
    "drug": apply_drug,
    "organ1": lambda age, sys, sim, cfg, ctx: apply_organ_replacement("organ1", age, sys, sim, cfg, ctx),
    "organ2": lambda age, sys, sim, cfg, ctx: apply_organ_replacement("organ2", age, sys, sim, cfg, ctx),
    "organ3": lambda age, sys, sim, cfg, ctx: apply_organ_replacement("organ3", age, sys, sim, cfg, ctx),
    "parabiosis": apply_parabiosis
}

# ========== Simulation ==========

def run_sim(intervention="none", sim_config=None):
    """Run one simulation for a chosen intervention."""
    sim = sim_config if sim_config is not None else SimulationConfig()
    system = SystemConfig()
    inter_cfg = InterventionConfig()

    handler = INTERVENTIONS.get(intervention, apply_none)
    rng = np.random.default_rng()

    X = system.X0.copy()
    D = system.D0.copy()
    context = InterventionContext()

    history_X = []
    history_D = []
    history_age = []

    healthspan_age = None
    death_age = None
    cause_of_death = None

    for t in range(sim.timesteps):
        age = sim.start_age + t * sim.dt

        history_age.append(age)
        history_X.append(X.copy())
        history_D.append(D.copy())

        adjustment = handler(age, system, sim, inter_cfg, context)
        X_new, D_new, replacement_applied = step_state(X, D, age, sim, system, adjustment, rng)

        if replacement_applied:
            context.organ_done = True

        mean_X = X_new.mean()
        if healthspan_age is None and mean_X < sim.func_threshold:
            healthspan_age = age

        if np.any(X_new < sim.death_threshold):
            death_age = age
            # Determine cause of death
            deficits = np.maximum(sim.death_threshold - X_new, 0.0)
            if deficits.sum() > 0:
                probs = deficits / deficits.sum()
                cause_idx = int(rng.choice(np.arange(system.n_nodes), p=probs))
            else:
                cause_idx = int(np.argmin(X_new))
            cause_of_death = cause_idx
            history_X[-1] = X_new.copy()
            history_D[-1] = D_new.copy()
            break

        X, D = X_new, D_new

    # Calculate outputs
    ages_arr = np.array(history_age)
    X_hist = np.array(history_X)
    D_hist = np.array(history_D)

    healthspan = healthspan_age if healthspan_age is not None else ages_arr[-1]
    lifespan = death_age if death_age is not None else ages_arr[-1]

    return {
        "ages": ages_arr,
        "X": X_hist,
        "D": D_hist,
        "healthspan": healthspan,
        "lifespan": lifespan,
        "mean_X": np.mean(X_hist, axis=1),
        "mean_D": np.mean(D_hist, axis=1),
        "cause_of_death": cause_of_death
    }
      `);

      onProgress?.({ stage: 'complete', progress: 1.0 });
      pyodideInstance = pyodide;
      return pyodide;
    } catch (error) {
      initPromise = null;
      throw new Error(`Failed to initialize Pyodide: ${error}`);
    }
  })();

  return initPromise;
}

export async function runSimulation(
  intervention: InterventionType,
  config: Partial<SimulationConfig> = {}
): Promise<SimulationResult> {
  const pyodide = await initializePyodide();

  const configStr = JSON.stringify(config);

  const pythonCode = `
import json

config = json.loads('${configStr}')
sim_config = SimulationConfig(**config) if config else None

result = run_sim("${intervention}", sim_config=sim_config)

# Convert result to JSON-serializable format (already a dict now)
output = {
    "ages": result["ages"].tolist(),
    "X": result["X"].tolist(),
    "D": result["D"].tolist(),
    "healthspan": float(result["healthspan"]),
    "lifespan": float(result["lifespan"]),
    "mean_X": result["mean_X"].tolist(),
    "mean_D": result["mean_D"].tolist(),
    "cause_of_death": int(result["cause_of_death"]) if result["cause_of_death"] is not None else None,
}

json.dumps(output)
  `;

  try {
    const resultJson = await pyodide.runPythonAsync(pythonCode);
    const result: SimulationResult = JSON.parse(resultJson as string);
    return result;
  } catch (error) {
    throw new Error(`Simulation failed: ${error}`);
  }
}

export function isPyodideReady(): boolean {
  return pyodideInstance !== null;
}
