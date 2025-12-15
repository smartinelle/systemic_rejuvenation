'use client';

import type { InterventionType, SimulationConfig } from '@/lib/types';
import { Play, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

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
  const [showAdvanced, setShowAdvanced] = useState(false);

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

      {/* Basic Simulation Parameters */}
      <div className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Start Age
            <span className="text-gray-500 ml-2">{config.start_age.toFixed(0)} yrs</span>
          </label>
          <input
            type="range"
            min="20"
            max="50"
            step="5"
            value={config.start_age}
            onChange={(e) => updateConfig('start_age', parseFloat(e.target.value))}
            className="w-full accent-bio-cyan"
          />
        </div>

        <div>
          <label className="text-sm text-gray-300 block mb-2">
            Simulation Years
            <span className="text-gray-500 ml-2">{config.years.toFixed(0)} yrs</span>
          </label>
          <input
            type="range"
            min="50"
            max="150"
            step="10"
            value={config.years}
            onChange={(e) => updateConfig('years', parseFloat(e.target.value))}
            className="w-full accent-bio-cyan"
          />
        </div>

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

      {/* Advanced Parameters Section */}
      <div className="border-t border-gray-700 pt-4">
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="flex items-center justify-between w-full text-sm text-gray-300 hover:text-white transition-colors"
        >
          <span>Advanced Parameters</span>
          {showAdvanced ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showAdvanced && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Noise Std Dev
                <span className="text-gray-500 ml-2">{config.noise_std.toFixed(3)}</span>
              </label>
              <input
                type="range"
                min="0"
                max="0.02"
                step="0.001"
                value={config.noise_std}
                onChange={(e) => updateConfig('noise_std', parseFloat(e.target.value))}
                className="w-full accent-bio-cyan"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 block mb-2">
                Time Step (dt)
                <span className="text-gray-500 ml-2">{config.dt.toFixed(2)}</span>
              </label>
              <input
                type="range"
                min="0.05"
                max="0.5"
                step="0.05"
                value={config.dt}
                onChange={(e) => updateConfig('dt', parseFloat(e.target.value))}
                className="w-full accent-bio-cyan"
              />
            </div>
          </div>
        )}
      </div>

      {/* Intervention Info */}
      <div className="mt-4 p-3 bg-bio-cyan/10 rounded-lg border border-bio-cyan/30">
        <p className="text-xs text-gray-300">
          {intervention === 'none' && 'Baseline simulation with no interventions.'}
          {intervention === 'exercise' && 'Exercise: Boosts recovery by 30% and reduces damage accumulation by 30% (starts age 40).'}
          {intervention === 'drug' && 'Drug therapy: Reduces shock probability and magnitude by 60% (starts age 60).'}
          {intervention === 'parabiosis' && 'Parabiosis: Time-decaying boost to recovery (+40%), decay reduction (20%), and damage mitigation (40%) for 8 years starting at age 55.'}
          {intervention.startsWith('organ') && `Organ replacement at age 65: ${intervention === 'organ1' ? 'Cardio only' : intervention === 'organ2' ? 'Cardio + Musc' : 'Cardio + Musc + Neuro'}.`}
        </p>
      </div>
    </div>
  );
}
