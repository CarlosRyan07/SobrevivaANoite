package com.example.sobrevivaanoite.game

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.sobrevivaanoite.data.AppDatabase
import com.example.sobrevivaanoite.data.MatchHistory
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn

// Data class para agrupar todas as informações que a tela precisa
data class HistoryUiState(
    val allMatches: List<MatchHistory> = emptyList(),
    val battleWins: Int = 0,
    val battleLosses: Int = 0,
    val hideWins: Int = 0,
    val hideLosses: Int = 0
)

class HistoryViewModel(application: Application) : AndroidViewModel(application) {

    private val matchHistoryDao = AppDatabase.getDatabase(application).matchHistoryDao()

    // Usamos 'combine' para juntar os 5 fluxos de dados do DAO em um único estado (HistoryUiState)
    val uiState: StateFlow<HistoryUiState> = combine(
        matchHistoryDao.getAllMatches(),
        matchHistoryDao.getWinCountForMode("Batalha"),
        matchHistoryDao.getLossCountForMode("Batalha"),
        matchHistoryDao.getWinCountForMode("Esconde-Esconde"),
        matchHistoryDao.getLossCountForMode("Esconde-Esconde")
    ) { matches, battleWins, battleLosses, hideWins, hideLosses ->
        HistoryUiState(
            allMatches = matches,
            battleWins = battleWins,
            battleLosses = battleLosses,
            hideWins = hideWins,
            hideLosses = hideLosses
        )
    }.stateIn( // Converte o Flow combinado em um StateFlow que a UI pode coletar
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = HistoryUiState() // Valor inicial enquanto os dados carregam
    )
}