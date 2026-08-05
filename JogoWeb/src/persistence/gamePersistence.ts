import { GAME_CODES, isGameCodeId, type GameCodeId } from '../codes/gameCodes'
import { isGameEndingId, type GameEndingId } from '../endings/gameEndings'

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

export interface CodeProgress {
  discoveredCodes: GameCodeId[]
  redeemedCodes: GameCodeId[]
  activeCodes: GameCodeId[]
}

export interface EndingProgress {
  discoveredEndings: GameEndingId[]
}

export interface GamePersistencePort {
  getHighCombo(): number
  updateHighCombo(newCombo: number): number
  getMatches(): MatchHistory[]
  saveMatch(match: NewMatch): MatchHistory
  getCodeProgress(): CodeProgress
  discoverCode(codeId: GameCodeId): boolean
  redeemCode(codeId: GameCodeId): boolean
  setCodeActive(codeId: GameCodeId, active: boolean): boolean
  isCodeActive(codeId: GameCodeId): boolean
  getEndingProgress(): EndingProgress
  discoverEnding(endingId: GameEndingId): boolean
  hasSeenBattleTutorial(): boolean
  markBattleTutorialSeen(): void
}

export const STORAGE_KEYS = {
  highCombo: 'sobreviva-a-noite.high-combo.v1',
  matchHistory: 'sobreviva-a-noite.match-history.v1',
  codeProgress: 'sobreviva-a-noite.code-progress.v1',
  endingProgress: 'sobreviva-a-noite.ending-progress.v1',
  battleTutorialSeen: 'sobreviva-a-noite.battle-tutorial-seen.v1',
} as const

export const MATCH_HISTORY_UPDATED_EVENT = 'sobreviva-a-noite:match-history-updated'
export const CODE_PROGRESS_UPDATED_EVENT = 'sobreviva-a-noite:code-progress-updated'
export const ENDING_PROGRESS_UPDATED_EVENT = 'sobreviva-a-noite:ending-progress-updated'

const EMPTY_CODE_PROGRESS: CodeProgress = {
  discoveredCodes: [],
  redeemedCodes: [],
  activeCodes: [],
}

const EMPTY_ENDING_PROGRESS: EndingProgress = {
  discoveredEndings: [],
}

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

function cloneCodeProgress(progress: CodeProgress): CodeProgress {
  return {
    discoveredCodes: [...progress.discoveredCodes],
    redeemedCodes: [...progress.redeemedCodes],
    activeCodes: [...progress.activeCodes],
  }
}

function parseCodeProgress(value: unknown): CodeProgress {
  if (typeof value !== 'object' || value === null) return cloneCodeProgress(EMPTY_CODE_PROGRESS)
  const progress = value as Record<string, unknown>
  const discoveredCodes = Array.isArray(progress.discoveredCodes)
    ? [...new Set(progress.discoveredCodes.filter(isGameCodeId))]
    : []
  const redeemedCodes = Array.isArray(progress.redeemedCodes)
    ? [...new Set(progress.redeemedCodes.filter(isGameCodeId))]
    : []
  const activeCodes = Array.isArray(progress.activeCodes)
    ? [...new Set(progress.activeCodes.filter(isGameCodeId))].filter((id) =>
        redeemedCodes.includes(id),
      )
    : []

  return { discoveredCodes, redeemedCodes, activeCodes }
}

function cloneEndingProgress(progress: EndingProgress): EndingProgress {
  return { discoveredEndings: [...progress.discoveredEndings] }
}

function parseEndingProgress(value: unknown): EndingProgress {
  if (typeof value !== 'object' || value === null) {
    return cloneEndingProgress(EMPTY_ENDING_PROGRESS)
  }
  const progress = value as Record<string, unknown>
  const discoveredEndings = Array.isArray(progress.discoveredEndings)
    ? [...new Set(progress.discoveredEndings.filter(isGameEndingId))]
    : []
  return { discoveredEndings }
}

export class GamePersistence implements GamePersistencePort {
  private memoryHighCombo = 0
  private memoryMatches: MatchHistory[] = []
  private memoryCodeProgress = cloneCodeProgress(EMPTY_CODE_PROGRESS)
  private memoryEndingProgress = cloneEndingProgress(EMPTY_ENDING_PROGRESS)
  private memoryBattleTutorialSeen = false

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

  getCodeProgress(): CodeProgress {
    if (!this.storage) return cloneCodeProgress(this.memoryCodeProgress)
    try {
      const raw = this.storage.getItem(STORAGE_KEYS.codeProgress)
      if (!raw) return cloneCodeProgress(EMPTY_CODE_PROGRESS)
      return parseCodeProgress(JSON.parse(raw) as unknown)
    } catch {
      this.storage = null
      return cloneCodeProgress(this.memoryCodeProgress)
    }
  }

  discoverCode(codeId: GameCodeId): boolean {
    const progress = this.getCodeProgress()
    if (progress.discoveredCodes.includes(codeId)) return false
    this.saveCodeProgress({
      ...progress,
      discoveredCodes: [...progress.discoveredCodes, codeId],
    })
    return true
  }

  redeemCode(codeId: GameCodeId): boolean {
    const progress = this.getCodeProgress()
    const newlyRedeemed = !progress.redeemedCodes.includes(codeId)
    const redeemedCodes = newlyRedeemed
      ? [...progress.redeemedCodes, codeId]
      : progress.redeemedCodes
    const conflictingCategory = GAME_CODES[codeId].category
    const activeCodes = [
      ...progress.activeCodes.filter(
        (activeId) => GAME_CODES[activeId].category !== conflictingCategory,
      ),
      codeId,
    ]
    this.saveCodeProgress({ ...progress, redeemedCodes, activeCodes })
    return newlyRedeemed
  }

  setCodeActive(codeId: GameCodeId, active: boolean): boolean {
    const progress = this.getCodeProgress()
    if (!progress.redeemedCodes.includes(codeId)) return false
    const conflictingCategory = GAME_CODES[codeId].category
    const activeCodes = active
      ? [
          ...progress.activeCodes.filter(
            (activeId) => GAME_CODES[activeId].category !== conflictingCategory,
          ),
          codeId,
        ]
      : progress.activeCodes.filter((activeId) => activeId !== codeId)
    this.saveCodeProgress({ ...progress, activeCodes })
    return true
  }

  isCodeActive(codeId: GameCodeId): boolean {
    return this.getCodeProgress().activeCodes.includes(codeId)
  }

  getEndingProgress(): EndingProgress {
    if (!this.storage) return cloneEndingProgress(this.memoryEndingProgress)
    try {
      const raw = this.storage.getItem(STORAGE_KEYS.endingProgress)
      if (!raw) return cloneEndingProgress(EMPTY_ENDING_PROGRESS)
      return parseEndingProgress(JSON.parse(raw) as unknown)
    } catch {
      this.storage = null
      return cloneEndingProgress(this.memoryEndingProgress)
    }
  }

  discoverEnding(endingId: GameEndingId): boolean {
    const progress = this.getEndingProgress()
    if (progress.discoveredEndings.includes(endingId)) return false
    this.saveEndingProgress({
      discoveredEndings: [...progress.discoveredEndings, endingId],
    })
    return true
  }

  hasSeenBattleTutorial(): boolean {
    if (!this.storage) return this.memoryBattleTutorialSeen
    try {
      return this.storage.getItem(STORAGE_KEYS.battleTutorialSeen) === 'true'
    } catch {
      this.storage = null
      return this.memoryBattleTutorialSeen
    }
  }

  markBattleTutorialSeen(): void {
    this.memoryBattleTutorialSeen = true
    if (!this.storage) return
    try {
      this.storage.setItem(STORAGE_KEYS.battleTutorialSeen, 'true')
    } catch {
      this.storage = null
    }
  }

  private saveCodeProgress(progress: CodeProgress): void {
    this.memoryCodeProgress = cloneCodeProgress(progress)
    if (this.storage) {
      try {
        this.storage.setItem(STORAGE_KEYS.codeProgress, JSON.stringify(progress))
      } catch {
        this.storage = null
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(CODE_PROGRESS_UPDATED_EVENT))
    }
  }

  private saveEndingProgress(progress: EndingProgress): void {
    this.memoryEndingProgress = cloneEndingProgress(progress)
    if (this.storage) {
      try {
        this.storage.setItem(STORAGE_KEYS.endingProgress, JSON.stringify(progress))
      } catch {
        this.storage = null
      }
    }
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event(ENDING_PROGRESS_UPDATED_EVENT))
    }
  }

  private sortMatches(matches: readonly MatchHistory[]): MatchHistory[] {
    return [...matches].sort((first, second) => second.timestamp - first.timestamp)
  }
}

export const gamePersistence = new GamePersistence()
