'use client';

import { Github, Info, Download } from 'lucide-react';
import { useState } from 'react';
import AboutModal from './AboutModal';

export default function Header() {
  const [showAbout, setShowAbout] = useState(false);

  return (
    <>
      <header className="w-full p-6 border-b border-gray-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-bio-cyan">Aging Network Model</h1>
            <p className="text-sm text-gray-400 mt-1">Interactive exploration of systemic aging dynamics</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAbout(true)}
              className="flex items-center gap-2 px-4 py-2 glass-panel-hover rounded-lg transition-colors text-sm"
            >
              <Info size={16} />
              About
            </button>

            <a
              href="https://github.com/smartinelle/systemic_rejuvenation"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 glass-panel-hover rounded-lg transition-colors text-sm"
            >
              <Github size={16} />
              Code
            </a>

            <a
              href="https://github.com/smartinelle/systemic_rejuvenation/blob/main/model.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 glass-panel-hover rounded-lg transition-colors text-sm"
            >
              <Download size={16} />
              Paper
            </a>
          </div>
        </div>
      </header>

      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
    </>
  );
}
