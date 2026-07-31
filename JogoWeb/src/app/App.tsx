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

  return (
    <AudioProvider>
      <GameFrame>
        <Suspense fallback={<LoadingScreen />}>
          {route === 'menu' && (
            <MenuScreen
              onHide={() => navigate('hide')}
              onBattle={() => navigate('battle')}
              onHistory={() => navigate('history')}
            />
          )}
          {route === 'hide' && <HideScreen onBackToMenu={backToMenu} />}
          {route === 'battle' && <BattleScreen onBackToMenu={backToMenu} />}
          {route === 'history' && <HistoryScreen onBack={() => navigate('menu')} />}
        </Suspense>
      </GameFrame>
    </AudioProvider>
  )
}
