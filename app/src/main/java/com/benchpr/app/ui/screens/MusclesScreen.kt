package com.benchpr.app.ui.screens

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import com.benchpr.app.ui.i18n.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.benchpr.app.data.model.ExerciseLibrary
import com.benchpr.app.data.model.MuscleGroup
import com.benchpr.app.data.model.MuscleRankInfo
import com.benchpr.app.data.model.OverallRank
import com.benchpr.app.data.model.RankTier
import com.benchpr.app.data.model.RankingEngine
import com.benchpr.app.ui.components.AnimatedEntrance
import com.benchpr.app.ui.components.BodyModel
import com.benchpr.app.ui.components.bouncyClickable
import com.benchpr.app.ui.components.color
import com.benchpr.app.ui.components.formatScore
import com.benchpr.app.ui.components.formatWeightKg
import com.benchpr.app.ui.components.rememberPulse
import com.benchpr.app.ui.theme.BackgroundDark
import com.benchpr.app.ui.theme.CardBorderDark
import com.benchpr.app.ui.theme.PrimaryNeon
import com.benchpr.app.ui.theme.SurfaceDark
import com.benchpr.app.ui.theme.SurfaceVariantDark
import com.benchpr.app.ui.theme.TextMuted
import com.benchpr.app.ui.theme.TextPrimary
import com.benchpr.app.ui.theme.TextSecondary
import com.benchpr.app.ui.viewmodel.WorkoutViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MusclesScreen(viewModel: WorkoutViewModel) {
    val muscleRanks by viewModel.muscleRanks.collectAsState()
    val overall by viewModel.overallRank.collectAsState()
    val unit by viewModel.weightUnit.collectAsState()
    val bodyweightKg by viewModel.bodyweightKg.collectAsState()

    var selected by remember { mutableStateOf<MuscleGroup?>(null) }
    var showBodyweightDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            imageVector = Icons.Default.MilitaryTech,
                            contentDescription = null,
                            tint = PrimaryNeon,
                            modifier = Modifier.size(28.dp)
                        )
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "MUSCLE RANKS",
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
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(4.dp))
                AnimatedEntrance(index = 0) {
                    OverallRankCard(
                        overall = overall,
                        bodyweightKg = bodyweightKg,
                        unit = unit,
                        onEditBodyweight = { showBodyweightDialog = true }
                    )
                }
            }

            item {
                AnimatedEntrance(index = 1) {
                    BodyCard(
                        ranks = muscleRanks,
                        selected = selected,
                        unit = unit,
                        onSelect = { selected = it }
                    )
                }
            }

            item {
                AnimatedEntrance(index = 2) { TierLegend() }
            }

            item {
                Text(
                    text = "ALL MUSCLES",
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    letterSpacing = 1.2.sp,
                    color = TextSecondary,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            items(MuscleGroup.entries.toList(), key = { it.name }) { muscle ->
                val info = muscleRanks[muscle]
                if (info != null) {
                    AnimatedEntrance(index = muscle.ordinal / 2) {
                        MuscleRankCard(
                            rankInfo = info,
                            unit = unit,
                            highlighted = muscle == selected,
                            modifier = Modifier.bouncyClickable {
                                selected = if (selected == muscle) null else muscle
                            }
                        )
                    }
                }
            }

            item { Spacer(modifier = Modifier.height(24.dp)) }
        }
    }

    if (showBodyweightDialog) {
        BodyweightDialog(
            currentKg = bodyweightKg,
            unit = unit,
            onDismiss = { showBodyweightDialog = false },
            onSave = { kg ->
                viewModel.updateBodyweightKg(kg)
                showBodyweightDialog = false
            }
        )
    }
}

@Composable
private fun OverallRankCard(
    overall: OverallRank,
    bodyweightKg: Double,
    unit: String,
    onEditBodyweight: () -> Unit
) {
    val tierColor = overall.tier.color
    val glow = rememberPulse(low = 0.2f, durationMillis = 1400)

    var started by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { started = true }
    val progress by animateFloatAsState(
        targetValue = if (started) overall.progress else 0f,
        animationSpec = tween(1000),
        label = "overallProgress"
    )

    Card(
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, CardBorderDark, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor = SurfaceDark),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(76.dp)
                        .clip(CircleShape)
                        .background(tierColor.copy(alpha = 0.10f + 0.16f * glow))
                        .border(3.dp, tierColor, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = Icons.Default.MilitaryTech,
                        contentDescription = null,
                        tint = tierColor,
                        modifier = Modifier.size(40.dp)
                    )
                }
                Spacer(modifier = Modifier.width(16.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "OVERALL RANK",
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 1.sp,
                        color = TextSecondary
                    )
                    AnimatedContent(
                        targetState = overall.tier,
                        transitionSpec = { fadeIn(tween(350)) togetherWith fadeOut(tween(200)) },
                        label = "overallTier"
                    ) { tier ->
                        Text(
                            text = tier.displayName.uppercase(),
                            fontSize = 28.sp,
                            fontWeight = FontWeight.Black,
                            color = tier.color
                        )
                    }
                    val next = overall.tier.next
                    Text(
                        text = if (overall.tier == RankTier.UNRANKED) {
                            "Log a workout to get ranked"
                        } else if (next == null) {
                            "Top tier reached"
                        } else {
                            "Next: ${next.displayName}"
                        },
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                }
            }

            if (overall.tier != RankTier.UNRANKED) {
                Spacer(modifier = Modifier.height(12.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = tierColor,
                    trackColor = SurfaceVariantDark
                )
            }

            Spacer(modifier = Modifier.height(10.dp))
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .clip(RoundedCornerShape(10.dp))
                    .background(SurfaceVariantDark)
                    .bouncyClickable(onEditBodyweight)
                    .padding(horizontal = 12.dp, vertical = 8.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Body weight: ${formatWeightKg(bodyweightKg, unit)} $unit",
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        color = TextPrimary
                    )
                    Text(
                        text = "Ranks compare your lifts to your body weight",
                        fontSize = 11.sp,
                        color = TextMuted
                    )
                }
                Icon(Icons.Default.Edit, contentDescription = "Edit body weight", tint = PrimaryNeon, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun BodyCard(
    ranks: Map<MuscleGroup, MuscleRankInfo>,
    selected: MuscleGroup?,
    unit: String,
    onSelect: (MuscleGroup?) -> Unit
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
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            BodyModel(
                ranks = ranks,
                selected = selected,
                onSelect = onSelect,
                modifier = Modifier.fillMaxWidth(0.62f)
            )
            Spacer(modifier = Modifier.height(12.dp))

            AnimatedContent(
                targetState = selected,
                transitionSpec = { fadeIn(tween(250)) togetherWith fadeOut(tween(150)) },
                label = "selectedMuscle",
                modifier = Modifier.fillMaxWidth()
            ) { muscle ->
                val info = muscle?.let { ranks[it] }
                if (info == null) {
                    Text(
                        text = "Tap a muscle to see its rank",
                        fontSize = 13.sp,
                        color = TextMuted,
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 14.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center
                    )
                } else {
                    MuscleRankCard(rankInfo = info, unit = unit, highlighted = true)
                }
            }
        }
    }
}

@Composable
private fun TierLegend() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .horizontalScroll(rememberScrollState()),
        horizontalArrangement = Arrangement.spacedBy(14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        RankTier.entries.forEach { tier ->
            Row(verticalAlignment = Alignment.CenterVertically) {
                Box(
                    modifier = Modifier
                        .size(12.dp)
                        .clip(CircleShape)
                        .background(tier.color)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(text = tier.displayName, fontSize = 12.sp, color = TextSecondary)
            }
        }
    }
}

@Composable
fun MuscleRankCard(
    rankInfo: MuscleRankInfo,
    unit: String,
    modifier: Modifier = Modifier,
    highlighted: Boolean = false
) {
    val tierColor = rankInfo.tier.color

    var started by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) { started = true }
    val progress by animateFloatAsState(
        targetValue = if (started) rankInfo.progress else 0f,
        animationSpec = tween(900),
        label = "muscleProgress"
    )

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(
                width = if (highlighted) 2.dp else 1.dp,
                color = if (highlighted) tierColor else CardBorderDark,
                shape = RoundedCornerShape(14.dp)
            ),
        colors = CardDefaults.cardColors(containerColor = if (highlighted) SurfaceVariantDark else SurfaceDark),
        shape = RoundedCornerShape(14.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(14.dp)
                            .clip(CircleShape)
                            .background(tierColor)
                    )
                    Spacer(modifier = Modifier.width(10.dp))
                    Text(
                        text = rankInfo.muscleGroup.displayName,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp,
                        color = TextPrimary
                    )
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(tierColor.copy(alpha = 0.18f))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = rankInfo.tier.displayName.uppercase(),
                        fontWeight = FontWeight.Black,
                        fontSize = 12.sp,
                        letterSpacing = 0.5.sp,
                        color = tierColor
                    )
                }
            }

            if (rankInfo.tier == RankTier.UNRANKED) {
                Spacer(modifier = Modifier.height(8.dp))
                val suggestions = ExerciseLibrary.PRESET_EXERCISES
                    .filter { it.muscleGroup == rankInfo.muscleGroup && it.strengthRef > 0.0 }
                    .take(3)
                    .joinToString { it.name }
                Text(
                    text = if (suggestions.isEmpty()) "Not ranked yet." else "Not ranked yet. Log sets of $suggestions to get a rank.",
                    fontSize = 12.sp,
                    color = TextSecondary
                )
            } else {
                Spacer(modifier = Modifier.height(10.dp))
                LinearProgressIndicator(
                    progress = { progress },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(8.dp)
                        .clip(RoundedCornerShape(4.dp)),
                    color = tierColor,
                    trackColor = SurfaceVariantDark
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = "Strength score ${formatScore(rankInfo.score)}",
                        fontSize = 12.sp,
                        color = TextSecondary
                    )
                    val next = rankInfo.nextTier
                    Text(
                        text = if (next == null) "Top tier" else "${(rankInfo.progress * 100).toInt()}% to ${next.displayName}",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Bold,
                        color = tierColor
                    )
                }

                val bestName = rankInfo.bestLiftName
                if (bestName != null) {
                    Spacer(modifier = Modifier.height(8.dp))
                    val load = if (rankInfo.bestLiftWeightKg <= 0.0) "Bodyweight" else "${formatWeightKg(rankInfo.bestLiftWeightKg, unit)} $unit"
                    Text(
                        text = "Best: $bestName - $load x ${rankInfo.bestLiftReps} (est. 1RM ${formatWeightKg(rankInfo.bestEstimated1RmKg, unit)} $unit)",
                        fontSize = 12.sp,
                        color = TextPrimary
                    )
                }
                if (rankInfo.setsLogged > 0) {
                    Text(
                        text = "${rankInfo.setsLogged} sets - ${formatWeightKg(rankInfo.totalVolumeKg, unit)} $unit total volume",
                        fontSize = 12.sp,
                        color = TextMuted
                    )
                }
            }
        }
    }
}

@Composable
private fun BodyweightDialog(
    currentKg: Double,
    unit: String,
    onDismiss: () -> Unit,
    onSave: (Double) -> Unit
) {
    var text by remember { mutableStateOf(formatWeightKg(currentKg, unit)) }

    AlertDialog(
        onDismissRequest = onDismiss,
        containerColor = SurfaceDark,
        title = { Text("Body weight", fontWeight = FontWeight.Bold, color = TextPrimary) },
        text = {
            Column {
                Text(
                    text = "Your muscle ranks are based on how much you lift compared to your body weight.",
                    fontSize = 13.sp,
                    color = TextSecondary
                )
                Spacer(modifier = Modifier.height(12.dp))
                OutlinedTextField(
                    value = text,
                    onValueChange = { text = it },
                    label = { Text("Body weight ($unit)") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryNeon,
                        unfocusedBorderColor = CardBorderDark
                    )
                )
            }
        },
        confirmButton = {
            TextButton(onClick = {
                val parsed = text.replace(',', '.').toDoubleOrNull()
                if (parsed != null && parsed > 0.0) onSave(RankingEngine.toKg(parsed, unit)) else onDismiss()
            }) {
                Text("Save", color = PrimaryNeon, fontWeight = FontWeight.Bold)
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) { Text("Cancel", color = TextSecondary) }
        }
    )
}
