import type { AttackDirection } from './battleTypes'

export function dodgeDirectionForKey(key: string): AttackDirection | null {
  const normalizedKey = key.toLowerCase()
  if (normalizedKey === 'arrowleft' || normalizedKey === 'a') return 'left'
  if (normalizedKey === 'arrowright' || normalizedKey === 'd') return 'right'
  return null
}
