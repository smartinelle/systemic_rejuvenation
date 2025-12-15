import { loadPyodide, type PyodideInterface } from 'pyodide';
import type { SimulationConfig, SimulationResult, InterventionType } from './types';

let pyodideInstance: PyodideInterface | null = null;
let initPromise: Promise<PyodideInterface> | null = null;

export interface LoadingProgress {
  stage: 'pyodide' | 'numpy' | 'package' | 'complete';
  progress: number;
}

export async function initializePyodide(
  onProgress?: (progress: LoadingProgress) => void
): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // Load Pyodide
      onProgress?.({ stage: 'pyodide', progress: 0.25 });
      const pyodide = await loadPyodide({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/',
      });

      // Load NumPy
      onProgress?.({ stage: 'numpy', progress: 0.5 });
      await pyodide.loadPackage('numpy');

      // Load inlined Python simulation code
      onProgress?.({ stage: 'package', progress: 0.75 });
      await pyodide.runPythonAsync(`
import numpy as np

class SimulationConfig:
    def __init__(self, n_subsystems=3, t_max=100.0, dt=0.1,
                 func_threshold=0.3, death_threshold=0.1,
                 r=0.03, k=0.02, beta=0.5, alpha=0.05):
        self.n_subsystems = n_subsystems
        self.t_max = t_max
        self.dt = dt
        self.func_threshold = func_threshold
        self.death_threshold = death_threshold
        self.r = r
        self.k = k
        self.beta = beta
        self.alpha = alpha

class SimulationResult:
    def __init__(self, ages, X, D, healthspan, lifespan, mean_X, mean_D):
        self.ages = ages
        self.X = X
        self.D = D
        self.healthspan = healthspan
        self.lifespan = lifespan
        self.mean_X = mean_X
        self.mean_D = mean_D

def coupling_matrix(n):
    """Create default coupling matrix."""
    C = np.ones((n, n)) * 0.1
    np.fill_diagonal(C, 0.5)
    return C

def aging_dynamics(X, D, C, r, k, beta, alpha):
    """Core aging dynamics."""
    dX = -r * X - np.dot(C, D)
    dD = k * (1 - X)**2 + beta * D - alpha * X * D
    return dX, dD

def apply_intervention(intervention, X, D, age, config):
    """Apply intervention effects."""
    if intervention == "exercise" and 30 <= age <= 80:
        return X + 0.01, D - 0.005
    elif intervention == "drug" and age >= 40:
        return X, D - 0.008
    elif intervention == "parabiosis" and age >= 50:
        return X + 0.015, D - 0.01
    elif intervention.startswith("organ_") and age >= 50:
        organ_idx = {"organ_cardio": 0, "organ_musc": 1, "organ_neuro": 2}.get(intervention, 0)
        if age % 20 == 0:
            X_new = X.copy()
            X_new[organ_idx] = 0.95
            D_new = D.copy()
            D_new[organ_idx] = 0.05
            return X_new, D_new
    return X, D

def run_sim(intervention="none", sim_config=None):
    """Run aging simulation."""
    config = sim_config if sim_config is not None else SimulationConfig()

    n_steps = int(config.t_max / config.dt)
    ages = np.linspace(20, 20 + config.t_max, n_steps)

    X_hist = np.zeros((n_steps, config.n_subsystems))
    D_hist = np.zeros((n_steps, config.n_subsystems))

    # Initial conditions
    X = np.ones(config.n_subsystems) * 0.95
    D = np.ones(config.n_subsystems) * 0.05

    C = coupling_matrix(config.n_subsystems)

    healthspan_reached = False
    lifespan_reached = False
    healthspan = config.t_max
    lifespan = config.t_max

    for i in range(n_steps):
        X_hist[i] = X
        D_hist[i] = D

        # Check thresholds
        if not healthspan_reached and np.min(X) < config.func_threshold:
            healthspan = ages[i] - 20
            healthspan_reached = True

        if not lifespan_reached and np.min(X) < config.death_threshold:
            lifespan = ages[i] - 20
            lifespan_reached = True
            break

        # Apply intervention
        X, D = apply_intervention(intervention, X, D, ages[i], config)

        # Update dynamics
        dX, dD = aging_dynamics(X, D, C, config.r, config.k, config.beta, config.alpha)
        X = np.clip(X + dX * config.dt, 0, 1)
        D = np.clip(D + dD * config.dt, 0, 1)

    return SimulationResult(
        ages=ages[:i+1],
        X=X_hist[:i+1],
        D=D_hist[:i+1],
        healthspan=healthspan,
        lifespan=lifespan,
        mean_X=np.mean(X_hist[:i+1], axis=1),
        mean_D=np.mean(D_hist[:i+1], axis=1)
    )
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

# Convert result to JSON-serializable format
output = {
    "ages": result.ages.tolist(),
    "X": result.X.tolist(),
    "D": result.D.tolist(),
    "healthspan": float(result.healthspan),
    "lifespan": float(result.lifespan),
    "mean_X": result.mean_X.tolist(),
    "mean_D": result.mean_D.tolist(),
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
