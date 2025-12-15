# Web Interface Specification

## ADDED Requirements

### Requirement: Pyodide Integration
The web application SHALL run the Python aging_network package directly in the browser using Pyodide with NumPy support.

#### Scenario: Initial load and engine initialization
- **WHEN** user visits the web application for the first time
- **THEN** Pyodide and NumPy are loaded (2-3s)
- **AND** the aging_network package is imported successfully
- **AND** a progress indicator shows loading status
- **AND** controls are disabled until initialization completes

#### Scenario: Cached subsequent loads
- **WHEN** user revisits the application with service worker active
- **THEN** Pyodide loads from cache (<1s)
- **AND** initialization completes faster than first load

#### Scenario: Simulation execution
- **WHEN** user triggers a simulation with current parameters
- **THEN** Pyodide executes `run_sim()` with provided config
- **AND** results are returned to JavaScript within 100-200ms
- **AND** UI remains responsive during execution

### Requirement: Intervention Selection
The application SHALL provide a mechanism to select between available intervention scenarios.

#### Scenario: Default intervention on load
- **WHEN** application initializes
- **THEN** "none" (baseline) intervention is selected by default
- **AND** default parameters for baseline are displayed

#### Scenario: Switching interventions
- **WHEN** user selects a different intervention (exercise, drug, parabiosis, organ1/2/3)
- **THEN** parameter controls update to show relevant parameters for that intervention
- **AND** irrelevant parameters are hidden or disabled
- **AND** simulation auto-runs with new intervention and default parameters

#### Scenario: Intervention descriptions
- **WHEN** user hovers or focuses on an intervention option
- **THEN** a tooltip shows brief description of biological mechanism
- **AND** lists affected parameters (e.g., "Exercise: recovery ↑, damage ↓")

### Requirement: Parameter Controls
The application SHALL expose all configurable intervention parameters through interactive controls.

#### Scenario: Intervention-specific parameters
- **WHEN** "exercise" is selected
- **THEN** sliders for exercise_start_age, exercise_recovery_gain, exercise_damage_reduction are shown
- **AND** each slider displays current value, units, and valid range

#### Scenario: System parameters (advanced)
- **WHEN** user expands "Advanced" section
- **THEN** system-level parameters (shock_prob_base, base_recovery, etc.) are revealed
- **AND** parameters are grouped by category (recovery, decay, shocks, coupling)

#### Scenario: Parameter validation
- **WHEN** user adjusts a parameter
- **THEN** value is constrained to valid range (e.g., age 30-120, percentages 0-100)
- **AND** invalid values are prevented (not just warned)

#### Scenario: Parameter tooltips
- **WHEN** user hovers over a parameter label
- **THEN** tooltip appears showing:
  - Parameter description
  - Biological interpretation
  - Relevant equation (LaTeX-rendered)

### Requirement: Trajectory Visualization
The application SHALL display X (functional health) and D (structural damage) trajectories over time for all subsystems.

#### Scenario: Initial chart render
- **WHEN** simulation completes
- **THEN** a dual-axis line chart is displayed
- **AND** X values are plotted as solid lines (Cardio, Musc, Neuro)
- **AND** D values are plotted as dashed lines
- **AND** horizontal threshold lines (func_threshold, death_threshold) are shown
- **AND** vertical intervention marker shows intervention start age (if applicable)

#### Scenario: Interactive chart exploration
- **WHEN** user hovers over the chart
- **THEN** exact values (X, D, age) are shown in tooltip
- **AND** user can zoom and pan to inspect details
- **AND** chart remains performant (60fps interactions)

#### Scenario: Chart updates on parameter change
- **WHEN** user adjusts a parameter and simulation reruns
- **THEN** chart updates with new trajectory data
- **AND** Plotly handles smooth redraw animation
- **AND** previous data is replaced (no accumulation)

### Requirement: Subsystem Network Visualization
The application SHALL provide a network graph visualization showing the three subsystems and their coupling relationships.

#### Scenario: Static network display
- **WHEN** simulation results are available
- **THEN** a graph with 3 nodes (Cardio, Musc, Neuro) is rendered
- **AND** edges show coupling strength (from C_base matrix)
- **AND** node color/size reflects current X value (end state)

#### Scenario: Network interaction
- **WHEN** user hovers over a node
- **THEN** incoming and outgoing influences are highlighted
- **AND** tooltip shows current X and D values for that subsystem

**Note**: This requirement is optional for MVP; can be deferred if time-constrained.

### Requirement: Metrics Display
The application SHALL prominently display healthspan and lifespan metrics derived from simulation results.

#### Scenario: Metrics calculation and display
- **WHEN** simulation completes
- **THEN** healthspan (years until mean X < func_threshold) is displayed
- **AND** lifespan (years until mean X < death_threshold) is displayed
- **AND** both values are shown in years with one decimal precision

#### Scenario: Comparison to baseline
- **WHEN** an intervention (non-"none") is active
- **THEN** delta vs baseline is shown (e.g., "+8.7 years")
- **AND** delta is color-coded (green for positive, red for negative)

#### Scenario: Baseline metrics
- **WHEN** "none" intervention is selected
- **THEN** metrics are shown without delta
- **AND** these values serve as reference for other interventions

### Requirement: Responsive Performance
The application SHALL maintain responsive interactions and complete simulations within acceptable time budgets.

#### Scenario: Parameter update latency
- **WHEN** user adjusts a slider
- **THEN** simulation is triggered after 200ms debounce
- **AND** results are displayed within 300ms total (including render)
- **AND** UI remains interactive during execution

#### Scenario: Memory constraints
- **WHEN** application is running
- **THEN** total memory usage remains below 200MB
- **AND** repeated simulations do not leak memory

#### Scenario: Monte Carlo execution (optional)
- **WHEN** user triggers Monte Carlo mode (20 runs)
- **THEN** simulations execute within 2 seconds
- **AND** progress bar shows completion status
- **AND** mean trajectory with confidence bands is displayed

### Requirement: Model Documentation
The application SHALL provide inline documentation to help users understand model assumptions and equations.

#### Scenario: Equation tooltips
- **WHEN** user hovers over parameter labels or mechanism descriptions
- **THEN** relevant equations are shown in LaTeX-rendered format
- **AND** equations match those in systemic_rejuvenation.pdf

#### Scenario: Model overview
- **WHEN** user clicks "About" or "Model" link
- **THEN** a modal or panel explains:
  - Model purpose and design
  - Key assumptions (X, D, coupling, shocks)
  - Links to paper/repo

#### Scenario: Parameter interpretation
- **WHEN** user views parameter controls
- **THEN** each parameter has human-readable label and units
- **AND** biological interpretation is available via tooltip

### Requirement: Deployment Compatibility
The application SHALL deploy to Vercel as a static site with no backend requirements.

#### Scenario: Static export build
- **WHEN** running `npm run build`
- **THEN** Next.js generates static HTML/JS/CSS
- **AND** all routes are pre-rendered or client-side
- **AND** no server-side APIs are required

#### Scenario: Vercel deployment
- **WHEN** pushing to GitHub main branch
- **THEN** Vercel automatically builds and deploys
- **AND** application is accessible at custom domain or vercel.app subdomain
- **AND** service worker caches Pyodide assets

#### Scenario: Asset optimization
- **WHEN** application is deployed
- **THEN** JavaScript bundles are <500KB (gzipped)
- **AND** Pyodide files (~2-3MB) are served from CDN with caching headers
- **AND** initial page load completes within 5 seconds on average connection
