# Plano de migração Android → Web

## Escopo

Portar integralmente o estado atual de `Sobreviva à Noite` para React, TypeScript, Vite e CSS, mantendo o Android intacto. O produto Web será estático, responsivo e instalável como PWA.

## Arquitetura escolhida

- React para composição das telas.
- TypeScript estrito para modelar estados e eventos.
- Vite para desenvolvimento, build e code splitting.
- CSS Modules por tela/componente e CSS global apenas para reset, tokens e shell.
- Hooks com reducers locais para os motores; não haverá dependência de estado global externa.
- Context API somente para áudio, que é compartilhado por todas as telas.
- HTML Audio API com um pool de instâncias para preservar sobreposição.
- React Router não é necessário: o app possui três destinos e uma pilha simples pode reproduzir `NavController` com menos complexidade.
- Vitest e Testing Library para regras e componentes.
- PWA por `vite-plugin-pwa` ou implementação equivalente validada na fase de otimização.

## Estrutura planejada

```text
JogoWeb/
├─ public/
│  └─ assets/
│     ├─ audio/
│     ├─ gif/
│     └─ images/
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  └─ navigation.ts
│  ├─ battle/
│  │  ├─ battleConstants.ts
│  │  ├─ battleEngine.ts
│  │  ├─ battleTypes.ts
│  │  └─ useBattleGame.ts
│  ├─ hide/
│  │  ├─ hideConstants.ts
│  │  ├─ hideEngine.ts
│  │  ├─ hideTypes.ts
│  │  └─ useHideGame.ts
│  ├─ components/
│  │  ├─ GameFrame/
│  │  ├─ HpBar/
│  │  └─ ResultOverlay/
│  ├─ contexts/
│  │  └─ AudioContext.tsx
│  ├─ screens/
│  │  ├─ BattleScreen/
│  │  ├─ HideScreen/
│  │  └─ MenuScreen/
│  ├─ services/
│  │  ├─ audioCatalog.ts
│  │  └─ AudioService.ts
│  ├─ styles/
│  │  ├─ globals.css
│  │  └─ tokens.css
│  ├─ test/
│  ├─ types/
│  └─ utils/
├─ AGENTS.md
├─ ANALISE_ANDROID.md
├─ ARQUITETURA.md
├─ COMO_EXECUTAR.md
├─ INVENTARIO_ASSETS.md
├─ MIGRACAO.md
├─ PLANO_MIGRACAO.md
├─ README.md
└─ STATUS.md
```

A estrutura pode ser refinada sem misturar responsabilidades. Toda alteração arquitetural deverá ser refletida neste documento e em `AGENTS.md`.

## Módulos e ordem obrigatória

### 1. Fundação e engine

- Tipos comuns.
- Cancelamento seguro de timers.
- Randomização injetável/testável.
- Pilha de navegação simples.
- Testes de utilitários.

### 2. Sistema de estados

- Reducers e contratos de ação.
- Estado imutável.
- Ciclo de vida e cancelamento no unmount.
- Testes de transição.

### 3. Áudio

- Catálogo tipado.
- Preload progressivo.
- Até dez vozes simultâneas por equivalência ao `SoundPool` atualizado.
- Desbloqueio no primeiro gesto.
- Falha de áudio não bloqueia o jogo.

### 4. Menu e lore

- Abertura, fades, lore integral e imagens.
- Voltar da lore para abertura.
- Navegação para os dois modos.
- Testes de fluxo.

### 5. Modo esconder

- Contador de 10 segundos.
- Coordenadas, mapa, assassino aleatório e flip.
- Percurso de quatro locais, regra de substituição e 50% de encontro.
- Timers e eventos sonoros idênticos.
- Sangue, resultado e reinício.
- Testes determinísticos do percurso e das probabilidades.

### 6. Modo batalha e IA

- Loop da IA e direções aleatórias.
- Janelas `EARLY` e `PERFECT`.
- Dano, parry, stun e recovery.
- Ataque, combo e aceleração.
- Sequência de vitória e derrota.
- Testes com timers falsos.

### 7. HUD e resultados

- HP bars com limiares e animação.
- Contador e cores do combo.
- Controles touch/click.
- Overlays equivalentes.

### 8. Responsividade

- Palco vertical e laterais no desktop.
- Safe area e `dvh` no celular.
- Escala para tablets e telas baixas.
- Testes em larguras 360, 390, 768, 1024 e 1440 px.

### 9. Otimização e PWA

- Lazy loading de cada tela.
- Preload seletivo por modo.
- Cache dos assets.
- Manifest, ícones e service worker.
- Auditoria de build e tamanho.

### 10. Comparação final

- Matriz Android/Web para cada regra.
- Testes completos.
- Build de produção.
- Inspeção visual em desktop e viewport móvel.

## Dependências

Produção:

- `react` e `react-dom`;
- runtime de PWA apenas se necessário pelo plugin escolhido.

Desenvolvimento:

- `typescript`;
- `vite` e plugin React;
- `vitest`;
- `@testing-library/react`, `@testing-library/jest-dom` e `jsdom`;
- ESLint com regras TypeScript/React;
- plugin PWA.

Não serão adicionados Zustand, React Router, biblioteca de animação ou UI kit sem necessidade demonstrada.

## Arquivos reutilizados

- Todos os drawables rasterizados de `app/src/main/res/drawable`.
- Todos os MP3 de `app/src/main/res/raw`.
- Ícones mipmap necessários para PWA, copiados.
- Textos e constantes dos fontes Kotlin.

Os arquivos serão copiados para `JogoWeb/public`; os originais permanecerão intactos.

## Arquivos novos

- Projeto Vite/React/TypeScript completo em `JogoWeb`.
- Engines tipadas dos dois modos.
- Componentes e estilos Web.
- Testes unitários e de componentes.
- Manifest e service worker/PWA.
- Documentação operacional e de equivalência.

## Cronograma de execução

| Etapa | Entrega | Condição de saída |
|---|---|---|
| Fase 1 | Análise e inventário | Todas as regras documentadas |
| Fase 2 | Plano e governança | Arquitetura/checklist aprovados pelo próprio baseline |
| Fase 3 | Scaffold e assets | Typecheck/build mínimo funcionando |
| Fase 4A | Menu e áudio | Fluxo abertura/lore testado |
| Fase 4B | Esconderijo | Regras/timers e UI testados |
| Fase 4C | Batalha | IA/combate/HUD testados |
| Fase 5 | Suíte completa | Testes, lint, typecheck e build verdes |
| Fase 6 | PWA/performance | Build instalável e carregamento dividido |
| Fase 7 | Equivalência | Matriz sem divergência funcional conhecida |
| Fase 8 | Documentação final | Execução e manutenção documentadas |

## Checklist geral

- [x] Analisar fontes Android.
- [x] Inventariar assets e áudios.
- [x] Documentar timers, probabilidades e constantes.
- [x] Definir arquitetura Web.
- [x] Criar scaffold Vite/React/TypeScript.
- [x] Copiar todos os assets.
- [x] Implementar serviço de áudio.
- [x] Implementar abertura e lore.
- [x] Implementar modo esconder.
- [x] Implementar modo batalha.
- [x] Implementar HUD e resultados.
- [x] Implementar responsividade.
- [x] Criar testes de regras e componentes.
- [x] Ativar lazy loading e PWA.
- [x] Comparar Android/Web.
- [x] Finalizar documentação.
- [x] Confirmar que o Android continua intacto.
