export interface RandomSource {
  boolean(): boolean
  integer(minInclusive: number, maxExclusive: number): number
  pick<T>(values: readonly T[]): T
  shuffle<T>(values: readonly T[]): T[]
}
function assertNotEmpty<T>(values: readonly T[]): asserts values is readonly [T, ...T[]] {
  if (values.length === 0) {
    throw new Error('Não é possível sortear uma lista vazia.')
  }
}

export const defaultRandom: RandomSource = {
  boolean: () => Math.random() < 0.5,
  integer: (minInclusive, maxExclusive) => {
    if (!Number.isInteger(minInclusive) || !Number.isInteger(maxExclusive)) {
      throw new Error('Os limites do sorteio precisam ser inteiros.')
    }
    if (maxExclusive <= minInclusive) {
      throw new Error('O limite máximo precisa ser maior que o mínimo.')
    }

    return Math.floor(Math.random() * (maxExclusive - minInclusive)) + minInclusive
  },
  pick: <T>(values: readonly T[]) => {
    assertNotEmpty(values)
    return values[Math.floor(Math.random() * values.length)] as T
  },
  shuffle: <T>(values: readonly T[]) => {
    const shuffled = [...values]
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const otherIndex = Math.floor(Math.random() * (index + 1))
      const current = shuffled[index] as T
      shuffled[index] = shuffled[otherIndex] as T
      shuffled[otherIndex] = current
    }
    return shuffled
  },
}

export function createSequenceRandom(sequence: readonly number[]): RandomSource {
  let cursor = 0

  const next = () => {
    const value = sequence[cursor % sequence.length]
    cursor += 1
    return value ?? 0
  }

  return {
    boolean: () => next() < 0.5,
    integer: (minInclusive, maxExclusive) =>
      minInclusive + Math.floor(next() * (maxExclusive - minInclusive)),
    pick: <T>(values: readonly T[]) => {
      assertNotEmpty(values)
      const index = Math.min(Math.floor(next() * values.length), values.length - 1)
      return values[index] as T
    },
    shuffle: <T>(values: readonly T[]) => {
      const copy = [...values]
      for (let index = copy.length - 1; index > 0; index -= 1) {
        const otherIndex = Math.min(Math.floor(next() * (index + 1)), index)
        const current = copy[index] as T
        copy[index] = copy[otherIndex] as T
        copy[otherIndex] = current
      }
      return copy
    },
  }
}
