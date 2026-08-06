import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { CuriositiesScreen } from './CuriositiesScreen'

describe('CuriositiesScreen', () => {
  it('apresenta os bastidores reais e permite voltar ao menu', async () => {
    const onBack = vi.fn()
    const user = userEvent.setup()
    render(<CuriositiesScreen onBack={onBack} />)

    expect(screen.getByRole('heading', { name: 'Curiosidades' })).toBeInTheDocument()
    expect(screen.getByText('De atividade a jogo')).toBeInTheDocument()
    expect(screen.getByText('Golpes em live action')).toBeInTheDocument()
    expect(screen.getByText('A inspiração da batalha')).toBeInTheDocument()
    expect(screen.getByText(/Super Punch-Out/)).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Voltar' }))
    expect(onBack).toHaveBeenCalledOnce()
  })
})
