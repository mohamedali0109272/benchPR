export enum MuscleGroup {
  CHEST = 'CHEST',
  SHOULDERS = 'SHOULDERS',
  BICEPS = 'BICEPS',
  TRICEPS = 'TRICEPS',
  FOREARMS = 'FOREARMS',
  CORE = 'CORE',
  TRAPS = 'TRAPS',
  LATS = 'LATS',
  LOWER_BACK = 'LOWER_BACK',
  GLUTES = 'GLUTES',
  QUADS = 'QUADS',
  HAMSTRINGS = 'HAMSTRINGS',
  CALVES = 'CALVES',
}

export const MUSCLE_DISPLAY_NAMES: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: 'Chest',
  [MuscleGroup.SHOULDERS]: 'Shoulders',
  [MuscleGroup.BICEPS]: 'Biceps',
  [MuscleGroup.TRICEPS]: 'Triceps',
  [MuscleGroup.FOREARMS]: 'Forearms',
  [MuscleGroup.CORE]: 'Core',
  [MuscleGroup.TRAPS]: 'Traps',
  [MuscleGroup.LATS]: 'Lats',
  [MuscleGroup.LOWER_BACK]: 'Lower Back',
  [MuscleGroup.GLUTES]: 'Glutes',
  [MuscleGroup.QUADS]: 'Quads',
  [MuscleGroup.HAMSTRINGS]: 'Hamstrings',
  [MuscleGroup.CALVES]: 'Calves',
};

export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  MuscleGroup.CHEST,
  MuscleGroup.SHOULDERS,
  MuscleGroup.BICEPS,
  MuscleGroup.TRICEPS,
  MuscleGroup.FOREARMS,
  MuscleGroup.CORE,
  MuscleGroup.TRAPS,
  MuscleGroup.LATS,
  MuscleGroup.LOWER_BACK,
  MuscleGroup.GLUTES,
  MuscleGroup.QUADS,
  MuscleGroup.HAMSTRINGS,
  MuscleGroup.CALVES,
];

export enum RankTier {
  UNRANKED = 'UNRANKED',
  IRON = 'IRON',
  BRONZE = 'BRONZE',
  SILVER = 'SILVER',
  GOLD = 'GOLD',
  PLATINUM = 'PLATINUM',
  DIAMOND = 'DIAMOND',
  MASTER = 'MASTER',
  LEGEND = 'LEGEND',
}

export interface RankTierInfo {
  tier: RankTier;
  displayName: string;
  minScore: number;
  color: string;
  next: RankTier | null;
}

export interface ExerciseItem {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  description: string;
  secondaryMuscles: MuscleGroup[];
  strengthRef: number;
  bodyweightFactor: number;
  isTimed: boolean;
  defaultSets: number;
  defaultReps: number;
}

export interface ExerciseTemplate {
  id: string;
  name: string;
  targetPercent: number;
  targetReps: number;
  targetDurationSeconds: number;
  totalSets: number;
  isStaticHold: boolean;
  repRange?: string | null;
}

export interface WorkoutSessionTemplate {
  id: number;
  title: string;
  subtitle: string;
  goal: string;
  exercises: ExerciseTemplate[];
}

export interface SplitExercise {
  exerciseId: string;
  sets: number;
  repsMin: number;
  repsMax: number;
  durationSeconds: number;
  repRange: string;
}

export interface SplitDay {
  name: string;
  focus: string;
  exercises: SplitExercise[];
}

export interface WorkoutSplit {
  id: string;
  name: string;
  tagline: string;
  level: string;
  goal: string;
  daysPerWeek: number;
  days: SplitDay[];
}

export type LiftingAccessory =
  | 'Belt'
  | 'Wrist Wraps'
  | 'Elbow Wraps'
  | 'Knee Wraps'
  | 'Knee Sleeves'
  | 'Lifting Straps'
  | 'Chalk';

export const ALL_LIFTING_ACCESSORIES: LiftingAccessory[] = [
  'Belt',
  'Wrist Wraps',
  'Elbow Wraps',
  'Knee Wraps',
  'Knee Sleeves',
  'Lifting Straps',
  'Chalk',
];

export interface ExerciseSetState {
  setIndex: number;
  targetWeight: number;
  targetReps: number;
  actualWeight: number;
  actualReps: number;
  isCompleted: boolean;
  durationSeconds: number;
  accessories?: LiftingAccessory[];
}

export interface ActiveExerciseState {
  template: ExerciseTemplate;
  calculatedTargetWeight: number;
  sets: ExerciseSetState[];
}

export interface ActiveWorkoutState {
  sessionTemplate: WorkoutSessionTemplate;
  target1RM: number;
  unit: WeightUnit;
  exercises: ActiveExerciseState[];
  startTimeMillis: number;
  isFinished: boolean;
}

export type WeightUnit = 'kg' | 'lbs';

export interface WorkoutLogEntity {
  id: number;
  sessionId: number;
  sessionTitle: string;
  target1RM: number;
  unit: WeightUnit;
  timestamp: number;
  totalDurationSeconds: number;
  isCompleted: boolean;
}

export interface ExerciseSetLogEntity {
  id: number;
  workoutLogId: number;
  exerciseName: string;
  setIndex: number;
  targetWeight: number;
  targetReps: number;
  actualWeight: number;
  actualReps: number;
  isCompleted: boolean;
  accessories?: LiftingAccessory[];
}

export interface WorkoutWithSets {
  workoutLog: WorkoutLogEntity;
  sets: ExerciseSetLogEntity[];
}

export interface LastLift {
  weight: number;
  unit: WeightUnit;
}

export interface LoggedSet {
  exerciseName: string;
  weightKg: number;
  reps: number;
}

export interface MuscleRankInfo {
  muscleGroup: MuscleGroup;
  tier: RankTier;
  score: number;
  progress: number;
  bestLiftName: string | null;
  bestLiftWeightKg: number;
  bestLiftReps: number;
  bestEstimated1RmKg: number;
  totalVolumeKg: number;
  setsLogged: number;
  nextTier: RankTier | null;
}

export interface OverallRank {
  tier: RankTier;
  score: number;
  progress: number;
}

export type AppLanguageCode = 'en' | 'ar';

export interface AppLanguage {
  code: AppLanguageCode;
  nativeName: string;
  isRtl: boolean;
}

export type AppRoute = 'home' | 'splits' | 'split-detail' | 'muscles' | 'exercises' | 'session' | 'history';
