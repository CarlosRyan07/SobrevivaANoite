import { render, screen } from '@testing-library/react'

import { VictoryUnlocks } from './VictoryUnlocks'

describe('VictoryUnlocks', () => {
  it('não renderiza recompensa quando não há código para exibir', () => {
    render(<VictoryUnlocks rewardCode={null} />)

    expect(screen.queryByRole('status', { name: 'Recompensas desbloqueadas' })).not.toBeInTheDocument()
  })

  it('mostra o código liberado em formato compacto', () => {
    render(<VictoryUnlocks rewardCode="ligeirinho" className="ending-reward" />)

    const reward = screen.getByRole('status', { name: 'Recompensas desbloqueadas' })
    expect(reward).toHaveClass('ending-reward')
    expect(reward).toHaveTextContent('CÓDIGO LIBERADO')
    expect(reward).toHaveTextContent('ligeirinho')
  })
})
