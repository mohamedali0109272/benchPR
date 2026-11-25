package com.benchpr.app.data.model

import kotlin.math.roundToInt

data class ExerciseTemplate(
    val id: String,
    val name: String,
    val targetPercent: Double,
    val targetReps: Int,
    val targetDurationSeconds: Int = 0,
    val totalSets: Int,
    val isStaticHold: Boolean = false,
    /** Display-only rep range such as "8-12", used by split exercises. */
    val repRange: String? = null
)

data class WorkoutSessionTemplate(
    val id: Int,
    val title: String,
    val subtitle: String,
    val goal: String,
    val exercises: List<ExerciseTemplate>
)

object ProgramData {

    val SESSION_1 = WorkoutSessionTemplate(
        id = 1,
        title = "Session 1 - Heavy / Strength",
        subtitle = "Strength Focus",
        goal = "get stronger",
        exercises = listOf(
            ExerciseTemplate(
                id = "s1_ex1",
                name = "Heavy Single",
                targetPercent = 100.0,
                targetReps = 1,
                totalSets = 1
            ),
            ExerciseTemplate(
                id = "s1_ex2",
                name = "Bench press",
                targetPercent = 90.0,
                targetReps = 4,
                totalSets = 4
            ),
            ExerciseTemplate(
                id = "s1_ex3",
                name = "Paused Bench",
                targetPercent = 75.0,
                targetReps = 5,
                totalSets = 3
            ),
            ExerciseTemplate(
                id = "s1_ex4",
                name = "Incline Press",
                targetPercent = 75.0,
                targetReps = 6,
                totalSets = 2
            ),
            ExerciseTemplate(
                id = "s1_ex5",
                name = "Seated Dips",
                targetPercent = 80.0,
                targetReps = 10,
                totalSets = 3
            )
        )
    )

    val SESSION_2 = WorkoutSessionTemplate(
        id = 2,
        title = "Session 2 - Volume / Muscle",
        subtitle = "Hypertrophy Focus",
        goal = "build your chest and pressing volume",
        exercises = listOf(
            ExerciseTemplate(
                id = "s2_ex1",
                name = "Static Hold",
                targetPercent = 110.0,
                targetReps = 0,
                targetDurationSeconds = 30,
                totalSets = 1,
                isStaticHold = true
            ),
            ExerciseTemplate(
                id = "s2_ex2",
                name = "Bench Press",
                targetPercent = 80.0,
                targetReps = 8,
                totalSets = 3
            ),
            ExerciseTemplate(
                id = "s2_ex3",
                name = "Close Grip Bench",
                targetPercent = 60.0,
                targetReps = 10,
                totalSets = 3
            ),
            ExerciseTemplate(
                id = "s2_ex4",
                name = "Pec Flys",
                targetPercent = 70.0,
                targetReps = 14,
                totalSets = 2
            ),
            ExerciseTemplate(
                id = "s2_ex5",
                name = "Rope Pushdowns",
                targetPercent = 40.0,
                targetReps = 14,
                totalSets = 3
            )
        )
    )

    val SESSION_3 = WorkoutSessionTemplate(
        id = 3,
        title = "Session 3 - Technique / Speed",
        subtitle = "Technique & Speed Focus",
        goal = "better bench technique + recovery",
        exercises = listOf(
            ExerciseTemplate(
                id = "s3_ex1",
                name = "Static Hold",
                targetPercent = 110.0,
                targetReps = 0,
                targetDurationSeconds = 30,
                totalSets = 1,
                isStaticHold = true
            ),
            ExerciseTemplate(
                id = "s3_ex2",
                name = "Bench Press",
                targetPercent = 85.0,
                targetReps = 5,
                totalSets = 3
            ),
            ExerciseTemplate(
                id = "s3_ex3",
                name = "Paused Bench",
                targetPercent = 75.0,
                targetReps = 5,
                totalSets = 3
            ),
            ExerciseTemplate(
                id = "s3_ex4",
                name = "Single Arm",
                targetPercent = 15.0,
                targetReps = 12,
                totalSets = 3
            )
        )
    )

    val ALL_SESSIONS = listOf(SESSION_1, SESSION_2, SESSION_3)

    fun calculateWeight(target1RM: Double, percent: Double): Double {
        val raw = target1RM * (percent / 100.0)
        // Round to nearest 2.5 for gym plates
        return (raw / 2.5).roundToInt() * 2.5
    }
}
