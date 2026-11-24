package com.benchpr.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.benchpr.app.data.local.AppDatabase
import com.benchpr.app.data.local.ExerciseSetLogEntity
import com.benchpr.app.data.local.WorkoutLogEntity
import com.benchpr.app.data.local.WorkoutWithSets
import com.benchpr.app.data.model.ActiveExerciseState
import com.benchpr.app.data.model.ActiveWorkoutState
import com.benchpr.app.data.model.ExerciseSetState
import com.benchpr.app.data.model.MuscleGroup
import com.benchpr.app.data.model.MuscleRankInfo
import com.benchpr.app.data.model.MuscleRankingEngine
import com.benchpr.app.data.model.ProgramData
import com.benchpr.app.data.model.WorkoutSessionTemplate
import com.benchpr.app.data.preferences.UserPreferences
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class WorkoutViewModel(application: Application) : AndroidViewModel(application) {

    private val db = AppDatabase.getInstance(application)
    private val workoutDao = db.workoutDao()
    private val userPreferences = UserPreferences(application)

    val target1RM: StateFlow<Double> = userPreferences.target1RM.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 100.0
    )

    val weightUnit: StateFlow<String> = userPreferences.weightUnit.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = "kg"
    )

    val historyWorkouts: StateFlow<List<WorkoutWithSets>> = workoutDao.getAllWorkoutsWithSets().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = emptyList()
    )

    val bestBenchLifted: StateFlow<Double?> = workoutDao.getBestBenchLifted().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = null
    )

    val totalWorkoutsCompleted: StateFlow<Int> = workoutDao.getTotalWorkoutsCount().stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = 0
    )

    val muscleRanks: StateFlow<Map<MuscleGroup, MuscleRankInfo>> = workoutDao.getAllCompletedSetLogs()
        .map { sets ->
            val volumeMap = mutableMapOf<MuscleGroup, Double>()
            MuscleGroup.values().forEach { volumeMap[it] = 0.0 }

            sets.forEach { set ->
                val muscle = MuscleRankingEngine.guessMuscleGroup(set.exerciseName)
                val setVolume = set.actualWeight * set.actualReps
                volumeMap[muscle] = (volumeMap[muscle] ?: 0.0) + setVolume
            }

            volumeMap.mapValues { (muscle, volume) ->
                MuscleRankingEngine.calculateRank(muscle, volume)
            }
        }.stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = MuscleGroup.values().associateWith { MuscleRankingEngine.calculateRank(it, 0.0) }
        )

    private val _activeWorkout = MutableStateFlow<ActiveWorkoutState?>(null)
    val activeWorkout: StateFlow<ActiveWorkoutState?> = _activeWorkout.asStateFlow()

    // Timer State
    private val _timerSecondsRemaining = MutableStateFlow(0)
    val timerSecondsRemaining: StateFlow<Int> = _timerSecondsRemaining.asStateFlow()

    private val _isTimerRunning = MutableStateFlow(false)
    val isTimerRunning: StateFlow<Boolean> = _isTimerRunning.asStateFlow()

    private var timerJob: Job? = null

    fun updateTarget1RM(newTarget: Double) {
        viewModelScope.launch {
            userPreferences.updateTarget1RM(newTarget)
        }
    }

    fun updateWeightUnit(unit: String) {
        viewModelScope.launch {
            userPreferences.updateWeightUnit(unit)
        }
    }

    fun startSession(sessionId: Int) {
        val template = ProgramData.ALL_SESSIONS.find { it.id == sessionId } ?: ProgramData.SESSION_1
        val currentTarget1RM = target1RM.value
        val currentUnit = weightUnit.value

        val activeExercises = template.exercises.map { exercise ->
            val targetWeight = ProgramData.calculateWeight(currentTarget1RM, exercise.targetPercent)
            val sets = (1..exercise.totalSets).map { index ->
                ExerciseSetState(
                    setIndex = index,
                    targetWeight = targetWeight,
                    targetReps = exercise.targetReps,
                    actualWeight = targetWeight,
                    actualReps = exercise.targetReps,
                    isCompleted = false,
                    durationSeconds = exercise.targetDurationSeconds
                )
            }
            ActiveExerciseState(
                template = exercise,
                calculatedTargetWeight = targetWeight,
                sets = sets
            )
        }

        _activeWorkout.value = ActiveWorkoutState(
            sessionTemplate = template,
            target1RM = currentTarget1RM,
            unit = currentUnit,
            exercises = activeExercises,
            startTimeMillis = System.currentTimeMillis()
        )
    }

    fun toggleSetCompletion(exerciseIndex: Int, setIndex: Int) {
        _activeWorkout.update { current ->
            if (current == null) return@update null
            val updatedExercises = current.exercises.mapIndexed { eIdx, exercise ->
                if (eIdx == exerciseIndex) {
                    val updatedSets = exercise.sets.mapIndexed { sIdx, set ->
                        if (sIdx == setIndex) {
                            set.copy(isCompleted = !set.isCompleted)
                        } else set
                    }
                    exercise.copy(sets = updatedSets)
                } else exercise
            }
            current.copy(exercises = updatedExercises)
        }
    }

    fun updateSetWeight(exerciseIndex: Int, setIndex: Int, weight: Double) {
        _activeWorkout.update { current ->
            if (current == null) return@update null
            val updatedExercises = current.exercises.mapIndexed { eIdx, exercise ->
                if (eIdx == exerciseIndex) {
                    val updatedSets = exercise.sets.mapIndexed { sIdx, set ->
                        if (sIdx == setIndex) {
                            set.copy(actualWeight = weight)
                        } else set
                    }
                    exercise.copy(sets = updatedSets)
                } else exercise
            }
            current.copy(exercises = updatedExercises)
        }
    }

    fun updateSetReps(exerciseIndex: Int, setIndex: Int, reps: Int) {
        _activeWorkout.update { current ->
            if (current == null) return@update null
            val updatedExercises = current.exercises.mapIndexed { eIdx, exercise ->
                if (eIdx == exerciseIndex) {
                    val updatedSets = exercise.sets.mapIndexed { sIdx, set ->
                        if (sIdx == setIndex) {
                            set.copy(actualReps = reps)
                        } else set
                    }
                    exercise.copy(sets = updatedSets)
                } else exercise
            }
            current.copy(exercises = updatedExercises)
        }
    }

    fun startTimer(durationSeconds: Int) {
        timerJob?.cancel()
        _timerSecondsRemaining.value = durationSeconds
        _isTimerRunning.value = true

        timerJob = viewModelScope.launch {
            while (_timerSecondsRemaining.value > 0 && _isTimerRunning.value) {
                delay(1000L)
                _timerSecondsRemaining.value -= 1
            }
            _isTimerRunning.value = false
        }
    }

    fun stopTimer() {
        timerJob?.cancel()
        _isTimerRunning.value = false
        _timerSecondsRemaining.value = 0
    }

    fun finishWorkout(onSaved: () -> Unit) {
        val workout = _activeWorkout.value ?: return
        viewModelScope.launch {
            val durationSeconds = ((System.currentTimeMillis() - workout.startTimeMillis) / 1000).coerceAtLeast(0)

            val workoutLog = WorkoutLogEntity(
                sessionId = workout.sessionTemplate.id,
                sessionTitle = workout.sessionTemplate.title,
                target1RM = workout.target1RM,
                unit = workout.unit,
                timestamp = System.currentTimeMillis(),
                totalDurationSeconds = durationSeconds,
                isCompleted = true
            )

            val setLogs = workout.exercises.flatMap { exercise ->
                exercise.sets.map { set ->
                    ExerciseSetLogEntity(
                        workoutLogId = 0L, // Handled in Dao transaction
                        exerciseName = exercise.template.name,
                        setIndex = set.setIndex,
                        targetWeight = set.targetWeight,
                        targetReps = set.targetReps,
                        actualWeight = set.actualWeight,
                        actualReps = set.actualReps,
                        isCompleted = set.isCompleted
                    )
                }
            }

            workoutDao.saveWorkout(workoutLog, setLogs)
            _activeWorkout.value = null
            onSaved()
        }
    }

    fun cancelWorkout() {
        stopTimer()
        _activeWorkout.value = null
    }

    fun deleteWorkoutLog(logId: Long) {
        viewModelScope.launch {
            workoutDao.deleteWorkoutLog(logId)
        }
    }
}
