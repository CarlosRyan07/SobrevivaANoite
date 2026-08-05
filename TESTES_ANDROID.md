# Testes Android

A suíte Android está dividida por responsabilidade para que falhas sejam fáceis de localizar.

## Organização

| Camada | Local | O que valida | Precisa de dispositivo? |
|---|---|---|:---:|
| Regras da batalha | `app/src/test/.../game/BattleRulesTest.kt` | parry, esquiva, dano, vida e velocidade do combo | Não |
| Regras do esconde-esconde | `app/src/test/.../game/HideRulesTest.kt` | esconderijos, sobreviventes, reposição da rota e tempo esgotado | Não |
| Persistência Room | `app/src/androidTest/.../data/MatchHistoryDaoTest.kt` | ordenação do histórico e contagem por modo/resultado | Sim |
| Interface de batalha | `app/src/androidTest/.../ui/screens/BattleComponentsTest.kt` | botões, barra de vida e ações nas telas finais | Sim |
| Interface do esconde-esconde | `app/src/androidTest/.../ui/screens/HideComponentsTest.kt` | contador, esconderijo e resultados | Sim |

Os testes em `src/test` são testes unitários locais. Os testes em `src/androidTest` usam componentes reais do Android e devem rodar em um emulador ou celular conectado.

## Executar no Windows

### Testes unitários

```powershell
.\gradlew.bat :app:testDebugUnitTest
```

Relatório HTML:

```text
app/build/reports/tests/testDebugUnitTest/index.html
```

### Cobertura unitária com JaCoCo

```powershell
.\gradlew.bat :app:createDebugUnitTestCoverageReport
```

Relatório HTML:

```text
app/build/reports/coverage/test/debug/index.html
```

### Testes instrumentados

Inicie um emulador no Android Studio ou conecte um celular com depuração USB e execute:

```powershell
.\gradlew.bat :app:connectedDebugAndroidTest
```

Para apenas verificar se os testes instrumentados compilam, sem dispositivo:

```powershell
.\gradlew.bat :app:assembleDebugAndroidTest
```

### Cobertura instrumentada

Com um dispositivo ou emulador disponível:

```powershell
.\gradlew.bat :app:createDebugAndroidTestCoverageReport
```

## Automação

O workflow `.github/workflows/android-quality.yml` executa os testes unitários em pull requests e na branch `master`, gera a cobertura JaCoCo e disponibiliza os relatórios como artefatos do GitHub Actions.

Os testes instrumentados não foram colocados no workflow inicial porque exigem iniciar um emulador e tornam a execução consideravelmente mais lenta. Eles continuam fazendo parte da validação local e podem ganhar um job separado depois.

## Como interpretar a cobertura

Cobertura indica quais linhas e decisões foram exercitadas pelos testes; ela não comprova sozinha que o jogo está livre de defeitos. Para este projeto, o resultado deve ser lido junto com:

- testes unitários das regras;
- testes de interface Compose;
- testes do banco Room;
- testes manuais de áudio, animação, tempo de reação e experiência em aparelhos reais.
