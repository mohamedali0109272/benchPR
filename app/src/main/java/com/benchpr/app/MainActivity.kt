package com.benchpr.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.FitnessCenter
import androidx.compose.material.icons.filled.History
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.MilitaryTech
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
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.benchpr.app.ui.screens.ExercisesScreen
import com.benchpr.app.ui.screens.HistoryScreen
import com.benchpr.app.ui.screens.HomeScreen
import com.benchpr.app.ui.screens.MusclesScreen
import com.benchpr.app.ui.screens.SessionScreen
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

@Composable
fun BenchPRApp(
    workoutViewModel: WorkoutViewModel = viewModel()
) {
    val navController = rememberNavController()
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    val showBottomBar = currentRoute != "session"

    Scaffold(
        bottomBar = {
            if (showBottomBar) {
                NavigationBar(
                    containerColor = SurfaceDark,
                    contentColor = TextPrimary
                ) {
                    NavigationBarItem(
                        selected = currentRoute == "home",
                        onClick = {
                            navController.navigate("home") {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Default.FitnessCenter, contentDescription = "Workouts") },
                        label = { Text("Workouts") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryNeon,
                            selectedTextColor = PrimaryNeon,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted,
                            indicatorColor = SurfaceDark
                        )
                    )

                    NavigationBarItem(
                        selected = currentRoute == "muscles",
                        onClick = {
                            navController.navigate("muscles") {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Default.MilitaryTech, contentDescription = "Muscles") },
                        label = { Text("Muscles") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryNeon,
                            selectedTextColor = PrimaryNeon,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted,
                            indicatorColor = SurfaceDark
                        )
                    )

                    NavigationBarItem(
                        selected = currentRoute == "exercises",
                        onClick = {
                            navController.navigate("exercises") {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Default.List, contentDescription = "Exercises") },
                        label = { Text("Exercises") },
                        colors = NavigationBarItemDefaults.colors(
                            selectedIconColor = PrimaryNeon,
                            selectedTextColor = PrimaryNeon,
                            unselectedIconColor = TextMuted,
                            unselectedTextColor = TextMuted,
                            indicatorColor = SurfaceDark
                        )
                    )

                    NavigationBarItem(
                        selected = currentRoute == "history",
                        onClick = {
                            navController.navigate("history") {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        },
                        icon = { Icon(Icons.Default.History, contentDescription = "History") },
                        label = { Text("History") },
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
        },
        containerColor = BackgroundDark
    ) { paddingValues ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(paddingValues)
        ) {
            composable("home") {
                HomeScreen(
                    viewModel = workoutViewModel,
                    onStartSession = { sessionId ->
                        workoutViewModel.startSession(sessionId)
                        navController.navigate("session")
                    },
                    onNavigateToHistory = {
                        navController.navigate("history")
                    }
                )
            }

            composable("muscles") {
                MusclesScreen(viewModel = workoutViewModel)
            }

            composable("exercises") {
                ExercisesScreen()
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
