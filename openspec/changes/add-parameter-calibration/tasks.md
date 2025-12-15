# Implementation Tasks

## Phase 0: Data Infrastructure (1 week)

### Data Acquisition
- [ ] 0.1 Document data access procedures for ELSA, HRS, UK Biobank
- [ ] 0.2 Create data access guide (`data/README.md`) with registration links and requirements
- [ ] 0.3 Define standard data format specification (CSV schema documentation)

### Data Loading Module
- [ ] 0.4 Create `src/aging_network/data_loader.py` module
- [ ] 0.5 Implement `load_elsa()` function for parsing ELSA raw files
- [ ] 0.6 Implement `load_hrs()` function for parsing HRS raw files
- [ ] 0.7 Implement `load_custom_csv()` for user-provided datasets
- [ ] 0.8 Add missing data handling (flagging, imputation options)
- [ ] 0.9 Implement data quality checks (outlier detection, consistency validation)

### Preprocessing Pipeline
- [ ] 0.10 Create preprocessing script `scripts/preprocess_elsa.py`
- [ ] 0.11 Implement longitudinal structure validation (time-ordering, wave spacing)
- [ ] 0.12 Add variable mapping configuration (CSV config file for measure names)
- [ ] 0.13 Implement standardized output format (subject, wave, age, measure, value)
- [ ] 0.14 Create data summary reports (sample size, follow-up duration, missingness)

### Testing
- [ ] 0.15 Create synthetic test dataset mimicking ELSA structure
- [ ] 0.16 Write unit tests for data loader functions
- [ ] 0.17 Validate preprocessing on real ELSA data (if available)

## Phase 1: Exploratory Analysis (2 weeks)

### Factor Analysis
- [ ] 1.1 Create `src/aging_network/exploratory.py` module
- [ ] 1.2 Implement `run_efa()` function using sklearn FactorAnalysis
- [ ] 1.3 Add scree plot generation (variance explained vs number of factors)
- [ ] 1.4 Implement factor loading matrix visualization (heatmap)
- [ ] 1.5 Add automatic factor labeling based on highest loadings
- [ ] 1.6 Implement optimal factor number suggestion (elbow criterion, parallel analysis)

### Coupling Structure Estimation
- [ ] 1.7 Implement `compute_correlation_matrix()` for cross-sectional correlations
- [ ] 1.8 Add partial correlation computation (controlling for covariates)
- [ ] 1.9 Implement Granger causality tests (`granger_causality_all_pairs()`)
- [ ] 1.10 Add SEM-based coupling estimation using semopy or lavaan (R bridge)
- [ ] 1.11 Create `estimate_coupling_empirical()` wrapper function
- [ ] 1.12 Implement coupling matrix visualization (heatmap with significance stars)

### Mortality Analysis
- [ ] 1.13 Implement Cox proportional hazards models using lifelines
- [ ] 1.14 Add `survival_analysis_subsystems()` function
- [ ] 1.15 Create hazard ratio forest plot visualization
- [ ] 1.16 Implement mediation analysis for indirect mortality pathways
- [ ] 1.17 Add critical path identification (which subsystem failures are terminal)

### Research Notebook
- [ ] 1.18 Create `notebooks/00_coupling_research.ipynb`
- [ ] 1.19 Document RQ1: Subsystem correlation structure analysis
- [ ] 1.20 Document RQ2: Temporal coupling dynamics (Granger causality)
- [ ] 1.21 Document RQ3: Mortality driver identification
- [ ] 1.22 Document RQ4: Intervention effect pathways (if data available)
- [ ] 1.23 Generate figures for all research questions
- [ ] 1.24 Write interpretations and recommendations for next phases

## Phase 2: Subsystem Discovery (3 weeks)

### Model Comparison Framework
- [ ] 2.1 Create `src/aging_network/model_comparison.py` module
- [ ] 2.2 Implement `ModelVariant` class to represent different model structures
- [ ] 2.3 Add `fit_model_variant()` function for calibrating variants
- [ ] 2.4 Implement `compare_models()` for AIC/BIC/C-index comparison
- [ ] 2.5 Create comparison table generator (pandas DataFrame output)

### Subsystem Discovery Functions
- [ ] 2.6 Implement `suggest_candidate_subsystems()` based on EFA results
- [ ] 2.7 Add `evaluate_candidate_subsystem()` for single-subsystem addition
- [ ] 2.8 Implement best subset selection with cross-validation
- [ ] 2.9 Add decision rule application (ΔC-index > 0.02, ΔAICc < -10)
- [ ] 2.10 Create recommendation generator ("Add X subsystem: metrics...")

### Extended Model Support
- [ ] 2.11 Modify `src/aging_network/config.py` to support N subsystems (not hardcoded 3)
- [ ] 2.12 Update `src/aging_network/model.py` to handle variable-size coupling matrix
- [ ] 2.13 Extend `src/aging_network/interventions.py` for N-subsystem interventions
- [ ] 2.14 Update plotting functions to handle N subsystems

### Candidate Subsystems
- [ ] 2.15 Define immune subsystem proxies (WBC, CRP, infection history)
- [ ] 2.16 Define metabolic subsystem proxies (HbA1c, lipids, BMI)
- [ ] 2.17 Define renal subsystem proxies (eGFR, creatinine)
- [ ] 2.18 Define hepatic subsystem proxies (liver enzymes, albumin)
- [ ] 2.19 Test each candidate systematically

### Discovery Notebook
- [ ] 2.20 Create `notebooks/01_subsystem_discovery.ipynb`
- [ ] 2.21 Document baseline 3-subsystem model fit
- [ ] 2.22 Document candidate subsystem evaluation results
- [ ] 2.23 Visualize model comparison (AIC vs C-index scatter)
- [ ] 2.24 Recommend optimal model structure

## Phase 3: Functional Form Testing (2 weeks)

### Alternative Functions Module
- [ ] 3.1 Create `src/aging_network/functional_forms.py` module
- [ ] 3.2 Define `RecoveryFunction` base class with `compute()` method
- [ ] 3.3 Implement `LinearRecovery` (baseline)
- [ ] 3.4 Implement `PowerLawRecovery` alternative
- [ ] 3.5 Implement `ThresholdRecovery` alternative
- [ ] 3.6 Define `DamageFunction` base class
- [ ] 3.7 Implement `LinearDamage` (baseline)
- [ ] 3.8 Implement `NonlinearDamage` (quadratic in X)
- [ ] 3.9 Implement `ReversibleDamage` (allows dD/dt < 0)

### Shock Model Variants
- [ ] 3.10 Implement `NoShockModel` (smooth decay only)
- [ ] 3.11 Implement `HeavyTailedShockModel` (Pareto shocks)
- [ ] 3.12 Add shock model comparison utilities

### Model Integration
- [ ] 3.13 Modify `src/aging_network/model.py` to accept functional form objects
- [ ] 3.14 Update `step()` function to dispatch to chosen functional forms
- [ ] 3.15 Ensure backward compatibility (default to baseline forms)

### Testing Framework
- [ ] 3.16 Implement `test_functional_form()` wrapper
- [ ] 3.17 Add residual diagnostics (QQ plots, residual vs fitted)
- [ ] 3.18 Create model comparison report for functional forms

### Testing Notebook
- [ ] 3.19 Create `notebooks/02_functional_form_testing.ipynb`
- [ ] 3.20 Test recovery function alternatives
- [ ] 3.21 Test damage function alternatives
- [ ] 3.22 Test shock model necessity
- [ ] 3.23 Recommend best functional forms

## Phase 4: Calibration Engine (2 weeks)

### Optimization Module
- [ ] 4.1 Create `src/aging_network/calibration.py` module
- [ ] 4.2 Implement `ObjectiveFunction` class for multi-objective loss
- [ ] 4.3 Add trajectory RMSE component
- [ ] 4.4 Add coupling matrix fit component (Frobenius norm)
- [ ] 4.5 Add mortality C-index component
- [ ] 4.6 Implement loss function weighting configuration

### Calibration Functions
- [ ] 4.7 Implement `calibrate_coupling_matrix()` (C-only optimization)
- [ ] 4.8 Implement `calibrate_system_params()` (recovery/decay rates)
- [ ] 4.9 Implement `calibrate_full_model()` (joint optimization)
- [ ] 4.10 Add parameter bounds specification (biological plausibility)
- [ ] 4.11 Implement regularization (L1 for sparsity, L2 for smoothness)

### Optimization Algorithms
- [ ] 4.12 Integrate scipy.optimize.minimize (L-BFGS-B)
- [ ] 4.13 Add multi-start optimization (Latin hypercube sampling)
- [ ] 4.14 Implement CMA-ES alternative (optional, for robustness)
- [ ] 4.15 Add progress logging and checkpointing

### Uncertainty Quantification
- [ ] 4.16 Implement `bootstrap_uncertainty()` function
- [ ] 4.17 Add confidence interval computation (95% CI)
- [ ] 4.18 Implement parameter identifiability diagnostics
- [ ] 4.19 Create uncertainty visualization (violin plots for parameters)

### Calibration Notebook
- [ ] 4.20 Create `notebooks/03_calibration.ipynb`
- [ ] 4.21 Document calibration workflow with examples
- [ ] 4.22 Show parameter convergence plots
- [ ] 4.23 Display uncertainty quantification results

## Phase 5: Validation Framework (1 week)

### Validation Module
- [ ] 5.1 Create `src/aging_network/validation.py` module
- [ ] 5.2 Implement `compute_trajectory_rmse()` per subsystem and age group
- [ ] 5.3 Implement `compute_coupling_fit()` (correlation with C_empirical)
- [ ] 5.4 Implement `compute_mortality_cindex()` using concordance_index from lifelines
- [ ] 5.5 Add residual diagnostics functions (residual plots, QQ plots)

### Cross-Validation
- [ ] 5.6 Implement `cross_validate_temporal()` (train on early waves, test on late)
- [ ] 5.7 Implement `cross_validate_random()` (random train/test split)
- [ ] 5.8 Implement `cross_validate_dataset()` (train on ELSA, test on HRS)
- [ ] 5.9 Add cross-validation result aggregation (mean + CI across folds)

### Intervention Validation
- [ ] 5.10 Implement `validate_intervention_effects()` (if RCT data available)
- [ ] 5.11 Compare predicted vs observed healthspan gains
- [ ] 5.12 Test coupling-mediated cross-subsystem benefits

### Validation Reports
- [ ] 5.13 Implement `generate_validation_report()` function
- [ ] 5.14 Create report template with all metrics
- [ ] 5.15 Add visualization gallery (trajectory fits, survival curves, coupling heatmap)

### Validation Notebook
- [ ] 5.16 Create `notebooks/04_validation.ipynb`
- [ ] 5.17 Document in-sample validation results
- [ ] 5.18 Document out-of-sample validation results
- [ ] 5.19 Document cross-dataset validation results
- [ ] 5.20 Generate publication-quality figures

## Phase 6: Iterative Refinement Workflow (1 week)

### Iteration Management
- [ ] 6.1 Create `src/aging_network/iteration.py` module
- [ ] 6.2 Implement `IterationTracker` class to log all iterations
- [ ] 6.3 Add `run_baseline_iteration()` wrapper function
- [ ] 6.4 Add `run_structure_iteration()` for subsystem addition
- [ ] 6.5 Add `run_functional_form_iteration()` for form testing
- [ ] 6.6 Implement convergence check (stopping criterion)

### Recommendation Engine
- [ ] 6.7 Implement `analyze_residuals()` to identify systematic misfits
- [ ] 6.8 Add `recommend_refinements()` based on residuals
- [ ] 6.9 Create decision tree for refinement suggestions

### Provenance Tracking
- [ ] 6.10 Implement full provenance logging (all iterations, decisions, metrics)
- [ ] 6.11 Add iteration comparison view (side-by-side metrics)
- [ ] 6.12 Create iteration history visualization (timeline with key decisions)

### Research Program Notebook
- [ ] 6.13 Create `notebooks/05_full_research_program.ipynb`
- [ ] 6.14 Document complete end-to-end workflow
- [ ] 6.15 Show all iterations with rationale for decisions
- [ ] 6.16 Present final model with full validation

## Phase 7: Model Management (1 week)

### Storage and Versioning
- [ ] 7.1 Define calibrated model JSON schema
- [ ] 7.2 Implement `save_calibrated_model()` function with full metadata
- [ ] 7.3 Implement `load_calibrated_model()` function
- [ ] 7.4 Add model versioning (semantic versioning for model schema)
- [ ] 7.5 Create model catalog (`data/calibrated/catalog.json`)

### Model Comparison Tools
- [ ] 7.6 Implement `list_calibrated_models()` with summary table
- [ ] 7.7 Add `compare_calibrated_models()` side-by-side view
- [ ] 7.8 Implement `recommend_model()` based on use case (best C-index, most recent, etc.)

### API Integration
- [ ] 7.9 Update `run_sim()` to accept calibrated model name
- [ ] 7.10 Add `run_sim_with_calibrated()` convenience function
- [ ] 7.11 Update documentation with calibrated model usage examples

### Pre-Calibrated Models
- [ ] 7.12 Calibrate baseline model on ELSA (if data available)
- [ ] 7.13 Save as `data/calibrated/elsa_baseline.json`
- [ ] 7.14 Document model provenance and validation metrics
- [ ] 7.15 Include in package distribution (optional)

## Phase 8: Documentation and Reproducibility (1 week)

### User Documentation
- [ ] 8.1 Write `docs/calibration_guide.md` with overview and examples
- [ ] 8.2 Document data requirements and access procedures
- [ ] 8.3 Create tutorial: "Calibrating on your own dataset"
- [ ] 8.4 Document all exploratory analysis functions (API reference)
- [ ] 8.5 Document calibration workflow step-by-step

### Methods Documentation
- [ ] 8.6 Write `docs/calibration_methods.md` with technical details
- [ ] 8.7 Document EFA procedure and interpretation
- [ ] 8.8 Document coupling estimation methods (correlations, Granger, SEM)
- [ ] 8.9 Document optimization algorithm and hyperparameters
- [ ] 8.10 Document validation methodology

### Reproducibility
- [ ] 8.11 Create requirements file with exact package versions (`requirements_calibration.txt`)
- [ ] 8.12 Add random seed management (configuration file)
- [ ] 8.13 Create reproducibility checklist
- [ ] 8.14 Document computational environment (OS, hardware)

### Publication Materials
- [ ] 8.15 Draft methods section for publication
- [ ] 8.16 Generate all publication-quality figures
- [ ] 8.17 Create supplementary materials (detailed results tables)
- [ ] 8.18 Write model interpretation guide

### Package Integration
- [ ] 8.19 Update main README.md with calibration capabilities
- [ ] 8.20 Add calibration example to quickstart guide
- [ ] 8.21 Update pyproject.toml with new dependencies
- [ ] 8.22 Create optional dependency group [calibration]

## Phase 9: Testing and Quality Assurance (1 week)

### Unit Tests
- [ ] 9.1 Write tests for data_loader.py functions
- [ ] 9.2 Write tests for exploratory.py functions
- [ ] 9.3 Write tests for calibration.py functions
- [ ] 9.4 Write tests for validation.py functions
- [ ] 9.5 Write tests for model_comparison.py functions

### Integration Tests
- [ ] 9.6 Create end-to-end test with synthetic data
- [ ] 9.7 Test full calibration pipeline
- [ ] 9.8 Test model saving and loading round-trip
- [ ] 9.9 Test cross-validation workflows

### Performance Tests
- [ ] 9.10 Benchmark data loading time (10k subjects)
- [ ] 9.11 Benchmark single optimization runtime
- [ ] 9.12 Test parallelization speedup
- [ ] 9.13 Profile memory usage

### Validation on Real Data
- [ ] 9.14 Run full pipeline on ELSA data (if available)
- [ ] 9.15 Verify all metrics are computed correctly
- [ ] 9.16 Check results against published literature values
- [ ] 9.17 Identify and fix any issues

## Phase 10: Advanced Features (Optional)

### Bayesian Calibration
- [ ] 10.1 Implement MCMC-based parameter estimation (PyMC or emcee)
- [ ] 10.2 Add posterior distribution visualization
- [ ] 10.3 Compare to maximum likelihood results

### Hierarchical Modeling
- [ ] 10.4 Implement population-level + individual-level calibration
- [ ] 10.5 Add random effects for between-subject heterogeneity

### Sensitivity Analysis
- [ ] 10.6 Implement global sensitivity analysis (Sobol indices)
- [ ] 10.7 Identify which parameters drive outcomes most

### Interactive Calibration Tool
- [ ] 10.8 Create Streamlit app for calibration exploration
- [ ] 10.9 Add interactive parameter adjustment with live model fit

## Validation Checklist

After implementation, verify:
- [ ] Data loader works with ELSA, HRS, and custom CSV format
- [ ] EFA correctly identifies 3 baseline factors in real data
- [ ] Coupling matrix estimation matches literature correlations (±0.05)
- [ ] Survival analysis produces sensible hazard ratios
- [ ] Model comparison correctly ranks models by C-index
- [ ] Calibration improves fit over hand-tuned parameters (C-index > +0.05)
- [ ] Uncertainty quantification produces non-degenerate CIs
- [ ] Cross-validation shows model generalizes (out-of-sample C-index > 0.65)
- [ ] Calibrated models save/load without errors
- [ ] Full research program completes in < 8 hours
- [ ] Documentation is clear and reproducible
- [ ] All notebooks run without errors

## Notes

- **Phases 0-5** are core functionality (~8 weeks)
- **Phases 6-9** are refinement and documentation (~4 weeks)
- **Phase 10** is optional advanced features (ongoing)
- **Dependencies**: scipy, numpy, pandas, lifelines, scikit-learn, matplotlib, seaborn, semopy (optional)
- **Data access**: ELSA/HRS require registration; provide clear instructions
- **Parallelization**: Use joblib or multiprocessing for model comparison
- **Random seeds**: Set seeds for reproducibility (numpy, scipy, sklearn)
