export type UserRole = 'swimmer' | 'coach';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export type SwimStyle = 'freestyle' | 'backstroke' | 'breaststroke' | 'butterfly' | 'medley';
export type SwimTestType = 'individual' | 'relay';

export interface SwimTest {
  id: string;
  name: string;
  distance: number;
  style: SwimStyle;
  type: SwimTestType;
}

export interface Training {
  id: string;
  user_id: string;
  date: string;
  notes?: string;
  created_at: string;
}

export interface TrainingResult {
  id: string;
  training_id: string;
  swim_test_id: string;
  time: number;
  created_at: string;
  swim_test?: SwimTest;
}

export interface TrainingWithResults extends Training {
  results: TrainingResult[];
}

export interface TrainingPlan {
  id: string;
  training_id: string;
  swim_test_id: string;
  sets: number;
  swim_test?: SwimTest;
}

export interface PersonalBest {
  swim_test_id: string;
  swim_test: SwimTest;
  best_time: number;
  average_time: number;
  total_attempts: number;
  last_time: number;
  last_date: string;
}

export interface ProgressPoint {
  date: string;
  time: number;
}

export type ThemeMode = 'light' | 'dark';
