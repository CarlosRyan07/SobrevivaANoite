import {
  attackDamage,
  comboColor,
  createInitialBattleState,
  hpPalette,
  nextAttackSpeed,
  resolveEnemyAttack,
  victoryEndingForPerformance,
} from './battleEngine'
import { LIGEIRINHO_ATTACK_SPEED_PROFILE } from './battleConstants'

describe('engine da batalha', () => {
  it('mantém HP e estado inicial do Android', () => {
    expect(createInitialBattleState()).toMatchObject({
      playerHp: 100,
      enemyHp: 700,
      playerState: 'idle',
      enemyAction: { kind: 'idle' },
      gameResult: null,
      playerComboStep: 0,
      highCombo: 0,
    })
  })

  it('distingue parry, esquiva antecipada e dano', () => {
    const attack = { kind: 'attacking', direction: 'left' } as const
    expect(resolveEnemyAttack(attack, 'left', 'perfect')).toBe('parry')
    expect(resolveEnemyAttack(attack, 'left', 'early')).toBe('early-dodge')
    expect(resolveEnemyAttack(attack, 'right', 'perfect')).toBe('hit')
    expect(resolveEnemyAttack(attack, null, 'none')).toBe('hit')
  })

  it('preserva dano normal e dano durante stun', () => {
    expect(attackDamage(false)).toBe(3)
    expect(attackDamage(true)).toBe(10)
  })

  it('seleciona o final pela vida restante na vitória', () => {
    const ending = (playerHp: number, parryCount = 0, hitsReceived = 0) =>
      victoryEndingForPerformance({ playerHp, parryCount, hitsReceived })

    expect(ending(100)).toBe('raca')
    expect(ending(80)).toBe('raca')
    expect(ending(79)).toBe('raca')
    expect(ending(40)).toBe('raca')
    expect(ending(39)).toBe('pidao')
    expect(ending(0)).toBe('pidao')
    expect(ending(100, 2)).toBe('perfect')
    expect(ending(100, 1)).toBe('raca')
    expect(ending(85, 2)).toBe('raca')
    expect(ending(100, 2, 1)).toBe('raca')
  })

  it('usa o ritmo antigo por padrão e o ritmo rápido com LIGEIRINHO', () => {
    expect(nextAttackSpeed(300, 1)).toBe(300)
    expect(nextAttackSpeed(300, 2)).toBe(235)
    expect(nextAttackSpeed(235, 3)).toBe(170)
    expect(nextAttackSpeed(170, 4)).toBe(115)
    expect(nextAttackSpeed(115, 5)).toBe(115)

    expect(nextAttackSpeed(250, 2, LIGEIRINHO_ATTACK_SPEED_PROFILE)).toBe(175)
    expect(nextAttackSpeed(175, 3, LIGEIRINHO_ATTACK_SPEED_PROFILE)).toBe(100)
    expect(nextAttackSpeed(100, 4, LIGEIRINHO_ATTACK_SPEED_PROFILE)).toBe(100)
  })

  it('mantém limites estritos das cores de HP e combo', () => {
    expect(hpPalette(0.81).end).toBe('#2e7d32')
    expect(hpPalette(0.8).end).toBe('#afb42b')
    expect(hpPalette(0.2).end).toBe('#c62828')
    expect(comboColor(14)).toBe('#ffffff')
    expect(comboColor(15)).toBe('#ffeb3b')
    expect(comboColor(30)).toBe('#f57c00')
    expect(comboColor(50)).toBe('#d32f2f')
  })
})
