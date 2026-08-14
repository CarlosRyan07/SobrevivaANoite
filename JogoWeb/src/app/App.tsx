import { lazy, Suspense, useEffect, useState } from 'react'

import type { BattleDifficulty } from '../battle/battleTypes'
import { GameFrame } from '../components/GameFrame/GameFrame'
import { AudioProvider } from '../contexts/AudioContext'
import { preloadGameAssets } from '../services/gameAssetPreloader'
import { battleDifficultyFromHash, useGameNavigation } from './navigation'
import { ThemeMusic } from './ThemeMusic'

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
const CuriositiesScreen = lazy(() =>
  import('../screens/CuriositiesScreen/CuriositiesScreen').then((module) => ({
    default: module.CuriositiesScreen,
  })),
)

function LoadingScreen({ completed, total }: { completed: number; total: number }) {
  return (
    <div
      role="status"
      style={{
        display: 'grid',
        width: '100%',
        height: '100%',
        placeItems: 'center',
        background: '#0a1940',
        color: '#fff1bd',
        fontFamily: "'Bungee', 'Arial Black', sans-serif",
        fontSize: 'clamp(18px, 5vw, 28px)',
        fontWeight: 400,
        textAlign: 'center',
        textShadow: '0 4px 0 #071d4f',
      }}
    >
      {total > 0 ? `PREPARANDO JOGO… ${Math.round((completed / total) * 100)}%` : 'PREPARANDO JOGO…'}
    </div>
  )
}

export function App() {
  const { route, navigate, backToMenu } = useGameNavigation()
  const [assetProgress, setAssetProgress] = useState({ completed: 0, total: 0 })
  const [assetsReady, setAssetsReady] = useState(import.meta.env.MODE === 'test')
  const battleDifficulty: BattleDifficulty = battleDifficultyFromHash(window.location.hash)
  const battleTest = import.meta.env.DEV || import.meta.env.MODE === 'visual'
    ? new URLSearchParams(window.location.search).get('battleTest')
    : null
  const battleGameOptions = battleTest
    ? {
        difficulty: battleDifficulty,
        initialEnemyHp: 1,
        enemyAiEnabled: false,
        ...(battleTest === 'perfect'
          ? { initialPlayerHp: 100, initialParryCount: 2 }
          : battleTest === 'pidao'
            ? { initialPlayerHp: 35 }
            : battleTest === 'raca'
              ? { initialPlayerHp: 70 }
              : {}),
      }
    : { difficulty: battleDifficulty }
  const frameLayout =
    route === 'menu'
      ? 'menu'
      : route === 'hide'
        ? 'gameplay'
        : route === 'battle'
          ? 'battle'
          : 'responsive'

  useEffect(() => {
    if (assetsReady) return

    let active = true
    void preloadGameAssets((completed, total) => {
      if (active) setAssetProgress({ completed, total })
    }).finally(() => {
      if (active) setAssetsReady(true)
    })

    return () => {
      active = false
    }
  }, [assetsReady])

  return (
    <AudioProvider>
      <ThemeMusic route={route} />
      <GameFrame layout={frameLayout}>
        {!assetsReady ? (
          <LoadingScreen {...assetProgress} />
        ) : (
          <Suspense fallback={<LoadingScreen completed={0} total={0} />}>
          {route === 'menu' && (
            <MenuScreen
              onHide={() => navigate('hide')}
              onBattle={(difficulty) => {
                navigate('battle', difficulty === 'hard' ? 'difficulty=hard' : undefined)
              }}
              onHistory={() => navigate('history')}
              onEndings={() => navigate('endings')}
              onCuriosities={() => navigate('curiosities')}
            />
          )}
          {route === 'hide' && <HideScreen onBackToMenu={backToMenu} />}
          {route === 'battle' && (
            <BattleScreen
              onBackToMenu={backToMenu}
              gameOptions={battleGameOptions}
            />
          )}
          {route === 'history' && <HistoryScreen onBack={() => navigate('menu')} />}
          {route === 'endings' && <EndingsScreen onBack={() => navigate('menu')} />}
          {route === 'curiosities' && <CuriositiesScreen onBack={() => navigate('menu')} />}
          </Suspense>
        )}
      </GameFrame>
    </AudioProvider>
  )
}
