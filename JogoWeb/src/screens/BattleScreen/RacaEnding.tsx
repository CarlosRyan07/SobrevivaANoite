import { useState } from 'react'

import { GAME_CODES, type GameCodeId } from '../../codes/gameCodes'
import { EndingToast } from '../../components/EndingToast/EndingToast'
import { WordButton } from '../../components/WordButton/WordButton'
import { images } from '../../services/assetPaths'
import styles from './RacaEnding.module.css'

interface RacaEndingProps {
  rewardCode: GameCodeId | null
  onBackToMenu: () => void
}

export function RacaEnding({ rewardCode, onBackToMenu }: RacaEndingProps) {
  const [showReveal, setShowReveal] = useState(false)

  return (
    <section
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-label="Final: Venceu na Raça"
    >
      {!showReveal && (
        <div className={styles.storyContent} aria-label="História do final Venceu na Raça">
          <p>Não foi uma batalha fácil.</p>
          <p>
            O monstro conseguiu atingir você e, por alguns instantes, parecia que aquela seria
            a sua última noite.
          </p>
          <p>Mas, mesmo sentindo o corpo pesar, você se recusou a cair.</p>
          <p>
            Você respirou fundo, observou os movimentos da criatura e encontrou uma abertura.
          </p>
          <p>
            Reunindo o que ainda restava de suas forças, você conseguiu se sobressair...
            e venceu.
          </p>
          <WordButton type="button" onClick={() => setShowReveal(true)}>
            Continuar
          </WordButton>
        </div>
      )}

      {showReveal && (
        <div className={styles.revealContent}>
          <img className={styles.backdrop} src={images.endings.normalVictory} alt="" />
          <img
            className={styles.victoryImage}
            src={images.endings.normalVictory}
            alt="Sobrevivente celebrando sobre o monstro derrotado com seus amigos"
          />
          <div className={styles.revealShade} />

          <EndingToast label="VOCÊ PEGOU O FINAL:" title="VENCEU NA RAÇA!" />

          <div className={styles.finalCopy}>
            <p className={styles.friendsText}>
              Seus amigos, surpresos com o que acabaram de ver, correm até você e começam
              a comemorar.
            </p>
            <h1>VENCEU NA RAÇA!</h1>
            <p className={styles.summary}>Você conseguiu se sobressair e vencer.</p>
          </div>

          {rewardCode && (
            <p className={styles.codeReward} role="status">
              Você liberou o código:
              <strong>{GAME_CODES[rewardCode].code.toLowerCase()}</strong>
            </p>
          )}

          <div className={styles.actions}>
            <WordButton type="button" onClick={onBackToMenu}>
              Voltar ao Menu
            </WordButton>
          </div>
        </div>
      )}
    </section>
  )
}
