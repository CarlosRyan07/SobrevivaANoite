import { useCallback, useEffect, useState } from 'react'

export type GameRoute = 'menu' | 'hide' | 'battle' | 'history'

export function routeFromHash(hash: string): GameRoute {
  const route = hash.replace(/^#\/?/, '')
  if (route === 'hide' || route === 'battle' || route === 'history') return route
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
    if (window.location.hash === nextHash) {
      setRoute(nextRoute)
      return
    }
    window.location.hash = nextHash
  }, [])

  const backToMenu = useCallback(() => {
    setRoute('menu')
    window.location.hash = '#/lore'
  }, [])

  return { route, navigate, backToMenu }
}
