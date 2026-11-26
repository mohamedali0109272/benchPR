package com.benchpr.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
import com.benchpr.app.ui.i18n.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.benchpr.app.data.model.ExerciseItem
import com.benchpr.app.data.model.ExerciseLibrary
import com.benchpr.app.data.model.MuscleGroup
import com.benchpr.app.ui.theme.BackgroundDark
import com.benchpr.app.ui.theme.CardBorderDark
import com.benchpr.app.ui.theme.PrimaryNeon
import com.benchpr.app.ui.theme.SecondaryNeon
import com.benchpr.app.ui.theme.SurfaceDark
import com.benchpr.app.ui.theme.SurfaceVariantDark
import com.benchpr.app.ui.theme.TextMuted
import com.benchpr.app.ui.theme.TextPrimary
import com.benchpr.app.ui.theme.TextSecondary

/** Full-screen searchable list of every exercise. Calls [onPick] and closes when one is tapped. */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExercisePickerDialog(
    title: String = "Pick an exercise",
    onPick: (ExerciseItem) -> Unit,
    onDismiss: () -> Unit
) {
    var query by remember { mutableStateOf("") }
    var muscle by remember { mutableStateOf<MuscleGroup?>(null) }
    val results = remember(query, muscle) { ExerciseLibrary.search(query, muscle) }

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth(0.94f)
                .fillMaxHeight(0.88f),
            shape = RoundedCornerShape(20.dp),
            color = BackgroundDark,
            border = androidx.compose.foundation.BorderStroke(1.dp, CardBorderDark)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = title.uppercase(),
                        fontWeight = FontWeight.Black,
                        fontSize = 16.sp,
                        letterSpacing = 1.sp,
                        color = TextPrimary
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    modifier = Modifier.fillMaxWidth(),
                    placeholder = { Text("Search exercises...", color = TextMuted) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = TextSecondary) },
                    singleLine = true,
                    shape = RoundedCornerShape(12.dp),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = PrimaryNeon,
                        unfocusedBorderColor = CardBorderDark,
                        focusedContainerColor = SurfaceDark,
                        unfocusedContainerColor = SurfaceDark
                    )
                )

                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .horizontalScroll(rememberScrollState()),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    FilterChip(
                        selected = muscle == null,
                        onClick = { muscle = null },
                        label = { Text("All") },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PrimaryNeon,
                            selectedLabelColor = BackgroundDark
                        )
                    )
                    MuscleGroup.entries.forEach { group ->
                        FilterChip(
                            selected = muscle == group,
                            onClick = { muscle = group },
                            label = { Text(group.displayName) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = PrimaryNeon,
                                selectedLabelColor = BackgroundDark
                            )
                        )
                    }
                }

                if (results.isEmpty()) {
                    Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                        Text("No exercises match your search.", color = TextSecondary)
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier.fillMaxWidth(),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(results, key = { it.id }) { item ->
                            PickerRow(item = item, onClick = { onPick(item); onDismiss() })
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PickerRow(item: ExerciseItem, onClick: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(SurfaceDark)
            .border(1.dp, CardBorderDark, RoundedCornerShape(12.dp))
            .bouncyClickable(onClick)
            .padding(horizontal = 14.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(item.name, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextPrimary)
            Spacer(modifier = Modifier.height(2.dp))
            Text(
                text = "${item.defaultSets} sets" + if (item.isTimed) " - timed" else " x ${item.defaultReps} reps",
                fontSize = 12.sp,
                color = TextSecondary
            )
        }
        Spacer(modifier = Modifier.width(8.dp))
        Box(
            modifier = Modifier
                .clip(RoundedCornerShape(6.dp))
                .background(SurfaceVariantDark)
                .padding(horizontal = 8.dp, vertical = 3.dp)
        ) {
            Text(
                text = item.muscleGroup.displayName,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
                color = SecondaryNeon
            )
        }
    }
}
