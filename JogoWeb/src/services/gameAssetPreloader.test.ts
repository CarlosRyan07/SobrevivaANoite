import { preloadGameAssets } from './gameAssetPreloader'

class PreloadedImage {
  decoding = ''
  onload: (() => void) | null = null
  onerror: (() => void) | null = null
  decode = vi.fn(() => Promise.resolve())

  set src(_: string) {
    queueMicrotask(() => this.onload?.())
  }
}

class PreloadedAudio extends EventTarget {
  preload = ''
  load = vi.fn(() => {
    queueMicrotask(() => this.dispatchEvent(new Event('canplaythrough')))
  })

  set src(_: string) {}
}

describe('preloadGameAssets', () => {
  beforeEach(() => {
    vi.stubGlobal('Image', PreloadedImage)
    vi.stubGlobal('Audio', PreloadedAudio)
    Object.defineProperty(document, 'fonts', {
      configurable: true,
      value: { load: vi.fn(() => Promise.resolve()) },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Reflect.deleteProperty(document, 'fonts')
  })

  it('pré-carrega fonte, imagens e áudios, informando o progresso completo', async () => {
    const onProgress = vi.fn()

    await preloadGameAssets(onProgress)

    const total = onProgress.mock.calls[0]?.[1]
    expect(total).toBeGreaterThan(1)
    expect(onProgress).toHaveBeenCalledWith(0, total)
    expect(onProgress).toHaveBeenLastCalledWith(total, total)
    expect(onProgress).toHaveBeenCalledTimes(total + 1)
    expect(document.fonts.load).toHaveBeenCalledWith('400 1em Bungee')
  })
})
