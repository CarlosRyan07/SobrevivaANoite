import { act, renderHook } from '@testing-library/react'

import { gamePersistence } from '../persistence/gamePersistence'
import type { AudioService } from '../services/AudioService'
import type { RandomSource } from '../utils/random'
import { useBattleGame } from './useBattleGame'

const leftAttackRandom: RandomSource = {
  boolean: () => true,
  integer: (minimum) => minimum,
  pick: <T,>(values: readonly T[]) => values[0] as T,
  shuffle: <T,>(values: readonly T[]) => [...values],
}

describe('useBattleGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => vi.useRealTimers())

  it('abre a janela perfeita de 100 ms e aplica parry na direção correta', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(3_700))
    expect(result.current.state.enemyAction).toEqual({ kind: 'attacking', direction: 'left' })

    act(() => result.current.dodgeLeft())
    await act(async () => vi.advanceTimersByTimeAsync(100))

    expect(result.current.state.enemyAction).toEqual({ kind: 'stunned' })
    expect(result.current.state.playerHp).toBe(100)
    expect(audio.play).toHaveBeenCalledWith('parry')
    unmount()
  })

  it('causa 10 de dano e som forte enquanto o inimigo está atordoado', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(3_700))
    act(() => result.current.dodgeLeft())
    await act(async () => vi.advanceTimersByTimeAsync(100))
    act(() => result.current.attack())

    expect(result.current.state.enemyHp).toBe(690)
    expect(result.current.state.playerComboStep).toBe(1)
    expect(audio.play).toHaveBeenCalledWith('strongPunch')
    unmount()
  })

  it('aplica 15 de dano quando não existe esquiva', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(3_800))

    expect(result.current.state.playerHp).toBe(85)
    expect(result.current.state.playerState).toBe('stunned')
    expect(audio.play).toHaveBeenCalledWith('enemyAttack')
    unmount()
  })

  it('salva a derrota da batalha com vida final e parries', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(25_000))

    expect(result.current.state.gameResult).toBe('lose')
    expect(result.current.state.playerHp).toBe(0)
    expect(gamePersistence.getMatches()).toMatchObject([
      { gameMode: 'Batalha', wasVictory: false, finalPlayerHp: 0, parryCount: 0 },
    ])
    unmount()
  })

  it('ataca por 3 de dano e reseta combo depois de 1,5 segundo', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom }),
    )

    act(() => result.current.attack())
    expect(result.current.state.enemyHp).toBe(697)
    expect(result.current.state.playerComboStep).toBe(1)

    await act(async () => vi.advanceTimersByTimeAsync(1_000))
    expect(result.current.state.playerComboStep).toBe(1)
    await act(async () => vi.advanceTimersByTimeAsync(500))
    expect(result.current.state.playerComboStep).toBe(0)
    expect(audio.play).toHaveBeenCalledWith('punch')
    unmount()
  })

  it('trava o combate no HP zero e preserva toda a sequência de vitória', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom, initialEnemyHp: 1 }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(3_700))
    act(() => result.current.dodgeLeft())
    await act(async () => vi.advanceTimersByTimeAsync(100))
    act(() => result.current.attack())

    expect(result.current.state.enemyHp).toBe(0)
    expect(result.current.state.enemyAction).toEqual({ kind: 'defeated' })
    expect(result.current.state.enemyImage).toContain('psicopata_atordoado.webp')
    expect(result.current.state.gameResult).toBeNull()
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { prepareMuted: true })
    expect(gamePersistence.getMatches()).toMatchObject([
      { gameMode: 'Batalha', wasVictory: true, finalPlayerHp: 100, parryCount: 1 },
    ])

    const soundCountAfterDefeat = vi.mocked(audio.play).mock.calls.length
    act(() => {
      result.current.attack()
      result.current.dodgeLeft()
    })
    expect(vi.mocked(audio.play).mock.calls).toHaveLength(soundCountAfterDefeat)

    await act(async () => vi.advanceTimersByTimeAsync(1_000))
    expect(result.current.state.enemyImage).toContain('psicopata_derrotado.webp')
    expect(result.current.state.playerImage).not.toContain('sobrevivente_vitoria.webp')

    await act(async () => vi.advanceTimersByTimeAsync(1_999))
    expect(result.current.state.playerImage).not.toContain('sobrevivente_vitoria.webp')

    await act(async () => vi.advanceTimersByTimeAsync(1))
    expect(result.current.state.playerImage).toContain('sobrevivente_vitoria.webp')
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { resumePrepared: true })

    await act(async () => vi.advanceTimersByTimeAsync(2_500))
    expect(result.current.state.playerImage).toContain('rat_dance.gif')
    expect(result.current.state.playerImage).not.toContain('fortnite')
    expect(result.current.state.gameResult).toBe('win')
    unmount()
  })

  it('persiste o recorde conforme o combo acelera desde o segundo golpe', async () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom }),
    )

    act(() => result.current.attack())
    await act(async () => vi.advanceTimersByTimeAsync(250))
    act(() => result.current.attack())

    expect(result.current.state.highCombo).toBe(2)
    expect(gamePersistence.getHighCombo()).toBe(2)
    unmount()

    const nextRound = renderHook(() => useBattleGame(audio, { random: leftAttackRandom }))
    expect(nextRound.result.current.state.highCombo).toBe(2)
    nextRound.unmount()
  })
})
