'use client';

import { useState, useEffect } from 'react';
import { initializePyodide, runSimulation, type LoadingProgress } from '@/lib/pyodide-loader';
import type { SimulationResult, InterventionType, SimulationConfig } from '@/lib/types';
import { DEFAULT_SIMULATION_CONFIG } from '@/lib/types';
import SimulationEngine from './components/SimulationEngine';
import InterventionTabs from './components/InterventionTabs';
import ParameterPanel from './components/ParameterPanel';
import TrajectoryChart from './components/TrajectoryChart';
import MetricsPanel from './components/MetricsPanel';

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
        setIsLoading(false);
        // Run baseline simulation
        return runSimulation('none', config);
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
    <main className="min-h-screen p-4">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-bio-cyan to-bio-violet bg-clip-text text-transparent">
            Aging Network Model
          </h1>
          <p className="text-gray-400 mt-1">
            Interactive exploration of systemic aging dynamics
          </p>
        </div>
        <div className="flex gap-4">
          <a
            href="https://github.com/smartinelle/systemic_rejuvenation"
            target="_blank"
            rel="noopener noreferrer"
            className="text-bio-cyan hover:text-bio-cyan/80 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
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
              <MetricsPanel
                result={result}
                baseline={baselineResult}
                intervention={intervention}
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
    </main>
  );
}
