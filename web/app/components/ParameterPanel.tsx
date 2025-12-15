import type { InterventionType, SimulationConfig } from '@/lib/types';
import { Play } from 'lucide-react';

interface ParameterPanelProps {
  intervention: InterventionType;
  config: SimulationConfig;
  onChange: (config: SimulationConfig) => void;
  onRunSimulation: () => void;
  isSimulating: boolean;
}

export default function ParameterPanel({
  intervention,
  config,
  onChange,
  onRunSimulation,
  isSimulating,
}: ParameterPanelProps) {
  const updateConfig = (key: keyof SimulationConfig, value: number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="glass-panel p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-bio-cyan">Parameters</h3>
        <button
          onClick={onRunSimulation}
          disabled={isSimulating}
          className="flex items-center gap-2 px-4 py-2 bg-bio-violet hover:bg-bio-violet/80 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-colors text-sm font-medium"
        >
          <Play size={16} />
          Run
        </button>
      </div>

      {/* Simulation Parameters */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Functional Threshold
            <span className="text-gray-500 ml-2">{config.func_threshold.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={config.func_threshold}
            onChange={(e) => updateConfig('func_threshold', parseFloat(e.target.value))}
            className="w-full accent-bio-cyan"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Death Threshold
            <span className="text-gray-500 ml-2">{config.death_threshold.toFixed(2)}</span>
          </label>
          <input
            type="range"
            min="0.05"
            max="0.5"
            step="0.05"
            value={config.death_threshold}
            onChange={(e) => updateConfig('death_threshold', parseFloat(e.target.value))}
            className="w-full accent-bio-cyan"
          />
        </div>
      </div>

      {/* Intervention-specific parameters note */}
      <div className="mt-6 p-3 bg-bio-cyan/10 rounded-lg border border-bio-cyan/30">
        <p className="text-xs text-gray-300">
          {intervention === 'none' && 'Baseline simulation with no interventions.'}
          {intervention === 'exercise' && 'Exercise parameters are configured via the model defaults.'}
          {intervention === 'drug' && 'Drug parameters are configured via the model defaults.'}
          {intervention === 'parabiosis' && 'Parabiosis parameters are configured via the model defaults.'}
          {intervention.startsWith('organ') && 'Organ replacement parameters are configured via the model defaults.'}
        </p>
      </div>
    </div>
  );
}
