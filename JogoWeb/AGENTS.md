# AGENTS.md — JogoWeb

## Visão geral

`JogoWeb` é a portabilização fiel do aplicativo Android `Sobreviva à Noite` para React, TypeScript, Vite e CSS. Não é um redesign e não deve criar mecânicas novas.

O projeto Android, localizado fora desta pasta, é somente leitura. Nenhum trabalho Web pode editar, mover, excluir ou formatar arquivos do Android.

## Política de modelo e esforço de raciocínio

Antes de iniciar uma tarefa que não seja trivial, avaliar o menor perfil capaz de concluí-la com segurança. Quando a tarefa não combinar com o modelo ou o nível de raciocínio da sessão, avisar o usuário no início da resposta e recomendar a troca antes de agir.

- **Modelo leve/mais rápido** (por exemplo, **Luna**, quando estiver disponível): correções pontuais, ajustes de texto ou CSS, tarefa localizada em um arquivo, tipagem óbvia, documentação e comandos de verificação simples. Usar raciocínio **baixo**.
- **Terra**: features novas de porte médio, refatorações locais, integração de sistemas já existentes, testes de componentes e correções que atravessam alguns arquivos. Usar raciocínio **médio**; elevar para **alto** se houver concorrência de timers, áudio ou responsividade complexa.
- **Sol**: arquitetura, bugs difíceis e intermitentes, revisão grande, migrações, alterações no estado central do jogo, persistência, regras de batalha/esconderijo ou estratégia de qualidade ampla. Usar raciocínio **alto**; reservar **xhigh/max/ultra** para investigações realmente complexas, não para tarefas rotineiras.

Não presumir que um nome de modelo esteja disponível: recomendar e usar somente modelos expostos pela superfície atual. Em caso de dúvida, preferir o modelo mais econômico que preserve a segurança da mudança e aumentar o esforço apenas se a investigação exigir.

## Fonte de verdade

Em caso de dúvida, consultar nesta ordem:

1. Ajustes Web explicitamente aprovados pelo usuário e registrados em `MIGRACAO.md`.
2. Fonte Kotlin atual em `../app/src/main/java`.
3. Assets atuais em `../app/src/main/res`.
4. `ANALISE_ANDROID.md`.
5. `PLANO_MIGRACAO.md`.
6. Testes de equivalência Web.

Uma diferença entre documentação e Kotlin deve ser resolvida em favor do Kotlin e registrada em `MIGRACAO.md`.

## Arquitetura

- `src/app`: shell e navegação.
- `src/battle`: tipos, constantes, reducer/engine e hook do combate.
- `src/hide`: tipos, constantes, reducer/engine e hook do esconderijo.
- `src/components`: UI compartilhada sem regras de jogo.
- `src/contexts`: dependências transversais, inicialmente áudio.
- `src/hooks`: animações e hooks compartilhados.
- `src/screens`: composição visual por tela.
- `src/services`: integrações com APIs do navegador.
- `src/persistence`: contratos e armazenamento local de recorde/partidas.
- `src/history`: regras puras de resumo e apresentação do histórico.
- `src/utils`: utilitários puros e genéricos.
- `public/assets`: cópias dos assets Android.
- `public/assets/optimized`: derivados WebP lossless validados.
- `e2e`: jornadas críticas executadas em navegadores reais pelo Playwright.
- `scripts`: otimização e verificações reais em Chrome.

## Convenções

- TypeScript em modo estrito.
- Componentes e tipos: `PascalCase`.
- Funções, variáveis e hooks: `camelCase`.
- Constantes compartilhadas: `UPPER_SNAKE_CASE`.
- Arquivos de componentes: `PascalCase.tsx`.
- Engines, serviços e utilitários: `camelCase.ts`.
- CSS Modules ao lado da tela/componente.
- Testes ao lado do módulo como `*.test.ts` ou `*.test.tsx`.
- Testes de jornada em `e2e/*.spec.ts`, usando locators acessíveis e estado isolado.
- Uniões discriminadas para estados e eventos; evitar strings abertas.
- Nunca usar `any`; usar `unknown` e narrowing quando necessário.
- Timers devem possuir cancelamento no unmount/restart.
- Aleatoriedade relevante deve ser injetável para permitir testes determinísticos.
- Não duplicar constantes Kotlin em componentes; centralizá-las no módulo correspondente.

## Regras de fidelidade

- Não alterar HP, dano, tempos, probabilidades ou coordenadas por conveniência.
- Controles Web autorizados: esquiva com `A`/seta esquerda e `D`/seta direita; ataque com `Espaço` ou clique esquerdo em área livre da batalha. Não adicionar outras teclas, dificuldade, configuração, placar ou mecânica sem autorização futura.
- Manter os textos exatamente como no Android.
- Manter sobreposição de sons e limite atual de dez vozes.
- Manter o sorteio de imagens e direções.
- Preservar inclusive comportamentos peculiares documentados no baseline.
- Adaptações responsivas podem apenas reposicionar/escalar; não podem mudar regras.

## Estado e efeitos

- Regras puras ficam em engine/reducer, não no JSX.
- Hooks orquestram timers, áudio e ciclo de vida.
- Componentes recebem estado e callbacks tipados.
- Um restart deve cancelar toda execução anterior antes de criar novos timers.
- Nenhum efeito assíncrono pode atualizar estado depois do unmount.

## Acessibilidade sem alteração de mecânica

- Imagens funcionais precisam de `alt`.
- Botões precisam de nomes acessíveis equivalentes ao texto Android.
- Foco visível deve existir.
- `prefers-reduced-motion` pode reduzir transições decorativas, mas não timers do jogo.

## Checklist obrigatório por módulo

- [ ] Fonte Kotlin correspondente relida antes da implementação.
- [ ] Tipos e constantes portados.
- [ ] Regras portadas sem simplificação.
- [ ] Timers e cancelamentos cobertos.
- [ ] Eventos de áudio mapeados.
- [ ] UI responsiva implementada.
- [ ] Testes unitários criados.
- [ ] Teste de componente criado quando houver UI.
- [ ] `npm run typecheck` aprovado.
- [ ] `npm test` aprovado.
- [ ] `STATUS.md` atualizado.

## Fluxo obrigatório de testes

Para cada módulo:

1. Executar os testes focados do módulo.
2. Corrigir falhas antes de avançar.
3. Executar `npm run typecheck`.
4. Ao integrar uma tela, executar a suíte completa.
5. Antes de concluir, executar:
   - `npm run lint`;
   - `npm run typecheck`;
   - `npm test -- --run`;
   - `npm run test:coverage`;
   - `npm run build`;
   - `npm run test:e2e`.
6. Executar `npm run visual:check` para alteração visual/responsiva.
7. Executar `npm run pwa:check` para alteração em assets/cache/PWA.
8. Inspecionar manualmente desktop e viewport móvel.
9. Confirmar por `git status` que nenhuma modificação Android foi produzida pela migração.

## Padrão de commits internos

Caso commits sejam solicitados futuramente, usar Conventional Commits com escopo:

- `feat(menu): ...`
- `feat(hide): ...`
- `feat(battle): ...`
- `feat(audio): ...`
- `test(hide): ...`
- `docs(migration): ...`
- `fix(battle): ...`

Cada commit deve representar um módulo coerente, incluir seus testes e não misturar alterações Android.

## Definição de pronto por módulo

Um módulo está pronto somente quando:

- comportamento corresponde ao Kotlin;
- todos os estados alcançáveis estão tipados;
- timers anteriores são cancelados em restart/unmount;
- sons correspondentes são disparados;
- layout funciona em celular, tablet e desktop;
- testes focados, globais e jornadas E2E críticas passam;
- documentação e `STATUS.md` foram atualizados;
- não existe pendência conhecida silenciosa.

## Manutenção deste arquivo

Atualizar este arquivo quando a estrutura, scripts, convenções ou definição de pronto mudarem. Não remover regras de fidelidade sem autorização explícita.
