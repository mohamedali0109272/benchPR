package com.benchpr.app.data.model

/**
 * One exercise inside a split day. Rep ranges are shown to the lifter; timed exercises use
 * [durationSeconds] and have no reps.
 */
data class SplitExercise(
    val exerciseId: String,
    val sets: Int,
    val repsMin: Int,
    val repsMax: Int,
    val durationSeconds: Int = 0
) {
    val repRange: String
        get() = when {
            durationSeconds > 0 -> "${durationSeconds}s"
            repsMin == repsMax -> "$repsMin"
            else -> "$repsMin-$repsMax"
        }
}

data class SplitDay(
    val name: String,
    val focus: String,
    val exercises: List<SplitExercise>
)

data class WorkoutSplit(
    val id: String,
    val name: String,
    val tagline: String,
    val level: String,
    val goal: String,
    val daysPerWeek: Int,
    val days: List<SplitDay>
)

object Splits {

    /** "8-12" -> 8..12, "5" -> 5..5, "45s" -> timed 45 seconds. */
    private fun e(id: String, sets: Int, reps: String): SplitExercise {
        if (reps.endsWith("s")) {
            return SplitExercise(id, sets, 0, 0, reps.removeSuffix("s").toInt())
        }
        val parts = reps.split("-")
        val min = parts[0].toInt()
        val max = if (parts.size > 1) parts[1].toInt() else min
        return SplitExercise(id, sets, min, max)
    }

    // ---------- Push / Pull / Legs ----------
    private val pushA = SplitDay(
        "Push A", "Chest, shoulders, triceps", listOf(
            e("ex_bench", 4, "6-8"), e("ex_incline", 3, "8-10"), e("ex_ohp", 3, "8-10"),
            e("ex_lateral_raise", 3, "12-15"), e("ex_rope_push", 3, "10-12"), e("ex_overhead_tricep_ext", 3, "12")
        )
    )
    private val pullA = SplitDay(
        "Pull A", "Back, biceps, rear delts", listOf(
            e("ex_barbell_row", 4, "6-8"), e("ex_lat_pulldown", 3, "8-12"), e("ex_seated_row", 3, "10-12"),
            e("ex_face_pull", 3, "15"), e("ex_bicep_curl", 3, "8-10"), e("ex_hammer_curl", 3, "10-12")
        )
    )
    private val legsA = SplitDay(
        "Legs A", "Quads, hamstrings, calves", listOf(
            e("ex_squat", 4, "6-8"), e("ex_romanian_deadlift", 3, "8-10"), e("ex_leg_press", 3, "10-12"),
            e("ex_leg_curl", 3, "10-12"), e("ex_standing_calf", 4, "12-15")
        )
    )
    private val pushB = SplitDay(
        "Push B", "Shoulders, chest, triceps", listOf(
            e("ex_ohp", 4, "6-8"), e("ex_db_bench", 3, "8-12"), e("ex_db_incline", 3, "10-12"),
            e("ex_lateral_raise", 4, "12-15"), e("ex_dips", 3, "8-12"), e("ex_skull_crusher", 3, "10-12")
        )
    )
    private val pullB = SplitDay(
        "Pull B", "Lats, traps, biceps", listOf(
            e("ex_pullup", 4, "6-10"), e("ex_db_row", 3, "8-12"), e("ex_rear_delt_fly", 3, "15"),
            e("ex_db_shrug", 3, "12"), e("ex_preacher_curl", 3, "10-12"), e("ex_incline_curl", 3, "12")
        )
    )
    private val legsB = SplitDay(
        "Legs B", "Posterior chain, quads, abs", listOf(
            e("ex_deadlift", 3, "5"), e("ex_front_squat", 3, "8"), e("ex_lunge", 3, "12"),
            e("ex_leg_extension", 3, "12-15"), e("ex_seated_calf", 4, "15"), e("ex_hanging_leg_raise", 3, "12")
        )
    )

    // ---------- Upper / Lower ----------
    private val upperA = SplitDay(
        "Upper A", "Strength", listOf(
            e("ex_bench", 4, "5"), e("ex_barbell_row", 4, "5"), e("ex_ohp", 3, "6-8"),
            e("ex_lat_pulldown", 3, "8-10"), e("ex_bicep_curl", 2, "8-10"), e("ex_skull_crusher", 2, "8-10")
        )
    )
    private val lowerA = SplitDay(
        "Lower A", "Strength", listOf(
            e("ex_squat", 4, "5"), e("ex_romanian_deadlift", 3, "6-8"), e("ex_leg_press", 3, "10"),
            e("ex_leg_curl", 3, "10"), e("ex_standing_calf", 4, "10-12")
        )
    )
    private val upperB = SplitDay(
        "Upper B", "Volume", listOf(
            e("ex_db_incline", 4, "8-12"), e("ex_seated_row", 4, "10-12"), e("ex_db_shoulder_press", 3, "10-12"),
            e("ex_pullup", 3, "6-10"), e("ex_lateral_raise", 3, "15"), e("ex_hammer_curl", 3, "12"),
            e("ex_rope_push", 3, "12")
        )
    )
    private val lowerB = SplitDay(
        "Lower B", "Volume", listOf(
            e("ex_deadlift", 3, "5"), e("ex_hack_squat", 3, "10-12"), e("ex_hip_thrust", 3, "10-12"),
            e("ex_leg_extension", 3, "12-15"), e("ex_seated_calf", 4, "15"), e("ex_cable_crunch", 3, "15")
        )
    )

    // ---------- Full body ----------
    private val fullA = SplitDay(
        "Full Body A", "Squat and bench focus", listOf(
            e("ex_squat", 3, "5-8"), e("ex_bench", 3, "5-8"), e("ex_barbell_row", 3, "6-10"),
            e("ex_ohp", 2, "8-10"), e("ex_bicep_curl", 2, "10-12"), e("ex_plank", 3, "45s")
        )
    )
    private val fullB = SplitDay(
        "Full Body B", "Deadlift and incline focus", listOf(
            e("ex_deadlift", 3, "5"), e("ex_incline", 3, "8-10"), e("ex_lat_pulldown", 3, "8-12"),
            e("ex_lunge", 3, "10-12"), e("ex_lateral_raise", 3, "12-15"), e("ex_rope_push", 3, "12")
        )
    )
    private val fullC = SplitDay(
        "Full Body C", "Volume and hinge focus", listOf(
            e("ex_front_squat", 3, "6-8"), e("ex_db_bench", 3, "8-12"), e("ex_seated_row", 3, "10-12"),
            e("ex_romanian_deadlift", 3, "8-10"), e("ex_db_curl", 2, "12"), e("ex_standing_calf", 3, "12-15"),
            e("ex_hanging_leg_raise", 3, "12")
        )
    )

    // ---------- Bro split ----------
    private val broChest = SplitDay(
        "Chest", "Pecs", listOf(
            e("ex_bench", 4, "6-10"), e("ex_incline", 4, "8-10"), e("ex_db_bench", 3, "10-12"),
            e("ex_pec_fly", 3, "12-15"), e("ex_cable_crossover", 3, "12-15"), e("ex_pushup", 2, "15")
        )
    )
    private val broBack = SplitDay(
        "Back", "Lats, traps, lower back", listOf(
            e("ex_deadlift", 4, "5"), e("ex_barbell_row", 4, "8-10"), e("ex_lat_pulldown", 3, "10-12"),
            e("ex_seated_row", 3, "10-12"), e("ex_db_row", 3, "10-12"), e("ex_barbell_shrug", 3, "12")
        )
    )
    private val broShoulders = SplitDay(
        "Shoulders", "Delts and traps", listOf(
            e("ex_ohp", 4, "6-10"), e("ex_db_shoulder_press", 3, "10-12"), e("ex_lateral_raise", 4, "12-15"),
            e("ex_front_raise", 3, "12"), e("ex_rear_delt_fly", 4, "15"), e("ex_db_shrug", 3, "12")
        )
    )
    private val broArms = SplitDay(
        "Arms", "Biceps, triceps, forearms", listOf(
            e("ex_close_grip", 4, "8-10"), e("ex_bicep_curl", 4, "8-12"), e("ex_skull_crusher", 3, "10-12"),
            e("ex_preacher_curl", 3, "10-12"), e("ex_rope_push", 3, "12-15"), e("ex_hammer_curl", 3, "12"),
            e("ex_wrist_curl", 3, "15")
        )
    )
    private val broLegs = SplitDay(
        "Legs", "Quads, hamstrings, calves", listOf(
            e("ex_squat", 4, "6-10"), e("ex_leg_press", 4, "10-12"), e("ex_romanian_deadlift", 3, "8-10"),
            e("ex_leg_extension", 3, "12-15"), e("ex_leg_curl", 3, "12-15"), e("ex_standing_calf", 5, "12-15")
        )
    )

    // ---------- Arnold split ----------
    private val arnoldChestBack = SplitDay(
        "Chest & Back", "Antagonist supersets", listOf(
            e("ex_bench", 4, "8-10"), e("ex_incline", 4, "8-10"), e("ex_pec_fly", 3, "10-12"),
            e("ex_pullup", 4, "8-12"), e("ex_barbell_row", 4, "8-10"), e("ex_deadlift", 3, "6-8")
        )
    )
    private val arnoldShouldersArms = SplitDay(
        "Shoulders & Arms", "Delts, biceps, triceps", listOf(
            e("ex_ohp", 4, "8-10"), e("ex_arnold_press", 3, "10-12"), e("ex_lateral_raise", 4, "12-15"),
            e("ex_bicep_curl", 4, "8-10"), e("ex_skull_crusher", 4, "8-10"), e("ex_hammer_curl", 3, "10-12"),
            e("ex_rope_push", 3, "12"), e("ex_wrist_curl", 3, "15")
        )
    )
    private val arnoldLegsAbs = SplitDay(
        "Legs & Abs", "Lower body and core", listOf(
            e("ex_squat", 4, "8-10"), e("ex_leg_press", 3, "10-12"), e("ex_romanian_deadlift", 3, "8-10"),
            e("ex_leg_curl", 3, "12"), e("ex_standing_calf", 5, "12-15"), e("ex_hanging_leg_raise", 3, "12"),
            e("ex_cable_crunch", 3, "15")
        )
    )

    // ---------- PHUL ----------
    private val phulUpperPower = SplitDay(
        "Upper Power", "Heavy compounds", listOf(
            e("ex_bench", 4, "3-5"), e("ex_db_incline", 3, "6-10"), e("ex_barbell_row", 4, "3-5"),
            e("ex_lat_pulldown", 3, "6-10"), e("ex_ohp", 3, "5-8"), e("ex_bicep_curl", 3, "6-10"),
            e("ex_skull_crusher", 3, "6-10")
        )
    )
    private val phulLowerPower = SplitDay(
        "Lower Power", "Heavy compounds", listOf(
            e("ex_squat", 4, "3-5"), e("ex_deadlift", 3, "3-5"), e("ex_leg_press", 5, "10-15"),
            e("ex_leg_curl", 3, "6-10"), e("ex_standing_calf", 4, "6-10")
        )
    )
    private val phulUpperHyper = SplitDay(
        "Upper Hypertrophy", "Volume work", listOf(
            e("ex_incline", 4, "8-12"), e("ex_pec_fly", 3, "12-15"), e("ex_seated_row", 4, "8-12"),
            e("ex_db_row", 3, "10-14"), e("ex_db_shoulder_press", 3, "8-12"), e("ex_lateral_raise", 3, "12-15"),
            e("ex_cable_curl", 3, "10-14"), e("ex_overhead_tricep_ext", 3, "10-14")
        )
    )
    private val phulLowerHyper = SplitDay(
        "Lower Hypertrophy", "Volume work", listOf(
            e("ex_front_squat", 4, "8-12"), e("ex_lunge", 3, "10-14"), e("ex_leg_extension", 3, "12-15"),
            e("ex_romanian_deadlift", 3, "8-12"), e("ex_leg_curl", 3, "10-14"), e("ex_seated_calf", 4, "12-15"),
            e("ex_standing_calf", 3, "12-15")
        )
    )

    // ---------- 5x5 ----------
    private val fiveByFiveA = SplitDay(
        "Workout A", "Squat, bench, row", listOf(
            e("ex_squat", 5, "5"), e("ex_bench", 5, "5"), e("ex_barbell_row", 5, "5")
        )
    )
    private val fiveByFiveB = SplitDay(
        "Workout B", "Squat, press, deadlift", listOf(
            e("ex_squat", 5, "5"), e("ex_ohp", 5, "5"), e("ex_deadlift", 1, "5")
        )
    )

    private fun SplitDay.renamed(newName: String) = copy(name = newName)

    val ALL_SPLITS: List<WorkoutSplit> = listOf(
        WorkoutSplit(
            id = "ppl6", name = "Push / Pull / Legs (6-Day)",
            tagline = "Every muscle twice a week", level = "Intermediate", goal = "Hypertrophy",
            daysPerWeek = 6, days = listOf(pushA, pullA, legsA, pushB, pullB, legsB)
        ),
        WorkoutSplit(
            id = "ppl3", name = "Push / Pull / Legs (3-Day)",
            tagline = "Classic split, one rest day between sessions", level = "Beginner", goal = "Hypertrophy",
            daysPerWeek = 3, days = listOf(pushA, pullA, legsA)
        ),
        WorkoutSplit(
            id = "upper_lower", name = "Upper / Lower (4-Day)",
            tagline = "Strength day then volume day for each half", level = "Intermediate", goal = "Strength + size",
            daysPerWeek = 4, days = listOf(upperA, lowerA, upperB, lowerB)
        ),
        WorkoutSplit(
            id = "full_body", name = "Full Body (3-Day)",
            tagline = "Train everything three times a week", level = "Beginner", goal = "General strength",
            daysPerWeek = 3, days = listOf(fullA, fullB, fullC)
        ),
        WorkoutSplit(
            id = "bro", name = "Bro Split (5-Day)",
            tagline = "One muscle group per day, high volume", level = "Intermediate", goal = "Hypertrophy",
            daysPerWeek = 5, days = listOf(broChest, broBack, broShoulders, broArms, broLegs)
        ),
        WorkoutSplit(
            id = "arnold", name = "Arnold Split (6-Day)",
            tagline = "Chest and back, shoulders and arms, legs, twice a week", level = "Advanced", goal = "Hypertrophy",
            daysPerWeek = 6, days = listOf(
                arnoldChestBack, arnoldShouldersArms, arnoldLegsAbs,
                arnoldChestBack.renamed("Chest & Back 2"),
                arnoldShouldersArms.renamed("Shoulders & Arms 2"),
                arnoldLegsAbs.renamed("Legs & Abs 2")
            )
        ),
        WorkoutSplit(
            id = "phul", name = "PHUL (4-Day)",
            tagline = "Power Hypertrophy Upper Lower", level = "Intermediate", goal = "Strength + size",
            daysPerWeek = 4, days = listOf(phulUpperPower, phulLowerPower, phulUpperHyper, phulLowerHyper)
        ),
        WorkoutSplit(
            id = "ppl_ul", name = "PPL + Upper / Lower (5-Day)",
            tagline = "Push, pull, legs, then upper and lower", level = "Intermediate", goal = "Strength + size",
            daysPerWeek = 5, days = listOf(
                pushA.renamed("Push"), pullA.renamed("Pull"), legsA.renamed("Legs"),
                upperB.renamed("Upper"), lowerB.renamed("Lower")
            )
        ),
        WorkoutSplit(
            id = "five_by_five", name = "5x5 Strength (A/B)",
            tagline = "Alternate two simple barbell workouts", level = "Beginner", goal = "Strength",
            daysPerWeek = 3, days = listOf(fiveByFiveA, fiveByFiveB)
        )
    )

    fun findSplit(id: String): WorkoutSplit? = ALL_SPLITS.firstOrNull { it.id == id }
}
