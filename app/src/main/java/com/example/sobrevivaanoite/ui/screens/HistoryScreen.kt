package com.example.sobrevivaanoite.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.sobrevivaanoite.data.MatchHistory
import com.example.sobrevivaanoite.game.HistoryViewModel
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HistoryScreen(navController: NavController) {
    val viewModel: HistoryViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Histórico de Partidas") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Voltar")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFF0A0A33))
                .padding(16.dp)
        ) {
            // Seção de Estatísticas no topo
            StatsSummary(uiState = uiState)

            Spacer(modifier = Modifier.height(24.dp))

            // Lista de Partidas
            if (uiState.allMatches.isEmpty()) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    Text("Nenhuma partida jogada ainda.", color = Color.Gray)
                }
            } else {
                LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(uiState.allMatches) { match ->
                        MatchHistoryItem(match = match)
                    }
                }
            }
        }
    }
}

@Composable
fun StatsSummary(uiState: com.example.sobrevivaanoite.game.HistoryUiState) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Text("Estatísticas Gerais", style = MaterialTheme.typography.titleLarge, color = Color.White)
        StatsCard(
            gameMode = "Batalha",
            wins = uiState.battleWins,
            losses = uiState.battleLosses
        )
        StatsCard(
            gameMode = "Esconde-Esconde",
            wins = uiState.hideWins,
            losses = uiState.hideLosses
        )
    }
}

@Composable
fun StatsCard(gameMode: String, wins: Int, losses: Int) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.DarkGray.copy(alpha = 0.3f))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(gameMode, fontWeight = FontWeight.Bold, color = Color.White, fontSize = 15.sp)
            Text("Vitórias: $wins | Derrotas: $losses", color = Color.LightGray)
        }
    }
}

@Composable
fun MatchHistoryItem(match: MatchHistory) {
    val resultColor = if (match.wasVictory) Color(0xFF4CAF50) else Color(0xFFF44336)
    val resultText = if (match.wasVictory) "VITÓRIA" else "DERROTA"

    // Formata a data e hora para algo legível
    val sdf = SimpleDateFormat("dd/MM/yyyy 'às' HH:mm", Locale.getDefault())
    val dateString = sdf.format(Date(match.timestamp))

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.DarkGray.copy(alpha = 0.3f))
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(match.gameMode, style = MaterialTheme.typography.titleMedium, color = Color.White)
                Text(resultText, color = resultColor, fontWeight = FontWeight.Bold)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(dateString, fontSize = 12.sp, color = Color.Gray)

            // Mostra detalhes específicos do Modo Batalha
            if (match.gameMode == "Batalha") {
                Spacer(modifier = Modifier.height(4.dp))
                Text("Vida Final: ${match.finalPlayerHp} | Parrys: ${match.parryCount}", color = Color.LightGray)
            }
        }
    }
}