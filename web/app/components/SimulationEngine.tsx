import type { LoadingProgress } from '@/lib/pyodide-loader';

interface SimulationEngineProps {
  loadingProgress: LoadingProgress | null;
}

const STAGE_LABELS = {
  pyodide: 'Loading Pyodide',
  numpy: 'Loading NumPy',
  package: 'Loading aging model',
  complete: 'Ready',
};

export default function SimulationEngine({ loadingProgress }: SimulationEngineProps) {
  const stage = loadingProgress?.stage || 'pyodide';
  const progress = loadingProgress?.progress || 0;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass-panel p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-bio-cyan to-bio-violet bg-clip-text text-transparent">
          Initializing Simulation Engine
        </h2>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-bio-cyan to-bio-violet transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {/* Stage Label */}
        <p className="text-center text-gray-300">
          {STAGE_LABELS[stage]}...
        </p>

        {/* Progress Percentage */}
        <p className="text-center text-sm text-gray-500 mt-2">
          {Math.round(progress * 100)}%
        </p>
      </div>
    </div>
  );
}
