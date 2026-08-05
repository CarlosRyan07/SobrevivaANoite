package com.example.sobrevivaanoite.data

import android.content.Context
import androidx.room.Room
import androidx.test.core.app.ApplicationProvider
import androidx.test.ext.junit.runners.AndroidJUnit4
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.After
import org.junit.Assert.assertEquals
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class MatchHistoryDaoTest {

    private lateinit var database: AppDatabase
    private lateinit var dao: MatchHistoryDao

    @Before
    fun createDatabase() {
        val context = ApplicationProvider.getApplicationContext<Context>()
        database = Room.inMemoryDatabaseBuilder(context, AppDatabase::class.java)
            .allowMainThreadQueries()
            .build()
        dao = database.matchHistoryDao()
    }

    @After
    fun closeDatabase() {
        database.close()
    }

    @Test
    fun partidasSãoListadasDaMaisRecenteParaAMaisAntiga() = runBlocking {
        dao.insertMatch(match(gameMode = "Batalha", timestamp = 100L))
        dao.insertMatch(match(gameMode = "Esconde-Esconde", timestamp = 300L))
        dao.insertMatch(match(gameMode = "Batalha", timestamp = 200L))

        val matches = dao.getAllMatches().first()

        assertEquals(listOf(300L, 200L, 100L), matches.map { it.timestamp })
    }

    @Test
    fun contagensSãoSeparadasPorModoEResultado() = runBlocking {
        dao.insertMatch(match(gameMode = "Batalha", wasVictory = true))
        dao.insertMatch(match(gameMode = "Batalha", wasVictory = true))
        dao.insertMatch(match(gameMode = "Batalha", wasVictory = false))
        dao.insertMatch(match(gameMode = "Esconde-Esconde", wasVictory = true))
        dao.insertMatch(match(gameMode = "Esconde-Esconde", wasVictory = false))
        dao.insertMatch(match(gameMode = "Esconde-Esconde", wasVictory = false))

        assertEquals(2, dao.getWinCountForMode("Batalha").first())
        assertEquals(1, dao.getLossCountForMode("Batalha").first())
        assertEquals(1, dao.getWinCountForMode("Esconde-Esconde").first())
        assertEquals(2, dao.getLossCountForMode("Esconde-Esconde").first())
    }

    private fun match(
        gameMode: String,
        wasVictory: Boolean = true,
        timestamp: Long = System.currentTimeMillis()
    ) = MatchHistory(
        gameMode = gameMode,
        wasVictory = wasVictory,
        finalPlayerHp = if (wasVictory) 100 else 0,
        parryCount = if (gameMode == "Batalha") 2 else 0,
        timestamp = timestamp
    )
}
