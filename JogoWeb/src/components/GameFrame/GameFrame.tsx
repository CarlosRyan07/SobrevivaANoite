import type { CSSProperties, PropsWithChildren } from 'react'

import { images } from '../../services/assetPaths'
import styles from './GameFrame.module.css'

type ShellStyle = CSSProperties & { '--game-backdrop': string }

export function GameFrame({ children }: PropsWithChildren) {
  const backdropUrl = new URL(images.start, window.location.href).href
  const shellStyle: ShellStyle = { '--game-backdrop': `url("${backdropUrl}")` }

  return (
    <main className={styles.shell} style={shellStyle}>
      <section className={styles.frame} aria-label="Sobreviva à Noite">
        {children}
      </section>
    </main>
  )
}
