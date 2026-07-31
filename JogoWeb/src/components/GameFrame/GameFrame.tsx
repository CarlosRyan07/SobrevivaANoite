import { useEffect, useState, type CSSProperties, type PropsWithChildren } from 'react'

import { images } from '../../services/assetPaths'
import styles from './GameFrame.module.css'

type ShellStyle = CSSProperties & { '--game-backdrop': string }

export const GAMEPLAY_STAGE_WIDTH = 480
export const GAMEPLAY_STAGE_HEIGHT = 1_000

type GameFrameProps = PropsWithChildren<{
  layout?: 'responsive' | 'gameplay'
}>

function calculateGameplayScale() {
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight

  return Math.max(
    0.1,
    Math.min(viewportWidth / GAMEPLAY_STAGE_WIDTH, viewportHeight / GAMEPLAY_STAGE_HEIGHT),
  )
}

export function GameFrame({ children, layout = 'responsive' }: GameFrameProps) {
  const backdropUrl = new URL(images.start, window.location.href).href
  const shellStyle: ShellStyle = { '--game-backdrop': `url("${backdropUrl}")` }
  const [gameplayScale, setGameplayScale] = useState(calculateGameplayScale)
  const fixedGameplay = layout === 'gameplay'

  useEffect(() => {
    if (!fixedGameplay) return

    const updateScale = () => setGameplayScale(calculateGameplayScale())
    updateScale()
    window.addEventListener('resize', updateScale)
    window.visualViewport?.addEventListener('resize', updateScale)

    return () => {
      window.removeEventListener('resize', updateScale)
      window.visualViewport?.removeEventListener('resize', updateScale)
    }
  }, [fixedGameplay])

  const frameStyle: CSSProperties | undefined = fixedGameplay
    ? {
        width: GAMEPLAY_STAGE_WIDTH * gameplayScale,
        height: GAMEPLAY_STAGE_HEIGHT * gameplayScale,
      }
    : undefined
  const gameplayCanvasStyle: CSSProperties = { transform: `scale(${gameplayScale})` }

  return (
    <main className={styles.shell} style={shellStyle}>
      <section
        className={`${styles.frame} ${fixedGameplay ? styles.fixedFrame : ''}`}
        style={frameStyle}
        aria-label="Sobreviva à Noite"
        data-layout={layout}
      >
        {fixedGameplay ? (
          <div className={styles.gameplayCanvas} style={gameplayCanvasStyle}>
            {children}
          </div>
        ) : (
          children
        )}
      </section>
    </main>
  )
}
