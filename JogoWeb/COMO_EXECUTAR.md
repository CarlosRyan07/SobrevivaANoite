# Como executar e publicar

## Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0`.
- npm incluído no Node.
- Chrome instalado apenas para `visual:check` e `pwa:check`.

O desenvolvimento e o build do jogo não exigem Android Studio, Java, Kotlin ou servidor de backend.

## Primeira instalação

No terminal, entre em `JogoWeb` a partir da raiz do repositório:

```powershell
cd .\JogoWeb
npm install
```

`package-lock.json` fixa as versões resolvidas. Em CI ou instalação reproduzível, prefira:

```bash
npm ci
```

## Desenvolvimento

```bash
npm run dev
```

O Vite exibe a URL local. Alterações em TSX/CSS atualizam automaticamente. O endereço padrão é fixo em `http://localhost:5173` para que o histórico e o recorde permaneçam na mesma origem entre execuções.

Rotas úteis:

- `/` — abertura;
- `/#/lore` — lore;
- `/#/hide` — esconderijo;
- `/#/battle` — batalha.
- `/#/history` — histórico persistido.

## Testes e qualidade

Portão rápido:

```bash
npm run lint
npm run typecheck
npm run test:run
npm run test:coverage
npm run build
```

Verificação visual:

```bash
npm run visual:check
```

Ela gera arquivos ignorados pelo Git em `.artifacts/visual` e valida:

- 390×844: abertura, lore, esconderijo, batalha e histórico;
- 546×866: abertura com preenchimento lateral;
- 1440×900: abertura e palco central;
- equivalentes desktop de zoom em 67%, 80%, 90%, 100%, 110% e 150%;
- largura, altura, centralização e proporção fixa `480:850` do esconderijo, além do quadro rolável da batalha;
- psicopata totalmente visível fora da casa durante a busca;
- overflow horizontal;
- imagens quebradas;
- erros de página e rede.

O caminho padrão do Chrome é o do Windows. Em outro sistema, defina `CHROME_PATH`:

```bash
CHROME_PATH=/caminho/para/chrome npm run visual:check
```

Verificação PWA/offline:

```bash
npm run pwa:check
```

O teste instala o service worker em Chrome headless, confirma o histórico após recarregar, visita os modos online, desliga a rede e valida abertura, esconderijo, batalha, histórico, imagens e os áudios — incluindo Rat Dance.

## Recriar assets otimizados

```bash
npm run assets:optimize
```

O script:

1. lê cada PNG copiado do Android com tolerância a metadados antigos;
2. cria WebP lossless;
3. decodifica origem e destino;
4. exige dimensão/alfa iguais e RGB igual em todo pixel visível;
5. gera ícones PWA 192/512;
6. grava o relatório ignorado em `.artifacts/optimization-report.json`.

## Build de produção

```bash
npm run build
```

Saída principal:

- `dist/index.html`;
- chunks JS/CSS separados por tela;
- `dist/manifest.webmanifest`;
- `dist/sw.js` e Workbox;
- todos os assets públicos.

Teste local do build:

```bash
npm run preview
```

Não abra `dist/index.html` diretamente por `file://`; use `preview` ou um servidor HTTP para que módulos, áudio e PWA funcionem corretamente.

## Hospedagem estática

Envie o conteúdo de `dist/` para a hospedagem escolhida. Não é necessário configurar rotas no servidor porque a navegação usa hash.

Requisitos:

- servir `index.html` e assets;
- HTTPS para PWA/service worker em produção;
- tipos MIME usuais para JS, WebP, GIF e MP3;
- não aplicar cache imutável excessivo ao `sw.js`.

## Instalação como aplicativo

Em navegador compatível:

1. abra o site por HTTPS;
2. use `Instalar aplicativo`/`Adicionar à tela inicial`;
3. o jogo abrirá em modo standalone;
4. depois de visitar os modos online, seus assets ficam em cache sob demanda.

## Solução de problemas

### Sem áudio

Clique em `Iniciar Jogo`. Navegadores bloqueiam áudio antes da primeira interação. Confirme também volume e permissão do site.

### Service worker antigo

O registro usa `autoUpdate`. Se necessário durante desenvolvimento, feche abas antigas e limpe `Application > Storage` nas ferramentas do navegador.

### `visual:check` não encontra Chrome

Defina `CHROME_PATH` com o executável correto.

### Porta ocupada

`dev` usa intencionalmente a porta fixa `5173`, pois o armazenamento do navegador é separado por origem/porta. Se ela estiver ocupada, encerre o processo anterior antes de iniciar o jogo novamente. Os verificadores automatizados usam portas próprias de preview.
