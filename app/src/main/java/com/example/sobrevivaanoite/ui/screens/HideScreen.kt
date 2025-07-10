package com.example.sobrevivaanoite.ui.screens

import androidx.annotation.DrawableRes
import androidx.compose.animation.*
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.example.sobrevivaanoite.R
import com.example.sobrevivaanoite.common.SoundManager
import com.example.sobrevivaanoite.game.GameUiState
import com.example.sobrevivaanoite.game.HideViewModel
import com.example.sobrevivaanoite.game.PlayerStatus
import com.example.sobrevivaanoite.game.SoundEvent

@Composable
fun HideScreen(navController: NavController) {
    val viewModel: HideViewModel = viewModel()
    val gameState by viewModel.uiState.collectAsState()
    val playersStatus by viewModel.playersStatus.collectAsState()
    val psychopathPosition by viewModel.psychopathPosition.collectAsState()
    val backgroundImageRes by viewModel.backgroundImageRes.collectAsState()
    val psychopathImageRes by viewModel.currentPsychopathImageRes.collectAsState()
    val isFacingRight by viewModel.isFacingRight.collectAsState()
    val countdown by viewModel.countdown.collectAsState()

    var playerChoice by remember { mutableStateOf<Int?>(null) }

    LaunchedEffect(Unit) {
        viewModel.soundEventFlow.collect { event ->
            val soundResId = when (event) {
                is SoundEvent.DoorBreak -> R.raw.porta_sendo_quebrada
                is SoundEvent.PlayerWins -> R.raw.win_hide
                is SoundEvent.PlayerLoses -> R.raw.lose_hide
                is SoundEvent.NpcDeath -> SoundManager.deathSounds.randomOrNull()
                is SoundEvent.Footsteps -> R.raw.psicopata_passos
                is SoundEvent.CenterTheme -> R.raw.fnaf2_theme
                is SoundEvent.PlayTenseSound -> R.raw.musica_tensa
            }
            soundResId?.let { SoundManager.playSound(it) }
        }
    }

    val animatedX by animateDpAsState(targetValue = psychopathPosition.x, label = "xOffsetAnimation")
    val animatedY by animateDpAsState(targetValue = psychopathPosition.y, label = "yOffsetAnimation")
    val isChoosing = gameState is GameUiState.Choosing

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A1940)),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(id = backgroundImageRes),
            contentDescription = "Planta da Casa",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .fillMaxSize()
                .offset(y = (-5).dp) // Seu ajuste de posição
        )
        (1..6).forEach { roomNumber ->
            val status = playersStatus[roomNumber]
            val (x, y) = getCoordinatesForRoom(roomNumber)
            if (status == PlayerStatus.Dead) {
                AnimatedVisibility(visible = true, enter = fadeIn()) { BloodSplat(xOffset = x, yOffset = y) }
            } else {
                HidingSpotButton(roomNumber = roomNumber, xOffset = x, yOffset = y, enabled = isChoosing, isSelected = (roomNumber == playerChoice), onClick = {
                    SoundManager.playSound(R.raw.clique_botao)
                    playerChoice = roomNumber
                    viewModel.chooseHidingSpot(roomNumber)
                })
            }
        }
        AnimatedVisibility(visible = gameState is GameUiState.Searching, enter = fadeIn(), exit = fadeOut()) {
            PsychopathIndicator(xOffset = animatedX, yOffset = animatedY, imageRes = psychopathImageRes, isFacingRight = isFacingRight)
        }

        AnimatedVisibility(
            visible = isChoosing,
            enter = fadeIn(animationSpec = tween(500)),
            exit = fadeOut(animationSpec = tween(500))
        ) {
            CountdownOverlay(countdown = countdown)
        }

        when (val state = gameState) {
            is GameUiState.Choosing -> { /* Vazio */ }
            is GameUiState.Searching -> GameStatusText(text = "Ele está procurando...")
            is GameUiState.Result -> {
                ResultOverlay(
                    didPlayerWin = state.didPlayerWin,
                    playerChoice = state.playerChoice,
                    otherSurvivor = state.otherSurvivor,
                    customMessage = state.customMessage,
                    onPlayAgain = {
                        SoundManager.playSound(R.raw.clique_botao)
                        playerChoice = null
                        viewModel.playAgain()
                    }
                )
            }
        }
    }
}

// ALTERADO: O overlay do contador agora é centralizado
@Composable
fun CountdownOverlay(countdown: Int) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center // Alinha o conteúdo no centro
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            modifier = Modifier.offset(y = (-20).dp)
        ) {
            Text(
                text = "Rápido, se esconda!",
                fontSize = 17.sp,
                color = Color.White,
                fontWeight = FontWeight.Bold,
                modifier = Modifier
                    .background(Color.Black.copy(alpha = 0.5f), shape = CircleShape)
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = countdown.toString(),
                fontSize = 45.sp,
                color = if (countdown > 3) Color.White else Color.Red,
                fontWeight = FontWeight.Bold
            )
        }
    }
}


private fun getCoordinatesForRoom(roomNumber: Int): Pair<Dp, Dp> {
    return when (roomNumber) {
        1 -> (-35).dp to 250.dp
        2 -> 130.dp to (-35).dp
        3 -> 130.dp to 190.dp
        4 -> (-170).dp to 150.dp
        5 -> (-140).dp to (-35).dp
        6 -> (-35).dp to (-230).dp
        else -> 0.dp to 0.dp
    }
}

@Composable
fun HidingSpotButton(roomNumber: Int, xOffset: Dp, yOffset: Dp, enabled: Boolean, isSelected: Boolean, onClick: () -> Unit) {
    val containerColor = if (isSelected) Color.Green else MaterialTheme.colorScheme.primary
    val contentColor = if (isSelected) Color.Black else MaterialTheme.colorScheme.onPrimary
    Button(onClick = onClick, enabled = enabled, modifier = Modifier.offset(x = xOffset, y = yOffset).size(35.dp), shape = CircleShape, contentPadding = PaddingValues(0.dp), colors = ButtonDefaults.buttonColors(containerColor = containerColor, contentColor = contentColor, disabledContainerColor = containerColor.copy(alpha = 0.7f), disabledContentColor = contentColor.copy(alpha = 0.7f))) {
        Text(text = roomNumber.toString(), fontSize = 16.sp)
    }
}

@Composable
fun BloodSplat(xOffset: Dp, yOffset: Dp) {
    Image(painter = painterResource(id = R.drawable.sangue), contentDescription = "Mancha de Sangue", modifier = Modifier.offset(x = xOffset, y = yOffset).size(40.dp))
}

@Composable
fun PsychopathIndicator(xOffset: Dp, yOffset: Dp, @DrawableRes imageRes: Int, isFacingRight: Boolean) {
    val scaleX = if (isFacingRight) -1f else 1f
    Image(painter = painterResource(id = imageRes), contentDescription = "Psicopata", modifier = Modifier.offset(x = xOffset, y = yOffset).size(50.dp).scale(scaleX = scaleX, scaleY = 1f))
}

@Composable
fun GameStatusText(text: String) {
    Box(modifier = Modifier.fillMaxSize().padding(bottom = 48.dp), contentAlignment = Alignment.BottomCenter) {
        Text(text = text, fontSize = 24.sp, color = Color.White, fontWeight = FontWeight.Bold, modifier = Modifier.background(Color.Black.copy(alpha = 0.5f), shape = CircleShape).padding(horizontal = 16.dp, vertical = 8.dp))
    }
}

@Composable
fun ResultOverlay(
    didPlayerWin: Boolean,
    playerChoice: Int?,
    otherSurvivor: Int?,
    customMessage: String?,
    onPlayAgain: () -> Unit
) {
    AnimatedVisibility(
        visible = true,
        enter = fadeIn(),
        exit = fadeOut()
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.8f)),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (didPlayerWin) {
                Text("UFA!", fontSize = 24.sp, color = Color.Green)
                Text("Você sobreviveu!", fontSize = 32.sp, color = Color.Green, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                if (playerChoice != null) {
                    Text(
                        text = if (otherSurvivor != null) {
                            "Parabéns! Você (Nº $playerChoice) e o sobrevivente Nº $otherSurvivor escaparam."
                        } else {
                            "Parabéns! Você (Nº $playerChoice) foi o único a escapar."
                        },
                        color = Color.White,
                        fontSize = 18.sp,
                        textAlign = TextAlign.Center,
                        modifier = Modifier.padding(horizontal = 16.dp)
                    )
                }
            } else {
                Text("VOCÊ MORREU", fontSize = 32.sp, color = Color.Red, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = customMessage ?: "Ele te encontrou!",
                    color = Color.White,
                    fontSize = 22.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }
            Spacer(modifier = Modifier.height(32.dp))
            Button(onClick = onPlayAgain) {
                Text("Jogar Novamente")
            }
        }
    }
}

@Preview(showBackground = true)
@Composable
fun GameScreenPreview() {
    val navController = rememberNavController()
    HideScreen(navController = navController)
}