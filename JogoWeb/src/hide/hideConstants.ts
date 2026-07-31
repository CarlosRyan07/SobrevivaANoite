import type { Position, RoomNumber } from './hideTypes'

export const ROOMS = [1, 2, 3, 4, 5, 6] as const satisfies readonly RoomNumber[]

export const HIDING_SPOT_COORDINATES: Record<RoomNumber, Position> = {
  1: { x: -67, y: 288 },
  2: { x: 164, y: -36 },
  3: { x: 149, y: 231 },
  4: { x: -205, y: 153 },
  5: { x: -172, y: -41 },
  6: { x: -82, y: -311 },
}

export const HESITATION_COORDINATES: Record<RoomNumber, Position> = {
  1: { x: -67, y: 258 },
  2: { x: 134, y: -36 },
  3: { x: 119, y: 231 },
  4: { x: -175, y: 153 },
  5: { x: -142, y: -41 },
  6: { x: -82, y: -281 },
}

export const OFF_SCREEN_POSITION: Position = { x: 28, y: 500 }
export const OUTSIDE_DOOR_POSITION: Position = { x: 28, y: 350 }
export const INSIDE_DOOR_POSITION: Position = { x: 28, y: 250 }
export const HOUSE_CENTER_POSITION: Position = { x: 0, y: 50 }

export const HIDE_TIMINGS = {
  countdownTick: 1_000,
  outsideDoor: 2_000,
  doorFrame: 50,
  backgroundFrame: 250,
  enterHouse: 1_500,
  inspectCenter: 3_000,
  hesitation: 1_500,
  hesitationPause: 1_000,
  tenseSearch: 6_000,
  reveal: 300,
  returnToCenter: 2_000,
  beforeLookingAround: 500,
  lookAroundStep: 400,
  afterLookingAround: 500,
  leaveAtDoor: 2_000,
  leaveOffScreen: 1_500,
} as const
