import { act, render, screen } from '@testing-library/react'

import {
  GAMEPLAY_MAX_USER_ZOOM,
  GAMEPLAY_STAGE_HEIGHT,
  GAMEPLAY_STAGE_WIDTH,
  GameFrame,
} from './GameFrame'

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
    expect(screen.getByLabelText('Publicidade esquerda')).toBeInTheDocument()
    expect(screen.getByLabelText('Publicidade direita')).toBeInTheDocument()
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

  it('expõe layouts específicos para menu e batalha rolável', () => {
    const { rerender } = render(
      <GameFrame layout="menu">
        <p>Menu limitado</p>
      </GameFrame>,
    )

    expect(screen.getByRole('region', { name: 'Sobreviva à Noite' })).toHaveAttribute(
      'data-layout',
      'menu',
    )

    rerender(
      <GameFrame layout="battle">
        <p>Batalha rolável</p>
      </GameFrame>,
    )

    const battleFrame = screen.getByRole('region', { name: 'Sobreviva à Noite' })
    expect(battleFrame).toHaveAttribute('data-layout', 'battle')
    expect(screen.getByText('Batalha rolável').parentElement?.parentElement).toBe(battleFrame)
  })

  it('limita a ampliação do gameplay a 110% do tamanho padrão', () => {
    const initialDevicePixelRatio = window.devicePixelRatio
    const { unmount } = render(
      <GameFrame layout="gameplay">
        <p>Gameplay ampliável</p>
      </GameFrame>,
    )
    const region = screen.getByRole('region', { name: 'Sobreviva à Noite' })
    const canvas = region.firstElementChild as HTMLElement
    const initialScale = Number.parseFloat(canvas.style.transform.match(/[\d.]+/)?.[0] ?? '0')

    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: initialDevicePixelRatio * 1.25,
    })
    act(() => window.dispatchEvent(new Event('resize')))

    const enlargedScale = Number.parseFloat(canvas.style.transform.match(/[\d.]+/)?.[0] ?? '0')
    expect(enlargedScale / initialScale).toBeCloseTo(GAMEPLAY_MAX_USER_ZOOM)

    unmount()
    Object.defineProperty(window, 'devicePixelRatio', {
      configurable: true,
      value: initialDevicePixelRatio,
    })
  })
})
