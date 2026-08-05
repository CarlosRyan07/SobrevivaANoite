# Testes E2E com Playwright

## O que o Playwright valida

O Playwright abre a aplicação em navegadores reais e executa jornadas como um jogador. Ele complementa o Vitest: os testes unitários e de componente validam regras isoladas e produzem cobertura de código; os testes E2E validam que telas, navegação, controles e persistência funcionam juntos.

Os fluxos críticos atuais cobrem:

- abertura, menu, lore e tutorial da primeira batalha;
- ataque por espaço, clique/toque e esquiva pela tecla `A`;
- seleção estável de um esconderijo antes do contador;
- vitória, botão **Prosseguir** e final **Venceu na Raça**;
- gravação no histórico e desbloqueio na galeria de finais;
- descoberta, ativação e disponibilidade da opção de desativar o código `ligeirinho`;
- ausência de overflow horizontal;
- Chrome e Firefox no desktop, além de Chrome e Safari emulados no celular.

A jornada longa de vitória roda nos perfis Chromium de desktop e celular. Os outros navegadores executam os fluxos rápidos, evitando repetir uma sequência demorada sem perder a cobertura entre motores.

## Primeira instalação

Abra o PowerShell na pasta correta:

```powershell
cd C:\Users\Ryan\Desktop\SobrevivaANoite-Web\JogoWeb
npm install
npx playwright install chromium firefox webkit
```

Os navegadores são baixados somente na primeira instalação ou quando o Playwright solicitar uma versão nova.

Não é preciso executar `npm run dev` antes dos testes. O Playwright gera o build de teste e abre automaticamente um preview isolado na porta `4174`.

## Comandos principais

| Comando | Quando usar |
|---|---|
| `npm run test:e2e` | Executa toda a matriz em modo headless |
| `npm run test:e2e:chromium` | Retorno mais rápido somente no Chrome desktop |
| `npm run test:e2e:headed` | Mostra o Chrome enquanto os testes rodam |
| `npm run test:e2e:ui` | Abre a interface interativa, ideal para aprender |
| `npm run test:e2e:debug` | Abre o Inspector e permite avançar passo a passo |
| `npm run test:e2e:report` | Abre o último relatório HTML |

Exemplos de execução focada:

```powershell
# Somente um arquivo
npx playwright test e2e/hide-selection.spec.ts

# Somente testes cujo nome contenha uma expressão
npx playwright test -g "jogador escolhe"

# Somente o perfil de celular com Chrome
npx playwright test --project=mobile-chrome
```

## Melhor caminho para aprender

Comece com:

```powershell
npm run test:e2e:ui
```

Na janela do Playwright:

1. escolha um arquivo ou projeto na lateral;
2. clique no triângulo para executar;
3. selecione cada ação para ver a página naquele instante;
4. use o seletor de elementos para entender os locators;
5. abra console, rede e rastreamento quando houver uma falha.

Um teste básico segue este formato:

```ts
test('abre o jogo', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Iniciar Jogo' }).click()
  await expect(page).toHaveURL(/#\/lore$/)
})
```

- `page` representa uma aba isolada do navegador;
- `getByRole` encontra o elemento pelo nome acessível, da mesma forma que tecnologias assistivas;
- `click`, `press`, `fill` e `tap` simulam ações do jogador;
- `expect` aguarda automaticamente a condição, sem sleeps arbitrários.

Cada teste começa com armazenamento local limpo para não depender de uma execução anterior. O fluxo de vitória usa `battleTest=raca`, disponível apenas no build de desenvolvimento/validação, para deixar o inimigo com 1 de vida e desativar a IA inimiga somente nesse cenário determinístico.

## Relatórios e falhas

Os arquivos ficam em `.artifacts/playwright/`, ignorados pelo Git:

- relatório HTML;
- captura de tela em caso de falha;
- vídeo retido em caso de falha;
- trace na primeira repetição do CI.

Depois de uma execução, abra o relatório com:

```powershell
npm run test:e2e:report
```

No GitHub Actions, a etapa **Critical E2E journeys** executa a mesma matriz. O artefato `web-playwright-report` fica disponível para download na página da execução.

## Observação sobre celular

Os projetos `mobile-chrome` e `mobile-safari` emulam viewport, toque e características de navegadores móveis. Eles validam a versão Web responsiva, mas não substituem testes instrumentados do aplicativo Android nativo.
