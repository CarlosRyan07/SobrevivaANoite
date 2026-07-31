import { render, screen } from '@testing-library/react'

import { GAMEPLAY_STAGE_HEIGHT, GAMEPLAY_STAGE_WIDTH, GameFrame } from './GameFrame'

describe('GameFrame', () => {
  it('centraliza o palco e preserva o conteúdo da tela', () => {
    render(
      <GameFrame>
        <p>Conteúdo do jogo</p>
      </GameFrame>,
    )

    expect(
      screen.getByRole('main').style.getPropertyValue('--game-backdrop'),
    ).toContain('/assets/optimized/tela_inicio.webp')
    expect(screen.getByRole('region', { name: 'Sobreviva à Noite' })).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do jogo')).toBeInTheDocument()
  })

  it('escala o palco lógico de gameplay como uma unidade sem alterar sua proporção', () => {
    render(
      <GameFrame layout="gameplay">
        <p>Gameplay fixo</p>
      </GameFrame>,
    )

    const region = screen.getByRole('region', { name: 'Sobreviva à Noite' })
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight
    const scale = Math.min(
      viewportWidth / GAMEPLAY_STAGE_WIDTH,
      viewportHeight / GAMEPLAY_STAGE_HEIGHT,
    )
    const canvas = region.firstElementChild as HTMLElement

    expect(region).toHaveAttribute('data-layout', 'gameplay')
    expect(Number.parseFloat(region.style.width)).toBeCloseTo(GAMEPLAY_STAGE_WIDTH * scale)
    expect(Number.parseFloat(region.style.height)).toBeCloseTo(GAMEPLAY_STAGE_HEIGHT * scale)
    expect(
      Number.parseFloat(region.style.width) / Number.parseFloat(region.style.height),
    ).toBeCloseTo(GAMEPLAY_STAGE_WIDTH / GAMEPLAY_STAGE_HEIGHT)
    expect(canvas.style.transform).toBe(`scale(${scale})`)
    expect(screen.getByText('Gameplay fixo')).toBeInTheDocument()
  })
})
