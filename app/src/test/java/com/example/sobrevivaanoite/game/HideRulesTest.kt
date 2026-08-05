package com.example.sobrevivaanoite.game

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class HideRulesTest {

    @Test
    fun `partida começa com seis sobreviventes escondidos`() {
        val statuses = HideRules.initialPlayersStatus()

        assertEquals((1..6).toSet(), statuses.keys)
        assertTrue(statuses.values.all { it == PlayerStatus.Hiding })
    }

    @Test
    fun `caminho inicial usa somente os quatro primeiros locais sorteados`() {
        val path = HideRules.initialSearchPath(listOf(6, 2, 4, 1, 3, 5))

        assertEquals(listOf(6, 2, 4, 1), path)
    }

    @Test
    fun `alvo substituto ignora escolha do jogador e caminho restante`() {
        val replacement = HideRules.replacementTarget(
            remainingSearchPath = listOf(2, 3),
            playerChoice = 1,
            playersStatus = HideRules.initialPlayersStatus()
        )

        assertEquals(4, replacement)
    }

    @Test
    fun `alvo substituto ignora sobrevivente que já morreu`() {
        val statuses = HideRules.initialPlayersStatus().toMutableMap().apply {
            this[4] = PlayerStatus.Dead
        }

        val replacement = HideRules.replacementTarget(
            remainingSearchPath = listOf(2, 3),
            playerChoice = 1,
            playersStatus = statuses
        )

        assertEquals(5, replacement)
    }

    @Test
    fun `não há substituto quando nenhum local está disponível`() {
        val replacement = HideRules.replacementTarget(
            remainingSearchPath = listOf(2, 3, 4, 5, 6),
            playerChoice = 1,
            playersStatus = HideRules.initialPlayersStatus()
        )

        assertNull(replacement)
    }

    @Test
    fun `seleciona outro sobrevivente sem escolher o próprio jogador`() {
        val statuses = mapOf(
            1 to PlayerStatus.Dead,
            2 to PlayerStatus.Hiding,
            3 to PlayerStatus.Hiding
        )

        assertEquals(3, HideRules.otherSurvivor(statuses, playerChoice = 2))
    }

    @Test
    fun `retorna nulo quando jogador é o único sobrevivente`() {
        val statuses = mapOf(
            1 to PlayerStatus.Dead,
            2 to PlayerStatus.Hiding,
            3 to PlayerStatus.Dead
        )

        assertNull(HideRules.otherSurvivor(statuses, playerChoice = 2))
    }

    @Test
    fun `tempo esgotado gera derrota antes de escolher esconderijo`() {
        val result = HideRules.countdownExpiredResult()

        assertEquals(false, result.didPlayerWin)
        assertNull(result.playerChoice)
        assertNull(result.otherSurvivor)
        assertEquals(
            "Você foi pego antes mesmo de conseguir se esconder.",
            result.customMessage
        )
    }
}
