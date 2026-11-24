package com.benchpr.app.data.model

enum class MuscleGroup(val displayName: String) {
    CHEST("Chest"),
    TRICEPS("Triceps"),
    SHOULDERS("Shoulders"),
    BACK("Back"),
    LEGS("Legs"),
    BICEPS("Biceps"),
    CORE("Core")
}

data class ExerciseItem(
    val id: String,
    val name: String,
    val muscleGroup: MuscleGroup,
    val description: String
)

object ExerciseLibrary {
    val PRESET_EXERCISES = listOf(
        // Chest
        ExerciseItem("ex_bench", "Bench Press", MuscleGroup.CHEST, "Compound barbell press for pectoral strength."),
        ExerciseItem("ex_paused_bench", "Paused Bench Press", MuscleGroup.CHEST, "Bench press with a 1-second pause on chest."),
        ExerciseItem("ex_incline", "Incline Press", MuscleGroup.CHEST, "Upper chest focused pressing movement."),
        ExerciseItem("ex_pec_fly", "Pec Flys", MuscleGroup.CHEST, "Isolation flys for chest hypertrophy."),
        ExerciseItem("ex_static_hold", "Static Hold", MuscleGroup.CHEST, "Isometric overload pressing hold."),

        // Triceps
        ExerciseItem("ex_close_grip", "Close Grip Bench Press", MuscleGroup.TRICEPS, "Compound press focusing heavily on triceps."),
        ExerciseItem("ex_rope_push", "Rope Pushdowns", MuscleGroup.TRICEPS, "Cable isolation for tricep lockout power."),
        ExerciseItem("ex_seated_dips", "Seated Dips", MuscleGroup.TRICEPS, "Bodyweight or weighted dip for triceps and lower chest."),
        ExerciseItem("ex_single_arm", "Single Arm Extension", MuscleGroup.TRICEPS, "Unilateral cable or dumbbell tricep extension."),

        // Shoulders
        ExerciseItem("ex_ohp", "Overhead Press", MuscleGroup.SHOULDERS, "Strict barbell shoulder press."),
        ExerciseItem("ex_lateral_raise", "Lateral Raises", MuscleGroup.SHOULDERS, "Dumbbell isolation for side delts."),
        ExerciseItem("ex_front_raise", "Front Raises", MuscleGroup.SHOULDERS, "Anterior delt isolation."),

        // Back
        ExerciseItem("ex_deadlift", "Deadlift", MuscleGroup.BACK, "Ultimate posterior chain compound lift."),
        ExerciseItem("ex_barbell_row", "Barbell Row", MuscleGroup.BACK, "Heavy compound rowing for mid-back thickness."),
        ExerciseItem("ex_lat_pulldown", "Lat Pulldown", MuscleGroup.BACK, "Vertical pulling for lat width."),
        ExerciseItem("ex_pullup", "Pull-Ups", MuscleGroup.BACK, "Bodyweight vertical pull."),

        // Legs
        ExerciseItem("ex_squat", "Barbell Squat", MuscleGroup.LEGS, "King of lower body compound lifts."),
        ExerciseItem("ex_leg_press", "Leg Press", MuscleGroup.LEGS, "Machine quad and glute press."),
        ExerciseItem("ex_romanian_deadlift", "Romanian Deadlift", MuscleGroup.LEGS, "Hamstring and glute hinging movement."),

        // Biceps
        ExerciseItem("ex_bicep_curl", "Barbell Bicep Curl", MuscleGroup.BICEPS, "Classic mass builder for biceps."),
        ExerciseItem("ex_hammer_curl", "Hammer Curls", MuscleGroup.BICEPS, "Brachialis and forearm builder."),

        // Core
        ExerciseItem("ex_plank", "Plank", MuscleGroup.CORE, "Isometric core stabilization."),
        ExerciseItem("ex_hanging_leg_raise", "Hanging Leg Raises", MuscleGroup.CORE, "Lower abdominal strength.")
    )

    fun getByMuscle(muscleGroup: MuscleGroup): List<ExerciseItem> {
        return PRESET_EXERCISES.filter { it.muscleGroup == muscleGroup }
    }
}
