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
    expect(screen.getByRole('button', { name: 'Esquivar Esquerda' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Atacar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Esquivar Direita' })).toBeInTheDocument()
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

  it('mostra a pose derrotada, o joinha e somente a dança permitida na vitória', async () => {
    vi.useFakeTimers()
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} gameOptions={{ initialEnemyHp: 1 }} />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Atacar' }))

    expect(screen.getByRole('meter', { name: 'Vida de Psicopata' })).toHaveAttribute(
      'aria-valuenow',
      '0',
    )
    expect(screen.getByRole('img', { name: 'Psicopata' })).toHaveAttribute(
      'src',
      expect.stringContaining('psicopata_atordoado.webp'),
    )
    expect(screen.queryByRole('button', { name: 'Atacar' })).not.toBeInTheDocument()
    expect(audio.play).not.toHaveBeenCalledWith('ratDanceMusic')

    await act(async () => vi.advanceTimersByTimeAsync(1_000))
    expect(screen.getByRole('img', { name: 'Psicopata' })).toHaveAttribute(
      'src',
      expect.stringContaining('psicopata_derrotado.webp'),
    )

    await act(async () => vi.advanceTimersByTimeAsync(2_500))
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).toHaveAttribute(
      'src',
      expect.stringContaining('sobrevivente_vitoria.webp'),
    )
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic')

    await act(async () => vi.advanceTimersByTimeAsync(2_500))
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).toHaveAttribute(
      'src',
      expect.stringContaining('rat_dance.gif'),
    )
    expect(screen.getByText('VOCÊ VENCEU!')).toBeInTheDocument()
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
})
