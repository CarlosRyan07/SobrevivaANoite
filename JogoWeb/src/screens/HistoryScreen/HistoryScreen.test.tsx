import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GamePersistence } from '../../persistence/gamePersistence'
import { HistoryScreen } from './HistoryScreen'

describe('HistoryScreen', () => {
  beforeEach(() => localStorage.clear())

  it('mostra estado vazio e permite voltar', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    render(<HistoryScreen onBack={onBack} persistence={new GamePersistence(localStorage)} />)

    expect(screen.getByText('Nenhuma partida jogada ainda.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('mostra estatísticas e detalhes das partidas mais recentes', () => {
    let timestamp = new Date(2026, 6, 30, 20, 0).getTime()
    const persistence = new GamePersistence(localStorage, () => timestamp)
    persistence.saveMatch({
      gameMode: 'Esconde-Esconde',
      wasVictory: true,
      finalPlayerHp: 100,
      parryCount: 0,
    })
    timestamp = new Date(2026, 6, 31, 13, 45).getTime()
    persistence.saveMatch({
      gameMode: 'Batalha',
      wasVictory: false,
      finalPlayerHp: 10,
      parryCount: 3,
    })

    render(<HistoryScreen onBack={vi.fn()} persistence={persistence} />)

    expect(screen.getByLabelText('Estatísticas de Batalha')).toHaveTextContent(
      'Vitórias: 0 | Derrotas: 1',
    )
    expect(screen.getByLabelText('Estatísticas de Esconde-Esconde')).toHaveTextContent(
      'Vitórias: 1 | Derrotas: 0',
    )
    expect(screen.getByText('Vida Final: 10 | Parrys: 3')).toBeInTheDocument()
    expect(screen.getByText('31/07/2026 às 13:45')).toBeInTheDocument()
  })

  it('atualiza a lista no mesmo navegador assim que a batalha é registrada', () => {
    const persistence = new GamePersistence(localStorage)
    render(<HistoryScreen onBack={vi.fn()} persistence={persistence} />)
    expect(screen.getByText('Nenhuma partida jogada ainda.')).toBeInTheDocument()

    act(() => {
      persistence.saveMatch({
        gameMode: 'Batalha',
        wasVictory: true,
        finalPlayerHp: 70,
        parryCount: 4,
      })
    })

    expect(screen.getByLabelText('Estatísticas de Batalha')).toHaveTextContent(
      'Vitórias: 1 | Derrotas: 0',
    )
    expect(screen.getByText('Vida Final: 70 | Parrys: 4')).toBeInTheDocument()
  })
})
