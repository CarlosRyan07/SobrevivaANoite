import { act, renderHook, waitFor } from '@testing-library/react'

import { gamePersistence } from '../persistence/gamePersistence'
import type { AudioService } from '../services/AudioService'
import type { RandomSource } from '../utils/random'
import { useHideGame } from './useHideGame'

function fixedRandom(foundPlayer: boolean): RandomSource {
  return {
    boolean: () => foundPlayer,
    integer: (minimum) => minimum,
    pick: <T,>(values: readonly T[]) => values[0] as T,
    shuffle: <T,>(values: readonly T[]) => [...values],
  }
}

const immediateDelay = () => Promise.resolve()

describe('useHideGame', () => {
  beforeEach(() => localStorage.clear())
  afterEach(() => vi.useRealTimers())

  it('derrota o jogador após os mesmos dez segundos sem escolha', async () => {
    vi.useFakeTimers()
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result, unmount } = renderHook(() =>
      useHideGame(audio, { random: fixedRandom(false) }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(10_000))

    expect(result.current.state.phase).toMatchObject({
      kind: 'result',
      customMessage: 'Você foi pego antes mesmo de conseguir se esconder.',
    })
    expect(audio.play).toHaveBeenCalledWith('hideLose')
    expect(gamePersistence.getMatches()).toMatchObject([
      { gameMode: 'Esconde-Esconde', wasVictory: false, finalPlayerHp: 0, parryCount: 0 },
    ])
    unmount()
  })

  it('mantém a derrota de 50% quando o jogador é encontrado', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result } = renderHook(() =>
      useHideGame(audio, { random: fixedRandom(true), delay: immediateDelay }),
    )

    act(() => result.current.chooseHidingSpot(1))

    await waitFor(() => expect(result.current.state.phase.kind).toBe('result'))
    expect(result.current.state.phase).toMatchObject({
      didPlayerWin: false,
      playerChoice: 1,
      customMessage: null,
    })
    expect(audio.play).toHaveBeenCalledWith('tenseMusic')
    expect(audio.stop).toHaveBeenCalledWith('tenseMusic')
    expect(audio.play).toHaveBeenCalledWith('hideLose')
    expect(gamePersistence.getMatches()).toMatchObject([
      { gameMode: 'Esconde-Esconde', wasVictory: false, finalPlayerHp: 0, parryCount: 0 },
    ])
  })

  it('adiciona um substituto e deixa exatamente outro NPC vivo quando o jogador escapa', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result } = renderHook(() =>
      useHideGame(audio, { random: fixedRandom(false), delay: immediateDelay }),
    )

    act(() => result.current.chooseHidingSpot(1))

    await waitFor(() => expect(result.current.state.phase.kind).toBe('result'))
    expect(result.current.state.phase).toMatchObject({
      didPlayerWin: true,
      playerChoice: 1,
      otherSurvivor: 6,
    })
    expect(Object.values(result.current.state.players).filter((status) => status === 'dead')).toHaveLength(4)
    expect(audio.play).toHaveBeenCalledWith('hideWin')
    expect(audio.stop).toHaveBeenCalledWith('tenseMusic')
    expect(gamePersistence.getMatches()).toMatchObject([
      { gameMode: 'Esconde-Esconde', wasVictory: true, finalPlayerHp: 100, parryCount: 0 },
    ])

    const playMock = vi.mocked(audio.play).mock
    const stopMock = vi.mocked(audio.stop).mock
    const tensionPlayIndex = playMock.calls.findIndex(([key]) => key === 'tenseMusic')
    const tensionPlayOrder = playMock.invocationCallOrder[tensionPlayIndex] ?? 0
    const returnFootstepsOrder = playMock.calls.reduce<number | null>((found, [key], index) => {
      const order = playMock.invocationCallOrder[index] ?? 0
      return found === null && key === 'footsteps' && order > tensionPlayOrder ? order : found
    }, null)
    const tensionStopOrder = stopMock.invocationCallOrder.find((order) => order > tensionPlayOrder)

    expect(tensionStopOrder).toBeDefined()
    expect(returnFootstepsOrder).not.toBeNull()
    expect(tensionStopOrder).toBeLessThan(returnFootstepsOrder as number)
  })
})
