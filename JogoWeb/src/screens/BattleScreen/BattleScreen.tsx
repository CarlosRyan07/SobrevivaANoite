import { useEffect } from 'react'

import { ENEMY_MAX_HP, PLAYER_MAX_HP } from '../../battle/battleConstants'
import { comboColor } from '../../battle/battleEngine'
import { dodgeDirectionForKey } from '../../battle/battleKeyboard'
import { useBattleGame, type BattleGameOptions } from '../../battle/useBattleGame'
import { HpBar } from '../../components/HpBar/HpBar'
import { useAudio } from '../../contexts/audioContextValue'
import { images, preloadImages } from '../../services/assetPaths'
import styles from './BattleScreen.module.css'

interface BattleScreenProps {
  onBackToMenu: () => void
  gameOptions?: BattleGameOptions
}

type ComboStyle = React.CSSProperties & { '--combo-color': string }

export function BattleScreen({ onBackToMenu, gameOptions }: BattleScreenProps) {
  const audio = useAudio()
  const { state, attack, dodgeLeft, dodgeRight, retry } = useBattleGame(audio, gameOptions)
  const comboStyle: ComboStyle = { '--combo-color': comboColor(state.playerComboStep) }
  const victorySequenceActive = state.enemyAction.kind === 'defeated'

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
    const handleDodgeKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey) return

      const direction = dodgeDirectionForKey(event.key)
      if (!direction) return

      event.preventDefault()
      if (direction === 'left') dodgeLeft()
      else dodgeRight()
    }

    window.addEventListener('keydown', handleDodgeKey)
    return () => window.removeEventListener('keydown', handleDodgeKey)
  }, [dodgeLeft, dodgeRight])

  return (
    <div className={styles.root} aria-label="Modo batalha">
      <img className={styles.background} src={images.cabin} alt="Fundo da Cabana" />

      {state.highCombo > 0 && (
        <div className={styles.highScore} aria-label={`Recorde de combo ${state.highCombo}`}>
          RECORDE: {state.highCombo}
        </div>
      )}

      {state.gameResult !== 'win' && (
        <div className={styles.topUi}>
          <HpBar name="Psicopata" currentHp={state.enemyHp} maxHp={ENEMY_MAX_HP} />
        </div>
      )}

      {!victorySequenceActive && state.playerComboStep > 1 && (
        <div className={styles.combo} style={comboStyle} aria-label={`Combo ${state.playerComboStep}`}>
          <strong>{state.playerComboStep}x</strong>
          <span>Combo</span>
        </div>
      )}

      <div className={styles.centerStage}>
        <img className={styles.enemy} src={state.enemyImage} alt="Psicopata" />
        <img className={styles.survivor} src={state.playerImage} alt="Sobrevivente" />
      </div>

      {state.gameResult === null && !victorySequenceActive && (
        <div className={styles.bottomUi}>
          <HpBar name="Sobrevivente" currentHp={state.playerHp} maxHp={PLAYER_MAX_HP} />
          <div className={styles.controls}>
            <button
              type="button"
              onClick={dodgeLeft}
              aria-label="Esquivar Esquerda"
              aria-keyshortcuts="ArrowLeft A"
              title="Seta esquerda ou A"
            >
              {'Esquivar\nEsquerda'}
            </button>
            <button className={styles.attackButton} type="button" onClick={attack} aria-label="Atacar">
              👊🏻
            </button>
            <button
              type="button"
              onClick={dodgeRight}
              aria-label="Esquivar Direita"
              aria-keyshortcuts="ArrowRight D"
              title="Seta direita ou D"
            >
              {'Esquivar\nDireita'}
            </button>
          </div>
        </div>
      )}

      {state.gameResult === 'lose' && (
        <div className={styles.loseOverlay} role="dialog" aria-modal="true">
          <h1>VOCÊ MORREU!</h1>
          <button type="button" onClick={retry}>Tentar Novamente</button>
          <button type="button" onClick={onBackToMenu}>Voltar ao Menu</button>
        </div>
      )}

      {state.gameResult === 'win' && (
        <div className={styles.winOverlay}>
          <h1>VOCÊ VENCEU!</h1>
          <div className={styles.winActions}>
            <button type="button" onClick={retry}>Tentar Novamente</button>
            <button type="button" onClick={onBackToMenu}>Voltar ao Menu</button>
          </div>
        </div>
      )}
    </div>
  )
}
