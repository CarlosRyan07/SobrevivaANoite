import {
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'

import { ENEMY_MAX_HP, PLAYER_MAX_HP } from '../../battle/battleConstants'
import { comboColor } from '../../battle/battleEngine'
import { battleActionForKey } from '../../battle/battleKeyboard'
import { useBattleGame, type BattleGameOptions } from '../../battle/useBattleGame'
import { HpBar } from '../../components/HpBar/HpBar'
import { WordButton } from '../../components/WordButton/WordButton'
import { useAudio } from '../../contexts/audioContextValue'
import { useModalFocus } from '../../hooks/useModalFocus'
import { gamePersistence } from '../../persistence/gamePersistence'
import { images, preloadImages } from '../../services/assetPaths'
import styles from './BattleScreen.module.css'
import { PerfectEnding } from './PerfectEnding'
import { PidaoEnding } from './PidaoEnding'
import { RacaEnding } from './RacaEnding'

interface BattleScreenProps {
  onBackToMenu: () => void
  gameOptions?: BattleGameOptions
}

type ComboStyle = CSSProperties & { '--combo-color': string }

export function BattleScreen({ onBackToMenu, gameOptions }: BattleScreenProps) {
  const audio = useAudio()
  const persistence = gameOptions?.persistence ?? gamePersistence
  const [tutorialRequiredAtMount] = useState(() => !persistence.hasSeenBattleTutorial())
  const [startPromptRequiredAtMount] = useState(() => !audio.hasPrepared('battleMusic'))
  const [showTutorial, setShowTutorial] = useState(
    () => tutorialRequiredAtMount || startPromptRequiredAtMount,
  )
  const [firstTutorial, setFirstTutorial] = useState(tutorialRequiredAtMount)
  const { state, attack, dodgeLeft, dodgeRight, retry, start, pause } = useBattleGame(audio, {
    ...gameOptions,
    startPaused: tutorialRequiredAtMount || startPromptRequiredAtMount,
  })
  const [showEndingStory, setShowEndingStory] = useState(false)
  const comboStyle: ComboStyle = { '--combo-color': comboColor(state.playerComboStep) }
  const victorySequenceActive = state.enemyAction.kind === 'defeated'
  const perfectVictory = state.gameResult === 'win' && state.victoryEnding === 'perfect'
  const pidaoVictory = state.gameResult === 'win' && state.victoryEnding === 'pidao'
  const racaVictory = state.gameResult === 'win' && state.victoryEnding === 'raca'
  const hasStoryEnding = perfectVictory || pidaoVictory || racaVictory
  const tutorialDialogRef = useModalFocus<HTMLElement>(showTutorial, firstTutorial)
  const resultDialogRef = useModalFocus<HTMLDivElement>(
    state.gameResult !== null && !showEndingStory,
    state.gameResult,
  )

  const handleRetry = useCallback(() => {
    setShowEndingStory(false)
    retry()
  }, [retry])

  const handleProceedToEnding = useCallback(() => {
    audio.stop('ratDanceMusic')
    setShowEndingStory(true)
  }, [audio])

  const handleStartBattle = useCallback(() => {
    persistence.markBattleTutorialSeen()
    audio.play('buttonClick')
    setShowTutorial(false)
    setFirstTutorial(false)
    start()
  }, [audio, persistence, start])

  const handleOpenTutorial = useCallback(() => {
    audio.play('buttonClick')
    pause()
    setFirstTutorial(false)
    setShowTutorial(true)
  }, [audio, pause])

  const handlePointerAttack = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (showTutorial) return
      if (event.pointerType !== 'mouse' || event.button !== 0) return
      if (event.target instanceof Element && event.target.closest('button')) return
      attack()
    },
    [attack, showTutorial],
  )

  useEffect(() => {
    preloadImages([
      images.cabin,
      images.enemy.idle,
      images.enemy.preparingLeft,
      images.enemy.preparingRight,
      images.enemy.attackingLeft,
      images.enemy.attackingRight,
      images.enemy.stunned,
      images.enemy.defeated,
      ...images.enemy.hit,
      images.survivor.idle,
      ...images.survivor.attacks,
      ...images.survivor.dodgeLeft,
      ...images.survivor.dodgeRight,
      images.survivor.hitLeft,
      images.survivor.hitRight,
      images.survivor.parryLeft,
      images.survivor.parryRight,
      images.survivor.victory,
      images.survivor.dance,
    ])
  }, [])

  useEffect(() => {
    if (state.gameResult !== 'win') return

    if (state.victoryEnding === 'perfect') {
      preloadImages([images.endings.pathetic, images.endings.perfectVictory])
    } else if (state.victoryEnding === 'pidao') {
      preloadImages([
        images.endings.woundedVictory,
        images.endings.woundedArm,
        images.endings.pidao,
      ])
    } else if (state.victoryEnding === 'raca') {
      preloadImages([images.endings.normalVictory])
    }
  }, [state.gameResult, state.victoryEnding])

  useEffect(() => {
    const handleBattleKey = (event: KeyboardEvent) => {
      if (showTutorial) return
      if (event.altKey || event.ctrlKey || event.metaKey || event.repeat) return
      if (event.target instanceof Element && event.target.closest('button, input, textarea, select')) {
        return
      }

      const action = battleActionForKey(event.key, event.code)
      if (!action) return

      event.preventDefault()
      if (action === 'left') dodgeLeft()
      else if (action === 'right') dodgeRight()
      else attack()
    }

    window.addEventListener('keydown', handleBattleKey)
    return () => window.removeEventListener('keydown', handleBattleKey)
  }, [attack, dodgeLeft, dodgeRight, showTutorial])

  return (
    <div className={styles.root} aria-label="Modo batalha" onPointerDown={handlePointerAttack}>
      <img
        className={styles.background}
        src={images.cabin}
        alt={showTutorial ? '' : 'Fundo da Cabana'}
      />

      {state.highCombo > 0 && (
        <div
          className={styles.highScore}
          aria-label={`Recorde de combo ${state.highCombo}`}
          aria-hidden={showTutorial}
        >
          RECORDE: {state.highCombo}
        </div>
      )}

      {state.gameResult === null && !victorySequenceActive && (
        <button
          className={styles.helpButton}
          type="button"
          onClick={handleOpenTutorial}
          aria-label="Como jogar"
          aria-hidden={showTutorial}
          tabIndex={showTutorial ? -1 : 0}
          hidden={showTutorial}
          title="Ver controles e dica de parry"
        >
          ?
        </button>
      )}

      {state.enemyHp > 0 && state.gameResult !== 'win' && (
        <div className={styles.topUi} aria-hidden={showTutorial}>
          <HpBar name="Psicopata" currentHp={state.enemyHp} maxHp={ENEMY_MAX_HP} />
        </div>
      )}

      {!victorySequenceActive && state.playerComboStep > 1 && (
        <div
          className={styles.combo}
          style={comboStyle}
          aria-label={`Combo ${state.playerComboStep}`}
          aria-hidden={showTutorial}
        >
          <strong>{state.playerComboStep}x</strong>
          <span>Combo</span>
        </div>
      )}

      <div className={styles.centerStage} aria-hidden={showTutorial}>
        <img className={styles.enemy} src={state.enemyImage} alt="Psicopata" />
        <img className={styles.survivor} src={state.playerImage} alt="Sobrevivente" />
      </div>

      {state.gameResult === null && !victorySequenceActive && (
        <div
          className={styles.bottomUi}
          aria-hidden={showTutorial}
          inert={showTutorial ? true : undefined}
        >
          <HpBar name="Sobrevivente" currentHp={state.playerHp} maxHp={PLAYER_MAX_HP} />
          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <kbd className={styles.controlHint}>A</kbd>
              <button
                className={styles.dodgeButton}
                type="button"
                onClick={dodgeLeft}
                aria-label="Esquivar Esquerda"
                aria-keyshortcuts="ArrowLeft A"
                title="Seta esquerda ou A"
              >
                <span aria-hidden="true">←</span>
              </button>
            </div>
            <div className={styles.controlGroup}>
              <kbd className={styles.controlHint}>ESPAÇO</kbd>
              <button
                className={styles.attackButton}
                type="button"
                onClick={attack}
                aria-label="Atacar"
                aria-keyshortcuts="Space"
                title="Barra de espaço ou clique na tela"
              >
                👊🏻
              </button>
            </div>
            <div className={styles.controlGroup}>
              <kbd className={styles.controlHint}>D</kbd>
              <button
                className={styles.dodgeButton}
                type="button"
                onClick={dodgeRight}
                aria-label="Esquivar Direita"
                aria-keyshortcuts="ArrowRight D"
                title="Seta direita ou D"
              >
                <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {state.gameResult === 'lose' && (
        <div
          ref={resultDialogRef}
          className={styles.loseOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Derrota"
          tabIndex={-1}
        >
          <h1>VOCÊ MORREU!</h1>
          <WordButton type="button" onClick={retry}>Tentar Novamente</WordButton>
          <WordButton type="button" onClick={onBackToMenu}>Voltar ao Menu</WordButton>
        </div>
      )}

      {pidaoVictory && showEndingStory && (
        <PidaoEnding
          rewardCode={state.rewardCode}
          onBackToMenu={onBackToMenu}
        />
      )}

      {perfectVictory && showEndingStory && (
        <PerfectEnding
          rewardCode={state.rewardCode}
          onBackToMenu={onBackToMenu}
        />
      )}

      {racaVictory && showEndingStory && (
        <RacaEnding
          rewardCode={state.rewardCode}
          onBackToMenu={onBackToMenu}
        />
      )}

      {state.gameResult === 'win' && !showEndingStory && (
        <div
          ref={resultDialogRef}
          className={styles.winOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Vitória"
          tabIndex={-1}
        >
          <h1>VOCÊ VENCEU!</h1>
          <div className={`${styles.winActions} ${hasStoryEnding ? styles.storyChoiceActions : ''}`}>
            {hasStoryEnding && (
              <WordButton
                className={styles.proceedButton}
                type="button"
                onClick={handleProceedToEnding}
              >
                Prosseguir
              </WordButton>
            )}
            <WordButton
              className={hasStoryEnding ? styles.storyRetryButton : undefined}
              type="button"
              onClick={handleRetry}
            >
              Tentar Novamente
            </WordButton>
            <WordButton
              className={hasStoryEnding ? styles.storyMenuButton : undefined}
              type="button"
              onClick={onBackToMenu}
            >
              Voltar ao Menu
            </WordButton>
          </div>
        </div>
      )}

      {showTutorial && (
        <section
          ref={tutorialDialogRef}
          className={styles.tutorialOverlay}
          role="dialog"
          aria-modal="true"
          aria-label="Como jogar a batalha"
          tabIndex={-1}
        >
          <div className={styles.tutorialPanel}>
            <h1>COMO JOGAR</h1>
            <p className={styles.tutorialIntro}>Você pode utilizar:</p>

            <div className={styles.tutorialOptions}>
              <div className={styles.tutorialOption}>
                <span className={styles.optionTitle}>OPÇÃO 1</span>
                <div className={styles.keyLine}>
                  <kbd>←</kbd><kbd>→</kbd><span>para esquivar</span>
                </div>
                <div className={styles.keyLine}>
                  <kbd className={styles.wideKey}>CLIQUE DO MOUSE</kbd><span>para atacar</span>
                </div>
              </div>

              <span className={styles.orLabel}>OU</span>

              <div className={styles.tutorialOption}>
                <span className={styles.optionTitle}>OPÇÃO 2</span>
                <div className={styles.keyLine}>
                  <kbd>A</kbd><kbd>D</kbd><span>para esquivar</span>
                </div>
                <div className={styles.keyLine}>
                  <kbd className={styles.wideKey}>ESPAÇO</kbd><span>para atacar</span>
                </div>
              </div>
            </div>

            <p className={styles.parryTip}>
              Se você esquivar no momento correto, irá realizar um <strong>parry</strong>,
              deixando o inimigo vulnerável.
            </p>
            <p className={styles.parryTip}>
            <strong>Dica</strong>: Se esquive na direção que o inimigo levantar a mão.
            </p>
            <p className={styles.parryTip}>
               Recomendo usar a <strong>opção 2</strong>.
            </p>
            <WordButton type="button" onClick={handleStartBattle} data-modal-autofocus>
              {firstTutorial ? 'Começar Batalha' : 'Continuar Batalha'}
            </WordButton>
          </div>
        </section>
      )}

    </div>
  )
}
