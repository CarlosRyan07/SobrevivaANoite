import { battleActionForKey, dodgeDirectionForKey } from './battleKeyboard'

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

  it.each([
    [' ', 'Space', 'attack'],
    ['Spacebar', '', 'attack'],
    ['a', 'KeyA', 'left'],
    ['ArrowRight', 'ArrowRight', 'right'],
    ['Enter', 'Enter', null],
  ] as const)('mapeia %s/%s para a ação %s', (key, code, action) => {
    expect(battleActionForKey(key, code)).toBe(action)
  })
})
