import { images } from '../services/assetPaths'
import {
  DEFAULT_ATTACK_SPEED_PROFILE,
  ENEMY_MAX_HP,
  NORMAL_ATTACK_DAMAGE,
  PIDAO_ENDING_HP_THRESHOLD,
  PLAYER_MAX_HP,
  RACA_ENDING_HP_THRESHOLD,
  STUNNED_ATTACK_DAMAGE,
  type AttackSpeedProfile,
} from './battleConstants'
import type {
  AttackDirection,
  BattleState,
  DodgeTiming,
  EnemyAction,
  VictoryEnding,
} from './battleTypes'

export type EnemyAttackResolution = 'parry' | 'early-dodge' | 'hit'

export function createInitialBattleState(
  round = 0,
  enemyHp = ENEMY_MAX_HP,
  highCombo = 0,
  playerHp = PLAYER_MAX_HP,
): BattleState {
  return {
    playerHp: Math.min(Math.max(playerHp, 0), PLAYER_MAX_HP),
    playerImage: images.survivor.idle,
    playerState: 'idle',
    enemyHp: Math.min(Math.max(enemyHp, 0), ENEMY_MAX_HP),
    enemyAction: { kind: 'idle' },
    enemyImage: images.enemy.idle,
    gameResult: null,
    playerComboStep: 0,
    highCombo,
    round,
    rewardCode: null,
    victoryEnding: null,
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

interface VictoryPerformance {
  playerHp: number
  parryCount: number
  hitsReceived: number
}

export function victoryEndingForPerformance({
  playerHp,
  parryCount,
  hitsReceived,
}: VictoryPerformance): VictoryEnding {
  if (playerHp === PLAYER_MAX_HP && hitsReceived === 0 && parryCount >= 3) return 'perfect'
  if (playerHp < PIDAO_ENDING_HP_THRESHOLD) return 'pidao'
  if (playerHp < RACA_ENDING_HP_THRESHOLD) return 'raca'
  return 'standard'
}

export function nextAttackSpeed(
  currentSpeed: number,
  comboStep: number,
  profile: AttackSpeedProfile = DEFAULT_ATTACK_SPEED_PROFILE,
): number {
  if (comboStep < 2) return currentSpeed
  return Math.max(currentSpeed - profile.reduction, profile.minimum)
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

export const DEFAULT_ATTACK_SPEED = DEFAULT_ATTACK_SPEED_PROFILE.initial
