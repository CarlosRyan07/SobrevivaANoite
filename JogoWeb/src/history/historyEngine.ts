import type { MatchHistory } from '../persistence/gamePersistence'

export interface HistoryStats {
  battleWins: number
  battleLosses: number
  hideWins: number
  hideLosses: number
}

export function summarizeMatches(matches: readonly MatchHistory[]): HistoryStats {
  return matches.reduce<HistoryStats>(
    (stats, match) => {
      if (match.gameMode === 'Batalha') {
        if (match.wasVictory) stats.battleWins += 1
        else stats.battleLosses += 1
      } else if (match.wasVictory) stats.hideWins += 1
      else stats.hideLosses += 1
      return stats
    },
    { battleWins: 0, battleLosses: 0, hideWins: 0, hideLosses: 0 },
  )
}

export function formatMatchTimestamp(timestamp: number): string {
  const date = new Date(timestamp)
  const twoDigits = (value: number) => String(value).padStart(2, '0')
  return `${twoDigits(date.getDate())}/${twoDigits(date.getMonth() + 1)}/${date.getFullYear()} às ${twoDigits(date.getHours())}:${twoDigits(date.getMinutes())}`
}
