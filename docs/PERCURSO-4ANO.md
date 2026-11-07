# Nico · Percurso 4.º ano — preparar a prova no computador (piloto EB de Messejana, 2026/27)

> Pedido do Carlos (1 Nov 2026): um módulo piloto dentro do Nico para o 4.º ano da EB de Messejana. O objetivo é
> trabalhar a lógica e as aprendizagens de Matemática, Português e Estudo do Meio, e ao mesmo tempo habituar as
> crianças ao rato e ao teclado, para fazerem a prova digital ModA no fim do ano. Inspiração: Ubbu, code.org,
> Raspberry Pi Projects. Junta pensamento computacional por blocos e outras atividades na mesma linguagem gráfica.

Abre em **`percurso.html`**. No ecrã inicial do Nico é o cartão «Percurso 4.º ano», e o endereço `index.html?m=percurso-4`
também lá vai ter. Com `?s=3` abre-se a 3.ª missão da lista (a sessão 2), e com `?prova=1` a prova-ensaio.

## 0. «O Nico e o Mapa de Cobre» — capítulos pelo concelho de Aljustrel (5 Nov 2026)

Pedido do Carlos, a partir do teste feito pelo **Jaime** (filho do Carlos, fundador do Buinho, com quem começou o primeiro agente, o Chaimite):
moedas em vez de bolotas, capítulos nas terras do concelho com uma história, mais jogos e mais ligados ao currículo do 4.º ano,
ditados e Estudo do Meio com estação própria. Aprovado pelo Carlos: «sim concordo com tudo. avança com todos os jogos».

**A história.** O mapa de cobre que guia os inventores até à Mostra, no castelo de Messejana, partiu-se em quatro pedaços.
O Nico vai buscá-los de bicicleta-oficina, terra a terra. Ao entrar num capítulo pela primeira vez aparece a história, com o
cenário do Ambrósio. Cada missão nova dá um pedaço do mapa (marca no mapa e na Mostra).

| Capítulo | Quando | Missões (ids) | Bilhete |
|---|---|---|---|
| 1 · Montes Velhos | nov–dez | 1.1 placas (`s1`) · 1.2 cortiça (`s2`) · **1.3 o inquérito (`v1`)** | aberto |
| 2 · Ervidel | jan–fev | 2.1 ponte (`m1`) · 2.2 água (`s3`) · 2.3 almoço (`s5`) · **2.4 a feira (`v2`)** · **prova-ensaio de fevereiro** | 30 moedas |
| 3 · Aljustrel | mar–abr | 3.1 painel do castelo (`s6`) · **3.2 a mina e o moinho (`v3`)** | 35 moedas |
| 4 · Messejana | mai | 4.1 FabLab (`s4`) · **4.2 o Jornal de Messejana (`v4`)** · **Os Desafios do Castelo** (prova final) | 40 moedas |

O conteúdo está em `missoes/percurso-4ano-concelho.js` (lido antes de `missoes/percurso-4ano.js`, que o junta). A ordem do
array `X.sessoes` não mudou (`?s=N` continua igual); os capítulos só agrupam ids. Nenhum id antigo mudou.

**Moedas de cobre.** Guardam-se em `P.bolotas` (nome antigo, para ninguém perder o que ganhou). 5 moedas por cada mecânica
grande e 3 pelas outras, só na 1.ª conclusão. Compram:
- **jogos extra** na loja (arcada): compra única, depois joga-se à vontade; não contam para as missões. Usam os motores e os
  cenários do Ambrósio. Fica lugar para jogos feitos pelos alunos (o primeiro previsto é o jogo retro do Jaime, quando houver
  uma exportação HTML5);
- **decoração** da oficina;
- o **bilhete** para o capítulo seguinte. **Quem cumpre todas as missões de um capítulo recebe o bilhete seguinte de graça**; as
  moedas servem para ir mais cedo. Quem já começou um capítulo nunca fica de fora. O professor abre tudo com `?cap=todos`.
Nunca compram pistas, respostas ou vantagens. O teste confirma que cada bilhete custa menos do que as moedas mínimas do
capítulo anterior.

**Jogos novos** (`js/percurso/lingua.js` e `js/percurso/territorio.js`, registados em `F.PC.oficina`):

| Tipo | O que treina (Aprendizagens Essenciais do 4.º ano) | Onde |
|---|---|---|
| `ditado` | ortografia, acentuação, maiúsculas e pontuação; ouvir e escrever no teclado. Voz pt-PT do computador (🔊 e 🐢 mais devagar); a criança escolhe **corrigir no fim** ou **a cada frase**; os erros ficam assinalados por tipo (acento, maiúscula, pontuação, palavra mal escrita, em falta, a mais) e corrige uma vez. Sem voz no PC: o professor dita | 1.3 · 2.4 · 3.2 · 4.2 |
| `radio` | **compreensão do oral** (a prova de Português tem uma parte com auscultadores): o texto não aparece, ouve-se 2 vezes e responde-se; no fim pode ler-se a transcrição | 1.3 · 2.4 · 3.2 · 4.2 |
| `sublinhar` | leitura: clicar na frase que prova a resposta (gesto de selecionar no texto) | 1.3 · 4.2 |
| `frases` | gramática em blocos com cores por classe: dizer a classe, separar sujeito e predicado, construir frases num molde | 1.3 · 2.4 · 3.2 |
| `jornal` | escrita com plano → texto → revisão por lista → publicação | 4.2 |
| `feira` | dinheiro: pagar a quantia certa, dar troco, escolher dentro do orçamento (euros e cêntimos, decimais) | 2.4 |
| `saco` | probabilidades: certo, possível, impossível; onde é mais provável; simular tiragens | 2.4 |
| `inquerito` | dados: recolher, contar, tabela de frequências, gráfico de barras, **moda** | 1.3 |
| `planificacao` | planificação do cubo (dobragem verificada) e faces, arestas e vértices de prismas e pirâmides | 2.4 |
| `tartaruga` | programar o Nico a desenhar: polígonos, perímetro, ângulos retos, padrões com «repete» (pensamento computacional das AE de Matemática) | 3.2 · 4.2 |
| `triagem` | condições «se… senão se… senão» (cartas do carteiro, produtos da feira, vagonetas da mina) | 1.3 · 2.4 · 3.2 |
| `circuito` | Estudo do Meio: condutores e isoladores num circuito com pilha e lâmpada | 3.2 |
| `arqueologia` | Estudo do Meio: camadas (mais fundo = mais antigo) e linha do tempo | 3.2 |

**Estudo do Meio** tem agora estação própria (cor terracota) em todas as missões: seres vivos, orientação pelo Sol, Portugal,
montado, poupar água, ecopontos, Roda dos Alimentos, cronologia, localidade/freguesia/concelho/distrito, órgãos autárquicos,
estados físicos e ciclo da água, sistema digestivo, rochas e minerais, Vipasca e o foral de 1252, Messejana como antigo
concelho (até 1855), o Sistema Solar. Continua sem prova própria na ModA (o IAVE retirou a componente de Estudo do Meio da prova
de Matemática em 2025), mas é currículo do 4.º ano e dá contexto aos textos e problemas.

**Arte (Ambrósio, PR #79 no buinho-os, 87 WebP, integrada a 5 Nov).** O manifesto `MAPA-DE-COBRE-ARTE.json` está em
`buinho-os/OpenAI/drafts/nico-mapa-cobre-arte/`. O que entrou:
- **Mapa:** o mapa do percurso passou a ser o `mapa-concelho`, esquemático e sem escala. Os botões estão nos pontos do manifesto
  e as placas (1.1) ficam no caminho que sai de Montes Velhos. O nome do destino só aparece no destino atual, ao passar o rato
  ou com o foco. O Nico vai de `nico-bicicleta-oficina`. O mapa antigo com/sem ponte deixou de ser usado: a ponte aparece como
  marca «Ponte ✓» e com a insígnia.
- **Terras:** os 4 cenários servem para os capítulos e as missões novas.
- **Loja e economia:** moeda de cobre, ícone `estacao-meio`, bilhete, mapa de cobre em 4 pedaços (na loja) e as capas da arcada.
- **Jogos:** rádio parado/a tocar, auscultadores e personagens; o Nico a falar no ditado; banca, clientes e produtos da feira,
  com moeda e nota estilizadas (os valores estão em HTML); saco; retratos e prancheta do inquérito; caixa aberta/fechada;
  o Nico visto de cima na tartaruga (mais uma seta de direção); vagonetas, carteiro, cesto, caixa fresca e prateleira;
  pilha, lâmpada e materiais do circuito; arqueóloga, ferramentas e achados; cabeçalho do jornal.
- **Limpeza:** em `rolha-cortica` e `palito` removi pequenos fragmentos soltos na transparência. Foi só técnico (o maior
  componente alfa fica), sem redesenho.
- **Por usar:** `fabrica-frases`, `ditado-caderno` (o caderno é decorativo; a escrita continua em HTML), `camadas-terra`,
  `arcada-categoria` e `moeda-antiga`. O desenho da `moeda-antiga` é romano, por isso não serve para a «Moeda do rei
  D. Manuel I» da escavação: fica sem imagem até haver uma moeda manuelina (pedido ao Ambrósio).
- **Revisão local:** a moeda de cobre tem uma bolota gravada (pode ficar; o Carlos decide). Fachadas e monumentos são
  interpretações ilustradas: confirmar com a escola e as Juntas.


## 0.1 Capítulo especial · «O Ginásio dos Números do Nico» — revisões do 3.º ano (7 Nov 2026)

Pedido do Carlos para o **Jaime** (3.ª fornada: +40 tipos — métodos do manual (subtrair decompondo o subtrativo, adicionar
decompondo as parcelas, dividir decompondo o dividendo), trocas entre ordens, parênteses, algarismo em falta, frações na reta,
eixos de simetria, ângulos no relógio, 24 horas, dias do mês, tracinhos, roletas, depurar programas… — e modos em cada jogo;
2.ª fornada no mesmo dia: +41 tipos de exercício — divisão com resto, múltiplos, estimativas,
prova, propriedades, decimais, numeração romana, reta numérica, polígonos, retas, círculo, figuras equivalentes, tempo, calendário,
séculos, pictogramas, Venn, tabelas de dupla entrada, caminhos, condições e repetições — e +8 jogos). O Jaime vai ter um teste de recapitulação da Matemática do 3.º ano: muitos exercícios e jogos
na onda das fichas do manual, as contas feitas **no caderno** (a criança escreve só o resultado e o Nico verifica), um
**resultado final com classificação**, testes **sempre diferentes** e, no fim, **onde está a falhar e o que tem de reforçar**.

Abre em **`revisoes.html`** (cartão azul «⭐ Capítulo especial» no topo da lista do Percurso, sempre aberto, sem bilhete).
Atalhos: `?teste=1` (teste novo), `?treino=num|ops|pro|fra|seq|geo|med|dad|pc|mix|reforco`, `?jogo=<id>`.

- **Teste de revisão:** 22 questões (Números 4 · Cálculo 4 · Problemas 2 · Frações 2 · Sequências 2 · Geometria 3 · Medidas 2 ·
  Dados 2 · Pensamento computacional 1), sem repetir o tipo de exercício; navegação, «marcar para rever», relógio de 45 min (só
  avisa) e entrega, como a prova-ensaio. Resultado: certas e %, **menção do 1.º ciclo** (Insuficiente < 50 · Suficiente 50–69 ·
  Bom 70–89 · Muito Bom ≥ 90), as 3 pedras do manual (cumpri parcialmente · cumpri · cumpri com distinção), comparação com o teste
  anterior, barras por tema com «Treinar», **análise** e a correção com a resposta certa e a explicação.
- **Análise:** cada exercício pertence a uma **competência** (111, em `COMPETENCIAS`; 154 tipos de exercício). Cada resposta do teste e da 1.ª tentativa
  do treino fica registada; contam as 12 mais recentes de cada competência. Mostra «neste teste falhaste em», «o que tens de
  reforçar» (< 70 % certas nas recentes; primeiro as que já falharam várias vezes, depois os erros únicos) e «já está seguro» (≥ 3 respostas e ≥ 85 %). O botão
  **💪 Reforço dos pontos fracos** gera um treino só com essas competências (também no menu). O histórico dos testes tem gráfico.
- **Testes sempre diferentes entre si:** cada teste evita os tipos de exercício dos 4 testes anteriores (`tipos` guardado em
  cada teste) e só os repete quando um tema os esgotou; os números são sempre novos. O treino faz o mesmo com os últimos 40.
- **Treino por temas:** 8 exercícios; 2 tentativas, pistas do Nico em 3 níveis, explicação; exercícios de conta com faixa roxa
  e o aviso «📝 Faz a conta no caderno».
- **Jogos (16):** tabuada-relâmpago (60 s), ábaco mágico, cartões binários, pontaria na reta numérica, caça ao tesouro nas
  coordenadas, mensagem secreta (contas escondem letras), enigma dos símbolos, caça às planificações do cubo; e (2.ª fornada)
  memória das contas, a banca da feira (pagar a quantia certa), acerta o relógio, pinta a fração, corrida das sequências (60 s),
  ordena depressa, amigos do 100/1000 e programa o Nico (setas numa grelha com pedras).
  **Variantes (3.ª fornada):** quase todos os jogos têm várias versões (49 ao todo). **A criança não escolhe** (decisão do Carlos,
  7 Nov): cada vez que abre um jogo, o Nico escolhe a versão — dá uma volta completa por todas antes de repetir e nunca repete a
  mesma duas vezes seguidas (`P.jogos[id].saidos` / `.ultimo`). O professor pode forçar com `?jogo=<id>&modo=<modo>` ou ver a lista
  com `&modo=escolher`. Versões: por exemplo tabuada só ×, só :,
  difíceis ou × 10/100/1000; ábaco «ler» e até 9 999; cartões «ler» e 6 cartões (até 63); retas pequenas/grandes; coordenadas
  «dizer»; mensagem secreta só tabuadas ou contas grandes; enigma com 4 símbolos; memória de medidas, frações↔decimais e romanos;
  feira «dar o troco» e «só euros»; relógio «ler» e «quartos»; frações em tablete e equivalentes; ordenar decrescente, frações e
  decimais; amigos do 1 (decimais) e dos 10 €; programa o Nico 8 × 8 e «programa mais curto». Recordes guardados por modo
  (`P.jogos['<jogo>:<modo>']`); atalho `?jogo=<id>&modo=<modo>`. Variante nova: `variantes: [[id, nome, descrição]]` e `api.v`.
- **Moedas de cobre:** vão para a mesma carteira do Percurso (`nico.percurso4.v1`), no máximo 30 por dia neste capítulo
  (treino ≥ 6/8: 3 · jogo com objetivo: 3 · teste: 2/5/8 conforme a menção). O progresso fica em `nico.revisoes3.v1`, por aluno.
- **Geometria e figuras exatas em SVG** (ábaco, frações, quadrícula, ângulos, cartões binários, planificações, coordenadas); a
  planificação do cubo é verificada a sério (o cubo «rola» sobre a figura), e o teste confirma as 11 de 35 hexaminós.

**Acrescentar exercícios (para os testes irem ficando cada vez mais variados):** em `missoes/revisoes-3ano.js`, uma linha
`def('<tema>', '<tipo>', r => ({ tipo: 'curta'|'escolha'|'vf'|'ordenar', pergunta, …, explica }))` e o nome da competência em
`COMPETENCIAS`. Os números vêm sempre de `r` (acaso). Contas: `caderno: true` e `instr: CADERNO`. Entra logo nos treinos, no teste
e na análise. **Acrescentar um jogo:** `JOGOS.<id> = { nome, emoji, tema, desc, intro, iniciar(api) }` em `js/percurso/revisoes.js`
(`api.area`, `api.rel` para temporizadores, `api.conta`, `api.fim(pontos, objetivo)`). Correr `node testes/revisoes.js` (verifica
300 testes gerados: cada item aceita a resposta certa e recusa uma errada; todos os tipos aparecem; nenhum teste repetido) e
`python3 ferramentas/gerar-sw.py` antes de publicar.

## 1. Porquê assim

- **A ModA do 4.º ano é digital** e avalia **Português e Matemática** todos os anos, mais uma disciplina rotativa
  (2025: Inglês; 2026: Educação Artística; 2027: Educação Física, prática e fora do computador). Desde 2025 o **Estudo do Meio já não tem prova própria**. Por isso entra
  aqui como **contexto**: temas dos textos de leitura, dos problemas e dos mapas de programação. Assim continua a ser
  trabalhado sem ocupar uma estação.
- Na prova digital muitas crianças perdem pontos por **não dominarem o computador**, e não por não saberem a matéria.
  Isso inclui arrastar, deslocar um texto comprido, escrever com acentos e cedilha, navegar entre questões e entregar.
  O percurso treina isto de propósito e com progressão.
- O **pensamento computacional** é o fio condutor. Os blocos têm o aspecto do MakeCode, como no resto do Nico, para
  a passagem para o micro:bit ser natural. Cada puzzle liga-se ao currículo: pontos cardeais (Estudo do Meio),
  tabuadas, múltiplos e sequências (Matemática).

## 2. Estrutura: a Mostra de Invenções do Nico

Direção aprovada pelo Carlos (revisão do Ambrósio, PR buinho-os #67, consolidado no #68): **A · Livro ilustrado** como
base, com a clareza das peças de **B** e o mapa com escolhas de **C**. O Nico prepara uma **Mostra de Invenções** com
a turma. Há **7 missões** (≈ 60 min cada) e, no fim, a **prova-ensaio**. Em cada missão há um problema do mundo do
Nico, e a turma **constrói, investiga, programa e escreve**. No fim, **o mundo muda**: a ponte fica pintada no mapa
(Missão 1) e, nas outras missões, aparece uma marca no mapa e uma peça na Mostra (página «A oficina do Nico»).

| Missão | Lugar no mapa | Problema | Mecânicas | Currículo (Estudo do Meio como contexto) |
|---|---|---|---|---|
| 1 · A ponte da ribeira (`m1`) | Ponte da ribeira | a ribeira levou a ponte e a rega avariou | Pontes de cortiça (frações) · Detetive (tubo) · Correio · Caminho com previsão | frações; leitura de instruções; formas verbais |
| 2 · As placas da Mostra (`s1`) | Messejana | os visitantes perdem-se | Caminho (pontos cardeais) · Detetive da placa trocada · Correio para a Junta | números grandes; orientação pelo Sol; nomes próprios |
| 3 · A cortiça da Mostra (`s2`) | Montado | de que sobreiro se pode tirar cortiça? | Caminho (múltiplos) · Detetive do sobreiro do 9 (linha do tempo) · Correio | tabuadas e múltiplos; seres vivos do montado; adjetivos |
| 4 · A água da horta (`s3`) | Observatório da Água | pouca água no depósito | **Horta programável** (2 níveis) · Caminho · Correio | divisão, gráficos; ciclo da água; tempos verbais |
| 5 · Reparar no FabLab (`s4`) | FabLab | café de reparações | Ponte das bicicletas (decimais) · Detetive da luz (circuito) · Correio de instruções | frações, decimais, dinheiro; resíduos; imperativo |
| 6 · O almoço da Mostra (`s5`) | Horta | regar a horta e decorar a mesa | **Horta programável** (reler o sensor) · **Ateliê de mosaicos** (área e perímetro) · Correio | horas, medidas, perímetro e área; alimentação; tipos de frase |
| 7 · O painel do castelo (`s6`) | Património e território | a legenda do painel está errada | **Ateliê de mosaicos** (simetria) · Detetive da legenda (séculos) · Correio | ângulos, simetria, dados; o primeiro rei; cronologia |

Os ids das sessões (`s1`–`s6`) e de todas as atividades antigas mantêm-se, por isso o progresso já guardado não se
perde. Cada missão está organizada por estações (aquecer as mãos, programar, construir/medir, ler-investigar-escrever,
e Horta/Ateliê quando os há). As perguntas curriculares das sessões antigas continuam lá, dentro da missão.

**Treino extra (opcional):** os mini-jogos mais fracos (plataforma, apanhar, memória e balões) passaram para uma
estação «Treino extra» no fim de cada missão. **Não contam para cumprir a missão.** Usam os cenários do Ambrósio.

**No fim, a prova-ensaio do Nico** tem 16 questões e 40 minutos (9 de Matemática e 7 de Português). Tem barra de
questões numeradas, «marcar para rever», relógio (só avisa, não fecha), aviso das questões por responder e
«Entregar». Depois mostra o resultado por área e a resposta certa de cada questão. **Não é a plataforma oficial**:
imita o tipo de tarefas e os gestos.

## 2.1 As mecânicas

Todas seguem o mesmo ciclo: **observar → prever → construir → experimentar → explicar**. O erro dá informação e
nunca tira progresso, bolotas ou trabalho. Tudo se faz com o rato **ou só com o teclado**, e o estado é anunciado numa
região `aria-live`.

- **Pontes de cortiça** (`ponte`): pôr peças (frações ou decimais) até a ponte ter a medida do vão; arrastar, clicar,
  ou setas + Enter. O Nico experimenta e diz quanto falta ou quanto passa. Os critérios «medida» e «número de peças»
  aparecem separados.
- **Detetive da oficina** (`detetive`): ler um manual, marcar as pistas (a pista errada explica porque não serve),
  ordenar a reparação (setas ▲▼, teclado ou arrastar), **ver a reparação acontecer** e escrever o relatório. A
  reparação é um desenho exato em SVG com três estados e legenda: avaria → reparado → a funcionar (`reparacao:`
  `tubo`, `circuito`, `placa`, ou `calendario` com os anos verdadeiros em `linhaTempo`).
- **Correio do Nico** (`correio`): copiar letra a letra, corrigir um rascunho (diz quantas palavras faltam) e
  escrever uma mensagem própria; o destinatário responde.
- **Caminho** (`caminho`): blocos com o aspeto do MakeCode. Com `prever: true` marca-se primeiro onde o Nico vai
  parar: clicando numa casa **ou** com Tab até ao mapa, setas e Enter. **👣 Um passo** executa bloco a bloco.
- **M4 · Horta programável** (`horta`, ficha do Ambrósio): cada canteiro tem humidade de 0 a 6 gotas e a faixa
  adequada é 3–4. Cada «regar» dá 1 gota e gasta 1 dose do depósito. O sensor «se estiver seco» lê o canteiro **no
  instante em que corre**. Blocos: «para cada canteiro», «repetir N vezes» (1–8), «se estiver seco», «regar». Antes da
  1.ª execução prevê-se quantas doses o programa gasta e que canteiros recebem água (botões de texto). Botões:
  Experimentar (2.º clique mostra já o resultado), Um passo (a condição tem passo próprio), Voltar à edição,
  Desfazer, Recomeçar esta tentativa (pede confirmação). O programa é uma lista editável com aspeto de blocos (▲ ▼ ✕
  e uma ranhura «os blocos novos entram aqui»), e não precisa de arrastar. A validação segue a ordem da ficha:
  blocos completos → depósito/limite → faixas → orçamento. Depois de 2 tentativas falhadas pode pedir-se «Ver uma
  solução», que fica registado como `mostrada`.
- **M5 · Ateliê de mosaicos** (`mosaico`): grelha 6×6 com coordenadas. Área = células ocupadas; perímetro = lados
  sem vizinho ocupado (conta os contornos interiores); forma contínua só por lados; simetria vertical (r, c) ↔ (r, 7−c),
  com padrão quando pedido. Paleta: azul com ondas, terracota com pontos, verde com folhas (a cor nunca é o único
  sinal) e «retirar». Azulejos fixos 🔒 não saem. Inventário limitado quando o desafio o pede. Teclado: setas, Enter
  ou Espaço para pôr, Delete ou Backspace para tirar. Ao verificar, cada critério aparece em separado; a seguir pode
  ver-se o contorno desenhado. A geometria é exata (HTML/SVG); a aquarela é só decoração.

As duas mecânicas M4/M5 têm o interpretador e a geometria em funções puras (`F.PC.horta`, `F.PC.mosaico.geo`)
testadas com os casos de aceitação das fichas. Guardam um **rascunho** a cada ação (`P.rascunhos[id]`), que se
recupera ao voltar ou ao recarregar. A explicação final fica como **texto guardado** para o professor ler; não há
mínimo rígido de palavras nem «explicação correta».

## 2.2 Recompensas e registos

- **Estado de cada atividade** (`P.at[id].estado`): `autonomo` (feita sem ajudas e à 1.ª), `apoio` (com pistas, à
  2.ª tentativa nas perguntas, ou depois de tentativas falhadas nas mecânicas sem modo próprio) e `mostrada` (a
  resposta ou a solução foi mostrada). Nas mecânicas M4/M5, experimentar várias vezes faz parte do trabalho e não
  passa a «apoio»; só a Ajuda ou «Ver uma solução» mudam o estado.
- **Bolotas:** recompensa fixa, só na **1.ª conclusão** de cada atividade (repetir ou recarregar não dá mais). Há 5
  por caminho, ponte, detetive, correio, horta e mosaico, e 3 por cada outra atividade. **Não há corações, vidas,
  bónus de sequência nem pontos por estrelas.** As bolotas só compram decoração para **a oficina do Nico** (vaso,
  bandeirolas, quadro, rádio, bicicleta, impressora 3D) e nunca compram pistas, temas ou vantagens.
- **Insígnia** ao cumprir uma missão; a da Missão 1 tem desenho do Ambrósio («Construtor de pontes»).
- **Mapa:** é a arte do Ambrósio (`mapa-sem-ponte` / `mapa-com-ponte`) com a camada do Observatório da Água nos dois
  estados. Os botões são compactos (o ponto do mapa é o centro do disco) e a lista de cartões por baixo serve de
  legenda com os títulos completos. Abaixo de 900 px os botões escondem-se e ficam só os cartões, que têm mais de
  44 px.
- **Sair a meio:** cada atividade tem um relógio próprio (`F.PC.relogio`). Ao mudar de estação ou voltar ao mapa,
  todos os temporizadores e animações pendentes são cancelados. Além disso, as conclusões tardias são ignoradas.

## 2.3 Arte

Todos os desenhos são do Ambrósio (`img/percurso/*.webp`, pacote de 1 Nov e complemento com cenários e poses). Os
mini-jogos usam um cenário estático por tema (`cenario-messejana`, `-montado`, `-agua`, `-fablab`, `-horta`,
`-patrimonio`); o chão e as plataformas são geometria do motor com a paleta do complemento. O Nico usa as poses
aprovadas, ancoradas pela pata (`nico-salta` e `nico-tropeca` em 288×360, com a pata em y=352; as outras em 256×320,
com a pata em y=312). O que é medida, grelha, gráfico ou resposta é sempre SVG/HTML exato, nunca pintura.

## 3. A missão na sala (60 min)

1. **5 min** — o professor projeta a missão; ao abrir, o Nico apresenta o problema. Os alunos entram na turma
   (código + nome + 3 imagens: `professor.html` imprime os cartões).
2. **50 min** — cada aluno faz as estações pela ordem; quem acaba pode fazer o «Treino extra» ou voltar às atividades
   feitas com apoio.
3. **5 min** — conversa: o que foi difícil no computador (acentos, arrastar, rolar…) e o que descobriram.

Nas perguntas: **2 tentativas**. À 1.ª errada há uma pista; à 2.ª aparece a resposta certa e a explicação (estado
`mostrada`). O botão **Ajuda** dá 3 níveis de pista (pergunta → orienta → gesto concreto) e nunca a resposta.
**🔊 Ouvir** lê o enunciado com a voz do computador; no Português há também «Ouvir o texto».

## 4. Acompanhar (área do professor)

O progresso fica por aluno (turmas do Nico, `docs/TURMAS.md`) e sincroniza com a API no Webtuga. Funciona sem rede:
o que fica pendente segue quando a rede voltar. Na tabela «alunos × missões» há a coluna **Percurso 4.º ano**
(feitas/total, sem contar o treino extra). Ao passar o rato aparece o detalhe: certas por área e a última
prova-ensaio. Os textos (relatórios, cartas, explicações) ficam no campo `v` de cada atividade, para o professor ler.

**Ainda por construir:** o painel com as 4 dimensões propostas pelo Ambrósio (Matemática, Português, pensamento
computacional, operação digital), a distinção autónomo/apoio/mostrada no ecrã do professor e a confirmação de
transferência. Os dados já são guardados (`estado`, `previsoes`, `execucoes`, `passos`, `desfazer`, `tentativas`),
mas o painel ainda mostra só o resumo por área.

**Indicadores sugeridos para o piloto** (início · fim do 1.º período · maio):
- teclado: caracteres certos por minuto e % de teclas certas (`ccm`, `precisao`);
- rato: tempo e falhas nas bolotas (`tempo`, `falhas`);
- prova-ensaio: certas por área e minutos usados (repetir em janeiro e em maio);
- observação: autonomia a navegar, arrastar e entregar sem ajuda do adulto; compreensão de «prever», da leitura do
  sensor e da diferença entre área e perímetro.

## 5. Como está feito (técnico)

| Ficheiro | Papel |
|---|---|
| `percurso.html` | página: mapa, missão (estações no topo, atividade, Nico à direita), oficina e prova-ensaio |
| `css/percurso.css` | estilos do módulo (sobre `css/faisca.css`) |
| `js/percurso/mascote.js` | balão, pistas em 3 níveis, «Ouvir» (`speechSynthesis` pt-PT) |
| `js/percurso/itens.js` | perguntas (`escolha`, `varias`, `vf`, `ordenar`, `arrastar`, `curta`, `extensa`, `palavras`) e `F.PC.relogio` (temporizadores canceláveis) |
| `js/percurso/rato-teclado.js` | `alvos`, `separar`, `duplo`, `rolar`, `teclado` |
| `js/percurso/caminho.js` | quadrícula + blocos; previsão por clique ou teclado; Um passo |
| `js/percurso/jogos.js` | treino extra: `plataforma`, `ligar`, `apanhar`, `memoria`, `rebentar` (cenários e poses do Ambrósio) |
| `js/percurso/oficina.js` | `ponte`, `detetive` (com a transformação da reparação), `correio` |
| `js/percurso/atelie.js` | `horta` (M4) e `mosaico` (M5), com o interpretador e a geometria puros |
| `js/percurso/app.js` | fluxo, progresso (`F.chaveMissao` → chave por aluno), rascunhos, bolotas, mapa, oficina, prova-ensaio |
| `missoes/percurso-4ano.js` | **o conteúdo**: missões, conversão das sessões 1–6 (`NOVAS`, `MISSOES_S`), prova e resumo para o professor |
| `testes/percurso.js` | testes de conteúdo e de aceitação M4/M5; jogadas pela interface (rato e só teclado); sair a meio; recarregar; recompensa única; alunos diferentes; todas as atividades abrem |
| `testes/offline.js` | sem rede depois de preparar: o percurso, a Horta e o Ateliê abrem com as imagens |

**Acrescentar uma missão:** um bloco `{ id, rotulo, lugar, titulo, missao, resumo, estacoes: [...], transforma }`
em `missoes/percurso-4ano.js`. Os ids das atividades **nunca se mudam** depois de usados. Cada caminho leva `solucao`,
cada horta e cada mosaico também, para os testes. Depois correr `node testes/percurso.js` e
`python3 ferramentas/gerar-sw.py` antes de publicar.

## 6. O resto do ano (proposta — por construir)

| Período | Sessões | Estudo do Meio (contexto) | Programar | Notas |
|---|---|---|---|---|
| jan–fev | 7–12 | energia e circuitos · Sistema Solar e estações do ano · agricultura e produtos da região · os Descobrimentos · tempo e clima · cante alentejano e património | **variáveis** (contar pontos, guardar o maior) e **eventos** (ao clicar, ao carregar numa tecla) | prova-ensaio 2 no fim de fevereiro |
| mar–abr | 13–18 | animais em perigo · materiais e propriedades · mapas de Portugal e da Europa · cidadania digital e segurança na internet · sistemas do corpo humano · o 25 de Abril | **funções/padrões** e depuração mais longa; ponte para o micro:bit (Missão «Primeiros passos» do Nico) | escrita mais extensa (60–80 palavras) |
| mai | 19–22 | revisões mistas | projeto livre no palco ou no micro:bit | **prova-ensaio 3** com as mesmas condições da prova (tempo, sem ajuda), 1–2 semanas antes da ModA |

Também por fazer: um modo «sem ajudas» (só para as provas-ensaio de maio) e mais provas-ensaio com outros textos;
validar o conteúdo com as professoras titulares do 4.º ano de Messejana (alinhar com o que estão a dar em cada semana).
