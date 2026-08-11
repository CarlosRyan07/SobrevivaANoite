import { useCallback, useEffect, useRef } from 'react'

import { useAudio } from '../contexts/audioContextValue'

import type { GameRoute } from './navigation'

// Ajuste este valor entre 0 (mudo) e 1 (volume máximo).
export const MENU_THEME_VOLUME = 0.30

const MENU_THEME_FADE_OUT_DURATION = 450

interface ThemeMusicProps {
  route: GameRoute
}

function isThemeRoute(route: GameRoute): boolean {
  return route !== 'hide' && route !== 'battle'
}

export function ThemeMusic({ route }: ThemeMusicProps) {
  const audio = useAudio()
  const hasUserInteracted = useRef(false)
  const themeEnabled = isThemeRoute(route)

  const startTheme = useCallback(() => {
    if (!themeEnabled || audio.isActive('menuTheme')) return
    audio.play('menuTheme', { loop: true, volume: MENU_THEME_VOLUME })
  }, [audio, themeEnabled])

  useEffect(() => {
    const unlockAudio = () => {
      hasUserInteracted.current = true
      startTheme()
    }

    window.addEventListener('pointerdown', unlockAudio)
    window.addEventListener('keydown', unlockAudio)
    return () => {
      window.removeEventListener('pointerdown', unlockAudio)
      window.removeEventListener('keydown', unlockAudio)
    }
  }, [startTheme])

  useEffect(() => {
    if (!themeEnabled) {
      audio.fadeOut('menuTheme', { duration: MENU_THEME_FADE_OUT_DURATION })
      return
    }

    if (hasUserInteracted.current) startTheme()
  }, [audio, startTheme, themeEnabled])

  return null
}
