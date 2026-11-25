package com.benchpr.app.data.model

/**
 * Rank tiers, lowest to highest. [minScore] is the strength score needed to enter the tier, where a
 * score of 1.0 equals the estimated one-rep max of an intermediate lifter at the same body weight.
 * [argb] is the colour used for the body model and badges.
 */
enum class RankTier(val displayName: String, val minScore: Double, val argb: Long) {
    UNRANKED("Unranked", Double.NEGATIVE_INFINITY, 0xFF2B313A),
    IRON("Iron", 0.0, 0xFF8D939C),
    BRONZE("Bronze", 0.25, 0xFFCD7F32),
    SILVER("Silver", 0.45, 0xFFD5DBE3),
    GOLD("Gold", 0.65, 0xFFFFC21A),
    PLATINUM("Platinum", 0.85, 0xFF2EE6C5),
    DIAMOND("Diamond", 1.10, 0xFF3FA9FF),
    MASTER("Master", 1.40, 0xFFB26BFF),
    LEGEND("Legend", 1.80, 0xFFFF2D6F);

    val next: RankTier? get() = entries.getOrNull(ordinal + 1)
}

/** One completed set, already converted to kilograms. */
data class LoggedSet(val exerciseName: String, val weightKg: Double, val reps: Int)

data class MuscleRankInfo(
    val muscleGroup: MuscleGroup,
    val tier: RankTier,
    /** Strength score, -1 when nothing has been logged for the muscle. */
    val score: Double,
    /** Progress from this tier to the next one, 0..1. Always 1 for Legend. */
    val progress: Float,
    val bestLiftName: String?,
    val bestLiftWeightKg: Double,
    val bestLiftReps: Int,
    val bestEstimated1RmKg: Double,
    val totalVolumeKg: Double,
    val setsLogged: Int
) {
    val nextTier: RankTier? get() = tier.next
}

data class OverallRank(val tier: RankTier, val score: Double, val progress: Float)

object RankingEngine {

    const val DEFAULT_BODYWEIGHT_KG = 75.0
    const val LBS_PER_KG = 2.20462
    /** Share of the score credited to a muscle that is only a helper in the lift. */
    const val SECONDARY_FACTOR = 0.6
    private const val MAX_REPS_FOR_ESTIMATE = 12

    fun toKg(weight: Double, unit: String): Double =
        if (unit.equals("lbs", ignoreCase = true)) weight / LBS_PER_KG else weight

    fun fromKg(kg: Double, unit: String): Double =
        if (unit.equals("lbs", ignoreCase = true)) kg * LBS_PER_KG else kg

    /** Epley estimate, capped at 12 reps because the formula drifts for long sets. */
    fun estimateOneRepMax(loadKg: Double, reps: Int): Double {
        if (loadKg <= 0.0 || reps <= 0) return 0.0
        if (reps == 1) return loadKg
        return loadKg * (1.0 + reps.coerceAtMost(MAX_REPS_FOR_ESTIMATE) / 30.0)
    }

    /** Load actually moved: logged weight plus the share of body weight for bodyweight lifts. */
    fun effectiveLoadKg(item: ExerciseItem, loggedWeightKg: Double, bodyweightKg: Double): Double =
        item.bodyweightFactor * bodyweightKg + loggedWeightKg.coerceAtLeast(0.0)

    fun tierFor(score: Double): RankTier {
        if (score < 0.0) return RankTier.UNRANKED
        return RankTier.entries.last { it != RankTier.UNRANKED && score >= it.minScore }
    }

    fun progressWithinTier(score: Double): Float {
        val tier = tierFor(score)
        val next = tier.next ?: return 1f
        if (tier == RankTier.UNRANKED) return 0f
        val span = next.minScore - tier.minScore
        return ((score - tier.minScore) / span).toFloat().coerceIn(0f, 1f)
    }

    private class Accumulator {
        var score = -1.0
        var bestName: String? = null
        var bestWeight = 0.0
        var bestReps = 0
        var best1Rm = 0.0
        var volume = 0.0
        var sets = 0
    }

    fun calculate(sets: List<LoggedSet>, bodyweightKg: Double): Map<MuscleGroup, MuscleRankInfo> {
        val bw = if (bodyweightKg > 20.0) bodyweightKg else DEFAULT_BODYWEIGHT_KG
        val acc = MuscleGroup.entries.associateWith { Accumulator() }

        for (set in sets) {
            val item = ExerciseLibrary.findByName(set.exerciseName) ?: continue
            if (item.isTimed || set.reps <= 0 || set.weightKg < 0.0) continue
            if (!item.isBodyweight && set.weightKg <= 0.0) continue

            val load = effectiveLoadKg(item, set.weightKg, bw)
            val primary = acc.getValue(item.muscleGroup)
            primary.volume += load * set.reps
            primary.sets += 1

            if (item.strengthRef <= 0.0) continue
            val oneRm = estimateOneRepMax(load, set.reps)
            val relative = oneRm / (bw * item.strengthRef)

            fun credit(muscle: MuscleGroup, value: Double) {
                val a = acc.getValue(muscle)
                if (value > a.score) {
                    a.score = value
                    a.bestName = item.name
                    a.bestWeight = set.weightKg
                    a.bestReps = set.reps
                    a.best1Rm = oneRm
                }
            }
            credit(item.muscleGroup, relative)
            for (helper in item.secondaryMuscles) credit(helper, relative * SECONDARY_FACTOR)
        }

        return MuscleGroup.entries.associateWith { muscle ->
            val a = acc.getValue(muscle)
            MuscleRankInfo(
                muscleGroup = muscle,
                tier = tierFor(a.score),
                score = a.score,
                progress = progressWithinTier(a.score),
                bestLiftName = a.bestName,
                bestLiftWeightKg = a.bestWeight,
                bestLiftReps = a.bestReps,
                bestEstimated1RmKg = a.best1Rm,
                totalVolumeKg = a.volume,
                setsLogged = a.sets
            )
        }
    }

    /** Average of every muscle's score; a muscle with no data counts as zero. */
    fun overall(ranks: Map<MuscleGroup, MuscleRankInfo>): OverallRank {
        if (ranks.isEmpty()) return OverallRank(RankTier.UNRANKED, -1.0, 0f)
        val anyData = ranks.values.any { it.tier != RankTier.UNRANKED }
        if (!anyData) return OverallRank(RankTier.UNRANKED, -1.0, 0f)
        val avg = ranks.values.map { it.score.coerceAtLeast(0.0) }.average()
        return OverallRank(tierFor(avg), avg, progressWithinTier(avg))
    }

    fun emptyRanks(): Map<MuscleGroup, MuscleRankInfo> = calculate(emptyList(), DEFAULT_BODYWEIGHT_KG)
}
