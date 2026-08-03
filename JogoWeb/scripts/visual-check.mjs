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
  { name: 'menu-80-percent-width', hash: '', width: 384, height: 800, wait: 150 },
  { name: 'desktop-hide-zoom-90', hash: '#/hide', width: 2_133, height: 1_000, wait: 150 },
  {
    name: 'desktop-hide-zoom-100',
    hash: '#/hide',
    width: 1_920,
    height: 900,
    wait: 150,
    interaction: 'hide-selection',
  },
  { name: 'desktop-hide-zoom-67', hash: '#/hide', width: 2_866, height: 1_343, wait: 150 },
  { name: 'desktop-battle-zoom-80', hash: '#/battle', width: 2_400, height: 1_125, wait: 150 },
  {
    name: 'desktop-battle-normal',
    hash: '#/battle',
    width: 1_031,
    height: 866,
    wait: 150,
    highCombo: 105,
  },
  { name: 'desktop-battle-zoom-110', hash: '#/battle', width: 1_745, height: 818, wait: 150 },
  { name: 'desktop-battle-zoom-150', hash: '#/battle', width: 1_280, height: 600, wait: 150 },
  {
    name: 'battle-reference-spacing',
    hash: '#/battle',
    width: 473,
    height: 817,
    wait: 150,
    highCombo: 105,
  },
  {
    name: 'desktop-battle-zoom-175',
    hash: '#/battle',
    width: 1_097,
    height: 514,
    wait: 150,
    interaction: 'battle-scroll',
  },
]

const report = []

try {
  for (const visualCase of cases) {
    const page = await browser.newPage()
    const errors = []
    page.on('pageerror', (error) => errors.push(error.message))
    page.on('requestfailed', (request) => {
      const errorText = request.failure()?.errorText ?? 'falha de rede'
      if (request.resourceType() === 'image' && errorText === 'net::ERR_ABORTED') return
      errors.push(`${request.url()}: ${errorText}`)
    })
    if (visualCase.highCombo) {
      await page.evaluateOnNewDocument((highCombo) => {
        if (window.location.protocol === 'http:' || window.location.protocol === 'https:') {
          localStorage.setItem('sobreviva-a-noite.high-combo.v1', String(highCombo))
        }
      }, visualCase.highCombo)
    }
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
          await new Promise((resolve) => setTimeout(resolve, 400))
          const psychopathVisibility = await page.$eval('img[alt="Psicopata"]', (element) => {
            const frame = document.querySelector('main > section')
            if (!(frame instanceof HTMLElement)) throw new Error('GameFrame não encontrado.')
            const frameRect = frame.getBoundingClientRect()
            const rect = element.getBoundingClientRect()
            return {
              top: rect.top,
              right: rect.right,
              bottom: rect.bottom,
              left: rect.left,
              fullyVisible:
                rect.top >= frameRect.top - 1 &&
                rect.right <= frameRect.right + 1 &&
                rect.bottom <= frameRect.bottom + 1 &&
                rect.left >= frameRect.left - 1,
            }
          })
          interaction.psychopathVisibility = psychopathVisibility
          if (!psychopathVisibility.fullyVisible) {
            errors.push(`Psicopata saiu do palco: ${JSON.stringify(psychopathVisibility)}`)
          }
        }
      }
    }
    if (visualCase.interaction === 'battle-scroll') {
      const before = await page.$eval('main > section', (frame) => ({
        scrollTop: frame.scrollTop,
        scrollHeight: frame.scrollHeight,
        clientHeight: frame.clientHeight,
      }))
      await page.$eval('main > section', (frame) => frame.scrollTo({ top: frame.scrollHeight }))
      await new Promise((resolve) => setTimeout(resolve, 100))
      const after = await page.$eval('main > section', (frame) => ({
        scrollTop: frame.scrollTop,
        scrollHeight: frame.scrollHeight,
        clientHeight: frame.clientHeight,
      }))
      interaction = { before, after }
      if (after.scrollTop <= 0) errors.push('A batalha não permitiu rolagem vertical em 175%.')
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
        frame: {
          top: rect.top,
          right: rect.right,
          bottom: rect.bottom,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        layout: frame.dataset.layout,
        frameScroll: {
          scrollHeight: frame.scrollHeight,
          clientHeight: frame.clientHeight,
          overflowY: getComputedStyle(frame).overflowY,
          scrollbarWidth: getComputedStyle(frame).scrollbarWidth,
        },
        battleSpacing: (() => {
          const record = document.querySelector('[aria-label^="Recorde de combo"]')
          const enemyMeter = document.querySelector('[aria-label="Vida de Psicopata"]')
          const survivorMeter = document.querySelector('[aria-label="Vida de Sobrevivente"]')
          const enemyBlock = enemyMeter?.parentElement
          const bottomBlock = survivorMeter?.parentElement?.parentElement
          if (!(record instanceof HTMLElement) || !enemyBlock || !bottomBlock) return null
          const recordRect = record.getBoundingClientRect()
          const enemyRect = enemyBlock.getBoundingClientRect()
          const bottomRect = bottomBlock.getBoundingClientRect()
          return {
            recordTop: recordRect.top,
            enemyTop: enemyRect.top,
            bottomGap: window.innerHeight - bottomRect.bottom,
          }
        })(),
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

    const fixedGameplay = metrics.layout === 'gameplay'
    const menuLayout = metrics.layout === 'menu'
    const battleLayout = metrics.layout === 'battle'
    const gameplayScale = Math.min(visualCase.width / 480, visualCase.height / 850)
    const expectedFrameWidth = fixedGameplay
      ? 480 * gameplayScale
      : Math.min(visualCase.width, menuLayout ? 432 : 480)
    const expectedFrameHeight = fixedGameplay ? 850 * gameplayScale : visualCase.height
    const expectedLeft = (visualCase.width - expectedFrameWidth) / 2
    const expectedTop = fixedGameplay ? 0 : (visualCase.height - expectedFrameHeight) / 2
    if (Math.abs(metrics.frame.width - expectedFrameWidth) > 1) {
      errors.push(`Palco com ${metrics.frame.width}px; esperado ${expectedFrameWidth}px.`)
    }
    if (Math.abs(metrics.frame.height - expectedFrameHeight) > 1) {
      errors.push(`Palco com altura ${metrics.frame.height}px; esperado ${expectedFrameHeight}px.`)
    }
    if (Math.abs(metrics.frame.left - expectedLeft) > 1) {
      errors.push(`Palco iniciou em ${metrics.frame.left}px; esperado ${expectedLeft}px.`)
    }
    if (Math.abs(metrics.frame.top - expectedTop) > 1) {
      errors.push(`Palco iniciou verticalmente em ${metrics.frame.top}px; esperado ${expectedTop}px.`)
    }
    if (
      fixedGameplay &&
      Math.abs(metrics.frame.width / metrics.frame.height - 480 / 850) > 0.001
    ) {
      errors.push(`Proporção do gameplay mudou: ${metrics.frame.width}×${metrics.frame.height}.`)
    }
    if (battleLayout && metrics.frameScroll.overflowY !== 'auto') {
      errors.push(`Batalha sem overflow vertical automático: ${metrics.frameScroll.overflowY}.`)
    }
    if (battleLayout && metrics.frameScroll.scrollbarWidth !== 'none') {
      errors.push(`Barra visual da batalha continua ativa: ${metrics.frameScroll.scrollbarWidth}.`)
    }
    if (
      battleLayout &&
      visualCase.width >= 600 &&
      visualCase.height <= 620 &&
      metrics.frameScroll.scrollHeight < 899
    ) {
      errors.push(`Conteúdo rolável da batalha possui somente ${metrics.frameScroll.scrollHeight}px.`)
    }
    if (visualCase.name === 'battle-reference-spacing') {
      if (!metrics.battleSpacing) {
        errors.push('Não foi possível medir o espaçamento de referência da batalha.')
      } else {
        if (Math.abs(metrics.battleSpacing.recordTop - 24) > 1) {
          errors.push(`Recorde iniciou em ${metrics.battleSpacing.recordTop}px; esperado 24px.`)
        }
        if (Math.abs(metrics.battleSpacing.enemyTop - 120) > 1) {
          errors.push(`HUD do psicopata iniciou em ${metrics.battleSpacing.enemyTop}px; esperado 120px.`)
        }
        if (Math.abs(metrics.battleSpacing.bottomGap - 16) > 1) {
          errors.push(`HUD inferior terminou a ${metrics.battleSpacing.bottomGap}px; esperado 16px.`)
        }
      }
    }
    if (visualCase.name === 'desktop-battle-normal') {
      if (metrics.frameScroll.scrollHeight !== metrics.frameScroll.clientHeight) {
        errors.push(
          `A batalha normal abriu com rolagem: ${metrics.frameScroll.clientHeight}px de ${metrics.frameScroll.scrollHeight}px.`,
        )
      }
      if (!metrics.battleSpacing) {
        errors.push('Não foi possível medir os elementos da batalha normal.')
      } else {
        if (metrics.battleSpacing.recordTop < 23) {
          errors.push(`O recorde ficou cortado no topo: ${metrics.battleSpacing.recordTop}px.`)
        }
        if (metrics.battleSpacing.bottomGap < 15) {
          errors.push(`Os controles ficaram cortados na base: ${metrics.battleSpacing.bottomGap}px.`)
        }
      }
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
