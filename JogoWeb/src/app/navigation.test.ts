import { act, renderHook } from '@testing-library/react'

import { battleDifficultyFromHash, routeFromHash, useGameNavigation } from './navigation'

describe('navegação', () => {
  afterEach(() => window.history.replaceState(null, '', '/'))

  it.each([
    ['', 'menu'],
    ['#/', 'menu'],
    ['#/hide', 'hide'],
    ['#/battle', 'battle'],
    ['#/battle?difficulty=hard', 'battle'],
    ['#/history', 'history'],
    ['#/endings', 'endings'],
    ['#/curiosities', 'curiosities'],
    ['#/desconhecida', 'menu'],
  ] as const)('converte %s para %s', (hash, expected) => {
    expect(routeFromHash(hash)).toBe(expected)
  })

  it('mantém a dificuldade Pesadelo na URL da batalha', () => {
    expect(battleDifficultyFromHash('#/battle?difficulty=hard')).toBe('hard')
    expect(battleDifficultyFromHash('#/battle')).toBe('normal')
  })

  it('volta de um modo para a tela inicial, sem reabrir a lore', () => {
    window.location.hash = '#/battle'
    const { result } = renderHook(() => useGameNavigation())

    act(() => result.current.backToMenu())

    expect(result.current.route).toBe('menu')
    expect(window.location.hash).toBe('')
  })
})
