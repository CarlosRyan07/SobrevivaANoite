import { useEffect, useRef, useState } from 'react'

import type { Position } from '../hide/hideTypes'

const COMPOSE_DEFAULT_STIFFNESS = 1_500
const VISIBILITY_THRESHOLD = 0.1

interface SpringValue {
  position: number
  velocity: number
}
export function advanceCriticalSpring(
  current: SpringValue,
  target: number,
  deltaSeconds: number,
  stiffness = COMPOSE_DEFAULT_STIFFNESS,
): SpringValue {
  const angularFrequency = Math.sqrt(stiffness)
  const offset = current.position - target
  const coefficient = current.velocity + angularFrequency * offset
  const decay = Math.exp(-angularFrequency * deltaSeconds)

  return {
    position: target + (offset + coefficient * deltaSeconds) * decay,
    velocity:
      (current.velocity - angularFrequency * coefficient * deltaSeconds) * decay,
  }
}

export function useSpringPosition(target: Position): Position {
  const physics = useRef({ x: target.x, y: target.y, velocityX: 0, velocityY: 0 })
  const [position, setPosition] = useState(target)

  useEffect(() => {
    let animationFrame = 0
    let previousTime = performance.now()

    const animate = (currentTime: number) => {
      const deltaSeconds = Math.min(Math.max((currentTime - previousTime) / 1_000, 0), 1 / 30)
      previousTime = currentTime

      const nextX = advanceCriticalSpring(
        { position: physics.current.x, velocity: physics.current.velocityX },
        target.x,
        deltaSeconds,
      )
      const nextY = advanceCriticalSpring(
        { position: physics.current.y, velocity: physics.current.velocityY },
        target.y,
        deltaSeconds,
      )

      physics.current = {
        x: nextX.position,
        y: nextY.position,
        velocityX: nextX.velocity,
        velocityY: nextY.velocity,
      }

      const settled =
        Math.abs(nextX.position - target.x) <= VISIBILITY_THRESHOLD &&
        Math.abs(nextY.position - target.y) <= VISIBILITY_THRESHOLD &&
        Math.abs(nextX.velocity) <= VISIBILITY_THRESHOLD &&
        Math.abs(nextY.velocity) <= VISIBILITY_THRESHOLD

      if (settled) {
        physics.current = { x: target.x, y: target.y, velocityX: 0, velocityY: 0 }
        setPosition(target)
        return
      }

      setPosition({ x: nextX.position, y: nextY.position })
      animationFrame = requestAnimationFrame(animate)
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target])

  return position
}
