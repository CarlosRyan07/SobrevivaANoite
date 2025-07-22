package com.example.sobrevivaanoite.game

import android.app.Application
import androidx.annotation.DrawableRes
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.sobrevivaanoite.R
import com.example.sobrevivaanoite.common.SoundManager
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlin.random.Random

enum class AttackDirection { LEFT, RIGHT }
sealed class EnemyAction {
    data object IDLE : EnemyAction(); data class PREPARING_ATTACK(val direction: AttackDirection) : EnemyAction(); data class ATTACKING(val direction: AttackDirection) : EnemyAction(); data object STUNNED : EnemyAction(); data object RECOVERING : EnemyAction(); data object DEFEATED : EnemyAction()
}
enum class DodgeTiming { NONE, EARLY, PERFECT }
enum class PlayerState { IDLE, ATTACKING, DODGING, STUNNED }
data class BattleUiState(
    val playerHp: Int = 100,
    @DrawableRes val playerImage: Int = R.drawable.sobrevivente_parado,
    val playerState: PlayerState = PlayerState.IDLE,
    val enemyHp: Int = 700,
    val enemyAction: EnemyAction = EnemyAction.IDLE,
    @DrawableRes val enemyImage: Int = R.drawable.psicopata_parado,
    val gameResult: String? = null,
    val playerComboStep: Int = 0
)

class BattleViewModel(application: Application) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(BattleUiState())
    val uiState: StateFlow<BattleUiState> = _uiState.asStateFlow()

    private var aiLoopJob: Job? = null
    private var playerActionJob: Job? = null
    private var enemyHitAnimationJob: Job? = null
    private var playerDodgeIntent: AttackDirection? = null
    private var dodgeTiming: DodgeTiming = DodgeTiming.NONE
    private var playerComboStep = 0
    private var comboTimerJob: Job? = null

    private val playerIdleImages = listOf(R.drawable.sobrevivente_parado)
    private val playerDodgeLeftImages = listOf(R.drawable.sobrevivente_esquivando_esquerda, R.drawable.sobrevivente_esquivando_esquerda1)
    private val playerDodgeRightImages = listOf(R.drawable.sobrevivente_esquivando_direita, R.drawable.sobrevivente_esquivando_direita1)
    private val playerAttackImages = listOf(R.drawable.sobrevivente_ataque1, R.drawable.sobrevivente_ataque2, R.drawable.sobrevivente_ataque3, R.drawable.sobrevivente_ataque4, R.drawable.sobrevivente_ataque5, R.drawable.sobrevivente_ataque6)
    private val enemyHitImages = listOf(R.drawable.psicopata_atingido1, R.drawable.psicopata_atingido2, R.drawable.psicopata_atingido3, R.drawable.psicopata_atingido4)
    private val victoryDances = listOf(R.drawable.rat_dance)//, R.drawable.fortnite_dance)
    val victoryDancesList: List<Int> = victoryDances
    private var attackSpeed: Long = 250L

    init {
        startEnemyAiLoop()
    }

    private fun isPlayerBusy(): Boolean {
        return _uiState.value.playerState != PlayerState.IDLE
    }

    private fun resetComboSpeed() {
        attackSpeed = 250L
    }

    private fun startEnemyAiLoop() {
        aiLoopJob?.cancel()
        aiLoopJob = viewModelScope.launch {
            delay(2000)
            while (_uiState.value.gameResult == null) {
                if (_uiState.value.enemyAction is EnemyAction.STUNNED) {
                    delay(4000)
                    _uiState.update { it.copy(enemyAction = EnemyAction.IDLE, enemyImage = R.drawable.psicopata_parado) }
                    continue
                }
                _uiState.update { it.copy(enemyAction = EnemyAction.IDLE, enemyImage = R.drawable.psicopata_parado, playerState = PlayerState.IDLE) }
                playerDodgeIntent = null
                dodgeTiming = DodgeTiming.NONE
                delay(Random.nextLong(1000, 2000))
                val attackDirection = if (Random.nextBoolean()) AttackDirection.LEFT else AttackDirection.RIGHT
                val preparingImage = if (attackDirection == AttackDirection.LEFT) R.drawable.psicopata_preparando_esquerda else R.drawable.psicopata_preparando_direita
                _uiState.update { it.copy(enemyAction = EnemyAction.PREPARING_ATTACK(attackDirection), enemyImage = preparingImage) }
                delay(700)
                val attackingImage = if (attackDirection == AttackDirection.LEFT) R.drawable.psicopata_atacando_esquerda else R.drawable.psicopata_atacando_direita
                _uiState.update { it.copy(enemyAction = EnemyAction.ATTACKING(attackDirection), enemyImage = attackingImage) }
                delay(100)
                val enemyAction = _uiState.value.enemyAction
                if (enemyAction is EnemyAction.ATTACKING && _uiState.value.gameResult == null) {
                    val wasCorrectDirection = playerDodgeIntent == enemyAction.direction
                    when {
                        wasCorrectDirection && dodgeTiming == DodgeTiming.PERFECT -> handleParrySuccess(enemyAction.direction)
                        wasCorrectDirection && dodgeTiming == DodgeTiming.EARLY -> {
                            SoundManager.playSound(R.raw.lobisomem_ataque)
                            playerComboStep = 0
                            _uiState.update { it.copy(playerComboStep = 0) }
                            resetComboSpeed()
                        }
                        else -> {
                            SoundManager.playSound(R.raw.lobisomem_ataque)
                            handlePlayerHit(enemyAction.direction)
                        }
                    }
                }
                playerDodgeIntent = null
                dodgeTiming = DodgeTiming.NONE
                if (_uiState.value.enemyAction !is EnemyAction.STUNNED) {
                    _uiState.update { it.copy(enemyAction = EnemyAction.RECOVERING) }
                    delay(1200)
                }
            }
        }
    }
    private suspend fun handleParrySuccess(attackDirection: AttackDirection) {
        val parryImage = if (attackDirection == AttackDirection.LEFT) R.drawable.sobrevivente_parry_esquerda else R.drawable.sobrevivente_parry_direita
        SoundManager.playSound(R.raw.parry)
        _uiState.update { it.copy(playerImage = parryImage, playerState = PlayerState.IDLE, enemyAction = EnemyAction.STUNNED, enemyImage = R.drawable.psicopata_atordoado) }
    }

    private suspend fun handlePlayerHit(attackDirection: AttackDirection) {
        playerActionJob?.cancel()
        comboTimerJob?.cancel()
        playerComboStep = 0
        resetComboSpeed()
        val hitImage = if (attackDirection == AttackDirection.LEFT) R.drawable.sobrevivente_atingido_esquerda else R.drawable.sobrevivente_atingido_direita
        playerActionJob = viewModelScope.launch {
            _uiState.update { it.copy(playerImage = hitImage, playerState = PlayerState.STUNNED, playerComboStep = 0) }
            val newPlayerHp = _uiState.value.playerHp - 15
            _uiState.update { it.copy(playerHp = newPlayerHp.coerceAtLeast(0)) }
            checkGameResult()
            delay(800)
            if (_uiState.value.gameResult == null) {
                _uiState.update { it.copy(playerImage = playerIdleImages.random(), playerState = PlayerState.IDLE) }
            }
        }
    }

    private fun checkGameResult() {
        val currentState = _uiState.value
        if (currentState.enemyHp <= 0 && currentState.gameResult == null) {
            handleVictorySequence()
        } else if (currentState.playerHp <= 0 && currentState.gameResult == null) {
            aiLoopJob?.cancel()
            _uiState.update { it.copy(gameResult = "lose") }
        }
    }

    private fun handleVictorySequence() {
        aiLoopJob?.cancel()
        viewModelScope.launch {
            _uiState.update { it.copy(enemyImage = R.drawable.psicopata_atordoado, enemyAction = EnemyAction.DEFEATED) }
            delay(1000)
            _uiState.update { it.copy(enemyImage = R.drawable.psicopata_derrotado) }
            delay(2500)
            SoundManager.playMusic(getApplication(), R.raw.rat_dance_music)
            _uiState.update { it.copy(playerImage = R.drawable.sobrevivente_vitoria, enemyImage = R.drawable.psicopata_derrotado) }
            delay(2500)
            _uiState.update { it.copy(playerImage = victoryDances.random(), enemyImage = R.drawable.psicopata_derrotado) }
            _uiState.update { it.copy(gameResult = "win") }
        }
    }

    fun onDodgeLeftClicked() {
        if (_uiState.value.gameResult != null || isPlayerBusy() || _uiState.value.enemyAction is EnemyAction.DEFEATED) return
        playerActionJob?.cancel()
        playerActionJob = viewModelScope.launch {
            _uiState.update { it.copy(playerImage = playerDodgeLeftImages.random(), playerState = PlayerState.DODGING) }
            delay(800)
            if (_uiState.value.gameResult == null) {
                _uiState.update { it.copy(playerImage = playerIdleImages.random(), playerState = PlayerState.IDLE) }
            }
        }
        dodgeTiming = when (_uiState.value.enemyAction) {
            is EnemyAction.PREPARING_ATTACK -> DodgeTiming.EARLY; is EnemyAction.ATTACKING -> DodgeTiming.PERFECT; else -> DodgeTiming.NONE
        }
        playerDodgeIntent = AttackDirection.LEFT
    }

    fun onDodgeRightClicked() {
        if (_uiState.value.gameResult != null || isPlayerBusy() || _uiState.value.enemyAction is EnemyAction.DEFEATED) return
        playerActionJob?.cancel()
        playerActionJob = viewModelScope.launch {
            _uiState.update { it.copy(playerImage = playerDodgeRightImages.random(), playerState = PlayerState.DODGING) }
            delay(800)
            if (_uiState.value.gameResult == null) {
                _uiState.update { it.copy(playerImage = playerIdleImages.random(), playerState = PlayerState.IDLE) }
            }
        }
        dodgeTiming = when (_uiState.value.enemyAction) {
            is EnemyAction.PREPARING_ATTACK -> DodgeTiming.EARLY; is EnemyAction.ATTACKING -> DodgeTiming.PERFECT; else -> DodgeTiming.NONE
        }
        playerDodgeIntent = AttackDirection.RIGHT
    }

    fun onAttackClicked() {
        if (_uiState.value.gameResult != null || isPlayerBusy() || _uiState.value.enemyAction is EnemyAction.DEFEATED) return

        comboTimerJob?.cancel()
        val isStunned = _uiState.value.enemyAction is EnemyAction.STUNNED
        val soundToPlay = if (isStunned) R.raw.soco_forte else R.raw.soco
        SoundManager.playSound(soundToPlay)

        val attackImage = playerAttackImages[playerComboStep % playerAttackImages.size]
        playerComboStep++
        _uiState.update { it.copy(playerImage = attackImage, playerState = PlayerState.ATTACKING, playerComboStep = playerComboStep) }

        playerActionJob?.cancel()
        playerActionJob = viewModelScope.launch {
            delay(attackSpeed)
            if (_uiState.value.playerState == PlayerState.ATTACKING) {
                _uiState.update { it.copy(playerState = PlayerState.IDLE) }
            }
        }

        if (playerComboStep >= 2) {
            attackSpeed = (attackSpeed - 75L).coerceAtLeast(100L)
        }

        comboTimerJob = viewModelScope.launch {
            delay(1500)
            playerComboStep = 0
            resetComboSpeed()
            _uiState.update { it.copy(playerComboStep = 0, playerImage = playerIdleImages.random())}
        }

        val damage = if (isStunned) 10 else 3
        val newEnemyHp = (_uiState.value.enemyHp - damage).coerceAtLeast(0)
        _uiState.update { it.copy(enemyHp = newEnemyHp) }

        if (isStunned) {
            enemyHitAnimationJob?.cancel()
            enemyHitAnimationJob = viewModelScope.launch {
                val hitImage = enemyHitImages[playerComboStep % enemyHitImages.size]
                _uiState.update { it.copy(enemyImage = hitImage) }
                delay(1000)
                if (_uiState.value.enemyAction is EnemyAction.STUNNED) {
                    _uiState.update { it.copy(enemyImage = R.drawable.psicopata_atordoado) }
                }
            }
        }
        checkGameResult()
    }

    fun retryGame() {
        playerActionJob?.cancel()
        enemyHitAnimationJob?.cancel()
        comboTimerJob?.cancel()
        aiLoopJob?.cancel()
        SoundManager.stopMusic()
        playerComboStep = 0
        resetComboSpeed()
        dodgeTiming = DodgeTiming.NONE
        playerDodgeIntent = null
        _uiState.value = BattleUiState()
        startEnemyAiLoop()
    }

    override fun onCleared() {
        super.onCleared()
        SoundManager.stopMusic()
    }
}