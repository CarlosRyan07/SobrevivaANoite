import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AudioContext } from '../../contexts/audioContextValue'
import type { AudioService } from '../../services/AudioService'
import { MenuScreen } from './MenuScreen'

describe('MenuScreen', () => {
  const audio = { play: vi.fn() } as unknown as AudioService

  beforeEach(() => {
    window.location.hash = ''
    vi.clearAllMocks()
  })

  it('abre a lore, toca o clique e preserva o texto integral', async () => {
    const user = userEvent.setup()
    render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} />
      </AudioContext>,
    )

    await user.click(screen.getByRole('button', { name: 'Iniciar Jogo' }))

    expect(audio.play).toHaveBeenCalledWith('buttonClick')
    expect(screen.getByRole('region', { name: 'História', hidden: true })).toHaveAttribute(
      'aria-hidden',
      'false',
    )
    expect(screen.getByText('Imóvel. Observando.')).toBeInTheDocument()
    expect(screen.getByText('O que você faz?')).toBeInTheDocument()
  })

  it('navega para batalha mantendo o som do Android', async () => {
    window.location.hash = '#/lore'
    const onBattle = vi.fn()
    const user = userEvent.setup()
    render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={onBattle} onHide={vi.fn()} onHistory={vi.fn()} />
      </AudioContext>,
    )

    await user.click(screen.getByRole('button', { name: 'Lutar' }))

    expect(audio.play).toHaveBeenCalledWith('buttonClick')
    expect(onBattle).toHaveBeenCalledOnce()
  })

  it('abre o histórico a partir da tela inicial', async () => {
    const onHistory = vi.fn()
    const user = userEvent.setup()
    render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={onHistory} />
      </AudioContext>,
    )

    await user.click(screen.getByRole('button', { name: 'Histórico' }))

    expect(audio.play).toHaveBeenCalledWith('buttonClick')
    expect(onHistory).toHaveBeenCalledOnce()
  })
})
