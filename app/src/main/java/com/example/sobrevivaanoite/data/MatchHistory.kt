package com.example.sobrevivaanoite.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "match_history")
data class MatchHistory(
    @PrimaryKey(autoGenerate = true)
    val id: Int = 0,

    val gameMode: String, // "Batalha" ou "Esconde-Esconde"

    val wasVictory: Boolean,

    val finalPlayerHp: Int, // Vida do jogador no final

    val parryCount: Int, // Número de parrys (0 para o modo Esconde-Esconde)

    val timestamp: Long = System.currentTimeMillis() // Data/hora da partida
)