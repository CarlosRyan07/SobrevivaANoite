# Inventário de assets Android

Os recursos usados pelo jogo foram copiados para a Web. A imagem da lore foi atualizada com a correção fornecida pelo usuário, e o GIF não utilizado do Fortnite foi removido das duas versões.

## Resumo

| Categoria | Quantidade | Tamanho aproximado |
|---|---:|---:|
| Drawables (incluindo XML) | 41 | 28,90 MiB |
| Áudios MP3 | 20 | 0,70 MiB |
| APK Android de referência | 1 | 31,26 MiB |

## Imagens de cenário, interface e mapa

| Arquivo | Dimensões | Uso Android |
|---|---:|---|
| `tela_inicio.png` | 1536×3408 | Abertura |
| `lore_fogueira.jpg` | 1280×768 | Lore |
| `background_cabana.png` | 1218×1429 | Lore e batalha |
| `background_cabana1.jpg` | 1221×874 | Preservado, não referenciado |
| `planta_casa_portainteira.png` | 521×772 | Esconderijo antes da porta quebrar |
| `planta_casa.png` | 521×772 | Esconderijo após a porta quebrar |
| `sangue.png` | 512×512 | Marca de NPC morto |
| `ic_launcher.png` | 1536×1771 | Base visual de ícone |
| `ic_launcher_background.xml` | vetor | Ícone Android |
| `ic_launcher_foreground.xml` | vetor | Ícone Android |

## Personagens do modo esconder

| Arquivo | Dimensões | Uso |
|---|---:|---|
| `terrifier.png` | 1024×1044 | Assassino aleatório |
| `ghostface.png` | 780×768 | Assassino aleatório |
| `lobisomem.png` | 459×443 | Assassino aleatório |

## Psicopata do modo batalha

Todos os sprites abaixo têm 680×654:

- `psicopata_parado.png`;
- `psicopata_preparando_esquerda.png`;
- `psicopata_preparando_direita.png`;
- `psicopata_atacando_esquerda.png`;
- `psicopata_atacando_direita.png`;
- `psicopata_atordoado.png`;
- `psicopata_atingido1.png`;
- `psicopata_atingido2.png`;
- `psicopata_atingido3.png`;
- `psicopata_atingido4.png`;
- `psicopata_derrotado.png`.

## Sobrevivente do modo batalha

| Arquivos | Dimensão predominante | Uso |
|---|---:|---|
| `sobrevivente_parado.png` | 1500×1756 | Idle |
| `sobrevivente_ataque1.png` a `sobrevivente_ataque6.png` | 1500×1674–1756 | Sequência cíclica de ataque |
| `sobrevivente_esquivando_esquerda.png` e `...esquerda1.png` | 1500×1756 | Sorteio de esquiva esquerda |
| `sobrevivente_esquivando_direita.png` e `...direita1.png` | 1500×1756 | Sorteio de esquiva direita |
| `sobrevivente_atingido_esquerda.png` | 1500×1756 | Dano recebido da esquerda |
| `sobrevivente_atingido_direita.png` | 1500×1756 | Dano recebido da direita |
| `sobrevivente_parry_esquerda.png` | 1500×1756 | Parry esquerda |
| `sobrevivente_parry_direita.png` | 1500×1756 | Parry direita |
| `sobrevivente_vitoria.png` | 1024×1536 | Pose anterior à dança |

## GIFs de vitória

| Arquivo | Dimensões | Frames | Duração |
|---|---:|---:|---:|
| `rat_dance.gif` | 148×218 | 17 | 1,02 s |

## Áudios

| Arquivo | Duração | Evento |
|---|---:|---|
| `clique_botao.mp3` | 0,914 s | Botões do menu/esconderijo |
| `fnaf2_theme.mp3` | 2,168 s | Hesitação em cada local |
| `musica_tensa.mp3` | 10,736 s | Assassino visita o jogador |
| `psicopata_passos.mp3` | 0,940 s | Retorno ao centro da casa |
| `porta_sendo_quebrada.mp3` | 1,019 s | Entrada na casa |
| `win_hide.mp3` | 4,362 s | Vitória no esconderijo |
| `lose_hide.mp3` | 4,519 s | Derrota no esconderijo |
| `morte1.mp3` | 1,752 s | Morte aleatória de NPC |
| `morte2.mp3` | 1,464 s | Morte aleatória de NPC |
| `morte3.mp3` | 1,464 s | Morte aleatória de NPC |
| `morte4.mp3` | 1,464 s | Morte aleatória de NPC |
| `morte5.mp3` | 1,488 s | Morte aleatória de NPC |
| `morte6.mp3` | 1,512 s | Morte aleatória de NPC |
| `morte7.mp3` | 1,536 s | Morte aleatória de NPC |
| `morte8.mp3` | 1,464 s | Morte aleatória de NPC |
| `soco.mp3` | 0,340 s | Ataque comum |
| `soco_forte.mp3` | 0,366 s | Ataque em inimigo atordoado |
| `parry.mp3` | 0,340 s | Parry perfeito |
| `lobisomem_ataque.mp3` | 1,097 s | Ataque inimigo |
| `lobisomem_ataque1.mp3` | 1,097 s | Preservado, não referenciado |
| `rat_dance_music.mp3` | 32,209 s | Música da sequência de vitória da batalha |

## Estratégia Web

- Arquivos usados globalmente: `public/assets/images` e `public/assets/audio`.
- GIFs: `public/assets/gif`.
- O carregamento inicial priorizará abertura e clique.
- Lore carregará suas imagens ao entrar.
- Cada modo carregará seus sprites e sons antes de iniciar seu motor.
- Os originais permanecerão disponíveis; otimizações serão adicionadas como derivados, nunca substituições destrutivas.
