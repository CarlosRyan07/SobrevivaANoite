import { expect, test } from '@playwright/test'

import { expectNoHorizontalOverflow, openCleanGame } from './support/game'

test('jogador percorre menu, história, tutorial e inicia a batalha', async ({ page }, testInfo) => {
  await openCleanGame(page)

  await expect(page.getByRole('img', { name: 'Tela de Início' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Iniciar Jogo' })).toBeVisible()
  await expectNoHorizontalOverflow(page)

  await page.getByRole('button', { name: 'Iniciar Jogo' }).click()
  await expect(page).toHaveURL(/#\/lore$/)
  await expect(page.getByLabel('História')).toBeVisible()

  await page.getByRole('button', { name: 'Lutar' }).click()
  await expect(page).toHaveURL(/#\/battle$/)

  const tutorial = page.getByRole('dialog', { name: 'Como jogar a batalha' })
  await expect(tutorial).toBeVisible()
  await expect(tutorial).toContainText('CLIQUE DO MOUSE')
  await expect(tutorial).toContainText('ESPAÇO')
  await expect(tutorial).toContainText('parry')

  await page.getByRole('button', { name: 'Começar Batalha' }).click()

  const enemyHp = page.getByRole('meter', { name: 'Vida de Psicopata' })
  const survivor = page.getByRole('img', { name: 'Sobrevivente' })
  await expect(enemyHp).toHaveAttribute('aria-valuenow', '700')
  await expect(page.getByRole('button', { name: 'Atacar' })).toBeVisible()

  const dodgeObserved = survivor.evaluate(
    (image) =>
      new Promise<string>((resolve, reject) => {
        const target = image as HTMLImageElement
        const timeout = window.setTimeout(() => {
          observer.disconnect()
          reject(new Error('O sprite da esquiva para a esquerda não foi exibido.'))
        }, 3_000)
        const checkSource = () => {
          if (!target.src.includes('sobrevivente_esquivando_esquerda')) return
          window.clearTimeout(timeout)
          observer.disconnect()
          resolve(target.getAttribute('src') ?? '')
        }
        const observer = new MutationObserver(checkSource)
        observer.observe(target, { attributes: true, attributeFilter: ['src'] })
        checkSource()
      }),
  )
  await page.keyboard.press('a')
  expect(await dodgeObserved).toContain('sobrevivente_esquivando_esquerda')
  await expect(survivor).toHaveAttribute('src', /sobrevivente_parado/, { timeout: 2_000 })

  await page.keyboard.press('Space')
  await expect(enemyHp).toHaveAttribute('aria-valuenow', '697')
  await expect(survivor).toHaveAttribute('src', /sobrevivente_parado/, { timeout: 3_000 })

  if (testInfo.project.name.startsWith('mobile-')) {
    await page.getByRole('button', { name: 'Atacar' }).tap()
  } else {
    const battleBox = await page.getByLabel('Modo batalha').boundingBox()
    expect(battleBox).not.toBeNull()
    await page.mouse.click((battleBox?.x ?? 0) + 20, (battleBox?.y ?? 0) + 100)
  }
  await expect(enemyHp).toHaveAttribute('aria-valuenow', '694')

  await expectNoHorizontalOverflow(page)
})
