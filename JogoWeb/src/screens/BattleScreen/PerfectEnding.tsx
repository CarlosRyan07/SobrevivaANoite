import { useEffect, useState } from 'react'

import type { GameCodeId } from '../../codes/gameCodes'
import { EndingToast } from '../../components/EndingToast/EndingToast'
import { VictoryUnlocks } from '../../components/VictoryUnlocks/VictoryUnlocks'
import { WordButton } from '../../components/WordButton/WordButton'
import { useAudio } from '../../contexts/audioContextValue'
import { useModalFocus } from '../../hooks/useModalFocus'
import { images } from '../../services/assetPaths'
import styles from './PerfectEnding.module.css'

type PerfectEndingStage = 'intro' | 'pathetic' | 'friends' | 'question' | 'reveal'

interface PerfectEndingProps {
  rewardCode: GameCodeId | null
  onBackToMenu: () => void
}

export function PerfectEnding({ rewardCode, onBackToMenu }: PerfectEndingProps) {
  const audio = useAudio()
  const [stage, setStage] = useState<PerfectEndingStage>('intro')
  const dialogRef = useModalFocus<HTMLElement>(true, stage)

  useEffect(() => () => audio.stop('perfectEnding'), [audio])

  const openSoupQuestion = () => {
    audio.stop('perfectEnding')
    audio.play('perfectEnding')
    setStage('question')
  }

  return (
    <section
      ref={dialogRef}
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-label="Final: Sopa de Lobo"
      tabIndex={-1}
    >
      {stage === 'intro' && (
        <div className={styles.textPage} aria-label="Introdução do final perfeito">
          <p>Contra qualquer lógica — ou qualquer sentido que aquela luta pudesse ter...</p>
          <p>Você não apenas derrotou o lobisomem.</p>
          <p>Você o venceu com uma facilidade assustadora.</p>
          <p>
            Antecipou cada movimento, aparou seus ataques e contra-atacou no momento perfeito.
          </p>
          <p>O monstro caiu sem conseguir acertar você uma única vez.</p>
          <WordButton type="button" onClick={() => setStage('pathetic')}>
            Continuar
          </WordButton>
        </div>
      )}

      {stage === 'pathetic' && (
        <div className={styles.imageStoryPage} aria-label="O pensamento do sobrevivente">
          <img
            className={styles.storyImage}
            src={images.endings.pathetic}
            alt="Sobrevivente olhando com desprezo para o lobisomem derrotado"
          />
          <div className={styles.storyCopy}>
            <p>
              Enquanto observava o lobisomem derrotado no chão, apenas um pensamento passou pela sua
              cabeça...
            </p>
            <strong>— É só isso?</strong>
            <WordButton type="button" onClick={() => setStage('friends')}>
              Continuar
            </WordButton>
          </div>
        </div>
      )}

      {stage === 'friends' && (
        <div className={styles.textPage} aria-label="Conversa com os amigos">
          <p>
            Seus amigos se aproximam lentamente, chocados com o que estavam presenciando.
          </p>
          <p>Eles olham para o monstro caído e depois para você, completamente ileso.</p>
          <strong>— O que aconteceu aqui?</strong>
          <p>Você olha tranquilamente para todos e responde:</p>
          <strong>— Relaxa, galera ta tudo bem...</strong>
          <strong>Hoje vai ter sopa.</strong>
          <WordButton type="button" onClick={openSoupQuestion}>
            Continuar
          </WordButton>
        </div>
      )}

      {stage === 'question' && (
        <div className={styles.textPage} aria-label="A pergunta sobre a sopa">
          <p>Seu amigo, ainda tentando entender, pergunta:</p>
          <strong>— Sopa? Sopa de quê mesmo?</strong>
          <p>Você aponta para o lobisomem caído e responde:</p>
          <WordButton type="button" onClick={() => setStage('reveal')}>
            Sopa de lobo!
          </WordButton>
        </div>
      )}

      {stage === 'reveal' && (
        <div className={styles.revealContent}>
          <img className={styles.backdrop} src={images.endings.perfectVictory} alt="" />
          <img
            className={styles.perfectImage}
            src={images.endings.perfectVictory}
            alt="Sobrevivente vitorioso enquanto seu amigo observa a cena, chocado"
          />
          <div className={styles.revealShade} />

          <EndingToast label="VOCÊ PEGOU O FINAL:" title="SOPA DE LOBO!" />

          <div className={styles.finalCopy}>
            <h1>SOPA DE LOBO!</h1>
            <p>Você venceu sem receber nenhum golpe e realizou pelo menos dois parries.</p>
          </div>

          <VictoryUnlocks rewardCode={rewardCode} className={styles.codeReward} />

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
