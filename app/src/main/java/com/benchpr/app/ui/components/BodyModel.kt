package com.benchpr.app.ui.components

import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import com.benchpr.app.ui.i18n.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.asAndroidPath
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.withTransform
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.benchpr.app.data.model.MuscleGroup
import com.benchpr.app.data.model.MuscleRankInfo
import com.benchpr.app.data.model.RankTier
import com.benchpr.app.ui.theme.BackgroundDark
import com.benchpr.app.ui.theme.PrimaryNeon
import com.benchpr.app.ui.theme.SurfaceVariantDark
import com.benchpr.app.ui.theme.TextSecondary
import kotlinx.coroutines.launch
import kotlin.math.min

private val SilhouetteFill = Color(0xFF1B2027)
private val SilhouetteStroke = Color(0xFF39414C)
private val DetailStroke = Color(0x8C0C0E12)

/** Hit areas are rasterised at this multiple of the 200 x 420 model space for accuracy. */
private const val HIT_SCALE = 2f

private class HitTarget(val muscle: MuscleGroup, val region: android.graphics.Region)

private fun buildHitTargets(parts: List<BodyPaths.Part>): List<HitTarget> {
    val clip = android.graphics.Region(0, 0, (BodyPaths.WIDTH * HIT_SCALE).toInt(), (BodyPaths.HEIGHT * HIT_SCALE).toInt())
    val normal = android.graphics.Matrix().apply { setScale(HIT_SCALE, HIT_SCALE) }
    val mirrored = android.graphics.Matrix().apply {
        setScale(-HIT_SCALE, HIT_SCALE)
        postTranslate(2f * BodyPaths.MIRROR_X * HIT_SCALE, 0f)
    }
    return parts.flatMap { part ->
        val source = part.path.asAndroidPath()
        listOf(normal, mirrored).map { matrix ->
            val transformed = android.graphics.Path()
            source.transform(matrix, transformed)
            val region = android.graphics.Region()
            region.setPath(transformed, clip)
            HitTarget(part.muscle, region)
        }
    }
}

/**
 * Full body figure whose muscles are coloured by rank. Tap a muscle to select it, flip between the
 * front and back view with the toggle. Colours animate in when the figure appears and whenever a
 * rank changes, and the selected muscle pulses.
 */
@Composable
fun BodyModel(
    ranks: Map<MuscleGroup, MuscleRankInfo>,
    selected: MuscleGroup?,
    onSelect: (MuscleGroup?) -> Unit,
    modifier: Modifier = Modifier
) {
    var showBack by remember { mutableStateOf(false) }
    var revealed by remember { mutableStateOf(false) }
    val flip = remember { Animatable(1f) }
    val scope = rememberCoroutineScope()
    val pulse = rememberPulse(low = 0.3f, durationMillis = 800)

    val frontTargets = remember { buildHitTargets(BodyPaths.front) }
    val backTargets = remember { buildHitTargets(BodyPaths.back) }

    LaunchedEffect(Unit) { revealed = true }

    // One animated colour per muscle; the list of muscles is fixed so the call order never changes.
    val colors: Map<MuscleGroup, Color> = MuscleGroup.entries.associateWith { muscle ->
        val tier = if (revealed) ranks[muscle]?.tier ?: RankTier.UNRANKED else RankTier.UNRANKED
        animateColorAsState(
            targetValue = tier.color,
            animationSpec = tween(durationMillis = 750, delayMillis = muscle.ordinal * 55),
            label = "muscle-${muscle.name}"
        ).value
    }

    fun flipTo(back: Boolean) {
        if (back == showBack) return
        scope.launch {
            flip.animateTo(0f, tween(150))
            showBack = back
            flip.animateTo(1f, spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium))
        }
    }

    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 4.dp)
        ) {
            Canvas(
                modifier = Modifier
                    .fillMaxWidth()
                    .aspectRatio(BodyPaths.WIDTH / BodyPaths.HEIGHT)
                    .graphicsLayer { scaleX = flip.value }
                    .pointerInput(showBack, selected) {
                        detectTapGestures { tap ->
                            val fit = min(size.width / BodyPaths.WIDTH, size.height / BodyPaths.HEIGHT)
                            val offsetX = (size.width - BodyPaths.WIDTH * fit) / 2f
                            val offsetY = (size.height - BodyPaths.HEIGHT * fit) / 2f
                            val modelX = ((tap.x - offsetX) / fit * HIT_SCALE).toInt()
                            val modelY = ((tap.y - offsetY) / fit * HIT_SCALE).toInt()
                            val targets = if (showBack) backTargets else frontTargets
                            val hit = targets.firstOrNull { it.region.contains(modelX, modelY) }?.muscle
                            onSelect(if (hit == selected) null else hit)
                        }
                    }
            ) {
                val fit = min(size.width / BodyPaths.WIDTH, size.height / BodyPaths.HEIGHT)
                val offsetX = (size.width - BodyPaths.WIDTH * fit) / 2f
                val offsetY = (size.height - BodyPaths.HEIGHT * fit) / 2f
                val parts = if (showBack) BodyPaths.back else BodyPaths.front
                val details = if (showBack) BodyPaths.backDetails else BodyPaths.frontDetails

                withTransform({
                    translate(offsetX, offsetY)
                    scale(fit, fit, Offset.Zero)
                }) {
                    // head
                    drawOval(SilhouetteFill, topLeft = Offset(84f, 11f), size = Size(32f, 38f))
                    drawOval(SilhouetteStroke, topLeft = Offset(84f, 11f), size = Size(32f, 38f), style = Stroke(1f))

                    for (mirror in listOf(false, true)) {
                        withTransform({
                            if (mirror) scale(-1f, 1f, Offset(BodyPaths.MIRROR_X, 0f))
                        }) {
                            drawPath(BodyPaths.silhouette, SilhouetteFill)
                            drawPath(BodyPaths.silhouette, SilhouetteStroke, style = Stroke(1f))

                            for (part in parts) {
                                val fill = colors[part.muscle] ?: RankTier.UNRANKED.color
                                drawPath(part.path, fill)
                                if (part.muscle == selected) {
                                    drawPath(part.path, Color.White.copy(alpha = 0.22f * pulse))
                                }
                                drawPath(
                                    part.path,
                                    color = if (part.muscle == selected) Color.White.copy(alpha = 0.5f + 0.5f * pulse) else BackgroundDark,
                                    style = Stroke(width = if (part.muscle == selected) 2f else 1.2f)
                                )
                            }
                            for (detail in details) {
                                drawPath(detail, DetailStroke, style = Stroke(width = 1f, cap = StrokeCap.Round))
                            }
                        }
                    }
                }
            }
        }

        Row(
            modifier = Modifier
                .clip(RoundedCornerShape(50))
                .background(SurfaceVariantDark)
                .padding(4.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            ViewToggle(label = "FRONT", active = !showBack, onClick = { flipTo(false) })
            ViewToggle(label = "BACK", active = showBack, onClick = { flipTo(true) })
        }
    }
}

@Composable
private fun ViewToggle(label: String, active: Boolean, onClick: () -> Unit) {
    val background by animateColorAsState(
        targetValue = if (active) PrimaryNeon else Color.Transparent,
        animationSpec = tween(250),
        label = "toggleBg"
    )
    val textColor by animateColorAsState(
        targetValue = if (active) BackgroundDark else TextSecondary,
        animationSpec = tween(250),
        label = "toggleText"
    )
    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(background)
            .bouncyClickable(onClick)
            .padding(horizontal = 18.dp, vertical = 7.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(text = label, fontSize = 12.sp, fontWeight = FontWeight.Bold, letterSpacing = 1.sp, color = textColor)
    }
}
