import { expect, type Page } from '@playwright/test'

const BATTLE_TUTORIAL_KEY = 'sobreviva-a-noite.battle-tutorial-seen.v1'

export async function openCleanGame(page: Page, target = '/') {
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto(target)
}

export async function openBattleTest(
  page: Page,
  ending: 'raca' | 'pidao' | 'perfect',
) {
  await page.addInitScript((tutorialKey) => {
    window.localStorage.clear()
    window.localStorage.setItem(tutorialKey, 'true')
  }, BATTLE_TUTORIAL_KEY)
  await page.goto(`/?battleTest=${ending}#/battle`)
  await expect(page.getByLabel('Modo batalha')).toBeVisible()
  const tutorial = page.getByRole('dialog', { name: 'Como jogar a batalha' })
  await expect(tutorial).toBeVisible()
  await tutorial.getByRole('button', { name: 'Continuar Batalha' }).click()
  await expect(page.getByRole('meter', { name: 'Vida de Psicopata' })).toHaveAttribute(
    'aria-valuenow',
    '1',
  )
  const expectedPlayerHp = ending === 'pidao' ? '35' : ending === 'raca' ? '70' : '100'
  await expect(page.getByRole('meter', { name: 'Vida de Sobrevivente' })).toHaveAttribute(
    'aria-valuenow',
    expectedPlayerHp,
  )
}

export async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    )
    .toBe(true)
}
