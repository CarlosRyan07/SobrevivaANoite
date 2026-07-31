import { GamePersistence, STORAGE_KEYS } from './gamePersistence'

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
})
