import { useCallback, useEffect, useState } from 'react'

import { formatMatchTimestamp, summarizeMatches } from '../../history/historyEngine'
import {
  gamePersistence,
  type GamePersistencePort,
  type MatchHistory,
} from '../../persistence/gamePersistence'
import styles from './HistoryScreen.module.css'

interface HistoryScreenProps {
  onBack: () => void
  persistence?: Pick<GamePersistencePort, 'getMatches'>
}

interface StatsCardProps {
  gameMode: string
  wins: number
  losses: number
}

function StatsCard({ gameMode, wins, losses }: StatsCardProps) {
  return (
    <article className={styles.statsCard} aria-label={`Estatísticas de ${gameMode}`}>
      <strong>{gameMode}</strong>
      <span>Vitórias: {wins} | Derrotas: {losses}</span>
    </article>
  )
}

function MatchHistoryItem({ match }: { match: MatchHistory }) {
  return (
    <article className={styles.matchCard}>
      <div className={styles.matchHeading}>
        <h3>{match.gameMode}</h3>
        <strong className={match.wasVictory ? styles.victory : styles.defeat}>
          {match.wasVictory ? 'VITÓRIA' : 'DERROTA'}
        </strong>
      </div>
      <time dateTime={new Date(match.timestamp).toISOString()}>
        {formatMatchTimestamp(match.timestamp)}
      </time>
      {match.gameMode === 'Batalha' && (
        <p>Vida Final: {match.finalPlayerHp} | Parrys: {match.parryCount}</p>
      )}
    </article>
  )
}

export function HistoryScreen({ onBack, persistence = gamePersistence }: HistoryScreenProps) {
  const readMatches = useCallback(() => persistence.getMatches(), [persistence])
  const [matches, setMatches] = useState<MatchHistory[]>(readMatches)
  const stats = summarizeMatches(matches)

  useEffect(() => {
    const refresh = () => setMatches(readMatches())
    window.addEventListener('storage', refresh)
    return () => window.removeEventListener('storage', refresh)
  }, [readMatches])

  return (
    <section className={styles.root} aria-label="Histórico de Partidas">
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <h1>Histórico de Partidas</h1>
      </header>

      <div className={styles.content}>
        <section className={styles.stats} aria-labelledby="stats-title">
          <h2 id="stats-title">Estatísticas Gerais</h2>
          <StatsCard gameMode="Batalha" wins={stats.battleWins} losses={stats.battleLosses} />
          <StatsCard gameMode="Esconde-Esconde" wins={stats.hideWins} losses={stats.hideLosses} />
        </section>

        {matches.length === 0 ? (
          <p className={styles.empty}>Nenhuma partida jogada ainda.</p>
        ) : (
          <div className={styles.matches} aria-label="Partidas">
            {matches.map((match) => <MatchHistoryItem key={match.id} match={match} />)}
          </div>
        )}
      </div>
    </section>
  )
}
