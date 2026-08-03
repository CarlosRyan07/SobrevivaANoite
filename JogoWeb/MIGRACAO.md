# Histórico e decisões da migração

## Princípio

Esta implementação nasceu como portabilização do jogo Android existente e foi realinhada ao commit `437340d` de `origin/master`. O Kotlin atualizado permanece como baseline; ajustes Web pedidos e aprovados posteriormente pelo usuário têm precedência e são registrados abaixo.

## Mapeamento de arquivos

| Android | Web |
|---|---|
| `MainActivity.kt` | `main.tsx`, `App.tsx`, `AudioProvider` |
| `NavGraph.kt` | `app/navigation.ts` e seleção lazy no `App` |
| `MenuScreen.kt` | `screens/MenuScreen` |
| `HideViewModel.kt` | `hideTypes`, `hideConstants`, `hideEngine`, `useHideGame` |
| `HideScreen.kt` | `screens/HideScreen` |
| `BattleViewModel.kt` | `battleTypes`, `battleConstants`, `battleEngine`, `useBattleGame` |
| `BattleScreen.kt` | `screens/BattleScreen` e `components/HpBar` |
| `SoundManager.kt` | `audioCatalog`, `AudioService`, `AudioContext` |
| `res/drawable` | `public/assets/images`, `gif`, `optimized` |
| `res/raw` | `public/assets/audio` |

## Fases executadas

### 1. Análise

- Todos os fontes, Gradle, manifesto, tema e testes lidos.
- Telas, estados, enums, coordenadas, timers e probabilidades registrados.
- 42 drawables e 20 áudios inventariados.
- Durações de MP3/GIF medidas.

### 2. Planejamento

- Arquitetura modular definida.
- `AGENTS.md` e definição de pronto criados antes do código.
- React local + Context somente para áudio escolhidos para evitar complexidade externa.

### 3. Scaffold

- React, TypeScript estrito, Vite, CSS Modules, ESLint e Vitest configurados.
- Assets copiados mecanicamente; posteriormente, a imagem da lore corrigida pelo usuário foi sincronizada e o GIF não utilizado do Fortnite foi removido das duas versões.
- Primeiro lint/typecheck/test/build aprovado.

### 4. Portabilização

Ordem aplicada:

1. randomização e cancelamento;
2. navegação;
3. áudio;
4. menu/lore;
5. esconderijo;
6. batalha/IA;
7. HUD/resultados;
8. integração responsiva.

Cada módulo recebeu teste focado antes do seguinte.

### 5. Testes

- 67 testes em 16 arquivos.
- Fake timers para janelas e contadores.
- Randomização injetada para resultados determinísticos.
- Inspeção real via Chrome em 14 casos visuais/interativos.

### 6. Otimização

- Code splitting por tela.
- Preload prioritário de abertura e seletivo por modo.
- 36 WebPs lossless, economizando 11,9 MiB.
- PWA, manifest, ícones, precache leve e cache sob demanda.
- Teste offline real de telas e áudio.

### 7. Equivalência

Foram encontradas e corrigidas três diferenças concretas:

1. largura intrínseca de 480 px cortava viewport móvel;
2. preload de áudio apenas definia `preload`, sem `load()` explícito;
3. movimento usava easing CSS em vez da mola Compose.

A matriz final está em `MATRIZ_EQUIVALENCIA.md`.

### 7.1. Refinamentos Web solicitados após a migração

- Os seis esconderijos foram reposicionados conforme a imagem anotada pelo usuário; o ponto externo do psicopata também foi rebaixado.
- O `transform` ativo dos botões circulares foi isolado para impedir deslocamento durante cliques rápidos.
- O resultado do esconderijo passou a oferecer `Voltar ao Menu` além de `Jogar Novamente`.
- A música de tensão agora é interrompida seletivamente assim que termina a inspeção do esconderijo do jogador, inclusive quando ele escapa.
- A batalha aceita `A`/seta esquerda e `D`/seta direita para esquiva.
- A batalha aceita `Espaço` e clique esquerdo em qualquer área livre para atacar; os botões de esquiva mostram apenas setas.
- A dança do Fortnite foi removida dos assets Android e Web; a vitória usa apenas `rat_dance.gif`.
- HP zero agora trava imediatamente ataques e esquivas, cancela timers concorrentes e fixa o sprite derrotado antes do joinha e da dança.
- A vitória possui cenário de teste com inimigo iniciado em 1 HP e usa o `rat_dance_music.mp3` oficial da `master` atualizada.
- `Voltar ao Menu` nos resultados limpa o hash da lore e retorna à abertura real.
- A espera do sprite derrotado foi ajustada para 2.000 ms antes do joinha, reduzindo em 2 segundos o congelamento percebido após o golpe final.
- A música é preparada muda durante o golpe final e retomada audível com o joinha, evitando o bloqueio de autoplay após o timer.
- A arte da abertura usa cobertura responsiva e uma versão escurecida do mesmo fundo fora do palco, eliminando as faixas azuis sem competir com o conteúdo central.
- O histórico dispara atualização local imediata, é testado após reload e o servidor de desenvolvimento fixa a origem em `localhost:5173`.
- Esconderijo e batalha usam um palco lógico fixo de `480×1000`; o palco inteiro é escalado para caber no viewport, preservando posições em qualquer zoom.
- A vitória da batalha passou a selecionar finais pela vida restante: Pidão abaixo de 40%, Venceu na Raça entre 40% e menos de 80% e fluxo padrão a partir de 80%.
- Venceu na Raça possui uma página narrativa e uma revelação final com a arte `vitoria_normal`; o atalho de desenvolvimento `?battleTest=raca#/battle` prepara o teste com 70 HP.
- Os avisos de final obtido compartilham um popup que surge à direita e desliza até repousar à esquerda, mantendo o mesmo padrão visual entre os finais.
- O final perfeito Sopa de Lobo possui prioridade quando o sobrevivente termina ileso e realiza pelo menos três parries; suas etapas usam `patetico`, `vitoria_perfeita` e o áudio `sopa_lobo_audio`, iniciado na página da pergunta e mantido durante a revelação.
- O atalho de desenvolvimento `?battleTest=perfect#/battle` prepara o inimigo com 1 HP e registra três parries iniciais sem pular a sequência normal de vitória.
- A primeira vitória revela o código `ligeirinho`; o menu permite ativá-lo para trocar a progressão de ataques de `300→235→170→135 ms` por `250→175→100 ms`.

### 7.2. Sincronização com a `master` remota

A branch `feat/web` foi criada diretamente sobre `origin/master` em um worktree limpo. Os três commits ausentes no checkout local trouxeram:

- GIF atualizado e música oficial do Rat Dance;
- sequência de vitória de 6.000 ms;
- ataque 250→175→100 ms e combo com timeout de 1.500 ms;
- dez streams de efeitos;
- recorde de combo persistente;
- histórico persistente dos dois modos;
- nova rota e tela `Histórico de Partidas`.

Room e DataStore foram adaptados ao armazenamento local do navegador. A pasta original permaneceu intacta como referência e segurança.

### 8. Documentação

- README e guia de execução;
- arquitetura e decisões;
- análise/inventário;
- plano/status;
- matriz comparativa;
- regras de continuidade.

## Decisões importantes

### Sem Kotlin/Wasm

O requisito definiu React/TypeScript/CSS. A lógica Kotlin foi portada explicitamente, facilitando testes Web e evitando dependências Android.

### Sem Zustand

Os modos não compartilham estado. Hooks locais reproduzem o isolamento dos ViewModels de jogo; o histórico deriva seu estado do serviço persistente.

### Sem React Router

Hash navigation cobre as quatro rotas, funciona em hospedagem estática e preserva Voltar sem fallback de servidor.

### Timers abortáveis

`AbortController` substitui `Job.cancel()`. Restart e unmount cancelam sequências anteriores para impedir atualizações tardias.

### WebP somente com validação

O primeiro codificador testado recusou metadados `sBIT` antigos. Sharp foi adotado com `failOn: none`; a saída só é aceita após comparação decodificada de alfa e RGB visível.

### Cache progressivo

Precaching de todos os assets tornaria a primeira instalação pesada. O shell (~835 KiB) é precacheado; sprites e áudios entram em CacheFirst ao visitar cada modo.

## Integridade do Android

Antes da migração, o worktree já continha seis arquivos Android modificados e vários arquivos não rastreados. Eles foram preservados na criação da branch.

No encerramento:

- a lógica Android permaneceu igual à baseline; no Kotlin, foi removido apenas o comentário que citava o GIF excluído;
- `lore_fogueira.jpg` foi substituída pela correção fornecida pelo usuário;
- `fortnite_dance.gif`, que não era usado, foi removido por decisão do usuário;
- a implementação da versão Web permanece isolada em `JogoWeb/`.

## Manutenção futura

Se o Android mudar:

1. reler o Kotlin alterado;
2. atualizar `ANALISE_ANDROID.md`;
3. portar a regra para engine/hook correspondente;
4. atualizar testes determinísticos;
5. atualizar `MATRIZ_EQUIVALENCIA.md`;
6. executar todos os portões;
7. registrar a mudança neste documento e em `STATUS.md`.
