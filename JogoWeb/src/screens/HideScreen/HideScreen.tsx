import { useEffect } from 'react'

import { useAudio } from '../../contexts/audioContextValue'
import { HIDING_SPOT_COORDINATES, ROOMS } from '../../hide/hideConstants'
import type { Position } from '../../hide/hideTypes'
import { useHideGame } from '../../hide/useHideGame'
import { useSpringPosition } from '../../hooks/useSpringPosition'
import { images, preloadImages } from '../../services/assetPaths'
import styles from './HideScreen.module.css'

type PositionedStyle = React.CSSProperties & { '--x': string; '--y': string }

interface HideScreenProps {
  onBackToMenu: () => void
}

function positionStyle(position: Position): PositionedStyle {
  return { '--x': `${position.x}px`, '--y': `${position.y}px` }
}

export function HideScreen({ onBackToMenu }: HideScreenProps) {
  const audio = useAudio()
  const { state, chooseHidingSpot, playAgain } = useHideGame(audio)
  const isChoosing = state.phase.kind === 'choosing'
  const animatedPsychopathPosition = useSpringPosition(state.psychopathPosition)

  useEffect(() => {
    preloadImages([
      images.houseWithDoor,
      images.house,
      images.blood,
      ...images.killers,
    ])
  }, [])

  return (
    <div className={styles.root} aria-label="Modo esconder">
      <div className={styles.world}>
        <img
          className={styles.background}
          src={state.background === 'withDoor' ? images.houseWithDoor : images.house}
          alt="Planta da Casa"
        />

        {ROOMS.map((room) => {
          const position = HIDING_SPOT_COORDINATES[room]
          if (state.players[room] === 'dead') {
            return (
              <img
                key={room}
                className={styles.blood}
                style={positionStyle(position)}
                src={images.blood}
                alt={`Mancha de sangue no local ${room}`}
              />
            )
          }

          const selected = state.playerChoice === room
          return (
            <button
              key={room}
              className={`${styles.spot} ${selected ? styles.selected : ''}`}
              style={positionStyle(position)}
              type="button"
              disabled={!isChoosing}
              aria-label={`Esconderijo ${room}`}
              aria-pressed={selected}
              onClick={() => {
                audio.play('buttonClick')
                chooseHidingSpot(room)
              }}
            >
              {room}
            </button>
          )
        })}

        {state.phase.kind === 'searching' && (
          <img
            className={`${styles.psychopath} ${state.isFacingRight ? styles.facingRight : ''}`}
            style={positionStyle(animatedPsychopathPosition)}
            src={state.psychopathImage}
            alt="Psicopata"
          />
        )}
      </div>

      {isChoosing && (
        <div className={styles.centerOverlay}>
          <div className={styles.countdownBox}>
            <p className={styles.prompt}>Rápido, se esconda!</p>
            <p className={`${styles.countdown} ${state.countdown <= 3 ? styles.urgent : ''}`}>
              {state.countdown}
            </p>
          </div>
        </div>
      )}

      {state.phase.kind === 'searching' && (
        <div className={styles.searchStatus}>
          <p className={styles.searchingText}>Ele está procurando...</p>
        </div>
      )}

      {state.phase.kind === 'result' && (
        <div className={styles.resultOverlay} role="dialog" aria-modal="true">
          {state.phase.didPlayerWin ? (
            <>
              <h1 className={styles.win}>UFA!</h1>
              <h2 className={styles.win}>Você sobreviveu!</h2>
              {state.phase.playerChoice !== null && (
                <p>
                  {state.phase.otherSurvivor !== null
                    ? `Parabéns! Você (Nº ${state.phase.playerChoice}) e o sobrevivente Nº ${state.phase.otherSurvivor} escaparam.`
                    : `Parabéns! Você (Nº ${state.phase.playerChoice}) foi o único a escapar.`}
                </p>
              )}
            </>
          ) : (
            <>
              <h2 className={styles.lose}>VOCÊ MORREU</h2>
              <p className={styles.loseMessage}>{state.phase.customMessage ?? 'Ele te encontrou!'}</p>
            </>
          )}
          <div className={styles.resultActions}>
            <button
              type="button"
              onClick={() => {
                audio.play('buttonClick')
                playAgain()
              }}
            >
              Jogar Novamente
            </button>
            <button
              type="button"
              onClick={() => {
                audio.play('buttonClick')
                onBackToMenu()
              }}
            >
              Voltar ao Menu
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
