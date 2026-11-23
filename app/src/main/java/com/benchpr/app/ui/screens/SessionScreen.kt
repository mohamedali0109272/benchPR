package com.benchpr.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Done
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.benchpr.app.data.model.ActiveExerciseState
import com.benchpr.app.data.model.ActiveWorkoutState
import com.benchpr.app.data.model.ExerciseSetState
import com.benchpr.app.ui.theme.AccentGreen
import com.benchpr.app.ui.theme.BackgroundDark
import com.benchpr.app.ui.theme.CardBorderDark
import com.benchpr.app.ui.theme.PrimaryNeon
import com.benchpr.app.ui.theme.SecondaryNeon
import com.benchpr.app.ui.theme.SurfaceDark
import com.benchpr.app.ui.theme.SurfaceVariantDark
import com.benchpr.app.ui.theme.TextMuted
import com.benchpr.app.ui.theme.TextPrimary
import com.benchpr.app.ui.theme.TextSecondary
import com.benchpr.app.ui.viewmodel.WorkoutViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SessionScreen(
    viewModel: WorkoutViewModel,
    onWorkoutFinished: () -> Unit,
    onBackClick: () -> Unit
) {
    val activeWorkout by viewModel.activeWorkout.collectAsState()
    val timerRemaining by viewModel.timerSecondsRemaining.collectAsState()
    val isTimerRunning by viewModel.isTimerRunning.collectAsState()

    val workoutState = activeWorkout

    if (workoutState == null) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(BackgroundDark),
            contentAlignment = Alignment.Center
        ) {
            Text(text = "No active workout session.", color = TextSecondary)
        }
        return
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = workoutState.sessionTemplate.title,
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = TextPrimary
                        )
                        Text(
                            text = "Goal: ${workoutState.sessionTemplate.goal}",
                            fontSize = 12.sp,
                            color = PrimaryNeon
                        )
                    }
                },
                navigationIcon = {
                    IconButton(onClick = {
                        viewModel.cancelWorkout()
                        onBackClick()
                    }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = TextPrimary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = {
                        viewModel.finishWorkout { onWorkoutFinished() }
                    }) {
                        Icon(
                            imageVector = Icons.Default.CheckCircle,
                            contentDescription = "Finish Workout",
                            tint = AccentGreen
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BackgroundDark)
            )
        },
        bottomBar = {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(SurfaceDark)
                    .padding(16.dp)
            ) {
                Button(
                    onClick = { viewModel.finishWorkout { onWorkoutFinished() } },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = AccentGreen,
                        contentColor = BackgroundDark
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Done,
                        contentDescription = null,
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "FINISH & LOG WORKOUT",
                        fontWeight = FontWeight.Black,
                        fontSize = 15.sp,
                        letterSpacing = 0.5.sp
                    )
                }
            }
        },
        containerColor = BackgroundDark
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(8.dp))
                if (isTimerRunning || timerRemaining > 0) {
                    TimerCard(
                        secondsRemaining = timerRemaining,
                        isRunning = isTimerRunning,
                        onStopClick = { viewModel.stopTimer() }
                    )
                }
            }

            itemsIndexed(workoutState.exercises) { eIdx, exerciseState ->
                ExerciseLoggingCard(
                    exerciseState = exerciseState,
                    unit = workoutState.unit,
                    onToggleSet = { sIdx -> viewModel.toggleSetCompletion(eIdx, sIdx) },
                    onUpdateWeight = { sIdx, w -> viewModel.updateSetWeight(eIdx, sIdx, w) },
                    onUpdateReps = { sIdx, r -> viewModel.updateSetReps(eIdx, sIdx, r) },
                    onStartHoldTimer = { duration -> viewModel.startTimer(duration) }
                )
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

@Composable
fun TimerCard(
    secondsRemaining: Int,
    isRunning: Boolean,
    onStopClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, PrimaryNeon, RoundedCornerShape(12.dp)),
        colors = CardDefaults.cardColors(containerColor = SurfaceVariantDark),
        shape = RoundedCornerShape(12.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(
                    imageVector = Icons.Default.Timer,
                    contentDescription = null,
                    tint = PrimaryNeon,
                    modifier = Modifier.size(28.dp)
                )
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(
                        text = if (isRunning) "STATIC HOLD TIMER RUNNING" else "TIMER PAUSED",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        color = PrimaryNeon,
                        letterSpacing = 1.sp
                    )
                    Text(
                        text = String.format("%02d:%02d", secondsRemaining / 60, secondsRemaining % 60),
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = TextPrimary
                    )
                }
            }

            IconButton(
                onClick = onStopClick,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(PrimaryNeon)
            ) {
                Icon(
                    imageVector = Icons.Default.Stop,
                    contentDescription = "Stop Timer",
                    tint = BackgroundDark
                )
            }
        }
    }
}

@Composable
fun ExerciseLoggingCard(
    exerciseState: ActiveExerciseState,
    unit: String,
    onToggleSet: (Int) -> Unit,
    onUpdateWeight: (Int, Double) -> Unit,
    onUpdateReps: (Int, Int) -> Unit,
    onStartHoldTimer: (Int) -> Unit
) {
    val template = exerciseState.template

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorderDark, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = template.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = TextPrimary
                    )
                    val descStr = if (template.isStaticHold) {
                        "${template.targetPercent.toInt()}% Target (${exerciseState.calculatedTargetWeight} $unit) x ${template.targetDurationSeconds}s"
                    } else {
                        val setStr = if (template.totalSets > 1) " | ${template.totalSets} sets" else ""
                        "${template.targetPercent.toInt()}% Target (${exerciseState.calculatedTargetWeight} $unit) x ${template.targetReps} reps$setStr"
                    }
                    Text(
                        text = descStr,
                        fontSize = 13.sp,
                        color = SecondaryNeon,
                        fontWeight = FontWeight.Medium
                    )
                }

                if (template.isStaticHold) {
                    Button(
                        onClick = { onStartHoldTimer(template.targetDurationSeconds) },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PrimaryNeon,
                            contentColor = BackgroundDark
                        ),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.PlayArrow,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text(text = "30s Hold", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Spacer(modifier = Modifier.height(14.dp))

            // Set Rows
            exerciseState.sets.forEachIndexed { setIndex, set ->
                SetLoggingRow(
                    set = set,
                    setNumber = setIndex + 1,
                    isStaticHold = template.isStaticHold,
                    unit = unit,
                    onToggle = { onToggleSet(setIndex) },
                    onWeightChange = { w -> onUpdateWeight(setIndex, w) },
                    onRepsChange = { r -> onUpdateReps(setIndex, r) }
                )
                if (setIndex < exerciseState.sets.size - 1) {
                    Spacer(modifier = Modifier.height(8.dp))
                }
            }
        }
    }
}

@Composable
fun SetLoggingRow(
    set: ExerciseSetState,
    setNumber: Int,
    isStaticHold: Boolean,
    unit: String,
    onToggle: () -> Unit,
    onWeightChange: (Double) -> Unit,
    onRepsChange: (Int) -> Unit
) {
    val backgroundColor = if (set.isCompleted) SurfaceVariantDark else BackgroundDark

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(10.dp))
            .background(backgroundColor)
            .border(
                width = 1.dp,
                color = if (set.isCompleted) AccentGreen else CardBorderDark,
                shape = RoundedCornerShape(10.dp)
            )
            .clickable { onToggle() }
            .padding(horizontal = 12.dp, vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Checkbox(
                checked = set.isCompleted,
                onCheckedChange = { onToggle() },
                colors = CheckboxDefaults.colors(
                    checkedColor = AccentGreen,
                    checkmarkColor = BackgroundDark,
                    uncheckedColor = TextMuted
                )
            )
            Spacer(modifier = Modifier.width(4.dp))
            Text(
                text = "SET $setNumber",
                fontWeight = FontWeight.Bold,
                fontSize = 13.sp,
                color = if (set.isCompleted) AccentGreen else TextSecondary
            )
        }

        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            // Weight Input
            OutlinedTextField(
                value = if (set.actualWeight % 1.0 == 0.0) "${set.actualWeight.toInt()}" else "${set.actualWeight}",
                onValueChange = { val str -> str.toDoubleOrNull()?.let { onWeightChange(it) } },
                modifier = Modifier.width(78.dp),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                trailingIcon = { Text(unit, fontSize = 10.sp, color = TextMuted) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryNeon,
                    unfocusedBorderColor = CardBorderDark
                )
            )

            Text("x", fontSize = 14.sp, color = TextMuted)

            // Reps or seconds Input
            OutlinedTextField(
                value = if (isStaticHold) "${set.durationSeconds}s" else "${set.actualReps}",
                onValueChange = { val str -> str.toIntOrNull()?.let { onRepsChange(it) } },
                modifier = Modifier.width(70.dp),
                singleLine = true,
                enabled = !isStaticHold,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryNeon,
                    unfocusedBorderColor = CardBorderDark
                )
            )
        }
    }
}
