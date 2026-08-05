# Evidências de qualidade e produto

Esta página reúne evidências reproduzíveis da branch `feat/web`. Os resultados foram registrados em **5 de agosto de 2026** e devem ser lidos junto com a [estratégia de qualidade](./ESTRATEGIA_QA.md).

As capturas funcionais foram escolhidas para apresentar o jogo sem revelar cenas, nomes ou artes dos finais.

## Resumo executivo

| Validação | Resultado registrado |
|---|---|
| Vitest | 104 testes aprovados em 20 arquivos |
| Cobertura Web/V8 | 88,85% statements, 80,59% branches, 92,94% funções e 91,71% linhas |
| Playwright | 10 execuções aprovadas em quatro perfis e 2 skips intencionais |
| Validação visual/estrutural | 26 cenários aprovados no Chrome |
| PWA | abertura, esconderijo, batalha, histórico, galeria e áudios aprovados offline |
| Android/JUnit | 17 testes aprovados, sem falhas ou ignorados |
| Android instrumentado | 10 testes implementados e compilados; execução em dispositivo ainda pendente |

## Web: testes e cobertura

### Vitest e cobertura V8

Comando reproduzível:

```powershell
cd JogoWeb
npm run test:coverage
```

Os 104 testes protegem regras, hooks, persistência, telas, acessibilidade, áudio e integrações. O relatório abaixo apresenta a cobertura por módulo; os limites obrigatórios do projeto são 85% de statements, 75% de branches, 85% de funções e 88% de linhas.

![Relatório HTML da cobertura Web gerada pelo Vitest e V8](./docs/evidencias/qa/web-vitest-cobertura.png)

### Jornadas E2E com Playwright

Comando reproduzível:

```powershell
cd JogoWeb
npm run test:e2e
```

A matriz percorre Chrome e Firefox no desktop, além de Chrome e Safari emulados em perfis móveis. As jornadas validam menu, lore, tutorial, controles, esconderijo, vitória, histórico, galeria e códigos.

![Relatório Playwright com dez execuções aprovadas e dois skips intencionais](./docs/evidencias/qa/web-playwright-matriz.png)

Os dois skips são intencionais: a jornada longa de vitória roda no Chromium desktop e mobile, enquanto Firefox e Safari recebem os smoke tests de menu/controles e esconderijo. Isso reduz tempo sem deixar os outros motores sem cobertura.

## Android: testes locais e cobertura das regras

### JUnit

Comando reproduzível:

```powershell
.\gradlew.bat :app:testDebugUnitTest
```

![Relatório JUnit com 17 testes Android, zero falhas e 100% de sucesso](./docs/evidencias/qa/android-junit-testes.png)

### JaCoCo

Comando reproduzível:

```powershell
.\gradlew.bat :app:createDebugUnitTestCoverageReport
```

A cobertura de 100% abaixo pertence especificamente às classes puras extraídas para as regras de batalha e esconderijo. Ela não representa a cobertura global do aplicativo Android, que ainda inclui ViewModels, telas e infraestrutura sem testes locais equivalentes.

| Regras da batalha | Regras do esconderijo |
|:---:|:---:|
| <img src="./docs/evidencias/qa/android-jacoco-battle-rules.png" alt="JaCoCo mostrando 100% das instruções e branches de BattleRules" width="680" /> | <img src="./docs/evidencias/qa/android-jacoco-hide-rules.png" alt="JaCoCo mostrando 100% das instruções e branches de HideRules" width="680" /> |

## Gates automatizados sem captura dedicada

| Gate | Comando | Resultado |
|---|---|:---:|
| ESLint | `npm run lint` | Aprovado |
| TypeScript estrito | `npm run typecheck` | Aprovado |
| Build de produção | `npm run build` | Aprovado |
| 26 cenários visuais/estruturais | `npm run visual:check` | Aprovado |
| PWA offline | `npm run pwa:check` | Aprovado |
| Compilação dos instrumentados Android | `.\gradlew.bat :app:assembleDebugAndroidTest` | Aprovado |

As auditorias visual e PWA permanecem como gates automatizados, mas não recebem imagens próprias porque uma captura da mensagem do terminal acrescentaria pouca informação.

## Funcionalidades sem spoilers

### Abertura responsiva

<div align="center">
  <img src="./docs/evidencias/funcionalidades/menu-inicial-desktop.png" alt="Menu inicial no desktop" width="690" />
  <img src="./docs/evidencias/funcionalidades/menu-inicial-mobile.png" alt="Menu inicial em tela móvel" width="245" />
</div>

### Modo batalha

![Modo batalha no desktop, com barras de vida e controles](./docs/evidencias/funcionalidades/batalha-desktop.png)

| Tutorial de controles | Modo Esconde-Esconde |
|:---:|:---:|
| <img src="./docs/evidencias/funcionalidades/tutorial-batalha.png" alt="Tutorial de controles da batalha" width="300" /> | <img src="./docs/evidencias/funcionalidades/esconde-esconde.png" alt="Busca do monstro no modo Esconde-Esconde" width="300" /> |

### Progressão sem revelar finais

| Galeria bloqueada | Códigos | Histórico vazio |
|:---:|:---:|:---:|
| <img src="./docs/evidencias/funcionalidades/galeria-finais-bloqueados.png" alt="Galeria com todos os finais bloqueados" width="250" /> | <img src="./docs/evidencias/funcionalidades/painel-codigos.png" alt="Painel de códigos sem nenhum código revelado" width="250" /> | <img src="./docs/evidencias/funcionalidades/historico-partidas.png" alt="Estado vazio do histórico de partidas" width="250" /> |

Nenhuma captura desta documentação mostra a conclusão narrativa ou a arte final das rotas desbloqueáveis.

## Limitações declaradas

- a emulação mobile do Playwright não substitui testes em dispositivos físicos;
- a validação visual atual verifica estrutura, overflow, imagens e estados, mas não compara pixels contra baselines;
- os 10 testes instrumentados Android ainda precisam ser executados em emulador ou aparelho antes de serem apresentados como aprovados;
- cobertura demonstra código exercitado, não ausência de defeitos.

## Documentação relacionada

- [Estratégia de qualidade](./ESTRATEGIA_QA.md)
- [Testes E2E com Playwright](./JogoWeb/TESTES_E2E.md)
- [Testes Android](./TESTES_ANDROID.md)
- [Guia da versão Web](./JogoWeb/README.md)
