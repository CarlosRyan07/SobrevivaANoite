package com.example.sobrevivaanoite.data

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface MatchHistoryDao {

    // Insere um novo resultado de partida no banco de dados
    @Insert
    suspend fun insertMatch(match: MatchHistory)

    // Busca todos os resultados, ordenados do mais recente para o mais antigo
    @Query("SELECT * FROM match_history ORDER BY timestamp DESC")
    fun getAllMatches(): Flow<List<MatchHistory>>

    // Conta o número de vitórias para um modo de jogo específico
    @Query("SELECT COUNT(*) FROM match_history WHERE gameMode = :gameMode AND wasVictory = 1")
    fun getWinCountForMode(gameMode: String): Flow<Int>

    // Conta o número de derrotas para um modo de jogo específico
    @Query("SELECT COUNT(*) FROM match_history WHERE gameMode = :gameMode AND wasVictory = 0")
    fun getLossCountForMode(gameMode: String): Flow<Int>
}