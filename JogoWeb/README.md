<div align="center">

<img src="./public/assets/optimized/tela_inicio.webp" alt="Sobreviva à Noite — Web" width="240" />

# Sobreviva à Noite — Web/PWA

**A versão para navegador do jogo de suspense e sobrevivência.**

![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-104%20testes-6E9F18?logo=vitest&logoColor=white)
![Playwright](https://img.shields.io/badge/Playwright-10%20E2E-2EAD33?logo=playwright&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-offline-5A0FC8?logo=pwa&logoColor=white)

[Voltar ao projeto](../README.md) • [Executar](#execução-rápida) • [Testar](#testes) • [Publicar](#publicação) • [Documentação](#documentação)

</div>

---

## Sobre esta versão

Portabilização do aplicativo Android para React, TypeScript, Vite e CSS. O jogo funciona em celular, tablet e desktop, pode ser instalado como PWA e mantém progresso local sem precisar de conta ou backend.

A implementação Web preserva as regras, imagens, sons e identidade do jogo original, com adaptações autorizadas para teclado, mouse, acessibilidade e diferentes tamanhos de tela.

## Estado atual

| Área | Implementação |
|---|---|
| Menu e lore | Abertura, narrativa, escolhas e retorno correto |
| Esconde-Esconde | Seis locais, IA, sorteios, timers, sons e resultados |
| Batalha | Ataque, esquiva, parry, combo, HUD, tutorial e Rat Dance |
| Finais | Pidão, Venceu na Raça e Sopa de Lobo |
| Progressão | Código `ligeirinho`, recorde e galeria de finais |
| Persistência | Histórico e progresso no `localStorage` |
| PWA | Instalação, atualização de assets e fallback offline |
| Publicidade | Espaços laterais reservados no desktop; nenhum provedor integrado ainda |
| Qualidade | 104 testes Vitest, 10 execuções E2E, cobertura mínima, 26 cenários visuais e CI |

### Finais da batalha

- **A Maldição do Pidão:** vitória com menos de 40% da vida.
- **Sopa de Lobo:** nenhum golpe recebido e pelo menos dois parries.
- **Venceu na Raça:** demais vitórias.

Todos os finais preservam primeiro a sequência normal: queda do monstro, pose de vitória, Rat Dance e tela **Você venceu**. A história começa somente quando o jogador escolhe **Prosseguir**.

## Execução rápida

Requisitos:

- Node.js `^20.19.0` ou `>=22.12.0`;
- npm compatível com a versão instalada do Node.js.

```bash
cd JogoWeb
npm ci
npm run dev
```

Abra o endereço informado pelo Vite, normalmente:

```text
http://localhost:5173
```

### Build de produção

```bash
npm run build
npm run preview
```

O Vite gera em `dist/` a versão otimizada que será enviada para a hospedagem. Essa pasta é recriada a cada build e não deve ser editada manualmente.

## Controles da batalha

| Ação | Mouse/toque | Teclado |
|---|---|---|
| Esquivar para a esquerda | Botão `←` | `A` ou `←` |
| Atacar | Punho ou clique em área livre | `Espaço` |
| Esquivar para a direita | Botão `→` | `D` ou `→` |

O tutorial aparece automaticamente na primeira batalha e pode ser reaberto pelo botão **?**.

## Testes

### Comandos disponíveis

| Comando | Finalidade |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | TypeScript, build Vite e PWA |
| `npm run preview` | Visualização local do conteúdo de `dist/` |
| `npm run lint` | ESLint em todo o projeto |
| `npm run typecheck` | TypeScript em modo estrito |
| `npm run test` | Vitest em modo interativo |
| `npm run test:run` | Suíte completa executada uma vez |
| `npm run test:coverage` | Testes com relatório e limites mínimos |
| `npm run test:e2e` | Jornadas críticas em quatro perfis de navegador |
| `npm run test:e2e:chromium` | Jornadas E2E somente no Chrome desktop |
| `npm run test:e2e:ui` | Interface interativa do Playwright |
| `npm run test:e2e:debug` | Inspector do Playwright passo a passo |
| `npm run test:e2e:report` | Abre o último relatório HTML E2E |
| `npm run visual:check` | 26 cenários reais no Chrome |
| `npm run pwa:check` | Persistência, telas e áudios offline |
| `npm run assets:optimize` | Recria e valida imagens WebP lossless |

### Atalhos para testar os finais

Com `npm run dev` aberto, use uma das URLs:

```text
http://localhost:5173/?battleTest=pidao#/battle
http://localhost:5173/?battleTest=raca#/battle
http://localhost:5173/?battleTest=perfect#/battle
```

O monstro começa com 1 de vida. Dê um golpe, aguarde a sequência completa e escolha **Prosseguir**. Esses atalhos existem somente no ambiente de desenvolvimento e não são habilitados no build normal.

### Qualidade atual

- 104 testes aprovados em 20 arquivos;
- 10 execuções E2E aprovadas em Chrome e Firefox desktop, Chrome e Safari móveis emulados;
- cobertura atual de 88,85% de statements, 80,59% de branches, 92,94% de funções e 91,71% de linhas;
- cobertura mínima de 85% de statements, 75% de branches, 85% de funções e 88% de linhas;
- 26 cenários visuais cobrindo telas, tutorial, galeria, histórico, extremos de escala e os três finais;
- abertura, esconderijo, batalha, histórico, finais, imagens e áudios verificados offline;
- lint, TypeScript estrito, build e auditoria de dependências aprovados;
- GitHub Actions executando as verificações em pushes e pull requests.

A cobertura é produzida pelo `@vitest/coverage-v8`, configurado em `vite.config.ts`, e não pelo JaCoCo. Execute `npm run test:coverage` para gerar o resumo no terminal e os relatórios detalhados em `coverage/`. O relatório HTML pode ser aberto diretamente no navegador.

## Arquitetura resumida

```text
JogoWeb/
├── e2e/                 # Jornadas críticas com Playwright
├── public/
│   ├── assets/           # Imagens, áudios, GIF e derivados WebP
│   └── icons/            # Ícones da PWA
├── scripts/              # Otimização e verificações em Chrome
├── src/
│   ├── app/              # Navegação e composição principal
│   ├── battle/           # Regras e ciclo de vida da batalha
│   ├── hide/             # Regras e ciclo de vida do esconderijo
│   ├── components/       # Componentes compartilhados
│   ├── persistence/      # Histórico, recorde, códigos e finais
│   ├── screens/          # Telas e histórias dos finais
│   └── services/         # Áudio e caminhos de assets
└── vite.config.ts        # Build, testes, cobertura e PWA
```

As regras ficam separadas da interface e os efeitos assíncronos podem ser cancelados ao reiniciar ou sair da tela. A aleatoriedade relevante é injetável para manter os testes determinísticos.

## Assets e carregamento

- 40 imagens WebP lossless usadas pelo jogo;
- redução de aproximadamente 36,9 MiB para 20,9 MiB sem alteração de pixels visíveis;
- 24 MP3, incluindo a trilha contínua da batalha e os áudios próprios dos finais;
- `rat_dance.gif` como único GIF de dança da vitória;
- imagens pesadas dos finais carregadas somente depois que a batalha é vencida.

Os arquivos originais permanecem em `public/assets/images`; os derivados otimizados ficam em `public/assets/optimized`.

## Dados locais

O navegador armazena no `localStorage`:

- recorde de combo;
- histórico de partidas;
- código desbloqueado e ativação do `ligeirinho`;
- finais obtidos e níveis de dica;
- confirmação de que o tutorial já foi visto.

Esses dados pertencem ao protocolo, domínio e porta atuais. Limpar os dados do site também apaga esse progresso.

## Publicação

O projeto usa caminhos relativos e navegação por hash. Por isso o conteúdo de `dist/` funciona tanto na raiz de um domínio quanto em uma subpasta, sem exigir regras especiais de redirecionamento.

Configuração típica de uma hospedagem:

| Campo | Valor |
|---|---|
| Diretório do projeto | `JogoWeb` |
| Comando de instalação | `npm ci` |
| Comando de build | `npm run build` |
| Diretório de saída | `dist` |

Para instalar a PWA e ativar o service worker fora de `localhost`, a hospedagem precisa oferecer HTTPS.

## Documentação

- [Estratégia de qualidade do projeto](../ESTRATEGIA_QA.md)
- [Produto, mecânicas e capturas](../PRODUTO.md)
- [Qualidade, testes e evidências](../QUALIDADE.md)
- [Como executar e publicar](COMO_EXECUTAR.md)
- [Testes E2E com Playwright](TESTES_E2E.md)
- [Arquitetura](ARQUITETURA.md)
- [Análise do aplicativo Android](ANALISE_ANDROID.md)
- [Plano de migração](PLANO_MIGRACAO.md)
- [Histórico da migração](MIGRACAO.md)
- [Inventário de assets](INVENTARIO_ASSETS.md)
- [Matriz de equivalência](MATRIZ_EQUIVALENCIA.md)
- [Status atual](STATUS.md)
- [Regras de desenvolvimento](AGENTS.md)
