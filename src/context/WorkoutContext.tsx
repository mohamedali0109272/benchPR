/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ExerciseLibrary } from '../data/ExerciseLibrary';
import { RankingEngine } from '../data/RankingEngine';
import { Splits } from '../data/Splits';
import { auth, db, handleFirestoreError, onAuthStateChanged, OperationType } from '../services/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import {
  computeBestBenchLifted,
  computeBestDeadliftLifted,
  computeBestSquatLifted,
  deleteWorkoutById,
  findLastLift,
  insertWorkout,
  loadCustomAccessories,
  loadPreferences,
  loadWorkouts,
  resolveLanguage,
  saveCustomAccessories,
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
  customAccessories: string[];
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
  updateSetRpe: (exerciseIndex: number, setIndex: number, rpe: number | undefined) => void;
  toggleSetAccessory: (exerciseIndex: number, setIndex: number, accessory: LiftingAccessory) => void;
  applyExerciseAccessories: (exerciseIndex: number, accessories: LiftingAccessory[]) => void;
  addCustomAccessory: (name: string) => void;
  startTimer: (durationSeconds: number) => void;
  stopTimer: () => void;
  finishWorkout: (onSaved: () => void) => void;
  cancelWorkout: () => void;
  deleteWorkoutLog: (logId: number) => void;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

function sanitizeWorkoutForCloud(w: WorkoutWithSets, userId: string) {
  return {
    userId,
    workoutLog: {
      id: Number(w.workoutLog.id),
      sessionId: Number(w.workoutLog.sessionId ?? 0),
      sessionTitle: String(w.workoutLog.sessionTitle || 'Workout').slice(0, 200),
      target1RM: Number(w.workoutLog.target1RM || 100),
      unit: w.workoutLog.unit === 'lbs' ? 'lbs' : 'kg',
      timestamp: Number(w.workoutLog.timestamp || Date.now()),
      totalDurationSeconds: Number(w.workoutLog.totalDurationSeconds || 0),
      isCompleted: Boolean(w.workoutLog.isCompleted),
    },
    sets: (Array.isArray(w.sets) ? w.sets : []).slice(0, 200).map((s) => ({
      id: Number(s.id),
      workoutLogId: Number(s.workoutLogId),
      exerciseName: String(s.exerciseName || '').slice(0, 128),
      setIndex: Number(s.setIndex),
      targetWeight: Number(s.targetWeight || 0),
      targetReps: Number(s.targetReps || 0),
      actualWeight: Number(s.actualWeight || 0),
      actualReps: Number(s.actualReps || 0),
      isCompleted: Boolean(s.isCompleted),
      ...(typeof s.rpe === 'number' && Number.isFinite(s.rpe) && s.rpe >= 1 && s.rpe <= 10
        ? { rpe: Math.round(s.rpe * 2) / 2 }
        : {}),
      accessories: Array.isArray(s.accessories)
        ? s.accessories
            .slice(0, 16)
            .map((a) => String(a).trim().slice(0, 40))
            .filter(Boolean)
        : [],
    })),
  };
}

function buildUserCreatePayload(
  user: { uid: string; email: string | null; displayName: string | null; photoURL: string | null },
  p: StoredPreferences,
) {
  const payload: Record<string, unknown> = {
    uid: user.uid,
    email: (user.email || `${user.uid}@users.local`).slice(0, 256),
    targetBench: p.target1RM,
    targetSquat: p.targetSquat1RM,
    targetDeadlift: p.targetDeadlift1RM,
    weightUnit: p.weightUnit,
    bodyweightKg: p.bodyweightKg,
    createdAt: new Date().toISOString(),
  };
  if (user.displayName) {
    payload.displayName = user.displayName.slice(0, 128);
  }
  if (user.photoURL) {
    payload.photoURL = user.photoURL.slice(0, 512);
  }
  if (p.languageCode) {
    payload.languageCode = p.languageCode.slice(0, 16);
  }
  return payload;
}

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
  const [customAccessories, setCustomAccessories] = useState<string[]>(() => loadCustomAccessories());
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkoutState | null>(null);
  const [timerSecondsRemaining, setTimerSecondsRemaining] = useState(0);
  const [timerTotalSeconds, setTimerTotalSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerIntervalRef = useRef<number | null>(null);
  const prefsRef = useRef<StoredPreferences>(prefs);
  prefsRef.current = prefs;

  const language = useMemo(() => resolveLanguage(prefs.languageCode), [prefs.languageCode]);

  // Sync with Firestore when auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      const currentPrefs = prefsRef.current;

      // Sync user profile & prefs
      const userPath = `users/${user.uid}`;
      const userRef = doc(db, 'users', user.uid);
      try {
        let userSnap;
        try {
          userSnap = await getDoc(userRef);
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, userPath);
        }

        if (userSnap.exists()) {
          const data = userSnap.data();
          const cloudPrefs: StoredPreferences = {
            target1RM: typeof data.targetBench === 'number' && data.targetBench > 0 ? data.targetBench : currentPrefs.target1RM,
            targetSquat1RM: typeof data.targetSquat === 'number' && data.targetSquat > 0 ? data.targetSquat : currentPrefs.targetSquat1RM,
            targetDeadlift1RM: typeof data.targetDeadlift === 'number' && data.targetDeadlift > 0 ? data.targetDeadlift : currentPrefs.targetDeadlift1RM,
            weightUnit: data.weightUnit === 'lbs' ? 'lbs' : data.weightUnit === 'kg' ? 'kg' : currentPrefs.weightUnit,
            bodyweightKg: typeof data.bodyweightKg === 'number' && data.bodyweightKg >= 20 && data.bodyweightKg <= 400 ? data.bodyweightKg : currentPrefs.bodyweightKg,
            languageCode: typeof data.languageCode === 'string' ? data.languageCode : currentPrefs.languageCode,
          };
          setPrefs(cloudPrefs);
          savePreferences(cloudPrefs);
        } else {
          try {
            await setDoc(userRef, buildUserCreatePayload(user, currentPrefs));
          } catch (err) {
            handleFirestoreError(err, OperationType.CREATE, userPath);
          }
        }

        // Sync workouts
        const workoutsRef = collection(db, 'workouts');
        const q = query(workoutsRef, where('userId', '==', user.uid));
        let querySnap;
        try {
          querySnap = await getDocs(q);
        } catch (err) {
          handleFirestoreError(err, OperationType.LIST, 'workouts');
        }

        if (!querySnap.empty) {
          const cloudWorkouts: WorkoutWithSets[] = querySnap.docs.map((d) => {
            const raw = d.data() as WorkoutWithSets;
            return {
              workoutLog: raw.workoutLog,
              sets: Array.isArray(raw.sets) ? raw.sets : [],
            };
          });
          const sorted = cloudWorkouts.sort((a, b) => b.workoutLog.timestamp - a.workoutLog.timestamp);
          setHistoryWorkouts(sorted);
          saveWorkoutsList(sorted);
        } else {
          // Upload local workouts to cloud
          const local = loadWorkouts();
          for (const w of local) {
            const workoutId = String(w.workoutLog.id);
            try {
              await setDoc(doc(db, 'workouts', workoutId), sanitizeWorkoutForCloud(w, user.uid));
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `workouts/${workoutId}`);
            }
          }
        }
      } catch (err) {
        console.error('Firestore sync error on login:', err);
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
        const userRef = doc(db, 'users', user.uid);
        const updatePayload: {
          targetBench: number;
          targetSquat: number;
          targetDeadlift: number;
          weightUnit: WeightUnit;
          bodyweightKg: number;
          updatedAt: string;
          languageCode?: string;
        } = {
          targetBench: next.target1RM,
          targetSquat: next.targetSquat1RM,
          targetDeadlift: next.targetDeadlift1RM,
          weightUnit: next.weightUnit,
          bodyweightKg: next.bodyweightKg,
          updatedAt: new Date().toISOString(),
        };
        if (next.languageCode) {
          updatePayload.languageCode = next.languageCode.slice(0, 16);
        }
        updateDoc(userRef, updatePayload).catch(async (err) => {
          // If document does not exist yet, create it cleanly
          const code = (err as { code?: string })?.code;
          if (code === 'not-found') {
            try {
              await setDoc(userRef, buildUserCreatePayload(user, next));
            } catch (createErr) {
              console.error('Failed to create user profile in Firestore:', createErr);
            }
          } else {
            console.error('Failed to sync prefs to Firestore:', err);
          }
        });
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
            accessories: last?.accessories ? [...last.accessories] : undefined,
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

  const updateSetRpe = useCallback(
    (exerciseIndex: number, setIndex: number, rpe: number | undefined) => {
      const normalized =
        typeof rpe === 'number' && Number.isFinite(rpe) && rpe >= 1 && rpe <= 10
          ? Math.round(rpe * 2) / 2
          : undefined;
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
                    sIdx !== setIndex ? set : { ...set, rpe: normalized },
                  ),
                },
          ),
        };
      });
    },
    [],
  );

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

  const applyExerciseAccessories = useCallback((exerciseIndex: number, accessories: LiftingAccessory[]) => {
    const clean = Array.from(new Set(accessories.map((a) => a.trim()).filter(Boolean))).slice(0, 16);
    setActiveWorkout((current) => {
      if (!current) return current;
      return {
        ...current,
        exercises: current.exercises.map((ex, idx) =>
          idx !== exerciseIndex
            ? ex
            : {
                ...ex,
                sets: ex.sets.map((set) => ({
                  ...set,
                  accessories: [...clean],
                })),
              },
        ),
      };
    });
  }, []);

  const addCustomAccessory = useCallback((name: string) => {
    const clean = name.trim().slice(0, 40);
    if (!clean) return;
    setCustomAccessories((prev) => {
      const exists = prev.some((item) => item.toLowerCase() === clean.toLowerCase());
      if (exists) return prev;
      const next = [...prev, clean];
      saveCustomAccessories(next);
      return next;
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
          ...(typeof set.rpe === 'number' && Number.isFinite(set.rpe) ? { rpe: set.rpe } : {}),
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
        const workoutId = String(latest.workoutLog.id);
        setDoc(doc(db, 'workouts', workoutId), sanitizeWorkoutForCloud(latest, user.uid)).catch((err) => {
          console.error('Failed to save workout to Firestore:', err);
        });
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
    customAccessories,
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
    updateSetRpe,
    toggleSetAccessory,
    applyExerciseAccessories,
    addCustomAccessory,
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
