import { DEFAULT_BODYWEIGHT_KG } from '../data/RankingEngine';
import { forBrowserLanguage, languageFromCode } from '../i18n/AppLanguage';
import {
  AppLanguage,
  ExerciseSetLogEntity,
  LastLift,
  WeightUnit,
  WorkoutLogEntity,
  WorkoutWithSets,
} from '../types/models';

const PREFS_KEY = 'benchpr_prefs_v1';
const WORKOUTS_KEY = 'benchpr_workouts_v1';

export interface StoredPreferences {
  target1RM: number;
  weightUnit: WeightUnit;
  bodyweightKg: number;
  languageCode: string | null;
}

const DEFAULT_PREFS: StoredPreferences = {
  target1RM: 100.0,
  weightUnit: 'kg',
  bodyweightKg: DEFAULT_BODYWEIGHT_KG,
  languageCode: null,
};

export function loadPreferences(): StoredPreferences {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw) as Partial<StoredPreferences>;
    return {
      target1RM: typeof parsed.target1RM === 'number' && parsed.target1RM > 0 ? parsed.target1RM : 100.0,
      weightUnit: parsed.weightUnit === 'lbs' ? 'lbs' : 'kg',
      bodyweightKg:
        typeof parsed.bodyweightKg === 'number' && parsed.bodyweightKg >= 20 && parsed.bodyweightKg <= 400
          ? parsed.bodyweightKg
          : DEFAULT_BODYWEIGHT_KG,
      languageCode: typeof parsed.languageCode === 'string' ? parsed.languageCode : null,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePreferences(prefs: StoredPreferences): void {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota issues
  }
}

export function resolveLanguage(languageCode: string | null): AppLanguage {
  return languageCode ? languageFromCode(languageCode) : forBrowserLanguage();
}

export function loadWorkouts(): WorkoutWithSets[] {
  try {
    const raw = localStorage.getItem(WORKOUTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as WorkoutWithSets[];
    if (!Array.isArray(parsed)) return [];
    return parsed.sort((a, b) => b.workoutLog.timestamp - a.workoutLog.timestamp);
  } catch {
    return [];
  }
}

export function saveWorkoutsList(workouts: WorkoutWithSets[]): void {
  try {
    localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
  } catch {
    // Ignore storage quota issues
  }
}

export function insertWorkout(
  current: WorkoutWithSets[],
  log: Omit<WorkoutLogEntity, 'id'>,
  sets: Array<Omit<ExerciseSetLogEntity, 'id' | 'workoutLogId'>>,
): WorkoutWithSets[] {
  const workoutId = Date.now() + Math.floor(Math.random() * 1000);
  const fullLog: WorkoutLogEntity = { ...log, id: workoutId };
  const fullSets: ExerciseSetLogEntity[] = sets.map((s, idx) => ({
    ...s,
    id: workoutId * 1000 + idx + 1,
    workoutLogId: workoutId,
  }));
  const next = [{ workoutLog: fullLog, sets: fullSets }, ...current].sort(
    (a, b) => b.workoutLog.timestamp - a.workoutLog.timestamp,
  );
  saveWorkoutsList(next);
  return next;
}

export function deleteWorkoutById(current: WorkoutWithSets[], logId: number): WorkoutWithSets[] {
  const next = current.filter((w) => w.workoutLog.id !== logId);
  saveWorkoutsList(next);
  return next;
}

const BENCH_NAMES = new Set(['Heavy Single', 'Bench press', 'Bench Press', 'Paused Bench']);

export function computeBestBenchLifted(workouts: WorkoutWithSets[]): number | null {
  let max: number | null = null;
  for (const w of workouts) {
    for (const s of w.sets) {
      if (s.isCompleted && BENCH_NAMES.has(s.exerciseName)) {
        if (max === null || s.actualWeight > max) {
          max = s.actualWeight;
        }
      }
    }
  }
  return max;
}

export function findLastLift(workouts: WorkoutWithSets[], exerciseName: string): LastLift | null {
  const target = exerciseName.trim().toLowerCase();
  const sorted = [...workouts].sort((a, b) => b.workoutLog.timestamp - a.workoutLog.timestamp);
  for (const w of sorted) {
    for (let i = w.sets.length - 1; i >= 0; i--) {
      const s = w.sets[i];
      if (s.isCompleted && s.actualWeight > 0 && s.exerciseName.trim().toLowerCase() === target) {
        return { weight: s.actualWeight, unit: w.workoutLog.unit };
      }
    }
  }
  return null;
}
