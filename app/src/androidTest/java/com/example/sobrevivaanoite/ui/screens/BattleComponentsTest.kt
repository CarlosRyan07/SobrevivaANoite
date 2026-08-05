package com.example.sobrevivaanoite.ui.screens

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class BattleComponentsTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun botõesDeBatalhaExecutamAsAçõesCorretas() {
        var leftClicks = 0
        var attackClicks = 0
        var rightClicks = 0
        composeRule.setContent {
            ActionButtons(
                onAttack = { attackClicks++ },
                onDodgeLeft = { leftClicks++ },
                onDodgeRight = { rightClicks++ }
            )
        }

        composeRule.onNodeWithText("Esquivar\nEsquerda").performClick()
        composeRule.onNodeWithText("👊🏻").performClick()
        composeRule.onNodeWithText("Esquivar\nDireita").performClick()

        assertEquals(1, leftClicks)
        assertEquals(1, attackClicks)
        assertEquals(1, rightClicks)
    }

    @Test
    fun barraDeVidaMostraNomeEVidaAtual() {
        composeRule.setContent {
            EnhancedHpBar(name = "Sobrevivente", currentHp = 55, maxHp = 100)
        }

        composeRule.onNodeWithText("Sobrevivente").assertIsDisplayed()
        composeRule.onNodeWithText("55 / 100").assertIsDisplayed()
    }

    @Test
    fun telaDeDerrotaPermiteTentarNovamenteEVoltarAoMenu() {
        var retries = 0
        var menuReturns = 0
        composeRule.setContent {
            GameOverOverlay(
                onBackToMenu = { menuReturns++ },
                onRetry = { retries++ }
            )
        }

        composeRule.onNodeWithText("VOCÊ MORREU!").assertIsDisplayed()
        composeRule.onNodeWithText("Tentar Novamente").performClick()
        composeRule.onNodeWithText("Voltar ao Menu").performClick()

        assertEquals(1, retries)
        assertEquals(1, menuReturns)
    }

    @Test
    fun telaDeVitóriaPermiteTentarNovamenteEVoltarAoMenu() {
        var retries = 0
        var menuReturns = 0
        composeRule.setContent {
            VictoryOverlay(
                onBackToMenu = { menuReturns++ },
                onRetry = { retries++ }
            )
        }

        composeRule.onNodeWithText("VOCÊ VENCEU!").assertIsDisplayed()
        composeRule.onNodeWithText("Tentar Novamente").performClick()
        composeRule.onNodeWithText("Voltar ao Menu").performClick()

        assertEquals(1, retries)
        assertEquals(1, menuReturns)
    }
}
