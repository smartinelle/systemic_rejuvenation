'use client';

import dynamic from 'next/dynamic';
import type { SimulationResult, InterventionType, SimulationConfig } from '@/lib/types';

// Dynamically import Plot to avoid SSR issues
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface TrajectoryChartProps {
  result: SimulationResult;
  config: SimulationConfig;
  intervention: InterventionType;
}

const SUBSYSTEM_NAMES = ['Cardio', 'Musc', 'Neuro'];
const X_COLORS = ['#00D9FF', '#00FF88', '#8B5CF6']; // cyan, green, violet
const D_COLORS = ['#F59E0B', '#EF4444', '#EC4899']; // amber, red, pink

export default function TrajectoryChart({ result, config, intervention }: TrajectoryChartProps) {
  // Prepare traces for X (solid lines)
  const xTraces = SUBSYSTEM_NAMES.map((name, i) => ({
    x: result.ages,
    y: result.X.map((row) => row[i]),
    mode: 'lines' as const,
    name: `${name} (X)`,
    line: { color: X_COLORS[i], width: 2 },
  }));

  // Prepare traces for D (dashed lines)
  const dTraces = SUBSYSTEM_NAMES.map((name, i) => ({
    x: result.ages,
    y: result.D.map((row) => row[i]),
    mode: 'lines' as const,
    name: `${name} (D)`,
    line: { color: D_COLORS[i], width: 2, dash: 'dash' as const },
  }));

  // Threshold lines
  const funcThresholdTrace = {
    x: [result.ages[0], result.ages[result.ages.length - 1]],
    y: [config.func_threshold, config.func_threshold],
    mode: 'lines' as const,
    name: 'Functional Threshold',
    line: { color: '#FCD34D', width: 1, dash: 'dot' as const },
  };

  const deathThresholdTrace = {
    x: [result.ages[0], result.ages[result.ages.length - 1]],
    y: [config.death_threshold, config.death_threshold],
    mode: 'lines' as const,
    name: 'Death Threshold',
    line: { color: '#DC2626', width: 1, dash: 'dot' as const },
  };

  // Intervention marker (vertical line)
  const interventionAge = intervention === 'exercise' ? 30 : intervention === 'drug' ? 40 : intervention === 'parabiosis' ? 50 : intervention.startsWith('organ') ? 50 : null;
  const interventionMarker = interventionAge && intervention !== 'none' ? {
    x: [interventionAge, interventionAge],
    y: [0, 1],
    mode: 'lines' as const,
    name: 'Intervention Start',
    line: { color: '#8B5CF6', width: 2, dash: 'dashdot' as const },
  } : null;

  const data = [...xTraces, ...dTraces, funcThresholdTrace, deathThresholdTrace, ...(interventionMarker ? [interventionMarker] : [])];

  const layout = {
    title: {
      text: `Trajectory: ${intervention}`,
      font: { color: '#E5E7EB' },
    },
    xaxis: {
      title: { text: 'Age (years)' },
      gridcolor: '#374151',
      color: '#9CA3AF',
    },
    yaxis: {
      title: { text: 'Value' },
      gridcolor: '#374151',
      color: '#9CA3AF',
      range: [0, 1],
    },
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#E5E7EB' },
    legend: {
      bgcolor: 'rgba(0,0,0,0.3)',
      bordercolor: '#374151',
      borderwidth: 1,
    },
    hovermode: 'x unified' as const,
  };

  return (
    <div className="glass-panel p-4">
      <Plot
        data={data}
        layout={layout}
        config={{ responsive: true, displayModeBar: false }}
        style={{ width: '100%', height: '500px' }}
      />
    </div>
  );
}
