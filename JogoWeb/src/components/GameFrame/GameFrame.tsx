import { useEffect, useState, type CSSProperties, type PropsWithChildren } from 'react'

import { images } from '../../services/assetPaths'
import styles from './GameFrame.module.css'

type ShellStyle = CSSProperties & { '--game-backdrop': string }

export const GAMEPLAY_STAGE_WIDTH = 480
export const GAMEPLAY_STAGE_HEIGHT = 850
export const GAMEPLAY_MAX_USER_ZOOM = 1.1

type GameFrameProps = PropsWithChildren<{
  layout?: 'responsive' | 'menu' | 'gameplay' | 'battle'
}>

function calculateGameplayScale(baseDevicePixelRatio: number) {
  const viewportWidth = window.visualViewport?.width ?? window.innerWidth
  const viewportHeight = window.visualViewport?.height ?? window.innerHeight
  const currentDevicePixelRatio = window.devicePixelRatio || baseDevicePixelRatio
  const userZoom = Math.min(
    GAMEPLAY_MAX_USER_ZOOM,
    Math.max(1, currentDevicePixelRatio / baseDevicePixelRatio),
  )

  const fitScale = Math.min(
    viewportWidth / GAMEPLAY_STAGE_WIDTH,
    viewportHeight / GAMEPLAY_STAGE_HEIGHT,
  )

  return Math.max(0.1, fitScale * userZoom)
}

export function GameFrame({ children, layout = 'responsive' }: GameFrameProps) {
  const backdropUrl = new URL(images.start, window.location.href).href
  const shellStyle: ShellStyle = { '--game-backdrop': `url("${backdropUrl}")` }
  const [baseDevicePixelRatio] = useState(() => window.devicePixelRatio || 1)
  const [gameplayScale, setGameplayScale] = useState(() =>
    calculateGameplayScale(baseDevicePixelRatio),
  )
  const fixedGameplay = layout === 'gameplay'
  const menuLayout = layout === 'menu'
  const battleLayout = layout === 'battle'

  useEffect(() => {
    if (!fixedGameplay) return

    const updateScale = () =>
      setGameplayScale(calculateGameplayScale(baseDevicePixelRatio))
    updateScale()
    window.addEventListener('resize', updateScale)
    window.visualViewport?.addEventListener('resize', updateScale)

    return () => {
      window.removeEventListener('resize', updateScale)
      window.visualViewport?.removeEventListener('resize', updateScale)
    }
  }, [baseDevicePixelRatio, fixedGameplay])

  const frameStyle: CSSProperties | undefined = fixedGameplay
    ? {
        width: GAMEPLAY_STAGE_WIDTH * gameplayScale,
        height: GAMEPLAY_STAGE_HEIGHT * gameplayScale,
      }
    : undefined
  const gameplayCanvasStyle: CSSProperties = { transform: `scale(${gameplayScale})` }

  return (
    <main
      className={`${styles.shell} ${fixedGameplay ? styles.gameplayShell : ''}`}
      style={shellStyle}
    >
      <section
        className={`${styles.frame} ${fixedGameplay ? styles.fixedFrame : ''} ${menuLayout ? styles.menuFrame : ''} ${battleLayout ? styles.battleFrame : ''}`}
        style={frameStyle}
        aria-label="Sobreviva à Noite"
        data-layout={layout}
      >
        {fixedGameplay ? (
          <div className={styles.gameplayCanvas} style={gameplayCanvasStyle}>
            {children}
          </div>
        ) : battleLayout ? (
          <div className={styles.battleCanvas}>{children}</div>
        ) : (
          children
        )}
      </section>
    </main>
  )
}
