package com.example.sobrevivaanoite.common

import android.content.Context
import android.media.AudioAttributes
import android.media.SoundPool
import com.example.sobrevivaanoite.R

object SoundManager {

    // NOVO: Lista específica para os sons de morte
    val deathSounds = listOf(
        R.raw.morte1, R.raw.morte2, R.raw.morte3, R.raw.morte4,
        R.raw.morte5, R.raw.morte6, R.raw.morte7, R.raw.morte8
    )

    // A lista principal agora contém TODOS os sons, incluindo a nova lista
    val allSounds = listOf(
        R.raw.musica_tensa,
        R.raw.fnaf2_theme,
        R.raw.psicopata_passos,
        R.raw.clique_botao,
        R.raw.porta_sendo_quebrada,
        R.raw.win_hide,
        R.raw.lose_hide,
        // modo batalha
        R.raw.soco,
        R.raw.soco_forte,
        R.raw.parry,
        R.raw.lobisomem_ataque
    ) + deathSounds // Adicionamos a lista de sons de morte à lista principal

    private var soundPool: SoundPool? = null
    private val soundIds = mutableMapOf<Int, Int>()

    fun initialize(context: Context) {
        val audioAttributes = AudioAttributes.Builder()
            .setUsage(AudioAttributes.USAGE_GAME)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        soundPool = SoundPool.Builder()
            .setMaxStreams(7)
            .setAudioAttributes(audioAttributes)
            .build()
        allSounds.forEach { soundRes ->
            val soundId = soundPool?.load(context, soundRes, 1)
            soundId?.let {
                soundIds[soundRes] = it
            }
        }
    }

    fun playSound(soundResId: Int) {
        soundIds[soundResId]?.let { soundId ->
            soundPool?.play(soundId, 1f, 1f, 0, 0, 1f)
        }
    }

    fun release() {
        soundPool?.release()
        soundPool = null
    }
}