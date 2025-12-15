# Design: Interactive Web Frontend

## Context
The aging network model currently requires Python installation and CLI/notebook usage. Target users (researchers, longevity enthusiasts, technical professionals) need browser-based access to explore parameters and visualize outcomes without local setup. The solution must deploy to Vercel, complete in 3-4 hours, and prioritize efficient communication of complex biological dynamics through interactive visualization.

## Goals / Non-Goals

### Goals
- Enable parameter exploration in browser
- Real-time visualization of single simulation runs
- Efficient communication of systemic interactions and feedback loops
- Modern aesthetic that reflects scientific rigor
- Deploy to Vercel as static site
- Maintain model accuracy (exact same Python code)
- Fast, responsive UX (60fps interactions)

### Non-Goals
- Decorative animations that don't aid understanding
- User accounts or saved sessions
- Mobile optimization (desktop-first)
- Monte Carlo with 100+ runs (too slow; limit to ~20)
- Backend API or database
- Comparison mode (defer to phase 2)

## Decisions

### 1. Architecture: Client-side Pyodide
**Decision**: Use Next.js (React) with Pyodide to run Python directly in browser

**Rationale**:
- No backend needed → simpler deployment (Vercel static export)
- Zero latency after initial load → instant parameter updates
- Exact Python code reuse → no translation/porting bugs
- NumPy available in Pyodide
- Single deployment target (no separate API hosting)

**Alternatives considered**:
- FastAPI backend: Requires separate hosting, API latency
- Streamlit: Not Vercel-compatible, less customizable
- Python → JS port: High effort, error-prone

### 2. Visualization: Purpose-Driven Interactivity
**Decision**: Layered visualization where each element communicates model behavior

**Core Components**:

1. **Network Graph (D3.js or Cytoscape.js)**
   - **Purpose**: Show subsystem coupling and dependencies
   - **Visual**: 3 nodes (Cardio, Musc, Neuro) with weighted edges
   - **Interaction**:
     - Hover node → highlight incoming/outgoing influences
     - Node color intensity = current X value
   - **Performance**: Static SVG, updates only on simulation complete
   - **Why**: Makes abstract coupling matrix (C_base) tangible

2. **Dual-Axis Trajectory Chart (Plotly.js)**
   - **Purpose**: Show X (functional) vs D (damage) temporal dynamics
   - **Visual**:
     - X lines: Solid, bright colors (health)
     - D lines: Dashed, muted colors (damage)
     - Threshold lines: Horizontal dashes (func_threshold, death_threshold)
     - Intervention markers: Vertical line at intervention age
   - **Interaction**:
     - Hover → show exact values + age
     - Zoom/pan for detail inspection
   - **Performance**: Plotly's WebGL mode for smooth rendering
   - **Why**: Reveals slow damage accumulation vs fast health recovery

3. **Parameter Impact Indicators**
   - **Purpose**: Show which parameters affect which mechanisms
   - **Visual**: Small badges next to sliders (e.g., "Recovery ↑", "Shocks ↓")
   - **Interaction**: Hover → see equation snippet
   - **Performance**: Pure CSS, no JS overhead
   - **Why**: Connects UI controls to biological mechanisms

**What we're NOT doing** (to preserve performance):
- No real-time pulsing/animations during simulation (distracting, CPU-intensive)
- No particle backgrounds (decorative, no value)
- No excessive transitions between states (use instant updates where appropriate)

### 3. UI Design: Clean, Scientific Aesthetic
**Decision**: Modern glassmorphism with restrained motion

**Visual Direction**:
- **Color palette**:
  - Background: Deep navy (#0F172A, #1E293B) - reads as professional
  - Health (X): Cyan/Teal spectrum (#06B6D4) - positive association
  - Damage (D): Amber/Orange spectrum (#F59E0B) - warning association
  - Accent: Violet (#8B5CF6) - interventions
  - Text: High-contrast white + neutral gray
- **Materials**:
  - Glassmorphism panels (backdrop-blur) for section separation
  - Subtle borders, no heavy shadows
- **Typography**:
  - Headings: Inter (clean, readable)
  - Code/values: JetBrains Mono (monospace for numbers)
- **Motion Philosophy**:
  - Transitions only where they aid comprehension (e.g., chart redraw shows causality)
  - Hover states: Instant (0ms) or very fast (100ms)
  - Parameter changes: Debounced (200ms) to batch updates

**Component Approach**:
- **Aceternity UI** for glassmorphism cards (pre-built, performant)
- **Headless UI** for accessible controls (dropdown, sliders)
- **Tailwind CSS** for rapid styling
- **Lucide React** for icons (lightweight, tree-shakeable)

**Why this approach**: Balances modern aesthetics with performance; every visual choice serves comprehension

### 4. Interactive Controls: Direct Manipulation
**Decision**: Standard controls (sliders, dropdowns) with smart labeling

**Key Features**:
- **Range sliders** with:
  - Current value display (large, readable)
  - Min/max labels
  - Unit indicators (years, percentages)
  - Immediate visual feedback (chart updates on release)
- **Intervention selector**: Tab group (one active)
- **Advanced panel**: Collapsible accordion (keeps UI clean)
- **Tooltips**: Appear on hover, contain:
  - Parameter description
  - Biological interpretation
  - Equation (LaTeX via KaTeX, pre-rendered)

**Rationale**:
- Familiar controls = lower cognitive load
- Direct manipulation = clear causality
- No "fancy" radial dials or gestural UIs (slower to use)

### 5. State Management: React useState
**Decision**: Simple React hooks only

**Rationale**:
- Single-page app with minimal state
- Parameters + simulation results
- No global store needed for 3-4 hour scope

### 6. Pyodide Loading Strategy
**Decision**: Fast loading with clear progress

**Implementation**:
```
1. User loads page
2. Show progress:
   - "Loading simulation engine..."
   - Progress bar (determinate, with sub-steps)
   - No animations, just factual status
3. Load Pyodide (~2-3 MB)
4. Load NumPy package
5. Import aging_network
6. Show "Ready" state, enable controls
```

**Optimization**: Service worker caches Pyodide for repeat visits

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│  Next.js Static Site (Vercel)              │
│  ┌───────────────────────────────────────┐ │
│  │  UI Components (React)                │ │
│  │  ├─ NetworkGraph (D3/Cytoscape)       │ │
│  │  ├─ InterventionTabs                  │ │
│  │  ├─ ParameterSliders                  │ │
│  │  ├─ TrajectoryChart (Plotly.js)       │ │
│  │  ├─ MetricsPanel                      │ │
│  │  └─ EquationTooltips (KaTeX)          │ │
│  └───────────────────────────────────────┘ │
│            ↕ (direct function calls)        │
│  ┌───────────────────────────────────────┐ │
│  │  Pyodide (Python in WASM)             │ │
│  │  ├─ NumPy                             │ │
│  │  ├─ aging_network package             │ │
│  │  └─ run_sim(), config builders        │ │
│  └───────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

## File Structure

```
web/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Main simulation page
│   ├── globals.css             # Custom theme
│   └── components/
│       ├── SimulationEngine.tsx    # Pyodide loader
│       ├── NetworkGraph.tsx        # Subsystem network viz
│       ├── InterventionTabs.tsx    # Scenario selector
│       ├── ParameterSliders.tsx    # Controls panel
│       ├── TrajectoryChart.tsx     # Plotly.js chart
│       ├── MetricsPanel.tsx        # Results display
│       └── EquationTooltip.tsx     # KaTeX equations
├── public/
│   └── py/
│       └── aging_network/      # Python package
├── lib/
│   ├── pyodide-loader.ts       # Pyodide init
│   ├── network-layout.ts       # Graph positioning
│   └── types.ts                # TypeScript types
├── package.json
├── next.config.js              # Vercel config
└── tsconfig.json
```

## Visual Layout

**Desktop (1920x1080)**:
```
┌───────────────────────────────────────────────────────┐
│  Aging Network Model           [Docs] [Code] [Export] │
├─────────────┬─────────────────────────────────────────┤
│             │  Network Diagram                        │
│ Intervention│  [Cardio]──[Musc]──[Neuro]              │
│ ┌─────────┐ │                                         │
│ │Exercise │ │  Trajectory Chart                       │
│ ├─────────┤ │  (X & D over time, dual-axis)           │
│ │ Drug    │ │                                         │
│ ├─────────┤ │                                         │
│ │Parabiosi│ │  ┌─────────────────────────────┐       │
│ ├─────────┤ │  │ Metrics                     │       │
│ │Organ Rep│ │  │ Healthspan: 72.3y (+8.7y)   │       │
│ └─────────┘ │  │ Lifespan: 87.1y (+5.2y)     │       │
│             │  └─────────────────────────────┘       │
│ Parameters: │                                         │
│ Start Age   │                                         │
│ [────●────] │                                         │
│ 40y         │                                         │
│             │                                         │
│ Recovery    │                                         │
│ [──●──────] │                                         │
│ +30%        │                                         │
│             │                                         │
│ [Advanced▼] │                                         │
└─────────────┴─────────────────────────────────────────┘
```

## Data Flow

1. **User adjusts slider** (e.g., exercise_start_age = 45)
2. **React updates state** (debounced 200ms)
3. **Trigger simulation**:
   ```js
   const result = await pyodide.runPythonAsync(`
     from aging_network import run_sim, SimulationConfig
     cfg = SimulationConfig(...)
     result = run_sim("exercise", sim_config=cfg)
     result.to_dict()
   `)
   ```
4. **Parse result** → X, D arrays, healthspan, lifespan
5. **Update UI** (single batch):
   - Network graph: Update node colors
   - Chart: Redraw with new data (Plotly handles animation)
   - Metrics: Update numbers (no counter animation, instant)
6. **Total latency**: ~100-200ms (feels instant)

## Performance Budget

### Initial Load
- Target: <5s on average connection
- Pyodide + NumPy: ~2-3s
- Next.js bundle: ~500KB (gzipped)
- Total: ~3-4s first load, <1s cached

### Simulation Runtime
- Single run: 50-100ms (acceptable)
- Monte Carlo (20 runs): 1-2s (show progress bar)

### Interaction Responsiveness
- Slider drag: 60fps (native browser)
- Parameter update → simulation: <200ms
- Chart redraw: <100ms (Plotly WebGL)
- Network update: <50ms (SVG manipulation)

### Memory
- Baseline: ~50MB (Next.js + Pyodide)
- Per simulation: ~5MB (arrays)
- Budget: <200MB total (safe for modern browsers)

## Risks / Trade-offs

### Risk: Pyodide load time feels slow
**Mitigation**:
- Clear progress indicator with sub-steps
- Service worker caching
- Consider showing static content (intro, docs) while loading

### Risk: Network graph adds complexity without value
**Mitigation**:
- Make it optional (toggle on/off)
- If time-constrained, skip in MVP and add later
- Focus on chart + parameters first

### Risk: Performance degrades with Monte Carlo
**Mitigation**:
- Cap at 20 runs (document limitation)
- Show progress bar to set expectations
- Consider Web Worker if blocking UI

### Trade-off: No fancy animations may look less impressive
**Accepted**: Technical audience values clarity over flash; clean, fast UX is the best showcase

## Migration Plan

N/A - New capability, no migration.

## Open Questions

1. **Include Monte Carlo in MVP?**
   - Lean toward YES (20 runs, ~2s)
   - Shows confidence intervals → more credible
   - Can defer if time-constrained

2. **Network graph: Essential or optional?**
   - Recommend: OPTIONAL in MVP
   - Focus on chart first; add network if time permits
   - Most value is in trajectory visualization

3. **Equation tooltips: LaTeX or plain text?**
   - Recommend: LaTeX (KaTeX is lightweight, ~200KB)
   - Technical audience will appreciate it
   - Pre-render to avoid runtime cost

4. **Export functionality: Priority?**
   - Defer to phase 2 unless trivial
   - Browser "Save As" works for plots via Plotly
