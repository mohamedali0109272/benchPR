import { DEFAULT_BODYWEIGHT_KG, RankingEngine } from '../data/RankingEngine';
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
const CUSTOM_ACCESSORIES_KEY = 'benchpr_custom_accessories_v1';

export interface StoredPreferences {
  target1RM: number;
  targetSquat1RM: number;
  targetDeadlift1RM: number;
  weightUnit: WeightUnit;
  bodyweightKg: number;
  languageCode: string | null;
}

const DEFAULT_PREFS: StoredPreferences = {
  target1RM: 100.0,
  targetSquat1RM: 140.0,
  targetDeadlift1RM: 180.0,
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
      targetSquat1RM:
        typeof parsed.targetSquat1RM === 'number' && parsed.targetSquat1RM > 0 ? parsed.targetSquat1RM : 140.0,
      targetDeadlift1RM:
        typeof parsed.targetDeadlift1RM === 'number' && parsed.targetDeadlift1RM > 0
          ? parsed.targetDeadlift1RM
          : 180.0,
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

export function loadCustomAccessories(): string[] {
  try {
    const raw = localStorage.getItem(CUSTOM_ACCESSORIES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((item) => String(item).trim().slice(0, 40))
      .filter((item) => item.length > 0);
  } catch {
    return [];
  }
}

export function saveCustomAccessories(items: string[]): void {
  try {
    localStorage.setItem(CUSTOM_ACCESSORIES_KEY, JSON.stringify(items));
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

export const BENCH_NAMES = new Set(['Heavy Single', 'Bench press', 'Bench Press', 'Paused Bench']);
export const SQUAT_NAMES = new Set(['Barbell Squat', 'Front Squat']);
export const DEADLIFT_NAMES = new Set(['Deadlift', 'Sumo Deadlift', 'Romanian Deadlift', 'Stiff-Legged Deadlift']);

function computeBestByNames(workouts: WorkoutWithSets[], names: Set<string>): number | null {
  let max: number | null = null;
  for (const w of workouts) {
    for (const s of w.sets) {
      if (s.isCompleted && names.has(s.exerciseName)) {
        if (max === null || s.actualWeight > max) {
          max = s.actualWeight;
        }
      }
    }
  }
  return max;
}

export function computeBestBenchLifted(workouts: WorkoutWithSets[]): number | null {
  return computeBestByNames(workouts, BENCH_NAMES);
}

export function computeBestSquatLifted(workouts: WorkoutWithSets[]): number | null {
  return computeBestByNames(workouts, SQUAT_NAMES);
}

export function computeBestDeadliftLifted(workouts: WorkoutWithSets[]): number | null {
  return computeBestByNames(workouts, DEADLIFT_NAMES);
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

export type MainLiftKind = 'bench' | 'squat' | 'deadlift';

export interface TargetTimeEstimate {
  status: 'no_data' | 'reached' | 'trend_pace' | 'typical_pace';
  daysRemaining: number | null;
  weeklyRateDisplay: number | null;
  currentBestEst1RM: number | null;
}

const TYPICAL_WEEKLY_GAIN_KG: Record<MainLiftKind, number> = {
  bench: 1.0,
  squat: 1.5,
  deadlift: 2.0,
};

function liftNameSet(lift: MainLiftKind): Set<string> {
  switch (lift) {
    case 'bench':
      return BENCH_NAMES;
    case 'squat':
      return SQUAT_NAMES;
    case 'deadlift':
      return DEADLIFT_NAMES;
  }
}

export function estimateTimeToTarget1RM(
  workouts: WorkoutWithSets[],
  lift: MainLiftKind,
  target1RM: number,
  unit: WeightUnit,
): TargetTimeEstimate {
  if (!Number.isFinite(target1RM) || target1RM <= 0) {
    return {
      status: 'no_data',
      daysRemaining: null,
      weeklyRateDisplay: null,
      currentBestEst1RM: null,
    };
  }

  const names = liftNameSet(lift);
  const dailyMap = new Map<string, { dayMs: number; peakEst: number }>();

  for (const w of workouts) {
    const dt = new Date(w.workoutLog.timestamp);
    const dayMs = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()).getTime();
    const key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;

    for (const s of w.sets) {
      if (!s.isCompleted || s.actualWeight <= 0 || s.actualReps <= 0 || !names.has(s.exerciseName)) {
        continue;
      }
      const loadKg = RankingEngine.toKg(s.actualWeight, w.workoutLog.unit);
      const estKg = RankingEngine.estimateOneRepMax(loadKg, s.actualReps);
      const estDisplay = RankingEngine.fromKg(estKg, unit);
      const existing = dailyMap.get(key);
      if (!existing || estDisplay > existing.peakEst) {
        dailyMap.set(key, { dayMs, peakEst: estDisplay });
      }
    }
  }

  const dailyPeaks = Array.from(dailyMap.values()).sort((a, b) => a.dayMs - b.dayMs);
  if (dailyPeaks.length === 0) {
    return {
      status: 'no_data',
      daysRemaining: null,
      weeklyRateDisplay: null,
      currentBestEst1RM: null,
    };
  }

  const bestEst = dailyPeaks.reduce((m, d) => (d.peakEst > m ? d.peakEst : m), 0);
  const roundedBest = Math.round(bestEst * 10) / 10;

  if (bestEst >= target1RM) {
    return {
      status: 'reached',
      daysRemaining: 0,
      weeklyRateDisplay: null,
      currentBestEst1RM: roundedBest,
    };
  }

  const remaining = target1RM - bestEst;

  if (dailyPeaks.length >= 2) {
    const firstDayMs = dailyPeaks[0].dayMs;
    const dayMsUnit = 24 * 60 * 60 * 1000;
    const pts = dailyPeaks.map((d) => ({
      x: (d.dayMs - firstDayMs) / dayMsUnit,
      y: d.peakEst,
    }));
    const n = pts.length;
    const meanX = pts.reduce((acc, p) => acc + p.x, 0) / n;
    const meanY = pts.reduce((acc, p) => acc + p.y, 0) / n;
    let num = 0;
    let den = 0;
    for (const p of pts) {
      const dx = p.x - meanX;
      num += dx * (p.y - meanY);
      den += dx * dx;
    }
    const slopePerDay = den > 0 ? num / den : 0;

    if (slopePerDay > 0.02) {
      const weeklyRate = slopePerDay * 7;
      const daysRemaining = Math.max(1, Math.min(3650, Math.ceil(remaining / slopePerDay)));
      return {
        status: 'trend_pace',
        daysRemaining,
        weeklyRateDisplay: Math.round(weeklyRate * 10) / 10,
        currentBestEst1RM: roundedBest,
      };
    }
  }

  const typicalWeekly = RankingEngine.fromKg(TYPICAL_WEEKLY_GAIN_KG[lift], unit);
  const daysRemaining = Math.max(1, Math.min(3650, Math.ceil((remaining / typicalWeekly) * 7)));
  return {
    status: 'typical_pace',
    daysRemaining,
    weeklyRateDisplay: Math.round(typicalWeekly * 10) / 10,
    currentBestEst1RM: roundedBest,
  };
}

export function formatEtaParts(days: number): {
  value: string;
  unitKey: 'days' | 'wks' | 'mos' | 'yrs';
} {
  if (days < 7) {
    return { value: `~${days}`, unitKey: 'days' };
  }
  if (days < 70) {
    return { value: `~${Math.max(1, Math.round(days / 7))}`, unitKey: 'wks' };
  }
  if (days < 365) {
    return { value: `~${Math.max(2, Math.round(days / 30))}`, unitKey: 'mos' };
  }
  const years = Math.round((days / 365) * 10) / 10;
  return { value: `~${years}`, unitKey: 'yrs' };
}
