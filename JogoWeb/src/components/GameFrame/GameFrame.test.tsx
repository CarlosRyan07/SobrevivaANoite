import { render, screen } from '@testing-library/react'

import { GameFrame } from './GameFrame'

describe('GameFrame', () => {
  it('centraliza o palco e preserva o conteúdo da tela', () => {
    render(
      <GameFrame>
        <p>Conteúdo do jogo</p>
      </GameFrame>,
    )

    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Sobreviva à Noite' })).toBeInTheDocument()
    expect(screen.getByText('Conteúdo do jogo')).toBeInTheDocument()
  })
})
