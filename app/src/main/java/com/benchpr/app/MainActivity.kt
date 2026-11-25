package com.benchpr.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.MilitaryTech
import androidx.compose.material.icons.filled.ViewWeek
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.benchpr.app.ui.screens.ExercisesScreen
import com.benchpr.app.ui.screens.HistoryScreen
import com.benchpr.app.ui.screens.HomeScreen
import com.benchpr.app.ui.screens.MusclesScreen
import com.benchpr.app.ui.screens.SessionScreen
import com.benchpr.app.ui.screens.SplitDetailScreen
import com.benchpr.app.ui.screens.SplitsScreen
import com.benchpr.app.ui.theme.BackgroundDark
import com.benchpr.app.ui.theme.BenchPRTheme
import com.benchpr.app.ui.theme.PrimaryNeon
import com.benchpr.app.ui.theme.SurfaceDark
import com.benchpr.app.ui.theme.TextMuted
import com.benchpr.app.ui.theme.TextPrimary
import com.benchpr.app.ui.viewmodel.WorkoutViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            BenchPRTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = BackgroundDark
                ) {
                    BenchPRApp()
                }
            }
        }
    }
}

private data class BottomNavItem(
    val route: String,
    val label: String,
    val icon: ImageVector
)

private val bottomNavItems = listOf(
    BottomNavItem("home", "Workouts", Icons.Default.FitnessCenter),
    BottomNavItem("splits", "Splits", Icons.Default.ViewWeek),
    BottomNavItem("muscles", "Muscles", Icons.Default.MilitaryTech),
    BottomNavItem("exercises", "Exercises", Icons.Default.List),
    BottomNavItem("history", "History", Icons.Default.History)
)

private const val SPLIT_DETAIL_ROUTE = "split/{splitId}"

@Composable
fun BenchPRApp(
    workoutViewModel: WorkoutViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute != "session"

    fun startSessionScreen() {
        navController.navigate("session")
    }

    Scaffold(
        bottomBar = {
            AnimatedVisibility(
                visible = showBottomBar,
                enter = slideInVertically(tween(250)) { it } + fadeIn(tween(250)),
                exit = slideOutVertically(tween(200)) { it } + fadeOut(tween(150))
            ) {
                NavigationBar(
                    containerColor = SurfaceDark,
                    contentColor = TextPrimary
                ) {
                    bottomNavItems.forEach { item ->
                        // The split detail page belongs to the Splits tab.
                        val selected = currentRoute == item.route ||
                            (item.route == "splits" && currentRoute == SPLIT_DETAIL_ROUTE)
                        NavigationBarItem(
                            selected = selected,
                            onClick = {
                                navController.navigate(item.route) {
                                    popUpTo(navController.graph.findStartDestination().id) {
                                        saveState = true
                                    }
                                    launchSingleTop = true
                                    restoreState = true
                                }
                            },
                            icon = { Icon(item.icon, contentDescription = item.label) },
                            label = { Text(item.label) },
                            colors = NavigationBarItemDefaults.colors(
                                selectedIconColor = PrimaryNeon,
                                selectedTextColor = PrimaryNeon,
                                unselectedIconColor = TextMuted,
                                unselectedTextColor = TextMuted,
                                indicatorColor = SurfaceDark
                            )
                        )
                    }
                }
            }
        },
        containerColor = BackgroundDark
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues),
            enterTransition = { fadeIn(tween(260)) + slideInVertically(tween(260)) { it / 24 } },
            exitTransition = { fadeOut(tween(160)) },
            popEnterTransition = { fadeIn(tween(260)) },
            popExitTransition = { fadeOut(tween(160)) + slideOutVertically(tween(200)) { it / 24 } }
        ) {
            composable("home") {
                HomeScreen(
                    viewModel = workoutViewModel,
                    onStartSession = { sessionId ->
                        workoutViewModel.startSession(sessionId)
                        startSessionScreen()
                    },
                    onNavigateToHistory = {
                        navController.navigate("history")
                    },
                    onQuickStart = { exerciseId ->
                        workoutViewModel.startQuickWorkout(exerciseId)
                        startSessionScreen()
                    },
                    onOpenSplits = {
                        navController.navigate("splits") {
                            popUpTo(navController.graph.findStartDestination().id) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                )
            }

            composable("splits") {
                SplitsScreen(
                    onOpenSplit = { splitId ->
                        navController.navigate("split/$splitId")
                    }
                )
            }

            composable(
                route = SPLIT_DETAIL_ROUTE,
                arguments = listOf(navArgument("splitId") { type = NavType.StringType })
            ) { backStackEntry ->
                val splitId = backStackEntry.arguments?.getString("splitId").orEmpty()
                SplitDetailScreen(
                    splitId = splitId,
                    onBack = { navController.popBackStack() },
                    onStartDay = { id, dayIndex ->
                        workoutViewModel.startSplitDay(id, dayIndex)
                        startSessionScreen()
                    }
                )
            }

            composable("muscles") {
                MusclesScreen(viewModel = workoutViewModel)
            }

            composable("exercises") {
                ExercisesScreen(
                    onStartExercise = { exerciseId ->
                        workoutViewModel.startQuickWorkout(exerciseId)
                        startSessionScreen()
                    }
                )
            }

            composable("session") {
                SessionScreen(
                    viewModel = workoutViewModel,
                    onWorkoutFinished = {
                        navController.navigate("home") {
                            popUpTo("home") { inclusive = true }
                        }
                    },
                    onBackClick = {
                        navController.popBackStack()
                    }
                )
            }

            composable("history") {
                HistoryScreen(
                    viewModel = workoutViewModel,
                    onBackClick = {
                        navController.popBackStack()
                    }
                )
            }
        }
    }
}
