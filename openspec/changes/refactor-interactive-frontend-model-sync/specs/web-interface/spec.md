# Web Interface Specification (Delta)

## MODIFIED Requirements

### Requirement: Pyodide Integration
The web application SHALL run the Python aging_network simulation logic in the browser using Pyodide with NumPy support, and the executed model code SHALL be sourced from the repository’s `src/aging_network/` ground truth (not a separately maintained reimplementation).

#### Scenario: Initial load and engine initialization
- **WHEN** user visits the web application for the first time
- **THEN** Pyodide and NumPy are loaded (2-3s)
- **AND** the aging_network model bundle is loaded from `web/public/py/` and imported successfully
- **AND** a progress indicator shows loading status
- **AND** controls are disabled until initialization completes

#### Scenario: Cached subsequent loads
- **WHEN** user revisits the application with service worker active
- **THEN** Pyodide loads from cache (<1s)
- **AND** the model bundle loads from cache
- **AND** initialization completes faster than first load

#### Scenario: Simulation execution
- **WHEN** user triggers a simulation with current parameters
- **THEN** Pyodide executes `run_sim()` from the loaded aging_network bundle (not inlined model code)
- **AND** results are returned to JavaScript within 100-200ms
- **AND** UI remains responsive during execution

## ADDED Requirements

### Requirement: Model Provenance and Sync
The repository SHALL define an automated process that generates the browser-consumable aging_network model bundle from `src/aging_network/`, and the web build/dev workflow MUST fail if the bundle is out of sync.

#### Scenario: Syncing after changing the model
- **WHEN** a developer changes code under `src/aging_network/`
- **THEN** running the model sync command regenerates the bundle under `web/public/py/`
- **AND** a manifest records the source revision (git SHA if available) and file hashes

#### Scenario: Preventing silent drift
- **WHEN** the web app is built or started for development
- **THEN** the sync/check step runs automatically
- **AND** the build/start fails with a clear error if the bundle differs from `src/aging_network/`

### Requirement: Pyodide-Compatible Imports
The web-loaded aging_network bundle SHALL be importable in Pyodide without requiring `matplotlib` to be installed or loaded.

#### Scenario: Import simulation without plotting dependencies
- **WHEN** Pyodide imports the model bundle to run simulations
- **THEN** `aging_network.simulation` imports successfully without importing `matplotlib`

