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
- Assets copiados mecanicamente; originais Android preservados.
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

- 55 testes em 16 arquivos.
- Fake timers para janelas e contadores.
- Randomização injetada para resultados determinísticos.
- Inspeção real via Chrome em sete casos visuais/interativos.

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
- A dança do Fortnite deixou de ser referenciada; a vitória usa apenas `rat_dance.gif`.
- HP zero agora trava imediatamente ataques e esquivas, cancela timers concorrentes e fixa o sprite derrotado antes do joinha e da dança.
- A vitória possui cenário de teste com inimigo iniciado em 1 HP e usa o `rat_dance_music.mp3` oficial da `master` atualizada.

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

Antes da migração, o worktree já continha seis arquivos Android modificados e vários arquivos não rastreados. Eles foram preservados.

No encerramento:

- o diff Android continua com os mesmos seis arquivos;
- o diff stat continua `122 insertions, 79 deletions`;
- nenhuma edição Android foi feita;
- toda nova implementação está em `JogoWeb/`.

## Manutenção futura

Se o Android mudar:

1. reler o Kotlin alterado;
2. atualizar `ANALISE_ANDROID.md`;
3. portar a regra para engine/hook correspondente;
4. atualizar testes determinísticos;
5. atualizar `MATRIZ_EQUIVALENCIA.md`;
6. executar todos os portões;
7. registrar a mudança neste documento e em `STATUS.md`.
