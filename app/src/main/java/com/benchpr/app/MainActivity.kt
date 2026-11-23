package com.benchpr.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.benchpr.app.ui.screens.HistoryScreen
import com.benchpr.app.ui.screens.HomeScreen
import com.benchpr.app.ui.screens.SessionScreen
import com.benchpr.app.ui.theme.BackgroundDark
import com.benchpr.app.ui.theme.BenchPRTheme
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

    NavHost(
        navController = navController,
        startDestination = "home"
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
