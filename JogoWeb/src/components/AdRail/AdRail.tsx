import styles from './AdRail.module.css'

type AdRailProps = {
  side: 'left' | 'right'
}

export function AdRail({ side }: AdRailProps) {
  const sideLabel = side === 'left' ? 'esquerda' : 'direita'

  return (
    <aside className={`${styles.rail} ${styles[side]}`} aria-label={`Publicidade ${sideLabel}`}>
      <span className={styles.label}>Publicidade</span>
      <div className={styles.slot} aria-hidden="true">
        Espaço reservado para anúncio
      </div>
    </aside>
  )
}
