import { createSequenceRandom } from './random'

describe('RandomSource determinístico', () => {
  it('reproduz booleanos, inteiros, escolhas e embaralhamento', () => {
    const random = createSequenceRandom([0.1, 0.75, 0.5, 0])

    expect(random.boolean()).toBe(true)
    expect(random.integer(1, 5)).toBe(4)
    expect(random.pick(['a', 'b', 'c'])).toBe('b')
    expect(random.shuffle([1, 2, 3])).toHaveLength(3)
  })
})
