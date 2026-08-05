# Análise completa do aplicativo Android

## Objetivo desta análise

Este documento registra o comportamento do aplicativo Android no commit `437340d` de `origin/master`, tratado como fonte de verdade para a atualização Web. O projeto Android não será alterado.

Arquivos centrais analisados:

- `MainActivity.kt`: inicialização da aplicação e do áudio.
- `NavGraph.kt`: rotas `menu`, `hide`, `battle` e `history`.
- `MenuScreen.kt`: abertura, histórico, lore e escolha do modo.
- `HideScreen.kt` e `HideViewModel.kt`: interface e motor do modo esconder.
- `BattleScreen.kt` e `BattleViewModel.kt`: interface e motor do combate.
- `HistoryScreen.kt` e `HistoryViewModel.kt`: estatísticas e lista de partidas.
- `AppDatabase`, `MatchHistoryDao`, `MatchHistory` e `GameSettingsManager`: persistência local.
- `SoundManager.kt`: catálogo, preload e reprodução dos sons.
- Tema, manifesto, Gradle, testes e todos os recursos de `drawable` e `raw`.

## Plataforma original

- Kotlin 2.0.21.
- Android nativo, `minSdk 28`, `targetSdk 35`.
- Jetpack Compose e Material 3.
- Navigation Compose para navegação.
- `ViewModel`, `StateFlow`, corrotinas e `Job` para estado e temporizadores.
- `SoundPool` com até dez streams simultâneos e `MediaPlayer` para música longa.
- Glide para exibir o GIF de dança.
- Orientação fixada como vertical no manifesto.
- Não há backend, conta, multiplayer ou API remota; Room persiste partidas e DataStore persiste o recorde local.

As dependências Volley e a segunda imagem `background_cabana1.jpg` existem, mas não participam do fluxo atual.

## Fluxo de navegação

```text
menu / abertura
  ├─ Histórico -> history
  └─ lore
      ├─ Esconder -> hide
      └─ Lutar    -> battle
```

O destino inicial é `menu`. Dentro dele, a abertura e a lore são estados da mesma tela. A abertura oferece `Histórico` no topo direito. O botão Voltar retorna da lore à abertura e da tela de histórico ao menu. No combate, `Voltar ao Menu` executa `popBackStack()`. O modo esconder Android oferece apenas `Jogar Novamente`; a Web mantém o retorno adicional autorizado pelo usuário.

## Tela de abertura e lore

### Estados

- `Initial`: imagem `tela_inicio.png` ajustada integralmente à tela e botão `Iniciar Jogo`.
- `ShowingLore`: fundo preto, conteúdo vertical rolável e escolha entre os dois modos.

### Transições

- Entrada e saída da abertura: fade de 500 ms.
- Entrada da lore: fade de 1.000 ms com atraso de 500 ms.
- Saída da lore: fade de 500 ms.
- Cada ação de menu toca `clique_botao.mp3`.

### Layout e texto

- Fundo externo azul-marinho `#0A1940`.
- Botão inicial com 200 dp de largura e margem inferior de 80 dp.
- Lore com 24 dp de margem horizontal e 48 dp vertical.
- Espaçamento de 20 dp entre blocos.
- Texto com 17 sp, cor `#E0E0E0` e entrelinha de 25 sp.
- Imagens da lore com 220 dp de altura, recorte `cover` e cantos de 8 dp.

### Lore integral

1. `Você e mais cinco amigos estavam aproveitando uma noite tranquila no sítio, que parecia perfeita.`
2. `O estalar da lenha na fogueira era o único som que se misturava às risadas despreocupadas de vocês seis, sentados sob um céu absurdamente estrelado. A escuridão da mata ao redor era espessa, quase como uma parede viva e silenciosa.`
3. Imagem `lore_fogueira.jpg`.
4. `Até que, de repente, um estalo seco — o som de um galho se partindo — ecoa vindo do meio da mata. Um dos seus amigos percebe algo e, preocupado, alerta os outros. As risadas cessam.\nTodos os olhos se voltam para a escuridão.`
5. `“Tem alguma coisa ali!” — grita um deles.`
6. `Vocês não conseguem identificar o que é… ou como é… aquela coisa parada na escuridão.`
7. `Imóvel. Observando.`
8. `Até que, subitamente, ela começa a avançar.\nEm pânico, vocês se levantam e correm desesperados em direção à casa.`
9. `Vocês não se afastaram muito da casa, então já avistam ela.`
10. Imagem `background_cabana.png`.
11. `Já perto da entrada, na correria desenfreada seu corpo passa suas pernas e você acaba tropeçando. Seus amigos conseguem alcançar a casa.\nVocê se levanta o mais rápido possível.\nO perseguidor ainda não te alcançou...\n\n...Mas está perto.`
12. Pergunta `O que você faz?` e botões `Esconder` e `Lutar`.

## Modo esconder

### Tipos e estados

- `PlayerStatus`: `Hiding` ou `Dead`.
- `GameUiState.Choosing`: escolha aberta e contagem regressiva ativa.
- `GameUiState.Searching`: percurso do assassino em execução.
- `GameUiState.Result`: vitória/derrota, escolha, outro sobrevivente e mensagem opcional.
- `Position`: deslocamento X/Y em dp a partir do centro.
- `SoundEvent`: `DoorBreak`, `PlayerWins`, `PlayerLoses`, `NpcDeath`, `Footsteps`, `CenterTheme` e `PlayTenseSound`.

Estado inicial:

- Seis sobreviventes escondidos.
- Assassino fora da tela em `(28, 500)`.
- Mapa `planta_casa_portainteira.png`.
- Assassino sorteado uniformemente entre Terrifier, lobisomem e Ghostface.
- Direção visual inicial para a esquerda.
- Contador em 10.

### Coordenadas

| Local | Posição final | Posição de hesitação |
|---:|---:|---:|
| 1 | `(-35, 250)` | `(-35, 220)` |
| 2 | `(130, -35)` | `(100, -35)` |
| 3 | `(130, 190)` | `(100, 190)` |
| 4 | `(-170, 150)` | `(-140, 150)` |
| 5 | `(-140, -35)` | `(-110, -35)` |
| 6 | `(-35, -230)` | `(-35, -200)` |

Outras posições:

- Fora da tela: `(28, 500)`.
- Fora da porta: `(28, 310)`.
- Dentro da porta: `(28, 250)`.
- Centro da casa: `(0, 50)`.

O personagem vira horizontalmente de acordo com o sentido da mudança em X. Chegar ao centro dispara `Footsteps`. A imagem do personagem tem 50 dp e os pontos têm 35 dp. Mortos são substituídos por uma mancha de sangue de 40 dp.

### Contagem regressiva

- Começa em 10 e decrementa a cada 1.000 ms.
- O texto fica vermelho quando o valor é 3 ou menor.
- Se atingir zero ainda em `Choosing`, toca derrota e produz imediatamente:
  - `didPlayerWin = false`;
  - escolha e outro sobrevivente nulos;
  - mensagem `Você foi pego antes mesmo de conseguir se esconder.`
- A escolha de um ponto cancela o contador.

### Construção do percurso e probabilidade

1. Embaralha os locais 1 a 6.
2. Usa os quatro primeiros, sem repetição, como percurso inicial.
3. Se o local do jogador for visitado, aguarda a tensão e sorteia um booleano uniforme:
   - 50%: jogador encontrado e derrota;
   - 50%: jogador poupado.
4. Se for poupado, adiciona ao fim do percurso o primeiro local ainda escondido que não seja o jogador nem esteja no restante do percurso.
5. Dessa forma, uma partida vitoriosa termina normalmente com o jogador e um NPC sobreviventes.

### Linha do tempo após uma escolha

1. Estado muda para `Searching`; assassino vai para fora da porta.
2. Espera 2.000 ms.
3. Vai para dentro da porta e toca quebra da porta.
4. Espera 50 ms e troca para `planta_casa.png`.
5. Espera 250 ms e depois mais 1.500 ms.
6. Vai ao centro, dispara passos e espera 3.000 ms.
7. Para cada local:
   - toca `fnaf2_theme.mp3`;
   - vai à posição de hesitação;
   - espera 1.500 ms e mais 1.000 ms;
   - se for o jogador, toca `musica_tensa.mp3` e espera 6.000 ms antes do sorteio;
   - se encontrar o jogador, toca derrota, avança ao ponto, espera 300 ms e encerra;
   - se for NPC, toca um dos oito sons de morte aleatoriamente, avança ao ponto, espera 300 ms e marca o NPC morto;
   - retorna ao centro, toca passos e espera 2.000 ms.
8. Ao esgotar o percurso, espera 500 ms.
9. Alterna a direção quatro vezes, com 400 ms entre alternâncias.
10. Espera 500 ms, vai para fora da porta e espera 2.000 ms.
11. Vai para fora da tela e espera 1.500 ms.
12. Toca `win_hide.mp3` e mostra o resultado.

### Resultado

- Vitória: `UFA!`, `Você sobreviveu!` e mensagem indicando o número do jogador e do outro sobrevivente.
- Derrota: `VOCÊ MORREU` e `Ele te encontrou!`, salvo quando houver mensagem personalizada do contador.
- Fundo preto com 80% de opacidade.
- `Jogar Novamente` reinicia integralmente estado, assassino, mapa e contador.

## Modo batalha

### Tipos e estado inicial

- `AttackDirection`: `LEFT`, `RIGHT`.
- `EnemyAction`: `IDLE`, `PREPARING_ATTACK(direction)`, `ATTACKING(direction)`, `STUNNED`, `RECOVERING`, `DEFEATED`.
- `DodgeTiming`: `NONE`, `EARLY`, `PERFECT`.
- `PlayerState`: `IDLE`, `ATTACKING`, `DODGING`, `STUNNED`.

`BattleUiState` inicial:

- Jogador: 100 HP, parado e `IDLE`.
- Psicopata: 700 HP, parado e `IDLE`.
- Resultado nulo.
- Combo zero.
- Recorde de combo carregado do DataStore.
- Velocidade inicial de ataque do jogador: 250 ms.

### IA do inimigo

1. Ao iniciar ou reiniciar, espera 2.000 ms.
2. No início de cada ciclo normal:
   - inimigo volta a `IDLE` e imagem parada;
   - jogador volta a `IDLE`, sem troca forçada de sprite nesse ponto;
   - intenção e timing de esquiva são apagados.
3. Espera um tempo inteiro aleatório no intervalo `[1.000, 2.000)` ms.
4. Sorteia esquerda/direita com 50% para cada lado.
5. Mostra a preparação por 700 ms.
6. Mostra o ataque por 100 ms.
7. Resolve esquiva/parry/dano.
8. Se não estiver atordoado, muda para `RECOVERING` e espera 1.200 ms.
9. Se estiver atordoado no topo de um ciclo, espera 4.000 ms, volta a parado e reinicia o ciclo.

### Esquiva, parry e dano recebido

- Ações só são aceitas quando o jogador está `IDLE`, a partida não acabou e o inimigo não está `DEFEATED`.
- Esquivar mostra uma de duas imagens aleatórias do lado escolhido por 800 ms.
- Clique durante `PREPARING_ATTACK` registra `EARLY`.
- Clique durante `ATTACKING` registra `PERFECT`.
- Clique fora desses estados registra `NONE`.
- Direção correta + `PERFECT`: parry, toca `parry.mp3`, jogador usa pose correspondente e inimigo fica `STUNNED`.
- Direção correta + `EARLY`: evita dano, toca o som de ataque, zera combo e velocidade; não atordoa.
- Direção errada, ausente ou fora da janela: toca ataque e causa 15 HP de dano.
- Ao ser atingido, combo é zerado, jogador fica `STUNNED` e usa a imagem do lado do golpe por 800 ms.

### Ataque e combo

- Ataque normal causa 3 HP.
- Ataque contra inimigo atordoado causa 10 HP e usa uma das quatro imagens de inimigo atingido.
- Os seis sprites de ataque são usados ciclicamente.
- O contador incrementa em cada golpe aceito.
- O primeiro golpe atordoado usa o índice `1` da lista de imagens de impacto, pois o contador é incrementado antes da seleção.
- O jogador permanece `ATTACKING` durante a velocidade atual; somente depois outro ataque pode ser aceito.
- O primeiro golpe usa 250 ms; ao atingir combo 2, o próximo ataque passa a 175 ms.
- No combo 3 em diante, permanece no mínimo de 100 ms.
- Um timer de 1.500 ms é reiniciado a cada golpe. Ao expirar, combo volta a zero, velocidade volta a 250 ms e imagem volta à parada.
- Todo novo maior combo é persistido no DataStore e aparece como `RECORDE` no topo direito.
- O contador aparece apenas acima de 1.
- Cores: branco abaixo de 15, amarelo de 15 a 29, laranja de 30 a 49 e vermelho a partir de 50.

### Barras de vida

- Largura de 90% e altura de 28 dp.
- Animação de progresso de 500 ms.
- Gradientes mudam nos limites estritos de 80%, 60%, 40% e 20%.
- O texto mostra `atual / máximo`.
- Barra inimiga no topo a 180 dp; barra do jogador a 160 dp e controles a 60 dp do rodapé.

### Vitória e derrota

Vitória:

1. Ao chegar a zero HP, salva a vitória, cancela a IA, bloqueia ações e mantém `psicopata_atordoado.png` por 1.000 ms.
2. Mostra `psicopata_derrotado.png` por 2.500 ms.
3. Inicia `rat_dance_music.mp3` e mostra `sobrevivente_vitoria.png` por 2.500 ms.
4. Mostra somente `rat_dance.gif`; o GIF não utilizado do Fortnite foi removido.
5. Define resultado `win`, oculta HUD e exibe `VOCÊ VENCEU!`, `Tentar Novamente` e `Voltar ao Menu`.

Derrota:

- Ao chegar a zero HP, salva a derrota, cancela a IA e define imediatamente `lose`.
- Overlay preto com 90% de opacidade, `VOCÊ MORREU!`, `Tentar Novamente` e `Voltar ao Menu`.

Reiniciar cancela jobs de jogador, impacto, combo e IA, para a música, zera parries, restaura o estado inicial e inicia nova IA.

## Sistema de áudio

- Os 19 efeitos curtos são carregados na abertura do Android.
- `SoundPool` aceita dez reproduções simultâneas.
- `rat_dance_music.mp3` usa `MediaPlayer`, começa durante a vitória e é interrompida no retry ou ao sair.
- Volume, balanço e velocidade são sempre `1`.
- `lobisomem_ataque1.mp3` está presente, mas não é carregado nem utilizado.
- Na Web, a primeira interação no botão inicial desbloqueará a HTML Audio API.

## Persistência e histórico

- Room guarda cada resultado em `match_history`, mais recente primeiro.
- Partidas registram modo, vitória/derrota, vida final, quantidade de parries e horário.
- No esconderijo, vitória salva 100 HP e derrota salva 0 HP; parries são sempre zero.
- DataStore mantém o maior combo entre sessões.
- A tela `Histórico de Partidas` resume vitórias/derrotas por modo e lista os detalhes de cada batalha.
- Na Web, a mesma informação é persistida localmente no navegador, sem servidor.

## Animações e renderização

- Fades de Compose serão portados para keyframes CSS.
- Barras e cor do combo usam transições de 500 ms.
- Movimento do assassino usa `animateDpAsState` com spring padrão; a Web usará transição curta com easing equivalente.
- Flip horizontal do assassino é preservado com `scaleX(-1)`.
- PNGs dos personagens usam `contain`, preservando transparência.
- GIFs permanecem GIFs animados.

## Responsividade a preservar

- O Android usa retrato e muitos deslocamentos absolutos em dp.
- Menu, lore e histórico usam um palco vertical central de no máximo 480 CSS px e altura do viewport.
- O esconderijo usa um palco lógico de `480×850`, escalado uniformemente como uma única unidade; a batalha preserva o mesmo quadro vertical em layout rolável.
- Em telas grandes, o palco permanece vertical e as laterais recebem fundo derivado do jogo.
- Em telas menores ou com zoom, todos os elementos e offsets do gameplay são reduzidos juntos, sem alterar a proporção.
- O conteúdo da lore continua rolável.
- O contêiner externo respeita `100dvh`; telas de conteúdo continuam respeitando safe areas de celulares.

## Riscos e diferenças de plataforma conhecidas

- Material 3 dinâmico muda cores conforme o Android. A Web usará uma paleta fixa equivalente para consistência.
- Navegadores exigem interação antes de liberar áudio.
- A cadência do event loop do navegador pode variar alguns milissegundos; timers continuarão com os mesmos valores nominais.
- Sprites somam aproximadamente 29,82 MiB; carregamento por tela e preload seletivo são necessários.
- Os testes Android atuais são apenas exemplos de template e não cobrem regras do jogo. A Web precisará de testes reais do motor.

## Critério de fidelidade

A implementação Web somente será considerada equivalente se mantiver:

- mesmos textos e fluxo;
- mesmos estados e transições;
- mesmos HP, danos e limites;
- mesmos timers e probabilidades;
- mesmas listas e escolhas aleatórias;
- mesmos assets e eventos sonoros;
- mesmo comportamento de reinício e resultado;
- mesma composição vertical em celular, tablet e desktop.
