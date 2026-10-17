# Plataforma Gabi — como está feita e como fazer outra versão

> **Actualização 17 Out 2026 (fim da tarde) — mascotes × missões.** A plataforma já não tem a Gabi escrita no código.
> A criança escolhe **quem a acompanha** (`mascotes/gabi.js`, `mascotes/nico.js`) e **a missão** (`missoes/*.js`),
> no ecrã inicial. Cada missão tem **níveis** e cada nível tem **desafios**. Há música de fundo e efeitos sonoros
> (`js/som.js`, com botões para desligar). Ver § 6 e § 7.
>
> `index.html` → ecrã inicial · `index.html?a=nico&m=reparar` → direto · `nico.html`/`Abrir Nico.bat` → com o Nico.

## 1. O que é, numa frase

Um editor de blocos **com o aspecto exacto do MakeCode**, reduzido ao essencial, onde crianças de ~10 anos sem
experiência fazem **desafios em sequência** (cada desafio desbloqueia blocos novos), testam num **micro:bit desenhado
no ecrã**, são acompanhadas por uma **tutora-mascote** (a Gabi, capivara da gambiarra) que dá pistas sem resolver por
elas, e no fim **gravam o programa no micro:bit verdadeiro por cabo USB** — tudo **sem internet**.

## 2. Princípios (o que não se negocia numa versão nova)

1. **Visual igual ao MakeCode.** As crianças e os professores reconhecem os blocos e passam depois para o MakeCode
   sem estranhar. Nunca o aspecto Scratch/zelos «parecido».
2. **Pouco de cada vez.** Cada desafio traz 1–3 blocos novos. A caixa de blocos é cumulativa.
3. **Validação por comportamento, não por presença de blocos.** O desafio fica feito quando o micro:bit *faz* o que
   se pede (vê-se no registo de acontecimentos), não quando o bloco certo está na área.
4. **A mascote ajuda, não resolve.** Pistas em 3 níveis, só sobe de nível quando a criança pede. Sozinha, a mascote
   só oferece o nível 1.
5. **Errar faz parte.** A mascote também erra («gambiarra da Gabi») e a criança repara.
6. **Offline e sem custos.** Abre com duplo clique, funciona sem internet, sem IA paga, sem contas.
7. **Motor pedagógico separado da interface.** As regras e mensagens são dados; a apresentação só mostra.

## 3. Mapa dos ficheiros

| Ficheiro | Papel | Mexe-se numa versão nova? |
|---|---|---|
| `index.html` | estrutura da página: topo, missão, micro:bit do ecrã, editor, Gabi, janelas | pouco (textos, marca) |
| `css/faisca.css` | aspecto (cores, letra Asap, balão da mascote, janelas) | cores/marca |
| `js/blocks.js` | **renderer `makecode`** (geometria medida no pxt), tema com as cores das categorias, definição dos blocos, listas de ícones/sons/notas | só para blocos novos |
| `js/sim.js` | micro:bit desenhado: LEDs, botões, logotipo, pinos, som (WebAudio), luz | raramente |
| `js/motor.js` | corre o programa de blocos no ecrã (acontecimentos, gerações, destaque do bloco a correr) e escreve o **registo** | só para blocos novos |
| `mascotes/<id>.js` | **a mascote**: nome, género (`artigo`), apresentação (`ola`), perfil, sprites, marca/tema, voz e música, mensagens gerais | **sim — mascote nova** |
| `missoes/<id>.js` | **a missão**: título, tema, cor, níveis → desafios, cada desafio com o seu `tutor` (regras, pistas, sucesso, gambiarra) | **sim — é o conteúdo** |
| `js/escolha.js` | lê `?a=` (mascote) e `?m=` (missão); lembra a mascote | não |
| `js/inicio.js` | ecrã inicial (mascotes, missões, progresso, «em preparação») e botões de som | só a lista «em preparação» |
| `js/som.js` | música de fundo (um tema por mascote) e efeitos (encaixar, apagar, sucesso, nível, voz), tudo sintetizado | afinar |
| `js/desafios.js` | base: blocos da caixa (`XML_CAIXA`), verificações (`depois`, `visiveis`, `algumPino`, `causou`), `caixa(n)`, `registarMascote/Missao`, `ativar`, `voz` | só para blocos novos |
| `js/tutor-analise.js` | lê o espaço de blocos e devolve uma estrutura simples (eventos, sequências, blocos soltos); ajudas `icones/tem/soltoCom` | não |
| `js/tutor-motor.js` | decide *quando* falar (inactividade, teste falhado, calma, correcção, «agora experimenta») | não (afinar tempos) |
| `js/tutor-ui.js` | mostra a mensagem: sprite do pacote, balão, bolinhas do nível, recolher/abrir | não |
| `js/hex.js` | **blocos → MicroPython → .hex** (envio por USB) | só para blocos novos |
| `js/ble.js` | Bluetooth opcional (precisa do programa companheiro no micro:bit) | não |
| `js/app.js` | cola tudo: estado guardado no browser, caminho de desafios, festa, modo gambiarra, botão Enviar | pouco |
| `img/<mascote>/01…08.png` | os estados da mascote | **sim — nova mascote** |
| `vendor/` | Blockly 12.5.1, tradução PT, `microbit-fs.js`, `micropython-v2.js` (firmware) | não |
| `Abrir Faisca.bat` | abre no Chrome/Edge a partir da pasta | não |
| `estados.html?a=<mascote>` | montra dos estados, com exemplos de todas as missões ditos por essa mascote | não |
| `testes/testar.js` | testes automáticos: todas as missões × todas as mascotes + ecrã inicial (headless) | acrescentar os casos da missão |
| `TESTES-GABI.md` | 13 cenários de teste da mascote | acrescentar os novos |

## 4. Como funciona por dentro

```
 criança arrasta blocos ─► Blockly (renderer makecode)
                             │  change (250 ms)
                             ├─► tutor-analise ─► tutor-motor ─► tutor-ui  (a mascote fala)
                             └─► motor.arrancar()
 botões do ecrã / micro:bit ─► motor.acontecimento('agitar'|'logo'|'botao:A'…)
                             └─► executa blocos ─► sim (+ micro:bit por BT) ─► REGISTO
 a cada 400 ms: desafio.ok(REGISTO) ? festa + desbloqueia : —
 botão Enviar ─► hex.js: blocos → main.py → dentro do MicroPython V2 → ficheiro .hex
```

### 4.1 Blocos com aspecto MakeCode (`blocks.js`)
- Renderer `makecode` = subclasse do zelos com as medidas tiradas do renderizador oficial do MakeCode (pxt):
  letra **Consolas 600, 12 pt (16 px)**, cantos, alturas de entradas, «pílulas» brancas para os menus de valor.
- Tema com as cores das categorias do MakeCode: entrada (rosa), básico (azul), ciclos (verde), lógica, música
  (laranja-avermelhado), pinos (vermelho-escuro).
- Blocos actuais: `mk_agitar`, `mk_logo`, `mk_botao` (A/B/A+B), `mk_pino_tocado` (P0/P1), `mk_sempre`,
  `mk_icone` (10 ícones), `mk_limpar`, `mk_pausa`, `mk_repetir`, `mk_se` (se/senão), `mk_escuro`, `mk_botao_premido`,
  `mk_som` (10 sons V2), `mk_tom` (notas Dó–Dó alto, batidas), `mk_digital` (P0/P1/P2), e os menus-sombra
  (`mk_num`, `mk_pausa_menu`, `mk_nota_menu`, `mk_batida_menu`, `mk_som_menu`, `mk_pino_menu`).

### 4.2 Motor e registo (`motor.js`)
- Cada `arrancar()` cria uma **geração**; mudar o programa mata a geração anterior (nada fica a correr às escondidas).
- Um acontecimento não se empilha se o mesmo bloco ainda está a correr (como no micro:bit).
- `mostrar ícone` espera só 20 ms (no MakeCode são 600): sem `pausa` os desenhos passam depressa demais — **é de
  propósito**, é o que o desafio 2 ensina.
- Tudo o que entra e sai vai para o **registo**: `in agitar`, `in botao:A`, `out icone:Happy`, `out som:giggle`,
  `out tom:262`, `out digital:P2:1`. As verificações dos desafios só lêem o registo.

### 4.3 Verificação dos desafios (`desafios.js`)
Ajudas prontas: `depois(registo, entrada, teste)` — houve esta saída até 8 s depois desta entrada?;
`visiveis(registo, entrada, ícone, minMs=120)` — quantas vezes o ícone ficou visível tempo suficiente para se ver;
`algumPino(registo, teste)`. Um desafio é um objecto:

```js
{ titulo: 'Acorda-o',
  missao: 'Faz o micro:bit sorrir quando o agitas.',
  passos: ['Arrasta o bloco «em agitar».', '…'],
  material: 'micro:bit',
  novos: ['mk_agitar', 'mk_icone'],           // entram na caixa a partir deste desafio
  teste: 'agitar',                             // botão que o micro:bit do ecrã destaca
  ok: r => depois(r, 'agitar', s => s.includes('icone:Happy')) }
```

### 4.4 A mascote — motor pedagógico
**Análise** (`tutor-analise.js`): transforma os blocos em `{eventos:[{chave, seq, plano}], soltos}` com ajudas
`evento('agitar')`, `eventosDe('pino:')`, `existe(tipo)`, `vazio()` e uma `assinatura` (muda quando o programa muda).

**Regras** (no pacote, em `tutor` de cada desafio — antes `gabi-regras.js`):
```js
{ boasVindas: ['boas_vindas', 'Olá! …'],
  parecePronto: a => …,               // o programa parece certo → «agora experimenta»
  testar: 'Parece-me bem! Mas só acredito vendo: carrega em AGITAR.',
  regras: [                            // pela ordem; a primeira activa é a que conta
    { id: 'sem_agitar',
      ativa: a => !a.evento('agitar'),
      pistas: [['curiosa', 'nível 1 — pergunta conceptual'],
               ['dica',    'nível 2 — orienta para onde procurar'],
               ['dica',    'nível 3 — diz o gesto concreto']],
      corrigido: 'Boa! Agora o micro:bit já está à escuta.' } ],
  sucesso: 'texto da festa', extensao: 'desafio extra se acabou depressa',
  gambiarra: { xml: '<programa com um erro>', pedido: 'Fiz uma gambiarra… ajudas-me?' } }
```
Mais as **regras comuns** (ex.: blocos soltos) e as **mensagens gerais** (convite, calma, vazio, teste falhado,
obrigada pela gambiarra).

**Quando fala** (`tutor-motor.js`):

| Situação | O que faz | Tempo |
|---|---|---|
| entra num desafio | boas-vindas | — |
| programa parece pronto e ninguém testou | «agora experimenta» (presença ≠ execução) | 7 s |
| teste sem sucesso com dificuldade reconhecida | pista **nível 1** (nunca mais alto sozinha) | 4 s após o teste |
| 3 testes seguidos sem sucesso | estado **calma** («a mim também não funcionou à primeira») | — |
| criança carrega em Ajuda | sobe um nível (1→2→3) na dificuldade activa | — |
| criança resolve sozinha depois de uma pista | **incentivo** específico (`corrigido`) | — |
| parada | convite discreto para pedir ajuda | 45 s |
| acabou depressa (1.ª vez) | festa + **extensão** | < 2 min |
| desafio já feito | botão «gambiarra da Gabi»: carrega um programa com um erro para a criança reparar | — |

Mensagens que a mascote decide sozinha têm pelo menos **15 s** entre si; não repete a mesma frase.

**Apresentação** (`tutor-ui.js`): um sprite por estado (`boas_vindas, curiosa, a_pensar, surpreendida, dica,
celebrar, incentivar, calma`), balão com cor por tipo, 3 bolinhas para o nível da pista. Em ecrã estreito começa
recolhida e mostra só um sinal; abre sozinha apenas quando a criança pediu ajuda.

### 4.5 Envio para o micro:bit (`hex.js`)
- Traduz os blocos para **MicroPython**: cada evento vira uma função; um ciclo `while True` vigia agitar
  (`accelerometer.was_gesture('shake')`), logotipo e pinos (por flanco), botões A/B **ao largar** e A+B quando os dois
  estão carregados (como no MakeCode), e corre o «para sempre».
- Se o P0 for usado como tecla, o som sai só pelo altifalante (`pin=None`) para não interferir.
- O `main.py` é metido dentro do **MicroPython oficial V2** com `@microbit/microbit-fs` (empacotado com esbuild em
  `vendor/microbit-fs.js`). O firmware vem em `vendor/micropython-v2.js` como `window.FAISCA_MICROPYTHON` porque em
  `file://` o `fetch` não funciona; só é carregado quando se carrega em Enviar.
- Janela: **Gravar** (Chrome/Edge: escolhe-se a pasta MICROBIT) ou **Descarregar ficheiro** e arrastar.
- **Só micro:bit V2.**

### 4.6 Bluetooth (opcional)
`ble.js` + programa companheiro (repo `microbit-desafios`). Faz o micro:bit verdadeiro mexer ao vivo e contar para os
desafios. Exige gravar o companheiro em cada placa antes. Em sala, o **.hex por USB é o caminho principal**.

## 5. Testes
- **Desafios:** script em headless Chromium carrega soluções por XML, dispara acontecimentos e confirma `ok()` dos 6.
- **Mascote:** `TESTES-GABI.md` (13 cenários, incluindo o diálogo do desafio 2 do guião).
- **.hex:** gera um programa com todos os blocos, valida a sintaxe do Python e confirma que o `main.py` lido de volta
  do .hex é igual. **Testado num micro:bit V2 verdadeiro (17 Out 2026).** Por testar com placa: piano de fruta
  (P0/P1 ao GND) e A+B.

## 6. Receita — mascote nova ou missão nova

**Missão nova** (ex.: toy hacking, citizen sensing, matemática, natureza):
1. Criar `missoes/<id>.js` (modelo: `missoes/reparar.js`) com `F.registarMissao({ id, titulo, tema, descricao, cor, niveis })`.
   Juntar o `<script>` em `index.html` e `estados.html`; tirar a missão da lista «em preparação» em `js/inicio.js`.
2. Cada desafio: título, missão, passos (≤ 3, para o micro:bit do ecrã caber), material, blocos novos, `ok(registo)`
   e o seu `tutor`. Textos para qualquer mascote: `{ola}`, `[o|a]`, ou `{ nico: '…', gabi: '…', _: '…' }`.
   Regras de escrita: frases curtas; nível 1 pergunta, nível 2 orienta, nível 3 diz o gesto; nunca dar a solução
   inteira; tratar por «tu»; a mascote também se engana (gambiarra).
3. **Blocos novos** (sensores, etc.): `blocks.js` (cor da categoria MakeCode certa), `motor.js` (escrever no registo),
   `sim.js`, `hex.js`, `tutor-analise.js` se as regras precisarem; XML da caixa em `xml` da missão.
4. Testar: casos da missão em `testes/testar.js` e **gravar um .hex num micro:bit verdadeiro**.

**Mascote nova:** `mascotes/<id>.js` com nome, `artigo`, `ola`, `perfil`, `pasta` + `sprites` (estados do motor →
ficheiros), `marca`, `som` (`voz` em Hz, `musica` = tema em `js/som.js`), `comuns` e `gerais` na voz dela;
ilustrações em `img/<id>/` validadas em `estados.html?a=<id>`; tema em `html[data-mascote="<id>"]` no fim do CSS.

**Distribuir:** zip da pasta (abre com `Abrir Faisca.bat`) e online no GitHub Pages. Registar no `CATALOGO-APPS.md`.

### Ideias já levantadas para versões seguintes
- **Sentinela (citizen sensing):** blocos de som, luz e temperatura do micro:bit V2 (e, do kit de citizen sensing,
  humidade do solo, poeiras, distância); a mascote mede o lugar — mapa sensorial da escola, guardiã da horta,
  «onde respiramos pior», limite de barulho decidido pela turma. Registo de dados do micro:bit V2 para tabelas.
- **Toy hacking:** a mascote em peluche com o micro:bit dentro (abraço = interruptor de alumínio e esponja, festa no
  nariz = logotipo, abanar = tonta); brinquedos abertos e medidos com multímetro; o micro:bit «ouve» a sirene ou «vê»
  as luzes do brinquedo sem fios entre os dois (ligar motores exige relé/transístor).
- **Circuitos de massinha** como teclas (massa caseira com sal conduz melhor que a comprada).
- **Estufa gambiarra** (UFV): blocos de solo e relé.
- **Versão Alentejo — Nico, o Podengo do Buinho Educativo** (decisão de 17 Out 2026, registo em `buinho-os`
  `memory/sessoes/2026-10-17_nico-podengo-buinho-educativo.md`): mesma plataforma, conteúdo do Buinho Educativo
  (Messejana, STEAM, natureza, maker, reparação) — **não copiar mecanicamente os desafios da Gabi**. Os 8 estados do
  Nico mapeiam assim nos estados do motor: boas-vindas → `boas_vindas` · curioso → `curiosa` · a pensar → `a_pensar` ·
  surpreendido → `surpreendida` · a dar uma dica → `dica` · a celebrar → `celebrar` · a inventar → `incentivar`
  (ou novo estado para a extensão) · trapalhão/calmo → `calma` e pedido de gambiarra. Atenção ao género nos textos
  (o Nico é «ele»). Sprites finais: 8 PNG RGBA, estilo 4 minimalista aprovado; não usar os GIF/ZIP anteriores.

## 7. Mascotes × missões (desde 17 Out 2026)

- **Escolha:** ecrã inicial com as mascotes (perfil de cada uma) e as missões (tema, níveis, progresso). A mascote
  fica lembrada; cada missão guarda o seu progresso (`faisca.missao.<id>.v1`; os Primeiros passos mantêm
  `faisca.desafios.v1`, para não se perder o que já estava feito). «Missões» no topo volta ao ecrã inicial.
- **Junção:** `F.ativar(mascote, missao)` → `F.DESAFIOS` (desafios de todos os níveis, com `nivel`/`nivelNome`) e
  `F.TUTOR` (pistas da missão + regras comuns e mensagens gerais da mascote). `F.voz()` aplica nome, apresentação e
  género. O motor pedagógico é o mesmo para todos.
- **Níveis:** separador tracejado no caminho do topo; ao passar de nível, «Nível desbloqueado!» e som próprio;
  no fim, «Missão cumprida!» e botão para escolher outra missão.
- **Som:** música de fundo por mascote (Gabi: balanço calmo, quase bossa; Nico: alegre e saltitão), começa no
  primeiro clique, pára com o separador escondido e baixa sozinha quando o micro:bit do ecrã toca. Efeitos: encaixar
  (o clique duplo do MakeCode), tirar da caixa, apagar, voz da mascote, pista, sucesso, nível. Dois botões no topo
  (música / efeitos), lembrados no browser. Tudo sintetizado: sem ficheiros, funciona offline.
- **Enviar:** no Chrome/Edge, «Gravar» direto para a pasta MICROBIT; no Firefox/Safari, «Descarregar» + passos
  para arrastar da pasta Transferências, e a dica de que no Chrome/Edge é direto.
- `F.verif.causou(registo, teste, entrada)`: a saída tem de ter sido **causada** por aquela entrada.

### Missões
- **Primeiros passos** (programação): Nível 1 Acorda-o · Coração a bater · Sim ou não? — Nível 2 Faz barulho ·
  Piano de fruta · Luz de fora — Livre. (Os desafios testados com micro:bit V2 a 16–17 Out.)
- **Reparar** (reparação): Nível 1 **Detetive dos circuitos** (testador de continuidade, 6 dificuldades) —
  Nível 2 **Lanterna remendada** (interruptor novo com A/B e LED no P2; 7 dificuldades: sem botões, trocados, só um
  botão, blocos fora, sem acender, acende-e-apaga, sem apagar, pinos diferentes; gambiarra: o B também acende).
- **Em preparação** (só cartões, sem conteúdo): Toy hacking, Citizen sensing, Matemática, Natureza.

### Mascotes
- **Gabi** — ilustrações aprovadas.
- **Nico** — **sprites provisórios** recortados da prancha aprovada (estilo 4; `img/nico/_referencia-prancha-estilo4.png`,
  que ainda diz «Farrusco», o nome antigo). Faltam os 8 PNG finais em alta resolução (mesmos nomes).

**Testes:** `NODE_PATH=<playwright-core> CHROMIUM=<chromium> node testes/testar.js` — 2 missões × 2 mascotes:
soluções certas passam e erradas não, 3 níveis de pista, gambiarra, .hex, voz com o género certo, regras do detetive
e da lanterna caso a caso, e o ecrã inicial.

**Por fazer:** conteúdo das missões em preparação (validar com os materiais do Buinho Educativo); desafios de bancada
(sem micro:bit a validar) como tipo novo; animação discreta do Nico por camadas (Fase 3); teste com crianças e com
micro:bit verdadeiro (detetive e lanterna).

## 8. Blocos e sensores (desde 17 Out 2026, noite)

Para as missões Toy hacking, Citizen sensing, Matemática, Natureza e o alargamento de Reparar, o motor passou a ter
(sempre com o aspecto e as cores das gavetas do MakeCode, e traduzidos para MicroPython V2 2.1.2):

| Gaveta | Blocos | Registo (o que a validação lê) |
|---|---|---|
| Básico | `no arranque`, `mostrar número`, `mostrar texto` | `numero:N`, `texto:T` |
| Entrada | `em inclinado…/ecrã para baixo/queda livre` (gestos), `em som alto`, `nível de luz`, `nível de som`, `temperatura (°C)`, `tempo de execução (ms)` | entradas `gesto:left`, `somalto`, `luz:V`, `som:V`, `temperatura:V` |
| LED | `acender x y`, `apagar x y`, `desenhar gráfico de barras` | `acender:x,y`, `apagar:x,y`, `grafico:0–25` |
| Variáveis | `definir … para`, `mudar … em`, valor (contador, pontos, medida, recorde, vidas, passos) | `var:nome:valor` |
| Matemática | conta (+ − × ÷), `escolher ao acaso`, `resto de … ÷ …` | — |
| Lógica | comparar (< > = ≤ ≥ ≠), `se … então` (sem senão) | — |
| Pinos | `leitura digital pin`, `leitura analógica pin`, `escrever servo pin … para …` | entradas `digital:P0:1`, `analogico:P1:V`; saída `servo:P0:90` |
| Registo de dados | `registar dados nome = valor` (MicroPython `log`, abre-se no MY_DATA.HTM) | `registo:nome:valor` |

- **Micro:bit do ecrã:** letra 5×5 própria (texto e números a passar), gráfico, LEDs individuais, servo desenhado,
  tabela dos dados registados e as variáveis em pastilhas. Por baixo, **controlos dos sensores** (luz, som + «bater
  palmas», temperatura, pinos analógicos/digitais, gestos) — só aparecem os que a caixa e o programa usam.
- **Registo:** desenhos repetidos por um «para sempre» não se repetem no registo (mas contam sempre depois de uma entrada).
- **Verificação:** `F.verif` ganhou `houve`, `numeros`, `valorDe`, `aposSensor(reg, 'luz', v => v < 40, teste)`.
- **Pistas em série:** `js/pistas.js` — `P.evento`, `P.bloco`, `P.valorEm`, `P.regra` (nível 1 escrito à mão; 2 e 3
  saem do nome e da cor do bloco).
- **Caixa:** cumulativa por defeito; um desafio pode fixá-la com `caixa: [...]` para não crescer demais.
- **Testes:** um ficheiro de casos por missão em `testes/casos/`; `testes/testar.js` valida também que o MicroPython
  gerado é válido; `testes/blocos-novos.js` testa cada bloco novo no ecrã e em Python.

## 9. Estrutura das missões: 3 níveis × 12 (desde 17 Out 2026, noite — pedido do Carlos)

- **Cada nível tem 12 atividades:** 1–6 curtas (aquecer, 5–10 min) · **7–11 projetos complexos de 15–20 min**
  (várias partes, construção física, condição/variável a acertar; a validação só passa com o projeto todo a funcionar) ·
  **12 = projeto livre**, gerado pelo motor (`criarLivres` em `js/desafios.js`).
- **Blocos do projeto livre crescem:** nível 1 → os blocos do nível 1; nível 2 → os dos níveis 1 e 2; último nível →
  **todos os blocos da plataforma** (`F.TODOS_BLOCOS`), numa coluna com secções por gaveta (Básico, Entrada, Música…).
  Textos opcionais por nível em `missao.livres`.
- **Desbloqueio:** acabar o 11.º abre ao mesmo tempo o projeto livre e o nível seguinte (o livre nunca bloqueia).
- **Topo:** separadores «Nível 1 · 2 · 3» e só os 12 passos do nível actual; festa própria ao acabar um nível/missão.
- **Missões (6 × 33 guiadas + 3 livres):** Primeiros passos (os 6 testados no início dos níveis 1 e 2) · Reparar ·
  Toy hacking · Citizen sensing · Matemática · Natureza.
- **Testes:** um caso por atividade guiada (198), cada um com a solução, a gambiarra e outro programa errado, regras
  caso a caso, «parece pronto», Python válido, .hex e voz — 6 missões × 2 mascotes.
- **Para saber:** um texto longo a passar no ecrã bloqueia o botão até acabar (como no micro:bit); as validações
  de sensores só olham para as saídas até à entrada seguinte.
