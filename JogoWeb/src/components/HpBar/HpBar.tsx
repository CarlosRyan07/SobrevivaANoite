import { hpPalette } from '../../battle/battleEngine'
import styles from './HpBar.module.css'

interface HpBarProps {
  name: string
  currentHp: number
  maxHp: number
  className?: string
}
type HpStyle = React.CSSProperties & {
  '--progress': string
  '--start': string
  '--end': string
}

export function HpBar({ name, currentHp, maxHp, className = '' }: HpBarProps) {
  const percentage = currentHp / maxHp
  const palette = hpPalette(percentage)
  const style: HpStyle = {
    '--progress': `${Math.max(0, Math.min(percentage, 1)) * 100}%`,
    '--start': palette.start,
    '--end': palette.end,
  }

  return (
    <div className={`${styles.root} ${className}`}>
      <p className={styles.name}>{name}</p>
      <div
        className={styles.track}
        role="meter"
        aria-label={`Vida de ${name}`}
        aria-valuemin={0}
        aria-valuemax={maxHp}
        aria-valuenow={currentHp}
      >
        <div className={styles.fill} style={style} />
        <span className={styles.value}>{`${currentHp} / ${maxHp}`}</span>
      </div>
    </div>
  )
}
