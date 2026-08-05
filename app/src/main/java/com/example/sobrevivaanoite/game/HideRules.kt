package com.example.sobrevivaanoite.game

/** Regras determinísticas do modo esconde-esconde. */
object HideRules {
    const val HIDING_SPOT_COUNT = 6
    const val INITIAL_SEARCH_PATH_SIZE = 4

    fun initialPlayersStatus(): Map<Int, PlayerStatus> =
        (1..HIDING_SPOT_COUNT).associateWith { PlayerStatus.Hiding }

    fun initialSearchPath(shuffledSpots: List<Int>): MutableList<Int> =
        shuffledSpots.take(INITIAL_SEARCH_PATH_SIZE).toMutableList()

    fun replacementTarget(
        remainingSearchPath: Collection<Int>,
        playerChoice: Int,
        playersStatus: Map<Int, PlayerStatus>
    ): Int? {
        val unavailableSpots = remainingSearchPath.toSet() + playerChoice
        return (1..HIDING_SPOT_COUNT).firstOrNull { spot ->
            spot !in unavailableSpots && playersStatus[spot] == PlayerStatus.Hiding
        }
    }

    fun otherSurvivor(
        playersStatus: Map<Int, PlayerStatus>,
        playerChoice: Int
    ): Int? = playersStatus.entries
        .firstOrNull { (spot, status) -> spot != playerChoice && status == PlayerStatus.Hiding }
        ?.key

    fun countdownExpiredResult(): GameUiState.Result = GameUiState.Result(
        didPlayerWin = false,
        playerChoice = null,
        otherSurvivor = null,
        customMessage = "Você foi pego antes mesmo de conseguir se esconder."
    )
}
