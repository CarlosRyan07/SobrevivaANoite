// Arquivo: common/SoundManager.kt (COMPLETO E ATUALIZADO)
package com.example.sobrevivaanoite.common

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.media.SoundPool
import androidx.annotation.RawRes
import com.example.sobrevivaanoite.R

object SoundManager {

    // --- LÓGICA ANTIGA PARA EFEITOS CURTOS (SoundPool) ---
    val deathSounds = listOf(
        R.raw.morte1, R.raw.morte2, R.raw.morte3, R.raw.morte4,
        R.raw.morte5, R.raw.morte6, R.raw.morte7, R.raw.morte8
    )
    val allSounds = listOf(
        R.raw.musica_tensa,
        R.raw.fnaf2_theme,
        R.raw.psicopata_passos,
        R.raw.clique_botao,
        R.raw.porta_sendo_quebrada,
        R.raw.win_hide,
        R.raw.lose_hide,
        R.raw.soco,
        R.raw.soco_forte,
        R.raw.parry,
        R.raw.lobisomem_ataque
    ) + deathSounds
    private var soundPool: SoundPool? = null
    private val soundIds = mutableMapOf<Int, Int>()

    // --- NOVA LÓGICA PARA MÚSICAS (MediaPlayer) ---
    private var mediaPlayer: MediaPlayer? = null

    fun initialize(context: Context) {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        soundPool = SoundPool.Builder()
            .setMaxStreams(10)
            .setAudioAttributes(audioAttributes)
            .build()
        allSounds.forEach { soundRes ->
            val soundId = soundPool?.load(context, soundRes, 1)
            soundId?.let {
                soundIds[soundRes] = it
            }
        }
    }

    // Função para efeitos curtos
    fun playSound(@RawRes soundResId: Int) {
        soundIds[soundResId]?.let { soundId ->
            soundPool?.play(soundId, 1f, 1f, 0, 0, 1f)
        }
    }

    // NOVA FUNÇÃO: Para músicas longas
    fun playMusic(context: Context, @RawRes musicResId: Int) {
        // Para e libera qualquer música que já esteja tocando
        stopMusic()

        mediaPlayer = MediaPlayer.create(context, musicResId).apply {
            setOnCompletionListener {
                // Quando a música terminar, libera os recursos
                stopMusic()
            }
            start() // Inicia a música
        }
    }

    // NOVA FUNÇÃO: Para parar a música
    fun stopMusic() {
        mediaPlayer?.stop()
        mediaPlayer?.release()
        mediaPlayer = null
    }

    fun release() {
        soundPool?.release()
        soundPool = null
        stopMusic() // Garante que a música pare também
    }
}