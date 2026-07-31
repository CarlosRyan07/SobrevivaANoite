# Arquitetura Web

## Visão geral

O jogo é uma aplicação estática de uma página. React compõe as telas; hooks orquestram os efeitos; engines puras concentram as regras; CSS Modules reproduzem o layout; HTML Audio fornece sons sobrepostos.

```text
App / navegação por hash
├─ AudioProvider → AudioService (10 vozes)
├─ GamePersistence → recorde + histórico local
└─ GameFrame (palco vertical)
   └─ Suspense / code splitting
      ├─ MenuScreen
      ├─ HistoryScreen → historyEngine
      ├─ HideScreen → useHideGame → hideEngine
      └─ BattleScreen → useBattleGame → battleEngine
```

## Camadas

### Shell e navegação

- `src/app/App.tsx`: provider, palco, lazy imports e seleção da tela.
- `src/app/navigation.ts`: converte hashes em `GameRoute` e retorna à lore.
- `src/components/GameFrame`: palco de 100% no celular e máximo 480 px no desktop.

Não há React Router porque quatro rotas por hash resolvem integralmente o fluxo com menos estado e sem configuração de servidor.

### Áudio

- `audioCatalog.ts`: associa nomes tipados aos 21 MP3.
- `AudioService.ts`: preload, play, preparação muda para áudio tardio, parada seletiva, sobreposição, limite de dez streams e release.
- `AudioContext.tsx`: ciclo de vida global.
- `audioContextValue.ts`: contexto e hook de consumo.

Cada efeito cria um novo `HTMLAudioElement`, permitindo sobreposição como `SoundPool`. Ao atingir dez vozes, a mais antiga é interrompida.
As vozes guardam a chave lógica do som, permitindo encerrar apenas a tensão ou a música de vitória sem cortar os demais efeitos.
O Rat Dance cria uma voz muda no gesto do golpe final e torna a mesma voz audível após os timers, contornando políticas de autoplay sem antecipar o som.

### Menu

`MenuScreen` mantém abertura e lore montadas para reproduzir os fades cruzados. Lore usa lazy loading nas imagens. O hash `#/lore` modela retorno pelo navegador e `#/history` abre o histórico.

### Persistência e histórico

- `persistence/gamePersistence.ts`: adapta o recorde do DataStore e as partidas do Room ao armazenamento local Web.
- `history/historyEngine.ts`: resume vitórias/derrotas e formata horários.
- `HistoryScreen`: estatísticas, estado vazio e partidas da mais recente para a mais antiga.

O serviço possui contrato injetável para testes e fallback em memória caso o armazenamento do navegador esteja indisponível. Não há envio de dados a servidor.

### Esconderijo

- `hideTypes.ts`: uniões discriminadas e estado completo.
- `hideConstants.ts`: coordenadas e todos os timers.
- `hideEngine.ts`: estado inicial, caminho, substituto e sobrevivente.
- `useHideGame.ts`: contador, sequência assíncrona, áudio e cancelamento.
- `HideScreen.tsx`: renderização, sem regras de probabilidade.

O hook usa `AbortController` para equivaler ao cancelamento de `Job`. Um ref guarda o estado mais recente para que a sequência assíncrona leia mortes e fase sem closures antigas.

### Batalha

- `battleTypes.ts`: direções, ações, timings e estado.
- `battleConstants.ts`: HP, dano, velocidade e delays.
- `battleEngine.ts`: resolução de ataque, dano, velocidade e paletas.
- `useBattleGame.ts`: IA, jobs concorrentes, input e sequência de resultado.
- `battleKeyboard.ts`: mapeamento testável de `A`/←, `D`/→ e `Espaço`.
- `BattleScreen.tsx`: sprites, controles touch/teclado/mouse, HUD e overlays.
- `HpBar`: componente compartilhado de barra animada.

Controllers independentes reproduzem os jobs Android:

- IA;
- ação do jogador;
- impacto no inimigo;
- timeout de combo;
- sequência de vitória.

### Animação

- Fades, HUD e overlays: CSS.
- Movimento do assassino: `requestAnimationFrame` com mola crítica equivalente ao Compose (`stiffness 1500`, threshold `0.1`).
- GIFs: reprodução nativa por `<img>`.
- `prefers-reduced-motion` reduz transições decorativas, sem mudar timers de regras.

### Aleatoriedade

`RandomSource` abstrai booleano, inteiro, escolha e shuffle. Produção usa `Math.random`; testes injetam sequências determinísticas. As distribuições e listas permanecem as do Kotlin.

## Estado

Não há Zustand. Cada modo possui estado local isolado, como cada `ViewModel` Android. Context API existe somente para áudio global; a persistência é um serviço pequeno, injetável e independente de React.

As fases são uniões discriminadas:

```text
HidePhase: choosing → searching → result
EnemyAction: idle → preparing → attacking → recovering
                                     └→ stunned → idle
                                     └→ defeated
BattleResult: null → win | lose
```

## Responsividade

- Palco: `100dvh`, largura 100%, máximo 480 px.
- Desktop/tablet: centralizado, com a arte da abertura cobrindo o palco e o fundo externo.
- Mobile: ocupa toda a largura, respeita safe areas.
- Telas baixas: HUD e sprites usam breakpoint de altura.
- Telas abaixo de 350 px: mapa de esconderijo reduzido proporcionalmente.
- Lore: rolagem própria e overscroll contido.

## Assets e performance

- Chunks separados para as quatro telas por `React.lazy`.
- Abertura tem preload prioritário.
- Lore usa lazy loading.
- Cada modo preaquece somente seus sprites.
- WebPs lossless reduzem transferência sem alterar pixels visíveis.
- Arquivos originais continuam preservados em `public`.

## PWA e cache

Workbox gera o service worker:

- precache de shell, JS, CSS, manifest e ícones (~835 KiB);
- `CacheFirst` para imagens, até 100 entradas por um ano;
- `CacheFirst` para MP3, até 30 entradas por um ano;
- suporte a range requests de áudio;
- atualização automática e limpeza de caches antigos.

## Testes

- Engines: constantes, probabilidade, dano, velocidade, paletas.
- Hooks: fake timers, parry, hits, combo, contador e resultados.
- Componentes: elementos, controles e acessibilidade.
- Áudio: dez streams, preparação do Rat Dance e cleanup.
- Visual: Chrome real em oito casos, incluindo histórico, abertura 546×866 e seleção com botão mantido pressionado.
- PWA: Chrome real com reload persistente e funcionamento offline.

## Dependências

Runtime:

- React;
- React DOM.

Desenvolvimento:

- Vite e plugin React;
- TypeScript;
- Vitest, Testing Library e jsdom;
- ESLint/typescript-eslint;
- Sharp para otimização;
- Puppeteer Core para validação real;
- vite-plugin-pwa/Workbox.

Nenhuma dependência de runtime de estado, roteamento, UI ou animação foi necessária.
