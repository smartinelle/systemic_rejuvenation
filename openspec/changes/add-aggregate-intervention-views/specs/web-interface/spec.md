# Web Interface Specification (Delta)

## ADDED Requirements

### Requirement: Cached Simulations Per Intervention
The UI SHALL cache one simulation result per intervention for the current configuration and reuse it when the user switches views/tabs.

#### Scenario: Switching interventions without config change
- **WHEN** the user switches from one intervention to another without changing parameters
- **THEN** the UI reuses the cached result for that intervention
- **AND** no new Pyodide run is triggered

#### Scenario: Config change invalidates cache
- **WHEN** the user changes any simulation or intervention parameter
- **THEN** cached results for all interventions are invalidated
- **AND** the system reruns each intervention once to refresh the cache
- **AND** progress is shown while rerunning

### Requirement: Aggregate Overlay Chart
The UI SHALL provide an aggregate overlay chart showing mean functional health trajectories for all interventions concurrently.

#### Scenario: Overlay of all interventions
- **WHEN** cached results are available for all interventions
- **THEN** the overlay chart renders mean_X vs age for each intervention with distinct colors
- **AND** functional and death thresholds are shown as horizontal reference lines
- **AND** healthspan/lifespan markers for each intervention are displayed as vertical lines with matching colors

### Requirement: Aggregate Summary Panel
The UI SHALL display a summary panel of key metrics for all interventions without re-running simulations.

#### Scenario: Summary uses cached results
- **WHEN** cached results exist
- **THEN** the summary panel shows at least mean health (time-averaged mean_X), healthspan, and lifespan per intervention
- **AND** no additional Pyodide execution is triggered to populate the panel

## MODIFIED Requirements

### Requirement: Responsive Performance
The application SHALL maintain responsive interactions and complete simulations within acceptable time budgets.

#### Scenario: Parameter update latency
- **WHEN** the user adjusts a parameter
- **THEN** simulations for all interventions are scheduled once (debounced) for the new config
- **AND** cached results are reused until new runs complete
- **AND** UI remains responsive during execution

#### Scenario: Memory constraints
- **WHEN** the application is running with cached results for all interventions
- **THEN** total memory usage remains below 200MB
- **AND** stale caches are discarded on config change

