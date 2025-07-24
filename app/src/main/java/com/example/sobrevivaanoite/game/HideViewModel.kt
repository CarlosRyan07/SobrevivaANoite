package com.example.sobrevivaanoite.game

import android.app.Application
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.example.sobrevivaanoite.R
import com.example.sobrevivaanoite.data.AppDatabase
import com.example.sobrevivaanoite.data.MatchHistory
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.channels.Channel
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.receiveAsFlow
import kotlinx.coroutines.launch
import kotlin.random.Random

// ... (Enums e data classes não mudam)
enum class PlayerStatus { Hiding, Dead }
sealed class GameUiState {
    data object Choosing : GameUiState()
    data object Searching : GameUiState()
    data class Result(
        val didPlayerWin: Boolean,
        val playerChoice: Int?,
        val otherSurvivor: Int?,
        val customMessage: String? = null
    ) : GameUiState()
}
data class Position(val x: Dp, val y: Dp)
sealed class SoundEvent {
    data object DoorBreak : SoundEvent()
    data object PlayerWins : SoundEvent()
    data object PlayerLoses : SoundEvent()
    data object NpcDeath : SoundEvent()
    data object Footsteps : SoundEvent()
    data object CenterTheme : SoundEvent()
    data object PlayTenseSound : SoundEvent()
}

// NOVO: A classe agora herda de AndroidViewModel
class HideViewModel(application: Application) : AndroidViewModel(application) {

    // NOVO: Acesso ao DAO do banco de dados
    private val matchHistoryDao = AppDatabase.getDatabase(application).matchHistoryDao()

    private val hidingSpotCoordinates = mapOf(
        1 to Position((-35).dp, 250.dp),
        2 to Position(130.dp, (-35).dp),
        3 to Position(130.dp, 190.dp),
        4 to Position((-170).dp, 150.dp),
        5 to Position((-140).dp, (-35).dp),
        6 to Position((-35).dp, (-230).dp)
    )
    private val hesitationCoordinates = mapOf(
        1 to Position((-35).dp, 220.dp),
        2 to Position(100.dp, (-35).dp),
        3 to Position(100.dp, 190.dp),
        4 to Position((-140).dp, 150.dp),
        5 to Position((-110).dp, (-35).dp),
        6 to Position((-35).dp, (-200).dp)
    )
    private val offScreenPosition = Position(28.dp, 500.dp)
    private val outsideDoorPosition = Position(28.dp, 310.dp)
    private val insideDoorPosition = Position(28.dp, 250.dp)
    private val houseCenterPosition = Position(0.dp, 50.dp)
    private val psychopathImages = listOf(
        R.drawable.terrifier,
        R.drawable.lobisomem,
        R.drawable.ghostface
    )

    private val _uiState = MutableStateFlow<GameUiState>(GameUiState.Choosing)
    val uiState: StateFlow<GameUiState> = _uiState
    private val _playersStatus = MutableStateFlow(getInitialPlayersStatus())
    val playersStatus: StateFlow<Map<Int, PlayerStatus>> = _playersStatus
    private val _psychopathPosition = MutableStateFlow(offScreenPosition)
    val psychopathPosition: StateFlow<Position> = _psychopathPosition
    private val _backgroundImageRes = MutableStateFlow(R.drawable.planta_casa_portainteira)
    val backgroundImageRes: StateFlow<Int> = _backgroundImageRes
    private val _currentPsychopathImageRes = MutableStateFlow(psychopathImages.first())
    val currentPsychopathImageRes: StateFlow<Int> = _currentPsychopathImageRes
    private val _isFacingRight = MutableStateFlow(false)
    val isFacingRight: StateFlow<Boolean> = _isFacingRight
    private val _soundEventChannel = Channel<SoundEvent>()
    val soundEventFlow = _soundEventChannel.receiveAsFlow()
    private val _countdown = MutableStateFlow(10)
    val countdown: StateFlow<Int> = _countdown
    private var countdownJob: Job? = null

    init {
        _currentPsychopathImageRes.value = psychopathImages.random()
        startCountdown()
    }

    private fun startCountdown() {
        countdownJob?.cancel()
        countdownJob = viewModelScope.launch {
            while (_countdown.value > 0) {
                delay(1000)
                _countdown.value--
            }
            if (_uiState.value is GameUiState.Choosing) {
                // Salva o resultado de derrota
                saveHideResult(wasVictory = false)
                _soundEventChannel.send(SoundEvent.PlayerLoses)
                _uiState.value = GameUiState.Result(
                    didPlayerWin = false,
                    playerChoice = null,
                    otherSurvivor = null,
                    customMessage = "Você foi pego antes mesmo de conseguir se esconder."
                )
            }
        }
    }

    fun chooseHidingSpot(playerChoice: Int) {
        if (_uiState.value !is GameUiState.Choosing) return
        countdownJob?.cancel()
        viewModelScope.launch {
            val allSpots = (1..6).toList()
            val searchPath = allSpots.shuffled().take(4).toMutableList()
            _uiState.value = GameUiState.Searching
            updatePosition(outsideDoorPosition)
            delay(2000)
            updatePosition(insideDoorPosition)
            _soundEventChannel.send(SoundEvent.DoorBreak)
            delay(50)
            _backgroundImageRes.value = R.drawable.planta_casa
            delay(250)
            delay(1500)
            updatePosition(houseCenterPosition)
            delay(3000)
            while (searchPath.isNotEmpty()) {
                val roomToSearch = searchPath.removeAt(0)
                println(">>> JOGADOR ESCOLHEU: $playerChoice | PSICOPATA VAI PARA: $roomToSearch")
                _soundEventChannel.send(SoundEvent.CenterTheme)
                updatePosition(hesitationCoordinates[roomToSearch] ?: houseCenterPosition)
                delay(1500)
                delay(1000)
                if (roomToSearch == playerChoice) {
                    _soundEventChannel.send(SoundEvent.PlayTenseSound)
                    delay(6000)
                    val foundYou = Random.nextBoolean()
                    if (foundYou) {
                        // Salva o resultado de derrota
                        saveHideResult(wasVictory = false)
                        _soundEventChannel.send(SoundEvent.PlayerLoses)
                        updatePosition(hidingSpotCoordinates[roomToSearch] ?: houseCenterPosition)
                        delay(300)
                        _uiState.value = GameUiState.Result(false, playerChoice, null)
                        return@launch
                    } else {
                        val currentPathAndPlayer = searchPath.toSet() + playerChoice
                        val replacementTarget = allSpots.find { it !in currentPathAndPlayer && _playersStatus.value[it] == PlayerStatus.Hiding }
                        replacementTarget?.let {
                            searchPath.add(it)
                        }
                    }
                } else {
                    _soundEventChannel.send(SoundEvent.NpcDeath)
                    updatePosition(hidingSpotCoordinates[roomToSearch] ?: houseCenterPosition)
                    delay(300)
                    val newStatus = _playersStatus.value.toMutableMap()
                    newStatus[roomToSearch] = PlayerStatus.Dead
                    _playersStatus.value = newStatus
                }
                updatePosition(houseCenterPosition)
                delay(2000)
            }
            val finalSurvivors = _playersStatus.value.filter { it.value == PlayerStatus.Hiding }.keys
            val finalOtherSurvivor = finalSurvivors.find { it != playerChoice }
            delay(500)
            repeat(4) {
                _isFacingRight.value = !_isFacingRight.value
                delay(400)
            }
            delay(500)
            updatePosition(outsideDoorPosition)
            delay(2000)
            updatePosition(offScreenPosition)
            delay(1500)
            // Salva o resultado de vitória
            saveHideResult(wasVictory = true)
            _soundEventChannel.send(SoundEvent.PlayerWins)
            _uiState.value = GameUiState.Result(true, playerChoice, finalOtherSurvivor)
        }
    }

    private suspend fun updatePosition(newPosition: Position) {
        if (newPosition.x.value > _psychopathPosition.value.x.value) {
            _isFacingRight.value = true
        } else if (newPosition.x.value < _psychopathPosition.value.x.value) {
            _isFacingRight.value = false
        }
        _psychopathPosition.value = newPosition
        if(newPosition == houseCenterPosition) {
            _soundEventChannel.send(SoundEvent.Footsteps)
        }
    }

    fun playAgain() {
        _uiState.value = GameUiState.Choosing
        _playersStatus.value = getInitialPlayersStatus()
        _psychopathPosition.value = offScreenPosition
        _backgroundImageRes.value = R.drawable.planta_casa_portainteira
        _currentPsychopathImageRes.value = psychopathImages.random()
        _isFacingRight.value = false
        _countdown.value = 10
        startCountdown()
    }

    private fun getInitialPlayersStatus(): Map<Int, PlayerStatus> {
        return (1..6).associateWith { PlayerStatus.Hiding }
    }

    // NOVO: Função para salvar o resultado
    private fun saveHideResult(wasVictory: Boolean) {
        viewModelScope.launch(Dispatchers.IO) {
            val match = MatchHistory(
                gameMode = "Esconde-Esconde",
                wasVictory = wasVictory,
                // Campos não relevantes para este modo, usamos valores padrão
                finalPlayerHp = if (wasVictory) 100 else 0,
                parryCount = 0
            )
            matchHistoryDao.insertMatch(match)
        }
    }
}