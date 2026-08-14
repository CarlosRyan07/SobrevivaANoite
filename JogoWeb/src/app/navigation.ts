import { useCallback, useEffect, useState } from 'react'

import type { BattleDifficulty } from '../battle/battleTypes'

export type GameRoute = 'menu' | 'hide' | 'battle' | 'history' | 'endings' | 'curiosities'

export function routeFromHash(hash: string): GameRoute {
  const route = hash.replace(/^#\/?/, '').split('?')[0]
  if (
    route === 'hide' ||
    route === 'battle' ||
    route === 'history' ||
    route === 'endings' ||
    route === 'curiosities'
  ) {
    return route
  }
  return 'menu'
}

export function battleDifficultyFromHash(hash: string): BattleDifficulty {
  const [, query = ''] = hash.replace(/^#\/?/, '').split('?')
  return new URLSearchParams(query).get('difficulty') === 'hard' ? 'hard' : 'normal'
}

function hashForRoute(route: GameRoute, search?: string): string {
  if (route === 'menu') return ''
  return `#/${route}${search ? `?${search}` : ''}`
}

export function useGameNavigation() {
  const [route, setRoute] = useState<GameRoute>(() => routeFromHash(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => setRoute(routeFromHash(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback((nextRoute: GameRoute, search?: string) => {
    const nextHash = hashForRoute(nextRoute, search)
    setRoute(nextRoute)
    if (window.location.hash !== nextHash) window.location.hash = nextHash
  }, [])

  const backToMenu = useCallback(() => navigate('menu'), [navigate])

  return { route, navigate, backToMenu }
}
