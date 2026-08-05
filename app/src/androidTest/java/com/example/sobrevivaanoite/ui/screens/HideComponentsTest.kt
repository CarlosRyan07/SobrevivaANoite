package com.example.sobrevivaanoite.ui.screens

import androidx.compose.ui.test.assertIsDisplayed
import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.compose.ui.unit.dp
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class HideComponentsTest {

    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun contadorMostraInstruçãoETempoRestante() {
        composeRule.setContent { CountdownOverlay(countdown = 7) }

        composeRule.onNodeWithText("Rápido, se esconda!").assertIsDisplayed()
        composeRule.onNodeWithText("7").assertIsDisplayed()
    }

    @Test
    fun esconderijoExecutaSeleçãoAoSerClicado() {
        var selections = 0
        composeRule.setContent {
            HidingSpotButton(
                roomNumber = 3,
                xOffset = 0.dp,
                yOffset = 0.dp,
                enabled = true,
                isSelected = false,
                onClick = { selections++ }
            )
        }

        composeRule.onNodeWithText("3").performClick()

        assertEquals(1, selections)
    }

    @Test
    fun resultadoDeVitóriaMostraOsDoisSobreviventes() {
        composeRule.setContent {
            ResultOverlay(
                didPlayerWin = true,
                playerChoice = 2,
                otherSurvivor = 5,
                customMessage = null,
                onPlayAgain = {}
            )
        }

        composeRule.onNodeWithText("Você sobreviveu!").assertIsDisplayed()
        composeRule.onNodeWithText(
            "Parabéns! Você (Nº 2) e o sobrevivente Nº 5 escaparam."
        ).assertIsDisplayed()
    }

    @Test
    fun resultadoDeDerrotaMostraMensagemEPermiteReiniciar() {
        var retries = 0
        composeRule.setContent {
            ResultOverlay(
                didPlayerWin = false,
                playerChoice = null,
                otherSurvivor = null,
                customMessage = "Tempo esgotado",
                onPlayAgain = { retries++ }
            )
        }

        composeRule.onNodeWithText("VOCÊ MORREU").assertIsDisplayed()
        composeRule.onNodeWithText("Tempo esgotado").assertIsDisplayed()
        composeRule.onNodeWithText("Jogar Novamente").performClick()

        assertEquals(1, retries)
    }
}
