# Parameter Calibration Specification

## ADDED Requirements

### Requirement: Data Loading and Preprocessing
The system SHALL load and preprocess longitudinal health datasets from standard aging studies into a standardized format compatible with model calibration.

#### Scenario: ELSA data loading
- **WHEN** user runs data loader on ELSA raw files
- **THEN** all waves are parsed correctly
- **AND** health measures are extracted (physical function, cognitive, biomarkers)
- **AND** output is standardized DataFrame with (subject_id, wave, age, measure_name, measure_value)
- **AND** missing data patterns are documented in summary report

#### Scenario: Multiple dataset support
- **WHEN** user loads different datasets (ELSA, HRS, UK Biobank)
- **THEN** all are converted to common format
- **AND** variable mappings are configurable (CSV mapping file)
- **AND** data quality checks are performed (outlier detection, missingness)

#### Scenario: Longitudinal structure validation
- **WHEN** preprocessing completes
- **THEN** each subject has time-ordered observations
- **AND** follow-up duration and wave spacing are computed
- **AND** subjects with insufficient data (< 2 waves) are flagged

### Requirement: Factor Analysis and Dimensionality Assessment
The system SHALL perform exploratory factor analysis to determine the optimal number of subsystems and identify candidate additional systems beyond the baseline three.

#### Scenario: Exploratory factor analysis
- **WHEN** user runs EFA on processed health data
- **THEN** EFA is performed for 2-8 factors
- **AND** scree plot shows variance explained vs number of factors
- **AND** factor loadings matrix shows which measures load on which factors
- **AND** optimal number of factors is suggested based on elbow criterion

#### Scenario: Subsystem interpretation
- **WHEN** EFA identifies N factors
- **THEN** factors are automatically labeled based on highest-loading variables
- **AND** user can inspect which health measures belong to each factor
- **AND** candidate subsystems are suggested (e.g., "Factor 4 loads on WBC, CRP → suggest immune system")

#### Scenario: Baseline model validation
- **WHEN** EFA is run on data
- **THEN** first 3 factors correspond to cardio, musculoskeletal, neurological domains
- **AND** variance explained by 3 factors is computed (should be > 60% for model validity)
- **AND** if < 60%, user is warned that baseline model may be insufficient

### Requirement: Coupling Matrix Estimation
The system SHALL estimate the empirical coupling structure between subsystems from longitudinal co-decline patterns and temporal precedence relationships.

#### Scenario: Cross-sectional coupling estimation
- **WHEN** user computes empirical coupling from data
- **THEN** correlation matrix between subsystem scores is calculated
- **AND** partial correlations (controlling for age, sex) are computed
- **AND** output is symmetric C_empirical matrix

#### Scenario: Temporal coupling (Granger causality)
- **WHEN** user tests for temporal precedence
- **THEN** Granger causality tests are performed for all subsystem pairs
- **AND** p-values indicate whether X_i at t predicts X_j at t+1 beyond X_j at t
- **AND** results suggest whether coupling is symmetric or directional

#### Scenario: Structural equation model estimation
- **WHEN** user fits SEM to estimate coupling
- **THEN** latent variables X_subsystem are defined with multiple indicators
- **AND** cross-loadings estimate coupling strengths
- **AND** model fit statistics (CFI, RMSEA) assess whether structure is plausible
- **AND** estimated coupling matrix with standard errors is returned

### Requirement: Mortality Driver Identification
The system SHALL identify which subsystems are most predictive of mortality through survival analysis and model-based attribution.

#### Scenario: Cox proportional hazards analysis
- **WHEN** user runs survival analysis with subsystem predictors
- **THEN** Cox model is fit with X_subsystem as time-varying covariates
- **AND** hazard ratios with 95% CI are computed for each subsystem
- **AND** statistical significance is tested (Wald tests, likelihood ratio)
- **AND** results show which subsystem(s) drive mortality risk

#### Scenario: Model-based death attribution
- **WHEN** user simulates deaths with calibrated model
- **THEN** each simulated death is attributed to subsystem that crossed death_threshold first
- **AND** attribution percentages are computed (e.g., "45% cardio, 35% neuro, 20% musc")
- **AND** results are compared to empirical hazard ratios for consistency

#### Scenario: Mediation analysis
- **WHEN** user tests for indirect mortality pathways
- **THEN** mediation analysis is performed (e.g., does X_immune → X_neuro → death?)
- **AND** direct and indirect effects are quantified
- **AND** critical paths to death are visualized

### Requirement: Subsystem Discovery and Model Comparison
The system SHALL systematically evaluate whether adding candidate subsystems improves model fit and predictive accuracy.

#### Scenario: Candidate subsystem evaluation
- **WHEN** user tests adding a new subsystem (e.g., immune)
- **THEN** model is extended from N to N+1 subsystems
- **AND** coupling matrix is expanded from N(N-1)/2 to (N+1)N/2 edges
- **AND** model is recalibrated with new structure
- **AND** fit metrics (AIC, BIC, C-index) are compared to baseline

#### Scenario: Best subset selection
- **WHEN** user runs model comparison across multiple candidate subsystems
- **THEN** all 2^K combinations are tested (where K is number of candidates)
- **AND** cross-validation is performed for each variant
- **AND** results are ranked by out-of-sample C-index
- **AND** complexity-penalized metrics (AICc) are also reported

#### Scenario: Decision rule application
- **WHEN** model comparison completes
- **THEN** subsystems are added if ΔC-index > 0.02 AND ΔAICc < -10
- **AND** recommendation is provided ("Add immune system: ΔC-index = 0.03, ΔAICc = -15")
- **AND** marginal subsystems are flagged ("Metabolic adds little: ΔC-index = 0.005")

### Requirement: Functional Form Testing
The system SHALL test alternative mathematical forms for recovery, damage, and coupling functions against the baseline specifications.

#### Scenario: Recovery function comparison
- **WHEN** user tests alternative recovery functions
- **THEN** baseline (linear in X, power-law in D) is compared to alternatives:
  - Power-law in X
  - Threshold-based (recovery stops below X_min)
  - Logarithmic saturation
- **AND** each form is fit to data via optimization
- **AND** AIC, trajectory RMSE, and residual diagnostics are compared

#### Scenario: Damage accumulation alternatives
- **WHEN** user tests whether damage can reverse
- **THEN** models with reversible D (dD/dt can be negative) are compared to baseline
- **AND** fit to intervention trial data is assessed (does reversible D explain recovery?)
- **AND** biological plausibility is evaluated

#### Scenario: Shock necessity test
- **WHEN** user tests model with vs without stochastic shocks
- **THEN** variance decomposition shows contribution of shocks to dX/dt variance
- **AND** model without shocks is fit (smooth decay only)
- **AND** comparison shows whether shocks significantly improve fit

### Requirement: Parameter Optimization
The system SHALL calibrate all model parameters (coupling matrix, recovery rates, decay rates, damage parameters) through constrained multi-objective optimization.

#### Scenario: Coupling-first calibration
- **WHEN** user initiates calibration
- **THEN** coupling matrix C is optimized first to match empirical C_empirical
- **AND** optimization uses Frobenius norm loss: ||C_model - C_empirical||_F
- **AND** constraints enforce symmetry (if no directionality) and non-negativity

#### Scenario: Joint optimization
- **WHEN** user runs full calibration
- **THEN** multi-objective loss function is minimized:
  - Trajectory RMSE (match observed X, D over time)
  - Coupling fit (match C_empirical)
  - Mortality C-index (match survival predictions)
- **AND** parameter bounds enforce biological plausibility
- **AND** regularization penalties prevent overfitting

#### Scenario: Uncertainty quantification
- **WHEN** calibration completes
- **THEN** bootstrap resampling (100 iterations) estimates parameter uncertainty
- **AND** 95% confidence intervals are reported for all parameters
- **AND** parameters with wide CIs (>50% relative width) are flagged as poorly identified

### Requirement: Model Validation
The system SHALL validate calibrated models through multiple criteria including trajectory fit, coupling structure, mortality prediction, and out-of-sample generalization.

#### Scenario: In-sample validation
- **WHEN** model is calibrated on training data
- **THEN** trajectory RMSE is computed per subsystem and age group
- **AND** coupling matrix fit is assessed (correlation with C_empirical)
- **AND** mortality C-index is computed on training data
- **AND** residual diagnostics check for systematic biases

#### Scenario: Out-of-sample validation
- **WHEN** model is validated on held-out test data
- **THEN** same metrics are computed on test set
- **AND** degradation in performance (train vs test) is quantified
- **AND** if C-index drops by >0.05, model is flagged as potentially overfit

#### Scenario: Cross-dataset validation
- **WHEN** model calibrated on ELSA is tested on HRS
- **THEN** coupling matrix is fixed at ELSA-estimated values
- **AND** trajectory fit and mortality C-index are computed on HRS data
- **AND** transferability is assessed (does C generalize across populations?)

#### Scenario: Intervention validation
- **WHEN** RCT data with interventions is available
- **THEN** model is used to predict intervention effects
- **AND** predicted healthspan/lifespan gains are compared to observed
- **AND** coupling-mediated cross-subsystem benefits are validated

### Requirement: Iterative Refinement Workflow
The system SHALL support an iterative research workflow where model structure and functional forms are refined based on validation results.

#### Scenario: Baseline iteration
- **WHEN** user starts calibration research program
- **THEN** 3-subsystem baseline model is fit and validated
- **AND** residual analysis identifies systematic misfits
- **AND** recommendations for refinement are generated (e.g., "High residuals at age 75+; suggest adding subsystem")

#### Scenario: Structure refinement iteration
- **WHEN** user adds a candidate subsystem based on iteration 1
- **THEN** model is recalibrated with expanded structure
- **AND** improvement is quantified (Δ C-index, Δ AIC)
- **AND** if improvement is insufficient (<0.02), candidate is rejected

#### Scenario: Functional form refinement iteration
- **WHEN** residuals suggest functional form misspecification
- **THEN** alternative forms are tested systematically
- **AND** best-fitting form is selected via model comparison
- **AND** final model uses refined functional form

#### Scenario: Convergence check
- **WHEN** multiple iterations have been performed
- **THEN** stopping criterion is checked (no improvement >2% in out-of-sample C-index)
- **AND** if converged, final model is saved
- **AND** full provenance (all iterations, decisions) is documented

### Requirement: Calibrated Model Management
The system SHALL store and version calibrated models with full metadata including discovery process, validation metrics, and uncertainty quantification.

#### Scenario: Model saving with metadata
- **WHEN** calibration completes
- **THEN** model is saved as JSON with:
  - Subsystem list (baseline or expanded)
  - Coupling matrix with CIs
  - All other parameters with CIs
  - Validation metrics (in-sample, out-of-sample, cross-dataset)
  - Discovery process log (iterations, decisions)
  - Dataset used for calibration

#### Scenario: Model loading for simulation
- **WHEN** user loads a calibrated model
- **THEN** model can be used directly in run_sim()
- **AND** all parameters are correctly initialized
- **AND** metadata is accessible for reference

#### Scenario: Model comparison catalog
- **WHEN** multiple calibrated models exist
- **THEN** catalog view shows all models with key metrics
- **AND** user can compare models side-by-side
- **AND** recommended model (best out-of-sample performance) is highlighted

### Requirement: Reproducibility and Documentation
The system SHALL provide complete documentation of the calibration methodology, data sources, and preprocessing steps to enable reproducibility.

#### Scenario: Calibration workflow documentation
- **WHEN** calibration is performed
- **THEN** all steps are logged (data loading, preprocessing, EFA, optimization)
- **AND** random seeds are recorded for reproducibility
- **AND** computational environment (package versions) is saved

#### Scenario: Data provenance tracking
- **WHEN** model is calibrated
- **THEN** dataset source, version, and access date are recorded
- **AND** preprocessing choices (imputation method, outlier thresholds) are documented
- **AND** sample size and demographics are summarized

#### Scenario: Methods report generation
- **WHEN** user requests calibration report
- **THEN** automated report is generated with:
  - Research questions and findings
  - Model comparison table
  - Validation metrics
  - Figures (coupling matrix heatmap, trajectory fits, survival curves)
  - Interpretation and recommendations
- **AND** report is publication-ready (LaTeX or Markdown format)

### Requirement: Performance and Scalability
The system SHALL complete calibration workflows within reasonable time bounds for research use and handle datasets with thousands of subjects and multiple waves.

#### Scenario: Data loading performance
- **WHEN** loading dataset with 10,000 subjects, 5 waves, 50 variables
- **THEN** preprocessing completes within 5 minutes
- **AND** memory usage stays below 4GB

#### Scenario: Single optimization performance
- **WHEN** running one parameter optimization
- **THEN** convergence is reached within 10 minutes
- **AND** progress is displayed (iteration count, current loss)

#### Scenario: Full research program performance
- **WHEN** running complete calibration research program (baseline + 3 candidate subsystems + functional forms)
- **THEN** total runtime is under 8 hours (with parallelization)
- **AND** intermediate results are cached (avoid recomputation)

#### Scenario: Parallel evaluation
- **WHEN** testing multiple model variants
- **THEN** evaluations are parallelized across available CPU cores
- **AND** speedup scales linearly with core count (up to number of variants)
