'use client';

import { useState, useEffect } from 'react';
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

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState<LoadingProgress | null>(null);
  const [intervention, setIntervention] = useState<InterventionType>('none');
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_SIMULATION_CONFIG);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [baselineResult, setBaselineResult] = useState<SimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        // Run baseline simulation
        return runSimulation('none', initialConfig);
      })
      .then((result) => {
        setBaselineResult(result);
        setResult(result);
      })
      .catch((err) => {
        setError(err.message);
        setIsLoading(false);
      });
  }, []);

  // Run simulation when intervention or config changes
  const handleRunSimulation = async () => {
    if (isLoading) return;

    setIsSimulating(true);
    setError(null);

    try {
      const newResult = await runSimulation(intervention, config);
      setResult(newResult);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Auto-run when intervention changes
  useEffect(() => {
    if (!isLoading && !isSimulating) {
      handleRunSimulation();
    }
  }, [intervention]);

  if (isLoading) {
    return <SimulationEngine loadingProgress={loadingProgress} />;
  }

  if (error && !result) {
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
          <InterventionTabs
            selected={intervention}
            onChange={setIntervention}
          />
          <ParameterPanel
            intervention={intervention}
            config={config}
            onChange={setConfig}
            onRunSimulation={handleRunSimulation}
            isSimulating={isSimulating}
          />
        </aside>

        {/* Visualization Area */}
        <div className="space-y-6">
          {result && (
            <>
              <TrajectoryChart
                result={result}
                config={config}
                intervention={intervention}
              />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetricsPanel
                  result={result}
                  baseline={baselineResult}
                  intervention={intervention}
                />
                <NetworkGraph result={result} />
              </div>
              <MonteCarloPanel
                intervention={intervention}
                config={config}
                onComplete={(results) => console.log('Monte Carlo complete:', results)}
              />
            </>
          )}
          {isSimulating && (
            <div className="glass-panel p-8 text-center">
              <div className="animate-pulse text-bio-cyan">
                Running simulation...
              </div>
            </div>
          )}
          {error && result && (
            <div className="glass-panel p-4 border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
        </div>
        </div>
      </div>
    </main>
  );
}
