import { useCallback, useEffect, useRef, useState } from 'react'

import {
  gamePersistence,
  type GamePersistencePort,
} from '../persistence/gamePersistence'
import type { AudioService } from '../services/AudioService'
import { images } from '../services/assetPaths'
import { abortableDelay, abortController, isAbortError } from '../utils/abortableDelay'
import { defaultRandom, type RandomSource } from '../utils/random'
import {
  BATTLE_TIMINGS,
  INITIAL_ATTACK_SPEED,
  PLAYER_DAMAGE,
} from './battleConstants'
import {
  attackDamage,
  createInitialBattleState,
  nextAttackSpeed,
  resolveEnemyAttack,
} from './battleEngine'
import type { AttackDirection, BattleState, DodgeTiming } from './battleTypes'

type DelayFunction = (milliseconds: number, signal: AbortSignal) => Promise<void>

export interface BattleGameOptions {
  random?: RandomSource
  delay?: DelayFunction
  initialEnemyHp?: number
  persistence?: GamePersistencePort
}

function isEnemyStunned(state: BattleState): boolean {
  return state.enemyAction.kind === 'stunned'
}

export function useBattleGame(audio: AudioService, options: BattleGameOptions = {}) {
  const random = options.random ?? defaultRandom
  const delay = options.delay ?? abortableDelay
  const initialEnemyHp = options.initialEnemyHp
  const persistence = options.persistence ?? gamePersistence
  const [state, setRenderedState] = useState<BattleState>(() =>
    createInitialBattleState(0, initialEnemyHp, persistence.getHighCombo()),
  )
  const stateRef = useRef(state)
  const aiController = useRef<AbortController | null>(null)
  const playerActionController = useRef<AbortController | null>(null)
  const enemyHitController = useRef<AbortController | null>(null)
  const comboController = useRef<AbortController | null>(null)
  const victoryControllers = useRef(new Set<AbortController>())
  const playerDodgeIntent = useRef<AttackDirection | null>(null)
  const dodgeTiming = useRef<DodgeTiming>('none')
  const comboStep = useRef(0)
  const parryCount = useRef(0)
  const resultSaved = useRef(false)
  const attackSpeed = useRef(INITIAL_ATTACK_SPEED)

  const commit = useCallback((update: (current: BattleState) => BattleState) => {
    const nextState = update(stateRef.current)
    stateRef.current = nextState
    setRenderedState(nextState)
  }, [])

  const resetComboSpeed = useCallback(() => {
    attackSpeed.current = INITIAL_ATTACK_SPEED
  }, [])

  const saveBattleResult = useCallback(
    (wasVictory: boolean) => {
      if (resultSaved.current) return
      resultSaved.current = true
      persistence.saveMatch({
        gameMode: 'Batalha',
        wasVictory,
        finalPlayerHp: stateRef.current.playerHp,
        parryCount: parryCount.current,
      })
    },
    [persistence],
  )

  const startVictorySequence = useCallback(() => {
    if (
      stateRef.current.gameResult !== null ||
      stateRef.current.enemyAction.kind === 'defeated'
    ) {
      return
    }

    abortController(aiController.current)
    abortController(playerActionController.current)
    abortController(enemyHitController.current)
    abortController(comboController.current)
    comboStep.current = 0
    resetComboSpeed()
    saveBattleResult(true)

    const controller = new AbortController()
    victoryControllers.current.add(controller)

    commit((current) => ({
      ...current,
      enemyHp: 0,
      enemyAction: { kind: 'defeated' },
      enemyImage: images.enemy.stunned,
      playerState: 'idle',
      playerComboStep: 0,
    }))

    const runVictory = async () => {
      await delay(BATTLE_TIMINGS.stunnedBeforeDefeat, controller.signal)
      commit((current) => ({ ...current, enemyImage: images.enemy.defeated }))
      await delay(BATTLE_TIMINGS.defeatedPose, controller.signal)
      audio.stop('ratDanceMusic')
      audio.play('ratDanceMusic')
      commit((current) => ({
        ...current,
        playerImage: images.survivor.victory,
        enemyImage: images.enemy.defeated,
      }))
      await delay(BATTLE_TIMINGS.survivorVictoryPose, controller.signal)
      commit((current) => ({
        ...current,
        playerImage: images.survivor.dance,
        gameResult: 'win',
      }))
    }

    void runVictory()
      .catch((error: unknown) => {
        if (!isAbortError(error)) throw error
      })
      .finally(() => victoryControllers.current.delete(controller))
  }, [audio, commit, delay, resetComboSpeed, saveBattleResult])

  const checkGameResult = useCallback(() => {
    const current = stateRef.current
    if (current.enemyHp <= 0 && current.gameResult === null) {
      startVictorySequence()
    } else if (current.playerHp <= 0 && current.gameResult === null) {
      saveBattleResult(false)
      abortController(aiController.current)
      commit((battle) => ({ ...battle, gameResult: 'lose' }))
    }
  }, [commit, saveBattleResult, startVictorySequence])

  const handleParrySuccess = useCallback(
    (direction: AttackDirection) => {
      parryCount.current += 1
      audio.play('parry')
      commit((current) => ({
        ...current,
        playerImage:
          direction === 'left' ? images.survivor.parryLeft : images.survivor.parryRight,
        playerState: 'idle',
        enemyAction: { kind: 'stunned' },
        enemyImage: images.enemy.stunned,
      }))
    },
    [audio, commit],
  )

  const handlePlayerHit = useCallback(
    (direction: AttackDirection) => {
      abortController(playerActionController.current)
      abortController(comboController.current)
      comboStep.current = 0
      resetComboSpeed()
      const controller = new AbortController()
      playerActionController.current = controller

      const runHit = async () => {
        commit((current) => ({
          ...current,
          playerImage:
            direction === 'left' ? images.survivor.hitLeft : images.survivor.hitRight,
          playerState: 'stunned',
          playerComboStep: 0,
          playerHp: Math.max(current.playerHp - PLAYER_DAMAGE, 0),
        }))
        checkGameResult()
        await delay(BATTLE_TIMINGS.playerHit, controller.signal)
        if (stateRef.current.gameResult === null) {
          commit((current) => ({
            ...current,
            playerImage: images.survivor.idle,
            playerState: 'idle',
          }))
        }
      }

      void runHit().catch((error: unknown) => {
        if (!isAbortError(error)) throw error
      })
    },
    [checkGameResult, commit, delay, resetComboSpeed],
  )

  const runEnemyAi = useCallback(
    async (controller: AbortController) => {
      await delay(BATTLE_TIMINGS.initialEnemyDelay, controller.signal)

      while (stateRef.current.gameResult === null) {
        if (stateRef.current.enemyAction.kind === 'stunned') {
          await delay(BATTLE_TIMINGS.enemyStunned, controller.signal)
          commit((current) => ({
            ...current,
            enemyAction: { kind: 'idle' },
            enemyImage: images.enemy.idle,
          }))
          continue
        }

        commit((current) => ({
          ...current,
          enemyAction: { kind: 'idle' },
          enemyImage: images.enemy.idle,
          playerState: 'idle',
        }))
        playerDodgeIntent.current = null
        dodgeTiming.current = 'none'

        await delay(
          random.integer(
            BATTLE_TIMINGS.enemyIdleMinimum,
            BATTLE_TIMINGS.enemyIdleMaximumExclusive,
          ),
          controller.signal,
        )

        const direction: AttackDirection = random.boolean() ? 'left' : 'right'
        commit((current) => ({
          ...current,
          enemyAction: { kind: 'preparing', direction },
          enemyImage:
            direction === 'left' ? images.enemy.preparingLeft : images.enemy.preparingRight,
        }))
        await delay(BATTLE_TIMINGS.enemyPreparing, controller.signal)

        commit((current) => ({
          ...current,
          enemyAction: { kind: 'attacking', direction },
          enemyImage:
            direction === 'left' ? images.enemy.attackingLeft : images.enemy.attackingRight,
        }))
        await delay(BATTLE_TIMINGS.enemyAttackWindow, controller.signal)

        const currentAction = stateRef.current.enemyAction
        if (currentAction.kind === 'attacking' && stateRef.current.gameResult === null) {
          const resolution = resolveEnemyAttack(
            currentAction,
            playerDodgeIntent.current,
            dodgeTiming.current,
          )

          if (resolution === 'parry') {
            handleParrySuccess(currentAction.direction)
          } else if (resolution === 'early-dodge') {
            audio.play('enemyAttack')
            comboStep.current = 0
            resetComboSpeed()
            commit((current) => ({ ...current, playerComboStep: 0 }))
          } else {
            audio.play('enemyAttack')
            handlePlayerHit(currentAction.direction)
          }
        }

        playerDodgeIntent.current = null
        dodgeTiming.current = 'none'

        if (!isEnemyStunned(stateRef.current)) {
          commit((current) => ({ ...current, enemyAction: { kind: 'recovering' } }))
          await delay(BATTLE_TIMINGS.enemyRecovering, controller.signal)
        }
      }
    },
    [audio, commit, delay, handleParrySuccess, handlePlayerHit, random, resetComboSpeed],
  )

  const startEnemyAi = useCallback(() => {
    abortController(aiController.current)
    const controller = new AbortController()
    aiController.current = controller
    void runEnemyAi(controller).catch((error: unknown) => {
      if (!isAbortError(error)) throw error
    })
  }, [runEnemyAi])

  useEffect(() => {
    const activeVictoryControllers = victoryControllers.current
    startEnemyAi()
    return () => {
      abortController(aiController.current)
      abortController(playerActionController.current)
      abortController(enemyHitController.current)
      abortController(comboController.current)
      activeVictoryControllers.forEach(abortController)
      activeVictoryControllers.clear()
      audio.stop('ratDanceMusic')
    }
  }, [audio, startEnemyAi])

  const dodge = useCallback(
    (direction: AttackDirection) => {
      const current = stateRef.current
      if (
        current.gameResult !== null ||
        current.enemyHp <= 0 ||
        current.enemyAction.kind === 'defeated' ||
        current.playerState !== 'idle'
      ) {
        return
      }

      abortController(playerActionController.current)
      const controller = new AbortController()
      playerActionController.current = controller
      const dodgeImages =
        direction === 'left' ? images.survivor.dodgeLeft : images.survivor.dodgeRight

      commit((battle) => ({
        ...battle,
        playerImage: random.pick(dodgeImages),
        playerState: 'dodging',
      }))

      const runDodge = async () => {
        await delay(BATTLE_TIMINGS.playerDodge, controller.signal)
        if (stateRef.current.gameResult === null) {
          commit((battle) => ({
            ...battle,
            playerImage: images.survivor.idle,
            playerState: 'idle',
          }))
        }
      }
      void runDodge().catch((error: unknown) => {
        if (!isAbortError(error)) throw error
      })

      dodgeTiming.current =
        current.enemyAction.kind === 'preparing'
          ? 'early'
          : current.enemyAction.kind === 'attacking'
            ? 'perfect'
            : 'none'
      playerDodgeIntent.current = direction
    },
    [commit, delay, random],
  )

  const dodgeLeft = useCallback(() => dodge('left'), [dodge])
  const dodgeRight = useCallback(() => dodge('right'), [dodge])

  const attack = useCallback(() => {
    const current = stateRef.current
    if (
      current.gameResult !== null ||
      current.enemyHp <= 0 ||
      current.enemyAction.kind === 'defeated' ||
      current.playerState !== 'idle'
    ) {
      return
    }

    abortController(comboController.current)
    const enemyIsStunned = current.enemyAction.kind === 'stunned'
    audio.play(enemyIsStunned ? 'strongPunch' : 'punch')

    const attackImage = images.survivor.attacks[comboStep.current % images.survivor.attacks.length]
    comboStep.current += 1
    const currentCombo = comboStep.current
    const currentAttackSpeed = attackSpeed.current
    const highCombo =
      currentCombo > current.highCombo
        ? persistence.updateHighCombo(currentCombo)
        : current.highCombo
    commit((battle) => ({
      ...battle,
      playerImage: attackImage ?? images.survivor.idle,
      playerState: 'attacking',
      playerComboStep: currentCombo,
      highCombo,
    }))

    abortController(playerActionController.current)
    const actionController = new AbortController()
    playerActionController.current = actionController
    const finishAttack = async () => {
      await delay(currentAttackSpeed, actionController.signal)
      if (stateRef.current.playerState === 'attacking') {
        commit((battle) => ({ ...battle, playerState: 'idle' }))
      }
    }
    void finishAttack().catch((error: unknown) => {
      if (!isAbortError(error)) throw error
    })

    attackSpeed.current = nextAttackSpeed(attackSpeed.current, currentCombo)

    const nextComboController = new AbortController()
    comboController.current = nextComboController
    const expireCombo = async () => {
      await delay(BATTLE_TIMINGS.comboTimeout, nextComboController.signal)
      comboStep.current = 0
      resetComboSpeed()
      commit((battle) => ({
        ...battle,
        playerComboStep: 0,
        playerImage: images.survivor.idle,
      }))
    }
    void expireCombo().catch((error: unknown) => {
      if (!isAbortError(error)) throw error
    })

    commit((battle) => ({
      ...battle,
      enemyHp: Math.max(battle.enemyHp - attackDamage(enemyIsStunned), 0),
    }))

    if (enemyIsStunned) {
      abortController(enemyHitController.current)
      const hitController = new AbortController()
      enemyHitController.current = hitController
      const hitImage = images.enemy.hit[comboStep.current % images.enemy.hit.length]
      commit((battle) => ({ ...battle, enemyImage: hitImage ?? images.enemy.stunned }))

      const finishEnemyHit = async () => {
        await delay(BATTLE_TIMINGS.enemyHit, hitController.signal)
        if (stateRef.current.enemyAction.kind === 'stunned') {
          commit((battle) => ({ ...battle, enemyImage: images.enemy.stunned }))
        }
      }
      void finishEnemyHit().catch((error: unknown) => {
        if (!isAbortError(error)) throw error
      })
    }

    checkGameResult()
  }, [audio, checkGameResult, commit, delay, persistence, resetComboSpeed])

  const retry = useCallback(() => {
    abortController(playerActionController.current)
    abortController(enemyHitController.current)
    abortController(comboController.current)
    abortController(aiController.current)
    victoryControllers.current.forEach(abortController)
    victoryControllers.current.clear()
    audio.stop('ratDanceMusic')
    comboStep.current = 0
    parryCount.current = 0
    resultSaved.current = false
    resetComboSpeed()
    dodgeTiming.current = 'none'
    playerDodgeIntent.current = null

    const nextState = createInitialBattleState(
      stateRef.current.round + 1,
      initialEnemyHp,
      persistence.getHighCombo(),
    )
    stateRef.current = nextState
    setRenderedState(nextState)
    startEnemyAi()
  }, [audio, initialEnemyHp, persistence, resetComboSpeed, startEnemyAi])

  return {
    state,
    attack,
    dodgeLeft,
    dodgeRight,
    retry,
  }
}
