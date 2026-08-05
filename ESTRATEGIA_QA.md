# Estratégia de Qualidade

Este documento descreve como a qualidade de **Sobreviva à Noite** é planejada, automatizada e evidenciada nas versões Web/PWA e Android. O objetivo não é apenas aumentar cobertura: cada camada protege um risco real do jogo e produz uma falha fácil de diagnosticar.

## Objetivos

- proteger regras críticas de batalha, esconderijo, finais, códigos e persistência;
- impedir regressões nos principais caminhos do jogador;
- validar teclado, mouse, toque, responsividade e acessibilidade básica;
- garantir que a PWA continue utilizável sem conexão após o primeiro acesso;
- manter execuções determinísticas, relatórios reproduzíveis e critérios claros para merge.

## Estratégia baseada em risco

| Prioridade | Risco | Proteção principal |
|---|---|---|
| Crítica | Resultado incorreto da batalha ou final desbloqueado pela condição errada | testes unitários de regras, hooks e jornada E2E de vitória |
| Crítica | Histórico, recorde, códigos ou finais não persistirem | testes de persistência, E2E e Room no Android |
| Crítica | Escolha ou tempo esgotado no esconderijo gerar resultado incorreto | testes do motor/hook e jornada E2E do esconderijo |
| Alta | Controles, parry, timers ou áudios ficarem fora de sincronia | testes de hook/componente e E2E em navegador real |
| Alta | Interface ficar inutilizável em diferentes telas | Playwright mobile emulado e verificações estruturais no Chrome |
| Alta | PWA abrir sem assets, rotas ou áudios quando offline | auditoria automatizada online/offline |
| Média | Regressão visual sem quebra funcional | cenários estruturais em viewports e escalas diferentes, mais exploração manual |

## Camadas de teste

### Web/PWA

| Camada | Ferramenta | Escopo |
|---|---|---|
| Unidade | Vitest | motores, regras, aleatoriedade, códigos e cálculos |
| Componente e integração | Vitest + Testing Library | telas, modais, foco, controles, timers, áudio e persistência |
| Jornada de usuário | Playwright | menu, lore, tutorial, batalha, esconderijo, vitória, histórico, finais e códigos |
| Responsividade | Playwright + Puppeteer | desktop, mobile emulado, viewports e escalas críticas |
| PWA | script automatizado no Chrome | cache, service worker, telas e assets online/offline |
| Análise estática | ESLint + TypeScript | padrões de código e contratos de tipos |

### Android

| Camada | Ferramenta | Escopo |
|---|---|---|
| Unidade local | JUnit | regras puras de batalha e esconderijo |
| Persistência instrumentada | AndroidX Test + Room | gravação, ordenação e estatísticas |
| Interface instrumentada | Compose UI Test | controles, barras, contador e telas de resultado |
| Cobertura | JaCoCo | execução das regras Kotlin na JVM |

## Matriz de rastreabilidade

| Requisito | Unidade/componente | E2E/Web | Android |
|---|:---:|:---:|:---:|
| Navegação, lore e menu | ✅ | ✅ | — |
| Ataque, esquiva, parry e combo | ✅ | ✅ | ✅ |
| Três finais condicionais | ✅ | ✅ | — |
| Esconderijo e tempo esgotado | ✅ | ✅ | ✅ |
| Histórico e estatísticas | ✅ | ✅ | ✅ |
| Código `ligeirinho` | ✅ | ✅ | — |
| Teclado, mouse e toque | ✅ | ✅ | ✅ |
| Responsividade | ✅ | ✅ | não se aplica |
| Funcionamento offline | ✅ | auditoria PWA | não se aplica |

O traço indica que a proteção está em outra camada ou que a funcionalidade não existe naquela plataforma; não significa teste pendente.

## Dados e isolamento

- testes limpam o armazenamento local antes de cada cenário que depende de estado;
- aleatoriedade e relógio são injetados ou controlados nas regras que exigem determinismo;
- temporizadores simulados voltam automaticamente ao modo real no encerramento de cada teste;
- atalhos de batalha usados pela automação existem somente em desenvolvimento/build visual;
- o Playwright inicia um preview isolado e não depende de `npm run dev` aberto pelo usuário;
- testes E2E localizam elementos por papel e nome acessível, aproximando a automação do uso real.

## Ambientes cobertos

- Chrome e Firefox desktop;
- Chrome e Safari emulados em perfis móveis;
- Chrome real para as auditorias visual/estrutural e PWA;
- JVM local para regras Android;
- emulador ou aparelho Android para Room e componentes Compose.

A emulação de navegador móvel valida viewport, toque e características do navegador, mas não substitui uma rodada exploratória em dispositivos físicos.

## Critérios para merge

Antes do merge, a alteração deve atender aos controles aplicáveis:

1. lint e TypeScript sem erros;
2. testes Vitest aprovados e limites de cobertura respeitados;
3. build de produção aprovado;
4. jornadas Playwright críticas aprovadas nos perfis configurados;
5. auditorias visual/estrutural e offline aprovadas quando houver impacto de UI, asset ou PWA;
6. testes unitários Android aprovados quando houver impacto Kotlin;
7. testes instrumentados Android compilando e, quando houver emulador/aparelho disponível, executados;
8. nenhuma regressão crítica ou alta conhecida sem decisão registrada.

## Evidências atuais

### Web/PWA

- **104 testes** aprovados em 20 arquivos;
- **10 execuções E2E aprovadas** em quatro perfis de navegador, com dois skips intencionais da jornada longa fora do Chromium;
- **26 cenários estruturais e interativos** no Chrome;
- cobertura V8: **88,85% statements**, **80,59% branches**, **92,94% funções** e **91,71% linhas**;
- limites obrigatórios: 85% statements, 75% branches, 85% funções e 88% linhas.

Relatórios locais:

- `JogoWeb/coverage/index.html` — cobertura Vitest/V8;
- `JogoWeb/.artifacts/playwright/report/index.html` — jornadas E2E;
- `JogoWeb/.artifacts/visual/` — evidências estruturais/visuais;
- `JogoWeb/.artifacts/pwa/` — auditoria offline.

### Android

- **17 testes unitários locais** aprovados para regras de batalha e esconderijo;
- **10 testes instrumentados implementados** para Room e componentes Compose;
- classes de regras extraídas com 100% de linhas e decisões exercitadas;
- a cobertura global Android ainda é baixa porque o relatório inclui telas e infraestrutura não exercitadas pelos testes locais;
- a execução instrumentada completa exige emulador ou aparelho e ainda não deve ser apresentada como aprovada sem essa evidência.

Relatórios locais:

- `app/build/reports/tests/testDebugUnitTest/index.html` — testes JUnit;
- `app/build/reports/coverage/test/debug/index.html` — cobertura JaCoCo;
- `app/build/reports/androidTests/connected/` — instrumentados após execução em dispositivo.

## Comandos de validação

```powershell
# Web/PWA
cd JogoWeb
npm ci
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
npm run visual:check
npm run pwa:check

# Android, a partir da raiz
cd ..
.\gradlew.bat :app:testDebugUnitTest
.\gradlew.bat :app:createDebugUnitTestCoverageReport
.\gradlew.bat :app:assembleDebugAndroidTest
# Com emulador ou aparelho conectado:
.\gradlew.bat :app:connectedDebugAndroidTest
```

## Limitações e próximos passos

- executar os instrumentados Android em CI com emulador;
- ampliar a cobertura Android para ViewModels e fluxos de navegação;
- adicionar regressão visual por comparação de baseline se a interface passar a mudar com frequência;
- executar uma matriz menor em aparelhos físicos antes da publicação;
- revisar periodicamente skips, tempos, cobertura e cenários conforme novos finais e códigos forem adicionados.

## Leitura complementar

- [Evidências de qualidade e funcionalidades](./EVIDENCIAS_QA.md)
- [Testes E2E Web](./JogoWeb/TESTES_E2E.md)
- [Testes Android](./TESTES_ANDROID.md)
- [Guia da versão Web](./JogoWeb/README.md)
