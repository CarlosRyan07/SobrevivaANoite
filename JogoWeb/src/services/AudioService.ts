import { audioCatalog, type SoundKey } from './audioCatalog'

type AudioFactory = (source: string) => HTMLAudioElement

interface ActiveVoice {
  key: SoundKey
  audio: HTMLAudioElement
  prepared: boolean
  cleanup: () => void
  fadeDelayTimer: number | null
  fadeStepTimer: number | null
}

export interface PlaySoundOptions {
  prepareMuted?: boolean
  resumePrepared?: boolean
  loop?: boolean
  volume?: number
}

export interface FadeOutOptions {
  delay?: number
  duration?: number
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
        preparedVoice.audio.volume = Math.min(Math.max(options.volume ?? 1, 0), 1)
        if (options.loop !== undefined) preparedVoice.audio.loop = options.loop
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
    audio.volume = options.prepareMuted
      ? 0
      : Math.min(Math.max(options.volume ?? 1, 0), 1)
    audio.playbackRate = 1
    audio.loop = options.loop ?? false

    const cleanup = () => {
      audio.removeEventListener('ended', cleanup)
      audio.removeEventListener('error', cleanup)
      const index = this.activeVoices.findIndex((voice) => voice.audio === audio)
      if (index >= 0) {
        this.clearFadeTimers(this.activeVoices[index])
        this.activeVoices.splice(index, 1)
      }
    }

    const voice = {
      key,
      audio,
      prepared: options.prepareMuted === true,
      cleanup,
      fadeDelayTimer: null,
      fadeStepTimer: null,
    }
    audio.addEventListener('ended', cleanup, { once: true })
    audio.addEventListener('error', cleanup, { once: true })
    this.activeVoices.push(voice)

    void audio.play().catch(cleanup)
  }

  fadeOut(key: SoundKey, options: FadeOutOptions = {}): void {
    const delay = Math.max(options.delay ?? 0, 0)
    const duration = Math.max(options.duration ?? 3_000, 0)

    this.activeVoices
      .filter((voice) => voice.key === key)
      .forEach((voice) => {
        this.clearFadeTimers(voice)

        const beginFade = () => {
          voice.fadeDelayTimer = null
          if (!this.activeVoices.includes(voice)) return
          if (duration === 0) {
            this.stopVoice(voice)
            return
          }

          const initialVolume = voice.audio.volume
          const stepMilliseconds = 50
          let elapsed = 0
          voice.fadeStepTimer = window.setInterval(() => {
            elapsed = Math.min(elapsed + stepMilliseconds, duration)
            voice.audio.volume = initialVolume * (1 - elapsed / duration)
            if (elapsed >= duration) this.stopVoice(voice)
          }, stepMilliseconds)
        }

        if (delay === 0) beginFade()
        else voice.fadeDelayTimer = window.setTimeout(beginFade, delay)
      })
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
    this.clearFadeTimers(voice)
    voice.audio.pause()
    voice.audio.currentTime = 0
    voice.cleanup()
  }

  private clearFadeTimers(voice: ActiveVoice | undefined): void {
    if (!voice) return
    if (voice.fadeDelayTimer !== null) window.clearTimeout(voice.fadeDelayTimer)
    if (voice.fadeStepTimer !== null) window.clearInterval(voice.fadeStepTimer)
    voice.fadeDelayTimer = null
    voice.fadeStepTimer = null
  }
}
