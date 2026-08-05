import {
  ENDING_PROGRESS_UPDATED_EVENT,
  GamePersistence,
  MATCH_HISTORY_UPDATED_EVENT,
  STORAGE_KEYS,
} from './gamePersistence'

describe('persistência do jogo', () => {
  beforeEach(() => localStorage.clear())

  it('mantém somente o maior combo entre sessões', () => {
    const persistence = new GamePersistence(localStorage)
    expect(persistence.updateHighCombo(7)).toBe(7)
    expect(persistence.updateHighCombo(4)).toBe(7)
    expect(new GamePersistence(localStorage).getHighCombo()).toBe(7)
  })

  it('salva partidas com id incremental e retorna a mais recente primeiro', () => {
    let timestamp = 1_000
    const persistence = new GamePersistence(localStorage, () => timestamp)
    const first = persistence.saveMatch({
      gameMode: 'Esconde-Esconde',
      wasVictory: true,
      finalPlayerHp: 100,
      parryCount: 0,
    })
    timestamp = 2_000
    const second = persistence.saveMatch({
      gameMode: 'Batalha',
      wasVictory: false,
      finalPlayerHp: 0,
      parryCount: 3,
    })

    expect(first.id).toBe(1)
    expect(second.id).toBe(2)
    expect(new GamePersistence(localStorage).getMatches()).toEqual([second, first])
  })

  it('ignora dados inválidos sem impedir a abertura do jogo', () => {
    localStorage.setItem(STORAGE_KEYS.highCombo, 'inválido')
    localStorage.setItem(STORAGE_KEYS.matchHistory, '{quebrado')
    const persistence = new GamePersistence(localStorage)

    expect(persistence.getHighCombo()).toBe(0)
    expect(persistence.getMatches()).toEqual([])
  })

  it('avisa a interface imediatamente quando uma partida é salva', () => {
    const persistence = new GamePersistence(localStorage)
    const listener = vi.fn()
    window.addEventListener(MATCH_HISTORY_UPDATED_EVENT, listener, { once: true })

    persistence.saveMatch({
      gameMode: 'Batalha',
      wasVictory: true,
      finalPlayerHp: 85,
      parryCount: 2,
    })

    expect(listener).toHaveBeenCalledOnce()
    expect(new GamePersistence(localStorage).getMatches()).toMatchObject([
      { gameMode: 'Batalha', wasVictory: true, finalPlayerHp: 85, parryCount: 2 },
    ])
  })

  it('persiste descoberta, resgate e ativação dos códigos', () => {
    const persistence = new GamePersistence(localStorage)

    expect(persistence.discoverCode('ligeirinho')).toBe(true)
    expect(persistence.discoverCode('ligeirinho')).toBe(false)
    expect(persistence.redeemCode('ligeirinho')).toBe(true)
    expect(persistence.isCodeActive('ligeirinho')).toBe(true)

    const nextSession = new GamePersistence(localStorage)
    expect(nextSession.getCodeProgress()).toEqual({
      discoveredCodes: ['ligeirinho'],
      redeemedCodes: ['ligeirinho'],
      activeCodes: ['ligeirinho'],
    })

    expect(nextSession.setCodeActive('ligeirinho', false)).toBe(true)
    expect(new GamePersistence(localStorage).isCodeActive('ligeirinho')).toBe(false)
  })

  it('ignora códigos desconhecidos ou ativos sem resgate no armazenamento', () => {
    localStorage.setItem(
      STORAGE_KEYS.codeProgress,
      JSON.stringify({
        discoveredCodes: ['ligeirinho', 'inexistente'],
        redeemedCodes: [],
        activeCodes: ['ligeirinho', 'inexistente'],
      }),
    )

    expect(new GamePersistence(localStorage).getCodeProgress()).toEqual({
      discoveredCodes: ['ligeirinho'],
      redeemedCodes: [],
      activeCodes: [],
    })
  })

  it('persiste os finais obtidos sem duplicar e avisa a interface', () => {
    const persistence = new GamePersistence(localStorage)
    const listener = vi.fn()
    window.addEventListener(ENDING_PROGRESS_UPDATED_EVENT, listener)

    expect(persistence.discoverEnding('raca')).toBe(true)
    expect(persistence.discoverEnding('raca')).toBe(false)
    expect(persistence.discoverEnding('perfect')).toBe(true)

    expect(new GamePersistence(localStorage).getEndingProgress()).toEqual({
      discoveredEndings: ['raca', 'perfect'],
    })
    expect(listener).toHaveBeenCalledTimes(2)
    window.removeEventListener(ENDING_PROGRESS_UPDATED_EVENT, listener)
  })

  it('ignora finais desconhecidos armazenados', () => {
    localStorage.setItem(
      STORAGE_KEYS.endingProgress,
      JSON.stringify({ discoveredEndings: ['pidao', 'inexistente'] }),
    )

    expect(new GamePersistence(localStorage).getEndingProgress()).toEqual({
      discoveredEndings: ['pidao'],
    })
  })

  it('registra que o tutorial da batalha já foi visto', () => {
    const persistence = new GamePersistence(localStorage)

    expect(persistence.hasSeenBattleTutorial()).toBe(false)
    persistence.markBattleTutorialSeen()

    expect(new GamePersistence(localStorage).hasSeenBattleTutorial()).toBe(true)
  })
})
