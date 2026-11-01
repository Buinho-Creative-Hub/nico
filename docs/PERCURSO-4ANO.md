# Nico · Percurso 4.º ano — preparar a prova no computador (piloto EB de Messejana, 2026/27)

> Pedido do Carlos (1 Nov 2026): um módulo piloto dentro do Nico para o 4.º ano da EB de Messejana. O objetivo é
> trabalhar a lógica e as aprendizagens de Matemática, Português e Estudo do Meio, e ao mesmo tempo habituar as
> crianças ao rato e ao teclado, para fazerem a prova digital ModA no fim do ano. Inspiração: Ubbu, code.org,
> Raspberry Pi Projects. Junta pensamento computacional por blocos e outras atividades na mesma linguagem gráfica.

Abre em **`percurso.html`**. No ecrã inicial do Nico é o cartão «Percurso 4.º ano», e o endereço `index.html?m=percurso-4`
também lá vai ter. Com `?s=3` abre-se a sessão 3, e com `?prova=1` a prova-ensaio.

## 1. Porquê assim

- **A ModA do 4.º ano é digital** e avalia **Português e Matemática** todos os anos, mais uma disciplina rotativa
  (2025: Inglês; 2026: Educação Artística). Desde 2025 o **Estudo do Meio já não tem prova própria**. Por isso entra
  aqui como **contexto**: temas dos textos de leitura, dos problemas e dos mapas de programação. Assim continua a ser
  trabalhado sem ocupar uma estação.
- Na prova digital muitas crianças perdem pontos por **não dominarem o computador**, e não por não saberem a matéria.
  Isso inclui arrastar, deslocar um texto comprido, escrever com acentos e cedilha, navegar entre questões e entregar.
  O percurso treina isto de propósito e com progressão.
- O **pensamento computacional** é o fio condutor. Os blocos têm o aspecto do MakeCode, como no resto do Nico, para
  a passagem para o micro:bit ser natural. Cada puzzle liga-se ao currículo: pontos cardeais (Estudo do Meio),
  tabuadas, múltiplos e sequências (Matemática).

## 2. Estrutura

**6 sessões construídas** (≈ 60 min cada, uma por semana, novembro–dezembro), **cada uma com 4 estações**:

| Estação | Tempo | O que se treina | Como |
|---|---|---|---|
| 🖱️ Rato e teclado | 8–10 min | clicar com precisão, arrastar e largar, duplo clique, rolar texto, teclas de casa, maiúsculas, acentos (teclas mortas do teclado PT), pontuação, frases completas | `alvos`, `separar`, `duplo`, `rolar`, `teclado` (teclado português no ecrã, com a próxima tecla destacada e a cor do dedo) |
| 🧩 Programar | 15 min | sequências → ciclos (repetir) → condições (se) → depuração («gambiarras» do Nico) | o Nico anda numa quadrícula com norte/sul/este/oeste e apanha números; 3 estrelas com o mínimo de blocos (como o code.org) |
| 🔢 Matemática | 12–15 min | 6 perguntas no formato das provas digitais | escolha múltipla, várias opções, curta (teclado), ordenar e associar (arrastar), com gráficos, relógio, tabelas e figuras |
| 📖 Português | 15–20 min | leitura de um texto informativo, narrativo ou de instruções com tema de Estudo do Meio; gramática; escrita no teclado | texto à esquerda e pergunta à direita (como nas provas); V/F, ordenar, completar, clicar em palavras e resposta escrita (conta palavras, maiúscula e pontuação) |

**No fim, a prova-ensaio do Nico** tem 16 questões e 40 minutos (9 de Matemática e 7 de Português). Tem barra de
questões numeradas, «marcar para rever», relógio (só avisa, não fecha), aviso das questões por responder e
«Entregar». Depois mostra o resultado por área e a resposta certa de cada questão. **Não é a plataforma oficial**:
imita o tipo de tarefas e os gestos.

### Conteúdo das sessões

| # | Tema (Estudo do Meio) | Rato e teclado | Programar | Matemática | Português |
|---|---|---|---|---|---|
| 1 | Norte, sul, este e oeste — orientar-se pelo Sol | bolotas (clicar) · teclas de casa | sequências com pontos cardeais | leitura de números, valor posicional, ordenar, decompor, arredondar | «Como encontrar o norte» · nomes próprios |
| 2 | O montado e a cortiça | animal/planta (arrastar) · fila de cima | apanhar: de 5 em 5, tabuada do 4, resultados de multiplicações | tabuadas, ×100, problemas, múltiplos | «A árvore da cortiça» · adjetivos, sinónimos |
| 3 | A água: do Alqueva à torneira | duplo clique · maiúsculas | repetir: escada, de 2 em 2, levada de rega | divisão, resto, gráfico de barras | «A viagem de uma gota» · ciclo da água, tempos verbais |
| 4 | Reciclar e reparar no FabLab | ecopontos (arrastar) · acentos e ç | depuração (gambiarra) + repetir | frações, decimais, dinheiro, troco | «Como reparar um furo na bicicleta» · texto de instruções, imperativo |
| 5 | O corpo e a alimentação | rolar texto comprido · pontuação | se … então: pares, múltiplos de 3 e de 4 | horas e durações, metro/cm, perímetro, área, capacidade | «A Roda dos Alimentos» · antónimos, tipos de frase |
| 6 | Portugal no mapa e na história | rio ou serra (arrastar) · frases completas | desafio final: repetir + se, gambiarra, muralhas | ângulos, simetria, cubo, moda, probabilidade | «O primeiro rei de Portugal» · cronologia, séculos, pronomes |

## 2.1 Jogos e gamificação (desde 1 Nov 2026, tarde — pedido do Carlos: «algo que não seja só clicar na resposta certa»)

- **Avatar fixo: o Nico** (a Gabi não entra neste módulo).
- **Mini-jogos** (`js/percurso/jogos.js`), 2 a 4 por sessão:
  - `plataforma`: o Nico corre (setas) e salta (espaço), apanha as fichas certas (múltiplos, frações que valem metade,
    letras simétricas…) e salta por cima das erradas. Tem 3 corações e chega à bandeira no fim.
  - `ligar`: ligar pontos com o rato. Em modo `sequencia` liga-se por ordem crescente e revela-se um desenho; em modo
    `pares` liga-se cada coisa ao seu par (tempos verbais, anos dos acontecimentos).
  - `apanhar`: palavras a cair que se apanham com o cesto do Nico (adjetivos, hortícolas).
  - `memoria`: jogo da memória (tabuadas, horas).
  - `rebentar`: balões a subir que rebentam quando se escreve a palavra (teclas de casa, maiúsculas, acentos).
- **Bolotas**: cada atividade bem feita dá bolotas. Uma pergunta certa à 1.ª vale 3 e à 2.ª vale 1; um jogo vale
  4 (+2 sem perder corações); um puzzle vale 2 + as estrelas. Três certas seguidas à primeira dão +2 de bónus. Ao
  fazer uma sessão inteira ganha-se a **insígnia** dessa sessão.
- **Mapa-trilho**: o caminho do Nico pelas 6 sessões e a prova-ensaio.
- Grafismo provisório em código; as ilustrações finais estão pedidas ao Ambrósio
  (`buinho-os/handoffs/2026-11-01_pacheco_ambrosio_percurso-4ano-ilustracao.md`) e entram sozinhas quando existirem
  em `img/percurso/` (`F.PC.ARTE`).

## 2.2 Mostra de Invenções — a revisão do Ambrósio (1 Nov 2026, PR buinho-os #67; Carlos: «prefiro a opção dele, avança»)

Direção escolhida: **A · Livro ilustrado** como base, com a clareza das peças de **B** e o mapa com escolhas de **C**.
Narrativa: o Nico prepara uma **Mostra de Invenções** com a turma; cada missão muda o mundo do Nico.

**Fatia vertical já jogável — «Missão 1 · A ponte da ribeira»** (`m1`, primeiro cartão do percurso):
- **Pontes de cortiça** (`tipo: 'ponte'`, `js/percurso/oficina.js`): arrastar (ou setas + Enter) peças com frações ou
  comprimentos até a ponte ter a medida do vão. O Nico experimenta: «ainda falta um quarto», «passa do vão». Não há
  quedas. Pode haver restrição de peças, e várias soluções são aceites. A ponte fica no mapa (`transforma: 'ponte'`).
  Depois vem uma pergunta de transferência sem ponte.
- **Detetive da oficina** (`tipo: 'detetive'`): manual com secções para rolar, marcar as pistas (com explicação
  quando a pista não serve), ordenar a reparação, ver a reparação e escrever o relatório para o professor ler.
- **Correio do Nico** (`tipo: 'correio'`): copiar (com ajuda de teclado opcional), corrigir um rascunho (diz quantas
  palavras faltam), escrever uma mensagem própria e enviar. O destinatário responde.
- **Caminho melhorado**: `prever: true` pede para marcar no mapa onde o Nico vai parar; **👣 Um passo** executa bloco
  a bloco, com o bloco ativo destacado e o estado visível («se o número aqui é par → falso: salta», «repetir: volta
  2 de 6»).
- Momento-prova curto no fim.

**Correções pedidas na revisão (feitas):**
- registos com `estado` autónomo / apoio / mostrada;
- plataforma sem perder progresso nem corações;
- apanhar só termina com todas as palavras certas diferentes;
- balões: um engano por palavra, um balão de cada vez no início, pausa e velocidade mais baixa;
- teclado: precisão por inserção (`insertText`/`compositionend`, NFC) e caracteres corretos por minuto;
- bolotas fixas pela 1.ª conclusão (também com apoio), sem bónus de sequência. Só servem para decorar a
  **oficina do Nico** (vaso, bandeirolas, quadro, rádio, bicicleta, impressora 3D) e nunca compram pistas.

**Por fazer (próximos passos da revisão):** pacote de ilustração final (Entrega 4 do Ambrósio); passar as sessões
1–6 para missões do mesmo tipo; M4 Horta programável, M5 Ateliê de mosaicos, M6 Mapa das entregas, M7 Histórias que
respondem, M8 Bancada das gambiarras; painel do professor com as 4 dimensões (Matemática, Português, pensamento
computacional, operação digital); testar num PC fraco da escola.

## 3. A sessão na sala (60 min)

1. **5 min** — o professor projeta o tema e a mascote diz o objetivo. Os alunos entram na turma (código + nome +
   3 imagens: `professor.html` imprime os cartões).
2. **50 min** — cada aluno faz as 4 estações pela ordem. Quem acaba primeiro volta às estações com pontos
   amarelos (feitas à 2.ª ou com a resposta mostrada) ou procura a 3.ª estrela nos puzzles.
3. **5 min** — conversa: o que foi difícil no computador? (acentos, arrastar, rolar…)

Regras da mascote: **2 tentativas** por pergunta. À 1.ª errada dá uma pista; à 2.ª mostra a resposta certa e a
explicação. O botão **Ajuda** dá 3 níveis de pista (pergunta → orienta → gesto concreto) e nunca a resposta.
**🔊 Ouvir** lê o enunciado com a voz do computador; no Português há também «Ouvir o texto». Isto serve para alunos
com mais dificuldades de leitura, mas nas provas de leitura convém usar pouco.

## 4. Acompanhar (área do professor)

O progresso fica por aluno (turmas do Nico, `docs/TURMAS.md`) e sincroniza com a API no Webtuga. Funciona sem rede:
o que fica pendente segue quando a rede voltar. Na tabela «alunos × missões» há a coluna **Percurso 4.º ano**
(feitas/total). Ao passar o rato aparece o detalhe: certas por área e a última prova-ensaio. Os textos escritos
ficam guardados no progresso do aluno (campo `v` da atividade) para o professor ler.

**Indicadores sugeridos para o piloto** (início · fim do 1.º período · maio):
- teclado: palavras por minuto e % de teclas certas (a atividade de teclado regista `ppm` e `precisao`);
- rato: tempo e falhas nas bolotas (regista `tempo` e `falhas`);
- prova-ensaio: certas por área e minutos usados (repetir em janeiro e em maio);
- observação: autonomia a navegar, arrastar e entregar sem ajuda do adulto.

## 5. Como está feito (técnico)

| Ficheiro | Papel |
|---|---|
| `percurso.html` | página: mapa das sessões, sessão (estações no topo, atividade, mascote à direita) e prova-ensaio |
| `css/percurso.css` | estilos do módulo (sobre `css/faisca.css`) |
| `js/percurso/mascote.js` | balão, pistas em 3 níveis, «Ouvir» (`speechSynthesis` pt-PT) |
| `js/percurso/itens.js` | motor de perguntas: `escolha`, `varias`, `vf`, `ordenar`, `arrastar` (completar/associar; arrastar **ou** clicar etiqueta + espaço), `curta`, `extensa`, `palavras`; figuras `barras`, `relogio`, `svg`; `tabela`; `corrigir()` sem ecrã |
| `js/percurso/rato-teclado.js` | `alvos`, `separar`, `duplo`, `rolar`, `teclado` (layout PT, teclas mortas ´ ` ~ ^, cores dos dedos) |
| `js/percurso/caminho.js` | quadrícula + blocos `cm_comecar`, `cm_andar` (N/S/E/O), `cm_apanhar`, `cm_aqui` (par, ímpar, múltiplo de 3/4/5/6/10) + `mk_repetir`/`mk_se_entao` do Nico; validação por comportamento; estrelas por nº de blocos |
| `js/percurso/app.js` | fluxo, progresso (`F.chaveMissao` → chave por aluno), prova-ensaio |
| `missoes/percurso-4ano.js` | **o conteúdo** (sessões, estações, atividades, prova) e o resumo para o professor (`resumoExtra`) |
| `testes/percurso.js` | testes: cada caminho resolve-se com a solução (3 estrelas) e não com o programa inicial; cada item aceita o certo e recusa o errado; sessão 1 de ponta a ponta com o rato e o teclado; sessões 2–6 abrem; prova-ensaio; cartão no início; sem erros |

**Acrescentar uma sessão:** copiar um bloco `{ id: 's7', titulo, resumo, estacoes: [...] }` em
`missoes/percurso-4ano.js`. Os ids das atividades **nunca se mudam** depois de usados, porque o progresso guarda-se
por id. Cada caminho leva `solucao` (programa abreviado `[['E', 2], ['ap'], ['rep', 3, [...]], ['se', 'm3', [...]]]`)
para o teste. Depois correr `node testes/percurso.js` e `python3 ferramentas/gerar-sw.py` antes de publicar.

Integração com o resto do Nico: a missão regista-se com `pagina: 'percurso.html'` e `niveis` (cada sessão é um
«nível», cada atividade um «desafio»), por isso o ecrã inicial, as turmas e o painel do professor funcionam sem
código especial. Pequenas mudanças comuns: `X.textoNiveis` (inicio.js), `X.resumoExtra` (turma.js) e a coluna e o
detalhe no `professor.js`.

## 6. O resto do ano (proposta — por construir)

| Período | Sessões | Estudo do Meio (contexto) | Programar | Notas |
|---|---|---|---|---|
| jan–fev | 7–12 | energia e circuitos · Sistema Solar e estações do ano · agricultura e produtos da região · os Descobrimentos · tempo e clima · cante alentejano e património | **variáveis** (contar pontos, guardar o maior) e **eventos** (ao clicar, ao carregar numa tecla) | prova-ensaio 2 no fim de fevereiro |
| mar–abr | 13–18 | animais em perigo · materiais e propriedades · mapas de Portugal e da Europa · cidadania digital e segurança na internet · sistemas do corpo humano · o 25 de Abril | **funções/padrões** e depuração mais longa; ponte para o micro:bit (Missão «Primeiros passos» do Nico) | escrita mais extensa (60–80 palavras) |
| mai | 19–22 | revisões mistas | projeto livre no palco ou no micro:bit | **prova-ensaio 3** com as mesmas condições da prova (tempo, sem ajuda), 1–2 semanas antes da ModA |

Também por fazer: um modo «sem ajudas» (só para as provas-ensaio de maio) e mais provas-ensaio com outros textos;
validar o conteúdo com as professoras titulares do 4.º ano de Messejana (alinhar com o que estão a dar em cada semana).
