import { audioCatalog, type SoundKey } from './audioCatalog'

type AudioFactory = (source: string) => HTMLAudioElement

interface ActiveVoice {
  key: SoundKey
  audio: HTMLAudioElement
  prepared: boolean
  cleanup: () => void
}

export interface PlaySoundOptions {
  prepareMuted?: boolean
  resumePrepared?: boolean
}

export class AudioService {
  private readonly activeVoices: ActiveVoice[] = []
  private readonly preloaded = new Map<SoundKey, HTMLAudioElement>()

  constructor(
    private readonly maxStreams = 10,
    private readonly factory: AudioFactory = (source) => new Audio(source),
  ) {}

  preload(keys: readonly SoundKey[]): void {
    keys.forEach((key) => {
      if (this.preloaded.has(key)) return

      const audio = this.factory(audioCatalog[key])
      audio.preload = 'auto'
      audio.load()
      this.preloaded.set(key, audio)
    })
  }

  play(key: SoundKey, options: PlaySoundOptions = {}): void {
    if (options.resumePrepared) {
      const preparedVoice = [...this.activeVoices]
        .reverse()
        .find((voice) => voice.key === key && voice.prepared)
      if (preparedVoice) {
        preparedVoice.prepared = false
        preparedVoice.audio.currentTime = 0
        preparedVoice.audio.volume = 1
        if (preparedVoice.audio.paused) {
          void preparedVoice.audio.play().catch(preparedVoice.cleanup)
        }
        return
      }
    }

    while (this.activeVoices.length >= this.maxStreams) {
      this.stopVoice(this.activeVoices[0])
    }

    const audio = this.factory(audioCatalog[key])
    audio.preload = 'auto'
    audio.volume = options.prepareMuted ? 0 : 1
    audio.playbackRate = 1

    const cleanup = () => {
      audio.removeEventListener('ended', cleanup)
      audio.removeEventListener('error', cleanup)
      const index = this.activeVoices.findIndex((voice) => voice.audio === audio)
      if (index >= 0) this.activeVoices.splice(index, 1)
    }

    const voice = { key, audio, prepared: options.prepareMuted === true, cleanup }
    audio.addEventListener('ended', cleanup, { once: true })
    audio.addEventListener('error', cleanup, { once: true })
    this.activeVoices.push(voice)

    void audio.play().catch(cleanup)
  }

  stopAll(): void {
    ;[...this.activeVoices].forEach((voice) => this.stopVoice(voice))
  }

  stop(key: SoundKey): void {
    this.activeVoices
      .filter((voice) => voice.key === key)
      .forEach((voice) => this.stopVoice(voice))
  }

  release(): void {
    this.stopAll()
    this.preloaded.clear()
  }

  get activeStreamCount(): number {
    return this.activeVoices.length
  }

  private stopVoice(voice: ActiveVoice | undefined): void {
    if (!voice) return
    voice.audio.pause()
    voice.audio.currentTime = 0
    voice.cleanup()
  }
}
