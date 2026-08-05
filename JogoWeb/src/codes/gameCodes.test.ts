import { findGameCode, normalizeGameCode } from './gameCodes'

describe('catálogo de códigos', () => {
  it('aceita o código sem diferenciar espaços ou maiúsculas', () => {
    expect(findGameCode('  LIGEIRINHO  ')?.id).toBe('ligeirinho')
    expect(findGameCode('ligeirinho')?.id).toBe('ligeirinho')
  })

  it('normaliza acentos e rejeita códigos desconhecidos', () => {
    expect(normalizeGameCode(' CÓDIGO ')).toBe('codigo')
    expect(findGameCode('velocista')).toBeNull()
  })
})
