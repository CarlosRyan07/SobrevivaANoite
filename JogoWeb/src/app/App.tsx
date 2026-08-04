import { lazy, Suspense } from 'react'

import { GameFrame } from '../components/GameFrame/GameFrame'
import { AudioProvider } from '../contexts/AudioContext'
import { useGameNavigation } from './navigation'

const MenuScreen = lazy(() =>
  import('../screens/MenuScreen/MenuScreen').then((module) => ({ default: module.MenuScreen })),
)
const HideScreen = lazy(() =>
  import('../screens/HideScreen/HideScreen').then((module) => ({ default: module.HideScreen })),
)
const BattleScreen = lazy(() =>
  import('../screens/BattleScreen/BattleScreen').then((module) => ({ default: module.BattleScreen })),
)
const HistoryScreen = lazy(() =>
  import('../screens/HistoryScreen/HistoryScreen').then((module) => ({ default: module.HistoryScreen })),
)
const EndingsScreen = lazy(() =>
  import('../screens/EndingsScreen/EndingsScreen').then((module) => ({ default: module.EndingsScreen })),
)

function LoadingScreen() {
  return (
    <div
      role="status"
      style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        placeItems: 'center',
        background: '#0a1940',
        color: '#fff',
      }}
    >
      Carregando…
    </div>
  )
}

export function App() {
  const { route, navigate, backToMenu } = useGameNavigation()
  const battleTest = import.meta.env.DEV || import.meta.env.MODE === 'visual'
    ? new URLSearchParams(window.location.search).get('battleTest')
    : null
  const frameLayout =
    route === 'menu'
      ? 'menu'
      : route === 'hide'
        ? 'gameplay'
        : route === 'battle'
          ? 'battle'
          : 'responsive'

  return (
    <AudioProvider>
      <GameFrame layout={frameLayout}>
        <Suspense fallback={<LoadingScreen />}>
          {route === 'menu' && (
            <MenuScreen
              onHide={() => navigate('hide')}
              onBattle={() => navigate('battle')}
              onHistory={() => navigate('history')}
              onEndings={() => navigate('endings')}
            />
          )}
          {route === 'hide' && <HideScreen onBackToMenu={backToMenu} />}
          {route === 'battle' && (
            <BattleScreen
              onBackToMenu={backToMenu}
              {...(battleTest
                ? {
                    gameOptions: {
                      initialEnemyHp: 1,
                      ...(battleTest === 'perfect'
                        ? { initialPlayerHp: 100, initialParryCount: 2 }
                        : battleTest === 'pidao'
                        ? { initialPlayerHp: 35 }
                        : battleTest === 'raca'
                          ? { initialPlayerHp: 70 }
                          : {}),
                    },
                  }
                : {})}
            />
          )}
          {route === 'history' && <HistoryScreen onBack={() => navigate('menu')} />}
          {route === 'endings' && <EndingsScreen onBack={() => navigate('menu')} />}
        </Suspense>
      </GameFrame>
    </AudioProvider>
  )
}
