'use client';

import { useEffect, useRef, useState } from 'react';
import { initializePyodide, runSimulation, type LoadingProgress, getModelDefaults } from '@/lib/pyodide-loader';
import type { SimulationResult, InterventionType, SimulationConfig } from '@/lib/types';
import { DEFAULT_SIMULATION_CONFIG } from '@/lib/types';
import SimulationEngine from './components/SimulationEngine';
import InterventionTabs from './components/InterventionTabs';
import ParameterPanel from './components/ParameterPanel';
import TrajectoryChart from './components/TrajectoryChart';
import MetricsPanel from './components/MetricsPanel';
import Header from './components/Header';
import NetworkGraph from './components/NetworkGraph';
import MonteCarloPanel from './components/MonteCarloPanel';
import AggregateOverlay from './components/AggregateOverlay';
import InterventionSummaryTable from './components/InterventionSummaryTable';

const ALL_INTERVENTIONS: InterventionType[] = ['none', 'exercise', 'drug', 'parabiosis', 'organ1', 'organ2', 'organ3'];

type ResultsMap = Partial<Record<InterventionType, SimulationResult>>;

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [intervention, setIntervention] = useState<InterventionType>('none');
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_SIMULATION_CONFIG);
  const [results, setResults] = useState<ResultsMap>({});
  const [batchStatus, setBatchStatus] = useState<{ running: boolean; completed: number; total: number; error: string | null }>({
    running: false,
    completed: 0,
    total: ALL_INTERVENTIONS.length,
    error: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'aggregate' | 'single'>('aggregate');

  const runIdRef = useRef(0);

  // Initialize Pyodide on mount
  useEffect(() => {
    initializePyodide((progress) => {
      setLoadingProgress(progress);
    })
      .then(() => {
        const defaults = getModelDefaults();
        const simDefaults = defaults?.simulation as Partial<SimulationConfig> | undefined;
        const initialConfig = simDefaults ? { ...DEFAULT_SIMULATION_CONFIG, ...simDefaults } : DEFAULT_SIMULATION_CONFIG;
        setConfig(initialConfig);

        setIsLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  const runAllInterventions = async (cfg: SimulationConfig) => {
    if (isLoading) return;
    const runId = ++runIdRef.current;
    setBatchStatus({ running: true, completed: 0, total: ALL_INTERVENTIONS.length, error: null });
    setResults({});
    setError(null);

    try {
      for (let i = 0; i < ALL_INTERVENTIONS.length; i++) {
        const intv = ALL_INTERVENTIONS[i];
        const res = await runSimulation(intv, cfg);
        if (runId !== runIdRef.current) {
          // stale run; abort updates
          return;
        }
        setResults((prev) => ({ ...prev, [intv]: res }));
        setBatchStatus({ running: true, completed: i + 1, total: ALL_INTERVENTIONS.length, error: null });
      }
      setBatchStatus({ running: false, completed: ALL_INTERVENTIONS.length, total: ALL_INTERVENTIONS.length, error: null });
    } catch (err: any) {
      if (runId !== runIdRef.current) return;
      const message = err?.message ?? String(err);
      setBatchStatus({ running: false, completed: 0, total: ALL_INTERVENTIONS.length, error: message });
      setError(message);
    }
  };

  // Debounced rerun when config changes
  useEffect(() => {
    if (isLoading) return;
    const handle = setTimeout(() => runAllInterventions(config), 250);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config]);

  const selectedResult = results[intervention] ?? null;
  const baselineResult = results['none'] ?? null;

  if (isLoading) {
    return <SimulationEngine loadingProgress={loadingProgress} />;
  }

  if (error && Object.keys(results).length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-panel p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen">
      <Header />

      {/* Main Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="glass-panel p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-bio-cyan">View</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setViewMode('aggregate')}
                className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'aggregate' ? 'bg-bio-violet/30 border border-bio-violet' : 'glass-panel-hover'}`}
              >
                Aggregate
              </button>
              <button
                onClick={() => setViewMode('single')}
                className={`px-3 py-2 rounded-lg text-sm ${viewMode === 'single' ? 'bg-bio-violet/30 border border-bio-violet' : 'glass-panel-hover'}`}
              >
                Single
              </button>
            </div>
          </div>

          {viewMode === 'single' && (
            <>
              <InterventionTabs
                selected={intervention}
                onChange={setIntervention}
              />
              <ParameterPanel
                intervention={intervention}
                config={config}
                onChange={setConfig}
                onRunSimulation={() => runAllInterventions(config)}
                isSimulating={batchStatus.running}
              />
            </>
          )}
        </aside>

        {/* Visualization Area */}
        <div className="space-y-6">
          {viewMode === 'aggregate' && Object.keys(results).length > 0 && (
            <>
              <AggregateOverlay results={results} config={config} />
              <InterventionSummaryTable results={results} />
            </>
          )}

          {viewMode === 'single' && selectedResult && (
            <>
              <TrajectoryChart
                result={selectedResult}
                config={config}
                intervention={intervention}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetricsPanel
                  result={selectedResult}
                  baseline={baselineResult}
                  intervention={intervention}
                />
                <NetworkGraph result={selectedResult} />
              </div>
              <MonteCarloPanel
                intervention={intervention}
                config={config}
                onComplete={(results) => console.log('Monte Carlo complete:', results)}
              />
            </>
          )}
          {batchStatus.running && (
            <div className="glass-panel p-8 text-center">
              <div className="animate-pulse text-bio-cyan">
                Running all interventions... ({batchStatus.completed}/{batchStatus.total})
              </div>
            </div>
          )}
          {batchStatus.error && (
            <div className="glass-panel p-4 border-red-500/50">
              <p className="text-red-400 text-sm">{batchStatus.error}</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </main>
  );
}
