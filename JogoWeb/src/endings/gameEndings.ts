import { images } from '../services/assetPaths'

export const GAME_ENDING_IDS = ['raca', 'pidao', 'perfect'] as const

export type GameEndingId = (typeof GAME_ENDING_IDS)[number]

export interface GameEndingDefinition {
  id: GameEndingId
  title: string
  finalImage: string
  imageAlt: string
  hints: readonly [string, string, string]
}

export const GAME_ENDINGS: readonly GameEndingDefinition[] = [
  {
    id: 'raca',
    title: 'Venceu na Raça!',
    finalImage: images.endings.normalVictory,
    imageAlt: 'Sobrevivente celebrando sobre o monstro derrotado com seus amigos',
    hints: [
      'Nem toda vitória precisa ser perfeita.',
      'Enfrente alguma dificuldade, mas não chegue ao limite.',
      'Vença com pelo menos 40 de vida sem cumprir as exigências do final perfeito.',
    ],
  },
  {
    id: 'pidao',
    title: 'Lobisomem Pidão',
    finalImage: images.endings.pidao,
    imageAlt: 'O sobrevivente transformado no Lobisomem Pidão',
    hints: [
      'Algumas vitórias deixam marcas.',
      'Termine a batalha bastante ferido.',
      'Vença o monstro com menos de 40 de vida.',
    ],
  },
  {
    id: 'perfect',
    title: 'Sopa de Lobo!',
    finalImage: images.endings.perfectVictory,
    imageAlt: 'Sobrevivente ileso enquanto seu amigo observa a vitória, chocado',
    hints: [
      'O monstro não pode tocar em você.',
      'Transforme a defesa perfeita em contra-ataque.',
      'Vença sem sofrer golpes e realize pelo menos 2 parries.',
    ],
  },
] as const

export function isGameEndingId(value: unknown): value is GameEndingId {
  return typeof value === 'string' && GAME_ENDING_IDS.includes(value as GameEndingId)
}
