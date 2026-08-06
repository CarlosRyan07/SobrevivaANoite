import { act, renderHook } from '@testing-library/react'

import { routeFromHash, useGameNavigation } from './navigation'

describe('navegação', () => {
  afterEach(() => window.history.replaceState(null, '', '/'))

  it.each([
    ['', 'menu'],
    ['#/', 'menu'],
    ['#/hide', 'hide'],
    ['#/battle', 'battle'],
    ['#/history', 'history'],
    ['#/endings', 'endings'],
    ['#/curiosities', 'curiosities'],
    ['#/desconhecida', 'menu'],
  ] as const)('converte %s para %s', (hash, expected) => {
    expect(routeFromHash(hash)).toBe(expected)
  })

  it('volta de um modo para a tela inicial, sem reabrir a lore', () => {
    window.location.hash = '#/battle'
    const { result } = renderHook(() => useGameNavigation())

    act(() => result.current.backToMenu())

    expect(result.current.route).toBe('menu')
    expect(window.location.hash).toBe('')
  })
})
