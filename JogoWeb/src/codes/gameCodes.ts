export const GAME_CODE_IDS = ['ligeirinho'] as const

export type GameCodeId = (typeof GAME_CODE_IDS)[number]
export type GameCodeCategory = 'gameplay' | 'visual' | 'challenge' | 'fun'

export interface GameCodeDefinition {
  id: GameCodeId
  code: string
  name: string
  description: string
  category: GameCodeCategory
}

export const GAME_CODES: Record<GameCodeId, GameCodeDefinition> = {
  ligeirinho: {
    id: 'ligeirinho',
    code: 'LIGEIRINHO',
    name: 'Ligeirinho',
    description: 'Aumenta a velocidade dos golpes durante a batalha.',
    category: 'gameplay',
  },
}

export function isGameCodeId(value: unknown): value is GameCodeId {
  return typeof value === 'string' && GAME_CODE_IDS.includes(value as GameCodeId)
}

export function normalizeGameCode(value: string): string {
  return value.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

export function findGameCode(value: string): GameCodeDefinition | null {
  const normalized = normalizeGameCode(value)
  return GAME_CODE_IDS.map((id) => GAME_CODES[id]).find(
    (definition) => normalizeGameCode(definition.code) === normalized,
  ) ?? null
}
