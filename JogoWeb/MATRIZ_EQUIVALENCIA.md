# Matriz de equivalência Android ↔ Web

## Resultado

A versão Web preserva o baseline Android, acrescido dos refinamentos explicitamente solicitados pelo usuário após a migração. Essas diferenças autorizadas estão identificadas na matriz e em `MIGRACAO.md`.

## Navegação e menu

| Item Android | Implementação Web | Estado |
|---|---|---|
| Rotas `menu`, `hide`, `battle`, `history` | Hashes `#/lore`, `#/hide`, `#/battle`, `#/history` | ✔ Equivalente |
| Abertura como estado inicial | `MenuScreen` inicia na abertura | ✔ Equivalente |
| Voltar da lore para abertura | Histórico do navegador e Escape | ✔ Equivalente |
| Botão inicial 200 dp / margem 80 dp | 200 px / 80 px em CSS independente de densidade | ✔ Equivalente |
| Fade abertura 500 ms | Transição CSS 500 ms | ✔ Equivalente |
| Lore 1.000 ms + atraso 500 ms | Transição CSS 1.000 ms + 500 ms | ✔ Equivalente |
| Lore integral e duas imagens | Mesmos textos e arquivos | ✔ Equivalente |
| Clique nos três botões de fluxo | `buttonClick` nos mesmos eventos | ✔ Equivalente |
| Botão `Histórico` na abertura | Mesmo botão, posição e som | ✔ Equivalente |

## Esconderijo

| Regra Android | Implementação Web | Estado |
|---|---|---|
| Seis locais e coordenadas em dp | Seis locais reposicionados conforme a imagem anotada | ✔ Refinamento autorizado |
| Contador inicia em 10 | Inicia em 10 | ✔ Equivalente |
| Tick a cada 1.000 ms | 1.000 ms | ✔ Equivalente |
| Vermelho em 3 ou menos | Mesmo limiar | ✔ Equivalente |
| Derrota sem escolha no zero | Mesmo som, resultado e mensagem | ✔ Equivalente |
| Sorteio uniforme de 3 assassinos | Mesma lista e distribuição | ✔ Equivalente |
| Caminho: 4 de 6 sem repetição | Mesmo shuffle e `slice(0, 4)` | ✔ Equivalente |
| Visita ao jogador: 50% | Booleano uniforme | ✔ Equivalente |
| Substituição após escapar | Primeiro local disponível na mesma ordem | ✔ Equivalente |
| Quatro NPCs morrem na vitória | Coberto por teste determinístico | ✔ Equivalente |
| Outro sobrevivente: primeiro por ordem | Mesma busca 1→6 | ✔ Equivalente |
| Porta 2.000 + 50 + 250 + 1.500 ms | Mesmos quatro atrasos | ✔ Equivalente |
| Centro 3.000 ms | 3.000 ms | ✔ Equivalente |
| Hesitação 1.500 + 1.000 ms | Mesmos atrasos | ✔ Equivalente |
| Tensão 6.000 ms | 6.000 ms e interrupção seletiva ao fim da inspeção | ✔ Refinamento autorizado |
| Revelação/morte 300 ms | 300 ms | ✔ Equivalente |
| Retorno 2.000 ms | 2.000 ms | ✔ Equivalente |
| Olhar 4 × 400 ms | Quatro flips a cada 400 ms | ✔ Equivalente |
| Saída 500 + 2.000 + 1.500 ms | Mesmos atrasos | ✔ Equivalente |
| Movimento `animateDpAsState` | Mola crítica via rAF, rigidez 1.500 e limiar 0,1 | ✔ Equivalente |
| Flip pelo sentido em X | `scaleX(-1)` com a mesma regra | ✔ Equivalente |
| Todos os sete eventos de som | Mesmos arquivos/eventos | ✔ Equivalente |
| Resultado e `Jogar Novamente` | Reset integral e botão adicional `Voltar ao Menu` | ✔ Refinamento autorizado |

## Batalha e IA

| Regra Android | Implementação Web | Estado |
|---|---|---|
| Jogador 100 HP / inimigo 700 HP | 100 / 700 | ✔ Equivalente |
| IA espera 2.000 ms inicialmente | 2.000 ms | ✔ Equivalente |
| Idle aleatório `[1.000, 2.000)` | Inteiro uniforme no mesmo intervalo | ✔ Equivalente |
| Direção 50/50 | Booleano uniforme | ✔ Equivalente |
| Preparação 700 ms | 700 ms | ✔ Equivalente |
| Ataque/perfect window 100 ms | 100 ms | ✔ Equivalente |
| Recovery 1.200 ms | 1.200 ms | ✔ Equivalente |
| Stun 4.000 ms | 4.000 ms | ✔ Equivalente |
| Esquiva dura 800 ms | 800 ms | ✔ Equivalente |
| Controles touch | Touch/click mais `A`/← e `D`/→ | ✔ Refinamento Web autorizado |
| EARLY correto evita dano e não atordoa | Mesma resolução e som | ✔ Equivalente |
| PERFECT correto aplica parry | Mesmo sprite, som e stun | ✔ Equivalente |
| Erro/ausência causa 15 HP | 15 HP | ✔ Equivalente |
| Hit dura 800 ms | 800 ms | ✔ Equivalente |
| Ataque normal causa 3 | 3 | ✔ Equivalente |
| Ataque no stun causa 10 | 10 | ✔ Equivalente |
| Seis sprites de ataque cíclicos | Mesma ordem e módulo | ✔ Equivalente |
| Primeiro hit no stun usa índice 1 | Incremento anterior ao módulo preservado | ✔ Equivalente |
| Velocidade 250→175→100 desde combo 2 | Mesma progressão e mínimo | ✔ Equivalente |
| Combo expira 1.500 ms após último golpe | Timer reiniciado em cada golpe | ✔ Equivalente |
| Combo visível acima de 1 | Mesmo limiar | ✔ Equivalente |
| Cores 15/30/50 | Mesmos limites | ✔ Equivalente |
| Maior combo persiste no DataStore | `localStorage`, atualização imediata e exibição `RECORDE` | ✔ Equivalente |
| HP gradiente com limites estritos | Mesmas cinco paletas e comparadores `>` | ✔ Equivalente |
| Barra anima por 500 ms | CSS 500 ms | ✔ Equivalente |
| Vitória: atordoado 1 s, derrotado 2,5 s, pose 2,5 s e GIF | Mesma sequência de 6 s e somente `rat_dance.gif` | ✔ Equivalente |
| Combate ainda aceitava ações durante a sequência | HP zero trava ações e cancela timers concorrentes | ✔ Correção Web |
| `rat_dance_music.mp3` inicia com a pose | Mesmo arquivo atualizado e mesmo instante | ✔ Equivalente |
| Derrota imediata no HP zero | Mesmo resultado e overlay | ✔ Equivalente |
| Retry cancela jobs rastreados e reseta | Todos os timers/controllers cancelados | ✔ Equivalente |

## Áudio

| Item | Android | Web | Estado |
|---|---|---|---|
| Catálogo | 19 sons carregados + 1 não usado | Mesma separação | ✔ |
| Preload | `SoundPool.load()` | `HTMLAudioElement.load()` | ✔ |
| Simultaneidade | 10 streams | 10 vozes | ✔ |
| Volume/velocidade | 1 / 1 | 1 / 1 | ✔ |
| Sobreposição | Permitida | Nova instância por evento | ✔ |
| Morte NPC | Sorteio entre 8 arquivos | Mesma lista | ✔ |
| Parada seletiva | Não disponível no evento original | `stop(key)` encerra a tensão sem cortar outros sons | ✔ Refinamento Web |

## Persistência e histórico

| Android | Web | Estado |
|---|---|---|
| Room salva resultados | Armazenamento local salva o mesmo modelo | ✔ Equivalente funcional |
| DataStore salva maior combo | Chave versionada no armazenamento local | ✔ Equivalente funcional |
| Ordenação por timestamp decrescente | Mesma ordenação | ✔ Equivalente |
| Estatísticas por modo | Mesmas quatro contagens | ✔ Equivalente |
| Batalha salva HP e parries | Mesmos campos e valores | ✔ Equivalente |
| Esconderijo salva HP 100/0 e parries 0 | Mesmos valores | ✔ Equivalente |

## Assets e renderização

- Todos os 42 drawables e 21 MP3 da `master` atualizada foram copiados.
- Todos os mipmaps/ícones Android foram preservados.
- Os dois GIFs originais permanecem preservados, mas `fortnite-dance.gif` não é mais referenciado pelo jogo.
- 36 PNGs possuem derivados WebP lossless.
- A validação exige alfa idêntico e RGB idêntico em todo pixel visível.
- Economia: 28,3 MiB → 16,4 MiB nos recursos convertidos.
- JPGs, GIFs, MP3s e originais PNG permanecem sem modificação.

## Correções feitas durante a comparação

1. O palco móvel foi corrigido de largura intrínseca 480 para `width: 100%; max-width: 480px`.
2. O preload Web passou a chamar `audio.load()` explicitamente.
3. O movimento CSS de 280 ms foi substituído pela mola equivalente do Compose.
4. Caminhos de assets passaram a respeitar base relativa para hospedagem em subpastas.
5. As otimizações foram condicionadas à equivalência visual de pixels.
6. Os botões de esconderijo preservam a centralização durante `:active` e permanecem acessíveis nas bordas.
7. O áudio passou a aceitar parada por chave e a respeitar `BASE_URL` também em hospedagem por subpasta.
8. A vitória cancela timers de ação/impacto/combo antes de fixar o estado `defeated`.

## Diferenças inevitáveis de plataforma

| Diferença | Motivo | Impacto |
|---|---|---|
| `SoundPool` vs HTML Audio API | APIs nativas diferentes | Sem mudança nominal de eventos/volume; o navegador libera som após interação |
| Material 3 dinâmico vs paleta fixa | Android pode derivar cores do wallpaper | Web usa o roxo Material equivalente e consistente |
| Corrotinas vs timers/event loop | Runtimes diferentes | Mesmos tempos solicitados; variação de scheduling depende do dispositivo |
| Navigation Compose vs hash | Ambiente Web | Mesmo fluxo e suporte nativo ao botão Voltar |
| Retrato forçado vs palco vertical | Browser desktop não deve girar a tela | O jogo permanece vertical, centralizado, com laterais temáticas |

As diferenças de plataforma não alteram HP, dano, probabilidade, escolha, IA ou combo. As mudanças de controles, coordenadas, áudio e vitória listadas acima foram solicitadas explicitamente pelo usuário.

## Evidências de verificação

- 55 testes em 16 arquivos.
- ESLint sem erros/avisos.
- TypeScript estrito sem erros.
- Build Vite/PWA concluído.
- Sete casos visuais/interativos reais, incluindo histórico e pressão mantida no esconderijo.
- Abertura, esconderijo, batalha e áudio verificados offline.
- `git diff --stat` do Android permanece idêntico ao baseline inicial: seis arquivos previamente modificados, 122 inserções e 79 remoções; a migração adicionou somente `JogoWeb/`.
