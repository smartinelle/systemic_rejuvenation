export interface SimulationConfig {
  start_age: number;
  years: number;
  dt: number;
  func_threshold: number;
  death_threshold: number;
  noise_std: number;
}

export interface InterventionConfig {
  exercise_start_age: number;
  exercise_recovery_gain: number;
  exercise_damage_reduction: number;
  drug_start_age: number;
  drug_shock_factor: number;
  organ_replacement_age: number;
  parabiosis_start_age: number;
  parabiosis_duration: number;
  parabiosis_strength_k: number;
  parabiosis_recovery_gain: number;
  parabiosis_decay_reduction: number;
  parabiosis_alpha_reduction: number;
  parabiosis_shock_damage_reduction: number;
}

export interface SimulationResult {
  ages: number[];
  X: number[][];  // [timestep, subsystem]
  D: number[][];  // [timestep, subsystem]
  healthspan: number;
  lifespan: number;
  mean_X: number[];
  mean_D: number[];
  cause_of_death: number | null;  // Index of organ system that caused death (0=Cardio, 1=Musc, 2=Neuro)
}

export type InterventionType = 'none' | 'exercise' | 'drug' | 'parabiosis' | 'organ1' | 'organ2' | 'organ3';

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  start_age: 30.0,
  years: 90.0,
  dt: 0.1,
  func_threshold: 0.60,
  death_threshold: 0.25,
  noise_std: 0.005,
};

export const DEFAULT_INTERVENTION_CONFIG: Partial<Record<InterventionType, Partial<InterventionConfig>>> = {
  exercise: {
    exercise_start_age: 40.0,
    exercise_recovery_gain: 0.3,
    exercise_damage_reduction: 0.3,
  },
  drug: {
    drug_start_age: 60.0,
    drug_shock_factor: 0.4,
  },
  parabiosis: {
    parabiosis_start_age: 55.0,
    parabiosis_duration: 8.0,
    parabiosis_strength_k: 0.6,
    parabiosis_recovery_gain: 0.40,
    parabiosis_decay_reduction: 0.20,
    parabiosis_alpha_reduction: 0.40,
    parabiosis_shock_damage_reduction: 0.30,
  },
  organ1: {
    organ_replacement_age: 65.0,
  },
  organ2: {
    organ_replacement_age: 65.0,
  },
  organ3: {
    organ_replacement_age: 65.0,
  },
};
