import { dodgeDirectionForKey } from './battleKeyboard'

describe('teclado da batalha', () => {
  it.each([
    ['ArrowLeft', 'left'],
    ['a', 'left'],
    ['A', 'left'],
    ['ArrowRight', 'right'],
    ['d', 'right'],
    ['D', 'right'],
    ['Enter', null],
  ] as const)('mapeia a tecla %s para %s', (key, direction) => {
    expect(dodgeDirectionForKey(key)).toBe(direction)
  })
})
