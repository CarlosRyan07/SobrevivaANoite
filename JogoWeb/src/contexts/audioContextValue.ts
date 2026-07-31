import { createContext, useContext } from 'react'

import type { AudioService } from '../services/AudioService'

export const AudioContext = createContext<AudioService | null>(null)

export function useAudio(): AudioService {
  const service = useContext(AudioContext)
  if (!service) {
    throw new Error('useAudio precisa ser usado dentro de AudioProvider.')
  }
  return service
}
