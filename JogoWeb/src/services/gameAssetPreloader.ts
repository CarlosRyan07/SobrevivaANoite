import { audioCatalog } from './audioCatalog'
import { images } from './assetPaths'

type ProgressHandler = (completed: number, total: number) => void

const gameplayImages = [
  images.start,
  images.loreCampfire,
  images.cabin,
  images.houseWithDoor,
  images.house,
  images.blood,
  ...images.killers,
  images.enemy.idle,
  images.enemy.berserkIdle,
  images.enemy.berserkActivation,
  ...images.enemy.attackSequences.flatMap(
    ({ preparingLeft, attackingLeft, preparingRight, attackingRight }) => [
      preparingLeft,
      attackingLeft,
      preparingRight,
      attackingRight,
    ],
  ),
  images.enemy.stunned,
  ...images.enemy.hit,
  images.enemy.defeated,
  images.survivor.idle,
  ...images.survivor.attacks,
  ...images.survivor.dodgeLeft,
  ...images.survivor.dodgeRight,
  images.survivor.hitLeft,
  images.survivor.hitRight,
  images.survivor.parryLeft,
  images.survivor.parryRight,
  images.survivor.victory,
  images.survivor.dance,
] as const

const gameplayAudio = Object.values(audioCatalog)
const RESOURCE_TIMEOUT = 12_000

function preloadImage(source: string): Promise<void> {
  return new Promise((resolve) => {
    const image = new Image()
    const finish = () => resolve()
    const timeout = window.setTimeout(finish, RESOURCE_TIMEOUT)

    image.onload = () => {
      void image.decode().catch(() => undefined).finally(() => {
        window.clearTimeout(timeout)
        finish()
      })
    }
    image.onerror = () => {
      window.clearTimeout(timeout)
      finish()
    }
    image.decoding = 'async'
    image.src = source
  })
}

function preloadAudio(source: string): Promise<void> {
  return new Promise((resolve) => {
    const audio = new Audio()
    let settled = false
    const finish = () => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      audio.removeEventListener('canplaythrough', finish)
      audio.removeEventListener('error', finish)
      resolve()
    }
    const timeout = window.setTimeout(finish, RESOURCE_TIMEOUT)

    audio.preload = 'auto'
    audio.addEventListener('canplaythrough', finish, { once: true })
    audio.addEventListener('error', finish, { once: true })
    audio.src = source
    audio.load()
  })
}

async function preloadBungeeFont(): Promise<void> {
  if (!('fonts' in document)) return
  await document.fonts.load('400 1em Bungee')
}

export async function preloadGameAssets(onProgress: ProgressHandler): Promise<void> {
  const resources = [
    preloadBungeeFont,
    ...gameplayImages.map((source) => () => preloadImage(source)),
    ...gameplayAudio.map((source) => () => preloadAudio(source)),
  ]
  let completed = 0
  const reportProgress = () => {
    completed += 1
    onProgress(completed, resources.length)
  }

  onProgress(completed, resources.length)
  await Promise.all(
    resources.map((load) => load().catch(() => undefined).finally(reportProgress)),
  )
}
