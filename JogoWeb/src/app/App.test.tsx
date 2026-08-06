import { render, screen } from '@testing-library/react'

import { App } from './App'

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
    localStorage.setItem('sobreviva-a-noite.battle-tutorial-seen.v1', 'true')
    window.history.replaceState(null, '', '/')
  })

  it.each([
    { hash: '', label: 'Tela de Início' },
    { hash: '#/hide', label: 'Modo esconder' },
    { hash: '#/battle', label: 'Modo batalha' },
    { hash: '#/history', label: 'Histórico de Partidas' },
    { hash: '#/endings', label: 'Finais' },
    { hash: '#/curiosities', label: 'Curiosidades' },
  ])('carrega a rota $hash dentro do shell principal', async ({ hash, label }) => {
    window.location.hash = hash
    render(<App />)

    const routedScreen = label === 'Tela de Início'
      ? await screen.findByAltText(label, {}, { timeout: 5_000 })
      : await screen.findByLabelText(label, {}, { timeout: 5_000 })
    expect(routedScreen).toBeInTheDocument()
    expect(screen.getByLabelText('Sobreviva à Noite')).toBeInTheDocument()
  })
})
