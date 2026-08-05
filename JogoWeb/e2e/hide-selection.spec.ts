import { expect, test } from '@playwright/test'

import { expectNoHorizontalOverflow, openCleanGame } from './support/game'

test('jogador escolhe um esconderijo sem deslocar o botão', async ({ page }) => {
  await openCleanGame(page, '/#/hide')

  const hideMode = page.getByLabel('Modo esconder')
  const spots = page.getByRole('button', { name: /Esconderijo/ })
  const chosenSpot = page.getByRole('button', { name: 'Esconderijo 1' })
  await expect(hideMode).toBeVisible()
  await expect(spots).toHaveCount(6)

  const positionBefore = await chosenSpot.boundingBox()
  await chosenSpot.click()
  const positionAfter = await chosenSpot.boundingBox()

  expect(positionBefore).not.toBeNull()
  expect(positionAfter).not.toBeNull()
  expect(Math.abs((positionAfter?.x ?? 0) - (positionBefore?.x ?? 0))).toBeLessThanOrEqual(1)
  expect(Math.abs((positionAfter?.y ?? 0) - (positionBefore?.y ?? 0))).toBeLessThanOrEqual(1)
  await expect(chosenSpot).toHaveAttribute('aria-pressed', 'true')
  await expect(chosenSpot).toBeDisabled()
  await expect(page.getByText('Rápido, se esconda!')).toHaveCount(0)
  await expectNoHorizontalOverflow(page)
})
