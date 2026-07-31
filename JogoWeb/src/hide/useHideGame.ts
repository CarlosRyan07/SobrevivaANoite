import { useCallback, useEffect, useRef, useState } from 'react'

import {
  gamePersistence,
  type GamePersistencePort,
} from '../persistence/gamePersistence'
import type { AudioService } from '../services/AudioService'
import { deathSounds } from '../services/audioCatalog'
import { abortableDelay, abortController, isAbortError } from '../utils/abortableDelay'
import { defaultRandom, type RandomSource } from '../utils/random'
import {
  HESITATION_COORDINATES,
  HIDING_SPOT_COORDINATES,
  HIDE_TIMINGS,
  HOUSE_CENTER_POSITION,
  INSIDE_DOOR_POSITION,
  OFF_SCREEN_POSITION,
  OUTSIDE_DOOR_POSITION,
} from './hideConstants'
import {
  createInitialHideState,
  createSearchPath,
  findOtherSurvivor,
  findReplacementTarget,
} from './hideEngine'
import type { HideState, Position, RoomNumber } from './hideTypes'

type DelayFunction = (milliseconds: number, signal: AbortSignal) => Promise<void>

interface HideGameOptions {
  random?: RandomSource
  delay?: DelayFunction
  persistence?: GamePersistencePort
}

export function useHideGame(audio: AudioService, options: HideGameOptions = {}) {
  const random = options.random ?? defaultRandom
  const delay = options.delay ?? abortableDelay
  const persistence = options.persistence ?? gamePersistence
  const [state, setRenderedState] = useState<HideState>(() => createInitialHideState(random))
  const stateRef = useRef(state)
  const countdownController = useRef<AbortController | null>(null)
  const searchController = useRef<AbortController | null>(null)
  const resultSaved = useRef(false)

  const commit = useCallback((update: (current: HideState) => HideState) => {
    const nextState = update(stateRef.current)
    stateRef.current = nextState
    setRenderedState(nextState)
  }, [])

  const updatePosition = useCallback(
    (newPosition: Position) => {
      commit((current) => ({
        ...current,
        psychopathPosition: newPosition,
        isFacingRight:
          newPosition.x > current.psychopathPosition.x
            ? true
            : newPosition.x < current.psychopathPosition.x
              ? false
              : current.isFacingRight,
      }))

      if (newPosition === HOUSE_CENTER_POSITION) audio.play('footsteps')
    },
    [audio, commit],
  )

  const saveHideResult = useCallback(
    (wasVictory: boolean) => {
      if (resultSaved.current) return
      resultSaved.current = true
      persistence.saveMatch({
        gameMode: 'Esconde-Esconde',
        wasVictory,
        finalPlayerHp: wasVictory ? 100 : 0,
        parryCount: 0,
      })
    },
    [persistence],
  )

  useEffect(() => {
    const controller = new AbortController()
    countdownController.current = controller

    const runCountdown = async () => {
      while (stateRef.current.countdown > 0) {
        await delay(HIDE_TIMINGS.countdownTick, controller.signal)
        commit((current) => ({ ...current, countdown: current.countdown - 1 }))
      }

      if (stateRef.current.phase.kind === 'choosing') {
        saveHideResult(false)
        audio.play('hideLose')
        commit((current) => ({
          ...current,
          phase: {
            kind: 'result',
            didPlayerWin: false,
            playerChoice: null,
            otherSurvivor: null,
            customMessage: 'Você foi pego antes mesmo de conseguir se esconder.',
          },
        }))
      }
    }

    void runCountdown().catch((error: unknown) => {
      if (!isAbortError(error)) throw error
    })

    return () => abortController(controller)
  }, [audio, commit, delay, saveHideResult, state.round])

  useEffect(
    () => () => {
      abortController(countdownController.current)
      abortController(searchController.current)
      audio.stop('tenseMusic')
    },
    [audio],
  )

  const chooseHidingSpot = useCallback(
    (playerChoice: RoomNumber) => {
      if (stateRef.current.phase.kind !== 'choosing') return

      abortController(countdownController.current)
      abortController(searchController.current)
      const controller = new AbortController()
      searchController.current = controller

      commit((current) => ({
        ...current,
        phase: { kind: 'searching' },
        playerChoice,
      }))

      const runSearch = async () => {
        const searchPath = createSearchPath(random)

        updatePosition(OUTSIDE_DOOR_POSITION)
        await delay(HIDE_TIMINGS.outsideDoor, controller.signal)
        updatePosition(INSIDE_DOOR_POSITION)
        audio.play('doorBreak')
        await delay(HIDE_TIMINGS.doorFrame, controller.signal)
        commit((current) => ({ ...current, background: 'open' }))
        await delay(HIDE_TIMINGS.backgroundFrame, controller.signal)
        await delay(HIDE_TIMINGS.enterHouse, controller.signal)
        updatePosition(HOUSE_CENTER_POSITION)
        await delay(HIDE_TIMINGS.inspectCenter, controller.signal)

        while (searchPath.length > 0) {
          const roomToSearch = searchPath.shift()
          if (!roomToSearch) break

          audio.play('centerTheme')
          updatePosition(HESITATION_COORDINATES[roomToSearch])
          await delay(HIDE_TIMINGS.hesitation, controller.signal)
          await delay(HIDE_TIMINGS.hesitationPause, controller.signal)

          if (roomToSearch === playerChoice) {
            audio.stop('tenseMusic')
            audio.play('tenseMusic')
            try {
              await delay(HIDE_TIMINGS.tenseSearch, controller.signal)
            } finally {
              audio.stop('tenseMusic')
            }

            if (random.boolean()) {
              saveHideResult(false)
              audio.play('hideLose')
              updatePosition(HIDING_SPOT_COORDINATES[roomToSearch])
              await delay(HIDE_TIMINGS.reveal, controller.signal)
              commit((current) => ({
                ...current,
                phase: {
                  kind: 'result',
                  didPlayerWin: false,
                  playerChoice,
                  otherSurvivor: null,
                  customMessage: null,
                },
              }))
              return
            }

            const replacement = findReplacementTarget(
              searchPath,
              playerChoice,
              stateRef.current.players,
            )
            if (replacement) searchPath.push(replacement)
          } else {
            audio.play(random.pick(deathSounds))
            updatePosition(HIDING_SPOT_COORDINATES[roomToSearch])
            await delay(HIDE_TIMINGS.reveal, controller.signal)
            commit((current) => ({
              ...current,
              players: { ...current.players, [roomToSearch]: 'dead' },
            }))
          }

          updatePosition(HOUSE_CENTER_POSITION)
          await delay(HIDE_TIMINGS.returnToCenter, controller.signal)
        }

        const otherSurvivor = findOtherSurvivor(stateRef.current.players, playerChoice)
        await delay(HIDE_TIMINGS.beforeLookingAround, controller.signal)
        for (let index = 0; index < 4; index += 1) {
          commit((current) => ({ ...current, isFacingRight: !current.isFacingRight }))
          await delay(HIDE_TIMINGS.lookAroundStep, controller.signal)
        }
        await delay(HIDE_TIMINGS.afterLookingAround, controller.signal)
        updatePosition(OUTSIDE_DOOR_POSITION)
        await delay(HIDE_TIMINGS.leaveAtDoor, controller.signal)
        updatePosition(OFF_SCREEN_POSITION)
        await delay(HIDE_TIMINGS.leaveOffScreen, controller.signal)
        saveHideResult(true)
        audio.play('hideWin')
        commit((current) => ({
          ...current,
          phase: {
            kind: 'result',
            didPlayerWin: true,
            playerChoice,
            otherSurvivor,
            customMessage: null,
          },
        }))
      }

      void runSearch().catch((error: unknown) => {
        if (!isAbortError(error)) throw error
      })
    },
    [audio, commit, delay, random, saveHideResult, updatePosition],
  )

  const playAgain = useCallback(() => {
    abortController(countdownController.current)
    abortController(searchController.current)
    audio.stop('tenseMusic')
    resultSaved.current = false
    const nextRound = stateRef.current.round + 1
    const nextState = createInitialHideState(random, nextRound)
    stateRef.current = nextState
    setRenderedState(nextState)
  }, [audio, random])

  return { state, chooseHidingSpot, playAgain }
}
