# Implementation Tasks

## 1. Project Setup
- [ ] 1.1 Initialize Next.js project in `web/` directory with TypeScript and Tailwind
- [ ] 1.2 Install dependencies: `pyodide`, `plotly.js`, `@headlessui/react`, `katex`, `lucide-react`, `aceternity-ui`
- [ ] 1.3 Configure `next.config.js` for static export (Vercel compatibility)
- [ ] 1.4 Set up custom Tailwind theme (color palette: navy background, cyan/amber/violet accents)
- [ ] 1.5 Copy `src/aging_network/` Python package to `web/public/py/aging_network/`

## 2. Pyodide Integration
- [ ] 2.1 Create `lib/pyodide-loader.ts` with async Pyodide initialization function
- [ ] 2.2 Implement loading progress tracking (Pyodide → NumPy → aging_network)
- [ ] 2.3 Create `SimulationEngine.tsx` component wrapping Pyodide loader
- [ ] 2.4 Add loading state UI (progress bar with status text)
- [ ] 2.5 Test that `run_sim()` executes successfully from JavaScript
- [ ] 2.6 Implement error handling for Pyodide load failures

## 3. Core UI Layout
- [ ] 3.1 Create `app/page.tsx` with two-column layout (sidebar + main)
- [ ] 3.2 Implement header with title and links (Docs, Code, Export)
- [ ] 3.3 Add glassmorphism card components (using Aceternity UI)
- [ ] 3.4 Ensure responsive layout (desktop-first, >1280px optimal)

## 4. Intervention Selection
- [ ] 4.1 Create `InterventionTabs.tsx` with tab group for scenarios
- [ ] 4.2 Implement tabs for: none, exercise, drug, parabiosis, organ1, organ2, organ3
- [ ] 4.3 Add hover tooltips with brief intervention descriptions
- [ ] 4.4 Wire up state to trigger parameter panel updates on selection

## 5. Parameter Controls
- [ ] 5.1 Create `ParameterSliders.tsx` component with slider UI
- [ ] 5.2 Implement sliders for exercise parameters (start_age, recovery_gain, damage_reduction)
- [ ] 5.3 Implement sliders for drug parameters (start_age, shock_factor)
- [ ] 5.4 Implement sliders for parabiosis parameters (start_age, duration, strength_k, gains)
- [ ] 5.5 Implement controls for organ replacement (age, which organs)
- [ ] 5.6 Add collapsible "Advanced" section for system parameters (shock_prob, base_recovery, etc.)
- [ ] 5.7 Display current value, units, and range for each slider
- [ ] 5.8 Create `EquationTooltip.tsx` with KaTeX rendering for parameter equations
- [ ] 5.9 Implement debounce (200ms) on slider changes to batch simulation triggers

## 6. Simulation Execution
- [ ] 6.1 Create `lib/types.ts` with TypeScript interfaces for SimulationConfig, SystemConfig, InterventionConfig
- [ ] 6.2 Implement function to build Python config objects from UI state
- [ ] 6.3 Create simulation trigger that calls Pyodide's `run_sim()` with current parameters
- [ ] 6.4 Parse Python result (X, D arrays, healthspan, lifespan) into TypeScript types
- [ ] 6.5 Add error handling for simulation failures
- [ ] 6.6 Store baseline results (intervention="none") for comparison

## 7. Trajectory Visualization
- [ ] 7.1 Create `TrajectoryChart.tsx` using Plotly.js
- [ ] 7.2 Configure dual-axis chart (X solid lines, D dashed lines)
- [ ] 7.3 Add horizontal threshold lines (func_threshold, death_threshold)
- [ ] 7.4 Add vertical intervention marker line (if intervention active)
- [ ] 7.5 Implement chart layout (responsive size, axis labels, legend)
- [ ] 7.6 Enable zoom and pan interactions
- [ ] 7.7 Add hover tooltips showing exact values (age, X, D)
- [ ] 7.8 Test that chart updates smoothly when parameters change

## 8. Metrics Display
- [ ] 8.1 Create `MetricsPanel.tsx` with glassmorphism card
- [ ] 8.2 Display healthspan (years, 1 decimal)
- [ ] 8.3 Display lifespan (years, 1 decimal)
- [ ] 8.4 Calculate and display delta vs baseline ("+X.X years" or "−X.X years")
- [ ] 8.5 Color-code delta (green for positive, red for negative)
- [ ] 8.6 Handle baseline case (no delta shown)

## 9. Network Visualization (Optional - If Time Permits)
- [ ] 9.1 Create `NetworkGraph.tsx` using D3.js or Cytoscape.js
- [ ] 9.2 Render 3 nodes (Cardio, Musc, Neuro) with force-directed layout
- [ ] 9.3 Add edges based on C_base coupling matrix
- [ ] 9.4 Color nodes by X value intensity
- [ ] 9.5 Add hover interaction to highlight node connections

## 10. Monte Carlo Mode (Optional - If Time Permits)
- [ ] 10.1 Add "Run Monte Carlo" button (20 runs)
- [ ] 10.2 Implement loop calling `run_sim()` 20 times with same config
- [ ] 10.3 Calculate mean trajectory and confidence intervals
- [ ] 10.4 Add progress bar showing completion status
- [ ] 10.5 Update chart to show mean line + confidence bands

## 11. Polish and Documentation
- [ ] 11.1 Add "About" modal explaining model purpose and assumptions
- [ ] 11.2 Include links to GitHub repo and PDF paper
- [ ] 11.3 Add export button for saving chart as PNG (Plotly built-in)
- [ ] 11.4 Test all interactions for responsiveness (no lag)
- [ ] 11.5 Verify memory usage stays under 200MB
- [ ] 11.6 Add favicon and meta tags for sharing (og:image, description)

## 12. Deployment
- [ ] 12.1 Test static export build (`npm run build`)
- [ ] 12.2 Verify all routes work without server-side rendering
- [ ] 12.3 Configure service worker for Pyodide caching (optional)
- [ ] 12.4 Set up Vercel project and link to GitHub repo
- [ ] 12.5 Deploy to Vercel and verify production deployment
- [ ] 12.6 Test deployed app on Vercel URL
- [ ] 12.7 Update README.md with link to live demo

## Notes
- Tasks 1-8 are MVP core (3-4 hours)
- Tasks 9-10 are optional enhancements (defer if time-constrained)
- Task 11 is polish (add as time permits)
- Task 12 is deployment (30 minutes)

## Validation Checklist
After implementation, verify:
- [ ] Pyodide loads successfully and simulations run
- [ ] All intervention types work with correct parameters
- [ ] Chart updates reflect parameter changes accurately
- [ ] Metrics match Python CLI output for same parameters
- [ ] Performance: simulation completes in <300ms
- [ ] Memory: stays under 200MB during normal use
- [ ] Deployment: static export builds and deploys to Vercel
