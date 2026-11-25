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
import com.benchpr.app.data.model.ExerciseItem
import com.benchpr.app.data.model.ExerciseLibrary
import com.benchpr.app.data.model.ExerciseSetState
import com.benchpr.app.data.model.ExerciseTemplate
import com.benchpr.app.data.model.LoggedSet
import com.benchpr.app.data.model.MuscleGroup
import com.benchpr.app.data.model.MuscleRankInfo
import com.benchpr.app.data.model.OverallRank
import com.benchpr.app.data.model.ProgramData
import com.benchpr.app.data.model.RankingEngine
import com.benchpr.app.data.model.Splits
import com.benchpr.app.data.model.WorkoutSessionTemplate
import com.benchpr.app.data.preferences.UserPreferences
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.math.roundToInt

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

    val bodyweightKg: StateFlow<Double> = userPreferences.bodyweightKg.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = RankingEngine.DEFAULT_BODYWEIGHT_KG
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

    /**
     * Ranks are strength based: every completed set is converted to kilograms using the unit of the
     * workout it was logged in, so switching between kg and lbs never distorts a rank.
     */
    val muscleRanks: StateFlow<Map<MuscleGroup, MuscleRankInfo>> = combine(
        workoutDao.getAllWorkoutsWithSets(),
        userPreferences.bodyweightKg
    ) { workouts, bodyweight ->
        val sets = workouts.flatMap { workout ->
            workout.sets
                .filter { it.isCompleted }
                .map {
                    LoggedSet(
                        exerciseName = it.exerciseName,
                        weightKg = RankingEngine.toKg(it.actualWeight, workout.workoutLog.unit),
                        reps = it.actualReps
                    )
                }
        }
        RankingEngine.calculate(sets, bodyweight)
    }.flowOn(Dispatchers.Default).stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = RankingEngine.emptyRanks()
    )

    val overallRank: StateFlow<OverallRank> = muscleRanks
        .map { RankingEngine.overall(it) }
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = RankingEngine.overall(RankingEngine.emptyRanks())
        )

    private val _activeWorkout = MutableStateFlow<ActiveWorkoutState?>(null)
    val activeWorkout: StateFlow<ActiveWorkoutState?> = _activeWorkout.asStateFlow()

    // Timer State
    private val _timerSecondsRemaining = MutableStateFlow(0)
    val timerSecondsRemaining: StateFlow<Int> = _timerSecondsRemaining.asStateFlow()

    private val _isTimerRunning = MutableStateFlow(false)
    val isTimerRunning: StateFlow<Boolean> = _isTimerRunning.asStateFlow()

    private var timerJob: Job? = null
    private var isSaving = false

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

    fun updateBodyweightKg(kg: Double) {
        if (kg < 20.0 || kg > 400.0) return
        viewModelScope.launch {
            userPreferences.updateBodyweightKg(kg)
        }
    }

    // ---------------------------------------------------------------- starting workouts

    /** Starts one of the three sessions of the original bench program. */
    fun startSession(sessionId: Int) {
        val template = ProgramData.ALL_SESSIONS.find { it.id == sessionId } ?: ProgramData.SESSION_1
        val currentTarget1RM = target1RM.value

        val activeExercises = template.exercises.map { exercise ->
            val targetWeight = ProgramData.calculateWeight(currentTarget1RM, exercise.targetPercent)
            buildActiveExercise(exercise, targetWeight)
        }
        beginWorkout(template, activeExercises, currentTarget1RM)
    }

    /** Starts a day of one of the training splits. */
    fun startSplitDay(splitId: String, dayIndex: Int) {
        val split = Splits.findSplit(splitId) ?: return
        val day = split.days.getOrNull(dayIndex) ?: return

        val templates = day.exercises.mapIndexedNotNull { index, entry ->
            val item = ExerciseLibrary.getById(entry.exerciseId) ?: return@mapIndexedNotNull null
            ExerciseTemplate(
                id = "${split.id}_${dayIndex}_$index",
                name = item.name,
                targetPercent = 0.0,
                targetReps = entry.repsMax,
                targetDurationSeconds = entry.durationSeconds,
                totalSets = entry.sets,
                isStaticHold = item.isTimed,
                repRange = if (item.isTimed) null else entry.repRange
            )
        }
        val session = WorkoutSessionTemplate(
            id = 0,
            title = "${split.name} - ${day.name}",
            subtitle = day.focus,
            goal = day.focus.lowercase(),
            exercises = templates
        )
        beginWorkout(session, templates.map { buildActiveExercise(it, 0.0) }, target1RM.value)
    }

    /**
     * Starts a freestyle workout. With an [exerciseId] the workout begins with that single exercise,
     * otherwise it starts empty and exercises are added as the lifter goes.
     */
    fun startQuickWorkout(exerciseId: String? = null) {
        val item = exerciseId?.let { ExerciseLibrary.getById(it) }
        val session = WorkoutSessionTemplate(
            id = 0,
            title = item?.name ?: "Quick Workout",
            subtitle = "Freestyle",
            goal = "train what you want",
            exercises = emptyList()
        )
        beginWorkout(session, emptyList(), target1RM.value)
        if (item != null) addExercise(item)
    }

    private fun beginWorkout(
        template: WorkoutSessionTemplate,
        exercises: List<ActiveExerciseState>,
        target1RMValue: Double
    ) {
        stopTimer()
        isSaving = false
        _activeWorkout.value = ActiveWorkoutState(
            sessionTemplate = template,
            target1RM = target1RMValue,
            unit = weightUnit.value,
            exercises = exercises,
            startTimeMillis = System.currentTimeMillis()
        )
        prefillLastWeights(exercises.map { it.template.name })
    }

    private fun buildActiveExercise(template: ExerciseTemplate, targetWeight: Double): ActiveExerciseState {
        val sets = (1..template.totalSets).map { index ->
            ExerciseSetState(
                setIndex = index,
                targetWeight = targetWeight,
                targetReps = template.targetReps,
                actualWeight = targetWeight,
                actualReps = template.targetReps,
                isCompleted = false,
                durationSeconds = template.targetDurationSeconds
            )
        }
        return ActiveExerciseState(
            template = template,
            calculatedTargetWeight = targetWeight,
            sets = sets
        )
    }

    /** Fills empty weights with whatever the lifter last used for the same exercise. */
    private fun prefillLastWeights(exerciseNames: List<String>) {
        viewModelScope.launch {
            for (name in exerciseNames.distinct()) {
                val last = workoutDao.getLastLift(name) ?: continue
                val unit = _activeWorkout.value?.unit ?: return@launch
                val kg = RankingEngine.toKg(last.weight, last.unit)
                val weight = (RankingEngine.fromKg(kg, unit) * 2.0).roundToInt() / 2.0
                applyPrefill(name, weight)
            }
        }
    }

    private fun applyPrefill(exerciseName: String, weight: Double) {
        _activeWorkout.update { current ->
            current?.copy(
                exercises = current.exercises.map { exercise ->
                    if (exercise.template.name == exerciseName && exercise.template.targetPercent <= 0.0) {
                        exercise.copy(
                            calculatedTargetWeight = weight,
                            sets = exercise.sets.map { set ->
                                if (!set.isCompleted && set.actualWeight == 0.0) {
                                    set.copy(targetWeight = weight, actualWeight = weight)
                                } else set
                            }
                        )
                    } else exercise
                }
            )
        }
    }

    // ---------------------------------------------------------------- editing the active workout

    fun addExercise(item: ExerciseItem) {
        val holdSeconds = if (item.isTimed) (if (item.id == "ex_static_hold") 30 else 45) else 0
        val template = ExerciseTemplate(
            id = "${item.id}_${System.nanoTime()}",
            name = item.name,
            targetPercent = 0.0,
            targetReps = item.defaultReps,
            targetDurationSeconds = holdSeconds,
            totalSets = item.defaultSets,
            isStaticHold = item.isTimed
        )
        _activeWorkout.update { current ->
            current?.copy(exercises = current.exercises + buildActiveExercise(template, 0.0))
        }
        prefillLastWeights(listOf(item.name))
    }

    fun removeExercise(exerciseIndex: Int) {
        _activeWorkout.update { current ->
            if (current == null || exerciseIndex !in current.exercises.indices) return@update current
            current.copy(exercises = current.exercises.filterIndexed { index, _ -> index != exerciseIndex })
        }
    }

    fun addSet(exerciseIndex: Int) {
        updateExercise(exerciseIndex) { exercise ->
            val last = exercise.sets.lastOrNull()
            val newSet = ExerciseSetState(
                setIndex = exercise.sets.size + 1,
                targetWeight = last?.targetWeight ?: 0.0,
                targetReps = last?.targetReps ?: exercise.template.targetReps,
                actualWeight = last?.actualWeight ?: 0.0,
                actualReps = last?.actualReps ?: exercise.template.targetReps,
                isCompleted = false,
                durationSeconds = last?.durationSeconds ?: exercise.template.targetDurationSeconds
            )
            exercise.copy(sets = exercise.sets + newSet)
        }
    }

    fun removeSet(exerciseIndex: Int, setIndex: Int) {
        updateExercise(exerciseIndex) { exercise ->
            if (exercise.sets.size <= 1 || setIndex !in exercise.sets.indices) return@updateExercise exercise
            val remaining = exercise.sets.filterIndexed { index, _ -> index != setIndex }
            exercise.copy(sets = remaining.mapIndexed { index, set -> set.copy(setIndex = index + 1) })
        }
    }

    fun toggleSetCompletion(exerciseIndex: Int, setIndex: Int) {
        updateSet(exerciseIndex, setIndex) { it.copy(isCompleted = !it.isCompleted) }
    }

    fun updateSetWeight(exerciseIndex: Int, setIndex: Int, weight: Double) {
        updateSet(exerciseIndex, setIndex) { it.copy(actualWeight = weight) }
    }

    fun updateSetReps(exerciseIndex: Int, setIndex: Int, reps: Int) {
        updateSet(exerciseIndex, setIndex) { it.copy(actualReps = reps) }
    }

    private fun updateExercise(exerciseIndex: Int, transform: (ActiveExerciseState) -> ActiveExerciseState) {
        _activeWorkout.update { current ->
            if (current == null) return@update null
            current.copy(
                exercises = current.exercises.mapIndexed { index, exercise ->
                    if (index == exerciseIndex) transform(exercise) else exercise
                }
            )
        }
    }

    private fun updateSet(exerciseIndex: Int, setIndex: Int, transform: (ExerciseSetState) -> ExerciseSetState) {
        updateExercise(exerciseIndex) { exercise ->
            exercise.copy(
                sets = exercise.sets.mapIndexed { index, set ->
                    if (index == setIndex) transform(set) else set
                }
            )
        }
    }

    // ---------------------------------------------------------------- timer

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

    // ---------------------------------------------------------------- finishing

    /**
     * Saves the workout. A workout with no completed set is discarded instead of saved, so an
     * accidental tap on a quick workout does not leave an empty entry in the history.
     */
    fun finishWorkout(onSaved: () -> Unit) {
        val workout = _activeWorkout.value ?: return
        if (isSaving) return
        isSaving = true
        stopTimer()

        val hasCompletedSet = workout.exercises.any { exercise -> exercise.sets.any { it.isCompleted } }
        if (!hasCompletedSet) {
            _activeWorkout.value = null
            isSaving = false
            onSaved()
            return
        }

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

            try {
                workoutDao.saveWorkout(workoutLog, setLogs)
                _activeWorkout.value = null
                onSaved()
            } finally {
                isSaving = false
            }
        }
    }

    fun cancelWorkout() {
        stopTimer()
        isSaving = false
        _activeWorkout.value = null
    }

    fun deleteWorkoutLog(logId: Long) {
        viewModelScope.launch {
            workoutDao.deleteWorkoutLog(logId)
        }
    }
}
