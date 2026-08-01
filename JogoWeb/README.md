# Sobreviva à Noite — Web

Portabilização integral do jogo Android atualizado (`origin/master` em `437340d`) para navegador, feita com React, TypeScript, Vite e CSS. O jogo funciona em celular, tablet e desktop, pode ser instalado como PWA e persiste dados localmente sem backend.

## Estado do projeto

Concluído e validado:

- abertura e lore completas;
- modo esconder com seis locais reposicionados pela referência visual, IA, probabilidades, timers e sons;
- resultado do esconderijo com reinício ou retorno ao menu;
- modo batalha com dano, esquiva por setas/teclado, ataque por botão/Espaço/mouse, parry, combo, HUD e resultados;
- vitória atualizada com bloqueio imediato, final normal com Rat Dance e final alternativo do Pidão abaixo de 40% de vida;
- recorde de combo persistido entre sessões;
- histórico de partidas com estatísticas dos dois modos e detalhes de batalha;
- assets Android sincronizados, com a imagem da lore corrigida e o GIF não utilizado do Fortnite removido;
- layout vertical responsivo, com a arte preenchendo e escurecendo as laterais da abertura;
- PWA e funcionamento offline após o cache dos modos;
- 80 testes aprovados em 17 arquivos;
- lint, TypeScript estrito, build, verificação visual e verificação offline aprovados.

A lógica do aplicativo Android fora de `JogoWeb` não foi modificada pela migração. A imagem `lore_fogueira.jpg` corrigida pelo usuário foi sincronizada entre Android e Web, e o GIF não utilizado do Fortnite foi removido das duas versões.

## Execução rápida

Requisito: Node.js `^20.19.0` ou `>=22.12.0`.

```bash
npm install
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`.

Para gerar a versão publicável:

```bash
npm run build
npm run preview
```

Os arquivos finais ficam em `dist/` e podem ser hospedados como site estático.

## Scripts

| Comando | Finalidade |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Tipagem + build Vite + PWA |
| `npm run preview` | Preview local do `dist` |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript estrito |
| `npm run test` | Vitest em modo interativo |
| `npm run test:run` | Suíte completa uma vez |
| `npm run assets:optimize` | Recria WebPs lossless e ícones PWA |
| `npm run visual:check` | Build + screenshots/asserts em 14 casos visuais/interativos, incluindo extremos de zoom |
| `npm run pwa:check` | Build + teste real de persistência e funcionamento offline de telas/áudio |

### Teste manual rápido do final Pidão

Com o servidor de desenvolvimento aberto por `npm run dev`, acesse:

```text
http://localhost:5173/?battleTest=pidao#/battle
```

Esse modo de teste deixa o sobrevivente com 35 de vida e o monstro com 1 de vida. Dê um único golpe, aguarde a queda do monstro, clique em **Prosseguir** e depois em **Continuar** para conferir toda a sequência. O atalho existe somente durante o desenvolvimento e não altera a versão de produção.

## Publicação

O projeto usa `base: './'`, portanto `dist/` funciona tanto na raiz de um domínio quanto numa subpasta. Exemplos de destinos:

- GitHub Pages;
- Cloudflare Pages;
- Vercel;
- Netlify;
- Apache/Nginx;
- hospedagem de arquivos estáticos.

Publique o conteúdo de `dist/`. Para instalar a PWA e ativar service worker fora de desenvolvimento, a hospedagem deve usar HTTPS, exceto em `localhost`.

## Assets

- `public/assets/images`: imagens/XML sincronizados com o Android, incluindo a lore corrigida.
- `public/assets/audio`: os 21 MP3 da versão Android atualizada e o áudio do final Pidão.
- `public/assets/gif`: somente `rat_dance.gif`, usado na vitória da batalha.
- `public/assets/android-icons`: mipmaps/ícones Android preservados.
- `public/assets/optimized`: 36 WebPs lossless usados pelo jogo.
- `public/icons`: ícones 192/512 da PWA.

Os WebPs reduziram 28,3 MiB de PNGs para 16,4 MiB. A conversão é automaticamente recusada se alfa ou qualquer pixel visível mudar.

## Dados locais

O recorde de combo e o histórico são armazenados no `localStorage` do navegador, equivalendo ao DataStore e ao Room do Android para este volume de dados. Eles permanecem após fechar/reabrir o site e a interface é notificada imediatamente após cada resultado. Os dados pertencem à origem usada (protocolo, domínio e porta); por isso o servidor de desenvolvimento usa sempre `localhost:5173`. Limpar os dados do site também limpa o histórico.

## Documentação

- [Como executar](COMO_EXECUTAR.md)
- [Arquitetura](ARQUITETURA.md)
- [Análise Android](ANALISE_ANDROID.md)
- [Plano de migração](PLANO_MIGRACAO.md)
- [Histórico da migração](MIGRACAO.md)
- [Inventário de assets](INVENTARIO_ASSETS.md)
- [Matriz de equivalência](MATRIZ_EQUIVALENCIA.md)
- [Status](STATUS.md)
- [Regras de desenvolvimento](AGENTS.md)

## Observação sobre direitos

Alguns arquivos parecem fazer referência a personagens, músicas ou danças de terceiros. Antes de divulgar comercialmente ou monetizar o jogo, confirme as licenças desses materiais. Esta portabilização preserva os arquivos fornecidos, mas não concede direitos sobre eles.
