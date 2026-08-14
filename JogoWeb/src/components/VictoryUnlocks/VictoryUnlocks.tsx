import { GAME_CODES, type GameCodeId } from '../../codes/gameCodes'

import styles from './VictoryUnlocks.module.css'

interface VictoryUnlocksProps {
  rewardCode: GameCodeId | null
  className?: string | undefined
}

export function VictoryUnlocks({ rewardCode, className }: VictoryUnlocksProps) {
  if (!rewardCode) return null

  return (
    <section
      className={[styles.rewards, className].filter(Boolean).join(' ')}
      role="status"
      aria-label="Recompensas desbloqueadas"
    >
      <article className={styles.card}>
        <span>CÓDIGO LIBERADO</span>
        <strong>{GAME_CODES[rewardCode].code.toLowerCase()}</strong>
      </article>
    </section>
  )
}
