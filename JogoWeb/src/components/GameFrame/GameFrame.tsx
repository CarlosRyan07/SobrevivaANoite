import type { PropsWithChildren } from 'react'

import styles from './GameFrame.module.css'

export function GameFrame({ children }: PropsWithChildren) {
  return (
    <main className={styles.shell}>
      <section className={styles.frame} aria-label="Sobreviva à Noite">
        {children}
      </section>
    </main>
  )
}
