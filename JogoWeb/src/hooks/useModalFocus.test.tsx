import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { useModalFocus } from './useModalFocus'

function DialogHarness({ open }: { open: boolean }) {
  const dialogRef = useModalFocus<HTMLDivElement>(open)
  return (
    <>
      <button type="button">Abrir</button>
      {open && (
        <div ref={dialogRef} role="dialog" aria-modal="true" tabIndex={-1}>
          <button type="button" data-modal-autofocus>Primeiro</button>
          <button type="button">Último</button>
        </div>
      )}
    </>
  )
}

describe('useModalFocus', () => {
  it('move, mantém e devolve o foco ao abrir e fechar um modal', async () => {
    const user = userEvent.setup()
    const { rerender } = render(<DialogHarness open={false} />)
    const opener = screen.getByRole('button', { name: 'Abrir' })
    opener.focus()

    rerender(<DialogHarness open />)
    const first = screen.getByRole('button', { name: 'Primeiro' })
    const last = screen.getByRole('button', { name: 'Último' })
    await waitFor(() => expect(first).toHaveFocus())

    await user.tab({ shift: true })
    expect(last).toHaveFocus()
    await user.tab()
    expect(first).toHaveFocus()

    rerender(<DialogHarness open={false} />)
    await waitFor(() => expect(opener).toHaveFocus())
  })
})
