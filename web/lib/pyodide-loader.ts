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

      // Load our Python package
      onProgress?.({ stage: 'package', progress: 0.75 });
      await pyodide.runPythonAsync(`
        import sys
        sys.path.append('/py')
      `);

      // Import the aging_network module
      await pyodide.runPythonAsync(`
        from aging_network import run_sim, default_simulation_config, SimulationConfig
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
from aging_network import run_sim, SimulationConfig

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
