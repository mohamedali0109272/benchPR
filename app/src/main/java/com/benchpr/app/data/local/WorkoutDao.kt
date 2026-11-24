package com.benchpr.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import androidx.room.Transaction
import kotlinx.coroutines.flow.Flow

@Dao
interface WorkoutDao {

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertWorkoutLog(log: WorkoutLogEntity): Long

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSetLogs(sets: List<ExerciseSetLogEntity>)

    @Transaction
    suspend fun saveWorkout(workoutLog: WorkoutLogEntity, setLogs: List<ExerciseSetLogEntity>) {
        val id = insertWorkoutLog(workoutLog)
        val setsWithWorkoutId = setLogs.map { it.copy(workoutLogId = id) }
        insertSetLogs(setsWithWorkoutId)
    }

    @Transaction
    @Query("SELECT * FROM workout_logs ORDER BY timestamp DESC")
    fun getAllWorkoutsWithSets(): Flow<List<WorkoutWithSets>>

    @Query("SELECT * FROM workout_logs WHERE id = :id")
    suspend fun getWorkoutById(id: Long): WorkoutLogEntity?

    @Query("DELETE FROM workout_logs WHERE id = :id")
    suspend fun deleteWorkoutLog(id: Long)

    @Query("SELECT MAX(actualWeight) FROM set_logs WHERE isCompleted = 1 AND exerciseName IN ('Heavy Single', 'Bench press', 'Bench Press', 'Paused Bench')")
    fun getBestBenchLifted(): Flow<Double?>

    @Query("SELECT COUNT(*) FROM workout_logs")
    fun getTotalWorkoutsCount(): Flow<Int>

    @Query("SELECT * FROM set_logs WHERE isCompleted = 1")
    fun getAllCompletedSetLogs(): Flow<List<ExerciseSetLogEntity>>
}
