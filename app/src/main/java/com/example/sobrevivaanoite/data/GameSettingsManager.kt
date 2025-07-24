// Arquivo: data/GameSettingsManager.kt
package com.example.sobrevivaanoite.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.intPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

// Cria uma instância de DataStore para o aplicativo
private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "game_settings")

class GameSettingsManager(private val context: Context) {

    // Define uma "chave" para encontrar nosso dado salvo. É como o nome de uma variável.
    companion object {
        val HIGH_COMBO_KEY = intPreferencesKey("high_combo_score")
    }

    // Cria um fluxo (Flow) que fica "ouvindo" por mudanças no recorde de combo.
    // Se não houver nada salvo, ele retorna 0.
    val highComboFlow: Flow<Int> = context.dataStore.data
        .map { preferences ->
            preferences[HIGH_COMBO_KEY] ?: 0
        }

    // Função para salvar um novo recorde de combo.
    suspend fun updateHighCombo(newCombo: Int) {
        context.dataStore.edit { preferences ->
            val currentHighCombo = preferences[HIGH_COMBO_KEY] ?: 0
            // Só salva se o novo combo for realmente maior que o recorde atual
            if (newCombo > currentHighCombo) {
                preferences[HIGH_COMBO_KEY] = newCombo
            }
        }
    }
}