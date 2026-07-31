export type GameMode = 'Batalha' | 'Esconde-Esconde'

export interface MatchHistory {
  id: number
  gameMode: GameMode
  wasVictory: boolean
  finalPlayerHp: number
  parryCount: number
  timestamp: number
}

export type NewMatch = Omit<MatchHistory, 'id' | 'timestamp'>

export interface GamePersistencePort {
  getHighCombo(): number
  updateHighCombo(newCombo: number): number
  getMatches(): MatchHistory[]
  saveMatch(match: NewMatch): MatchHistory
}

export const STORAGE_KEYS = {
  highCombo: 'sobreviva-a-noite.high-combo.v1',
  matchHistory: 'sobreviva-a-noite.match-history.v1',
} as const

export const MATCH_HISTORY_UPDATED_EVENT = 'sobreviva-a-noite:match-history-updated'

function getBrowserStorage(): Storage | null {
  if (typeof window === 'undefined') return null
  try {
    return window.localStorage
  } catch {
    return null
  }
}

function isMatchHistory(value: unknown): value is MatchHistory {
  if (typeof value !== 'object' || value === null) return false
  const match = value as Record<string, unknown>
  return (
    typeof match.id === 'number' &&
    (match.gameMode === 'Batalha' || match.gameMode === 'Esconde-Esconde') &&
    typeof match.wasVictory === 'boolean' &&
    typeof match.finalPlayerHp === 'number' &&
    typeof match.parryCount === 'number' &&
    typeof match.timestamp === 'number'
  )
}

export class GamePersistence implements GamePersistencePort {
  private memoryHighCombo = 0
  private memoryMatches: MatchHistory[] = []

  constructor(
    private storage: Storage | null = getBrowserStorage(),
    private readonly now: () => number = Date.now,
  ) {}

  getHighCombo(): number {
    if (!this.storage) return this.memoryHighCombo
    try {
      const parsed = Number.parseInt(this.storage.getItem(STORAGE_KEYS.highCombo) ?? '0', 10)
      return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
    } catch {
      this.storage = null
      return this.memoryHighCombo
    }
  }

  updateHighCombo(newCombo: number): number {
    const normalizedCombo = Math.max(0, Math.floor(newCombo))
    const nextHighCombo = Math.max(this.getHighCombo(), normalizedCombo)
    this.memoryHighCombo = nextHighCombo

    if (this.storage) {
      try {
        this.storage.setItem(STORAGE_KEYS.highCombo, String(nextHighCombo))
      } catch {
        this.storage = null
      }
    }
    return nextHighCombo
  }

  getMatches(): MatchHistory[] {
    if (!this.storage) return this.sortMatches(this.memoryMatches)
    try {
      const raw = this.storage.getItem(STORAGE_KEYS.matchHistory)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return this.sortMatches(parsed.filter(isMatchHistory))
    } catch {
      this.storage = null
      return this.sortMatches(this.memoryMatches)
    }
  }

  saveMatch(match: NewMatch): MatchHistory {
    const matches = this.getMatches()
    const savedMatch: MatchHistory = {
      ...match,
      id: matches.reduce((highestId, item) => Math.max(highestId, item.id), 0) + 1,
      timestamp: this.now(),
    }
    const nextMatches = this.sortMatches([...matches, savedMatch])
    this.memoryMatches = nextMatches

    if (this.storage) {
      try {
        this.storage.setItem(STORAGE_KEYS.matchHistory, JSON.stringify(nextMatches))
      } catch {
        this.storage = null
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(MATCH_HISTORY_UPDATED_EVENT))
    }
    return savedMatch
  }

  private sortMatches(matches: readonly MatchHistory[]): MatchHistory[] {
    return [...matches].sort((first, second) => second.timestamp - first.timestamp)
  }
}

export const gamePersistence = new GamePersistence()
