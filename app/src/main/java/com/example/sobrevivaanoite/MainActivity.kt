package com.example.sobrevivaanoite

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import com.example.sobrevivaanoite.common.SoundManager
import com.example.sobrevivaanoite.navigation.NavGraph
import com.example.sobrevivaanoite.ui.theme.SobrevivaANoiteTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Inicia nosso gerenciador de som
        SoundManager.initialize(this)

        setContent {
            SobrevivaANoiteTheme {
                NavGraph()
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        // Libera os recursos de som quando o app é destruído
        SoundManager.release()
    }
}