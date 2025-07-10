package com.example.sobrevivaanoite.ui.screens

import androidx.annotation.DrawableRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.rememberNavController
import com.example.sobrevivaanoite.R
import com.example.sobrevivaanoite.game.BattleViewModel

@Composable
fun BattleScreen(navController: NavController) {
    val viewModel: BattleViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()

    val enemyMaxHp = 700

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A0A33))
    ) {
        Image(
            painter = painterResource(id = R.drawable.background_cabana),
            contentDescription = "Fundo da Cabana",
            contentScale = ContentScale.Fit,
            modifier = Modifier
                .fillMaxSize()
                .offset(y = (-60).dp)
        )

        TopUi(
            currentHp = uiState.enemyHp,
            maxHp = enemyMaxHp,
            comboCount = uiState.playerComboStep
        )

        CenterStage(
            enemyImage = uiState.enemyImage,
            playerImage = uiState.playerImage
        )

        BottomUi(
            currentHp = uiState.playerHp,
            maxHp = 100,
            onAttack = { viewModel.onAttackClicked() },
            onDodgeLeft = { viewModel.onDodgeLeftClicked() },
            onDodgeRight = { viewModel.onDodgeRightClicked() }
        )

        // ALTERADO: Adicionado onRetry para as telas de resultado
        if (uiState.gameResult == "lose") {
            GameOverOverlay(
                onBackToMenu = { navController.popBackStack() },
                onRetry = { viewModel.retryGame() }
            )
        } else if (uiState.gameResult == "win") {
            VictoryOverlay(
                onBackToMenu = { navController.popBackStack() },
                onRetry = { viewModel.retryGame() }
            )
        }
    }
}

@Composable
fun TopUi(currentHp: Int, maxHp: Int, comboCount: Int) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 180.dp),
    ) {
        EnhancedHpBar(
            name = "Psicopata",
            currentHp = currentHp,
            maxHp = maxHp,
            modifier = Modifier.align(Alignment.TopCenter)
        )
        ComboCounter(
            comboCount = comboCount,
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(end = 24.dp, top = 200.dp)
        )
    }
}


@Composable
fun CenterStage(@DrawableRes enemyImage: Int, @DrawableRes playerImage: Int) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = painterResource(id = enemyImage),
            contentDescription = "Psicopata",
            modifier = Modifier
                .offset(y = (-20).dp)
                .height(270.dp)
                .fillMaxWidth(0.7f),
            contentScale = ContentScale.Fit
        )
        Image(
            painter = painterResource(id = playerImage),
            contentDescription = "Sobrevivente",
            modifier = Modifier
                .align(Alignment.Center)
                .offset(y = 60.dp)
                .height(200.dp)
                .fillMaxWidth(0.6f),
            contentScale = ContentScale.Fit
        )
    }
}

@Composable
fun ComboCounter(comboCount: Int, modifier: Modifier = Modifier) {
    val targetColor = when {
        comboCount >= 50 -> Color(0xFFD32F2F)
        comboCount >= 30 -> Color(0xFFF57C00)
        comboCount >= 15 -> Color(0xFFFFEB3B)
        else -> Color.White
    }

    val animatedComboColor by animateColorAsState(
        targetValue = targetColor,
        animationSpec = tween(durationMillis = 500),
        label = "comboColorAnimation"
    )

    AnimatedVisibility(
        visible = comboCount > 1,
        enter = fadeIn(),
        exit = fadeOut(),
        modifier = modifier
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(
                text = "${comboCount}x",
                fontSize = 36.sp,
                color = animatedComboColor,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Combo",
                fontSize = 16.sp,
                color = animatedComboColor
            )
        }
    }
}

@Composable
fun BottomUi(
    currentHp: Int,
    maxHp: Int,
    onAttack: () -> Unit,
    onDodgeLeft: () -> Unit,
    onDodgeRight: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 100.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Bottom
    ) {
        EnhancedHpBar(
            name = "Sobrevivente",
            currentHp = currentHp,
            maxHp = maxHp
        )
        Spacer(modifier = Modifier.height(24.dp))
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(onClick = onDodgeLeft) { Text(text = "Esquivar\nEsquerda", textAlign = TextAlign.Center) }
            Button(onClick = onAttack, modifier = Modifier.size(80.dp, 70.dp)) {
                Text(
                    text = "👊🏻",
                    fontSize = 25.sp
                )
            }
            Button(onClick = onDodgeRight) { Text(text = "Esquivar\nDireita", textAlign = TextAlign.Center) }
        }
    }
}


@Composable
fun EnhancedHpBar(name: String, currentHp: Int, maxHp: Int, modifier: Modifier = Modifier) {
    val hpPercentage = currentHp.toFloat() / maxHp.toFloat()

    val animatedProgress by animateFloatAsState(
        targetValue = hpPercentage,
        animationSpec = tween(durationMillis = 500, easing = LinearOutSlowInEasing),
        label = "hpAnimation"
    )

    val barColor: Color
    val gradientBrush: Brush

    when {
        hpPercentage > 0.8f -> {
            barColor = Color(0xFF2E7D32)
            gradientBrush = Brush.horizontalGradient(listOf(Color(0xFF66BB6A), barColor))
        }
        hpPercentage > 0.6f -> {
            barColor = Color(0xFFAFB42B)
            gradientBrush = Brush.horizontalGradient(listOf(Color(0xFFDCE775), barColor))
        }
        hpPercentage > 0.4f -> {
            barColor = Color(0xFFFBC02D)
            gradientBrush = Brush.horizontalGradient(listOf(Color(0xFFFFF176), barColor))
        }
        hpPercentage > 0.2f -> {
            barColor = Color(0xFFF57F17)
            gradientBrush = Brush.horizontalGradient(listOf(Color(0xFFFFA726), barColor))
        }
        else -> {
            barColor = Color(0xFFC62828)
            gradientBrush = Brush.horizontalGradient(listOf(Color(0xFFE57373), barColor))
        }
    }

    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = name,
            color = Color.White,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))

        Box(
            modifier = Modifier
                .fillMaxWidth(0.9f)
                .height(28.dp)
                .clip(RoundedCornerShape(12.dp))
                .background(Color.Black.copy(alpha = 0.5f))
                .border(1.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(12.dp)),
            contentAlignment = Alignment.CenterStart
        ) {
            Box(
                modifier = Modifier
                    .fillMaxHeight()
                    .fillMaxWidth(animatedProgress)
                    .clip(RoundedCornerShape(12.dp))
                    .background(gradientBrush)
            )

            Text(
                text = "$currentHp / $maxHp",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Bold,
                modifier = Modifier.padding(start = 10.dp)
            )
        }
    }
}


// ALTERADO: Adicionado parâmetro 'onRetry' e o novo botão
@Composable
fun GameOverOverlay(onBackToMenu: () -> Unit, onRetry: () -> Unit) {
    AnimatedVisibility(visible = true, enter = fadeIn(), exit = fadeOut()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.9f)),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("VOCÊ MORREU!", fontSize = 48.sp, color = Color.Red, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Spacer(modifier = Modifier.height(32.dp))
            Button(onClick = onRetry) { // NOVO BOTÃO
                Text("Tentar Novamente")
            }
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onBackToMenu) {
                Text("Voltar ao Menu")
            }
        }
    }
}

// ALTERADO: Fundo mais claro, parâmetro 'onRetry' e novo botão
@Composable
fun VictoryOverlay(onBackToMenu: () -> Unit, onRetry: () -> Unit) {
    AnimatedVisibility(visible = true, enter = fadeIn(), exit = fadeOut()) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color.Black.copy(alpha = 0.5f)), // Fundo mais claro
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("VOCÊ VENCEU!", fontSize = 48.sp, color = Color.Green, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Spacer(modifier = Modifier.height(32.dp))
            Button(onClick = onRetry) { // NOVO BOTÃO
                Text("Tentar Novamente")
            }
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onBackToMenu) {
                Text("Voltar ao Menu")
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF0A0A33)
@Composable
fun BattleScreenPreview() {
    // A Preview não terá a lógica do ViewModel, mas podemos simular a UI.
    // Para um preview funcional, precisaríamos de um ViewModel de preview.
    BattleScreen(navController = rememberNavController())
}