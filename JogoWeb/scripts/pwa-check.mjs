import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import puppeteer from 'puppeteer-core'
import { preview } from 'vite'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const artifactDirectory = path.join(projectRoot, '.artifacts')
const executablePath =
  process.env.CHROME_PATH || 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'

await mkdir(artifactDirectory, { recursive: true })

const server = await preview({
  root: projectRoot,
  logLevel: 'silent',
  preview: { host: '127.0.0.1', port: 4173, strictPort: false },
})
const baseUrl = server.resolvedUrls?.local?.[0]
if (!baseUrl) {
  await server.close()
  throw new Error('URL do preview não encontrada.')
}

const browser = await puppeteer.launch({ executablePath, headless: true })
const page = await browser.newPage()
const report = {
  serviceWorkerControlled: false,
  historyPersistedAfterReload: false,
  offlineScreens: [],
  errors: [],
}

try {
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1, isMobile: true, hasTouch: true })
  await page.goto(baseUrl, { waitUntil: 'networkidle0' })
  await page.evaluate(() => navigator.serviceWorker.ready)
  await page.reload({ waitUntil: 'networkidle0' })

  report.serviceWorkerControlled = await page.evaluate(() => navigator.serviceWorker.controller !== null)
  if (!report.serviceWorkerControlled) report.errors.push('A página não ficou sob controle do service worker.')

  await page.evaluate(() => {
    window.location.hash = '#/lore'
  })
  await page.waitForSelector('[aria-label="História"]')
  await page.evaluate(() => {
    const lore = document.querySelector('[aria-label="História"]')
    if (lore instanceof HTMLElement) lore.scrollTop = lore.scrollHeight
  })
  await page.waitForNetworkIdle({ idleTime: 300 })

  for (const route of ['hide', 'battle', 'history', 'endings']) {
    await page.evaluate((nextRoute) => {
      window.location.hash = `#/${nextRoute}`
    }, route)
    const selector = route === 'history'
      ? '[aria-label="Histórico de Partidas"]'
      : route === 'endings'
        ? '[aria-label="Finais"]'
        : `[aria-label="Modo ${route === 'hide' ? 'esconder' : 'batalha'}"]`
    await page.waitForSelector(selector)
    await page.waitForNetworkIdle({ idleTime: 300 })
  }

  await page.evaluate(() => {
    localStorage.setItem(
      'sobreviva-a-noite.match-history.v1',
      JSON.stringify([
        {
          id: 1,
          gameMode: 'Batalha',
          wasVictory: true,
          finalPlayerHp: 85,
          parryCount: 2,
          timestamp: Date.now(),
        },
      ]),
    )
    window.location.hash = '#/history'
  })
  await page.reload({ waitUntil: 'networkidle0' })
  report.historyPersistedAfterReload = await page.evaluate(
    () => document.body.textContent?.includes('Vida Final: 85 | Parrys: 2') ?? false,
  )
  if (!report.historyPersistedAfterReload) {
    report.errors.push('O histórico não permaneceu visível após recarregar a página.')
  }

  await page.setOfflineMode(true)
  await page.reload({ waitUntil: 'domcontentloaded' })

  for (const screen of [
    { hash: '', selector: 'button', name: 'opening' },
    { hash: '#/hide', selector: '[aria-label="Modo esconder"]', name: 'hide' },
    { hash: '#/battle', selector: '[aria-label="Modo batalha"]', name: 'battle' },
    { hash: '#/history', selector: '[aria-label="Histórico de Partidas"]', name: 'history' },
    { hash: '#/endings', selector: '[aria-label="Finais"]', name: 'endings' },
  ]) {
    await page.evaluate((hash) => {
      window.location.hash = hash
    }, screen.hash)
    await page.waitForSelector(screen.selector)
    await new Promise((resolve) => setTimeout(resolve, 150))
    const brokenImages = await page.evaluate(() =>
      [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.src),
    )
    report.offlineScreens.push({ name: screen.name, brokenImages })
    if (brokenImages.length > 0) {
      report.errors.push(`${screen.name}: imagens quebradas offline: ${brokenImages.join(', ')}`)
    }
  }

  const cachedAudioAvailable = await page.evaluate(async () => {
    const response = await fetch('./assets/audio/clique_botao.mp3')
    return response.ok && (await response.arrayBuffer()).byteLength > 0
  })
  if (!cachedAudioAvailable) report.errors.push('Áudio de clique não estava disponível offline.')

  const cachedRatMusicAvailable = await page.evaluate(async () => {
    const response = await fetch('./assets/audio/rat_dance_music.mp3')
    return response.ok && (await response.arrayBuffer()).byteLength > 0
  })
  if (!cachedRatMusicAvailable) report.errors.push('Música do Rat Dance não estava disponível offline.')

  const cachedBattleMusicAvailable = await page.evaluate(async () => {
    const response = await fetch('./assets/audio/musica_batalha.mp3')
    return response.ok && (await response.arrayBuffer()).byteLength > 0
  })
  if (!cachedBattleMusicAvailable) {
    report.errors.push('Música da batalha não estava disponível offline.')
  }
} finally {
  await page.setOfflineMode(false)
  await browser.close()
  await server.close()
}

const reportPath = path.join(artifactDirectory, 'pwa-report.json')
await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8')

if (report.errors.length > 0) {
  report.errors.forEach((error) => console.error(error))
  process.exitCode = 1
} else {
  console.log(`PWA offline aprovado para abertura, esconderijo, batalha, histórico, finais e áudios. Relatório: ${reportPath}`)
}
