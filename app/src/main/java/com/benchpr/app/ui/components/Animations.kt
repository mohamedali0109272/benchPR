package com.benchpr.app.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.slideInVertically
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.interaction.collectIsPressedAsState
import androidx.compose.foundation.LocalIndication
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import com.benchpr.app.data.model.RankTier
import com.benchpr.app.data.model.RankingEngine
import kotlinx.coroutines.delay
import java.util.Locale
import kotlin.math.roundToInt

/** Colour of a rank tier, used for the body model, badges and progress bars. */
val RankTier.color: Color get() = Color(argb)

/** Clickable that squashes slightly while pressed and springs back with a small bounce. */
fun Modifier.bouncyClickable(onClick: () -> Unit): Modifier = composed {
    val interactionSource = remember { MutableInteractionSource() }
    val pressed by interactionSource.collectIsPressedAsState()
    val scale by animateFloatAsState(
        targetValue = if (pressed) 0.96f else 1f,
        animationSpec = spring(dampingRatio = Spring.DampingRatioMediumBouncy, stiffness = Spring.StiffnessMedium),
        label = "pressScale"
    )
    this
        .graphicsLayer {
            scaleX = scale
            scaleY = scale
        }
        .clickable(
            interactionSource = interactionSource,
            indication = LocalIndication.current,
            onClick = onClick
        )
}

/** Fades and slides its content in, delayed by [index] so a list appears one item after another. */
@Composable
fun AnimatedEntrance(
    index: Int,
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    var visible by remember { mutableStateOf(false) }
    LaunchedEffect(Unit) {
        delay((index * 60L).coerceAtMost(480L))
        visible = true
    }
    AnimatedVisibility(
        visible = visible,
        modifier = modifier,
        enter = fadeIn(tween(380)) + slideInVertically(tween(380, easing = FastOutSlowInEasing)) { it / 5 }
    ) {
        content()
    }
}

/** A value that gently breathes between [low] and 1, for glows and "alive" icons. */
@Composable
fun rememberPulse(low: Float = 0.45f, durationMillis: Int = 900): Float {
    val transition = rememberInfiniteTransition(label = "pulse")
    val value by transition.animateFloat(
        initialValue = low,
        targetValue = 1f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulseValue"
    )
    return value
}

/** Weight stored in kilograms, shown in [unit] and rounded to the nearest half. */
fun formatWeightKg(kg: Double, unit: String): String {
    val value = (RankingEngine.fromKg(kg, unit) * 2.0).roundToInt() / 2.0
    return if (value == value.toInt().toDouble()) value.toInt().toString() else value.toString()
}

fun formatScore(score: Double): String = String.format(Locale.US, "%.2f", score.coerceAtLeast(0.0))
