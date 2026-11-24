package com.benchpr.app.data.model

data class MuscleRankInfo(
    val muscleGroup: MuscleGroup,
    val totalVolume: Double,
    val tierName: String,
    val tierLevel: Int, // 1 to 5
    val currentTierMin: Double,
    val nextTierMax: Double,
    val progressPercent: Float
)

object MuscleRankingEngine {

    fun calculateRank(muscleGroup: MuscleGroup, volume: Double): MuscleRankInfo {
        val (tierName, level, min, max) = when {
            volume < 1000.0 -> Quad("Novice", 1, 0.0, 1000.0)
            volume < 5000.0 -> Quad("Intermediate", 2, 1000.0, 5000.0)
            volume < 15000.0 -> Quad("Advanced", 3, 5000.0, 15000.0)
            volume < 35000.0 -> Quad("Elite", 4, 15000.0, 35000.0)
            else -> Quad("Legend", 5, 35000.0, 100000.0)
        }

        val span = max - min
        val currentProgress = (volume - min).coerceIn(0.0, span)
        val progressPercent = if (span > 0) (currentProgress / span).toFloat().coerceIn(0f, 1f) else 1f

        return MuscleRankInfo(
            muscleGroup = muscleGroup,
            totalVolume = volume,
            tierName = tierName,
            tierLevel = level,
            currentTierMin = min,
            nextTierMax = max,
            progressPercent = progressPercent
        )
    }

    // Helper mapping exercise names to primary muscle groups
    fun guessMuscleGroup(exerciseName: String): MuscleGroup {
        val lower = exerciseName.lowercase()
        return when {
            lower.contains("bench") || lower.contains("fly") || lower.contains("incline") || lower.contains("chest") -> MuscleGroup.CHEST
            lower.contains("dip") || lower.contains("pushdown") || lower.contains("extension") || lower.contains("tricep") -> MuscleGroup.TRICEPS
            lower.contains("overhead") || lower.contains("shoulder") || lower.contains("raise") || lower.contains("ohp") -> MuscleGroup.SHOULDERS
            lower.contains("row") || lower.contains("deadlift") || lower.contains("pulldown") || lower.contains("pull-up") || lower.contains("back") -> MuscleGroup.BACK
            lower.contains("squat") || lower.contains("leg") || lower.contains("quad") || lower.contains("hamstring") -> MuscleGroup.LEGS
            lower.contains("curl") || lower.contains("bicep") -> MuscleGroup.BICEPS
            else -> MuscleGroup.CORE
        }
    }
}

data class Quad<A, B, C, D>(val first: A, val second: B, val third: C, val fourth: D)
