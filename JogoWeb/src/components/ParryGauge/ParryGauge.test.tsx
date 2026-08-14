import { render, screen } from '@testing-library/react'

import { ParryGauge } from './ParryGauge'

describe('ParryGauge', () => {
  it('mostra o progresso atual de atordoamento', () => {
    render(<ParryGauge current={2} max={4} isStunned={false} />)

    const gauge = screen.getByRole('meter', { name: 'Atordoamento do Psicopata' })
    expect(gauge).toHaveAttribute('aria-valuenow', '2')
    expect(gauge).toHaveAttribute('aria-valuemax', '4')
    expect(gauge.firstElementChild).toHaveStyle({ width: '50%' })
  })

  it('marca a barra para drenagem depois que o inimigo é atordoado', () => {
    render(<ParryGauge current={3} max={4} isStunned />)

    expect(screen.getByRole('meter', { name: 'Atordoamento do Psicopata' }).className).toContain(
      'draining',
    )
  })
})
