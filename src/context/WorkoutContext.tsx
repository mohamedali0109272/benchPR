/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ExerciseLibrary } from '../data/ExerciseLibrary';
import { RankingEngine } from '../data/RankingEngine';
import { Splits } from '../data/Splits';
import { auth, db, onAuthStateChanged } from '../services/firebase';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import {
  computeBestBenchLifted,
  computeBestDeadliftLifted,
  computeBestSquatLifted,
  deleteWorkoutById,
  findLastLift,
  insertWorkout,
  loadPreferences,
  loadWorkouts,
  resolveLanguage,
  savePreferences,
  saveWorkoutsList,
  StoredPreferences,
} from '../data/storage';
import {
  ActiveExerciseState,
  ActiveWorkoutState,
  AppLanguage,
  ExerciseItem,
  ExerciseSetState,
  ExerciseTemplate,
  LoggedSet,
  MuscleGroup,
  MuscleRankInfo,
  OverallRank,
  WeightUnit,
  WorkoutSessionTemplate,
  WorkoutWithSets,
  LiftingAccessory,
} from '../types/models';

interface WorkoutContextValue {
  target1RM: number;
  targetSquat1RM: number;
  targetDeadlift1RM: number;
  weightUnit: WeightUnit;
  bodyweightKg: number;
  language: AppLanguage;
  historyWorkouts: WorkoutWithSets[];
  bestBenchLifted: number | null;
  bestSquatLifted: number | null;
  bestDeadliftLifted: number | null;
  totalWorkoutsCompleted: number;
  muscleRanks: Record<MuscleGroup, MuscleRankInfo>;
  overallRank: OverallRank;
  activeWorkout: ActiveWorkoutState | null;
  timerSecondsRemaining: number;
  timerTotalSeconds: number;
  isTimerRunning: boolean;

  updateTarget1RM: (newTarget: number) => void;
  updateTargetSquat1RM: (newTarget: number) => void;
  updateTargetDeadlift1RM: (newTarget: number) => void;
  updateWeightUnit: (unit: WeightUnit) => void;
  setLanguage: (lang: AppLanguage) => void;
  updateBodyweightKg: (kg: number) => void;
  startSplitDay: (splitId: string, dayIndex: number) => void;
  startQuickWorkout: (exerciseId?: string | null) => void;
  addExercise: (item: ExerciseItem) => void;
  removeExercise: (exerciseIndex: number) => void;
  addSet: (exerciseIndex: number) => void;
  removeSet: (exerciseIndex: number, setIndex: number) => void;
  toggleSetCompletion: (exerciseIndex: number, setIndex: number) => void;
  updateSetWeight: (exerciseIndex: number, setIndex: number, weight: number) => void;
  updateSetReps: (exerciseIndex: number, setIndex: number, reps: number) => void;
  toggleSetAccessory: (exerciseIndex: number, setIndex: number, accessory: LiftingAccessory) => void;
  startTimer: (durationSeconds: number) => void;
  stopTimer: () => void;
  finishWorkout: (onSaved: () => void) => void;
  cancelWorkout: () => void;
  deleteWorkoutLog: (logId: number) => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

function buildActiveExercise(template: ExerciseTemplate, targetWeight: number): ActiveExerciseState {
  const sets: ExerciseSetState[] = Array.from({ length: template.totalSets }, (_, idx) => ({
    setIndex: idx + 1,
    targetWeight,
    targetReps: template.targetReps,
    actualWeight: targetWeight,
    actualReps: template.targetReps,
    isCompleted: false,
    durationSeconds: template.targetDurationSeconds,
  }));
  return {
    template,
    calculatedTargetWeight: targetWeight,
    sets,
  };
}

export const WorkoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [prefs, setPrefs] = useState<StoredPreferences>(() => loadPreferences());
  const [historyWorkouts, setHistoryWorkouts] = useState<WorkoutWithSets[]>(() => loadWorkouts());
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState(0);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);

  const language = useMemo(() => resolveLanguage(prefs.languageCode), [prefs.languageCode]);

  // Sync with Firestore when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Sync user profile & prefs
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            const cloudPrefs: StoredPreferences = {
              target1RM: data.targetBench ?? prefs.target1RM,
              targetSquat1RM: data.targetSquat ?? prefs.targetSquat1RM,
              targetDeadlift1RM: data.targetDeadlift ?? prefs.targetDeadlift1RM,
              weightUnit: data.weightUnit ?? prefs.weightUnit,
              bodyweightKg: data.bodyweightKg ?? prefs.bodyweightKg,
              languageCode: data.languageCode ?? prefs.languageCode,
            };
            setPrefs(cloudPrefs);
            savePreferences(cloudPrefs);
          } else {
            await setDoc(userRef, {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              photoURL: user.photoURL,
              targetBench: prefs.target1RM,
              targetSquat: prefs.targetSquat1RM,
              targetDeadlift: prefs.targetDeadlift1RM,
              weightUnit: prefs.weightUnit,
              bodyweightKg: prefs.bodyweightKg,
              languageCode: prefs.languageCode,
              createdAt: new Date().toISOString(),
            });
          }

          // Sync workouts
          const workoutsRef = collection(db, 'workouts');
          const q = query(workoutsRef, where('userId', '==', user.uid));
          const querySnap = await getDocs(q);
          if (!querySnap.empty) {
            const cloudWorkouts: WorkoutWithSets[] = querySnap.docs.map((d) => d.data() as WorkoutWithSets);
            const sorted = cloudWorkouts.sort((a, b) => b.workoutLog.timestamp - a.workoutLog.timestamp);
            setHistoryWorkouts(sorted);
            saveWorkoutsList(sorted);
          } else {
            // Upload local workouts to cloud
            const local = loadWorkouts();
            for (const w of local) {
              await setDoc(doc(db, 'workouts', String(w.workoutLog.id)), {
                ...w,
                userId: user.uid,
              });
            }
          }
        } catch (err) {
          console.error('Firestore sync error on login:', err);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const updatePrefs = useCallback((updater: (prev: StoredPreferences) => StoredPreferences) => {
    setPrefs((prev) => {
      const next = updater(prev);
      savePreferences(next);
      const user = auth.currentUser;
      if (user) {
        setDoc(
          doc(db, 'users', user.uid),
          {
            targetBench: next.target1RM,
            targetSquat: next.targetSquat1RM,
            targetDeadlift: next.targetDeadlift1RM,
            weightUnit: next.weightUnit,
            bodyweightKg: next.bodyweightKg,
            languageCode: next.languageCode,
            updatedAt: new Date().toISOString(),
          },
          { merge: true },
        ).catch((err) => console.error('Failed to sync prefs to Firestore:', err));
      }
      return next;
    });
  }, []);

  const updateTarget1RM = useCallback(
    (newTarget: number) => {
      if (!Number.isFinite(newTarget) || newTarget <= 0) return;
      updatePrefs((p) => ({ ...p, target1RM: newTarget }));
    },
    [updatePrefs],
  );

  const updateTargetSquat1RM = useCallback(
    (newTarget: number) => {
      if (!Number.isFinite(newTarget) || newTarget <= 0) return;
      updatePrefs((p) => ({ ...p, targetSquat1RM: newTarget }));
    },
    [updatePrefs],
  );

  const updateTargetDeadlift1RM = useCallback(
    (newTarget: number) => {
      if (!Number.isFinite(newTarget) || newTarget <= 0) return;
      updatePrefs((p) => ({ ...p, targetDeadlift1RM: newTarget }));
    },
    [updatePrefs],
  );

  const updateWeightUnit = useCallback(
    (unit: WeightUnit) => {
      updatePrefs((p) => ({ ...p, weightUnit: unit }));
    },
    [updatePrefs],
  );

  const setLanguage = useCallback(
    (lang: AppLanguage) => {
      updatePrefs((p) => ({ ...p, languageCode: lang.code }));
    },
    [updatePrefs],
  );

  const updateBodyweightKg = useCallback(
    (kg: number) => {
      if (!Number.isFinite(kg) || kg < 20.0 || kg > 400.0) return;
      updatePrefs((p) => ({ ...p, bodyweightKg: kg }));
    },
    [updatePrefs],
  );

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    setIsTimerRunning(false);
    setTimerSecondsRemaining(0);
    setTimerTotalSeconds(0);
  }, []);

  const startTimer = useCallback((durationSeconds: number) => {
    if (timerIntervalRef.current !== null) {
      window.clearInterval(timerIntervalRef.current);
    }
    setTimerTotalSeconds(durationSeconds);
    setTimerSecondsRemaining(durationSeconds);
    setIsTimerRunning(true);

    timerIntervalRef.current = window.setInterval(() => {
      setTimerSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (timerIntervalRef.current !== null) {
            window.clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
          }
          setIsTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current !== null) {
        window.clearInterval(timerIntervalRef.current);
      }
    };
  }, []);

  const applyPrefillToExercises = useCallback(
    (exercises: ActiveExerciseState[], unit: WeightUnit): ActiveExerciseState[] => {
      return exercises.map((exercise) => {
        if (exercise.template.targetPercent > 0.0) return exercise;
        const last = findLastLift(historyWorkouts, exercise.template.name);
        if (!last) return exercise;
        const kg = RankingEngine.toKg(last.weight, last.unit);
        const weight = Math.round(RankingEngine.fromKg(kg, unit) * 2.0) / 2.0;
        return {
          ...exercise,
          calculatedTargetWeight: weight,
          sets: exercise.sets.map((set) =>
            !set.isCompleted && set.actualWeight === 0.0
              ? { ...set, targetWeight: weight, actualWeight: weight }
              : set,
          ),
        };
      });
    },
    [historyWorkouts],
  );

  const beginWorkout = useCallback(
    (template: WorkoutSessionTemplate, exercises: ActiveExerciseState[], target1RMValue: number) => {
      stopTimer();
      const prefilled = applyPrefillToExercises(exercises, prefs.weightUnit);
      setActiveWorkout({
        sessionTemplate: template,
        target1RM: target1RMValue,
        unit: prefs.weightUnit,
        exercises: prefilled,
        startTimeMillis: Date.now(),
        isFinished: false,
      });
    },
    [applyPrefillToExercises, prefs.weightUnit, stopTimer],
  );

  const startSplitDay = useCallback(
    (splitId: string, dayIndex: number) => {
      const split = Splits.findSplit(splitId);
      if (!split) return;
      const day = split.days[dayIndex];
      if (!day) return;

      const templates: ExerciseTemplate[] = [];
      day.exercises.forEach((entry, index) => {
        const item = ExerciseLibrary.getById(entry.exerciseId);
        if (!item) return;
        templates.push({
          id: `${split.id}_${dayIndex}_${index}`,
          name: item.name,
          targetPercent: 0.0,
          targetReps: entry.repsMax,
          targetDurationSeconds: entry.durationSeconds,
          totalSets: entry.sets,
          isStaticHold: item.isTimed,
          repRange: item.isTimed ? null : entry.repRange,
        });
      });

      const session: WorkoutSessionTemplate = {
        id: 0,
        title: `${split.name} - ${day.name}`,
        subtitle: day.focus,
        goal: day.focus.toLowerCase(),
        exercises: templates,
      };
      beginWorkout(
        session,
        templates.map((t) => buildActiveExercise(t, 0.0)),
        prefs.target1RM,
      );
    },
    [beginWorkout, prefs.target1RM],
  );

  const startQuickWorkout = useCallback(
    (exerciseId: string | null = null) => {
      const item = exerciseId ? ExerciseLibrary.getById(exerciseId) : undefined;
      const session: WorkoutSessionTemplate = {
        id: 0,
        title: item?.name ?? 'Quick Workout',
        subtitle: 'Freestyle',
        goal: 'train what you want',
        exercises: [],
      };
      const initialExercises: ActiveExerciseState[] = [];
      if (item) {
        const holdSeconds = item.isTimed ? (item.id === 'ex_static_hold' ? 30 : 45) : 0;
        const tpl: ExerciseTemplate = {
          id: `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          name: item.name,
          targetPercent: 0.0,
          targetReps: item.defaultReps,
          targetDurationSeconds: holdSeconds,
          totalSets: item.defaultSets,
          isStaticHold: item.isTimed,
        };
        initialExercises.push(buildActiveExercise(tpl, 0.0));
      }
      beginWorkout(session, initialExercises, prefs.target1RM);
    },
    [beginWorkout, prefs.target1RM],
  );

  const addExercise = useCallback(
    (item: ExerciseItem) => {
      const holdSeconds = item.isTimed ? (item.id === 'ex_static_hold' ? 30 : 45) : 0;
      const template: ExerciseTemplate = {
        id: `${item.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        name: item.name,
        targetPercent: 0.0,
        targetReps: item.defaultReps,
        targetDurationSeconds: holdSeconds,
        totalSets: item.defaultSets,
        isStaticHold: item.isTimed,
      };
      setActiveWorkout((current) => {
        if (!current) return current;
        const raw = buildActiveExercise(template, 0.0);
        const [prefilled] = applyPrefillToExercises([raw], current.unit);
        return { ...current, exercises: [...current.exercises, prefilled] };
      });
    },
    [applyPrefillToExercises],
  );

  const removeExercise = useCallback((exerciseIndex: number) => {
    setActiveWorkout((current) => {
      if (!current || exerciseIndex < 0 || exerciseIndex >= current.exercises.length) return current;
      return {
        ...current,
        exercises: current.exercises.filter((_, idx) => idx !== exerciseIndex),
      };
    });
  }, []);

  const addSet = useCallback((exerciseIndex: number) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex, idx) => {
          if (idx !== exerciseIndex) return ex;
          const last = ex.sets[ex.sets.length - 1];
          const newSet: ExerciseSetState = {
            setIndex: ex.sets.length + 1,
            targetWeight: last?.targetWeight ?? 0.0,
            targetReps: last?.targetReps ?? ex.template.targetReps,
            actualWeight: last?.actualWeight ?? 0.0,
            actualReps: last?.actualReps ?? ex.template.targetReps,
            isCompleted: false,
            durationSeconds: last?.durationSeconds ?? ex.template.targetDurationSeconds,
          };
          return { ...ex, sets: [...ex.sets, newSet] };
        }),
      };
    });
  }, []);

  const removeSet = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex, idx) => {
          if (idx !== exerciseIndex) return ex;
          if (ex.sets.length <= 1 || setIndex < 0 || setIndex >= ex.sets.length) return ex;
          const remaining = ex.sets
            .filter((_, sIdx) => sIdx !== setIndex)
            .map((set, newIdx) => ({ ...set, setIndex: newIdx + 1 }));
          return { ...ex, sets: remaining };
        }),
      };
    });
  }, []);

  const toggleSetCompletion = useCallback((exerciseIndex: number, setIndex: number) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex, idx) =>
          idx !== exerciseIndex
            ? ex
            : {
                ...ex,
                sets: ex.sets.map((set, sIdx) =>
                  sIdx !== setIndex ? set : { ...set, isCompleted: !set.isCompleted },
                ),
              },
        ),
      };
    });
  }, []);

  const updateSetWeight = useCallback((exerciseIndex: number, setIndex: number, weight: number) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex, idx) =>
          idx !== exerciseIndex
            ? ex
            : {
                ...ex,
                sets: ex.sets.map((set, sIdx) =>
                  sIdx !== setIndex ? set : { ...set, actualWeight: weight },
                ),
              },
        ),
      };
    });
  }, []);

  const updateSetReps = useCallback((exerciseIndex: number, setIndex: number, reps: number) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex, idx) =>
          idx !== exerciseIndex
            ? ex
            : {
                ...ex,
                sets: ex.sets.map((set, sIdx) =>
                  sIdx !== setIndex ? set : { ...set, actualReps: reps },
                ),
              },
        ),
      };
    });
  }, []);

  const toggleSetAccessory = useCallback((exerciseIndex: number, setIndex: number, accessory: LiftingAccessory) => {
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex, idx) =>
          idx !== exerciseIndex
            ? ex
            : {
                ...ex,
                sets: ex.sets.map((set, sIdx) => {
                  if (sIdx !== setIndex) return set;
                  const currentAccs = set.accessories ?? [];
                  const exists = currentAccs.includes(accessory);
                  const nextAccs = exists
                    ? currentAccs.filter((a) => a !== accessory)
                    : [...currentAccs, accessory];
                  return { ...set, accessories: nextAccs };
                }),
              },
        ),
      };
    });
  }, []);

  const finishWorkout = useCallback(
    (onSaved: () => void) => {
      if (!activeWorkout) return;
      stopTimer();

      const hasCompletedSet = activeWorkout.exercises.some((ex) => ex.sets.some((s) => s.isCompleted));
      if (!hasCompletedSet) {
        setActiveWorkout(null);
        onSaved();
        return;
      }

      const durationSeconds = Math.max(0, Math.floor((Date.now() - activeWorkout.startTimeMillis) / 1000));
      const setLogs = activeWorkout.exercises.flatMap((ex) =>
        ex.sets.map((set) => ({
          exerciseName: ex.template.name,
          setIndex: set.setIndex,
          targetWeight: set.targetWeight,
          targetReps: set.targetReps,
          actualWeight: set.actualWeight,
          actualReps: set.actualReps,
          isCompleted: set.isCompleted,
          accessories: set.accessories ?? [],
        })),
      );

      const nextWorkouts = insertWorkout(
        historyWorkouts,
        {
          sessionId: activeWorkout.sessionTemplate.id,
          sessionTitle: activeWorkout.sessionTemplate.title,
          target1RM: activeWorkout.target1RM,
          unit: activeWorkout.unit,
          timestamp: Date.now(),
          totalDurationSeconds: durationSeconds,
          isCompleted: true,
        },
        setLogs,
      );

      setHistoryWorkouts(nextWorkouts);

      // Save to Firestore if signed in
      const user = auth.currentUser;
      if (user && nextWorkouts.length > 0) {
        const latest = nextWorkouts[0];
        setDoc(doc(db, 'workouts', String(latest.workoutLog.id)), {
          ...latest,
          userId: user.uid,
        }).catch((err) => console.error('Failed to save workout to Firestore:', err));
      }

      setActiveWorkout(null);
      onSaved();
    },
    [activeWorkout, historyWorkouts, stopTimer],
  );

  const cancelWorkout = useCallback(() => {
    stopTimer();
    setActiveWorkout(null);
  }, [stopTimer]);

  const deleteWorkoutLog = useCallback((logId: number) => {
    const nextWorkouts = deleteWorkoutById(historyWorkouts, logId);
    setHistoryWorkouts(nextWorkouts);

    const user = auth.currentUser;
    if (user) {
      deleteDoc(doc(db, 'workouts', String(logId))).catch((err) =>
        console.error('Failed to delete workout from Firestore:', err),
      );
    }
  }, [historyWorkouts]);

  const bestBenchLifted = useMemo(() => computeBestBenchLifted(historyWorkouts), [historyWorkouts]);
  const bestSquatLifted = useMemo(() => computeBestSquatLifted(historyWorkouts), [historyWorkouts]);
  const bestDeadliftLifted = useMemo(() => computeBestDeadliftLifted(historyWorkouts), [historyWorkouts]);
  const totalWorkoutsCompleted = historyWorkouts.length;

  const muscleRanks = useMemo(() => {
    const sets: LoggedSet[] = historyWorkouts.flatMap((w) =>
      w.sets
        .filter((s) => s.isCompleted)
        .map((s) => ({
          exerciseName: s.exerciseName,
          weightKg: RankingEngine.toKg(s.actualWeight, w.workoutLog.unit),
          reps: s.actualReps,
        })),
    );
    return RankingEngine.calculate(sets, prefs.bodyweightKg);
  }, [historyWorkouts, prefs.bodyweightKg]);

  const overallRank = useMemo(() => RankingEngine.overall(muscleRanks), [muscleRanks]);

  const value: WorkoutContextValue = {
    target1RM: prefs.target1RM,
    targetSquat1RM: prefs.targetSquat1RM,
    targetDeadlift1RM: prefs.targetDeadlift1RM,
    weightUnit: prefs.weightUnit,
    bodyweightKg: prefs.bodyweightKg,
    language,
    historyWorkouts,
    bestBenchLifted,
    bestSquatLifted,
    bestDeadliftLifted,
    totalWorkoutsCompleted,
    muscleRanks,
    overallRank,
    activeWorkout,
    timerSecondsRemaining,
    timerTotalSeconds,
    isTimerRunning,
    updateTarget1RM,
    updateTargetSquat1RM,
    updateTargetDeadlift1RM,
    updateWeightUnit,
    setLanguage,
    updateBodyweightKg,
    startSplitDay,
    startQuickWorkout,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    toggleSetCompletion,
    updateSetWeight,
    updateSetReps,
    toggleSetAccessory,
    startTimer,
    stopTimer,
    finishWorkout,
    cancelWorkout,
    deleteWorkoutLog,
  };

  return <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>;
};

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error('useWorkout must be used within WorkoutProvider');
  }
  return ctx;
}
