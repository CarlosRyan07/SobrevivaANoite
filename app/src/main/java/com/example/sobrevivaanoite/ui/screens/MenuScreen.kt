package com.example.sobrevivaanoite.ui.screens

import androidx.activity.compose.BackHandler
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.example.sobrevivaanoite.R
import com.example.sobrevivaanoite.common.SoundManager

private enum class MenuFlowState {
    Initial, ShowingLore
}

@Composable
fun MenuScreen(navController: NavController) {

    var menuState by remember { mutableStateOf(MenuFlowState.Initial) }

    BackHandler(enabled = menuState == MenuFlowState.ShowingLore) {
        menuState = MenuFlowState.Initial
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0A1940)),
        contentAlignment = Alignment.Center
    ) {
        AnimatedVisibility(
            visible = menuState == MenuFlowState.Initial,
            enter = fadeIn(animationSpec = tween(durationMillis = 500)),
            exit = fadeOut(animationSpec = tween(durationMillis = 500))
        ) {
            Box(modifier = Modifier.fillMaxSize()) {
                Image(
                    painter = painterResource(id = R.drawable.tela_inicio),
                    contentDescription = "Tela de Início",
                    contentScale = ContentScale.Fit,
                    modifier = Modifier.fillMaxSize()
                )
                Button(
                    onClick = {
                        SoundManager.playSound(R.raw.clique_botao)
                        menuState = MenuFlowState.ShowingLore
                    },
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 80.dp)
                        .width(200.dp)
                ) {
                    Text("Iniciar Jogo", fontSize = 18.sp)
                }

                // NOVO: Botão para o Histórico de Partidas
                Button(
                    onClick = {
                        SoundManager.playSound(R.raw.clique_botao)
                        navController.navigate("history")
                    },
                    modifier = Modifier
                        .align(Alignment.TopEnd) // Alinha no canto superior direito
                        .padding(top = 24.dp, end = 24.dp) // Adiciona um espaçamento da borda
                ) {
                    Text("Histórico")
                }
            }
        }

        AnimatedVisibility(
            visible = menuState == MenuFlowState.ShowingLore,
            enter = fadeIn(animationSpec = tween(durationMillis = 1000, delayMillis = 500)),
            exit = fadeOut(animationSpec = tween(durationMillis = 500))
        ) {
            LoreScreen(
                onHide = {
                    SoundManager.playSound(R.raw.clique_botao)
                    navController.navigate("hide")
                },
                onBattle = {
                    SoundManager.playSound(R.raw.clique_botao)
                    navController.navigate("battle")
                }
            )
        }
    }
}

@Composable
private fun LoreScreen(
    onHide: () -> Unit,
    onBattle: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(horizontal = 24.dp, vertical = 48.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            item {
                Text(
                    text = "Você e mais cinco amigos estavam aproveitando uma noite tranquila no sítio, que parecia perfeita.",
                    style = loreTextStyle()
                )
            }
            item {
                Text(
                    text = "O estalar da lenha na fogueira era o único som que se misturava às risadas despreocupadas de vocês seis, sentados sob um céu absurdamente estrelado. A escuridão da mata ao redor era espessa, quase como uma parede viva e silenciosa.",
                    style = loreTextStyle()
                )
            }
            item {
                Image(
                    painter = painterResource(id = R.drawable.lore_fogueira),
                    contentDescription = "Amigos na fogueira",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
            }
            item {
                Text(
                    text = "Até que, de repente, um estalo seco — o som de um galho se partindo — ecoa vindo do meio da mata. Um dos seus amigos percebe algo e, preocupado, alerta os outros. As risadas cessam.\nTodos os olhos se voltam para a escuridão.",
                    style = loreTextStyle()
                )
            }
            item {
                Text(
                    text = "“Tem alguma coisa ali!” — grita um deles.",
                    style = loreTextStyle().copy(textAlign = TextAlign.Center)
                )
            }
            item {
                Text(
                    text = "Vocês não conseguem identificar o que é… ou como é… aquela coisa parada na escuridão.",
                    style = loreTextStyle()
                )
            }
            item {
                Text(
                    text = "Imóvel. Observando.",
                    style = loreTextStyle().copy(fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                )
            }
            item {
                Text(
                    text = "Até que, subitamente, ela começa a avançar.\nEm pânico, vocês se levantam e correm desesperados em direção à casa.",
                    style = loreTextStyle()
                )
            }
            item {
                Text(
                    text = "Vocês não se afastaram muito da casa, então já avistam ela.",
                    style = loreTextStyle()
                )
            }
            item {
                Image(
                    painter = painterResource(id = R.drawable.background_cabana),
                    contentDescription = "Casa do sítio",
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(220.dp)
                        .clip(RoundedCornerShape(8.dp)),
                    contentScale = ContentScale.Crop
                )
            }
            item {
                Text(
                    text = "Já perto da entrada, na correria desenfreada seu corpo passa suas pernas e você acaba tropeçando. Seus amigos conseguem alcançar a casa.\nVocê se levanta o mais rápido possível.\nO perseguidor ainda não te alcançou...\n\n...Mas está perto.",
                    style = loreTextStyle()
                )
            }
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(top = 10.dp, bottom = 80.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = "O que você faz?",
                        style = loreTextStyle().copy(fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    )
                    Spacer(modifier = Modifier.height(24.dp))
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        Button(onClick = onHide) {
                            Text("Esconder", fontSize = 16.sp)
                        }
                        Button(onClick = onBattle) {
                            Text("Lutar", fontSize = 16.sp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun loreTextStyle(): TextStyle {
    return TextStyle(
        fontSize = 17.sp,
        color = Color(0xFFE0E0E0),
        lineHeight = 25.sp
    )
}