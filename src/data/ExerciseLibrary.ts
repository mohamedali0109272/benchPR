import { ExerciseItem, MUSCLE_DISPLAY_NAMES, MuscleGroup } from '../types/models';

const ex = (
  id: string,
  name: string,
  muscleGroup: MuscleGroup,
  description: string,
  strengthRef: number,
  secondaryMuscles: MuscleGroup[] = [],
  options: {
    bodyweightFactor?: number;
    isTimed?: boolean;
    sets?: number;
    reps?: number;
  } = {},
): ExerciseItem => ({
  id,
  name,
  muscleGroup,
  description,
  secondaryMuscles,
  strengthRef,
  bodyweightFactor: options.bodyweightFactor ?? 0.0,
  isTimed: options.isTimed ?? false,
  defaultSets: options.sets ?? 3,
  defaultReps: options.reps ?? 10,
});

const C = MuscleGroup.CHEST;
const SH = MuscleGroup.SHOULDERS;
const BI = MuscleGroup.BICEPS;
const TRI = MuscleGroup.TRICEPS;
const FA = MuscleGroup.FOREARMS;
const CORE = MuscleGroup.CORE;
const TRAP = MuscleGroup.TRAPS;
const LAT = MuscleGroup.LATS;
const LB = MuscleGroup.LOWER_BACK;
const GL = MuscleGroup.GLUTES;
const QD = MuscleGroup.QUADS;
const HAM = MuscleGroup.HAMSTRINGS;
const CALF = MuscleGroup.CALVES;

export const PRESET_EXERCISES: ExerciseItem[] = [
  // ---- Chest ----
  ex('ex_bench', 'Bench Press', C, 'Compound barbell press for pectoral strength.', 1.25, [TRI, SH], { reps: 8 }),
  ex('ex_paused_bench', 'Paused Bench Press', C, 'Bench press with a 1-second pause on chest.', 1.1, [TRI, SH], { reps: 5 }),
  ex('ex_incline', 'Incline Press', C, 'Upper chest focused pressing movement.', 1.0, [SH, TRI], { reps: 8 }),
  ex('ex_decline_bench', 'Decline Bench Press', C, 'Lower chest focused barbell press.', 1.2, [TRI, SH], { reps: 8 }),
  ex('ex_db_bench', 'Dumbbell Bench Press', C, 'Dumbbell press with a deeper stretch. Log weight per dumbbell.', 0.5, [TRI, SH]),
  ex('ex_db_incline', 'Incline Dumbbell Press', C, 'Upper chest dumbbell press. Log weight per dumbbell.', 0.45, [SH, TRI]),
  ex('ex_chest_press_machine', 'Chest Press Machine', C, 'Machine press, great for chasing failure safely.', 1.0, [TRI, SH], { reps: 12 }),
  ex('ex_pec_fly', 'Pec Flys', C, 'Isolation flys for chest hypertrophy.', 0.55, [], { reps: 12 }),
  ex('ex_pec_deck', 'Pec Deck Fly', C, 'Seated machine fly for constant chest tension.', 0.7, [], { reps: 12 }),
  ex('ex_cable_crossover', 'Cable Crossover', C, 'Cable fly with constant tension across the chest.', 0.35, [], { reps: 12 }),
  ex('ex_smith_bench', 'Smith Machine Bench Press', C, 'Guided barbell press for stable chest hypertrophy.', 1.2, [TRI, SH], { reps: 10 }),
  ex('ex_pushup', 'Push-Ups', C, 'Bodyweight press. Add weight if it gets easy.', 1.0, [TRI, SH], { bodyweightFactor: 0.65, reps: 15 }),
  ex('ex_static_hold', 'Static Hold', C, 'Isometric overload pressing hold.', 0.0, [TRI, SH], { isTimed: true, sets: 1, reps: 0 }),

  // ---- Shoulders ----
  ex('ex_ohp', 'Overhead Press', SH, 'Strict barbell shoulder press.', 0.8, [TRI, TRAP], { reps: 8 }),
  ex('ex_db_shoulder_press', 'Dumbbell Shoulder Press', SH, 'Seated or standing dumbbell press. Log weight per dumbbell.', 0.35, [TRI]),
  ex('ex_machine_shoulder_press', 'Machine Shoulder Press', SH, 'Guided overhead press for safe shoulder overload.', 0.85, [TRI], { reps: 10 }),
  ex('ex_arnold_press', 'Arnold Press', SH, 'Rotating dumbbell press hitting all three delt heads.', 0.3, [TRI]),
  ex('ex_lateral_raise', 'Lateral Raises', SH, 'Dumbbell isolation for side delts.', 0.15, [], { reps: 15 }),
  ex('ex_cable_lateral_raise', 'Cable Lateral Raise', SH, 'Constant-tension cable raise for side delts.', 0.18, [], { reps: 15 }),
  ex('ex_front_raise', 'Front Raises', SH, 'Anterior delt isolation.', 0.15, [], { reps: 12 }),
  ex('ex_rear_delt_fly', 'Rear Delt Fly', SH, 'Reverse fly for rear delts and upper back.', 0.2, [TRAP], { reps: 15 }),
  ex('ex_reverse_pec_deck', 'Reverse Pec Deck', SH, 'Machine reverse fly targeting rear delts and upper back.', 0.45, [TRAP], { reps: 15 }),
  ex('ex_face_pull', 'Face Pulls', SH, 'Cable pull to the face for rear delts and shoulder health.', 0.45, [TRAP], { reps: 15 }),
  ex('ex_upright_row', 'Upright Row', SH, 'Barbell or cable pull to the chest for delts and traps.', 0.7, [TRAP, BI], { reps: 10 }),

  // ---- Biceps ----
  ex('ex_bicep_curl', 'Barbell Bicep Curl', BI, 'Classic mass builder for biceps.', 0.6, [FA]),
  ex('ex_ez_bar_curl', 'EZ-Bar Curl', BI, 'Angled bar curl that eases wrist strain while loading biceps.', 0.6, [FA]),
  ex('ex_db_curl', 'Dumbbell Curl', BI, 'Alternating or seated curls. Log weight per dumbbell.', 0.25, [FA]),
  ex('ex_hammer_curl', 'Hammer Curls', BI, 'Brachialis and forearm builder. Log weight per dumbbell.', 0.28, [FA]),
  ex('ex_preacher_curl', 'Preacher Curl', BI, 'Strict curl on a preacher bench for the short head.', 0.5, [FA]),
  ex('ex_incline_curl', 'Incline Dumbbell Curl', BI, 'Long-head stretch curl. Log weight per dumbbell.', 0.2, [FA]),
  ex('ex_cable_curl', 'Cable Curl', BI, 'Constant tension curl on the cable stack.', 0.5, [FA], { reps: 12 }),
  ex('ex_bayesian_curl', 'Bayesian Cable Curl', BI, 'Behind-the-body cable curl for a deep long-head stretch.', 0.25, [FA], { reps: 12 }),
  ex('ex_concentration_curl', 'Concentration Curl', BI, 'Strict seated single-arm curl for peak contraction. Log weight per dumbbell.', 0.22, [FA], { reps: 12 }),
  ex('ex_spider_curl', 'Spider Curl', BI, 'Chest-supported incline curl isolating the biceps with zero swing.', 0.45, [FA], { reps: 12 }),

  // ---- Triceps ----
  ex('ex_close_grip', 'Close Grip Bench Press', TRI, 'Compound press focusing heavily on triceps.', 1.1, [C, SH], { reps: 8 }),
  ex('ex_jm_press', 'JM Press', TRI, 'Hybrid close-grip press and extension for raw tricep strength.', 0.95, [C, SH], { reps: 8 }),
  ex('ex_rope_push', 'Rope Pushdowns', TRI, 'Cable isolation for tricep lockout power.', 0.6, [], { reps: 12 }),
  ex('ex_seated_dips', 'Seated Dips', TRI, 'Weighted dip for triceps and lower chest.', 1.0, [C, SH]),
  ex('ex_dips', 'Dips', TRI, 'Parallel bar dips. Add weight when bodyweight gets easy.', 1.5, [C, SH], { bodyweightFactor: 1.0, reps: 10 }),
  ex('ex_skull_crusher', 'Skull Crushers', TRI, 'Lying EZ-bar extension for the long head.', 0.6, [], { reps: 10 }),
  ex('ex_overhead_tricep_ext', 'Overhead Tricep Extension', TRI, 'Overhead cable or dumbbell extension.', 0.5, [], { reps: 12 }),
  ex('ex_single_arm', 'Single Arm Extension', TRI, 'Unilateral cable or dumbbell tricep extension.', 0.25, [], { reps: 12 }),
  ex('ex_tricep_kickback', 'Tricep Kickback', TRI, 'Bent-over dumbbell extension for peak tricep contraction. Log weight per dumbbell.', 0.18, [], { reps: 15 }),

  // ---- Forearms ----
  ex('ex_wrist_curl', 'Wrist Curl', FA, 'Barbell or dumbbell wrist flexion.', 0.4, [], { reps: 15 }),
  ex('ex_reverse_wrist_curl', 'Reverse Wrist Curl', FA, 'Overhand wrist extension targeting the forearm extensors.', 0.3, [], { reps: 15 }),
  ex('ex_reverse_curl', 'Reverse Curl', FA, 'Overhand curl for forearm extensors and brachialis.', 0.4, [BI], { reps: 12 }),
  ex('ex_farmers_walk', "Farmer's Walk", FA, 'Heavy loaded carry for grip strength, traps, and core stability. Log weight per hand.', 0.7, [TRAP, CORE], { reps: 1 }),
  ex('ex_dead_hang', 'Dead Hang', FA, 'Timed bar hang for grip endurance and shoulder decompression.', 0.0, [LAT], { bodyweightFactor: 1.0, isTimed: true, sets: 3, reps: 0 }),

  // ---- Traps ----
  ex('ex_barbell_shrug', 'Barbell Shrug', TRAP, 'Heavy shrug for upper trap mass.', 1.5, [FA], { reps: 12 }),
  ex('ex_db_shrug', 'Dumbbell Shrug', TRAP, 'Dumbbell shrug. Log weight per dumbbell.', 0.6, [FA], { reps: 12 }),
  ex('ex_rack_pull', 'Rack Pull', TRAP, 'Partial deadlift from knee height for traps and upper back.', 2.0, [LB, GL, FA], { reps: 5 }),

  // ---- Lats / Back ----
  ex('ex_deadlift', 'Deadlift', LB, 'Ultimate posterior chain compound lift.', 1.75, [GL, HAM, TRAP, FA], { reps: 5, sets: 3 }),
  ex('ex_barbell_row', 'Barbell Row', LAT, 'Heavy compound rowing for mid-back thickness.', 1.1, [TRAP, BI, LB], { reps: 8 }),
  ex('ex_pendlay_row', 'Pendlay Row', LAT, 'Strict barbell row pulled explosively from the floor each rep.', 1.05, [TRAP, BI, LB], { reps: 8 }),
  ex('ex_seal_row', 'Seal Row', LAT, 'Chest-supported horizontal row eliminating lower-back momentum.', 0.95, [TRAP, BI], { reps: 10 }),
  ex('ex_db_row', 'Dumbbell Row', LAT, 'One-arm row. Log weight per dumbbell.', 0.5, [TRAP, BI]),
  ex('ex_seated_row', 'Seated Cable Row', LAT, 'Cable row for lat and mid-back volume.', 1.0, [TRAP, BI], { reps: 12 }),
  ex('ex_tbar_row', 'T-Bar Row', LAT, 'Chest-supported or standing T-bar row.', 1.0, [TRAP, BI]),
  ex('ex_chest_supported_row', 'Chest-Supported Row', LAT, 'Machine or incline bench row for strict mid-back isolation.', 1.0, [TRAP, BI], { reps: 10 }),
  ex('ex_lat_pulldown', 'Lat Pulldown', LAT, 'Vertical pulling for lat width.', 1.0, [BI], { reps: 10 }),
  ex('ex_straight_arm_pulldown', 'Straight-Arm Pulldown', LAT, 'Cable lat isolation keeping arms nearly straight through the arc.', 0.55, [CORE], { reps: 12 }),
  ex('ex_pullup', 'Pull-Ups', LAT, 'Bodyweight vertical pull. Add weight when it gets easy.', 1.4, [BI, FA], { bodyweightFactor: 1.0, reps: 8 }),
  ex('ex_chinup', 'Chin-Ups', LAT, 'Underhand pull-up with more biceps involvement.', 1.4, [BI, FA], { bodyweightFactor: 1.0, reps: 8 }),

  // ---- Lower back ----
  ex('ex_back_extension', 'Back Extension', LB, 'Hyperextension for the spinal erectors.', 0.8, [GL, HAM], { bodyweightFactor: 0.4, reps: 12 }),
  ex('ex_good_morning', 'Good Morning', LB, 'Barbell hip hinge for erectors and hamstrings.', 0.8, [HAM, GL], { reps: 8 }),
  ex('ex_superman', 'Superman Hold', LB, 'Isometric floor back extension for spinal erectors.', 0.0, [GL], { bodyweightFactor: 0.3, isTimed: true, sets: 3, reps: 0 }),
  ex('ex_reverse_hyper', 'Reverse Hyperextension', LB, 'Lower-back and glute swing without axial spinal compression.', 0.9, [GL, HAM], { reps: 12 }),

  // ---- Quads ----
  ex('ex_squat', 'Barbell Squat', QD, 'King of lower body compound lifts.', 1.5, [GL, HAM, LB], { reps: 6, sets: 4 }),
  ex('ex_front_squat', 'Front Squat', QD, 'Quad-dominant squat with an upright torso.', 1.25, [GL, CORE], { reps: 6 }),
  ex('ex_goblet_squat', 'Goblet Squat', QD, 'Dumbbell or kettlebell front-loaded squat for deep quad work.', 0.65, [GL, CORE], { reps: 10 }),
  ex('ex_bulgarian_split_squat', 'Bulgarian Split Squat', QD, 'Rear-foot-elevated single-leg squat. Log weight per dumbbell.', 0.45, [GL, HAM], { bodyweightFactor: 0.35, reps: 10 }),
  ex('ex_step_up', 'Dumbbell Step-Up', QD, 'Single-leg box step-up for quads and glutes. Log weight per dumbbell.', 0.35, [GL], { bodyweightFactor: 0.3, reps: 12 }),
  ex('ex_sissy_squat', 'Sissy Squat', QD, 'Leaning knee-flexion squat isolating the quadriceps.', 0.9, [], { bodyweightFactor: 0.65, reps: 12 }),
  ex('ex_leg_press', 'Leg Press', QD, 'Machine quad and glute press.', 2.7, [GL, HAM], { reps: 12 }),
  ex('ex_hack_squat', 'Hack Squat', QD, 'Machine squat that loads the quads.', 1.5, [GL], { reps: 10 }),
  ex('ex_leg_extension', 'Leg Extension', QD, 'Machine quad isolation.', 0.9, [], { reps: 12 }),
  ex('ex_lunge', 'Walking Lunges', QD, 'Dumbbell lunges. Log weight per dumbbell.', 0.4, [GL, HAM], { reps: 12 }),

  // ---- Hamstrings ----
  ex('ex_romanian_deadlift', 'Romanian Deadlift', HAM, 'Hamstring and glute hinging movement.', 1.4, [GL, LB], { reps: 8 }),
  ex('ex_stiff_leg_deadlift', 'Stiff-Legged Deadlift', HAM, 'Straight-leg barbell hinge (SLDL) for deep hamstring stretch and strength.', 1.35, [GL, LB], { reps: 8 }),
  ex('ex_leg_curl', 'Leg Curl', HAM, 'Machine hamstring isolation.', 0.75, [], { reps: 12 }),
  ex('ex_seated_leg_curl', 'Seated Leg Curl', HAM, 'Seated machine curl maximizing hamstring stretch under load.', 0.8, [], { reps: 12 }),
  ex('ex_nordic_curl', 'Nordic Hamstring Curl', HAM, 'Bodyweight eccentric hamstring curl from a kneeling anchor.', 1.1, [GL], { bodyweightFactor: 0.7, reps: 6 }),

  // ---- Glutes ----
  ex('ex_sumo_deadlift', 'Sumo Deadlift', GL, 'Wide-stance barbell deadlift emphasizing glutes, hips, and quads.', 1.75, [LB, QD, HAM, TRAP, FA], { reps: 5, sets: 3 }),
  ex('ex_hip_thrust', 'Hip Thrust', GL, 'Barbell glute thrust, the best glute loader.', 1.75, [HAM], { reps: 10 }),
  ex('ex_glute_bridge', 'Glute Bridge', GL, 'Floor barbell bridge targeting peak glute lockout.', 1.6, [HAM], { reps: 12 }),
  ex('ex_cable_kickback', 'Cable Kickback', GL, 'Cable glute isolation.', 0.3, [], { reps: 15 }),
  ex('ex_hip_abduction', 'Hip Abduction Machine', GL, 'Seated machine abduction targeting upper glutes and glute medius.', 0.9, [], { reps: 15 }),

  // ---- Calves ----
  ex('ex_standing_calf', 'Standing Calf Raise', CALF, 'Gastrocnemius focused calf raise.', 1.75, [], { reps: 15 }),
  ex('ex_seated_calf', 'Seated Calf Raise', CALF, 'Soleus focused calf raise.', 1.0, [], { reps: 15 }),
  ex('ex_leg_press_calf', 'Leg Press Calf Raise', CALF, 'Heavy calf press using the leg press sled.', 1.8, [], { reps: 15 }),
  ex('ex_donkey_calf', 'Donkey Calf Raise', CALF, 'Bent-hip calf raise for maximum gastrocnemius stretch.', 1.5, [], { reps: 15 }),

  // ---- Core ----
  ex('ex_plank', 'Plank', CORE, 'Isometric core stabilization.', 0.0, [], { isTimed: true, sets: 3, reps: 0 }),
  ex('ex_side_plank', 'Side Plank', CORE, 'Isometric lateral hold for obliques and hip stability.', 0.0, [], { isTimed: true, sets: 3, reps: 0 }),
  ex('ex_hanging_leg_raise', 'Hanging Leg Raises', CORE, 'Lower abdominal strength.', 0.9, [], { bodyweightFactor: 0.5, reps: 12 }),
  ex('ex_cable_crunch', 'Cable Crunch', CORE, 'Weighted crunch for the abs.', 0.9, [], { reps: 15 }),
  ex('ex_decline_situp', 'Decline Sit-Up', CORE, 'Decline bench sit-up for progressive abdominal strength.', 0.8, [], { bodyweightFactor: 0.45, reps: 15 }),
  ex('ex_ab_wheel', 'Ab Wheel Rollout', CORE, 'Anti-extension core exercise.', 1.0, [], { bodyweightFactor: 0.6, reps: 10 }),
  ex('ex_russian_twist', 'Russian Twist', CORE, 'Rotational core work for the obliques.', 0.3, [], { reps: 20 }),
  ex('ex_cable_woodchopper', 'Cable Woodchopper', CORE, 'Diagonal cable rotation targeting obliques and rotational power.', 0.45, [SH], { reps: 12 }),
];

const byId = new Map<string, ExerciseItem>(PRESET_EXERCISES.map((item) => [item.id, item]));

const aliases: Record<string, string> = {
  'heavy single': 'ex_bench',
  'paused bench': 'ex_paused_bench',
  'close grip bench': 'ex_close_grip',
  'single arm': 'ex_single_arm',
  sldl: 'ex_stiff_leg_deadlift',
  'stiff leg deadlift': 'ex_stiff_leg_deadlift',
  'stiff-leg deadlift': 'ex_stiff_leg_deadlift',
  rdl: 'ex_romanian_deadlift',
  ohp: 'ex_ohp',
  cgbp: 'ex_close_grip',
  bss: 'ex_bulgarian_split_squat',
  'ez curl': 'ex_ez_bar_curl',
};

const aliasesById = new Map<string, string[]>();
const byName = new Map<string, ExerciseItem>();
for (const item of PRESET_EXERCISES) {
  byName.set(item.name.toLowerCase(), item);
}
for (const [alias, id] of Object.entries(aliases)) {
  const found = byId.get(id);
  if (found) {
    byName.set(alias, found);
    const list = aliasesById.get(id) ?? [];
    list.push(alias);
    aliasesById.set(id, list);
  }
}

export const ExerciseLibrary = {
  PRESET_EXERCISES,
  getById(id: string): ExerciseItem | undefined {
    return byId.get(id);
  },
  findByName(name: string): ExerciseItem | undefined {
    return byName.get(name.trim().toLowerCase());
  },
  getByMuscle(muscleGroup: MuscleGroup): ExerciseItem[] {
    return PRESET_EXERCISES.filter((item) => item.muscleGroup === muscleGroup);
  },
  search(
    query: string,
    muscle: MuscleGroup | null = null,
    translate?: (text: string) => string,
  ): ExerciseItem[] {
    const q = query.trim().toLowerCase();
    return PRESET_EXERCISES.filter((item) => {
      const matchesMuscle = muscle === null || item.muscleGroup === muscle;
      if (!matchesMuscle) return false;
      if (q.length === 0) return true;

      const primaryMuscleName = MUSCLE_DISPLAY_NAMES[item.muscleGroup];
      const candidates = [
        item.name,
        item.description,
        primaryMuscleName,
        ...item.secondaryMuscles.map((m) => MUSCLE_DISPLAY_NAMES[m]),
        ...(aliasesById.get(item.id) ?? []),
      ];

      if (translate) {
        candidates.push(
          translate(item.name),
          translate(item.description),
          translate(primaryMuscleName),
          ...item.secondaryMuscles.map((m) => translate(MUSCLE_DISPLAY_NAMES[m])),
        );
      }

      return candidates.some((c) => c.toLowerCase().includes(q));
    });
  },
};
