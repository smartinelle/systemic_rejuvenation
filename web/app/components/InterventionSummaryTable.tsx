'use client';

import type { SimulationResult, InterventionType } from '@/lib/types';

const LABELS: Record<InterventionType, string> = {
  none: 'Baseline',
  exercise: 'Exercise',
  drug: 'Drug',
  parabiosis: 'Parabiosis',
  organ1: 'Organ (1)',
  organ2: 'Organ (2)',
  organ3: 'Organ (3)',
};

interface InterventionSummaryTableProps {
  results: Partial<Record<InterventionType, SimulationResult>>;
}

function meanOf(arr: number[]): number {
  if (!arr.length) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export default function InterventionSummaryTable({ results }: InterventionSummaryTableProps) {
  const entries = Object.entries(results) as Array<[InterventionType, SimulationResult]>;
  if (!entries.length) return null;

  const baseline = results['none'];
  const baselineHealthspan = baseline ? (baseline.healthspan ?? baseline.ages[baseline.ages.length - 1]) : null;
  const baselineLifespan = baseline ? (baseline.lifespan ?? baseline.ages[baseline.ages.length - 1]) : null;
  const baselineMeanHealth = baseline ? meanOf(baseline.mean_X) : null;

  const rows = entries.map(([id, res]) => ({
    id,
    label: LABELS[id] ?? id,
    meanHealth: meanOf(res.mean_X),
    healthspan: res.healthspan ?? res.ages[res.ages.length - 1],
    lifespan: res.lifespan ?? res.ages[res.ages.length - 1],
    deltaHealth: baselineMeanHealth !== null ? meanOf(res.mean_X) - baselineMeanHealth : null,
    deltaHS: baselineHealthspan !== null ? (res.healthspan ?? res.ages[res.ages.length - 1]) - baselineHealthspan : null,
    deltaLS: baselineLifespan !== null ? (res.lifespan ?? res.ages[res.ages.length - 1]) - baselineLifespan : null,
  }));

  return (
    <div className="glass-panel p-4 space-y-3">
      <h3 className="text-lg font-semibold text-bio-cyan">Intervention Summary</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-gray-200">
          <thead className="text-gray-400">
            <tr>
              <th className="text-left py-2 pr-4">Intervention</th>
              <th className="text-right py-2 pr-4">Mean Health</th>
              <th className="text-right py-2 pr-4">Healthspan (yrs)</th>
              <th className="text-right py-2 pr-4">Lifespan (yrs)</th>
              <th className="text-right py-2 pr-4">ΔHealth vs base</th>
              <th className="text-right py-2 pr-4">ΔHS vs base</th>
              <th className="text-right py-2 pr-4">ΔLS vs base</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-white/5">
                <td className="py-2 pr-4">{row.label}</td>
                <td className="py-2 pr-4 text-right">{row.meanHealth.toFixed(3)}</td>
                <td className="py-2 pr-4 text-right">{row.healthspan.toFixed(1)}</td>
                <td className="py-2 pr-4 text-right">{row.lifespan.toFixed(1)}</td>
                <td className="py-2 pr-4 text-right">
                  {row.deltaHealth !== null ? `${row.deltaHealth >= 0 ? '+' : ''}${row.deltaHealth.toFixed(3)}` : '—'}
                </td>
                <td className="py-2 pr-4 text-right">
                  {row.deltaHS !== null ? `${row.deltaHS >= 0 ? '+' : ''}${row.deltaHS.toFixed(1)}` : '—'}
                </td>
                <td className="py-2 pr-4 text-right">
                  {row.deltaLS !== null ? `${row.deltaLS >= 0 ? '+' : ''}${row.deltaLS.toFixed(1)}` : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
