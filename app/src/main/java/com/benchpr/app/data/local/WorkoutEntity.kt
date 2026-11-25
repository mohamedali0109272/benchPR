package com.benchpr.app.data.local

import androidx.room.Embedded
import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey
import androidx.room.Relation

@Entity(tableName = "workout_logs")
data class WorkoutLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val sessionId: Int,
    val sessionTitle: String,
    val target1RM: Double,
    val unit: String,
    val timestamp: Long = System.currentTimeMillis(),
    val totalDurationSeconds: Long = 0,
    val isCompleted: Boolean = true
)

@Entity(
    tableName = "set_logs",
    foreignKeys = [
        ForeignKey(
            entity = WorkoutLogEntity::class,
            parentColumns = ["id"],
            childColumns = ["workoutLogId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [Index("workoutLogId")]
)
data class ExerciseSetLogEntity(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val workoutLogId: Long,
    val exerciseName: String,
    val setIndex: Int,
    val targetWeight: Double,
    val targetReps: Int,
    val actualWeight: Double,
    val actualReps: Int,
    val isCompleted: Boolean = true
)

data class WorkoutWithSets(
    @Embedded val workoutLog: WorkoutLogEntity,
    @Relation(
        parentColumn = "id",
        entityColumn = "workoutLogId"
    )
    val sets: List<ExerciseSetLogEntity>
)

/** Most recent completed weight for an exercise, with the unit it was logged in. */
data class LastLift(
    val weight: Double,
    val unit: String
)
