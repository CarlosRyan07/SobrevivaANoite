import styles from './ParryGauge.module.css'

interface ParryGaugeProps {
  current: number
  max: number
  isStunned: boolean
}

export function ParryGauge({ current, max, isStunned }: ParryGaugeProps) {
  const progress = `${Math.max(0, Math.min(current / max, 1)) * 100}%`
  const isDraining = isStunned && current < max

  return (
    <div className={styles.root} aria-label="Medidor de atordoamento">
      <div
        className={`${styles.track} ${isDraining ? styles.draining : ''}`}
        role="meter"
        aria-label="Atordoamento do Psicopata"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={current}
      >
        <div className={styles.fill} style={{ width: progress }} />
      </div>
    </div>
  )
}
