import { routeFromHash } from './navigation'

describe('navegação', () => {
  it.each([
    ['', 'menu'],
    ['#/', 'menu'],
    ['#/hide', 'hide'],
    ['#/battle', 'battle'],
    ['#/history', 'history'],
    ['#/desconhecida', 'menu'],
  ] as const)('converte %s para %s', (hash, expected) => {
    expect(routeFromHash(hash)).toBe(expected)
  })
})
