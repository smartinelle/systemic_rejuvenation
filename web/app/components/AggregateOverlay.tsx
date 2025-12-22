'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';
import type { SimulationResult, InterventionType, SimulationConfig } from '@/lib/types';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

const COLORS: Record<InterventionType, string> = {
  none: '#E5E7EB', // light gray for better contrast on dark bg
  exercise: '#16A34A',
  drug: '#2563EB',
  parabiosis: '#8B5CF6',
  organ1: '#F59E0B',
  organ2: '#F97316',
  organ3: '#FBBF24',
};

interface AggregateOverlayProps {
  results: Partial<Record<InterventionType, SimulationResult>>;
  config: SimulationConfig;
}

export default function AggregateOverlay({ results, config }: AggregateOverlayProps) {
  const entries = Object.entries(results) as Array<[InterventionType, SimulationResult]>;
  if (!entries.length) {
    return null;
  }

  const [visible, setVisible] = useState<Record<InterventionType, boolean>>(() =>
    entries.reduce((acc, [id]) => ({ ...acc, [id]: true }), {} as Record<InterventionType, boolean>)
  );

  const filtered = useMemo(
    () => entries.filter(([id]) => visible[id] !== false),
    [entries, visible]
  );

  const traces = filtered.map(([id, res]) => ({
    x: res.ages,
    y: res.mean_X,
    mode: 'lines' as const,
    name: id,
    line: { color: COLORS[id], width: 2 },
  }));

  const shapes = [
    {
      type: 'line',
      x0: resMinAge(results),
      x1: resMaxAge(results),
      y0: config.func_threshold,
      y1: config.func_threshold,
      line: { color: '#FCD34D', width: 1, dash: 'dot' },
    },
    {
      type: 'line',
      x0: resMinAge(results),
      x1: resMaxAge(results),
      y0: config.death_threshold,
      y1: config.death_threshold,
      line: { color: '#DC2626', width: 1, dash: 'dot' },
    },
    ...filtered.flatMap(([id, res]) => {
      const color = COLORS[id] || '#6B7280';
      const markers = [];
      if (res.healthspan) {
        markers.push({
          type: 'line',
          x0: res.healthspan,
          x1: res.healthspan,
          y0: 0,
          y1: 1,
          line: { color, width: 1, dash: 'dot' },
        });
      }
      if (res.lifespan) {
        markers.push({
          type: 'line',
          x0: res.lifespan,
          x1: res.lifespan,
          y0: 0,
          y1: 1,
          line: { color, width: 2, dash: 'dash' },
        });
      }
      return markers;
    }),
  ];

  const layout = {
    title: { text: 'All Interventions: Mean Functional Health', font: { color: '#E5E7EB' } },
    xaxis: { title: { text: 'Age (years)' }, color: '#9CA3AF' },
    yaxis: { title: { text: 'Mean X' }, color: '#9CA3AF', range: [0, 1] },
    shapes,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: { color: '#E5E7EB' },
    hovermode: 'x unified' as const,
  };

  const toggle = (id: InterventionType) => {
    setVisible((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="glass-panel p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-200">
        {entries.map(([id]) => (
          <label key={id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={visible[id] !== false}
              onChange={() => toggle(id)}
              className="accent-bio-cyan"
            />
            <span style={{ color: COLORS[id] }}>{id}</span>
          </label>
        ))}
      </div>
      <Plot data={traces} layout={layout} config={{ responsive: true, displayModeBar: false }} style={{ width: '100%', height: '480px' }} />
    </div>
  );
}

function resMinAge(results: Partial<Record<InterventionType, SimulationResult>>): number {
  const ages = Object.values(results).flatMap((r) => (r ? [r.ages[0]] : []));
  return ages.length ? Math.min(...ages) : 30;
}

function resMaxAge(results: Partial<Record<InterventionType, SimulationResult>>): number {
  const ages = Object.values(results).flatMap((r) => (r ? [r.ages[r.ages.length - 1]] : []));
  return ages.length ? Math.max(...ages) : 120;
}
