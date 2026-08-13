import { act, renderHook } from '@testing-library/react'

import { gamePersistence } from '../persistence/gamePersistence'
import type { AudioService } from '../services/AudioService'
import type { RandomSource } from '../utils/random'
import { BATTLE_MUSIC_VOLUME, BATTLE_TIMINGS } from './battleConstants'
import { useBattleGame } from './useBattleGame'

const leftAttackRandom: RandomSource = {
  boolean: () => true,
  integer: (minimum) => minimum,
  pick: <T,>(values: readonly T[]) => values[0] as T,
  shuffle: <T,>(values: readonly T[]) => [...values],
}

const upwardScratchRandom: RandomSource = {
  boolean: () => true,
  integer: (minimum) => minimum,
  pick: <T,>(values: readonly T[]) => values[2] as T,
  shuffle: <T,>(values: readonly T[]) => [...values],
}

const lateralCutRandom: RandomSource = {
  boolean: () => true,
  integer: (minimum) => minimum,
  pick: <T,>(values: readonly T[]) => values[1] as T,
  shuffle: <T,>(values: readonly T[]) => [...values],
}

function createAudioMock(): AudioService {
  return {
    play: vi.fn(),
    stop: vi.fn(),
    fadeOut: vi.fn(),
  } as unknown as AudioService
}

describe('useBattleGame', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    localStorage.clear()
  })
  afterEach(() => vi.useRealTimers())

  it('abre a janela perfeita de 100 ms e aplica parry na direção correta', async () => {
    const audio = createAudioMock()
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

  it('mantÃ©m o mesmo tipo de golpe entre a preparaÃ§Ã£o e o ataque', async () => {
    const audio = createAudioMock()
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: upwardScratchRandom }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(3_000))
    expect(result.current.state.enemyAction).toEqual({ kind: 'preparing', direction: 'left' })
    expect(result.current.state.enemyImage).toContain(
      'psicopata_preparando_arranhada_para_cima_esquerda.webp',
    )

    await act(async () => vi.advanceTimersByTimeAsync(700))
    expect(result.current.state.enemyAction).toEqual({ kind: 'attacking', direction: 'left' })
    expect(result.current.state.enemyImage).toContain('psicopata_arranhada_para_cima_esquerda.webp')
    unmount()
  })

  it('reduz a preparaÃ§Ã£o do corte lateral sem mudar sua direÃ§Ã£o', async () => {
    const audio = createAudioMock()
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: lateralCutRandom }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(3_000))
    expect(result.current.state.enemyAction).toEqual({ kind: 'preparing', direction: 'left' })
    expect(result.current.state.enemyImage).toContain('psicopata_preparando_corte_lateral_esquerda.webp')

    await act(async () => vi.advanceTimersByTimeAsync(449))
    expect(result.current.state.enemyAction).toEqual({ kind: 'preparing', direction: 'left' })

    await act(async () => vi.advanceTimersByTimeAsync(1))
    expect(result.current.state.enemyAction).toEqual({ kind: 'attacking', direction: 'left' })
    expect(result.current.state.enemyImage).toContain('psicopata_corte_lateral_esquerda.webp')
    unmount()
  })

  it('causa 10 de dano e som forte enquanto o inimigo está atordoado', async () => {
    const audio = createAudioMock()
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
    const audio = createAudioMock()
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
    const audio = createAudioMock()
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(25_000))

    expect(result.current.state.gameResult).toBe('lose')
    expect(result.current.state.playerHp).toBe(0)
    expect(gamePersistence.getMatches()).toMatchObject([
      { gameMode: 'Batalha', wasVictory: false, finalPlayerHp: 0, parryCount: 0 },
    ])
    expect(audio.fadeOut).toHaveBeenCalledWith('battleMusic', {
      duration: BATTLE_TIMINGS.battleMusicFadeOut,
    })
    unmount()
  })

  it('ataca por 3 de dano e reseta combo depois de 1,5 segundo', async () => {
    const audio = createAudioMock()
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
    const audio = createAudioMock()
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom, initialEnemyHp: 1 }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(3_700))
    act(() => result.current.dodgeLeft())
    await act(async () => vi.advanceTimersByTimeAsync(100))
    act(() => result.current.attack())

    expect(result.current.state.enemyHp).toBe(0)
    expect(result.current.state.enemyAction).toEqual({ kind: 'defeated' })
    expect(result.current.state.rewardCode).toBe('ligeirinho')
    expect(result.current.state.victoryEnding).toBe('raca')
    expect(result.current.state.enemyImage).toContain('psicopata_atordoado.webp')
    expect(result.current.state.gameResult).toBeNull()
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { prepareMuted: true })
    expect(audio.fadeOut).toHaveBeenCalledWith('battleMusic', {
      duration: BATTLE_TIMINGS.battleMusicFadeOut,
    })
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

  it('ativa o final do Pidão somente quando a vitória ocorre abaixo de 40% de vida', async () => {
    const audio = createAudioMock()
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, {
        random: leftAttackRandom,
        initialEnemyHp: 1,
        initialPlayerHp: 39,
      }),
    )

    act(() => result.current.attack())

    expect(result.current.state.victoryEnding).toBe('pidao')
    expect(gamePersistence.getEndingProgress()).toEqual({ discoveredEndings: ['pidao'] })
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { prepareMuted: true })

    await act(async () => vi.advanceTimersByTimeAsync(5_500))
    expect(result.current.state.gameResult).toBe('win')
    expect(result.current.state.playerImage).toContain('rat_dance.gif')
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { resumePrepared: true })
    expect(gamePersistence.getMatches()).toMatchObject([
      { gameMode: 'Batalha', wasVictory: true, finalPlayerHp: 39 },
    ])
    unmount()

    localStorage.clear()
    const boundaryBattle = renderHook(() =>
      useBattleGame(audio, {
        random: leftAttackRandom,
        initialEnemyHp: 1,
        initialPlayerHp: 40,
      }),
    )
    act(() => boundaryBattle.result.current.attack())
    expect(boundaryBattle.result.current.state.victoryEnding).toBe('raca')
    boundaryBattle.unmount()
  })

  it('ativa o final Venceu na Raça entre 40% e menos de 80% de vida', () => {
    const audio = createAudioMock()
    const middleBattle = renderHook(() =>
      useBattleGame(audio, {
        random: leftAttackRandom,
        initialEnemyHp: 1,
        initialPlayerHp: 70,
      }),
    )

    act(() => middleBattle.result.current.attack())
    expect(middleBattle.result.current.state.victoryEnding).toBe('raca')
    middleBattle.unmount()
  })

  it('ativa o final Venceu na Raça acima de 80% quando a vitória não é perfeita', () => {
    const audio = createAudioMock()
    const battle = renderHook(() =>
      useBattleGame(audio, {
        random: leftAttackRandom,
        initialEnemyHp: 1,
        initialPlayerHp: 85,
      }),
    )

    act(() => battle.result.current.attack())

    expect(battle.result.current.state.victoryEnding).toBe('raca')
    expect(gamePersistence.getEndingProgress()).toEqual({ discoveredEndings: ['raca'] })
    battle.unmount()
  })

  it('mantém a IA e os controles pausados até o início solicitado', async () => {
    const audio = createAudioMock()
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom, startPaused: true }),
    )

    act(() => {
      result.current.attack()
      result.current.dodgeLeft()
    })
    await act(async () => vi.advanceTimersByTimeAsync(20_000))

    expect(result.current.state.enemyHp).toBe(700)
    expect(result.current.state.playerHp).toBe(100)
    expect(result.current.state.playerState).toBe('idle')
    expect(audio.play).not.toHaveBeenCalledWith('battleMusic', {
      loop: true,
      volume: BATTLE_MUSIC_VOLUME,
    })

    act(() => result.current.start())
    expect(audio.play).toHaveBeenCalledWith('battleMusic', {
      loop: true,
      volume: BATTLE_MUSIC_VOLUME,
      resumePrepared: true,
    })
    await act(async () => vi.advanceTimersByTimeAsync(4_000))
    expect(result.current.state.enemyAction.kind).not.toBe('idle')

    act(() => result.current.pause())
    const hpAtPause = result.current.state.playerHp
    expect(result.current.state.enemyAction.kind).toBe('idle')
    await act(async () => vi.advanceTimersByTimeAsync(20_000))
    expect(result.current.state.playerHp).toBe(hpAtPause)

    act(() => result.current.start())
    await act(async () => vi.advanceTimersByTimeAsync(4_000))
    expect(result.current.state.enemyAction.kind).not.toBe('idle')
    expect(
      vi.mocked(audio.play).mock.calls.filter(([sound]) => sound === 'battleMusic'),
    ).toHaveLength(1)
    unmount()
  })

  it('mantém a batalha determinística quando a IA está desativada', async () => {
    const audio = createAudioMock()
    const deterministicBattle = renderHook(() =>
      useBattleGame(audio, {
        random: leftAttackRandom,
        enemyAiEnabled: false,
        initialPlayerHp: 70,
      }),
    )
    await act(async () => vi.advanceTimersByTimeAsync(20_000))
    expect(deterministicBattle.result.current.state.playerHp).toBe(70)
    expect(deterministicBattle.result.current.state.enemyAction.kind).toBe('idle')
    deterministicBattle.unmount()
  })

  it('prioriza o final perfeito com dois parries e nenhum golpe recebido', () => {
    const audio = createAudioMock()
    const perfectBattle = renderHook(() =>
      useBattleGame(audio, {
        random: leftAttackRandom,
        initialEnemyHp: 1,
        initialParryCount: 2,
      }),
    )

    act(() => perfectBattle.result.current.attack())
    expect(perfectBattle.result.current.state.playerHp).toBe(100)
    expect(perfectBattle.result.current.state.victoryEnding).toBe('perfect')
    expect(gamePersistence.getEndingProgress()).toEqual({ discoveredEndings: ['perfect'] })
    perfectBattle.unmount()
  })

  it('ativa o final do Pidão na batalha normal após a vida cair abaixo de 40%', async () => {
    const audio = createAudioMock()
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, {
        random: leftAttackRandom,
        initialEnemyHp: 1,
      }),
    )

    await act(async () => vi.advanceTimersByTimeAsync(16_600))
    expect(result.current.state.playerHp).toBe(25)

    act(() => result.current.attack())

    expect(result.current.state.victoryEnding).toBe('pidao')
    expect(gamePersistence.getEndingProgress()).toEqual({ discoveredEndings: ['pidao'] })
    await act(async () => vi.advanceTimersByTimeAsync(5_500))
    expect(result.current.state.gameResult).toBe('win')
    unmount()
  })

  it('persiste o recorde conforme o combo acelera desde o segundo golpe', async () => {
    const audio = createAudioMock()
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom }),
    )

    act(() => result.current.attack())
    await act(async () => vi.advanceTimersByTimeAsync(300))
    act(() => result.current.attack())

    expect(result.current.state.highCombo).toBe(2)
    expect(gamePersistence.getHighCombo()).toBe(2)
    unmount()

    const nextRound = renderHook(() => useBattleGame(audio, { random: leftAttackRandom }))
    expect(nextRound.result.current.state.highCombo).toBe(2)
    nextRound.unmount()
  })

  it('exibe a recompensa somente na primeira vitória', () => {
    const audio = createAudioMock()
    gamePersistence.discoverCode('ligeirinho')
    const { result, unmount } = renderHook(() =>
      useBattleGame(audio, { random: leftAttackRandom, initialEnemyHp: 1 }),
    )

    act(() => result.current.attack())

    expect(result.current.state.enemyHp).toBe(0)
    expect(result.current.state.rewardCode).toBeNull()
    unmount()
  })

  it('aplica a velocidade rápida somente quando LIGEIRINHO está ativo', async () => {
    const audio = createAudioMock()
    const normalBattle = renderHook(() => useBattleGame(audio, { random: leftAttackRandom }))

    act(() => normalBattle.result.current.attack())
    await act(async () => vi.advanceTimersByTimeAsync(250))
    expect(normalBattle.result.current.state.playerState).toBe('attacking')
    await act(async () => vi.advanceTimersByTimeAsync(50))
    expect(normalBattle.result.current.state.playerState).toBe('idle')
    normalBattle.unmount()

    gamePersistence.redeemCode('ligeirinho')
    const fastBattle = renderHook(() => useBattleGame(audio, { random: leftAttackRandom }))
    act(() => fastBattle.result.current.attack())
    await act(async () => vi.advanceTimersByTimeAsync(250))

    expect(fastBattle.result.current.state.playerState).toBe('idle')
    fastBattle.unmount()
  })
})
