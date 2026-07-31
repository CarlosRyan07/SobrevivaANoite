import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

import puppeteer from 'puppeteer-core'
import { preview } from 'vite'

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputDirectory = path.join(projectRoot, '.artifacts', 'visual')
const defaultChrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const executablePath = process.env.CHROME_PATH || defaultChrome

await mkdir(outputDirectory, { recursive: true })

const server = await preview({
  root: projectRoot,
  logLevel: 'silent',
  preview: { host: '127.0.0.1', port: 4173, strictPort: false },
})
const baseUrl = server.resolvedUrls?.local?.[0]

if (!baseUrl) {
  server.httpServer.close()
  throw new Error('O Vite não informou a URL local do preview.')
}

const browser = await puppeteer.launch({
  executablePath,
  headless: true,
  args: ['--disable-gpu', '--no-first-run'],
})

const cases = [
  { name: 'mobile-opening', hash: '', width: 390, height: 844, wait: 150 },
  { name: 'mobile-lore', hash: '#/lore', width: 390, height: 844, wait: 1_600 },
  { name: 'mobile-hide', hash: '#/hide', width: 390, height: 844, wait: 150 },
  {
    name: 'mobile-hide-selection',
    hash: '#/hide',
    width: 390,
    height: 844,
    wait: 150,
    interaction: 'hide-selection',
  },
  { name: 'mobile-battle', hash: '#/battle', width: 390, height: 844, wait: 150 },
  { name: 'mobile-history', hash: '#/history', width: 390, height: 844, wait: 150 },
  { name: 'tablet-opening', hash: '', width: 546, height: 866, wait: 150 },
  { name: 'desktop-opening', hash: '', width: 1_440, height: 900, wait: 150 },
]

const report = []

try {
  for (const visualCase of cases) {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('requestfailed', (request) =>
      errors.push(`${request.url()}: ${request.failure()?.errorText ?? 'falha de rede'}`),
    )
    await page.setViewport({
      width: visualCase.width,
      height: visualCase.height,
      deviceScaleFactor: 1,
      isMobile: visualCase.width < 600,
      hasTouch: visualCase.width < 600,
    })
    await page.goto(`${baseUrl}${visualCase.hash}`, { waitUntil: 'networkidle0' })
    await new Promise((resolve) => setTimeout(resolve, visualCase.wait))

    let interaction = null
    if (visualCase.interaction === 'hide-selection') {
      const spot = await page.$('button[aria-label="Esconderijo 1"]')
      if (!spot) {
        errors.push('Botão do esconderijo 1 não encontrado.')
      } else {
        const before = await spot.boundingBox()
        if (!before) {
          errors.push('Não foi possível medir o esconderijo 1.')
        } else {
          await page.mouse.move(before.x + before.width / 2, before.y + before.height / 2)
          await page.mouse.down()
          await new Promise((resolve) => setTimeout(resolve, 50))
          const pressed = await spot.boundingBox()
          await page.mouse.up()
          await new Promise((resolve) => setTimeout(resolve, 50))

          const moved = pressed
            ? Math.hypot(
                pressed.x + pressed.width / 2 - (before.x + before.width / 2),
                pressed.y + pressed.height / 2 - (before.y + before.height / 2),
              )
            : Number.POSITIVE_INFINITY
          const searching = await page.$eval(
            '[aria-label="Modo esconder"]',
            (root) => root.textContent?.includes('Ele está procurando...') ?? false,
          )
          const searchStatus = await page.$eval('[role="status"]', (element) => {
            const rect = element.getBoundingClientRect()
            return { top: rect.top, bottom: rect.bottom }
          })
          interaction = { before, pressed, moved, searching, searchStatus }
          if (moved > 1) errors.push(`Esconderijo deslocou ${moved.toFixed(2)}px ao pressionar.`)
          if (!searching) errors.push('O clique no esconderijo não iniciou a busca.')
          if (searchStatus.top > 40) {
            errors.push(`Mensagem de busca iniciou em ${searchStatus.top.toFixed(2)}px; esperado no topo.`)
          }
        }
      }
    }

    const metrics = await page.evaluate(() => {
      const frame = document.querySelector('main > section')
      if (!(frame instanceof HTMLElement)) throw new Error('GameFrame não encontrado.')
      const rect = frame.getBoundingClientRect()
      const brokenImages = [...document.images]
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.src)

      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        frame: { left: rect.left, right: rect.right, width: rect.width, height: rect.height },
        scrollWidth: document.documentElement.scrollWidth,
        brokenImages,
        shellBackgroundImage: getComputedStyle(document.querySelector('main')).backgroundImage,
        openingImage: (() => {
          const image = document.querySelector('img[alt="Tela de Início"]')
          if (!(image instanceof HTMLImageElement)) return null
          const imageRect = image.getBoundingClientRect()
          return {
            objectFit: getComputedStyle(image).objectFit,
            left: imageRect.left,
            right: imageRect.right,
            width: imageRect.width,
          }
        })(),
        openingVisible:
          document.querySelector('img[alt="Tela de Início"]') instanceof HTMLImageElement &&
          [...document.querySelectorAll('button')].some(
            (button) => button.textContent?.trim() === 'Iniciar Jogo',
          ),
      }
    })

    const expectedFrameWidth = Math.min(visualCase.width, 480)
    const expectedLeft = (visualCase.width - expectedFrameWidth) / 2
    if (Math.abs(metrics.frame.width - expectedFrameWidth) > 1) {
      errors.push(`Palco com ${metrics.frame.width}px; esperado ${expectedFrameWidth}px.`)
    }
    if (Math.abs(metrics.frame.left - expectedLeft) > 1) {
      errors.push(`Palco iniciou em ${metrics.frame.left}px; esperado ${expectedLeft}px.`)
    }
    if (metrics.scrollWidth > visualCase.width) {
      errors.push(`Overflow horizontal: ${metrics.scrollWidth}px em viewport ${visualCase.width}px.`)
    }
    if (metrics.brokenImages.length > 0) {
      errors.push(`Imagens quebradas: ${metrics.brokenImages.join(', ')}`)
    }
    if (visualCase.hash === '' && !metrics.openingVisible) {
      errors.push('A arte ou o botão da abertura não ficou visível.')
    }
    if (
      visualCase.hash === '' &&
      (metrics.openingImage?.objectFit !== 'cover' ||
        Math.abs((metrics.openingImage?.width ?? 0) - metrics.frame.width) > 1)
    ) {
      errors.push(`A arte da abertura não preencheu o palco: ${JSON.stringify(metrics.openingImage)}`)
    }
    if (
      visualCase.hash === '' &&
      (metrics.shellBackgroundImage === 'none' ||
        metrics.shellBackgroundImage.includes('/assets/assets/') ||
        !metrics.shellBackgroundImage.includes('linear-gradient'))
    ) {
      errors.push(`Fundo lateral ausente ou sem escurecimento: ${metrics.shellBackgroundImage}`)
    }

    const screenshot = path.join(outputDirectory, `${visualCase.name}.png`)
    await page.screenshot({ path: screenshot, fullPage: false })
    report.push({ ...visualCase, screenshot, metrics, interaction, errors })
    await page.close()
  }
} finally {
  await browser.close()
  server.httpServer.close()
}

const reportPath = path.join(outputDirectory, 'report.json')
await writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8')

const failed = report.filter((item) => item.errors.length > 0)
if (failed.length > 0) {
  failed.forEach((item) => {
    console.error(`${item.name}: ${item.errors.join(' | ')}`)
  })
  process.exitCode = 1
} else {
  console.log(`Verificação visual aprovada em ${report.length} viewports. Relatório: ${reportPath}`)
}
