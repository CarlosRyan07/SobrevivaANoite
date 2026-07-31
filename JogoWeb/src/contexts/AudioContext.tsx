import { type PropsWithChildren, useEffect, useState } from 'react'

import { androidPreloadedSounds } from '../services/audioCatalog'
import { AudioService } from '../services/AudioService'
import { AudioContext } from './audioContextValue'

export function AudioProvider({ children }: PropsWithChildren) {
  const [service] = useState(() => new AudioService(10))

  useEffect(() => {
    service.preload(androidPreloadedSounds)
    return () => service.release()
  }, [service])

  return <AudioContext value={service}>{children}</AudioContext>
}
