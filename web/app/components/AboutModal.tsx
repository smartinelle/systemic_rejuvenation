'use client';

import { X } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

export default function AboutModal({ onClose }: AboutModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-panel p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold text-bio-cyan">About the Aging Network Model</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4 text-gray-300">
          <section>
            <h3 className="text-lg font-semibold text-bio-green mb-2">Model Overview</h3>
            <p>
              This interactive tool visualizes a coupled dynamical systems model of aging that represents
              three major physiological subsystems: <strong>Cardiovascular</strong>, <strong>Musculoskeletal</strong>,
              and <strong>Neurological</strong>.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bio-green mb-2">Key Variables</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>X (Function):</strong> Represents the functional health of each subsystem (1 = perfect health, 0 = complete failure)</li>
              <li><strong>D (Damage):</strong> Represents accumulated structural damage in each subsystem (0 = no damage, 1 = maximum damage)</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bio-green mb-2">Core Dynamics</h3>
            <p className="mb-2">The model is governed by two coupled differential equations:</p>
            <div className="bg-black/30 p-4 rounded-lg font-mono text-sm">
              <p>dX/dt = -r·X - C·D</p>
              <p>dD/dt = k·(1-X)² + β·D - α·X·D</p>
            </div>
            <ul className="list-disc list-inside space-y-2 ml-4 mt-3">
              <li><strong>C (Coupling Matrix):</strong> Captures how damage in one system affects others</li>
              <li><strong>r:</strong> Natural decay rate of function</li>
              <li><strong>k:</strong> Damage accumulation rate</li>
              <li><strong>β:</strong> Damage self-amplification</li>
              <li><strong>α:</strong> Repair/clearance rate</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bio-green mb-2">Interventions</h3>
            <p className="mb-2">The model simulates various rejuvenation strategies:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Exercise:</strong> Boosts recovery and reduces damage accumulation</li>
              <li><strong>Drug Therapy:</strong> Reduces systemic damage markers</li>
              <li><strong>Parabiosis:</strong> Young blood factors enhance recovery and reduce aging markers</li>
              <li><strong>Organ Replacement:</strong> Resets specific subsystem to near-perfect condition</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bio-green mb-2">Key Metrics</h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Healthspan:</strong> Age when function falls below the functional threshold</li>
              <li><strong>Lifespan:</strong> Age when function reaches the death threshold</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-bio-green mb-2">Research Implications</h3>
            <p>
              This model helps explore how interventions affect healthspan vs. lifespan, the role of
              inter-system coupling in aging, and the optimal timing and combination of interventions.
              The coupling matrix <strong>C</strong> represents the core innovation, showing how aging
              propagates through physiological networks.
            </p>
          </section>

          <section className="pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              For detailed mathematical derivations and biological justification, see the{' '}
              <a
                href="https://github.com/smartinelle/systemic_rejuvenation/blob/main/systemic_rejuvenation.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bio-cyan hover:underline"
              >
                full paper
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
