# Nico — desafios micro:bit do Buinho Educativo

**https://nico.buinho.pt**

O **Nico** é uma plataforma de programação por blocos para crianças dos 8 aos 12 anos, feita pelo
[Buinho FabLab](https://buinho.pt) em Messejana (Alentejo). Chama-se Nico em homenagem a um pequeno podengo que
vivia na rua do Buinho.

- **Blocos com o aspecto do MakeCode** (as crianças passam depois para o MakeCode sem estranhar).
- **Mascotes tutoras** — o Nico (podengo) e a Gabi (capivara da gambiarra): dão pistas em 3 níveis sem dar a
  solução, reconhecem os erros mais comuns e às vezes fazem «gambiarras» para a criança reparar.
- **6 missões × 3 níveis × 12 atividades** (216): Primeiros passos, Reparar, Toy hacking, Citizen sensing,
  Matemática e Natureza. Em cada nível: 6 atividades curtas, 5 projetos de 15–20 min e um projeto livre.
- **Missão 0 · O palco do Nico e da Gabi** (sem micro:bit): para quem nunca programou, os atores falam, andam, mudam
  de cara e de cenário (rua de Messejana, FabLab, montado, horta, palco), como no Scratch — mas com blocos com o aspecto
  do **MakeCode Arcade**, para a passagem para o micro:bit ser natural. Abre em `palco.html`. Nível 1 pronto (11 desafios
  + projeto livre); níveis 2 (repetir e reagir) e 3 (decidir) em preparação.
- **Modo livre**: todos os blocos arrumados por categorias, como no MakeCode, incluindo os sensores (ruído, luz,
  PIR, BME280) e o ecrã OLED do **ELECFREAKS Smart Science IoT Kit**, e a extensão **Sensory OLED** do Buinho
  (barra de intensidade, gráfico, número grande, medidor de atividade).
  Botão **«Abrir projeto»**: abre um .hex feito no Nico para retomar e modificar (os blocos vão dentro do .hex).
- **Validação pelo comportamento**: o desafio fica feito quando o micro:bit *faz* o que se pede.
- **micro:bit no ecrã** com sensores simulados (luz, som, temperatura, pinos, gestos) e **envio para o micro:bit
  verdadeiro por USB** (.hex gerado no próprio browser, com MicroPython). **Funciona sem internet.**
- Música e efeitos sonoros, sem contas, sem dados recolhidos, sem IA paga.

### Usar
- Online: https://nico.buinho.pt (`?a=nico` ou `?a=gabi` escolhe a mascote; `&m=reparar` abre uma missão).
- Sem internet: descarregar o repositório (Code → Download ZIP), descompactar e abrir `Abrir Nico.bat`
  (Windows) ou `index.html` no Chrome/Edge.
- Gravar no micro:bit: botão **Enviar** → **Gravar** (Chrome/Edge) ou **Descarregar** e arrastar para a pasta MICROBIT.

### Documentação
`docs/PLATAFORMA.md` (como está feita, como acrescentar missões e mascotes), `docs/TESTES-MASCOTE.md`.
Testes automáticos: `node testes/testar.js`, `node testes/blocos-novos.js` e `node testes/palco.js` (Missão 0) (playwright-core + Chromium).

---

## Nico — micro:bit challenges by Buinho Educativo (EN)

**Nico** is a block-programming platform for children aged 8–12, made by [Buinho FabLab](https://buinho.pt) in
Messejana, Alentejo, Portugal — named after a little podengo dog that lived on our street. MakeCode-looking blocks,
tutor mascots with 3-level hints, 6 missions × 3 levels × 12 activities (216), behaviour-based checking, an on-screen
micro:bit with simulated sensors, and offline .hex generation (MicroPython) to flash a real micro:bit V2 over USB.
Works offline; no accounts, no data collection. Interface and content in European Portuguese.

## Licença / License

Código e conteúdos: **CC BY-NC-SA 4.0** — Buinho FabLab, Messejana, Alentejo, Portugal. Ver `LICENSE`.
Escolas, FabLabs e associações podem usar, adaptar e partilhar, com crédito ao Buinho e na mesma licença,
**sem fins comerciais**. O nome «Nico» e as mascotes (Nico e Gabi) não estão abrangidos pela licença.
Bibliotecas de terceiros em `vendor/` mantêm as suas licenças (Blockly — Apache 2.0; MicroPython para micro:bit e
@microbit/microbit-fs — MIT).
