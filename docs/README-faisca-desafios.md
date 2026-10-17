# Faísca · Desafios micro:bit

Editor de blocos do Buinho para quem nunca programou (10+ anos). Os blocos têm o aspecto do MakeCode (mesmas formas, cores das gavetas e letra), mas a caixa só mostra os blocos de cada desafio: **cada desafio feito desbloqueia blocos novos**.

Funciona **sem internet e sem instalar nada**: é só abrir o `index.html` no Chrome ou no Edge (no Windows, duplo clique em `Abrir Faisca.bat`).

> **Como está feita e como fazer outra versão:** [PLATAFORMA-GABI.md](PLATAFORMA-GABI.md)

## Os desafios

| # | Desafio | O que tem de acontecer | Blocos novos | Material |
|---|---|---|---|---|
| 1 | Acorda-o | agitar → cara contente | em agitar · mostrar ícone | micro:bit |
| 2 | Coração a bater | logotipo → coração bate 4 vezes | ao logotipo pressionado · repetir · pausa | micro:bit V2 |
| 3 | Sim ou não? | A contente · B triste | no botão premido | micro:bit |
| 4 | Faz barulho | A+B → som | tocar som | micro:bit V2 |
| 5 | Piano de fruta | tocar no P1 → nota | no pin premido · tocar tom | 2 crocodilos + fruta |
| 6 | Luz de fora | LED no P2 acende com a nota | gravação digital | LED + 2 crocodilos |
| ★ | Inventa | livre | para sempre · se/senão · está escuro · botão premido · limpar ecrã | — |

A Faísca verifica sozinha quando o desafio está cumprido (no micro:bit do ecrã ou no verdadeiro) e abre o seguinte. O progresso fica guardado no browser de cada computador.

**Modo professor:** abrir `index.html?todos=1` desbloqueia todos os desafios.

## A Gabi

A **Gabi, a capivara da gambiarra**, é a tutora: observa o que a criança faz no editor e ajuda sem resolver por ela.

- **Pistas em 3 níveis** (pergunta → onde procurar → passo concreto), por pedido («Ajuda») ou quando um teste não resulta.
- Reconhece blocos em falta, no sítio errado, sequências incompletas e erros típicos de cada desafio; dá os parabéns quando a criança corrige sozinha.
- Distingue ter os blocos de o programa funcionar: os desafios só contam quando o micro:bit faz o que se pede.
- Convite discreto quando a criança está parada; pode ser recolhida a qualquer momento.
- **«Ajudar a Gabi»**: num desafio já feito, a Gabi mostra uma gambiarra dela que não funciona e pede ajuda para a reparar.

Mascotes em `mascotes/`, missões (desafios e pistas) em `missoes/`. Demonstração dos estados em `estados.html` (`estados.html?a=nico` para o Nico). Testes e limitações em `TESTES-GABI.md`; testes automáticos: `node testes/testar.js`.

## micro:bit do ecrã e micro:bit verdadeiro

Os miúdos testam no micro:bit desenhado (botões A, B, A+B, Agitar, logotipo e pinos 0 e 1 são clicáveis). Os desafios são validados aí.

**Enviar para o micro:bit** (botão amarelo, em cima) passa o programa para o micro:bit verdadeiro por cabo USB, sem internet e sem preparar nada antes:

1. ligar o micro:bit ao PC com o cabo USB (aparece a pasta **MICROBIT**);
2. **Gravar** e escolher a pasta MICROBIT (Chrome/Edge); ou **Descarregar ficheiro** e arrastar o `faisca-desafio-N.hex` para a pasta MICROBIT;
3. esperar que a luz amarela pare de piscar.

Por dentro: os blocos são traduzidos para MicroPython (`js/hex.js`) e o `main.py` é metido no MicroPython oficial do micro:bit V2 (`vendor/micropython-v2.js`, com `vendor/microbit-fs.js`). Só funciona em micro:bit **V2** (sons e logotipo tátil).

### Bluetooth (opcional)

Com **Bluetooth**, o mesmo programa mexe ao vivo no micro:bit verdadeiro e os botões, o agitar, o logotipo e os pinos da placa contam para os desafios. Para isso, cada micro:bit V2 tem de ter **uma vez** o programa companheiro: <https://github.com/Buinho-Creative-Hub/microbit-desafios> (instruções no README desse repo; cópia em `microbit/faisca-companheiro.ts`).

## Ficheiros

| Ficheiro | O que é |
|---|---|
| `js/blocks.js` | blocos e o renderer «makecode» (zelos com as medidas do MakeCode) |
| `mascotes/*.js` | quem acompanha: Gabi, Nico (perfil, voz, ilustrações, música) |
| `missoes/*.js` | o conteúdo: missões → níveis → desafios, cada um com as suas pistas |
| `js/escolha.js`, `js/inicio.js` | ecrã inicial: escolher mascote e missão (`index.html?a=nico&m=reparar` vai direto) |
| `js/som.js` | música de fundo e efeitos sonoros (botões para desligar) |
| `js/desafios.js` | base comum: blocos da caixa, verificação por comportamento, junção mascote × missão |
| `js/motor.js` | corre o programa (eventos, repetir, pausas) no ecrã e na placa |
| `js/sim.js` | micro:bit no ecrã e sons |
| `js/ble.js` | ligação Bluetooth ao programa companheiro |
| `js/hex.js` | blocos → MicroPython → ficheiro `.hex` para o micro:bit |
| `js/tutor-*.js` | a mascote (qualquer uma): leitura do programa, motor pedagógico, painel |
| `img/gabi/` | os 8 sprites da Gabi |
| `vendor/` | Blockly 12 (Apache 2.0), local para funcionar offline |

Buinho FabLab · Messejana · CC BY-SA 4.0
