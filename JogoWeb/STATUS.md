# Status da migração

Atualizado em: 04/08/2026

## Estado geral

Migração realinhada, validada e pronta na branch `feat/web`, criada diretamente sobre a `origin/master` atualizada (`437340d`).

## Fases

| Fase | Estado | Evidência |
|---|---|---|
| 1. Análise | ✔ Concluída | Baseline remoto `437340d`, `ANALISE_ANDROID.md`, `INVENTARIO_ASSETS.md` |
| 2. Planejamento | ✔ Concluída | `PLANO_MIGRACAO.md`, `AGENTS.md` |
| 3. Arquitetura/scaffold | ✔ Concluída | React/TypeScript/Vite e assets validados |
| 4. Portabilização | ✔ Concluída | Menu, histórico, persistência, esconderijo, batalha, áudio, HUD e resultados |
| 5. Testes | ✔ Concluída | 104 testes, cobertura mínima, 10 execuções E2E, CI, lint, tipagem, build, cenários visuais e PWA offline |
| 6. Otimização | ✔ Concluída | WebP lossless, chunks, preload por etapa, cache atualizável e PWA offline |
| 7. Verificação | ✔ Concluída | `MATRIZ_EQUIVALENCIA.md` e inspeção real |
| 8. Documentação final | ✔ Concluída | README, execução, arquitetura e migração |

## Entregas concluídas

- ✔ Todos os fontes Kotlin, configurações e assets analisados.
- ✔ Quatro telas, três ViewModels e camada de dados portados.
- ✔ Estados, HP, dano, combo, IA, probabilidades e timers preservados; coordenadas refinadas pela referência do usuário.
- ✔ 41 drawables, 21 MP3 Android e 3 áudios Web próprios; lore corrigida e GIF não utilizado do Fortnite removido.
- ✔ Menu/lore com textos, imagens, fades e retorno.
- ✔ Esconderijo com alvos corrigidos, clique estável, tensão interrompível, retorno ao menu e restart.
- ✔ Batalha com setas, teclado, mouse, IA, parry, perfis de combo, recorde e sequência de vitória refinada.
- ✔ Trilha da batalha em loop com fade-out ao encerrar o combate, além da música e do GIF do Rat Dance.
- ✔ Histórico persistente com estatísticas e detalhes dos dois modos.
- ✔ Galeria persistente de finais, com arte e nome para os obtidos e dicas progressivas para os bloqueados.
- ✔ Áudio com preload real, sobreposição e dez vozes.
- ✔ Menu responsivo e gameplay em palco lógico `480×850`, escalado integralmente sem deformação por zoom.
- ✔ Spring do assassino equivalente ao padrão Compose.
- ✔ 40 WebPs lossless validados: 36,9 MiB → 20,9 MiB.
- ✔ PWA com manifest, ícones, service worker, consulta de atualização na rede e fallback offline.
- ✔ Abertura, esconderijo, batalha, histórico e áudios aprovados offline.
- ✔ 104 testes em 20 arquivos aprovados, com cobertura mínima de 85% de statements, 75% de branches, 85% de funções e 88% de linhas.
- ✔ Playwright configurado com 10 execuções E2E aprovadas em Chrome e Firefox desktop, Chrome e Safari móveis emulados.
- ✔ Jornada crítica validada do menu à vitória, persistindo histórico, final desbloqueado e código `ligeirinho`.
- ✔ Código desbloqueável `ligeirinho` persistido e ativável pelo menu.
- ✔ Final Pidão selecionado abaixo de 40% de vida.
- ✔ Final Venceu na Raça selecionado em toda vitória que não seja Pidão nem perfeita, eliminando resultados sem **Prosseguir**.
- ✔ Final perfeito Sopa de Lobo selecionado com pelo menos dois parries e nenhum golpe recebido, com duas artes e áudio próprio.
- ✔ Tutorial persistente da primeira batalha explica setas/mouse ou A/D/Espaço, recomenda o parry e mantém a IA pausada até a confirmação; o botão **?** permite reabri-lo.
- ✔ 26 cenários reais aprovados, incluindo os três finais completos, tutorial, ajuda, galeria, histórico, abertura 546×866 e zoom equivalente de 67% a 175%.
- ✔ GitHub Actions configurado para validar qualidade, navegadores, PWA e jornadas Playwright em pushes e pull requests.
- ✔ Modais mantêm o foco, devolvem-no ao fechar e respeitam a preferência de movimento reduzido.
- ✔ Matriz Android/Web atualizada com os refinamentos explicitamente autorizados.
- ✔ Código Android preservado; somente a lore corrigida pelo usuário e a remoção do GIF não utilizado alteram os assets da baseline.
- ✔ Documentos obrigatórios finalizados.

## Em andamento

- Nenhuma atividade obrigatória.

## Pendências

- Nenhuma pendência técnica conhecida.

## Expansões autorizadas implementadas

- A primeira vitória revela o código `ligeirinho` e libera o painel Códigos no menu.
- O ritmo padrão usa `300→235→170→115 ms`; `ligeirinho` ativa `250→175→100 ms`.
- A batalha possui finais condicionais pela vida restante, preservando a sequência normal de derrota, joinha e Rat Dance antes de **Prosseguir**.
- O botão **Finais** abre uma galeria que registra automaticamente os finais alcançados em partidas normais; finais bloqueados não carregam sua imagem e oferecem dicas em três níveis.

## Próximo passo opcional

Publicar o conteúdo de `dist/` no provedor estático escolhido. A publicação não faz parte da migração local e não é necessária para executar ou instalar o jogo como PWA.
