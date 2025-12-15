# Design: Data-Driven Model Discovery and Calibration

## Context
The aging network model is a **hypothesis about systemic aging**: that functional health (X) and structural damage (D) interact across coupled subsystems, with specific functional forms for recovery, decay, and damage accumulation. This capability treats parameter calibration as **systematic model discovery**:

1. **Validate** the 3-subsystem baseline (cardio, musculoskeletal, neurological)
2. **Discover** whether additional subsystems improve fit (data-driven model expansion)
3. **Test** the functional form of aging equations (are recovery/damage functions correct?)
4. **Calibrate** all parameters (coupling, rates, distributions) jointly

This is a **research program**, not just parameter fitting. The goal is to let data guide model refinement while maintaining interpretability.

## Goals / Non-Goals

### Goals
- **Validate** 3-subsystem model against longitudinal data
- **Systematically discover** additional subsystems that improve predictions (immune, endocrine, metabolic, etc.)
- **Test functional forms**: Are linear recovery, exponential decay, shock-based damage the right mechanisms?
- **Calibrate** coupling matrix C (core novelty) + all other parameters
- **Identify** which subsystem(s) drive mortality
- Provide **reproducible methodology** for model refinement

### Non-Goals
- Real-time calibration (research workflow, not interactive)
- Black-box predictions (maintain mechanistic interpretability)
- Clinical deployment (research tool)

## Research Questions (Hierarchical)

### Level 1: Baseline Model Validation
**RQ1.1**: Do the 3 subsystems (cardio, musculoskeletal, neuro) exhibit systemic coupling in real data?
- Approach: Correlation analysis, Granger causality, SEM
- Metric: Coupling strength, temporal precedence

**RQ1.2**: Which subsystem drives mortality?
- Approach: Survival analysis (Cox models), mediation analysis
- Metric: Hazard ratios, attributable risk

**RQ1.3**: Do calibrated parameters recover known aging phenomena (compression of morbidity, heterogeneity)?
- Approach: Simulate with calibrated params, compare distributional properties
- Metric: Healthspan/lifespan variance, Gini coefficient

### Level 2: Model Structure Discovery
**RQ2.1**: Are there additional subsystems that explain residual variance?
- Approach: Factor analysis on multi-domain health data, identify latent factors beyond X_c, X_m, X_n
- Metric: Variance explained, predictive improvement

**RQ2.2**: Which candidate subsystems improve mortality prediction?
- Approach: Add candidate systems (immune, endocrine, metabolic) individually; test ΔC-index
- Metric: Model comparison (AIC, BIC, cross-validated C-index)

**RQ2.3**: Is there evidence for higher-order interactions (beyond pairwise coupling)?
- Approach: Test 3-way interaction terms, nonlinear coupling
- Metric: Likelihood ratio test, residual analysis

### Level 3: Functional Form Testing
**RQ3.1**: Is the recovery function correctly specified?
- Current: Linear in X, nonlinear in D
- Test: Try alternative forms (power-law, logarithmic thresholds)
- Metric: Trajectory fit improvement, biological plausibility

**RQ3.2**: Is damage accumulation monotonic or can it reverse?
- Current: D only increases
- Test: Allow partial D recovery (e.g., with interventions)
- Metric: Intervention trial fit

**RQ3.3**: Are shocks necessary, or is smooth decay sufficient?
- Current: Stochastic shocks + smooth decay
- Test: Model with/without shocks
- Metric: Variance explained in year-to-year changes

## Systematic Model Discovery Pipeline

```
Data → Baseline Validation → Subsystem Discovery → Functional Form Testing → Final Calibration
  │         (RQ1)                  (RQ2)                   (RQ3)                   │
  └─────────────────────────────────────────────────────────────────────────────┘
                           Iterative Refinement Loop
```

## Decisions

### 1. Target Datasets
**Decision**: Multi-domain longitudinal studies with rich phenotyping

**Primary**:
1. **ELSA (English Longitudinal Study of Ageing)** - Comprehensive, long follow-up
2. **HRS (Health and Retirement Study)** - Large US sample, validation
3. **UK Biobank** (if accessible) - Deep phenotyping (imaging, biomarkers, genetics)

**Variables required**:
- **Core 3 subsystems**:
  - Cardio: BP, HR, grip (CV fitness), ECG abnormalities
  - Musculoskeletal: Grip strength, gait speed, chair stands, lean mass
  - Neurological: Cognitive tests (memory, executive, processing speed), reaction time

- **Candidate subsystems** (for discovery):
  - Immune: WBC count, CRP, IL-6, infection history
  - Endocrine: Thyroid function, cortisol, DHEA, sex hormones
  - Metabolic: HbA1c, lipids, BMI, insulin resistance
  - Renal: eGFR, creatinine, albuminuria
  - Hepatic: Liver enzymes, albumin

- **Mortality**: Time-to-event, cause of death

### 2. Observable Proxies and Latent Variable Models
**Decision**: Use factor analysis to map from rich observations to latent X, D per subsystem

**Challenge**: Model has latent X (function) and D (damage), but we observe noisy proxies

**Approach**:
1. **Per-subsystem factor analysis**:
   - Cardio: X_c ← f(BP, HR, grip, walk test), D_c ← f(HTN diagnosis, MI history)
   - Musc: X_m ← f(grip, gait, chair), D_m ← f(arthritis, sarcopenia)
   - Neuro: X_n ← f(cognitive tests), D_n ← f(dementia diagnosis, MRI lesions if available)

2. **Measurement model**:
   - Use confirmatory factor analysis (CFA) to estimate X, D from multiple indicators
   - Propagate measurement uncertainty into calibration

3. **Dimensionality check**:
   - Run exploratory factor analysis (EFA) on ALL health measures
   - How many factors emerge? 3 (baseline model), or more?
   - If more, identify candidate subsystems

**Output**: Not just 3 Xs and 3 Ds, but a data-driven assessment of optimal dimensionality

### 3. Subsystem Discovery Methodology
**Decision**: Systematic evaluation of candidate subsystems

**Step 1: Exploratory Factor Analysis**
```python
from sklearn.decomposition import FactorAnalysis
from aging_network.exploratory import run_efa

# Run EFA on all health measures
efa_results = run_efa(health_data, n_factors=range(2, 10))
# Output: Scree plot, factor loadings
# Question: How many factors are interpretable and stable?
```

**Step 2: Candidate Subsystem Evaluation**
For each candidate (immune, endocrine, metabolic, renal, hepatic):
1. Add subsystem to model (now 4 nodes instead of 3)
2. Re-calibrate with expanded coupling matrix C (6 edges → 10 edges)
3. Compare fit:
   - Trajectory RMSE (in-sample and out-of-sample)
   - Mortality C-index
   - Model complexity penalty (AIC, BIC)

**Step 3: Best Subset Selection**
- Try all combinations (3-subsystem, 4-subsystem with immune, 4-subsystem with metabolic, 5-subsystem, etc.)
- Use cross-validation to avoid overfitting
- Select model with best out-of-sample performance

**Decision rule**: Add subsystem if:
- Δ C-index > 0.02 (meaningful mortality prediction improvement)
- ΔAICc < -10 (substantial model fit improvement accounting for complexity)
- Coupling to existing subsystems is significant (not independent)

**Example result**: "4-subsystem model (cardio, musc, neuro, immune) improves C-index by 0.03 and reduces AICc by 15. Immune-neuro coupling (C_in) = 0.14 is strongest new edge."

### 4. Coupling Matrix Calibration Strategy
**Decision**: Coupling is primary objective; calibrate jointly with structure discovery

**Baseline (3 subsystems)**:
- C is 3x3 symmetric (3 free parameters: C_cm, C_cn, C_mn)
- Optimization: Match empirical correlation structure + trajectory co-decline

**Expanded (4+ subsystems)**:
- C grows to N×N (N(N-1)/2 parameters)
- Risk: Overparameterization
- Mitigation: Sparse coupling penalty (L1 regularization), enforce structure from EFA

**Multi-level calibration**:
1. **Level 1**: Estimate C from cross-sectional correlations (fast, approximate)
2. **Level 2**: Refine C using longitudinal co-decline (Granger causality as prior)
3. **Level 3**: Joint optimization with recovery/decay parameters

**Identifiability checks**:
- Bootstrap C matrix estimates (95% CI on each C_ij)
- Sensitivity analysis: How much does C change with preprocessing choices?
- Cross-dataset validation: Does C estimated on ELSA match HRS?

### 5. Functional Form Testing
**Decision**: Use model comparison to test mechanistic assumptions

**Recovery function** (current: `r(X, D) = base_recovery * (1 - D)^beta * X^gamma`):
- **Alternative 1**: Power-law: `r = base * X^alpha`
- **Alternative 2**: Threshold: `r = base * X if X > threshold else 0`
- **Test**: Fit each form, compare AIC, check residuals

**Damage accumulation** (current: `dD/dt = alpha * (1-X) + beta * shocks`):
- **Alternative 1**: Nonlinear in X: `dD/dt = alpha * (1-X)^2`
- **Alternative 2**: Reversible damage: `dD/dt = alpha * (1-X) - repair`
- **Test**: Does allowing D to decrease improve fit to intervention data?

**Shock model** (current: Poisson arrivals, Gaussian magnitude):
- **Alternative 1**: No shocks (smooth decay only)
- **Alternative 2**: Heavy-tailed shocks (Pareto distribution for rare severe events)
- **Test**: Variance decomposition (how much of dX/dt variance is from shocks?)

**Coupling form** (current: `dX_i/dt += sum_j C_ij * (X_j - X_i)`):
- **Alternative 1**: Nonlinear coupling: `C_ij * (X_j - X_i)^2`
- **Alternative 2**: Threshold coupling (only when X_j drops below threshold)
- **Test**: Residual plots, nonlinearity tests

**Approach**:
- Nested model comparisons (likelihood ratio tests)
- Cross-validation (does more complex form generalize?)
- Biological plausibility checks (monotonicity, parameter signs)

### 6. Mortality Driver Identification
**Decision**: Subsystem-specific survival analysis + model-based attribution

**Empirical approach**:
```python
from lifelines import CoxPHFitter

# Cox model with subsystem Xs as predictors
cph = CoxPHFitter()
cph.fit(data, duration_col='time', event_col='died',
        formula='X_cardio + X_musc + X_neuro + [+ X_immune if 4-system model]')
# Output: Hazard ratios per subsystem
```

**Model-based approach**:
- Simulate deaths with calibrated model
- For each death, identify which subsystem X first crossed death_threshold
- Attribution: "X% of deaths driven by cardio decline, Y% by neuro decline"

**Mediation analysis**:
- Does decline in one subsystem cause mortality directly, or via inducing decline in another?
- Example: "Immune decline → neuro decline → death" pathway

**Output**:
- Hazard ratio plot (which subsystems matter most)
- Critical paths to death (which subsystem failures are terminal)
- Implications for intervention targeting (prioritize subsystem with highest HR)

### 7. Optimization Framework
**Decision**: Multi-objective optimization with hierarchical structure

**Objective function** (full version):
```
Loss = w_traj * RMSE_trajectories(X_model, X_obs, D_model, D_obs)     # Trajectory fit
     + w_coup * Frobenius(C_model, C_empirical)                      # Coupling structure
     + w_mort * (1 - C_index_mortality)                               # Mortality prediction
     + w_reg * (||C||_1 + ||θ - θ_prior||_2)                          # Regularization
```

**Weights**: w_coup should be highest (coupling is core innovation)

**Constraints**:
- Parameter bounds from literature (e.g., recovery ∈ [0.1, 0.5])
- Monotonicity: recovery decreases with D, damage increases with low X
- Coupling symmetry (if no directionality evidence)

**Algorithm**:
- **Initialization**: Multi-start optimization with Latin hypercube sampling
- **Optimizer**: scipy.optimize.minimize (L-BFGS-B or trust-constr)
- **Alternative**: CMA-ES (covariance matrix adaptation) for robustness to local minima

**Computational cost**:
- Each loss evaluation: ~100ms (run simulation)
- Full optimization: ~1000-5000 evaluations → 2-10 minutes
- With multi-start (10 starts): ~30-100 minutes

### 8. Validation Framework
**Decision**: Comprehensive validation at multiple levels

**1. Component validation**:
- **Coupling**: Does C match empirical correlations? Eigenvector alignment?
- **Trajectories**: RMSE per subsystem, age-stratified
- **Mortality**: C-index, calibration curves

**2. Out-of-sample validation**:
- Train on ELSA waves 1-4, test on waves 5-6
- Train on ELSA, test on HRS (cross-dataset)

**3. Intervention validation** (if data available):
- Calibrate on observational data
- Test on RCT data (does model predict exercise benefits?)

**4. Stress tests**:
- Extrapolation: Does model work for ages 90-100? (sparse data)
- Subgroups: Does model fit men and women similarly?
- Sensitivity: How much does fit degrade with noisy measurements?

**5. Functional form validation**:
- Residual analysis: Are errors randomly distributed or systematic?
- QQ plots: Are shock distributions correctly specified?

**6. Model comparison**:
- Baseline: 3-subsystem vs expanded (4/5-subsystem)
- Ablation: Importance of coupling (compare to independent-subsystem model)
- Alternative theories: Compare to other aging models (if implementable)

### 9. Iterative Refinement Loop
**Decision**: Treat calibration as research program, not one-shot optimization

**Iteration 1**: Baseline validation
- Fit 3-subsystem model to ELSA
- Assess residuals, identify systematic misfit
- Output: "Model underpredicts variance at age 70-80; suggests missing subsystem"

**Iteration 2**: Structure discovery
- Run EFA, identify candidate 4th subsystem (e.g., immune)
- Add to model, recalibrate
- Output: "4-subsystem model improves fit by 12%; immune-neuro coupling = 0.14"

**Iteration 3**: Functional form refinement
- Test alternative recovery/damage functions
- Output: "Power-law recovery fits better (ΔAIC = -8)"

**Iteration 4**: Final calibration
- Joint optimization with refined structure and functional forms
- Cross-validation on HRS
- Output: "Final model: 4 subsystems, power-law recovery, validated C-index = 0.74"

**Stopping criterion**: No further improvement >2% in out-of-sample C-index

### 10. Data Pipeline Architecture

**Stages**:
```
Data Acquisition → Preprocessing → Factor Analysis → Model Discovery → Calibration → Validation
     │                  │               │                  │               │            │
     └──────────────────┴───────────────┴──────────────────┴───────────────┴────────────┘
                                 Iterative Refinement Loop
```

**Modules**:

1. **data_loader.py**:
   - Parse ELSA/HRS/UK Biobank files
   - Handle missing data (multiple imputation)
   - Longitudinal format: (subject, wave, age, [all health measures])

2. **exploratory.py** (NEW - core of discovery):
   - `run_efa()`: Exploratory factor analysis to determine dimensionality
   - `estimate_coupling_empirical()`: Correlation/SEM-based C estimation
   - `granger_causality_all_pairs()`: Test temporal coupling directions
   - `survival_analysis_subsystems()`: Cox models for mortality drivers
   - `suggest_candidate_subsystems()`: Identify which subsystems to add

3. **model_comparison.py** (NEW):
   - `fit_model_variant()`: Fit model with N subsystems, functional form X
   - `compare_models()`: AIC/BIC/C-index comparison
   - `cross_validate()`: Train/test splits, cross-dataset validation

4. **calibration.py**:
   - `calibrate_coupling_matrix()`: Primary optimization for C
   - `calibrate_full_model()`: Joint optimization (C + recovery/decay + shocks)
   - `bootstrap_uncertainty()`: Confidence intervals on all parameters

5. **validation.py**:
   - All metrics (trajectory RMSE, coupling fit, mortality C-index)
   - Residual diagnostics
   - Cross-validation wrappers

6. **functional_forms.py** (NEW):
   - `RecoveryFunction` base class with variants (linear, power-law, threshold)
   - `DamageFunction` base class with variants
   - API for plugging in alternative forms

**Data structure**:
```
data/
├── raw/                        # Original datasets
├── processed/                  # Cleaned data
│   ├── elsa_full.csv          # All health measures (for EFA)
│   └── elsa_trajectories.csv  # Mapped to X, D (baseline)
├── exploratory/                # Research outputs
│   ├── efa_results.json       # Factor analysis (how many subsystems?)
│   ├── coupling_empirical.json # Estimated C from data
│   └── mortality_drivers.csv  # Hazard ratios
├── model_variants/             # Different model structures
│   ├── 3_subsystem_baseline/
│   ├── 4_subsystem_immune/
│   └── 5_subsystem_immune_metabolic/
├── calibrated/                 # Final calibrated models
│   └── best_model_params.json
└── validation/                 # Out-of-sample results
    └── cross_validation_results.json
```

### 11. Calibrated Model Metadata

**Storage** (JSON with full provenance):
```json
{
  "model_version": "v2_4subsystem",
  "description": "4-subsystem model with immune system, power-law recovery",
  "discovery_process": {
    "baseline_fit": {"c_index": 0.68, "rmse": 0.09},
    "efa_suggested_subsystems": ["immune", "metabolic"],
    "tested_variants": [
      {"name": "add_immune", "delta_cindex": 0.03, "aic_improvement": 15},
      {"name": "add_metabolic", "delta_cindex": 0.01, "aic_improvement": 3}
    ],
    "selected": "4-subsystem with immune"
  },
  "functional_forms": {
    "recovery": "power_law",
    "damage": "linear",
    "coupling": "linear"
  },
  "calibrated_params": {
    "coupling_matrix": [[0, 0.12, 0.09, 0.14],
                        [0.12, 0, 0.11, 0.08],
                        [0.09, 0.11, 0, 0.16],
                        [0.14, 0.08, 0.16, 0]],
    "subsystem_names": ["Cardio", "Musc", "Neuro", "Immune"],
    "base_recovery": [0.28, 0.23, 0.18, 0.31],
    ...
  },
  "validation": {
    "in_sample_c_index": 0.73,
    "out_of_sample_c_index": 0.71,
    "cross_dataset_c_index": 0.69,
    "coupling_uncertainty": "95% CI on C_ij: ±0.03"
  },
  "dataset": "ELSA_waves_1_6",
  "date": "2025-12-15"
}
```

## Research Roadmap (Phases)

### Phase 0: Data Acquisition & Infrastructure (1 week)
- Obtain ELSA/HRS data access
- Build preprocessing pipeline
- Deliverable: Clean datasets with all candidate measures

### Phase 1: Baseline Validation (2 weeks)
- RQ1.1-1.3: Validate 3-subsystem model
- Calibrate C matrix + system params
- Deliverable: Baseline model fit, identified gaps

### Phase 2: Subsystem Discovery (3 weeks)
- RQ2.1-2.3: Systematic subsystem discovery
- EFA, candidate evaluation, model comparison
- Deliverable: Optimal model structure (3, 4, or 5 subsystems)

### Phase 3: Functional Form Testing (2 weeks)
- RQ3.1-3.3: Test alternative equations
- Model comparison, residual diagnostics
- Deliverable: Validated functional forms

### Phase 4: Final Calibration (1 week)
- Joint optimization with refined structure
- Cross-validation, uncertainty quantification
- Deliverable: Best calibrated model with confidence intervals

### Phase 5: Documentation (1 week)
- Methods paper draft
- API documentation
- Reproducible workflows
- Deliverable: Publication + open-source release

**Total timeline**: ~10 weeks (2.5 months) for full research program

## Example: Subsystem Discovery Workflow

```python
from aging_network.exploratory import run_efa, suggest_subsystems
from aging_network.model_comparison import evaluate_model_variant

# Step 1: How many subsystems are in the data?
efa = run_efa(health_data, n_factors=range(2, 8))
efa.plot_scree()  # Shows elbow at 4 factors
# Interpretation: 4 latent factors explain 75% of variance

# Step 2: What are the 4 factors?
print(efa.factor_loadings)
# Factor 1: Cardio (BP, HR, grip)
# Factor 2: Musc (gait, chair, muscle mass)
# Factor 3: Neuro (cognition, reaction time)
# Factor 4: Immune (WBC, CRP, infection history) ← NEW!

# Step 3: Add immune subsystem to model
model_4sys = evaluate_model_variant(
    data=health_data,
    subsystems=["cardio", "musc", "neuro", "immune"]
)

# Step 4: Compare to baseline
print(f"3-sys C-index: {model_3sys.c_index}")  # 0.68
print(f"4-sys C-index: {model_4sys.c_index}")  # 0.71
print(f"ΔAIC: {model_3sys.aic - model_4sys.aic}")  # -18 (4-sys better)

# Step 5: Inspect coupling matrix
print(model_4sys.coupling_matrix)
# Immune-Neuro coupling (0.16) is strongest
# Interpretation: Inflammaging affects cognitive decline

# Step 6: Test metabolic subsystem
model_5sys = evaluate_model_variant(
    data=health_data,
    subsystems=["cardio", "musc", "neuro", "immune", "metabolic"]
)
print(f"5-sys C-index: {model_5sys.c_index}")  # 0.72 (only +0.01)
print(f"ΔAIC: {model_4sys.aic - model_5sys.aic}")  # -3 (marginal, not worth complexity)

# Conclusion: 4-subsystem model (+ immune) is optimal
```

## Challenges and Mitigations

### Challenge 1: Subsystem discovery may overfit
**Issue**: Adding subsystems always improves in-sample fit

**Mitigation**:
- Strict out-of-sample validation (train/test split)
- Model complexity penalties (AIC, BIC)
- Cross-dataset validation (ELSA → HRS)
- Require meaningful improvement (Δ C-index > 0.02)

### Challenge 2: Identifiability with many parameters
**Issue**: With 5 subsystems, C has 10 parameters + recovery/decay for each

**Mitigation**:
- Regularization (sparse coupling, parameter priors)
- Hierarchical calibration (fix C first, then other params)
- Sensitivity analysis (bootstrap uncertainty)
- Accept that some parameters have wide CIs (report uncertainty)

### Challenge 3: Functional form testing is expensive
**Issue**: Each form requires full optimization

**Mitigation**:
- Test on subset of data first (fast screening)
- Use nested models (likelihood ratio tests are fast)
- Parallelize evaluations

### Challenge 4: Data may not support strong conclusions
**Issue**: Noisy, confounded observational data

**Mitigation**:
- Acknowledge limitations in documentation
- Focus on robust findings (e.g., coupling exists, even if precise C_ij uncertain)
- Use multiple datasets to triangulate

### Challenge 5: Model may never fit perfectly
**Issue**: Simple dynamical model vs complex reality

**Mitigation**:
- Accept approximate fit (model is conceptual tool)
- Use residual analysis to guide refinements
- Document what model cannot explain

## Success Criteria

**Phase 1 success** (baseline validation):
- 3-subsystem model C-index > 0.65
- Coupling matrix C significantly different from zero
- One subsystem clearly drives mortality (HR > 1.5)

**Phase 2 success** (subsystem discovery):
- EFA identifies interpretable 4th/5th factor
- Expanded model improves C-index by >0.02
- New subsystem has significant coupling to existing ones

**Phase 3 success** (functional forms):
- At least one alternative form improves fit (ΔAIC > 10)
- Residuals show no systematic patterns

**Phase 4 success** (final model):
- Out-of-sample C-index > 0.70
- Cross-dataset validation (ELSA → HRS) C-index > 0.65
- Coupling matrix CIs exclude zero for all edges
- Parameters biologically plausible

**Publication readiness**:
- Novel finding: Validated coupling structure in real data
- Model comparison: Optimal subsystem count (3? 4? 5?)
- Mortality drivers identified
- Open-source reproducible pipeline
