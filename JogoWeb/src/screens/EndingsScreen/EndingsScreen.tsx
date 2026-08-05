import { useCallback, useEffect, useState } from 'react'

import { GAME_ENDINGS, type GameEndingId } from '../../endings/gameEndings'
import {
  ENDING_PROGRESS_UPDATED_EVENT,
  gamePersistence,
  type GamePersistencePort,
} from '../../persistence/gamePersistence'
import { preloadImages } from '../../services/assetPaths'
import styles from './EndingsScreen.module.css'

interface EndingsScreenProps {
  onBack: () => void
  persistence?: Pick<GamePersistencePort, 'getEndingProgress'>
}

const INITIAL_HINT_LEVELS = Object.fromEntries(
  GAME_ENDINGS.map((ending) => [ending.id, 0]),
) as Record<GameEndingId, number>

export function EndingsScreen({ onBack, persistence = gamePersistence }: EndingsScreenProps) {
  const readProgress = useCallback(() => persistence.getEndingProgress(), [persistence])
  const [progress, setProgress] = useState(readProgress)
  const [hintLevels, setHintLevels] = useState(INITIAL_HINT_LEVELS)

  useEffect(() => {
    const refresh = () => setProgress(readProgress())
    window.addEventListener(ENDING_PROGRESS_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    window.addEventListener('pageshow', refresh)
    return () => {
      window.removeEventListener(ENDING_PROGRESS_UPDATED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
      window.removeEventListener('pageshow', refresh)
    }
  }, [readProgress])

  useEffect(() => {
    preloadImages(
      GAME_ENDINGS.filter((ending) => progress.discoveredEndings.includes(ending.id)).map(
        (ending) => ending.finalImage,
      ),
    )
  }, [progress.discoveredEndings])

  const revealNextHint = (endingId: GameEndingId, maximumLevel: number) => {
    setHintLevels((current) => ({
      ...current,
      [endingId]: Math.min(current[endingId] + 1, maximumLevel),
    }))
  }

  return (
    <section className={styles.root} aria-label="Finais">
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <div className={styles.heading}>
          <h1>Finais</h1>
          <span>{progress.discoveredEndings.length} de {GAME_ENDINGS.length} obtidos</span>
        </div>
      </header>

      <div className={styles.content}>
        <p className={styles.intro}>
          Suas escolhas e seu desempenho durante a batalha podem revelar finais diferentes.
        </p>

        <div className={styles.gallery}>
          {GAME_ENDINGS.map((ending, index) => {
            const unlocked = progress.discoveredEndings.includes(ending.id)
            const hintLevel = hintLevels[ending.id]
            const finalHint = hintLevel === ending.hints.length - 1
            const currentHint = ending.hints[hintLevel] ?? ending.hints[0]

            return (
              <article
                className={`${styles.card} ${unlocked ? styles.unlockedCard : styles.lockedCard}`}
                key={ending.id}
                aria-label={`Final ${index + 1}: ${unlocked ? ending.title : 'não obtido'}`}
              >
                {unlocked ? (
                  <img className={styles.endingImage} src={ending.finalImage} alt={ending.imageAlt} />
                ) : (
                  <div className={styles.lockedImage} aria-hidden="true">
                    <span>?</span>
                  </div>
                )}

                <div className={styles.cardBody}>
                  <span className={styles.eyebrow}>
                    {unlocked ? 'FINAL OBTIDO' : `FINAL ${index + 1}`}
                  </span>
                  <h2>{unlocked ? ending.title : '???'}</h2>

                  {!unlocked && (
                    <div className={styles.hintBox} aria-live="polite">
                      <span>DICA {hintLevel + 1}/{ending.hints.length}</span>
                      <p>{currentHint}</p>
                      <button
                        type="button"
                        onClick={() => revealNextHint(ending.id, ending.hints.length - 1)}
                        disabled={finalHint}
                        aria-label={`Próxima dica do final ${index + 1}`}
                      >
                        {finalHint ? 'Dica final' : 'Próxima dica'}
                      </button>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
