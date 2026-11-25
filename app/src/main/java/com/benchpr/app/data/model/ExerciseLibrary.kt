package com.benchpr.app.data.model

enum class MuscleGroup(val displayName: String) {
    CHEST("Chest"),
    SHOULDERS("Shoulders"),
    BICEPS("Biceps"),
    TRICEPS("Triceps"),
    FOREARMS("Forearms"),
    CORE("Core"),
    TRAPS("Traps"),
    LATS("Lats"),
    LOWER_BACK("Lower Back"),
    GLUTES("Glutes"),
    QUADS("Quads"),
    HAMSTRINGS("Hamstrings"),
    CALVES("Calves")
}

/**
 * @param strengthRef  Estimated one-rep max of an *intermediate* lifter as a multiple of body weight
 *                     (the weight on the bar for barbell lifts, per dumbbell for dumbbell lifts).
 *                     0.0 means the exercise is not used for ranking (timed holds, etc).
 * @param bodyweightFactor  Share of body weight that is moved by the exercise (1.0 for pull-ups,
 *                     ~0.65 for push-ups). 0.0 for exercises where only the logged weight counts.
 * @param isTimed      Held for a duration instead of repetitions.
 */
data class ExerciseItem(
    val id: String,
    val name: String,
    val muscleGroup: MuscleGroup,
    val description: String,
    val secondaryMuscles: List<MuscleGroup> = emptyList(),
    val strengthRef: Double = 0.0,
    val bodyweightFactor: Double = 0.0,
    val isTimed: Boolean = false,
    val defaultSets: Int = 3,
    val defaultReps: Int = 10
) {
    val isBodyweight: Boolean get() = bodyweightFactor > 0.0
}

object ExerciseLibrary {

    private fun ex(
        id: String,
        name: String,
        muscle: MuscleGroup,
        description: String,
        ref: Double,
        secondary: List<MuscleGroup> = emptyList(),
        bodyweightFactor: Double = 0.0,
        timed: Boolean = false,
        sets: Int = 3,
        reps: Int = 10
    ) = ExerciseItem(
        id = id,
        name = name,
        muscleGroup = muscle,
        description = description,
        secondaryMuscles = secondary,
        strengthRef = ref,
        bodyweightFactor = bodyweightFactor,
        isTimed = timed,
        defaultSets = sets,
        defaultReps = reps
    )

    private val C = MuscleGroup.CHEST
    private val SH = MuscleGroup.SHOULDERS
    private val BI = MuscleGroup.BICEPS
    private val TRI = MuscleGroup.TRICEPS
    private val FA = MuscleGroup.FOREARMS
    private val CORE = MuscleGroup.CORE
    private val TRAP = MuscleGroup.TRAPS
    private val LAT = MuscleGroup.LATS
    private val LB = MuscleGroup.LOWER_BACK
    private val GL = MuscleGroup.GLUTES
    private val QD = MuscleGroup.QUADS
    private val HAM = MuscleGroup.HAMSTRINGS
    private val CALF = MuscleGroup.CALVES

    val PRESET_EXERCISES: List<ExerciseItem> = listOf(
        // ---- Chest ----
        ex("ex_bench", "Bench Press", C, "Compound barbell press for pectoral strength.", 1.25, listOf(TRI, SH), reps = 8),
        ex("ex_paused_bench", "Paused Bench Press", C, "Bench press with a 1-second pause on chest.", 1.1, listOf(TRI, SH), reps = 5),
        ex("ex_incline", "Incline Press", C, "Upper chest focused pressing movement.", 1.0, listOf(SH, TRI), reps = 8),
        ex("ex_db_bench", "Dumbbell Bench Press", C, "Dumbbell press with a deeper stretch. Log weight per dumbbell.", 0.5, listOf(TRI, SH)),
        ex("ex_db_incline", "Incline Dumbbell Press", C, "Upper chest dumbbell press. Log weight per dumbbell.", 0.45, listOf(SH, TRI)),
        ex("ex_chest_press_machine", "Chest Press Machine", C, "Machine press, great for chasing failure safely.", 1.0, listOf(TRI, SH), reps = 12),
        ex("ex_pec_fly", "Pec Flys", C, "Isolation flys for chest hypertrophy.", 0.55, reps = 12),
        ex("ex_cable_crossover", "Cable Crossover", C, "Cable fly with constant tension across the chest.", 0.35, reps = 12),
        ex("ex_pushup", "Push-Ups", C, "Bodyweight press. Add weight if it gets easy.", 1.0, listOf(TRI, SH), bodyweightFactor = 0.65, reps = 15),
        ex("ex_static_hold", "Static Hold", C, "Isometric overload pressing hold.", 0.0, listOf(TRI, SH), timed = true, sets = 1, reps = 0),

        // ---- Shoulders ----
        ex("ex_ohp", "Overhead Press", SH, "Strict barbell shoulder press.", 0.8, listOf(TRI, TRAP), reps = 8),
        ex("ex_db_shoulder_press", "Dumbbell Shoulder Press", SH, "Seated or standing dumbbell press. Log weight per dumbbell.", 0.35, listOf(TRI)),
        ex("ex_arnold_press", "Arnold Press", SH, "Rotating dumbbell press hitting all three delt heads.", 0.3, listOf(TRI)),
        ex("ex_lateral_raise", "Lateral Raises", SH, "Dumbbell isolation for side delts.", 0.15, reps = 15),
        ex("ex_front_raise", "Front Raises", SH, "Anterior delt isolation.", 0.15, reps = 12),
        ex("ex_rear_delt_fly", "Rear Delt Fly", SH, "Reverse fly for rear delts and upper back.", 0.2, listOf(TRAP), reps = 15),
        ex("ex_face_pull", "Face Pulls", SH, "Cable pull to the face for rear delts and shoulder health.", 0.45, listOf(TRAP), reps = 15),
        ex("ex_upright_row", "Upright Row", SH, "Barbell or cable pull to the chest for delts and traps.", 0.7, listOf(TRAP, BI), reps = 10),

        // ---- Biceps ----
        ex("ex_bicep_curl", "Barbell Bicep Curl", BI, "Classic mass builder for biceps.", 0.6, listOf(FA)),
        ex("ex_db_curl", "Dumbbell Curl", BI, "Alternating or seated curls. Log weight per dumbbell.", 0.25, listOf(FA)),
        ex("ex_hammer_curl", "Hammer Curls", BI, "Brachialis and forearm builder. Log weight per dumbbell.", 0.28, listOf(FA)),
        ex("ex_preacher_curl", "Preacher Curl", BI, "Strict curl on a preacher bench for the short head.", 0.5, listOf(FA)),
        ex("ex_incline_curl", "Incline Dumbbell Curl", BI, "Long-head stretch curl. Log weight per dumbbell.", 0.2, listOf(FA)),
        ex("ex_cable_curl", "Cable Curl", BI, "Constant tension curl on the cable stack.", 0.5, listOf(FA), reps = 12),

        // ---- Triceps ----
        ex("ex_close_grip", "Close Grip Bench Press", TRI, "Compound press focusing heavily on triceps.", 1.1, listOf(C, SH), reps = 8),
        ex("ex_rope_push", "Rope Pushdowns", TRI, "Cable isolation for tricep lockout power.", 0.6, reps = 12),
        ex("ex_seated_dips", "Seated Dips", TRI, "Weighted dip for triceps and lower chest.", 1.0, listOf(C, SH)),
        ex("ex_dips", "Dips", TRI, "Parallel bar dips. Add weight when bodyweight gets easy.", 1.5, listOf(C, SH), bodyweightFactor = 1.0, reps = 10),
        ex("ex_skull_crusher", "Skull Crushers", TRI, "Lying EZ-bar extension for the long head.", 0.6, reps = 10),
        ex("ex_overhead_tricep_ext", "Overhead Tricep Extension", TRI, "Overhead cable or dumbbell extension.", 0.5, reps = 12),
        ex("ex_single_arm", "Single Arm Extension", TRI, "Unilateral cable or dumbbell tricep extension.", 0.25, reps = 12),

        // ---- Forearms ----
        ex("ex_wrist_curl", "Wrist Curl", FA, "Barbell or dumbbell wrist flexion.", 0.4, reps = 15),
        ex("ex_reverse_curl", "Reverse Curl", FA, "Overhand curl for forearm extensors and brachialis.", 0.4, listOf(BI), reps = 12),

        // ---- Traps ----
        ex("ex_barbell_shrug", "Barbell Shrug", TRAP, "Heavy shrug for upper trap mass.", 1.5, listOf(FA), reps = 12),
        ex("ex_db_shrug", "Dumbbell Shrug", TRAP, "Dumbbell shrug. Log weight per dumbbell.", 0.6, listOf(FA), reps = 12),

        // ---- Lats / Back ----
        ex("ex_deadlift", "Deadlift", LB, "Ultimate posterior chain compound lift.", 1.75, listOf(GL, HAM, TRAP, FA), reps = 5, sets = 3),
        ex("ex_barbell_row", "Barbell Row", LAT, "Heavy compound rowing for mid-back thickness.", 1.1, listOf(TRAP, BI, LB), reps = 8),
        ex("ex_db_row", "Dumbbell Row", LAT, "One-arm row. Log weight per dumbbell.", 0.5, listOf(TRAP, BI)),
        ex("ex_seated_row", "Seated Cable Row", LAT, "Cable row for lat and mid-back volume.", 1.0, listOf(TRAP, BI), reps = 12),
        ex("ex_tbar_row", "T-Bar Row", LAT, "Chest-supported or standing T-bar row.", 1.0, listOf(TRAP, BI)),
        ex("ex_lat_pulldown", "Lat Pulldown", LAT, "Vertical pulling for lat width.", 1.0, listOf(BI), reps = 10),
        ex("ex_pullup", "Pull-Ups", LAT, "Bodyweight vertical pull. Add weight when it gets easy.", 1.4, listOf(BI, FA), bodyweightFactor = 1.0, reps = 8),
        ex("ex_chinup", "Chin-Ups", LAT, "Underhand pull-up with more biceps involvement.", 1.4, listOf(BI, FA), bodyweightFactor = 1.0, reps = 8),

        // ---- Lower back ----
        ex("ex_back_extension", "Back Extension", LB, "Hyperextension for the spinal erectors.", 0.8, listOf(GL, HAM), bodyweightFactor = 0.4, reps = 12),
        ex("ex_good_morning", "Good Morning", LB, "Barbell hip hinge for erectors and hamstrings.", 0.8, listOf(HAM, GL), reps = 8),

        // ---- Quads ----
        ex("ex_squat", "Barbell Squat", QD, "King of lower body compound lifts.", 1.5, listOf(GL, HAM, LB), reps = 6, sets = 4),
        ex("ex_front_squat", "Front Squat", QD, "Quad-dominant squat with an upright torso.", 1.25, listOf(GL, CORE), reps = 6),
        ex("ex_leg_press", "Leg Press", QD, "Machine quad and glute press.", 2.7, listOf(GL, HAM), reps = 12),
        ex("ex_hack_squat", "Hack Squat", QD, "Machine squat that loads the quads.", 1.5, listOf(GL), reps = 10),
        ex("ex_leg_extension", "Leg Extension", QD, "Machine quad isolation.", 0.9, reps = 12),
        ex("ex_lunge", "Walking Lunges", QD, "Dumbbell lunges. Log weight per dumbbell.", 0.4, listOf(GL, HAM), reps = 12),

        // ---- Hamstrings ----
        ex("ex_romanian_deadlift", "Romanian Deadlift", HAM, "Hamstring and glute hinging movement.", 1.4, listOf(GL, LB), reps = 8),
        ex("ex_leg_curl", "Leg Curl", HAM, "Machine hamstring isolation.", 0.75, reps = 12),

        // ---- Glutes ----
        ex("ex_hip_thrust", "Hip Thrust", GL, "Barbell glute thrust, the best glute loader.", 1.75, listOf(HAM), reps = 10),
        ex("ex_cable_kickback", "Cable Kickback", GL, "Cable glute isolation.", 0.3, reps = 15),

        // ---- Calves ----
        ex("ex_standing_calf", "Standing Calf Raise", CALF, "Gastrocnemius focused calf raise.", 1.75, reps = 15),
        ex("ex_seated_calf", "Seated Calf Raise", CALF, "Soleus focused calf raise.", 1.0, reps = 15),

        // ---- Core ----
        ex("ex_plank", "Plank", CORE, "Isometric core stabilization.", 0.0, timed = true, sets = 3, reps = 0),
        ex("ex_hanging_leg_raise", "Hanging Leg Raises", CORE, "Lower abdominal strength.", 0.9, bodyweightFactor = 0.5, reps = 12),
        ex("ex_cable_crunch", "Cable Crunch", CORE, "Weighted crunch for the abs.", 0.9, reps = 15),
        ex("ex_ab_wheel", "Ab Wheel Rollout", CORE, "Anti-extension core exercise.", 1.0, bodyweightFactor = 0.6, reps = 10),
        ex("ex_russian_twist", "Russian Twist", CORE, "Rotational core work for the obliques.", 0.3, reps = 20)
    )

    private val byId: Map<String, ExerciseItem> = PRESET_EXERCISES.associateBy { it.id }

    /** Names used by the original bench program, mapped onto library exercises. */
    private val aliases: Map<String, String> = mapOf(
        "heavy single" to "ex_bench",
        "paused bench" to "ex_paused_bench",
        "close grip bench" to "ex_close_grip",
        "single arm" to "ex_single_arm"
    )

    private val byName: Map<String, ExerciseItem> =
        PRESET_EXERCISES.associateBy { it.name.lowercase() } +
            aliases.mapNotNull { (alias, id) -> byId[id]?.let { alias to it } }

    fun getById(id: String): ExerciseItem? = byId[id]

    fun findByName(name: String): ExerciseItem? = byName[name.trim().lowercase()]

    fun getByMuscle(muscleGroup: MuscleGroup): List<ExerciseItem> {
        return PRESET_EXERCISES.filter { it.muscleGroup == muscleGroup }
    }

    fun search(query: String, muscle: MuscleGroup? = null): List<ExerciseItem> {
        val q = query.trim()
        return PRESET_EXERCISES.filter { item ->
            val matchesMuscle = muscle == null || item.muscleGroup == muscle
            val matchesQuery = q.isEmpty() ||
                item.name.contains(q, ignoreCase = true) ||
                item.description.contains(q, ignoreCase = true)
            matchesMuscle && matchesQuery
        }
    }
}
