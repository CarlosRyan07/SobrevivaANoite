import type { MatchHistory } from '../persistence/gamePersistence'
import { formatMatchTimestamp, summarizeMatches } from './historyEngine'

const match = (
  id: number,
  gameMode: MatchHistory['gameMode'],
  wasVictory: boolean,
): MatchHistory => ({ id, gameMode, wasVictory, finalPlayerHp: 0, parryCount: 0, timestamp: id })

describe('engine do histórico', () => {
  it('resume vitórias e derrotas por modo', () => {
    expect(
      summarizeMatches([
        match(1, 'Batalha', true),
        match(2, 'Batalha', false),
        match(3, 'Esconde-Esconde', true),
        match(4, 'Esconde-Esconde', true),
      ]),
    ).toEqual({ battleWins: 1, battleLosses: 1, hideWins: 2, hideLosses: 0 })
  })

  it('formata data e hora como a tela Android', () => {
    const timestamp = new Date(2026, 6, 31, 13, 45).getTime()
    expect(formatMatchTimestamp(timestamp)).toBe('31/07/2026 às 13:45')
  })
})
