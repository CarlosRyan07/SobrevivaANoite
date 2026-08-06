import styles from './CuriositiesScreen.module.css'

interface CuriositiesScreenProps {
  onBack: () => void
}

const curiosities = [
  {
    title: 'De atividade a jogo',
    body: 'Sobreviva à Noite nasceu no 4º período, durante a disciplina de Dispositivos Móveis. A proposta inicial era criar uma aplicação simples, com três telas e persistência de dados.',
  },
  {
    title: 'A ideia cresceu',
    body: 'Inspirado pelo tema, o projeto deixou de ser apenas uma atividade e ganhou uma narrativa jogável. Aos poucos surgiram escolhas, modos de jogo, batalhas, finais e novos desafios para quem sobrevive à noite.',
  },
  {
    title: 'Golpes em live action',
    body: 'Os sprites de ataque do sobrevivente foram criados a partir de fotos tiradas nas próprias poses dos golpes. A ideia era trazer um toque de live action para a animação, antes de transformá-la em arte do jogo.',
  },
  {
    title: 'A inspiração da batalha',
    body: 'O modo batalha ganhou forma depois de assistir a um vídeo de Super Punch-Out!!, do Super Nintendo. A leitura dos ataques, o tempo de esquiva e a oportunidade de contra-atacar inspiraram o sistema de parry.',
  },
  {
    title: 'Do Android para a Web',
    body: 'A versão Web/PWA levou a experiência para navegadores, com controles de teclado e mouse, funcionamento offline, finais desbloqueáveis, códigos e um histórico de partidas.',
  },
]

export function CuriositiesScreen({ onBack }: CuriositiesScreenProps) {
  return (
    <section className={styles.root} aria-label="Curiosidades">
      <header className={styles.topBar}>
        <button type="button" className={styles.backButton} onClick={onBack} aria-label="Voltar">
          ←
        </button>
        <h1>Curiosidades</h1>
      </header>

      <main className={styles.content}>
        <p className={styles.intro}>
          Bastidores de como Sobreviva à Noite saiu da sala de aula e se transformou em um jogo.
        </p>
        {curiosities.map((curiosity) => (
          <article className={styles.card} key={curiosity.title}>
            <h2>{curiosity.title}</h2>
            <p>{curiosity.body}</p>
          </article>
        ))}
      </main>
    </section>
  )
}
