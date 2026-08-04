import { useCallback, useEffect, useState } from 'react'

export type GameRoute = 'menu' | 'hide' | 'battle' | 'history' | 'endings'

export function routeFromHash(hash: string): GameRoute {
  const route = hash.replace(/^#\/?/, '')
  if (route === 'hide' || route === 'battle' || route === 'history' || route === 'endings') {
    return route
  }
  return 'menu'
}

function hashForRoute(route: GameRoute): string {
  return route === 'menu' ? '' : `#/${route}`
}

export function useGameNavigation() {
  const [route, setRoute] = useState<GameRoute>(() => routeFromHash(window.location.hash))

  useEffect(() => {
    const handleHashChange = () => setRoute(routeFromHash(window.location.hash))
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const navigate = useCallback((nextRoute: GameRoute) => {
    const nextHash = hashForRoute(nextRoute)
    setRoute(nextRoute)
    if (window.location.hash !== nextHash) window.location.hash = nextHash
  }, [])

  const backToMenu = useCallback(() => navigate('menu'), [navigate])

  return { route, navigate, backToMenu }
}
