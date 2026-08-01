import { act, fireEvent, render, screen } from '@testing-library/react'

import { AudioContext } from '../../contexts/audioContextValue'
import type { AudioService } from '../../services/AudioService'
import { BattleScreen } from './BattleScreen'

describe('BattleScreen', () => {
  beforeEach(() => localStorage.clear())

  it('renderiza HUD, sprites e os três controles do combate', () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    expect(screen.getByRole('meter', { name: 'Vida de Psicopata' })).toHaveAttribute(
      'aria-valuenow',
      '700',
    )
    expect(screen.getByRole('meter', { name: 'Vida de Sobrevivente' })).toHaveAttribute(
      'aria-valuenow',
      '100',
    )
    expect(screen.getByRole('button', { name: 'Esquivar Esquerda' })).toHaveTextContent('←')
    expect(screen.getByRole('button', { name: 'Atacar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Esquivar Direita' })).toHaveTextContent('→')
    expect(screen.queryByText('Esquivar', { exact: false })).not.toBeInTheDocument()
  })

  it('aciona a esquiva pelo teclado', () => {
    vi.useFakeTimers()
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    fireEvent.keyDown(window, { key: 'a' })
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).toHaveAttribute(
      'src',
      expect.stringMatching(/sobrevivente_esquivando_esquerda1?\.webp$/),
    )
    vi.useRealTimers()
  })

  it('ataca pela barra de espaço', () => {
    vi.useFakeTimers()
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    fireEvent.keyDown(window, { key: ' ', code: 'Space' })

    expect(screen.getByRole('meter', { name: 'Vida de Psicopata' })).toHaveAttribute(
      'aria-valuenow',
      '697',
    )
    expect(audio.play).toHaveBeenCalledWith('punch')
    vi.useRealTimers()
  })

  it('ataca com o botão esquerdo do mouse em qualquer área livre da batalha', () => {
    vi.useFakeTimers()
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    fireEvent.pointerDown(screen.getByLabelText('Modo batalha'), {
      pointerType: 'mouse',
      button: 0,
    })

    expect(screen.getByRole('meter', { name: 'Vida de Psicopata' })).toHaveAttribute(
      'aria-valuenow',
      '697',
    )
    expect(audio.play).toHaveBeenCalledWith('punch')
    vi.useRealTimers()
  })

  it('mostra a pose derrotada, o joinha e somente a dança permitida na vitória', async () => {
    vi.useFakeTimers()
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} gameOptions={{ initialEnemyHp: 1 }} />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Atacar' }))

    expect(screen.queryByRole('meter', { name: 'Vida de Psicopata' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Psicopata' })).toHaveAttribute(
      'src',
      expect.stringContaining('psicopata_atordoado.webp'),
    )
    expect(screen.queryByRole('button', { name: 'Atacar' })).not.toBeInTheDocument()
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { prepareMuted: true })

    await act(async () => vi.advanceTimersByTimeAsync(1_000))
    expect(screen.getByRole('img', { name: 'Psicopata' })).toHaveAttribute(
      'src',
      expect.stringContaining('psicopata_derrotado.webp'),
    )

    await act(async () => vi.advanceTimersByTimeAsync(1_999))
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).not.toHaveAttribute(
      'src',
      expect.stringContaining('sobrevivente_vitoria.webp'),
    )
    await act(async () => vi.advanceTimersByTimeAsync(1))
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).toHaveAttribute(
      'src',
      expect.stringContaining('sobrevivente_vitoria.webp'),
    )
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { resumePrepared: true })

    await act(async () => vi.advanceTimersByTimeAsync(2_500))
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).toHaveAttribute(
      'src',
      expect.stringContaining('rat_dance.gif'),
    )
    expect(screen.getByText('VOCÊ VENCEU!')).toBeInTheDocument()
    expect(screen.getByRole('status')).toHaveTextContent('Você liberou o código:ligeirinho')
    expect(document.body.innerHTML).not.toContain('fortnite-dance.gif')
    vi.useRealTimers()
  })

  it('mostra o recorde persistido no topo', () => {
    localStorage.setItem('sobreviva-a-noite.high-combo.v1', '12')
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    expect(screen.getByLabelText('Recorde de combo 12')).toHaveTextContent('RECORDE: 12')
  })

  it('oferece o final do Pidão após a Rat Dance e inicia o áudio antes da revelação', async () => {
    vi.useFakeTimers()
    const audio = {
      play: vi.fn(),
      stop: vi.fn(),
      fadeOut: vi.fn(),
    } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <BattleScreen
          onBackToMenu={vi.fn()}
          gameOptions={{ initialEnemyHp: 1, initialPlayerHp: 35 }}
        />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Atacar' }))
    await act(async () => vi.advanceTimersByTimeAsync(5_500))

    expect(screen.getByText('VOCÊ VENCEU!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prosseguir' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar Novamente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar ao Menu' })).toBeInTheDocument()
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { resumePrepared: true })

    fireEvent.click(screen.getByRole('button', { name: 'Prosseguir' }))
    expect(audio.stop).toHaveBeenCalledWith('ratDanceMusic')
    expect(screen.getByRole('dialog', { name: 'Final: A Maldição do Pidão' }))
      .toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Sobrevivente ferido/ })).toHaveAttribute(
      'src',
      expect.stringContaining('vitoria_sobrevivente_machucado.png'),
    )
    expect(screen.getByLabelText('História do final do Pidão')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Feridas no braço do sobrevivente' }))
      .toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('Você virou...')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(audio.play).toHaveBeenCalledWith('pidaoEnding')
    expect(screen.getByLabelText('A revelação está chegando')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'O sobrevivente transformado no Pidão' }))
      .not.toBeInTheDocument()

    await act(async () => vi.advanceTimersByTimeAsync(1_999))
    expect(screen.queryByRole('img', { name: 'O sobrevivente transformado no Pidão' }))
      .not.toBeInTheDocument()
    await act(async () => vi.advanceTimersByTimeAsync(1))

    expect(screen.getByRole('img', { name: 'O sobrevivente transformado no Pidão' }))
      .toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'UM PIDÃO!!!' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Final obtido' })).toHaveTextContent(
      'Você se tornou um Lobisomem Pidão',
    )
    expect(audio.fadeOut).toHaveBeenCalledWith('pidaoEnding', {
      delay: 10_000,
      duration: 3_000,
    })
    expect(screen.queryByRole('button', { name: 'Tentar Novamente' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar ao Menu' })).toBeInTheDocument()
    vi.useRealTimers()
  })
})
