import { expect, test } from '@playwright/test'

import { openBattleTest } from './support/game'

test.skip(
  ({ browserName }) => browserName !== 'chromium',
  'A jornada longa roda no Chrome desktop e mobile; os demais navegadores recebem o smoke test.',
)

test('vitória libera final, histórico e código somente no fluxo correto', async ({ page }) => {
  test.setTimeout(120_000)

  await openBattleTest(page, 'raca')
  await page.getByRole('button', { name: 'Atacar' }).click()

  const victory = page.getByRole('dialog', { name: 'Vitória' })
  await expect(victory).toBeVisible({ timeout: 12_000 })
  await expect(victory.getByRole('heading', { name: 'VOCÊ VENCEU!' })).toBeVisible()
  await expect(victory.getByText(/liberou o código/i)).toHaveCount(0)

  await victory.getByRole('button', { name: 'Prosseguir' }).click()
  const ending = page.getByRole('dialog', { name: 'Final: Venceu na Raça' })
  await expect(ending).toBeVisible()
  await ending.getByRole('button', { name: 'Continuar' }).click()

  await expect(ending.getByRole('heading', { name: 'VENCEU NA RAÇA!' })).toBeVisible()
  await expect(ending.getByRole('status', { name: 'Final obtido' })).toContainText(
    'VENCEU NA RAÇA!',
  )
  await expect(ending.getByRole('status').filter({ hasText: 'ligeirinho' })).toBeVisible()

  await ending.getByRole('button', { name: 'Voltar ao Menu' }).click()
  await expect(page.getByRole('button', { name: 'Iniciar Jogo' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Códigos' })).toBeVisible()

  await page.getByRole('button', { name: 'Histórico' }).click()
  await expect(page.getByLabel('Estatísticas de Batalha')).toContainText(
    'Vitórias: 1 | Derrotas: 0',
  )
  await expect(page.getByLabel('Partidas', { exact: true })).toContainText(
    'Dificuldade: Normal | Vida Final: 70 | Parrys: 0',
  )

  await page.getByRole('button', { name: 'Voltar' }).click()
  await page.getByRole('button', { name: 'Finais' }).click()
  await expect(page.getByText('1 de 3 obtidos')).toBeVisible()
  await expect(page.getByLabel('Final 1: Venceu na Raça!')).toBeVisible()

  await page.getByRole('button', { name: 'Voltar' }).click()
  await page.getByRole('button', { name: 'Códigos' }).click()
  const codes = page.getByRole('dialog', { name: 'CÓDIGOS' })
  await codes.getByRole('textbox', { name: 'Digite o código:' }).fill('ligeirinho')
  await codes.getByRole('button', { name: 'Ativar' }).click()
  await expect(codes.getByRole('status')).toHaveText('Código ativado!')
  await expect(codes).toContainText('Ligeirinho')
  await expect(codes.getByRole('button', { name: 'Desativar' })).toBeVisible()
})
