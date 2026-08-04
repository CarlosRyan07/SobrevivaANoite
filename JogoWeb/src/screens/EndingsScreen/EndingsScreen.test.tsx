import { fireEvent, render, screen } from '@testing-library/react'

import { GamePersistence } from '../../persistence/gamePersistence'
import { EndingsScreen } from './EndingsScreen'

describe('EndingsScreen', () => {
  beforeEach(() => localStorage.clear())

  it('mantém finais bloqueados sem imagem e revela dicas progressivas', () => {
    const onBack = vi.fn()
    render(<EndingsScreen onBack={onBack} persistence={new GamePersistence(localStorage)} />)

    expect(screen.getByText('0 de 3 obtidos')).toBeInTheDocument()
    expect(screen.getAllByLabelText(/Final \d: não obtido/)).toHaveLength(3)
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Nem toda vitória precisa ser perfeita.')).toBeInTheDocument()

    const nextHint = screen.getByRole('button', { name: 'Próxima dica do final 1' })
    fireEvent.click(nextHint)
    expect(screen.getByText('Enfrente alguma dificuldade, mas não chegue ao limite.'))
      .toBeInTheDocument()
    fireEvent.click(nextHint)
    expect(
      screen.getByText(
        'Vença com pelo menos 40 de vida sem cumprir as exigências do final perfeito.',
      ),
    ).toBeInTheDocument()
    expect(nextHint).toBeDisabled()

    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(onBack).toHaveBeenCalledOnce()
  })

  it('mostra nome e imagem somente dos finais obtidos', () => {
    const persistence = new GamePersistence(localStorage)
    persistence.discoverEnding('raca')
    persistence.discoverEnding('perfect')

    render(<EndingsScreen onBack={vi.fn()} persistence={persistence} />)

    expect(screen.getByText('2 de 3 obtidos')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Venceu na Raça!' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sopa de Lobo!' })).toBeInTheDocument()
    expect(screen.getAllByRole('img')).toHaveLength(2)
    expect(screen.getByLabelText('Final 2: não obtido')).toHaveTextContent('???')
    expect(screen.queryByText('Lobisomem Pidão')).not.toBeInTheDocument()
  })
})
