# 🌙 Sobreviva à Noite

<div align="center">

![Android](https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=white)
![Kotlin](https://img.shields.io/badge/kotlin-%237F52FF.svg?style=for-the-badge&logo=kotlin&logoColor=white)
![API](https://img.shields.io/badge/API-28%2B-brightgreen?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)

**Um jogo de suspense e sobrevivência para Android que testará seus nervos e reflexos!**

[📱 Download](#instalação) • [🎮 Como Jogar](#como-jogar) • [🛠️ Desenvolvimento](#desenvolvimento) • [📄 Licença](#licença)

</div>

---

## 🎯 Sobre o Projeto

**Sobreviva à Noite** é um jogo mobile desenvolvido em Android que oferece uma experiência única de suspense e ação. O jogador é desafiado a sobreviver através de diferentes mecânicas de gameplay, cada uma testando habilidades específicas em um ambiente de tensão constante.

### 🎓 Contexto Acadêmico
Este projeto foi desenvolvido como parte da disciplina de **Programação para Dispositivos Móveis**, onde o desafio inicial era criar um aplicativo multi-telas utilizando **Jetpack Compose**. 

Motivado a ir além dos requisitos básicos, decidi criar um **joguinho** que explorasse os limites da proposta acadêmica, implementando:
- ✅ **Múltiplas telas** com navegação fluida
- ✅ **Interface moderna** com Jetpack Compose
- ✅ **Lógica complexa** de jogos interativos

O resultado foi um projeto que não apenas cumpriu os requisitos acadêmicos, mas também demonstrou o potencial criativo e técnico no desenvolvimento Android.

### 🎯 Objetivos Acadêmicos Alcançados

| Requisito Original | Implementação no Projeto | Status |
|:---:|:---:|:---:|
| **Multi-telas** | Menu principal, telas de jogo, resultados | ✅ Superado |
| **Jetpack Compose** | Interface 100% em Compose | ✅ Completo |
| **Navegação** | Sistema robusto entre telas | ✅ Avançado |
| **Interatividade** | Jogos com mecânicas complexas | ✅ Inovador |

### 📚 Principais Aprendizados
- **Arquitetura Android** com Jetpack Compose
- **Gerenciamento de estado** em aplicações interativas
- **Navigation Component** para fluxo entre telas
- **Design responsivo** e experiência do usuário
- **Lógica de jogos** e algoritmos de gameplay

---

### 🚨 Problema Principal
Oferecer uma experiência de jogo simples e interativa, explorando diferentes mecânicas de gameplay em um ambiente de suspense que mantém o jogador sempre alerta.

---

## 🕹️ Modos de Jogo

### 🫣 Modo Esconde-Esconde
> *"Onde você se esconderia quando sua vida dependesse disso?"*

- **Mecânica**: Jogo de escolha e sorte
- **Objetivo**: Escapar de um psicopata escolhendo os melhores esconderijos
- **Habilidades Testadas**: 
  - Tomada de decisão sob pressão
  - Intuição e sorte
  - Estratégia de sobrevivência

### ⚔️ Modo Batalha
> *"Quando fugir não é uma opção, lute!"*

- **Mecânica**: Sistema de combate baseado em tempo de reação
- **Objetivo**: Derrotar inimigos usando combos e reflexos rápidos
- **Habilidades Testadas**:
  - Tempo de reação
  - Coordenação motora
  - Execução de combos

---

## 📱 Screenshots

<div align="center">

| Modo Esconde-Esconde | Modo Batalha | Menu Principal |
|:---:|:---:|:---:|
| *Em breve* | *Em breve* | *Em breve* |

</div>

---

## 🚀 Funcionalidades

- ✅ **Dois modos de jogo únicos** com mecânicas distintas
- ✅ **Interface intuitiva** e responsiva
- ✅ **Sistema de pontuação** para competição
- ✅ **Efeitos sonoros** imersivos
- ✅ **Compatibilidade** com Android 9.0+ (API 28+)
- 🔄 **Salvamento automático** de progresso
- 🎨 **Design moderno** com tema dark

---

## 🛠️ Tecnologias Utilizadas

<div align="center">

| Tecnologia | Versão | Uso |
|:---:|:---:|:---:|
| **Kotlin** | Latest | Linguagem principal |
| **Android SDK** | 35 | Desenvolvimento mobile |
| **Jetpack Compose** | Latest | Interface moderna |
| **Gradle** | 8.x | Build system |
| **Material Design** | 3.0 | Design system |

</div>

---

## 📋 Requisitos do Sistema

### Mínimos
- **Android**: 9.0 (API 28)
- **RAM**: 2GB
- **Armazenamento**: 50MB livres
- **Processador**: Dual-core 1.2GHz

### Recomendados
- **Android**: 12.0+ (API 31+)
- **RAM**: 4GB+
- **Armazenamento**: 100MB livres
- **Processador**: Quad-core 2.0GHz+

---

## 🚀 Instalação

### Opção 1: APK Direto
1. Baixe o arquivo `app-release.apk` da seção [Releases](../../releases)
2. Ative "Fontes desconhecidas" nas configurações do Android
3. Instale o APK baixado

### Opção 2: Compilação Local
```bash
# Clone o repositório
git clone https://github.com/CarlosRyan07/SobrevivaANoite.git

# Entre no diretório
cd SobrevivaANoite

# Compile e instale (requer Android Studio)
./gradlew installDebug
```

---

## 🎮 Como Jogar

### 🫣 Modo Esconde-Esconde
1. **Inicie** o modo no menu principal
2. **Escolha** um local para se esconder entre as opções disponíveis
3. **Aguarde** o resultado - você conseguiu escapar?
4. **Repita** e tente sobreviver o máximo de rodadas possível

### ⚔️ Modo Batalha
1. **Entre** no modo batalha pelo menu
2. **Observe** os comandos que aparecem na tela
3. **Execute** os combos tocando rapidamente nos botões
4. **Derrote** todos os inimigos para avançar

---

## 🏗️ Desenvolvimento

### Estrutura do Projeto
```
app/
├── src/main/
│   ├── java/com/example/sobrevivaanoite/
│   │   ├── ui/           # Interfaces e Activities
│   │   ├── game/         # Lógica dos jogos
│   │   ├── models/       # Modelos de dados
│   │   └── utils/        # Utilitários
│   └── res/
│       ├── layout/       # Layouts XML
│       ├── drawable/     # Recursos gráficos
│       └── values/       # Strings, cores, estilos
```

### Como Contribuir
1. **Fork** este repositório
2. **Crie** uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. **Commit** suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. **Push** para a branch (`git push origin feature/nova-funcionalidade`)
5. **Abra** um Pull Request

---

## 📊 Status do Projeto

<div align="center">

| Funcionalidade | Status | Versão |
|:---:|:---:|:---:|
| Modo Esconde-Esconde | ✅ Completo | v1.0 |
| Modo Batalha | ✅ Completo | v1.0 |
| Sistema de Pontuação | 🔄 Em desenvolvimento | v1.1 |
| Modo Online | 📋 Planejado | v2.0 |
| Novos Modos | 💭 Considerando | TBD |

</div>

---

## 👥 Equipe

<div align="center">

| [<img src="https://github.com/CarlosRyan07.png" width="100px;"/><br /><sub><b>Carlos Ryan</b></sub>](https://github.com/CarlosRyan07) |
| :---: |
| 💻 Desenvolvedor Principal |

*Projeto desenvolvido como parte da disciplina de **Programação para Dispositivos Móveis***

</div>

---

## 🎓 Reflexão Acadêmica

Este projeto representa mais do que um simples cumprimento de requisitos acadêmicos. Foi uma oportunidade de:

- **Explorar limites criativos** dentro de um framework técnico específico
- **Aplicar conhecimentos teóricos** em um projeto prático e envolvente  
- **Demonstrar domínio técnico** do Jetpack Compose e arquitetura Android
- **Criar valor real** através de uma experiência de usuário divertida

O resultado final mostra como é possível **ir além do esperado** mesmo dentro de constraints acadêmicas, transformando um exercício de programação em um **produto completo** e **funcional**.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🤝 Suporte

Encontrou um bug ou tem uma sugestão? 

- 🐛 [Reporte um bug](../../issues/new?template=bug_report.md)
- 💡 [Sugira uma feature](../../issues/new?template=feature_request.md)
- 📧 Entre em contato: [seu-email@exemplo.com]

---

<div align="center">

**⭐ Se você gostou do projeto, não esqueça de dar uma estrela!**

---

*Feito com ❤️ e muito ☕ por [Carlos Ryan](https://github.com/CarlosRyan07)*

</div>
