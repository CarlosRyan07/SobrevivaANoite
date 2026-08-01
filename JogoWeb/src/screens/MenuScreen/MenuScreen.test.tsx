import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AudioContext } from '../../contexts/audioContextValue'
import { gamePersistence } from '../../persistence/gamePersistence'
import type { AudioService } from '../../services/AudioService'
import { MenuScreen } from './MenuScreen'

describe('MenuScreen', () => {
  const audio = { play: vi.fn() } as unknown as AudioService

  beforeEach(() => {
    window.location.hash = ''
    localStorage.clear()
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

  it('mostra CÓDIGOS somente após a descoberta e permite resgatar e desativar', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} />
      </AudioContext>,
    )

    expect(screen.queryByRole('button', { name: 'Códigos' })).not.toBeInTheDocument()

    gamePersistence.discoverCode('ligeirinho')
    rerender(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} />
      </AudioContext>,
    )
    await user.click(screen.getByRole('button', { name: 'Códigos' }))

    const input = screen.getByLabelText('Digite o código:')
    await user.type(input, 'errado')
    await user.click(screen.getByRole('button', { name: 'Ativar' }))
    expect(screen.getByText('Código inválido.')).toBeInTheDocument()

    await user.clear(input)
    await user.type(input, 'LIGEIRINHO')
    await user.click(screen.getByRole('button', { name: 'Ativar' }))
    expect(screen.getByText('Código ativado!')).toBeInTheDocument()
    expect(screen.getByText('Aumenta a velocidade dos golpes durante a batalha.')).toBeInTheDocument()
    expect(gamePersistence.isCodeActive('ligeirinho')).toBe(true)

    await user.click(screen.getByRole('button', { name: 'Desativar' }))
    expect(screen.getByText('Código desativado.')).toBeInTheDocument()
    expect(gamePersistence.isCodeActive('ligeirinho')).toBe(false)
  })
})
