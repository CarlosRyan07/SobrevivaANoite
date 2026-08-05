import type { AttackDirection } from './battleTypes'

export type BattleKeyboardAction = AttackDirection | 'attack'

export function dodgeDirectionForKey(key: string): AttackDirection | null {
  const normalizedKey = key.toLowerCase()
  if (normalizedKey === 'arrowleft' || normalizedKey === 'a') return 'left'
  if (normalizedKey === 'arrowright' || normalizedKey === 'd') return 'right'
  return null
}

export function battleActionForKey(key: string, code = ''): BattleKeyboardAction | null {
  const dodgeDirection = dodgeDirectionForKey(key)
  if (dodgeDirection) return dodgeDirection
  if (code === 'Space' || key === ' ' || key.toLowerCase() === 'spacebar') return 'attack'
  return null
}
