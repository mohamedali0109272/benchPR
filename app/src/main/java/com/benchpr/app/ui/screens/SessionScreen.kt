package com.benchpr.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Done
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.Timer
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import com.benchpr.app.ui.i18n.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.benchpr.app.data.model.ActiveExerciseState
import com.benchpr.app.data.model.ExerciseSetState
import com.benchpr.app.ui.components.ExercisePickerDialog
import com.benchpr.app.ui.components.bouncyClickable
import com.benchpr.app.ui.components.rememberPulse
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

    var showPicker by remember { mutableStateOf(false) }
    var showDiscardDialog by remember { mutableStateOf(false) }

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

    val totalSets = workoutState.exercises.sumOf { it.sets.size }
    val doneSets = workoutState.exercises.sumOf { exercise -> exercise.sets.count { it.isCompleted } }
    val progress by animateFloatAsState(
        targetValue = if (totalSets == 0) 0f else doneSets.toFloat() / totalSets,
        animationSpec = tween(500),
        label = "sessionProgress"
    )

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
                        if (doneSets > 0) {
                            showDiscardDialog = true
                        } else {
                            viewModel.cancelWorkout()
                            onBackClick()
                        }
                    }) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Filled.ArrowBack,
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
                Column {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(
                            text = "$doneSets / $totalSets sets done",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = TextSecondary
                        )
                        Text(
                            text = "${(progress * 100).toInt()}%",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = AccentGreen
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp)),
                        color = AccentGreen,
                        trackColor = SurfaceVariantDark
                    )
                }
            }

            item {
                AnimatedVisibility(
                    visible = isTimerRunning || timerRemaining > 0,
                    enter = expandVertically(tween(250)) + fadeIn(tween(250)),
                    exit = shrinkVertically(tween(200)) + fadeOut(tween(150))
                ) {
                    TimerCard(
                        secondsRemaining = timerRemaining,
                        isRunning = isTimerRunning,
                        onStopClick = { viewModel.stopTimer() }
                    )
                }
            }

            if (workoutState.exercises.isEmpty()) {
                item {
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
                                .padding(20.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Your workout is empty",
                                fontWeight = FontWeight.Bold,
                                fontSize = 16.sp,
                                color = TextPrimary
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Add an exercise to start logging sets.",
                                fontSize = 13.sp,
                                color = TextSecondary
                            )
                        }
                    }
                }
            }

            itemsIndexed(
                items = workoutState.exercises,
                key = { _, exercise -> exercise.template.id }
            ) { eIdx, exerciseState ->
                ExerciseLoggingCard(
                    modifier = Modifier.animateItem(),
                    exerciseState = exerciseState,
                    unit = workoutState.unit,
                    onToggleSet = { sIdx -> viewModel.toggleSetCompletion(eIdx, sIdx) },
                    onUpdateWeight = { sIdx, w -> viewModel.updateSetWeight(eIdx, sIdx, w) },
                    onUpdateReps = { sIdx, r -> viewModel.updateSetReps(eIdx, sIdx, r) },
                    onStartHoldTimer = { duration -> viewModel.startTimer(duration) },
                    onAddSet = { viewModel.addSet(eIdx) },
                    onRemoveSet = { viewModel.removeSet(eIdx, exerciseState.sets.lastIndex) },
                    onRemoveExercise = { viewModel.removeExercise(eIdx) }
                )
            }

            item {
                OutlinedButton(
                    onClick = { showPicker = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(52.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, PrimaryNeon)
                ) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = PrimaryNeon, modifier = Modifier.size(22.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("ADD EXERCISE", color = PrimaryNeon, fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }

    if (showPicker) {
        ExercisePickerDialog(
            title = "Add exercise",
            onPick = { viewModel.addExercise(it) },
            onDismiss = { showPicker = false }
        )
    }

    if (showDiscardDialog) {
        AlertDialog(
            onDismissRequest = { showDiscardDialog = false },
            containerColor = SurfaceDark,
            title = { Text("Discard workout?", fontWeight = FontWeight.Bold, color = TextPrimary) },
            text = {
                Text(
                    text = "You have $doneSets completed sets that have not been saved.",
                    color = TextSecondary
                )
            },
            confirmButton = {
                TextButton(onClick = {
                    showDiscardDialog = false
                    viewModel.cancelWorkout()
                    onBackClick()
                }) {
                    Text("Discard", color = PrimaryNeon, fontWeight = FontWeight.Bold)
                }
            },
            dismissButton = {
                TextButton(onClick = { showDiscardDialog = false }) {
                    Text("Keep going", color = TextSecondary)
                }
            }
        )
    }
}

@Composable
fun TimerCard(
    secondsRemaining: Int,
    isRunning: Boolean,
    onStopClick: () -> Unit
) {
    val pulse = rememberPulse(low = 0.4f, durationMillis = 700)

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
                    modifier = Modifier
                        .size(28.dp)
                        .alpha(if (isRunning) pulse else 1f)
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
    onStartHoldTimer: (Int) -> Unit,
    onAddSet: () -> Unit,
    onRemoveSet: () -> Unit,
    onRemoveExercise: () -> Unit,
    modifier: Modifier = Modifier
) {
    val template = exerciseState.template
    val allDone = exerciseState.sets.isNotEmpty() && exerciseState.sets.all { it.isCompleted }
    val borderColor by animateColorAsState(
        targetValue = if (allDone) AccentGreen else CardBorderDark,
        animationSpec = tween(400),
        label = "exerciseBorder"
    )

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, borderColor, RoundedCornerShape(16.dp))
            .animateContentSize(),
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
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = template.name,
                        fontWeight = FontWeight.Bold,
                        fontSize = 17.sp,
                        color = TextPrimary
                    )
                    val weightLabel = if (exerciseState.calculatedTargetWeight > 0.0) {
                        formatPlainWeight(exerciseState.calculatedTargetWeight)
                    } else null
                    val descStr = when {
                        template.targetPercent > 0.0 && template.isStaticHold ->
                            "${template.targetPercent.toInt()}% Target (${exerciseState.calculatedTargetWeight} $unit) x ${template.targetDurationSeconds}s"
                        template.targetPercent > 0.0 -> {
                            val setStr = if (template.totalSets > 1) " | ${template.totalSets} sets" else ""
                            "${template.targetPercent.toInt()}% Target (${exerciseState.calculatedTargetWeight} $unit) x ${template.targetReps} reps$setStr"
                        }
                        template.isStaticHold ->
                            "${exerciseState.sets.size} sets x ${template.targetDurationSeconds}s hold"
                        else -> {
                            val reps = template.repRange ?: template.targetReps.toString()
                            val last = if (weightLabel != null) " | last: $weightLabel $unit" else ""
                            "${exerciseState.sets.size} sets x $reps reps$last"
                        }
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
                        Text(
                            text = "${template.targetDurationSeconds}s Hold",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }

                IconButton(onClick = onRemoveExercise) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Remove exercise",
                        tint = TextMuted
                    )
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

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                SetActionButton(
                    label = "ADD SET",
                    icon = Icons.Default.Add,
                    onClick = onAddSet,
                    modifier = Modifier.weight(1f)
                )
                if (exerciseState.sets.size > 1) {
                    SetActionButton(
                        label = "REMOVE SET",
                        icon = Icons.Default.Remove,
                        onClick = onRemoveSet,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
    }
}

@Composable
private fun SetActionButton(
    label: String,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Row(
        modifier = modifier
            .clip(RoundedCornerShape(10.dp))
            .background(SurfaceVariantDark)
            .bouncyClickable(onClick)
            .padding(vertical = 10.dp),
        horizontalArrangement = Arrangement.Center,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null, tint = SecondaryNeon, modifier = Modifier.size(16.dp))
        Spacer(modifier = Modifier.width(6.dp))
        Text(label, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = SecondaryNeon, letterSpacing = 0.5.sp)
    }
}

private fun formatPlainWeight(value: Double): String =
    if (value == value.toInt().toDouble()) value.toInt().toString() else value.toString()

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
    val backgroundColor by animateColorAsState(
        targetValue = if (set.isCompleted) SurfaceVariantDark else BackgroundDark,
        animationSpec = tween(300),
        label = "setBackground"
    )
    val rowBorder by animateColorAsState(
        targetValue = if (set.isCompleted) AccentGreen else CardBorderDark,
        animationSpec = tween(300),
        label = "setBorder"
    )
    // Springs past 1 and settles, so ticking a set gives it a little pop.
    val pop by animateFloatAsState(
        targetValue = if (set.isCompleted) 1f else 0.985f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioHighBouncy, stiffness = Spring.StiffnessMediumLow),
        label = "setPop"
    )

    Row(
        modifier = Modifier
            .fillMaxWidth()
            .graphicsLayer {
                scaleX = pop
                scaleY = pop
            }
            .clip(RoundedCornerShape(10.dp))
            .background(backgroundColor)
            .border(
                width = 1.dp,
                color = rowBorder,
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
            val weightStr = formatPlainWeight(set.actualWeight)
            var weightText by remember { mutableStateOf(weightStr) }
            // Pick up changes made elsewhere (for example the last-used weight arriving), without
            // overwriting what the lifter is typing.
            LaunchedEffect(set.actualWeight) {
                if (weightText.toDoubleOrNull() != set.actualWeight) weightText = weightStr
            }

            // Weight Input
            OutlinedTextField(
                value = weightText,
                onValueChange = { str ->
                    weightText = str
                    str.replace(',', '.').toDoubleOrNull()?.let { onWeightChange(it) }
                },
                modifier = Modifier.width(78.dp),
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                trailingIcon = { Text(unit, fontSize = 10.sp, color = TextMuted) },
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = PrimaryNeon,
                    unfocusedBorderColor = CardBorderDark
                )
            )

            Text("x", fontSize = 14.sp, color = TextMuted)

            if (isStaticHold) {
                OutlinedTextField(
                    value = "${set.durationSeconds}s",
                    onValueChange = {},
                    modifier = Modifier.width(70.dp),
                    singleLine = true,
                    enabled = false,
                    colors = OutlinedTextFieldDefaults.colors(
                        disabledTextColor = TextPrimary,
                        disabledBorderColor = CardBorderDark
                    )
                )
            } else {
                val repsStr = set.actualReps.toString()
                var repsText by remember { mutableStateOf(repsStr) }
                LaunchedEffect(set.actualReps) {
                    if (repsText.toIntOrNull() != set.actualReps) repsText = repsStr
                }

                // Reps Input
                OutlinedTextField(
                    value = repsText,
                    onValueChange = { str ->
                        repsText = str
                        str.toIntOrNull()?.let { onRepsChange(it) }
                    },
                    modifier = Modifier.width(70.dp),
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryNeon,
                        unfocusedBorderColor = CardBorderDark
                    )
                )
            }
        }
    }
}
