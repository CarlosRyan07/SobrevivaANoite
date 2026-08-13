import { expect, test } from '@playwright/test'

import { openBattleTest } from './support/game'

test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'As histórias completas rodam no Chrome desktop e mobile; os demais navegadores recebem o smoke test.',
)

test('vitória com pouca vida abre o final A Maldição do Pidão', async ({ page }) => {
  await openBattleTest(page, 'pidao')
  await page.getByRole('button', { name: 'Atacar' }).click()

  const victory = page.getByRole('dialog', { name: 'Vitória' })
  await expect(victory).toBeVisible({ timeout: 12_000 })
  await victory.getByRole('button', { name: 'Prosseguir' }).click()

  const ending = page.getByRole('dialog', { name: 'Final: A Maldição do Pidão' })
  await expect(ending).toBeVisible()
  await expect(ending.getByText('— Eu consegui!')).toBeVisible()

  await ending.getByRole('button', { name: 'Continuar' }).click()
  await expect(ending.getByLabel('Transformação do Pidão')).toBeVisible()

  await ending.getByRole('button', { name: 'Continuar' }).click()
  await expect(ending.getByRole('heading', { name: 'UM PIDÃO!!!' })).toBeVisible({
    timeout: 5_000,
  })
  await expect(ending.getByRole('status', { name: 'Final obtido' })).toContainText(
    'Você se tornou um Lobisomem Pidão',
  )
  await expect(ending.getByRole('button', { name: 'Voltar ao Menu' })).toBeVisible()
})

test('vitória perfeita abre o final Sopa de Lobo', async ({ page }) => {
  await openBattleTest(page, 'perfect')
  await page.getByRole('button', { name: 'Atacar' }).click()

  const victory = page.getByRole('dialog', { name: 'Vitória' })
  await expect(victory).toBeVisible({ timeout: 12_000 })
  await victory.getByRole('button', { name: 'Prosseguir' }).click()

  const ending = page.getByRole('dialog', { name: 'Final: Sopa de Lobo' })
  await expect(ending).toBeVisible()
  await expect(ending.getByText(/Contra qualquer lógica/)).toBeVisible()

  await ending.getByRole('button', { name: 'Continuar' }).click()
  await expect(ending.getByText('— É só isso?')).toBeVisible()

  await ending.getByRole('button', { name: 'Continuar' }).click()
  await expect(ending.getByText('Hoje vai ter sopa.')).toBeVisible()

  await ending.getByRole('button', { name: 'Continuar' }).click()
  await expect(ending.getByText('— Sopa? Sopa de quê mesmo?')).toBeVisible()

  await ending.getByRole('button', { name: 'Sopa de lobo!' }).click()
  await expect(ending.getByRole('heading', { name: 'SOPA DE LOBO!' })).toBeVisible()
  await expect(ending.getByRole('status', { name: 'Final obtido' })).toContainText('SOPA DE LOBO!')
  await expect(ending.getByRole('button', { name: 'Voltar ao Menu' })).toBeVisible()
})
