import { act, fireEvent, render, screen } from '@testing-library/react'

import { AudioContext } from '../../contexts/audioContextValue'
import type { AudioService } from '../../services/AudioService'
import { HideScreen } from './HideScreen'

describe('HideScreen', () => {
  it('renderiza mapa, seis locais e contador inicial do Android', () => {
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <HideScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    expect(screen.getByRole('img', { name: 'Planta da Casa' })).toHaveAttribute(
      'src',
      '/assets/optimized/planta_casa_portainteira.webp',
    )
    expect(screen.getAllByRole('button', { name: /Esconderijo/ })).toHaveLength(6)
    expect(screen.getByText('Rápido, se esconda!')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Esconderijo 1' }))
    expect(screen.getByRole('status')).toHaveTextContent('Ele está procurando...')
  })

  it('oferece jogar novamente e voltar ao menu no resultado', async () => {
    vi.useFakeTimers()
    const onBackToMenu = vi.fn()
    const audio = { play: vi.fn(), stop: vi.fn() } as unknown as AudioService
    render(
      <AudioContext value={audio}>
        <HideScreen onBackToMenu={onBackToMenu} />
      </AudioContext>,
    )

    await act(async () => vi.advanceTimersByTimeAsync(10_000))

    expect(screen.getByRole('button', { name: 'Jogar Novamente' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Voltar ao Menu' }))
    expect(onBackToMenu).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
