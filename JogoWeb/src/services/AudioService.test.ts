import { AudioService } from './AudioService'

class FakeAudio extends EventTarget {
  preload = ''
  volume = 0
  playbackRate = 0
  currentTime = 9
  paused = false
  play = vi.fn(() => Promise.resolve())
  pause = vi.fn(() => {
    this.paused = true
  })
  load = vi.fn()
}

describe('AudioService', () => {
  afterEach(() => vi.useRealTimers())

  it('preserva no máximo dez streams e interrompe o mais antigo', () => {
    const created: FakeAudio[] = []
    const service = new AudioService(10, () => {
      const audio = new FakeAudio()
      created.push(audio)
      return audio as unknown as HTMLAudioElement
    })

    for (let index = 0; index < 11; index += 1) service.play('punch')

    expect(service.activeStreamCount).toBe(10)
    expect(created[0]?.pause).toHaveBeenCalledOnce()
    expect(created[0]?.currentTime).toBe(0)
    expect(created[10]?.play).toHaveBeenCalledOnce()
  })

  it('remove uma voz quando a reprodução termina', () => {
    const audio = new FakeAudio()
    const service = new AudioService(10, () => audio as unknown as HTMLAudioElement)

    service.play('parry')
    audio.dispatchEvent(new Event('ended'))

    expect(service.activeStreamCount).toBe(0)
  })

  it('interrompe somente as vozes do som solicitado', () => {
    const created: FakeAudio[] = []
    const service = new AudioService(10, () => {
      const audio = new FakeAudio()
      created.push(audio)
      return audio as unknown as HTMLAudioElement
    })

    service.play('tenseMusic')
    service.play('punch')
    service.stop('tenseMusic')

    expect(created[0]?.pause).toHaveBeenCalledOnce()
    expect(created[0]?.currentTime).toBe(0)
    expect(created[1]?.pause).not.toHaveBeenCalled()
    expect(service.activeStreamCount).toBe(1)
  })

  it('prepara uma música no gesto do usuário e a torna audível sem criar outra voz', () => {
    const created: FakeAudio[] = []
    const service = new AudioService(10, () => {
      const audio = new FakeAudio()
      created.push(audio)
      return audio as unknown as HTMLAudioElement
    })

    service.play('ratDanceMusic', { prepareMuted: true })
    expect(created).toHaveLength(1)
    expect(created[0]?.volume).toBe(0)
    expect(created[0]?.play).toHaveBeenCalledOnce()

    service.play('ratDanceMusic', { resumePrepared: true })
    expect(created).toHaveLength(1)
    expect(created[0]?.volume).toBe(1)
    expect(created[0]?.currentTime).toBe(0)
    expect(created[0]?.play).toHaveBeenCalledOnce()
  })

  it('inicia o fade após o atraso e reduz o volume até interromper o áudio', () => {
    vi.useFakeTimers()
    const audio = new FakeAudio()
    audio.volume = 1
    const service = new AudioService(10, () => audio as unknown as HTMLAudioElement)

    service.play('pidaoEnding')
    service.fadeOut('pidaoEnding', { delay: 10_000, duration: 3_000 })

    vi.advanceTimersByTime(10_000)
    expect(audio.volume).toBe(1)
    expect(audio.pause).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1_500)
    expect(audio.volume).toBeCloseTo(0.5)
    expect(audio.pause).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1_500)
    expect(audio.volume).toBe(0)
    expect(audio.pause).toHaveBeenCalledOnce()
    expect(service.activeStreamCount).toBe(0)
  })
})
