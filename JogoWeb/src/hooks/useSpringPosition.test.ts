import { advanceCriticalSpring } from './useSpringPosition'

describe('spring equivalente ao Compose', () => {
  it('converge sem oscilação para o alvo com rigidez 1500', () => {
    let value = { position: 500, velocity: 0 }
    const samples: number[] = []

    for (let frame = 0; frame < 30; frame += 1) {
      value = advanceCriticalSpring(value, 50, 1 / 60)
      samples.push(value.position)
    }

    expect(samples.every((sample, index) => index === 0 || sample <= (samples[index - 1] ?? Infinity))).toBe(true)
    expect(value.position).toBeCloseTo(50, 4)
  })
})
