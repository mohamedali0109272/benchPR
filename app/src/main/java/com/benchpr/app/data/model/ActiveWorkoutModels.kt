package com.benchpr.app.data.model

data class ExerciseSetState(
    val setIndex: Int,
    val targetWeight: Double,
    val targetReps: Int,
    val actualWeight: Double,
    val actualReps: Int,
    val isCompleted: Boolean = false,
    val durationSeconds: Int = 0
)

data class ActiveExerciseState(
    val template: ExerciseTemplate,
    val calculatedTargetWeight: Double,
    val sets: List<ExerciseSetState>
)

data class ActiveWorkoutState(
    val sessionTemplate: WorkoutSessionTemplate,
    val target1RM: Double,
    val unit: String = "kg",
    val exercises: List<ActiveExerciseState>,
    val startTimeMillis: Long = System.currentTimeMillis(),
    val isFinished: Boolean = false
)
