import { useCallback, useEffect, useState } from 'react'

import { useAudio } from '../../contexts/audioContextValue'
import { images, preloadImages } from '../../services/assetPaths'
import styles from './MenuScreen.module.css'

interface MenuScreenProps {
  onBattle: () => void
  onHide: () => void
  onHistory: () => void
}

function hashShowsLore() {
  return window.location.hash === '#/lore'
}

export function MenuScreen({ onBattle, onHide, onHistory }: MenuScreenProps) {
  const audio = useAudio()
  const [showLore, setShowLore] = useState(hashShowsLore)

  useEffect(() => {
    preloadImages([images.start])
  }, [])

  useEffect(() => {
    const handleHashChange = () => setShowLore(hashShowsLore())
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showLore) {
        window.location.hash = ''
        setShowLore(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [showLore])

  const openLore = useCallback(() => {
    audio.play('buttonClick')
    window.location.hash = '#/lore'
    setShowLore(true)
  }, [audio])

  const chooseMode = useCallback(
    (callback: () => void) => {
      audio.play('buttonClick')
      callback()
    },
    [audio],
  )

  return (
    <div className={styles.root}>
      <section
        className={`${styles.opening} ${showLore ? styles.openingHidden : ''}`}
        aria-hidden={showLore}
      >
        <img className={styles.startImage} src={images.start} alt="Tela de Início" fetchPriority="high" />
        <button
          className={styles.historyButton}
          type="button"
          onClick={() => chooseMode(onHistory)}
          tabIndex={showLore ? -1 : 0}
        >
          Histórico
        </button>
        <button className={styles.startButton} type="button" onClick={openLore} tabIndex={showLore ? -1 : 0}>
          Iniciar Jogo
        </button>
      </section>

      <section
        className={`${styles.lore} ${showLore ? styles.loreVisible : ''}`}
        aria-label="História"
        aria-hidden={!showLore}
      >
        <article className={styles.story}>
          <p>Você e mais cinco amigos estavam aproveitando uma noite tranquila no sítio, que parecia perfeita.</p>
          <p>
            O estalar da lenha na fogueira era o único som que se misturava às risadas despreocupadas de
            vocês seis, sentados sob um céu absurdamente estrelado. A escuridão da mata ao redor era
            espessa, quase como uma parede viva e silenciosa.
          </p>
          <img
            className={styles.loreImage}
            src={images.loreCampfire}
            alt="Amigos na fogueira"
            loading="lazy"
            decoding="async"
          />
          <p>
            Até que, de repente, um estalo seco — o som de um galho se partindo — ecoa vindo do meio da mata.
            Um dos seus amigos percebe algo e, preocupado, alerta os outros. As risadas cessam.
            <br />
            Todos os olhos se voltam para a escuridão.
          </p>
          <p className={styles.centered}>“Tem alguma coisa ali!” — grita um deles.</p>
          <p>Vocês não conseguem identificar o que é… ou como é… aquela coisa parada na escuridão.</p>
          <p className={`${styles.centered} ${styles.strong}`}>Imóvel. Observando.</p>
          <p>
            Até que, subitamente, ela começa a avançar.
            <br />
            Em pânico, vocês se levantam e correm desesperados em direção à casa.
          </p>
          <p>Vocês não se afastaram muito da casa, então já avistam ela.</p>
          <img
            className={styles.loreImage}
            src={images.cabin}
            alt="Casa do sítio"
            loading="lazy"
            decoding="async"
          />
          <p>
            Já perto da entrada, na correria desenfreada seu corpo passa suas pernas e você acaba
            tropeçando. Seus amigos conseguem alcançar a casa.
            <br />
            Você se levanta o mais rápido possível.
            <br />
            O perseguidor ainda não te alcançou...
            <br />
            <br />
            ...Mas está perto.
          </p>

          <div className={styles.choice}>
            <p className={styles.question}>O que você faz?</p>
            <div className={styles.actions}>
              <button type="button" onClick={() => chooseMode(onHide)} tabIndex={showLore ? 0 : -1}>
                Esconder
              </button>
              <button type="button" onClick={() => chooseMode(onBattle)} tabIndex={showLore ? 0 : -1}>
                Lutar
              </button>
            </div>
          </div>
        </article>
      </section>
    </div>
  )
}
