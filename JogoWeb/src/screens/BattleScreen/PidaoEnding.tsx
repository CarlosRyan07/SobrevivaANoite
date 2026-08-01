import { useEffect, useState } from 'react'

import { GAME_CODES, type GameCodeId } from '../../codes/gameCodes'
import { WordButton } from '../../components/WordButton/WordButton'
import { useAudio } from '../../contexts/audioContextValue'
import { images } from '../../services/assetPaths'
import styles from './PidaoEnding.module.css'

type EndingStage = 'story' | 'transformation' | 'preReveal' | 'reveal'

interface PidaoEndingProps {
  rewardCode: GameCodeId | null
  onBackToMenu: () => void
}

export function PidaoEnding({ rewardCode, onBackToMenu }: PidaoEndingProps) {
  const audio = useAudio()
  const [stage, setStage] = useState<EndingStage>('story')

  useEffect(() => () => audio.stop('pidaoEnding'), [audio])

  useEffect(() => {
    if (stage !== 'preReveal') return
    const revealTimer = window.setTimeout(() => setStage('reveal'), 2_000)
    return () => window.clearTimeout(revealTimer)
  }, [stage])

  const revealPidao = () => {
    audio.stop('pidaoEnding')
    audio.play('pidaoEnding')
    audio.fadeOut('pidaoEnding', { delay: 10_000, duration: 3_000 })
    setStage('preReveal')
  }

  return (
    <section
      className={styles.root}
      role="dialog"
      aria-modal="true"
      aria-label="Final: A Maldição do Pidão"
    >
      {stage === 'story' && (
        <div className={styles.storyScroll} aria-label="História do final do Pidão">
          <article className={styles.storyChapter}>
            <img
              className={styles.storyChapterImage}
              src={images.endings.woundedVictory}
              alt="Sobrevivente ferido diante do monstro derrotado e dos seus amigos"
            />
            <div className={styles.storyCopy}>
              <p>
                Depois de uma luta extremamente difícil, você mal consegue permanecer em pé.
                Machucado e sangrando, quase cai no chão, mas olha para o monstro derrotado e diz:
              </p>
              <strong>— Eu consegui!</strong>
              <p>
                Seus amigos correm até você e começam a comemorar. Enquanto celebram a vitória,
                eles tentam cuidar dos seus ferimentos.
              </p>
              <p>Mas nenhum deles percebe que aqueles arranhões escondem algo muito pior...</p>
            </div>
          </article>

          <article className={`${styles.storyChapter} ${styles.woundChapter}`}>
            <img
              className={styles.storyChapterImage}
              src={images.endings.woundedArm}
              alt="Feridas no braço do sobrevivente"
            />
            <div className={`${styles.storyCopy} ${styles.woundCopy}`}>
              <p>Naquela noite, pensei que fossem apenas arranhões.</p>
              <p>Mas, com o passar dos dias, a ferida não cicatrizou...</p>
              <WordButton type="button" onClick={() => setStage('transformation')}>
                Continuar
              </WordButton>
            </div>
          </article>
        </div>
      )}

      {stage === 'transformation' && (
        <div className={styles.transformationContent}>
          <p>Então, na lua cheia seguinte, você sente que alguma coisa está errada.</p>
          <p>Seu corpo começa a mudar.</p>
          <p>Cada osso estala. Cada músculo se estica e se retorce.</p>
          <p>Em meio àquela dor excruciante, você finalmente percebe...</p>
          <p className={styles.youBecame}>Você virou...</p>
          <WordButton type="button" onClick={revealPidao}>Continuar</WordButton>
        </div>
      )}

      {stage === 'preReveal' && (
        <div className={styles.preReveal} aria-label="A revelação está chegando" />
      )}

      {stage === 'reveal' && (
        <div className={styles.revealContent}>
          <img
            className={styles.pidaoImage}
            src={images.endings.pidao}
            alt="O sobrevivente transformado no Pidão"
          />
          <div className={styles.revealShade} />
          <h1>UM PIDÃO!!!</h1>
          <aside className={styles.endingToast} role="status" aria-label="Final obtido">
            <span>FINAL OBTIDO</span>
            <strong>Você se tornou um Lobisomem Pidão</strong>
          </aside>
          {rewardCode && (
            <p className={styles.codeReward} role="status">
              Você liberou o código:
              <strong>{GAME_CODES[rewardCode].code.toLowerCase()}</strong>
            </p>
          )}
          <div className={styles.actions}>
            <WordButton type="button" onClick={onBackToMenu}>Voltar ao Menu</WordButton>
          </div>
        </div>
      )}
    </section>
  )
}
