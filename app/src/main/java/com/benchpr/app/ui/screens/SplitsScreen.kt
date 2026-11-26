package com.benchpr.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.filled.ExpandMore
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.ViewWeek
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import com.benchpr.app.ui.i18n.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.benchpr.app.data.model.ExerciseLibrary
import com.benchpr.app.data.model.SplitDay
import com.benchpr.app.data.model.Splits
import com.benchpr.app.data.model.WorkoutSplit
import com.benchpr.app.ui.components.AnimatedEntrance
import com.benchpr.app.ui.components.bouncyClickable
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

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SplitsScreen(onOpenSplit: (String) -> Unit) {
    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.ViewWeek,
                            contentDescription = null,
                            tint = PrimaryNeon,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "TRAINING SPLITS",
                            fontWeight = FontWeight.Black,
                            fontSize = 18.sp,
                            letterSpacing = 1.sp,
                            color = TextPrimary
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BackgroundDark)
            )
        },
        containerColor = BackgroundDark
    ) { paddingValues ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Text(
                    text = "Pick a split, open a day and start logging. Weights are filled in from your last session.",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
            }
            itemsIndexed(Splits.ALL_SPLITS, key = { _, split -> split.id }) { index, split ->
                AnimatedEntrance(index = index) {
                    SplitCard(split = split, onClick = { onOpenSplit(split.id) })
                }
            }
            item { Spacer(modifier = Modifier.height(24.dp)) }
        }
    }
}

@Composable
private fun SplitCard(split: WorkoutSplit, onClick: () -> Unit) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorderDark, RoundedCornerShape(16.dp))
            .bouncyClickable(onClick),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text(text = split.name, fontWeight = FontWeight.Black, fontSize = 17.sp, color = TextPrimary)
            Spacer(modifier = Modifier.height(2.dp))
            Text(text = split.tagline, fontSize = 13.sp, color = TextSecondary)
            Spacer(modifier = Modifier.height(10.dp))
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                InfoChip("${split.daysPerWeek} days/week", PrimaryNeon)
                InfoChip(split.level, SecondaryNeon)
                InfoChip(split.goal, AccentGreen)
            }
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = split.days.joinToString("  -  ") { it.name },
                fontSize = 12.sp,
                color = TextMuted
            )
        }
    }
}

@Composable
private fun InfoChip(text: String, color: androidx.compose.ui.graphics.Color) {
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(6.dp))
            .background(color.copy(alpha = 0.14f))
            .padding(horizontal = 8.dp, vertical = 3.dp)
    ) {
        Text(text = text, fontSize = 11.sp, fontWeight = FontWeight.Bold, color = color)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SplitDetailScreen(
    splitId: String,
    onBack: () -> Unit,
    onStartDay: (splitId: String, dayIndex: Int) -> Unit
) {
    val split = Splits.findSplit(splitId)
    var expandedIndex by remember { mutableIntStateOf(0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = split?.name ?: "Split",
                            fontWeight = FontWeight.Bold,
                            fontSize = 17.sp,
                            color = TextPrimary
                        )
                        if (split != null) {
                            Text(text = split.tagline, fontSize = 12.sp, color = PrimaryNeon)
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = BackgroundDark)
            )
        },
        containerColor = BackgroundDark
    ) { paddingValues ->
        if (split == null) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = Alignment.Center
            ) {
                Text("This split could not be found.", color = TextSecondary)
            }
            return@Scaffold
        }

        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    InfoChip("${split.daysPerWeek} days/week", PrimaryNeon)
                    InfoChip(split.level, SecondaryNeon)
                    InfoChip(split.goal, AccentGreen)
                }
            }
            itemsIndexed(split.days) { index, day ->
                AnimatedEntrance(index = index) {
                    DayCard(
                        dayNumber = index + 1,
                        day = day,
                        expanded = expandedIndex == index,
                        onToggle = { expandedIndex = if (expandedIndex == index) -1 else index },
                        onStart = { onStartDay(split.id, index) }
                    )
                }
            }
            item { Spacer(modifier = Modifier.height(24.dp)) }
        }
    }
}

@Composable
private fun DayCard(
    dayNumber: Int,
    day: SplitDay,
    expanded: Boolean,
    onToggle: () -> Unit,
    onStart: () -> Unit
) {
    val arrow by animateFloatAsState(
        targetValue = if (expanded) 180f else 0f,
        animationSpec = tween(250),
        label = "dayArrow"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(
                width = 1.dp,
                color = if (expanded) PrimaryNeon else CardBorderDark,
                shape = RoundedCornerShape(16.dp)
            )
            .animateContentSize(),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .bouncyClickable(onToggle),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(36.dp)
                        .clip(CircleShape)
                        .background(if (expanded) PrimaryNeon else SurfaceVariantDark),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "$dayNumber",
                        fontWeight = FontWeight.Black,
                        color = if (expanded) BackgroundDark else TextSecondary
                    )
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = day.name, fontWeight = FontWeight.Bold, fontSize = 16.sp, color = TextPrimary)
                    Text(
                        text = "${day.focus} - ${day.exercises.size} exercises",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
                Icon(
                    imageVector = Icons.Default.ExpandMore,
                    contentDescription = if (expanded) "Collapse" else "Expand",
                    tint = TextSecondary,
                    modifier = Modifier.rotate(arrow)
                )
            }

            AnimatedVisibility(
                visible = expanded,
                enter = expandVertically(tween(250)) + fadeIn(tween(250)),
                exit = shrinkVertically(tween(200)) + fadeOut(tween(150))
            ) {
                Column {
                    Spacer(modifier = Modifier.height(12.dp))
                    day.exercises.forEach { entry ->
                        val item = ExerciseLibrary.getById(entry.exerciseId)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 5.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = item?.name ?: entry.exerciseId,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = TextPrimary
                                )
                                if (item != null) {
                                    Text(text = item.muscleGroup.displayName, fontSize = 11.sp, color = SecondaryNeon)
                                }
                            }
                            Text(
                                text = "${entry.sets} x ${entry.repRange}",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Bold,
                                color = TextSecondary
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                    Button(
                        onClick = onStart,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = PrimaryNeon,
                            contentColor = BackgroundDark
                        ),
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Icon(Icons.Default.PlayArrow, contentDescription = null, modifier = Modifier.size(22.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("START ${day.name.uppercase()}", fontWeight = FontWeight.Black, letterSpacing = 0.5.sp)
                    }
                }
            }
        }
    }
}
