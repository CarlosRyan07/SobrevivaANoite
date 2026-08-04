import type { GameCodeId } from '../codes/gameCodes'
import type { GameEndingId } from '../endings/gameEndings'

export type AttackDirection = 'left' | 'right'

export type EnemyAction =
  | { kind: 'idle' }
  | { kind: 'preparing'; direction: AttackDirection }
  | { kind: 'attacking'; direction: AttackDirection }
  | { kind: 'stunned' }
  | { kind: 'recovering' }
  | { kind: 'defeated' }

export type DodgeTiming = 'none' | 'early' | 'perfect'
export type PlayerState = 'idle' | 'attacking' | 'dodging' | 'stunned'
export type BattleResult = 'win' | 'lose' | null
export type VictoryEnding = GameEndingId

export interface BattleState {
  playerHp: number
  playerImage: string
  playerState: PlayerState
  enemyHp: number
  enemyAction: EnemyAction
  enemyImage: string
  gameResult: BattleResult
  playerComboStep: number
  highCombo: number
  round: number
  rewardCode: GameCodeId | null
  victoryEnding: VictoryEnding | null
}
