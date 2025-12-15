import type { InterventionType } from '@/lib/types';

interface InterventionTabsProps {
  selected: InterventionType;
  onChange: (intervention: InterventionType) => void;
}

const INTERVENTIONS: { id: InterventionType; label: string; description: string }[] = [
  { id: 'none', label: 'Baseline', description: 'No intervention' },
  { id: 'exercise', label: 'Exercise', description: 'Boosts recovery, reduces damage' },
  { id: 'drug', label: 'Drug', description: 'Reduces shock probability' },
  { id: 'parabiosis', label: 'Parabiosis', description: 'Multi-system boost with decay' },
  { id: 'organ1', label: 'Organ (1)', description: 'Replace 1 subsystem' },
  { id: 'organ2', label: 'Organ (2)', description: 'Replace 2 subsystems' },
  { id: 'organ3', label: 'Organ (3)', description: 'Replace all 3 subsystems' },
];

export default function InterventionTabs({ selected, onChange }: InterventionTabsProps) {
  return (
    <div className="glass-panel p-4">
      <h3 className="text-lg font-semibold mb-4 text-bio-cyan">Intervention</h3>
      <div className="space-y-2">
        {INTERVENTIONS.map((intervention) => (
          <button
            key={intervention.id}
            onClick={() => onChange(intervention.id)}
            className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
              selected === intervention.id
                ? 'bg-bio-violet/20 border border-bio-violet'
                : 'bg-white/5 border border-transparent hover:bg-white/10'
            }`}
          >
            <div className="font-medium">{intervention.label}</div>
            <div className="text-xs text-gray-400 mt-1">{intervention.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
