import { WorkoutSessionTemplate } from '../types/models';

export const SESSION_1: WorkoutSessionTemplate = {
  id: 1,
  title: 'Session 1 - Heavy / Strength',
  subtitle: 'Strength Focus',
  goal: 'get stronger',
  exercises: [
    {
      id: 's1_ex1',
      name: 'Heavy Single',
      targetPercent: 100.0,
      targetReps: 1,
      targetDurationSeconds: 0,
      totalSets: 1,
      isStaticHold: false,
    },
    {
      id: 's1_ex2',
      name: 'Bench press',
      targetPercent: 90.0,
      targetReps: 4,
      targetDurationSeconds: 0,
      totalSets: 4,
      isStaticHold: false,
    },
    {
      id: 's1_ex3',
      name: 'Paused Bench',
      targetPercent: 75.0,
      targetReps: 5,
      targetDurationSeconds: 0,
      totalSets: 3,
      isStaticHold: false,
    },
    {
      id: 's1_ex4',
      name: 'Incline Press',
      targetPercent: 75.0,
      targetReps: 6,
      targetDurationSeconds: 0,
      totalSets: 2,
      isStaticHold: false,
    },
    {
      id: 's1_ex5',
      name: 'Seated Dips',
      targetPercent: 80.0,
      targetReps: 10,
      targetDurationSeconds: 0,
      totalSets: 3,
      isStaticHold: false,
    },
  ],
};

export const SESSION_2: WorkoutSessionTemplate = {
  id: 2,
  title: 'Session 2 - Volume / Muscle',
  subtitle: 'Hypertrophy Focus',
  goal: 'build your chest and pressing volume',
  exercises: [
    {
      id: 's2_ex1',
      name: 'Static Hold',
      targetPercent: 110.0,
      targetReps: 0,
      targetDurationSeconds: 30,
      totalSets: 1,
      isStaticHold: true,
    },
    {
      id: 's2_ex2',
      name: 'Bench Press',
      targetPercent: 80.0,
      targetReps: 8,
      targetDurationSeconds: 0,
      totalSets: 3,
      isStaticHold: false,
    },
    {
      id: 's2_ex3',
      name: 'Close Grip Bench',
      targetPercent: 60.0,
      targetReps: 10,
      targetDurationSeconds: 0,
      totalSets: 3,
      isStaticHold: false,
    },
    {
      id: 's2_ex4',
      name: 'Pec Flys',
      targetPercent: 70.0,
      targetReps: 14,
      targetDurationSeconds: 0,
      totalSets: 2,
      isStaticHold: false,
    },
    {
      id: 's2_ex5',
      name: 'Rope Pushdowns',
      targetPercent: 40.0,
      targetReps: 14,
      targetDurationSeconds: 0,
      totalSets: 3,
      isStaticHold: false,
    },
  ],
};

export const SESSION_3: WorkoutSessionTemplate = {
  id: 3,
  title: 'Session 3 - Technique / Speed',
  subtitle: 'Technique & Speed Focus',
  goal: 'better bench technique + recovery',
  exercises: [
    {
      id: 's3_ex1',
      name: 'Static Hold',
      targetPercent: 110.0,
      targetReps: 0,
      targetDurationSeconds: 30,
      totalSets: 1,
      isStaticHold: true,
    },
    {
      id: 's3_ex2',
      name: 'Bench Press',
      targetPercent: 85.0,
      targetReps: 5,
      targetDurationSeconds: 0,
      totalSets: 3,
      isStaticHold: false,
    },
    {
      id: 's3_ex3',
      name: 'Paused Bench',
      targetPercent: 75.0,
      targetReps: 5,
      targetDurationSeconds: 0,
      totalSets: 3,
      isStaticHold: false,
    },
    {
      id: 's3_ex4',
      name: 'Single Arm',
      targetPercent: 15.0,
      targetReps: 12,
      targetDurationSeconds: 0,
      totalSets: 3,
      isStaticHold: false,
    },
  ],
};

export const ProgramData = {
  SESSION_1,
  SESSION_2,
  SESSION_3,
  ALL_SESSIONS: [SESSION_1, SESSION_2, SESSION_3],
  calculateWeight(target1RM: number, percent: number): number {
    const raw = target1RM * (percent / 100.0);
    return Math.round(raw / 2.5) * 2.5;
  },
};
