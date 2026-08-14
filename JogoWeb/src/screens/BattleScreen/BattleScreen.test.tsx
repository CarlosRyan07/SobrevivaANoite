import { act, fireEvent, render, screen, within } from '@testing-library/react'

import { AudioContext } from '../../contexts/audioContextValue'
import { gamePersistence } from '../../persistence/gamePersistence'
import type { AudioService } from '../../services/AudioService'
import { BattleScreen } from './BattleScreen'

function createAudioMock(battleMusicPrepared = true): AudioService {
  return {
    play: vi.fn(),
    stop: vi.fn(),
    fadeOut: vi.fn(),
    hasPrepared: vi.fn(() => battleMusicPrepared),
  } as unknown as AudioService
}

describe('BattleScreen', () => {
  beforeEach(() => {
    localStorage.clear()
    gamePersistence.markBattleTutorialSeen()
  })

  afterEach(() => vi.useRealTimers())

  it('pausa a primeira batalha e explica os dois esquemas de controles', async () => {
    localStorage.removeItem('sobreviva-a-noite.battle-tutorial-seen.v1')
    vi.useFakeTimers()
    const audio = createAudioMock()
    const { unmount } = render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    const tutorial = screen.getByRole('dialog', { name: 'Como jogar a batalha' })
    expect(tutorial).toBeInTheDocument()
    expect(within(tutorial).getByText('CLIQUE DO MOUSE')).toBeInTheDocument()
    expect(within(tutorial).getByText('ESPAÇO', { selector: 'kbd' })).toBeInTheDocument()
    expect(within(tutorial).getByText(/deixando o inimigo vulnerável/)).toBeInTheDocument()
    expect(tutorial).toHaveTextContent(
      'Dica: Se esquive na direção que o inimigo levantar a mão.',
    )
    expect(tutorial).toHaveTextContent('Recomendo usar a opção 2.')
    expect(screen.getByRole('button', { name: 'Começar Batalha' })).toHaveFocus()
    expect(screen.queryByRole('button', { name: 'Atacar' })).not.toBeInTheDocument()

    fireEvent.keyDown(window, { key: ' ', code: 'Space' })
    await act(async () => vi.advanceTimersByTimeAsync(20_000))
    expect(document.querySelector('[aria-label="Vida de Psicopata"]')).toHaveAttribute(
      'aria-valuenow',
      '700',
    )
    expect(document.querySelector('[aria-label="Vida de Sobrevivente"]')).toHaveAttribute(
      'aria-valuenow',
      '100',
    )

    fireEvent.click(screen.getByRole('button', { name: 'Começar Batalha' }))
    expect(screen.queryByRole('dialog', { name: 'Como jogar a batalha' })).not.toBeInTheDocument()
    expect(gamePersistence.hasSeenBattleTutorial()).toBe(true)
    expect(audio.play).toHaveBeenCalledWith('buttonClick')

    unmount()
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )
    expect(screen.queryByRole('dialog', { name: 'Como jogar a batalha' })).not.toBeInTheDocument()
    vi.useRealTimers()
  })

  it('renderiza HUD, sprites e os três controles do combate', () => {
    const audio = createAudioMock()
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
    expect(screen.getByRole('button', { name: 'Esquivar Esquerda' })).toHaveTextContent('←')
    expect(screen.getByRole('button', { name: 'Atacar' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Esquivar Direita' })).toHaveTextContent('→')
    expect(screen.getByRole('button', { name: 'Como jogar' })).toHaveTextContent('?')
    expect(screen.queryByText('Esquivar', { exact: false })).not.toBeInTheDocument()
  })

  it('reabre o tutorial pelo botão de ajuda e permite continuar a batalha', () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Como jogar' }))

    const tutorial = screen.getByRole('dialog', { name: 'Como jogar a batalha' })
    expect(tutorial).toHaveTextContent(
      'Dica: Se esquive na direção que o inimigo levantar a mão.',
    )
    expect(screen.getByRole('button', { name: 'Continuar Batalha' })).toBeInTheDocument()
    expect(audio.play).toHaveBeenCalledWith('buttonClick')

    fireEvent.click(screen.getByRole('button', { name: 'Continuar Batalha' }))
    expect(screen.queryByRole('dialog', { name: 'Como jogar a batalha' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Como jogar' })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('reexibe o tutorial ao abrir a batalha sem áudio preparado', () => {
    const audio = createAudioMock(false)
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    expect(screen.getByRole('dialog', { name: 'Como jogar a batalha' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Continuar Batalha' })).toBeInTheDocument()
  })

  it('aciona a esquiva pelo teclado', () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
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

  it('ataca pela barra de espaço', () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    fireEvent.keyDown(window, { key: ' ', code: 'Space' })

    expect(screen.getByRole('meter', { name: 'Vida de Psicopata' })).toHaveAttribute(
      'aria-valuenow',
      '697',
    )
    expect(audio.play).toHaveBeenCalledWith('punch')
    vi.useRealTimers()
  })

  it('ataca com o botão esquerdo do mouse em qualquer área livre da batalha', () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    fireEvent.pointerDown(screen.getByLabelText('Modo batalha'), {
      pointerType: 'mouse',
      button: 0,
    })

    expect(screen.getByRole('meter', { name: 'Vida de Psicopata' })).toHaveAttribute(
      'aria-valuenow',
      '697',
    )
    expect(audio.play).toHaveBeenCalledWith('punch')
    vi.useRealTimers()
  })

  it('mostra a pose derrotada, o joinha e somente a dança permitida na vitória', async () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} gameOptions={{ initialEnemyHp: 1 }} />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Atacar' }))

    expect(screen.queryByRole('meter', { name: 'Vida de Psicopata' })).not.toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Psicopata' })).toHaveAttribute(
      'src',
      expect.stringContaining('psicopata_atordoado.webp'),
    )
    expect(screen.queryByRole('button', { name: 'Atacar' })).not.toBeInTheDocument()
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { prepareMuted: true })

    await act(async () => vi.advanceTimersByTimeAsync(1_000))
    expect(screen.getByRole('img', { name: 'Psicopata' })).toHaveAttribute(
      'src',
      expect.stringContaining('psicopata_derrotado.webp'),
    )

    await act(async () => vi.advanceTimersByTimeAsync(1_999))
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).not.toHaveAttribute(
      'src',
      expect.stringContaining('sobrevivente_vitoria.webp'),
    )
    await act(async () => vi.advanceTimersByTimeAsync(1))
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).toHaveAttribute(
      'src',
      expect.stringContaining('sobrevivente_vitoria.webp'),
    )
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { resumePrepared: true })

    await act(async () => vi.advanceTimersByTimeAsync(2_500))
    expect(screen.getByRole('img', { name: 'Sobrevivente' })).toHaveAttribute(
      'src',
      expect.stringContaining('rat_dance.gif'),
    )
    expect(screen.getByText('VOCÊ VENCEU!')).toBeInTheDocument()
    expect(screen.queryByText(/Você liberou o código/)).not.toBeInTheDocument()
    expect(document.body.innerHTML).not.toContain('fortnite-dance.gif')
    vi.useRealTimers()
  })

  it('mostra o recorde persistido no topo', () => {
    localStorage.setItem('sobreviva-a-noite.high-combo.v1', '12')
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen onBackToMenu={vi.fn()} />
      </AudioContext>,
    )

    expect(screen.getByLabelText('Recorde de combo 12')).toHaveTextContent('RECORDE: 12')
  })

  it('oferece o final do Pidão após a Rat Dance e inicia o áudio antes da revelação', async () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen
          onBackToMenu={vi.fn()}
          gameOptions={{ initialEnemyHp: 1, initialPlayerHp: 35 }}
        />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Atacar' }))
    await act(async () => vi.advanceTimersByTimeAsync(5_500))

    expect(screen.getByText('VOCÊ VENCEU!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prosseguir' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Tentar Novamente' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar ao Menu' })).toBeInTheDocument()
    expect(audio.play).toHaveBeenCalledWith('ratDanceMusic', { resumePrepared: true })

    fireEvent.click(screen.getByRole('button', { name: 'Prosseguir' }))
    expect(audio.stop).toHaveBeenCalledWith('ratDanceMusic')
    expect(screen.getByRole('dialog', { name: 'Final: A Maldição do Pidão' }))
      .toBeInTheDocument()
    expect(screen.getByRole('img', { name: /Sobrevivente ferido/ })).toHaveAttribute(
      'src',
      expect.stringContaining('vitoria_sobrevivente_machucado.webp'),
    )
    expect(screen.getByLabelText('História do final do Pidão')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Feridas no braço do sobrevivente' }))
      .toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('Você virou...')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(audio.play).toHaveBeenCalledWith('pidaoEnding')
    expect(screen.getByLabelText('A revelação está chegando')).toBeInTheDocument()
    expect(screen.queryByRole('img', { name: 'O sobrevivente transformado no Pidão' }))
      .not.toBeInTheDocument()

    await act(async () => vi.advanceTimersByTimeAsync(1_999))
    expect(screen.queryByRole('img', { name: 'O sobrevivente transformado no Pidão' }))
      .not.toBeInTheDocument()
    await act(async () => vi.advanceTimersByTimeAsync(1))

    expect(screen.getByRole('img', { name: 'O sobrevivente transformado no Pidão' }))
      .toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'UM PIDÃO!!!' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Final obtido' })).toHaveTextContent(
      'Você se tornou um Lobisomem Pidão',
    )
    expect(audio.fadeOut).toHaveBeenCalledWith('pidaoEnding', {
      delay: 10_000,
      duration: 3_000,
    })
    expect(screen.queryByRole('button', { name: 'Tentar Novamente' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar ao Menu' })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('oferece o final Venceu na Raça para uma vitória não perfeita', async () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen
          onBackToMenu={vi.fn()}
          gameOptions={{ initialEnemyHp: 1, initialPlayerHp: 70 }}
        />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Atacar' }))
    await act(async () => vi.advanceTimersByTimeAsync(5_500))

    expect(screen.getByText('VOCÊ VENCEU!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prosseguir' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Prosseguir' }))
    expect(audio.stop).toHaveBeenCalledWith('ratDanceMusic')
    expect(screen.getByRole('dialog', { name: 'Final: Venceu na Raça' })).toBeInTheDocument()
    expect(screen.getByText('Não foi uma batalha fácil.')).toBeInTheDocument()
    expect(screen.getByText(/você conseguiu se sobressair/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))

    expect(screen.getByRole('img', { name: /Sobrevivente celebrando/ })).toHaveAttribute(
      'src',
      expect.stringContaining('vitoria_normal.webp'),
    )
    expect(screen.getByRole('heading', { name: 'VENCEU NA RAÇA!' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Final obtido' })).toHaveTextContent(
      'VOCÊ PEGOU O FINAL:VENCEU NA RAÇA!',
    )
    expect(screen.getByText(/Seus amigos, surpresos/)).toBeInTheDocument()
    expect(screen.getByText('Você conseguiu se sobressair e vencer.')).toBeInTheDocument()
    expect(screen.getByText('CÓDIGO LIBERADO')).toBeInTheDocument()
    expect(screen.getByText('ligeirinho')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Tentar Novamente' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar ao Menu' })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('sempre oferece Prosseguir após uma vitória normal com mais de 80 de vida', async () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen
          onBackToMenu={vi.fn()}
          gameOptions={{ initialEnemyHp: 1, initialPlayerHp: 85 }}
        />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Atacar' }))
    await act(async () => vi.advanceTimersByTimeAsync(5_500))

    expect(screen.getByRole('button', { name: 'Prosseguir' })).toBeInTheDocument()
    vi.useRealTimers()
  })

  it('oferece o final perfeito e toca Sopa de Lobo ao revelar a imagem final', async () => {
    vi.useFakeTimers()
    const audio = createAudioMock()
    render(
      <AudioContext value={audio}>
        <BattleScreen
          onBackToMenu={vi.fn()}
          gameOptions={{ initialEnemyHp: 1, initialParryCount: 2 }}
        />
      </AudioContext>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Atacar' }))
    await act(async () => vi.advanceTimersByTimeAsync(5_500))

    expect(screen.getByText('VOCÊ VENCEU!')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Prosseguir' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Prosseguir' }))

    expect(screen.getByRole('dialog', { name: 'Final: Sopa de Lobo' })).toBeInTheDocument()
    expect(screen.getByText(/Contra qualquer lógica/)).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByRole('img', { name: /olhando com desprezo/ })).toHaveAttribute(
      'src',
      expect.stringContaining('patetico.webp'),
    )
    expect(screen.getByText('— É só isso?')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('— Relaxa, galera ta tudo bem...')).toBeInTheDocument()
    expect(screen.getByText('Hoje vai ter sopa.')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Continuar' }))
    expect(screen.getByText('— Sopa? Sopa de quê mesmo?')).toBeInTheDocument()
    expect(audio.play).toHaveBeenCalledWith('perfectEnding')
    const perfectAudioPlayCount = vi.mocked(audio.play).mock.calls.filter(
      ([sound]) => sound === 'perfectEnding',
    ).length

    fireEvent.click(screen.getByRole('button', { name: 'Sopa de lobo!' }))
    expect(
      vi.mocked(audio.play).mock.calls.filter(([sound]) => sound === 'perfectEnding'),
    ).toHaveLength(perfectAudioPlayCount)
    expect(screen.getByRole('img', { name: /amigo observa a cena, chocado/ })).toHaveAttribute(
      'src',
      expect.stringContaining('vitoria_perfeita.webp'),
    )
    expect(screen.getByRole('heading', { name: 'SOPA DE LOBO!' })).toBeInTheDocument()
    expect(screen.getByRole('status', { name: 'Final obtido' })).toHaveTextContent(
      'VOCÊ PEGOU O FINAL:SOPA DE LOBO!',
    )
    expect(screen.queryByRole('button', { name: 'Tentar Novamente' })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Voltar ao Menu' })).toBeInTheDocument()
    vi.useRealTimers()
  })
})
