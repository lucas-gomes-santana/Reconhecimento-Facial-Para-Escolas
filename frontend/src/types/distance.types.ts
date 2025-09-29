import type { ValidationResult } from "./validation.types";

export interface DistanceConfig {
  minFaceSize: number;
  maxFaceSize: number;
  idealMinSize: number;
  idealMaxSize: number;
}

export interface DistanceResult {
  status: 'muito_longe' | 'longe' | 'ideal' | 'perto' | 'muito_perto' | 'sem_face';
  isIdeal: boolean;
  faceSize?: number;
}

export interface DistanceValidationResult extends ValidationResult {
  isIdeal: boolean;
}


export type DistanceStatus = 'muito_longe' | 'longe' | 'ideal' | 'perto' | 'muito_perto' | 'sem_face';
