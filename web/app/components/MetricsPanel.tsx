import type { SimulationResult, InterventionType } from '@/lib/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricsPanelProps {
  result: SimulationResult;
  baseline: SimulationResult | null;
  intervention: InterventionType;
}

export default function MetricsPanel({ result, baseline, intervention }: MetricsPanelProps) {
  const healthspanDelta = baseline ? result.healthspan - baseline.healthspan : 0;
  const lifespanDelta = baseline ? result.lifespan - baseline.lifespan : 0;

  const formatDelta = (delta: number) => {
    if (Math.abs(delta) < 0.1) return '—';
    const sign = delta > 0 ? '+' : '';
    return `${sign}${delta.toFixed(1)}y`;
  };

  return (
    <div className="glass-panel p-6">
      <h3 className="text-lg font-semibold mb-4 text-bio-cyan">Metrics</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Healthspan */}
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Healthspan</div>
          <div className="text-3xl font-bold text-bio-green">
            {result.healthspan.toFixed(1)} <span className="text-lg text-gray-400">years</span>
          </div>
          {intervention !== 'none' && baseline && (
            <div className={`flex items-center gap-2 text-sm ${
              healthspanDelta > 0 ? 'text-green-400' : healthspanDelta < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {healthspanDelta > 0 ? <TrendingUp size={16} /> : healthspanDelta < 0 ? <TrendingDown size={16} /> : null}
              <span>{formatDelta(healthspanDelta)} vs baseline</span>
            </div>
          )}
        </div>

        {/* Lifespan */}
        <div className="space-y-2">
          <div className="text-sm text-gray-400">Lifespan</div>
          <div className="text-3xl font-bold text-bio-cyan">
            {result.lifespan.toFixed(1)} <span className="text-lg text-gray-400">years</span>
          </div>
          {intervention !== 'none' && baseline && (
            <div className={`flex items-center gap-2 text-sm ${
              lifespanDelta > 0 ? 'text-green-400' : lifespanDelta < 0 ? 'text-red-400' : 'text-gray-400'
            }`}>
              {lifespanDelta > 0 ? <TrendingUp size={16} /> : lifespanDelta < 0 ? <TrendingDown size={16} /> : null}
              <span>{formatDelta(lifespanDelta)} vs baseline</span>
            </div>
          )}
        </div>
      </div>

      {/* Interpretation */}
      {intervention !== 'none' && (
        <div className="mt-6 p-4 bg-bio-violet/10 rounded-lg border border-bio-violet/30">
          <p className="text-sm text-gray-300">
            {healthspanDelta > 0 && lifespanDelta > 0 && 'This intervention extends both healthspan and lifespan.'}
            {healthspanDelta > 0 && lifespanDelta <= 0 && 'This intervention extends healthspan without increasing lifespan.'}
            {healthspanDelta <= 0 && lifespanDelta > 0 && 'This intervention extends lifespan but not healthspan.'}
            {healthspanDelta <= 0 && lifespanDelta <= 0 && 'This intervention shows minimal benefit over baseline.'}
          </p>
        </div>
      )}
    </div>
  );
}
