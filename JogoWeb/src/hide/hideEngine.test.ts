import type { RandomSource } from '../utils/random'
import { HIDING_SPOT_COORDINATES, OUTSIDE_DOOR_POSITION } from './hideConstants'
import { createInitialHideState, createSearchPath, findOtherSurvivor, findReplacementTarget } from './hideEngine'

const identityRandom: RandomSource = {
  boolean: () => false,
  integer: (minimum) => minimum,
  pick: <T>(values: readonly T[]) => values[0] as T,
  shuffle: <T>(values: readonly T[]) => [...values],
}

describe('engine do esconderijo', () => {
  it('cria os seis sobreviventes, contador e assassino do baseline', () => {
    const state = createInitialHideState(identityRandom)

    expect(state.countdown).toBe(10)
    expect(Object.values(state.players)).toEqual(Array(6).fill('hiding'))
    expect(state.psychopathPosition).toEqual({ x: 28, y: 500 })
    expect(state.psychopathImage).toContain('terrifier.webp')
  })

  it('limita o caminho inicial a quatro locais únicos', () => {
    expect(createSearchPath(identityRandom)).toEqual([1, 2, 3, 4])
  })

  it('escolhe o primeiro substituto fora do caminho e diferente do jogador', () => {
    const players = createInitialHideState(identityRandom).players
    expect(findReplacementTarget([2, 3, 4], 1, players)).toBe(5)
  })

  it('encontra o primeiro outro sobrevivente na ordem Android', () => {
    const players = createInitialHideState(identityRandom).players
    players[2] = 'dead'
    players[3] = 'dead'
    players[4] = 'dead'
    players[5] = 'dead'
    expect(findOtherSurvivor(players, 1)).toBe(6)
  })

  it('mantém os seis alvos nas posições corrigidas sobre a planta', () => {
    expect(HIDING_SPOT_COORDINATES).toEqual({
      1: { x: -67, y: 288 },
      2: { x: 164, y: -36 },
      3: { x: 149, y: 231 },
      4: { x: -205, y: 153 },
      5: { x: -172, y: -41 },
      6: { x: -82, y: -311 },
    })
    expect(OUTSIDE_DOOR_POSITION).toEqual({ x: 28, y: 350 })
  })
})
