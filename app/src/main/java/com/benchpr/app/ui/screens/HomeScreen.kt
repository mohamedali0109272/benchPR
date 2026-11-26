package com.benchpr.app.ui.screens

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import com.benchpr.app.ui.i18n.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.benchpr.app.data.model.ProgramData
import com.benchpr.app.data.model.WorkoutSessionTemplate
import com.benchpr.app.ui.components.AnimatedEntrance
import com.benchpr.app.ui.components.ExercisePickerDialog
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
import androidx.compose.material.icons.filled.Language
import androidx.compose.material3.RadioButton
import androidx.compose.material3.RadioButtonDefaults
import com.benchpr.app.data.i18n.AppLanguage
import com.benchpr.app.ui.components.bouncyClickable

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    viewModel: WorkoutViewModel,
    onStartSession: (Int) -> Unit,
    onNavigateToHistory: () -> Unit,
    onQuickStart: (String?) -> Unit,
    onOpenSplits: () -> Unit
) {
    val target1RM by viewModel.target1RM.collectAsState()
    val unit by viewModel.weightUnit.collectAsState()
    val bestLifted by viewModel.bestBenchLifted.collectAsState()
    val totalWorkouts by viewModel.totalWorkoutsCompleted.collectAsState()

    var showEdit1RMDialog by remember { mutableStateOf(false) }
    var showExercisePicker by remember { mutableStateOf(false) }
    var showLanguageDialog by remember { mutableStateOf(false) }
    val language by viewModel.language.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.FitnessCenter,
                            contentDescription = null,
                            tint = PrimaryNeon,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "BENCH PR TRACKER",
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp,
                            letterSpacing = 1.sp,
                            color = TextPrimary
                        )
                    }
                },
                actions = {
                    IconButton(onClick = { showLanguageDialog = true }) {
                        Icon(
                            imageVector = Icons.Default.Language,
                            contentDescription = "Language",
                            tint = SecondaryNeon
                        )
                    }
                    IconButton(onClick = onNavigateToHistory) {
                        Icon(
                            imageVector = Icons.Default.History,
                            contentDescription = "Workout History",
                            tint = SecondaryNeon
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = BackgroundDark
                )
            )
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
                Target1RMCard(
                    target1RM = target1RM,
                    unit = unit,
                    onEditClick = { showEdit1RMDialog = true }
                )
            }

            item {
                QuickStatsRow(
                    bestLifted = bestLifted,
                    totalWorkouts = totalWorkouts,
                    unit = unit
                )
            }

            item {
                AnimatedEntrance(index = 1) {
                    QuickStartCard(
                        onStartEmpty = { onQuickStart(null) },
                        onPickExercise = { showExercisePicker = true },
                        onOpenSplits = onOpenSplits
                    )
                }
            }

            item {
                Text(
                    text = "BENCH PR PROGRAM",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    letterSpacing = 1.2.sp,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 8.dp)
                )
            }

            itemsIndexed(ProgramData.ALL_SESSIONS) { index, sessionTemplate ->
                AnimatedEntrance(index = index + 2) {
                    SessionCard(
                        session = sessionTemplate,
                        target1RM = target1RM,
                        unit = unit,
                        onStartClick = { onStartSession(sessionTemplate.id) }
                    )
                }
            }

            item {
                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }

    if (showLanguageDialog) {
        LanguageDialog(
            current = language,
            onSelect = { viewModel.setLanguage(it) },
            onDismiss = { showLanguageDialog = false }
        )
    }

    if (showExercisePicker) {
        ExercisePickerDialog(
            title = "Start an exercise",
            onPick = { onQuickStart(it.id) },
            onDismiss = { showExercisePicker = false }
        )
    }

    if (showEdit1RMDialog) {
        Edit1RMDialog(
            currentTarget1RM = target1RM,
            currentUnit = unit,
            onDismiss = { showEdit1RMDialog = false },
            onSave = { new1RM, newUnit ->
                viewModel.updateTarget1RM(new1RM)
                viewModel.updateWeightUnit(newUnit)
                showEdit1RMDialog = false
            }
        )
    }
}

@Composable
fun LanguageDialog(
    current: AppLanguage,
    onSelect: (AppLanguage) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = SurfaceDark,
        title = { Text("Language", fontWeight = FontWeight.Bold, color = TextPrimary) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                AppLanguage.entries.forEach { option ->
                    val selected = option == current
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (selected) SurfaceVariantDark else SurfaceDark)
                            .border(
                                width = 1.dp,
                                color = if (selected) PrimaryNeon else CardBorderDark,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .bouncyClickable {
                                onSelect(option)
                                onDismiss()
                            }
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        RadioButton(
                            selected = selected,
                            onClick = null,
                            colors = RadioButtonDefaults.colors(selectedColor = PrimaryNeon)
                        )
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            text = option.nativeName,
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp,
                            color = TextPrimary
                        )
                    }
                }
            }
        },
        confirmButton = {},
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = TextSecondary) }
        }
    )
}

@Composable
fun QuickStartCard(
    onStartEmpty: () -> Unit,
    onPickExercise: () -> Unit,
    onOpenSplits: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorderDark, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(
                text = "QUICK START",
                fontWeight = FontWeight.SemiBold,
                fontSize = 12.sp,
                color = PrimaryNeon,
                letterSpacing = 1.sp
            )
            Text(
                text = "Train what you feel like, no plan needed.",
                fontSize = 13.sp,
                color = TextSecondary
            )
            Spacer(modifier = Modifier.height(12.dp))
            Button(
                onClick = onPickExercise,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = PrimaryNeon,
                    contentColor = BackgroundDark
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(22.dp))
                Spacer(modifier = Modifier.width(8.dp))
                Text("START AN EXERCISE", fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = onStartEmpty,
                    modifier = Modifier
                        .weight(1f)
                        .height(46.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, SecondaryNeon)
                ) {
                    Text("EMPTY WORKOUT", color = SecondaryNeon, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
                OutlinedButton(
                    onClick = onOpenSplits,
                    modifier = Modifier
                        .weight(1f)
                        .height(46.dp),
                    shape = RoundedCornerShape(12.dp),
                    border = BorderStroke(1.dp, SecondaryNeon)
                ) {
                    Text("BROWSE SPLITS", color = SecondaryNeon, fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}

@Composable
fun Target1RMCard(
    target1RM: Double,
    unit: String,
    onEditClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorderDark, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(16.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(20.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "TARGET BENCH PR (1RM)",
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 12.sp,
                    color = PrimaryNeon,
                    letterSpacing = 1.sp
                )
                Spacer(modifier = Modifier.height(4.dp))
                Row(verticalAlignment = Alignment.Bottom) {
                    Text(
                        text = if (target1RM % 1.0 == 0.0) "${target1RM.toInt()}" else "$target1RM",
                        fontWeight = FontWeight.Black,
                        fontSize = 36.sp,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = unit,
                        fontWeight = FontWeight.Bold,
                        fontSize = 18.sp,
                        color = TextSecondary,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )
                }
            }

            IconButton(
                onClick = onEditClick,
                modifier = Modifier
                    .clip(CircleShape)
                    .background(SurfaceVariantDark)
            ) {
                Icon(
                    imageVector = Icons.Default.Edit,
                    contentDescription = "Edit Target 1RM",
                    tint = SecondaryNeon
                )
            }
        }
    }
}

@Composable
fun QuickStatsRow(
    bestLifted: Double?,
    totalWorkouts: Int,
    unit: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        Card(
            modifier = Modifier
                .weight(1f)
                .border(1.dp, CardBorderDark, RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.TrendingUp,
                        contentDescription = null,
                        tint = AccentGreen,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "BEST RECORDED",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = if (bestLifted != null) "$bestLifted $unit" else "No logs yet",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }
        }

        Card(
            modifier = Modifier
                .weight(1f)
                .border(1.dp, CardBorderDark, RoundedCornerShape(12.dp)),
            colors = CardDefaults.cardColors(containerColor = SurfaceDark),
            shape = RoundedCornerShape(12.dp)
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        imageVector = Icons.Default.FitnessCenter,
                        contentDescription = null,
                        tint = SecondaryNeon,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Text(
                        text = "COMPLETED",
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextMuted
                    )
                }
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "$totalWorkouts Workouts",
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
            }
        }
    }
}

@Composable
fun SessionCard(
    session: WorkoutSessionTemplate,
    target1RM: Double,
    unit: String,
    onStartClick: () -> Unit
) {
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
                .padding(18.dp)
        ) {
            Text(
                text = session.title,
                fontWeight = FontWeight.Bold,
                fontSize = 18.sp,
                color = TextPrimary
            )
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "Main goal: ${session.goal}",
                fontSize = 13.sp,
                color = PrimaryNeon,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(14.dp))

            // Exercise Checklist summary from reference image
            Column(
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                session.exercises.forEach { exercise ->
                    val weight = ProgramData.calculateWeight(target1RM, exercise.targetPercent)
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(14.dp)
                                    .border(1.5.dp, TextMuted, CircleShape)
                            )
                            Spacer(modifier = Modifier.width(10.dp))
                            val repOrSecStr = if (exercise.isStaticHold) {
                                "${exercise.targetPercent.toInt()}% x ${exercise.targetDurationSeconds} seconds"
                            } else {
                                val setStr = if (exercise.totalSets > 1) " (${exercise.totalSets} sets)" else ""
                                "${exercise.targetPercent.toInt()}% x ${exercise.targetReps}$setStr"
                            }
                            Text(
                                text = "${exercise.name} - $repOrSecStr",
                                fontSize = 14.sp,
                                color = TextPrimary,
                                fontWeight = FontWeight.Normal
                            )
                        }

                        Text(
                            text = "$weight $unit",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = SecondaryNeon
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            Button(
                onClick = onStartClick,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(
                    containerColor = PrimaryNeon,
                    contentColor = BackgroundDark
                ),
                shape = RoundedCornerShape(10.dp)
            ) {
                Icon(
                    imageVector = Icons.Default.PlayArrow,
                    contentDescription = null,
                    modifier = Modifier.size(20.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "START SESSION ${session.id}",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    letterSpacing = 0.5.sp
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun Edit1RMDialog(
    currentTarget1RM: Double,
    currentUnit: String,
    onDismiss: () -> Unit,
    onSave: (Double, String) -> Unit
) {
    var textValue by remember { mutableStateOf(currentTarget1RM.toString()) }
    var selectedUnit by remember { mutableStateOf(currentUnit) }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Set Target Bench PR",
                fontWeight = FontWeight.Bold,
                color = TextPrimary
            )
        },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Text(
                    text = "Enter your goal single rep max (1RM). Exercise weights in all 3 sessions will auto-scale.",
                    fontSize = 13.sp,
                    color = TextSecondary
                )

                OutlinedTextField(
                    value = textValue,
                    onValueChange = { textValue = it },
                    label = { Text("Target Weight") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth()
                )

                Row(
                    horizontalArrangement = Arrangement.spacedBy(10.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Unit:", fontSize = 14.sp, color = TextPrimary)
                    FilterChip(
                        selected = selectedUnit == "kg",
                        onClick = { selectedUnit = "kg" },
                        label = { Text("kg") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryNeon,
                            selectedLabelColor = BackgroundDark
                        )
                    )
                    FilterChip(
                        selected = selectedUnit == "lbs",
                        onClick = { selectedUnit = "lbs" },
                        label = { Text("lbs") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryNeon,
                            selectedLabelColor = BackgroundDark
                        )
                    )
                }
            }
        },
        confirmButton = {
            Button(
                onClick = {
                    val parsed = textValue.toDoubleOrNull() ?: currentTarget1RM
                    onSave(parsed, selectedUnit)
                },
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryNeon)
            ) {
                Text("Save Target", color = BackgroundDark, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel", color = TextSecondary)
            }
        },
        containerColor = SurfaceDark
    )
}
