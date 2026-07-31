export const PLAYER_MAX_HP = 100
export const ENEMY_MAX_HP = 700
export const PLAYER_DAMAGE = 15
export const NORMAL_ATTACK_DAMAGE = 3
export const STUNNED_ATTACK_DAMAGE = 10

export const INITIAL_ATTACK_SPEED = 250
export const MINIMUM_ATTACK_SPEED = 100
export const ATTACK_SPEED_STEP = 75

export const BATTLE_TIMINGS = {
  initialEnemyDelay: 2_000,
  enemyIdleMinimum: 1_000,
  enemyIdleMaximumExclusive: 2_000,
  enemyPreparing: 700,
  enemyAttackWindow: 100,
  enemyRecovering: 1_200,
  enemyStunned: 4_000,
  playerDodge: 800,
  playerHit: 800,
  comboTimeout: 1_500,
  enemyHit: 1_000,
  stunnedBeforeDefeat: 1_000,
  defeatedPose: 2_000,
  survivorVictoryPose: 2_500,
} as const
