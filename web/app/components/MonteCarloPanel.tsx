'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';
import { runSimulation } from '@/lib/pyodide-loader';
import type { InterventionType, SimulationConfig, SimulationResult } from '@/lib/types';

interface MonteCarloPanelProps {
  intervention: InterventionType;
  config: SimulationConfig;
  onComplete: (results: SimulationResult[]) => void;
}

export default function MonteCarloPanel({ intervention, config, onComplete }: MonteCarloPanelProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<SimulationResult[] | null>(null);

  const runMonteCarlo = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults(null);

    const runs = 20;
    const allResults: SimulationResult[] = [];

    try {
      for (let i = 0; i < runs; i++) {
        const result = await runSimulation(intervention, config);
        allResults.push(result);
        setProgress((i + 1) / runs);
      }

      setResults(allResults);
      onComplete(allResults);
    } catch (error) {
      console.error('Monte Carlo failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const calculateStats = () => {
    if (!results || results.length === 0) return null;

    const healthspans = results.map(r => r.healthspan);
    const lifespans = results.map(r => r.lifespan);

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b) / arr.length;
    const std = (arr: number[]) => {
      const m = mean(arr);
      return Math.sqrt(arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length);
    };

    return {
      healthspan: { mean: mean(healthspans), std: std(healthspans) },
      lifespan: { mean: mean(lifespans), std: std(lifespans) },
    };
  };

  const stats = calculateStats();

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-bio-cyan">Monte Carlo Analysis</h3>
          <p className="text-xs text-gray-400 mt-1">Run 20 simulations with random variation</p>
        </div>
        <button
          onClick={runMonteCarlo}
          disabled={isRunning}
          className="flex items-center gap-2 px-4 py-2 bg-bio-green hover:bg-bio-green/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
        >
          <Play size={16} />
          {isRunning ? 'Running...' : 'Run 20x'}
        </button>
      </div>

      {isRunning && (
        <div className="space-y-2">
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className="bg-bio-green h-full transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
          <p className="text-sm text-gray-400 text-center">
            {Math.round(progress * 100)}% complete ({Math.round(progress * 20)}/20 runs)
          </p>
        </div>
      )}

      {stats && (
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="p-4 bg-bio-cyan/10 rounded-lg border border-bio-cyan/30">
            <div className="text-sm text-gray-400">Healthspan (mean ± std)</div>
            <div className="text-2xl font-bold text-bio-green mt-1">
              {stats.healthspan.mean.toFixed(1)} ± {stats.healthspan.std.toFixed(1)} yrs
            </div>
          </div>
          <div className="p-4 bg-bio-cyan/10 rounded-lg border border-bio-cyan/30">
            <div className="text-sm text-gray-400">Lifespan (mean ± std)</div>
            <div className="text-2xl font-bold text-bio-cyan mt-1">
              {stats.lifespan.mean.toFixed(1)} ± {stats.lifespan.std.toFixed(1)} yrs
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
