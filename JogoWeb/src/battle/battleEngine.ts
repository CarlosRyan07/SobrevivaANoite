import { images } from '../services/assetPaths'
import {
  ATTACK_SPEED_STEP,
  ENEMY_MAX_HP,
  INITIAL_ATTACK_SPEED,
  MINIMUM_ATTACK_SPEED,
  NORMAL_ATTACK_DAMAGE,
  PLAYER_MAX_HP,
  STUNNED_ATTACK_DAMAGE,
} from './battleConstants'
import type { AttackDirection, BattleState, DodgeTiming, EnemyAction } from './battleTypes'

export type EnemyAttackResolution = 'parry' | 'early-dodge' | 'hit'

export function createInitialBattleState(
  round = 0,
  enemyHp = ENEMY_MAX_HP,
  highCombo = 0,
): BattleState {
  return {
    playerHp: PLAYER_MAX_HP,
    playerImage: images.survivor.idle,
    playerState: 'idle',
    enemyHp: Math.min(Math.max(enemyHp, 0), ENEMY_MAX_HP),
    enemyAction: { kind: 'idle' },
    enemyImage: images.enemy.idle,
    gameResult: null,
    playerComboStep: 0,
    highCombo,
    round,
  }
}

export function resolveEnemyAttack(
  action: EnemyAction,
  dodgeIntent: AttackDirection | null,
  dodgeTiming: DodgeTiming,
): EnemyAttackResolution {
  if (action.kind !== 'attacking') return 'hit'
  const correctDirection = dodgeIntent === action.direction
  if (correctDirection && dodgeTiming === 'perfect') return 'parry'
  if (correctDirection && dodgeTiming === 'early') return 'early-dodge'
  return 'hit'
}

export function attackDamage(enemyIsStunned: boolean): number {
  return enemyIsStunned ? STUNNED_ATTACK_DAMAGE : NORMAL_ATTACK_DAMAGE
}

export function nextAttackSpeed(currentSpeed: number, comboStep: number): number {
  if (comboStep < 2) return currentSpeed
  return Math.max(currentSpeed - ATTACK_SPEED_STEP, MINIMUM_ATTACK_SPEED)
}

export interface HpPalette {
  start: string
  end: string
}

export function hpPalette(percentage: number): HpPalette {
  if (percentage > 0.8) return { start: '#66bb6a', end: '#2e7d32' }
  if (percentage > 0.6) return { start: '#dce775', end: '#afb42b' }
  if (percentage > 0.4) return { start: '#fff176', end: '#fbc02d' }
  if (percentage > 0.2) return { start: '#ffa726', end: '#f57f17' }
  return { start: '#e57373', end: '#c62828' }
}

export function comboColor(comboCount: number): string {
  if (comboCount >= 50) return '#d32f2f'
  if (comboCount >= 30) return '#f57c00'
  if (comboCount >= 15) return '#ffeb3b'
  return '#ffffff'
}

export const DEFAULT_ATTACK_SPEED = INITIAL_ATTACK_SPEED
