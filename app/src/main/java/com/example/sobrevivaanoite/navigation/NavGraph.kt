// Este arquivo fica em: navigation/NavGraph.kt
package com.example.sobrevivaanoite.navigation // Verifique se este é o nome exato do seu pacote

import androidx.compose.runtime.Composable
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.sobrevivaanoite.ui.screens.BattleScreen
import com.example.sobrevivaanoite.ui.screens.HideScreen
import com.example.sobrevivaanoite.ui.screens.HistoryScreen
import com.example.sobrevivaanoite.ui.screens.MenuScreen

@Composable
fun NavGraph() {
    val navController = rememberNavController()

    NavHost(
        navController = navController,
        startDestination = "menu" // Dizemos qual é a tela inicial
    ) {
        // Rota para a tela de menu
        composable(route = "menu") {
            MenuScreen(navController = navController)
        }

        // Rota para a tela do jogo
        composable(route = "hide") {
            HideScreen(navController = navController)
        }

        composable(route = "battle") {
            BattleScreen(navController = navController)
        }
        composable(route = "history") {
            HistoryScreen(navController = navController)
        }
    }
}