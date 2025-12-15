# Change: Add Data-Driven Parameter Calibration

## Why
Current model parameters are hand-tuned based on biological intuition. To improve model realism and predictive accuracy, we need data-driven calibration against real-world health trajectories from longitudinal studies. This enables validation of model assumptions, identification of biologically plausible parameter ranges, and potential personalization for different populations.

## What Changes
- Add data ingestion pipeline for longitudinal health datasets (UK Biobank, NHANES, ELSA)
- Implement parameter estimation using optimization algorithms (scipy, optuna)
- Create validation framework with goodness-of-fit metrics
- Add visualization tools for comparing model output to real data
- Support for population-level vs individual-level calibration
- Document data sources, preprocessing steps, and calibration methodology

## Impact
- Affected specs: `parameter-calibration` (new capability)
- Affected code:
  - New: `data/` directory for raw and processed datasets
  - New: `src/aging_network/calibration.py` - parameter estimation module
  - New: `src/aging_network/data_loader.py` - dataset ingestion utilities
  - New: `src/aging_network/validation.py` - goodness-of-fit metrics
  - New: `notebooks/03_calibration.ipynb` - calibration workflow
  - Modified: `src/aging_network/config.py` - add calibrated parameter sets
- Dependencies: scipy (optimization), optuna (optional, hyperparameter tuning), pandas (data handling), scikit-learn (metrics)
- Data requirements: Access to longitudinal health datasets (public or restricted-access)
