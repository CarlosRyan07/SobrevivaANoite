package com.example.sobrevivaanoite.ui.screens

import android.widget.ImageView
import androidx.annotation.DrawableRes
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
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
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.navigation.compose.rememberNavController
import com.bumptech.glide.Glide
import com.bumptech.glide.integration.compose.ExperimentalGlideComposeApi
import com.example.sobrevivaanoite.R
import com.example.sobrevivaanoite.game.BattleViewModel
import com.example.sobrevivaanoite.game.EnemyAction

@Composable
fun BattleScreen(navController: NavController) {
    val viewModel: BattleViewModel = viewModel()
    val uiState by viewModel.uiState.collectAsState()
    val enemyMaxHp = 700

    val isPlayerDancing = uiState.playerImage in viewModel.victoryDancesList

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

        if (uiState.gameResult == "win") {
            VictoryOverlay(
                onBackToMenu = { navController.popBackStack() },
                onRetry = { viewModel.retryGame() }
            )
        }

        // Condição para mostrar as BARRAS DE VIDA (igual para as duas)
        if (uiState.gameResult != "win") {
            TopUi(
                currentHp = uiState.enemyHp,
                maxHp = enemyMaxHp,
                comboCount = uiState.playerComboStep
            )
            // Barra de vida do sobrevivente agora é chamada aqui
            SurvivorHpBar(
                currentHp = uiState.playerHp,
                maxHp = 100
            )
        }

        CenterStage(
            enemyImage = uiState.enemyImage,
            playerImage = uiState.playerImage,
            isPlayerDancing = isPlayerDancing
        )

        // Condição apenas para os BOTÕES DE AÇÃO
        if (uiState.gameResult == null && uiState.enemyAction !is EnemyAction.DEFEATED) {
            ActionButtons(
                onAttack = { viewModel.onAttackClicked() },
                onDodgeLeft = { viewModel.onDodgeLeftClicked() },
                onDodgeRight = { viewModel.onDodgeRightClicked() }
            )
        }

        if (uiState.gameResult == "lose") {
            GameOverOverlay(
                onBackToMenu = { navController.popBackStack() },
                onRetry = { viewModel.retryGame() }
            )
        }
    }
}

@OptIn(ExperimentalGlideComposeApi::class)
@Composable
fun CenterStage(@DrawableRes enemyImage: Int, @DrawableRes playerImage: Int, isPlayerDancing: Boolean) {
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

        if (isPlayerDancing) {
            AndroidView(
                factory = { context ->
                    ImageView(context).apply {
                        scaleType = ImageView.ScaleType.FIT_CENTER
                    }
                },
                update = { imageView ->
                    Glide.with(imageView.context)
                        .asGif()
                        .load(playerImage)
                        .into(imageView)
                },
                modifier = Modifier
                    .align(Alignment.Center)
                    .offset(y = 60.dp)
                    .height(200.dp)
                    .fillMaxWidth(0.6f)
            )
        } else {
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

// DEFINIÇÃO DAS NOVAS FUNÇÕES QUE ESTAVAM FALTANDO
@Composable
fun SurvivorHpBar(currentHp: Int, maxHp: Int) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 160.dp), // Posição fixa para a barra de vida
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Bottom
    ) {
        EnhancedHpBar(
            name = "Sobrevivente",
            currentHp = currentHp,
            maxHp = maxHp
        )
    }
}

@Composable
fun ActionButtons(onAttack: () -> Unit, onDodgeLeft: () -> Unit, onDodgeRight: () -> Unit) {
    Row(
        modifier = Modifier
            .fillMaxSize()
            .padding(bottom = 60.dp), // Posição fixa para os botões
        horizontalArrangement = Arrangement.SpaceEvenly,
        verticalAlignment = Alignment.Bottom
    ) {
        Button(onClick = onDodgeLeft) { Text(text = "Esquivar\nEsquerda", textAlign = TextAlign.Center) }
        Button(onClick = onAttack, modifier = Modifier.size(80.dp, 70.dp)) {
            Text(text = "👊🏻", fontSize = 25.sp)
        }
        Button(onClick = onDodgeRight) { Text(text = "Esquivar\nDireita", textAlign = TextAlign.Center) }
    }
}


@Composable
fun ComboCounter(comboCount: Int, modifier: Modifier = Modifier) {
    val targetColor = when {
        comboCount >= 50 -> Color(0xFFD32F2F); comboCount >= 30 -> Color(0xFFF57C00); comboCount >= 15 -> Color(0xFFFFEB3B); else -> Color.White
    }
    val animatedComboColor by animateColorAsState(targetValue = targetColor, animationSpec = tween(durationMillis = 500), label = "comboColorAnimation")
    AnimatedVisibility(visible = comboCount > 1, enter = fadeIn(), exit = fadeOut(), modifier = modifier) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(text = "${comboCount}x", fontSize = 36.sp, color = animatedComboColor, fontWeight = FontWeight.Bold)
            Text(text = "Combo", fontSize = 16.sp, color = animatedComboColor)
        }
    }
}

@Composable
fun EnhancedHpBar(name: String, currentHp: Int, maxHp: Int, modifier: Modifier = Modifier) {
    val hpPercentage = currentHp.toFloat() / maxHp.toFloat()
    val animatedProgress by animateFloatAsState(targetValue = hpPercentage, animationSpec = tween(durationMillis = 500, easing = LinearOutSlowInEasing), label = "hpAnimation")
    val barColor: Color
    val gradientBrush: Brush
    when {
        hpPercentage > 0.8f -> { barColor = Color(0xFF2E7D32); gradientBrush = Brush.horizontalGradient(listOf(Color(0xFF66BB6A), barColor)) }
        hpPercentage > 0.6f -> { barColor = Color(0xFFAFB42B); gradientBrush = Brush.horizontalGradient(listOf(Color(0xFFDCE775), barColor)) }
        hpPercentage > 0.4f -> { barColor = Color(0xFFFBC02D); gradientBrush = Brush.horizontalGradient(listOf(Color(0xFFFFF176), barColor)) }
        hpPercentage > 0.2f -> { barColor = Color(0xFFF57F17); gradientBrush = Brush.horizontalGradient(listOf(Color(0xFFFFA726), barColor)) }
        else -> { barColor = Color(0xFFC62828); gradientBrush = Brush.horizontalGradient(listOf(Color(0xFFE57373), barColor)) }
    }
    Column(modifier = modifier, horizontalAlignment = Alignment.CenterHorizontally) {
        Text(text = name, color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
        Spacer(modifier = Modifier.height(8.dp))
        Box(modifier = Modifier.fillMaxWidth(0.9f).height(28.dp).clip(RoundedCornerShape(12.dp)).background(Color.Black.copy(alpha = 0.5f)).border(1.dp, Color.White.copy(alpha = 0.4f), RoundedCornerShape(12.dp)), contentAlignment = Alignment.CenterStart) {
            Box(modifier = Modifier.fillMaxHeight().fillMaxWidth(animatedProgress).clip(RoundedCornerShape(12.dp)).background(gradientBrush))
            Text(text = "$currentHp / $maxHp", color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(start = 10.dp))
        }
    }
}

@Composable
fun GameOverOverlay(onBackToMenu: () -> Unit, onRetry: () -> Unit) {
    AnimatedVisibility(visible = true, enter = fadeIn(), exit = fadeOut()) {
        Column(modifier = Modifier.fillMaxSize().background(Color.Black.copy(alpha = 0.9f)), verticalArrangement = Arrangement.Center, horizontalAlignment = Alignment.CenterHorizontally) {
            Text("VOCÊ MORREU!", fontSize = 48.sp, color = Color.Red, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
            Spacer(modifier = Modifier.height(32.dp))
            Button(onClick = onRetry) { Text("Tentar Novamente") }
            Spacer(modifier = Modifier.height(16.dp))
            Button(onClick = onBackToMenu) { Text("Voltar ao Menu") }
        }
    }
}

@Composable
fun VictoryOverlay(onBackToMenu: () -> Unit, onRetry: () -> Unit) {
    Box(
        modifier = Modifier.fillMaxSize()
    ) {
        Text(
            text = "VOCÊ VENCEU!",
            fontSize = 40.sp,
            color = Color.Green,
            fontWeight = FontWeight.Bold,
            textAlign = TextAlign.Center,
            modifier = Modifier
                .align(Alignment.TopCenter)
                .padding(top = 260.dp)
        )
        Row(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 160.dp),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Button(onClick = onRetry) {
                Text("Tentar Novamente")
            }
            Spacer(modifier = Modifier.width(16.dp))
            Button(onClick = onBackToMenu) {
                Text("Voltar ao Menu")
            }
        }
    }
}

@Preview(showBackground = true, backgroundColor = 0xFF0A0A33)
@Composable
fun BattleScreenPreview() {
    BattleScreen(navController = rememberNavController())
}