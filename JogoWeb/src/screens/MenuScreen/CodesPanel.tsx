import { useEffect, useState, type FormEvent } from 'react'

import { findGameCode, GAME_CODES } from '../../codes/gameCodes'
import { WordButton } from '../../components/WordButton/WordButton'
import { useAudio } from '../../contexts/audioContextValue'
import { useModalFocus } from '../../hooks/useModalFocus'
import {
  CODE_PROGRESS_UPDATED_EVENT,
  type GamePersistencePort,
} from '../../persistence/gamePersistence'
import styles from './CodesPanel.module.css'

interface CodesPanelProps {
  onClose: () => void
  persistence: GamePersistencePort
}

type Feedback = { kind: 'success' | 'error'; message: string } | null

export function CodesPanel({ onClose, persistence }: CodesPanelProps) {
  const audio = useAudio()
  const dialogRef = useModalFocus<HTMLElement>(true)
  const [codeInput, setCodeInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [progress, setProgress] = useState(() => persistence.getCodeProgress())

  useEffect(() => {
    const refresh = () => setProgress(persistence.getCodeProgress())
    window.addEventListener(CODE_PROGRESS_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener(CODE_PROGRESS_UPDATED_EVENT, refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [persistence])

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    audio.play('buttonClick')
    const definition = findGameCode(codeInput)
    if (!definition) {
      setFeedback({ kind: 'error', message: 'Código inválido.' })
      return
    }

    persistence.redeemCode(definition.id)
    setProgress(persistence.getCodeProgress())
    setCodeInput('')
    setFeedback({ kind: 'success', message: 'Código ativado!' })
  }

  const toggleCode = (codeId: (typeof progress.redeemedCodes)[number]) => {
    audio.play('buttonClick')
    const active = progress.activeCodes.includes(codeId)
    persistence.setCodeActive(codeId, !active)
    setProgress(persistence.getCodeProgress())
    setFeedback({
      kind: 'success',
      message: active ? 'Código desativado.' : 'Código ativado!',
    })
  }

  return (
    <section
      ref={dialogRef}
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="codes-title"
      tabIndex={-1}
    >
      <div className={styles.panel}>
        <button className={styles.closeButton} type="button" onClick={onClose} aria-label="Fechar códigos">
          <span aria-hidden="true">×</span>
        </button>
        <h2 id="codes-title">CÓDIGOS</h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="game-code">Digite o código:</label>
          <input
            id="game-code"
            value={codeInput}
            onChange={(event) => {
              setCodeInput(event.target.value)
              setFeedback(null)
            }}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            data-modal-autofocus
          />
          <WordButton type="submit">Ativar</WordButton>
        </form>

        {feedback && (
          <p
            className={feedback.kind === 'success' ? styles.success : styles.error}
            role="status"
          >
            {feedback.message}
          </p>
        )}

        <div className={styles.redeemed}>
          <h3>Códigos resgatados</h3>
          {progress.redeemedCodes.length === 0 ? (
            <p className={styles.empty}>Nenhum código resgatado ainda.</p>
          ) : (
            progress.redeemedCodes.map((codeId) => {
              const definition = GAME_CODES[codeId]
              const active = progress.activeCodes.includes(codeId)
              return (
                <article className={styles.codeCard} key={codeId}>
                  <strong>{definition.name}</strong>
                  <p>{definition.description}</p>
                  <WordButton type="button" onClick={() => toggleCode(codeId)}>
                    {active ? 'Desativar' : 'Ativar'}
                  </WordButton>
                </article>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}
