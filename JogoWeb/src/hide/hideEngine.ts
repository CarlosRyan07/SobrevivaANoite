import { images } from '../services/assetPaths'
import type { RandomSource } from '../utils/random'
import { OFF_SCREEN_POSITION, ROOMS } from './hideConstants'
import type { HideState, PlayerStatus, RoomNumber } from './hideTypes'

export function initialPlayers(): Record<RoomNumber, PlayerStatus> {
  return {
    1: 'hiding',
    2: 'hiding',
    3: 'hiding',
    4: 'hiding',
    5: 'hiding',
    6: 'hiding',
  }
}
export function createInitialHideState(random: RandomSource, round = 0): HideState {
  return {
    phase: { kind: 'choosing' },
    players: initialPlayers(),
    psychopathPosition: OFF_SCREEN_POSITION,
    background: 'withDoor',
    psychopathImage: random.pick(images.killers),
    isFacingRight: false,
    countdown: 10,
    playerChoice: null,
    round,
  }
}

export function createSearchPath(random: RandomSource): RoomNumber[] {
  return random.shuffle(ROOMS).slice(0, 4)
}

export function findReplacementTarget(
  remainingPath: readonly RoomNumber[],
  playerChoice: RoomNumber,
  players: Readonly<Record<RoomNumber, PlayerStatus>>,
): RoomNumber | null {
  return (
    ROOMS.find(
      (room) =>
        room !== playerChoice && !remainingPath.includes(room) && players[room] === 'hiding',
    ) ?? null
  )
}

export function findOtherSurvivor(
  players: Readonly<Record<RoomNumber, PlayerStatus>>,
  playerChoice: RoomNumber,
): RoomNumber | null {
  return ROOMS.find((room) => room !== playerChoice && players[room] === 'hiding') ?? null
}
