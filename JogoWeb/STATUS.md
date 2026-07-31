# Status da migração

Atualizado em: 31/07/2026

## Estado geral

Migração realinhada, validada e pronta na branch `feat/web`, criada diretamente sobre a `origin/master` atualizada (`437340d`).

## Fases

| Fase | Estado | Evidência |
|---|---|---|
| 1. Análise | ✔ Concluída | Baseline remoto `437340d`, `ANALISE_ANDROID.md`, `INVENTARIO_ASSETS.md` |
| 2. Planejamento | ✔ Concluída | `PLANO_MIGRACAO.md`, `AGENTS.md` |
| 3. Arquitetura/scaffold | ✔ Concluída | React/TypeScript/Vite e assets validados |
| 4. Portabilização | ✔ Concluída | Menu, histórico, persistência, esconderijo, batalha, áudio, HUD e resultados |
| 5. Testes | ✔ Concluída | 55 testes, lint, tipagem, build, sete cenários visuais e PWA offline aprovados |
| 6. Otimização | ✔ Concluída | WebP lossless, chunks, lazy loading, cache e PWA offline |
| 7. Verificação | ✔ Concluída | `MATRIZ_EQUIVALENCIA.md` e inspeção real |
| 8. Documentação final | ✔ Concluída | README, execução, arquitetura e migração |

## Entregas concluídas

- ✔ Todos os fontes Kotlin, configurações e assets analisados.
- ✔ Quatro telas, três ViewModels e camada de dados portados.
- ✔ Estados, HP, dano, combo, IA, probabilidades e timers preservados; coordenadas refinadas pela referência do usuário.
- ✔ 42 drawables, 21 MP3 e ícones Android copiados.
- ✔ Menu/lore com textos, imagens, fades e retorno.
- ✔ Esconderijo com alvos corrigidos, clique estável, tensão interrompível, retorno ao menu e restart.
- ✔ Batalha com teclado, IA, parry, novo combo 250→175→100, recorde e sequência remota de vitória.
- ✔ Música e GIF do Rat Dance idênticos aos arquivos da `master` atualizada.
- ✔ Histórico persistente com estatísticas e detalhes dos dois modos.
- ✔ Áudio com preload real, sobreposição e dez vozes.
- ✔ Palco responsivo 390/480 px e laterais temáticas.
- ✔ Spring do assassino equivalente ao padrão Compose.
- ✔ 36 WebPs lossless validados: 28,3 MiB → 16,4 MiB.
- ✔ PWA com manifest, ícones, service worker e cache sob demanda.
- ✔ Abertura, esconderijo, batalha, histórico e áudios aprovados offline.
- ✔ 55 testes em 16 arquivos aprovados no ciclo funcional.
- ✔ Sete cenários visuais reais aprovados, incluindo o novo histórico no celular.
- ✔ Matriz Android/Web atualizada com os refinamentos explicitamente autorizados.
- ✔ Código Android preservado exatamente como na `origin/master` usada como baseline.
- ✔ Documentos obrigatórios finalizados.

## Em andamento

- Nenhuma atividade obrigatória.

## Pendências

- Nenhuma pendência técnica conhecida.

## Próximo passo opcional

Publicar o conteúdo de `dist/` no provedor estático escolhido. A publicação não faz parte da migração local e não é necessária para executar ou instalar o jogo como PWA.
