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
  BATTLE_MUSIC_VOLUME,
  BATTLE_TIMINGS,
  BERSERK_ATTACK_SPEED_MULTIPLIER,
  BERSERK_MUSIC_VOLUME,
  BERSERK_PLAYER_DAMAGE,
  DEFAULT_ATTACK_SPEED_PROFILE,
  LIGEIRINHO_ATTACK_SPEED_PROFILE,
  PLAYER_DAMAGE,
  HARD_ENEMY_MAX_HP,
  HARD_PARRIES_TO_STUN,
} from './battleConstants'
import {
  attackDamage,
  createInitialBattleState,
  nextAttackSpeed,
  resolveEnemyAttack,
  victoryEndingForPerformance,
} from './battleEngine'
import type { AttackDirection, BattleDifficulty, BattleState, DodgeTiming } from './battleTypes'

type DelayFunction = (milliseconds: number, signal: AbortSignal) => Promise<void>

export interface BattleGameOptions {
  random?: RandomSource
  delay?: DelayFunction
  initialEnemyHp?: number
  initialPlayerHp?: number
  initialParryCount?: number
  difficulty?: BattleDifficulty
  startPaused?: boolean
  enemyAiEnabled?: boolean
  persistence?: GamePersistencePort
}

function isEnemyStunned(state: BattleState): boolean {
  return state.enemyAction.kind === 'stunned'
}

function idleEnemyImage(state: BattleState): string {
  return state.isBerserk ? images.enemy.berserkIdle : images.enemy.idle
}

export function useBattleGame(audio: AudioService, options: BattleGameOptions = {}) {
  const random = options.random ?? defaultRandom
  const delay = options.delay ?? abortableDelay
  const initialEnemyHp = options.initialEnemyHp
  const difficulty = options.difficulty ?? 'normal'
  const enemyMaxHp = difficulty === 'hard' ? HARD_ENEMY_MAX_HP : undefined
  const initialPlayerHp = options.initialPlayerHp
  const initialParryCount = Math.max(Math.trunc(options.initialParryCount ?? 0), 0)
  const startPaused = options.startPaused ?? false
  const enemyAiEnabled = options.enemyAiEnabled ?? true
  const persistence = options.persistence ?? gamePersistence
  const [attackSpeedProfile] = useState(() =>
    persistence.isCodeActive('ligeirinho')
      ? LIGEIRINHO_ATTACK_SPEED_PROFILE
      : DEFAULT_ATTACK_SPEED_PROFILE,
  )
  const [state, setRenderedState] = useState<BattleState>(() =>
    createInitialBattleState(
      0,
      initialEnemyHp ?? enemyMaxHp,
      persistence.getHighCombo(),
      initialPlayerHp,
      difficulty,
    ),
  )
  const stateRef = useRef(state)
  const aiController = useRef<AbortController | null>(null)
  const playerActionController = useRef<AbortController | null>(null)
  const enemyHitController = useRef<AbortController | null>(null)
  const hardParryController = useRef<AbortController | null>(null)
  const comboController = useRef<AbortController | null>(null)
  const victoryControllers = useRef(new Set<AbortController>())
  const playerDodgeIntent = useRef<AttackDirection | null>(null)
  const dodgeTiming = useRef<DodgeTiming>('none')
  const comboStep = useRef(0)
  const parryCount = useRef(initialParryCount)
  const hitsReceived = useRef(0)
  const resultSaved = useRef(false)
  const attackSpeed = useRef(attackSpeedProfile.initial)
  const battleStarted = useRef(!startPaused)
  const battleMusicStarted = useRef(false)

  const commit = useCallback((update: (current: BattleState) => BattleState) => {
    const nextState = update(stateRef.current)
    stateRef.current = nextState
    setRenderedState(nextState)
  }, [])

  const resetComboSpeed = useCallback(() => {
    attackSpeed.current = attackSpeedProfile.initial
  }, [attackSpeedProfile])

  const startBattleMusic = useCallback(() => {
    if (battleMusicStarted.current) return
    audio.play('battleMusic', {
      loop: true,
      volume: BATTLE_MUSIC_VOLUME,
      resumePrepared: true,
    })
    battleMusicStarted.current = true
  }, [audio])

  const fadeBattleMusic = useCallback(() => {
    if (!battleMusicStarted.current) return
    battleMusicStarted.current = false
    audio.fadeOut('battleMusic', { duration: BATTLE_TIMINGS.battleMusicFadeOut })
  }, [audio])

  const startBerserk = useCallback(() => {
    if (stateRef.current.isBerserk || stateRef.current.gameResult !== null) return

    abortController(playerActionController.current)
    abortController(comboController.current)
    abortController(hardParryController.current)
    audio.fadeOut('battleMusic', { duration: BATTLE_TIMINGS.berserkBattleMusicFadeOut })
    commit((current) => ({
      ...current,
      isBerserk: true,
      berserkAuraActive: false,
      enemyAction: { kind: 'berserk' },
      enemyImage: images.enemy.berserkActivation,
      playerImage: images.survivor.idle,
      playerState: 'idle',
    }))
    audio.play('berserkScream', {
      nearEndSeconds: 0.4,
      onNearEnd: () => {
        if (stateRef.current.gameResult === null && stateRef.current.isBerserk) {
          commit((current) => ({
            ...current,
            berserkAuraActive: true,
            enemyImage: images.enemy.berserkIdle,
          }))
        }
      },
      onEnded: () => {
        if (stateRef.current.gameResult !== null || !stateRef.current.isBerserk) return
        audio.play('berserkMusic', { loop: true, volume: BERSERK_MUSIC_VOLUME })
        commit((current) => ({
          ...current,
          berserkAuraActive: true,
          enemyAction: { kind: 'idle' },
          enemyImage: images.enemy.berserkIdle,
        }))
      },
    })
  }, [audio, commit])

  const saveBattleResult = useCallback(
    (wasVictory: boolean) => {
      if (resultSaved.current) return
      resultSaved.current = true
      persistence.saveMatch({
        gameMode: 'Batalha',
        wasVictory,
        finalPlayerHp: stateRef.current.playerHp,
        parryCount: parryCount.current,
        difficulty: stateRef.current.difficulty,
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
    fadeBattleMusic()
    saveBattleResult(true)
    const rewardCode = persistence.discoverCode('ligeirinho') ? 'ligeirinho' : null
    const victoryEnding = victoryEndingForPerformance({
      playerHp: stateRef.current.playerHp,
      parryCount: parryCount.current,
      hitsReceived: hitsReceived.current,
    })
    persistence.discoverEnding(victoryEnding)
    audio.stop('ratDanceMusic')
    audio.stop('pidaoEnding')
    audio.stop('perfectEnding')
    audio.stop('berserkScream')
    audio.fadeOut('berserkMusic', { duration: BATTLE_TIMINGS.battleMusicFadeOut })
    audio.play('ratDanceMusic', { prepareMuted: true })

    const controller = new AbortController()
    victoryControllers.current.add(controller)

    commit((current) => ({
      ...current,
      enemyHp: 0,
      enemyAction: { kind: 'defeated' },
      enemyImage: images.enemy.stunned,
      playerState: 'idle',
      playerComboStep: 0,
      rewardCode,
      victoryEnding,
    }))

    const runVictory = async () => {
      await delay(BATTLE_TIMINGS.stunnedBeforeDefeat, controller.signal)
      commit((current) => ({ ...current, enemyImage: images.enemy.defeated }))
      await delay(BATTLE_TIMINGS.defeatedPose, controller.signal)
      audio.play('ratDanceMusic', { resumePrepared: true })
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
  }, [
    audio,
    commit,
    delay,
    fadeBattleMusic,
    persistence,
    resetComboSpeed,
    saveBattleResult,
  ])

  const checkGameResult = useCallback(() => {
    const current = stateRef.current
    if (current.enemyHp <= 0 && current.gameResult === null) {
      startVictorySequence()
    } else if (current.playerHp <= 0 && current.gameResult === null) {
      fadeBattleMusic()
      audio.fadeOut('berserkMusic', { duration: BATTLE_TIMINGS.battleMusicFadeOut })
      audio.stop('berserkScream')
      saveBattleResult(false)
      abortController(aiController.current)
      commit((battle) => ({ ...battle, gameResult: 'lose' }))
    }
  }, [audio, commit, fadeBattleMusic, saveBattleResult, startVictorySequence])

  const handleParrySuccess = useCallback(
    (direction: AttackDirection) => {
      parryCount.current += 1
      audio.play('parry')
      const hardMode = stateRef.current.difficulty === 'hard'
      const nextGauge = hardMode
        ? Math.min(stateRef.current.parryGauge + 1, HARD_PARRIES_TO_STUN)
        : stateRef.current.parryGauge
      commit((current) => ({
        ...current,
        playerImage:
          direction === 'left' ? images.survivor.parryLeft : images.survivor.parryRight,
        playerState: 'idle',
        enemyAction: hardMode && nextGauge < HARD_PARRIES_TO_STUN ? { kind: 'idle' } : { kind: 'stunned' },
        enemyImage: images.enemy.stunned,
        parryGauge: nextGauge,
      }))

      if (hardMode && nextGauge < HARD_PARRIES_TO_STUN) {
        abortController(hardParryController.current)
        const controller = new AbortController()
        hardParryController.current = controller
        void delay(BATTLE_TIMINGS.hardParryReaction, controller.signal)
          .then(() => {
            if (
              stateRef.current.gameResult === null &&
              stateRef.current.enemyImage === images.enemy.stunned
            ) {
              commit((current) => ({ ...current, enemyImage: idleEnemyImage(current) }))
            }
          })
          .catch((error: unknown) => {
            if (!isAbortError(error)) throw error
          })
      }
    },
    [audio, commit, delay],
  )

  const handlePlayerHit = useCallback(
    (direction: AttackDirection) => {
      hitsReceived.current += 1
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
          playerHp: Math.max(
            current.playerHp - (current.isBerserk ? BERSERK_PLAYER_DAMAGE : PLAYER_DAMAGE),
            0,
          ),
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
        if (stateRef.current.enemyAction.kind === 'berserk') {
          await delay(100, controller.signal)
          continue
        }

        if (stateRef.current.enemyAction.kind === 'stunned') {
          if (stateRef.current.difficulty === 'hard') {
            for (let gauge = HARD_PARRIES_TO_STUN - 1; gauge >= 0; gauge -= 1) {
              await delay(BATTLE_TIMINGS.hardParryGaugeStep, controller.signal)
              commit((current) => ({ ...current, parryGauge: gauge }))
            }
            // Mantém a barra vazia visível pelo último segundo antes de o monstro reagir.
            await delay(BATTLE_TIMINGS.hardParryGaugeStep, controller.signal)
          } else {
            await delay(BATTLE_TIMINGS.enemyStunned, controller.signal)
          }
          if (stateRef.current.enemyAction.kind !== 'stunned') continue
          commit((current) => ({
            ...current,
            enemyAction: { kind: 'idle' },
            enemyImage: idleEnemyImage(current),
          }))
          continue
        }

        commit((current) => ({
          ...current,
          enemyAction: { kind: 'idle' },
          enemyImage: idleEnemyImage(current),
          playerState: 'idle',
        }))
        playerDodgeIntent.current = null
        dodgeTiming.current = 'none'

        const speedMultiplier = stateRef.current.isBerserk
          ? BERSERK_ATTACK_SPEED_MULTIPLIER
          : 1
        await delay(
          random.integer(
            BATTLE_TIMINGS.enemyIdleMinimum,
            BATTLE_TIMINGS.enemyIdleMaximumExclusive,
          ) * speedMultiplier,
          controller.signal,
        )
        if (stateRef.current.isBerserk && stateRef.current.enemyImage === images.enemy.berserkActivation) continue

        const direction: AttackDirection = random.boolean() ? 'left' : 'right'
        const sequence = random.pick(images.enemy.attackSequences)
        commit((current) => ({
          ...current,
          enemyAction: { kind: 'preparing', direction },
          enemyImage:
            direction === 'left' ? sequence.preparingLeft : sequence.preparingRight,
        }))
        await delay(sequence.preparingDuration * speedMultiplier, controller.signal)
        if (stateRef.current.isBerserk && stateRef.current.enemyImage === images.enemy.berserkActivation) continue

        commit((current) => ({
          ...current,
          enemyAction: { kind: 'attacking', direction },
          enemyImage:
            direction === 'left' ? sequence.attackingLeft : sequence.attackingRight,
        }))
        await delay(BATTLE_TIMINGS.enemyAttackWindow * speedMultiplier, controller.signal)
        if (stateRef.current.isBerserk && stateRef.current.enemyImage === images.enemy.berserkActivation) continue

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

        if (
          !isEnemyStunned(stateRef.current) &&
          stateRef.current.enemyImage !== images.enemy.berserkActivation
        ) {
          commit((current) => ({ ...current, enemyAction: { kind: 'recovering' } }))
          await delay(BATTLE_TIMINGS.enemyRecovering * speedMultiplier, controller.signal)
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
    if (battleStarted.current) {
      startBattleMusic()
      if (enemyAiEnabled) startEnemyAi()
    }
    return () => {
      abortController(aiController.current)
      abortController(playerActionController.current)
      abortController(enemyHitController.current)
      abortController(hardParryController.current)
      abortController(comboController.current)
      activeVictoryControllers.forEach(abortController)
      activeVictoryControllers.clear()
      battleMusicStarted.current = false
      audio.stop('battleMusic')
      audio.stop('ratDanceMusic')
      audio.stop('pidaoEnding')
      audio.stop('perfectEnding')
      audio.stop('berserkScream')
      audio.stop('berserkMusic')
    }
  }, [audio, enemyAiEnabled, startBattleMusic, startEnemyAi])

  const start = useCallback(() => {
    if (battleStarted.current || stateRef.current.gameResult !== null) return
    battleStarted.current = true
    startBattleMusic()
    if (enemyAiEnabled) startEnemyAi()
  }, [enemyAiEnabled, startBattleMusic, startEnemyAi])

  const pause = useCallback(() => {
    if (!battleStarted.current || stateRef.current.gameResult !== null) return
    battleStarted.current = false
    abortController(aiController.current)
    abortController(playerActionController.current)
    abortController(enemyHitController.current)
    abortController(hardParryController.current)
    abortController(comboController.current)
    comboStep.current = 0
    resetComboSpeed()
    playerDodgeIntent.current = null
    dodgeTiming.current = 'none'
    commit((current) => ({
      ...current,
      playerImage: images.survivor.idle,
      playerState: 'idle',
      enemyAction: { kind: 'idle' },
      enemyImage: idleEnemyImage(current),
      playerComboStep: 0,
    }))
  }, [commit, resetComboSpeed])

  const dodge = useCallback(
    (direction: AttackDirection) => {
      const current = stateRef.current
      if (
        !battleStarted.current ||
        current.gameResult !== null ||
        current.enemyHp <= 0 ||
        current.enemyAction.kind === 'defeated' ||
        current.enemyAction.kind === 'berserk' ||
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
      !battleStarted.current ||
      current.gameResult !== null ||
      current.enemyHp <= 0 ||
      current.enemyAction.kind === 'defeated' ||
      current.enemyAction.kind === 'berserk' ||
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

    attackSpeed.current = nextAttackSpeed(
      attackSpeed.current,
      currentCombo,
      attackSpeedProfile,
    )

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

    const nextEnemyHp = Math.max(current.enemyHp - attackDamage(enemyIsStunned), 0)
    commit((battle) => ({
      ...battle,
      enemyHp: nextEnemyHp,
    }))

    const shouldActivateBerserk =
      current.difficulty === 'hard' &&
      !current.isBerserk &&
      current.enemyHp > current.enemyMaxHp / 2 &&
      nextEnemyHp <= current.enemyMaxHp / 2
    if (shouldActivateBerserk) {
      startBerserk()
    }

    if (enemyIsStunned && !shouldActivateBerserk) {
      abortController(enemyHitController.current)
      const hitController = new AbortController()
      enemyHitController.current = hitController
      const hitImage = images.enemy.hit[comboStep.current % images.enemy.hit.length]
      commit((battle) => ({
        ...battle,
        enemyImage: hitImage ?? images.enemy.stunned,
      }))

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
  }, [
    attackSpeedProfile,
    audio,
    checkGameResult,
    commit,
    delay,
    persistence,
    resetComboSpeed,
    startBerserk,
  ])

  const retry = useCallback(() => {
    abortController(playerActionController.current)
    abortController(enemyHitController.current)
    abortController(hardParryController.current)
    abortController(comboController.current)
    abortController(aiController.current)
    victoryControllers.current.forEach(abortController)
    victoryControllers.current.clear()
    audio.stop('ratDanceMusic')
    audio.stop('pidaoEnding')
    audio.stop('perfectEnding')
    audio.stop('berserkScream')
    audio.stop('berserkMusic')
    comboStep.current = 0
    parryCount.current = initialParryCount
    hitsReceived.current = 0
    resultSaved.current = false
    resetComboSpeed()
    dodgeTiming.current = 'none'
    playerDodgeIntent.current = null

    const nextState = createInitialBattleState(
      stateRef.current.round + 1,
      initialEnemyHp ?? enemyMaxHp,
      persistence.getHighCombo(),
      initialPlayerHp,
      difficulty,
    )
    stateRef.current = nextState
    setRenderedState(nextState)
    startBattleMusic()
    if (enemyAiEnabled) startEnemyAi()
  }, [
    audio,
    enemyAiEnabled,
    difficulty,
    enemyMaxHp,
    initialEnemyHp,
    initialParryCount,
    initialPlayerHp,
    persistence,
    resetComboSpeed,
    startBattleMusic,
    startEnemyAi,
  ])

  return {
    state,
    attack,
    dodgeLeft,
    dodgeRight,
    retry,
    start,
    pause,
  }
}
