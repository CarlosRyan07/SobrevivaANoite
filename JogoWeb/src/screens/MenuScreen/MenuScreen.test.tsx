import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AudioContext } from '../../contexts/audioContextValue'
import { gamePersistence } from '../../persistence/gamePersistence'
import type { AudioService } from '../../services/AudioService'
import { MenuScreen } from './MenuScreen'

describe('MenuScreen', () => {
  const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService

  beforeEach(() => {
    window.location.hash = ''
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('abre a lore, toca o clique e preserva o texto integral', async () => {
    const user = userEvent.setup()
    render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} onEndings={vi.fn()} />
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
        <MenuScreen onBattle={onBattle} onHide={vi.fn()} onHistory={vi.fn()} onEndings={vi.fn()} />
      </AudioContext>,
    )

    await user.click(screen.getByRole('button', { name: 'Lutar' }))

    expect(audio.play).toHaveBeenCalledWith('buttonClick')
    expect(onBattle).toHaveBeenCalledOnce()
    expect(onBattle).toHaveBeenCalledWith('normal')
  })

  it('libera os cards Normal e Pesadelo junto com o código LIGEIRINHO', async () => {
    window.location.hash = '#/lore'
    gamePersistence.discoverCode('ligeirinho')
    const onBattle = vi.fn()
    const user = userEvent.setup()
    render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={onBattle} onHide={vi.fn()} onHistory={vi.fn()} onEndings={vi.fn()} />
      </AudioContext>,
    )

    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    await user.click(screen.getByRole('button', { name: 'Lutar' }))
    expect(screen.getByRole('dialog', { name: 'Escolha a dificuldade' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /Pesadelo/i }))
    expect(onBattle).toHaveBeenCalledWith('hard')
    expect(audio.stop).toHaveBeenCalledWith('battleMusic')
    expect(audio.play).toHaveBeenCalledWith('battleMusic', { loop: true, prepareMuted: true })
  })

  it('anuncia o modo Pesadelo apenas uma vez após desbloqueá-lo', async () => {
    const user = userEvent.setup()
    gamePersistence.discoverCode('ligeirinho')
    const { unmount } = render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} onEndings={vi.fn()} />
      </AudioContext>,
    )

    expect(screen.getByRole('dialog', { name: 'Modo Pesadelo desbloqueado' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog', { name: 'Modo Pesadelo desbloqueado' })).not.toBeInTheDocument()

    unmount()
    render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} onEndings={vi.fn()} />
      </AudioContext>,
    )
    expect(screen.queryByRole('dialog', { name: 'Modo Pesadelo desbloqueado' })).not.toBeInTheDocument()
  })

  it('abre o histórico a partir da tela inicial', async () => {
    const onHistory = vi.fn()
    const user = userEvent.setup()
    render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={onHistory} onEndings={vi.fn()} />
      </AudioContext>,
    )

    await user.click(screen.getByRole('button', { name: 'Histórico' }))

    expect(audio.play).toHaveBeenCalledWith('buttonClick')
    expect(onHistory).toHaveBeenCalledOnce()
  })

  it('abre a galeria de finais a partir da tela inicial', async () => {
    const onEndings = vi.fn()
    const user = userEvent.setup()
    render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} onEndings={onEndings} />
      </AudioContext>,
    )

    await user.click(screen.getByRole('button', { name: 'Finais' }))

    expect(audio.play).toHaveBeenCalledWith('buttonClick')
    expect(onEndings).toHaveBeenCalledOnce()
  })

  it('abre as curiosidades a partir da tela inicial', async () => {
    const onCuriosities = vi.fn()
    const user = userEvent.setup()
    render(
      <AudioContext value={audio}>
        <MenuScreen
          onBattle={vi.fn()}
          onHide={vi.fn()}
          onHistory={vi.fn()}
          onEndings={vi.fn()}
          onCuriosities={onCuriosities}
        />
      </AudioContext>,
    )

    await user.click(screen.getByRole('button', { name: 'Curiosidades' }))

    expect(audio.play).toHaveBeenCalledWith('buttonClick')
    expect(onCuriosities).toHaveBeenCalledOnce()
  })

  it('mostra CÓDIGOS somente após a descoberta e permite resgatar e desativar', async () => {
    const user = userEvent.setup()
    const { rerender } = render(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} onEndings={vi.fn()} />
      </AudioContext>,
    )

    expect(screen.queryByRole('button', { name: 'Códigos' })).not.toBeInTheDocument()

    gamePersistence.discoverCode('ligeirinho')
    rerender(
      <AudioContext value={audio}>
        <MenuScreen onBattle={vi.fn()} onHide={vi.fn()} onHistory={vi.fn()} onEndings={vi.fn()} />
      </AudioContext>,
    )
    await user.click(screen.getByRole('button', { name: 'Códigos' }))

    const input = screen.getByLabelText('Digite o código:')
    expect(input).toHaveFocus()
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

    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'CÓDIGOS' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Códigos' })).toHaveFocus()
  })
})
