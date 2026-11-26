import { SplitDay, SplitExercise, WorkoutSplit } from '../types/models';

const e = (exerciseId: string, sets: number, reps: string): SplitExercise => {
  if (reps.endsWith('s')) {
    const durationSeconds = parseInt(reps.slice(0, -1), 10);
    return {
      exerciseId,
      sets,
      repsMin: 0,
      repsMax: 0,
      durationSeconds,
      repRange: `${durationSeconds}s`,
    };
  }
  const parts = reps.split('-');
  const repsMin = parseInt(parts[0], 10);
  const repsMax = parts.length > 1 ? parseInt(parts[1], 10) : repsMin;
  return {
    exerciseId,
    sets,
    repsMin,
    repsMax,
    durationSeconds: 0,
    repRange: repsMin === repsMax ? `${repsMin}` : `${repsMin}-${repsMax}`,
  };
};

const renamed = (day: SplitDay, name: string): SplitDay => ({ ...day, name });

// Push / Pull / Legs
const pushA: SplitDay = {
  name: 'Push A',
  focus: 'Chest, shoulders, triceps',
  exercises: [
    e('ex_bench', 4, '6-8'),
    e('ex_incline', 3, '8-10'),
    e('ex_ohp', 3, '8-10'),
    e('ex_lateral_raise', 3, '12-15'),
    e('ex_rope_push', 3, '10-12'),
    e('ex_overhead_tricep_ext', 3, '12'),
  ],
};
const pullA: SplitDay = {
  name: 'Pull A',
  focus: 'Back, biceps, rear delts',
  exercises: [
    e('ex_barbell_row', 4, '6-8'),
    e('ex_lat_pulldown', 3, '8-12'),
    e('ex_seated_row', 3, '10-12'),
    e('ex_face_pull', 3, '15'),
    e('ex_bicep_curl', 3, '8-10'),
    e('ex_hammer_curl', 3, '10-12'),
  ],
};
const legsA: SplitDay = {
  name: 'Legs A',
  focus: 'Quads, hamstrings, calves',
  exercises: [
    e('ex_squat', 4, '6-8'),
    e('ex_romanian_deadlift', 3, '8-10'),
    e('ex_leg_press', 3, '10-12'),
    e('ex_leg_curl', 3, '10-12'),
    e('ex_standing_calf', 4, '12-15'),
  ],
};
const pushB: SplitDay = {
  name: 'Push B',
  focus: 'Shoulders, chest, triceps',
  exercises: [
    e('ex_ohp', 4, '6-8'),
    e('ex_db_bench', 3, '8-12'),
    e('ex_db_incline', 3, '10-12'),
    e('ex_lateral_raise', 4, '12-15'),
    e('ex_dips', 3, '8-12'),
    e('ex_skull_crusher', 3, '10-12'),
  ],
};
const pullB: SplitDay = {
  name: 'Pull B',
  focus: 'Lats, traps, biceps',
  exercises: [
    e('ex_pullup', 4, '6-10'),
    e('ex_db_row', 3, '8-12'),
    e('ex_rear_delt_fly', 3, '15'),
    e('ex_db_shrug', 3, '12'),
    e('ex_preacher_curl', 3, '10-12'),
    e('ex_incline_curl', 3, '12'),
  ],
};
const legsB: SplitDay = {
  name: 'Legs B',
  focus: 'Posterior chain, quads, abs',
  exercises: [
    e('ex_deadlift', 3, '5'),
    e('ex_front_squat', 3, '8'),
    e('ex_lunge', 3, '12'),
    e('ex_leg_extension', 3, '12-15'),
    e('ex_seated_calf', 4, '15'),
    e('ex_hanging_leg_raise', 3, '12'),
  ],
};

// Upper / Lower
const upperA: SplitDay = {
  name: 'Upper A',
  focus: 'Strength',
  exercises: [
    e('ex_bench', 4, '5'),
    e('ex_barbell_row', 4, '5'),
    e('ex_ohp', 3, '6-8'),
    e('ex_lat_pulldown', 3, '8-10'),
    e('ex_bicep_curl', 2, '8-10'),
    e('ex_skull_crusher', 2, '8-10'),
  ],
};
const lowerA: SplitDay = {
  name: 'Lower A',
  focus: 'Strength',
  exercises: [
    e('ex_squat', 4, '5'),
    e('ex_romanian_deadlift', 3, '6-8'),
    e('ex_leg_press', 3, '10'),
    e('ex_leg_curl', 3, '10'),
    e('ex_standing_calf', 4, '10-12'),
  ],
};
const upperB: SplitDay = {
  name: 'Upper B',
  focus: 'Volume',
  exercises: [
    e('ex_db_incline', 4, '8-12'),
    e('ex_seated_row', 4, '10-12'),
    e('ex_db_shoulder_press', 3, '10-12'),
    e('ex_pullup', 3, '6-10'),
    e('ex_lateral_raise', 3, '15'),
    e('ex_hammer_curl', 3, '12'),
    e('ex_rope_push', 3, '12'),
  ],
};
const lowerB: SplitDay = {
  name: 'Lower B',
  focus: 'Volume',
  exercises: [
    e('ex_deadlift', 3, '5'),
    e('ex_hack_squat', 3, '10-12'),
    e('ex_hip_thrust', 3, '10-12'),
    e('ex_leg_extension', 3, '12-15'),
    e('ex_seated_calf', 4, '15'),
    e('ex_cable_crunch', 3, '15'),
  ],
};

// Full Body
const fullA: SplitDay = {
  name: 'Full Body A',
  focus: 'Squat and bench focus',
  exercises: [
    e('ex_squat', 3, '5-8'),
    e('ex_bench', 3, '5-8'),
    e('ex_barbell_row', 3, '6-10'),
    e('ex_ohp', 2, '8-10'),
    e('ex_bicep_curl', 2, '10-12'),
    e('ex_plank', 3, '45s'),
  ],
};
const fullB: SplitDay = {
  name: 'Full Body B',
  focus: 'Deadlift and incline focus',
  exercises: [
    e('ex_deadlift', 3, '5'),
    e('ex_incline', 3, '8-10'),
    e('ex_lat_pulldown', 3, '8-12'),
    e('ex_lunge', 3, '10-12'),
    e('ex_lateral_raise', 3, '12-15'),
    e('ex_rope_push', 3, '12'),
  ],
};
const fullC: SplitDay = {
  name: 'Full Body C',
  focus: 'Volume and hinge focus',
  exercises: [
    e('ex_front_squat', 3, '6-8'),
    e('ex_db_bench', 3, '8-12'),
    e('ex_seated_row', 3, '10-12'),
    e('ex_romanian_deadlift', 3, '8-10'),
    e('ex_db_curl', 2, '12'),
    e('ex_standing_calf', 3, '12-15'),
    e('ex_hanging_leg_raise', 3, '12'),
  ],
};

// Bro Split
const broChest: SplitDay = {
  name: 'Chest',
  focus: 'Pecs',
  exercises: [
    e('ex_bench', 4, '6-10'),
    e('ex_incline', 4, '8-10'),
    e('ex_db_bench', 3, '10-12'),
    e('ex_pec_fly', 3, '12-15'),
    e('ex_cable_crossover', 3, '12-15'),
    e('ex_pushup', 2, '15'),
  ],
};
const broBack: SplitDay = {
  name: 'Back',
  focus: 'Lats, traps, lower back',
  exercises: [
    e('ex_deadlift', 4, '5'),
    e('ex_barbell_row', 4, '8-10'),
    e('ex_lat_pulldown', 3, '10-12'),
    e('ex_seated_row', 3, '10-12'),
    e('ex_db_row', 3, '10-12'),
    e('ex_barbell_shrug', 3, '12'),
  ],
};
const broShoulders: SplitDay = {
  name: 'Shoulders',
  focus: 'Delts and traps',
  exercises: [
    e('ex_ohp', 4, '6-10'),
    e('ex_db_shoulder_press', 3, '10-12'),
    e('ex_lateral_raise', 4, '12-15'),
    e('ex_front_raise', 3, '12'),
    e('ex_rear_delt_fly', 4, '15'),
    e('ex_db_shrug', 3, '12'),
  ],
};
const broArms: SplitDay = {
  name: 'Arms',
  focus: 'Biceps, triceps, forearms',
  exercises: [
    e('ex_close_grip', 4, '8-10'),
    e('ex_bicep_curl', 4, '8-12'),
    e('ex_skull_crusher', 3, '10-12'),
    e('ex_preacher_curl', 3, '10-12'),
    e('ex_rope_push', 3, '12-15'),
    e('ex_hammer_curl', 3, '12'),
    e('ex_wrist_curl', 3, '15'),
  ],
};
const broLegs: SplitDay = {
  name: 'Legs',
  focus: 'Quads, hamstrings, calves',
  exercises: [
    e('ex_squat', 4, '6-10'),
    e('ex_leg_press', 4, '10-12'),
    e('ex_romanian_deadlift', 3, '8-10'),
    e('ex_leg_extension', 3, '12-15'),
    e('ex_leg_curl', 3, '12-15'),
    e('ex_standing_calf', 5, '12-15'),
  ],
};

// Arnold Split
const arnoldChestBack: SplitDay = {
  name: 'Chest & Back',
  focus: 'Antagonist supersets',
  exercises: [
    e('ex_bench', 4, '8-10'),
    e('ex_incline', 4, '8-10'),
    e('ex_pec_fly', 3, '10-12'),
    e('ex_pullup', 4, '8-12'),
    e('ex_barbell_row', 4, '8-10'),
    e('ex_deadlift', 3, '6-8'),
  ],
};
const arnoldShouldersArms: SplitDay = {
  name: 'Shoulders & Arms',
  focus: 'Delts, biceps, triceps',
  exercises: [
    e('ex_ohp', 4, '8-10'),
    e('ex_arnold_press', 3, '10-12'),
    e('ex_lateral_raise', 4, '12-15'),
    e('ex_bicep_curl', 4, '8-10'),
    e('ex_skull_crusher', 4, '8-10'),
    e('ex_hammer_curl', 3, '10-12'),
    e('ex_rope_push', 3, '12'),
    e('ex_wrist_curl', 3, '15'),
  ],
};
const arnoldLegsAbs: SplitDay = {
  name: 'Legs & Abs',
  focus: 'Lower body and core',
  exercises: [
    e('ex_squat', 4, '8-10'),
    e('ex_leg_press', 3, '10-12'),
    e('ex_romanian_deadlift', 3, '8-10'),
    e('ex_leg_curl', 3, '12'),
    e('ex_standing_calf', 5, '12-15'),
    e('ex_hanging_leg_raise', 3, '12'),
    e('ex_cable_crunch', 3, '15'),
  ],
};

// PHUL
const phulUpperPower: SplitDay = {
  name: 'Upper Power',
  focus: 'Heavy compounds',
  exercises: [
    e('ex_bench', 4, '3-5'),
    e('ex_db_incline', 3, '6-10'),
    e('ex_barbell_row', 4, '3-5'),
    e('ex_lat_pulldown', 3, '6-10'),
    e('ex_ohp', 3, '5-8'),
    e('ex_bicep_curl', 3, '6-10'),
    e('ex_skull_crusher', 3, '6-10'),
  ],
};
const phulLowerPower: SplitDay = {
  name: 'Lower Power',
  focus: 'Heavy compounds',
  exercises: [
    e('ex_squat', 4, '3-5'),
    e('ex_deadlift', 3, '3-5'),
    e('ex_leg_press', 5, '10-15'),
    e('ex_leg_curl', 3, '6-10'),
    e('ex_standing_calf', 4, '6-10'),
  ],
};
const phulUpperHyper: SplitDay = {
  name: 'Upper Hypertrophy',
  focus: 'Volume work',
  exercises: [
    e('ex_incline', 4, '8-12'),
    e('ex_pec_fly', 3, '12-15'),
    e('ex_seated_row', 4, '8-12'),
    e('ex_db_row', 3, '10-14'),
    e('ex_db_shoulder_press', 3, '8-12'),
    e('ex_lateral_raise', 3, '12-15'),
    e('ex_cable_curl', 3, '10-14'),
    e('ex_overhead_tricep_ext', 3, '10-14'),
  ],
};
const phulLowerHyper: SplitDay = {
  name: 'Lower Hypertrophy',
  focus: 'Volume work',
  exercises: [
    e('ex_front_squat', 4, '8-12'),
    e('ex_lunge', 3, '10-14'),
    e('ex_leg_extension', 3, '12-15'),
    e('ex_romanian_deadlift', 3, '8-12'),
    e('ex_leg_curl', 3, '10-14'),
    e('ex_seated_calf', 4, '12-15'),
    e('ex_standing_calf', 3, '12-15'),
  ],
};

// 5x5
const fiveByFiveA: SplitDay = {
  name: 'Workout A',
  focus: 'Squat, bench, row',
  exercises: [
    e('ex_squat', 5, '5'),
    e('ex_bench', 5, '5'),
    e('ex_barbell_row', 5, '5'),
  ],
};
const fiveByFiveB: SplitDay = {
  name: 'Workout B',
  focus: 'Squat, press, deadlift',
  exercises: [
    e('ex_squat', 5, '5'),
    e('ex_ohp', 5, '5'),
    e('ex_deadlift', 1, '5'),
  ],
};

export const ALL_SPLITS: WorkoutSplit[] = [
  {
    id: 'ppl6',
    name: 'Push / Pull / Legs (6-Day)',
    tagline: 'Every muscle twice a week',
    level: 'Intermediate',
    goal: 'Hypertrophy',
    daysPerWeek: 6,
    days: [pushA, pullA, legsA, pushB, pullB, legsB],
  },
  {
    id: 'ppl3',
    name: 'Push / Pull / Legs (3-Day)',
    tagline: 'Classic split, one rest day between sessions',
    level: 'Beginner',
    goal: 'Hypertrophy',
    daysPerWeek: 3,
    days: [pushA, pullA, legsA],
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower (4-Day)',
    tagline: 'Strength day then volume day for each half',
    level: 'Intermediate',
    goal: 'Strength + size',
    daysPerWeek: 4,
    days: [upperA, lowerA, upperB, lowerB],
  },
  {
    id: 'full_body',
    name: 'Full Body (3-Day)',
    tagline: 'Train everything three times a week',
    level: 'Beginner',
    goal: 'General strength',
    daysPerWeek: 3,
    days: [fullA, fullB, fullC],
  },
  {
    id: 'bro',
    name: 'Bro Split (5-Day)',
    tagline: 'One muscle group per day, high volume',
    level: 'Intermediate',
    goal: 'Hypertrophy',
    daysPerWeek: 5,
    days: [broChest, broBack, broShoulders, broArms, broLegs],
  },
  {
    id: 'arnold',
    name: 'Arnold Split (6-Day)',
    tagline: 'Chest and back, shoulders and arms, legs, twice a week',
    level: 'Advanced',
    goal: 'Hypertrophy',
    daysPerWeek: 6,
    days: [
      arnoldChestBack,
      arnoldShouldersArms,
      arnoldLegsAbs,
      renamed(arnoldChestBack, 'Chest & Back 2'),
      renamed(arnoldShouldersArms, 'Shoulders & Arms 2'),
      renamed(arnoldLegsAbs, 'Legs & Abs 2'),
    ],
  },
  {
    id: 'phul',
    name: 'PHUL (4-Day)',
    tagline: 'Power Hypertrophy Upper Lower',
    level: 'Intermediate',
    goal: 'Strength + size',
    daysPerWeek: 4,
    days: [phulUpperPower, phulLowerPower, phulUpperHyper, phulLowerHyper],
  },
  {
    id: 'ppl_ul',
    name: 'PPL + Upper / Lower (5-Day)',
    tagline: 'Push, pull, legs, then upper and lower',
    level: 'Intermediate',
    goal: 'Strength + size',
    daysPerWeek: 5,
    days: [
      renamed(pushA, 'Push'),
      renamed(pullA, 'Pull'),
      renamed(legsA, 'Legs'),
      renamed(upperB, 'Upper'),
      renamed(lowerB, 'Lower'),
    ],
  },
  {
    id: 'five_by_five',
    name: '5x5 Strength (A/B)',
    tagline: 'Alternate two simple barbell workouts',
    level: 'Beginner',
    goal: 'Strength',
    daysPerWeek: 3,
    days: [fiveByFiveA, fiveByFiveB],
  },
];

export const Splits = {
  ALL_SPLITS,
  findSplit(id: string): WorkoutSplit | undefined {
    return ALL_SPLITS.find((s) => s.id === id);
  },
};
