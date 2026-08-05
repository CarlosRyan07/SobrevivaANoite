export type RoomNumber = 1 | 2 | 3 | 4 | 5 | 6

export type PlayerStatus = 'hiding' | 'dead'

export interface Position {
  x: number
  y: number
}
export type HidePhase =
  | { kind: 'choosing' }
  | { kind: 'searching' }
  | {
      kind: 'result'
      didPlayerWin: boolean
      playerChoice: RoomNumber | null
      otherSurvivor: RoomNumber | null
      customMessage: string | null
    }

export interface HideState {
  phase: HidePhase
  players: Record<RoomNumber, PlayerStatus>
  psychopathPosition: Position
  background: 'withDoor' | 'open'
  psychopathImage: string
  isFacingRight: boolean
  countdown: number
  playerChoice: RoomNumber | null
  round: number
}
