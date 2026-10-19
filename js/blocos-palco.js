/* Nico · Palco — blocos gráficos (sem micro:bit), com o aspecto do MakeCode Arcade.
 *
 * A «Missão 0» é o palco do Nico e da Gabi: programar atores num cenário, como no Scratch, mas com a forma, a letra
 * e as cores das gavetas do MakeCode Arcade (Sprites azul, Scene cinzento-azulado, Loops verde). Assim a passagem
 * para os desafios do micro:bit (e depois para o MakeCode) é feita com blocos que já se reconhecem.
 * Os blocos de controlo (pausa, repetir…) são os mesmos do resto do Nico (js/blocks.js).
 * O renderer «makecode» vem de js/blocks.js.
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  // Cores das gavetas do MakeCode Arcade (pxt-arcade)
  const COR = F.CORES_PALCO = { atores: '#4b7bec', cenario: '#4b6584', ciclos: '#20bf6b', eventos: '#d54322' };

  // Quem está em cena (os atores falam e mudam de imagem; os objetos só se mexem)
  F.ATORES = [['Nico', 'nico'], ['Gabi', 'gabi']];
  F.OBJETOS = [['bola', 'bola'], ['maçã', 'maca'], ['micro:bit', 'microbit'], ['caixa de ferramentas', 'caixa']];
  // Imagens dos atores: os 8 estados aprovados de cada mascote (sem desenhos novos)
  F.TRAJES = [['olá', 'ola'], ['curiosidade', 'curioso'], ['a pensar', 'pensar'], ['surpresa', 'surpresa'],
    ['uma dica', 'dica'], ['festa', 'festa'], ['ideia', 'ideia'], ['calma', 'calma']];
  F.CENARIOS = [['Rua de Messejana', 'rua'], ['FabLab do Buinho', 'fablab'], ['Montado', 'montado'], ['Horta', 'horta'], ['Palco', 'palco']];
  // Sítios do cenário para onde um ator pode ir (a «bola» é onde a bola estiver)
  F.SITIOS = [['a esquerda', 'esquerda'], ['o meio', 'meio'], ['a direita', 'direita'], ['a porta', 'porta'], ['a bola', 'bola']];

  const ator = { type: 'field_dropdown', name: 'ATOR', options: F.ATORES };
  const stmt = { previousStatement: null, nextStatement: null };

  Blockly.defineBlocksWithJsonArray([
    // ---- eventos (Arcade: «on start» está na gaveta Loops)
    { type: 'pk_comecar', message0: 'ao começar', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }],
      colour: COR.ciclos, tooltip: 'Corre quando carregas em ▶ Começar.' },
    // ---- atores (Arcade: gaveta Sprites)
    { type: 'pk_dizer', message0: '%1 dizer %2 durante %3 s', args0: [ator, { type: 'input_value', name: 'T' }, { type: 'input_value', name: 'S', check: 'Number' }],
      inputsInline: true, ...stmt, colour: COR.atores, tooltip: 'O ator diz uma frase num balão e espera esse tempo.' },
    { type: 'pk_andar', message0: '%1 andar %2 passos para a %3', args0: [ator, { type: 'input_value', name: 'N', check: 'Number' },
      { type: 'field_dropdown', name: 'DIR', options: [['direita', 'direita'], ['esquerda', 'esquerda']] }],
      inputsInline: true, ...stmt, colour: COR.atores, tooltip: 'O ator anda. 1 passo é um pontinho do palco: o palco tem 480 de largura.' },
    { type: 'pk_ir', message0: '%1 ir até %2', args0: [ator, { type: 'field_dropdown', name: 'SITIO', options: F.SITIOS }],
      ...stmt, colour: COR.atores, tooltip: 'O ator anda até esse sítio do cenário.' },
    { type: 'pk_imagem', message0: '%1 mudar imagem para %2', args0: [ator, { type: 'field_dropdown', name: 'TRAJE', options: F.TRAJES }],
      ...stmt, colour: COR.atores, tooltip: 'Muda a cara (a imagem) do ator.' },
    // ---- cenário (Arcade: gaveta Scene)
    { type: 'pk_cenario', message0: 'mudar cenário para %1', args0: [{ type: 'field_dropdown', name: 'CEN', options: F.CENARIOS }],
      ...stmt, colour: COR.cenario, tooltip: 'Troca o fundo do palco.' },
    { type: 'pk_hora', message0: 'mudar para %1', args0: [{ type: 'field_dropdown', name: 'HORA', options: [['a noite', 'noite'], ['o dia', 'dia']] }],
      ...stmt, colour: COR.cenario, tooltip: 'Faz anoitecer ou amanhecer no cenário.' },
    { type: 'pk_segundos', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: [['1', '1'], ['2', '2'], ['3', '3'], ['0.5', '0.5'], ['5', '5']] }],
      output: 'Number', style: 'valor' },
  ]);

  // Blocos tal como aparecem na caixa (com as pílulas já postas)
  const txt = t => `<shadow type="mk_texto"><field name="TXT">${t}</field></shadow>`;
  const n = v => `<shadow type="mk_num"><field name="NUM">${v}</field></shadow>`;
  F.XML_PALCO = {
    pk_comecar: '<block type="pk_comecar"></block>',
    pk_dizer: `<block type="pk_dizer"><field name="ATOR">nico</field><value name="T">${txt('Olá!')}</value><value name="S"><shadow type="pk_segundos"><field name="V">2</field></shadow></value></block>`,
    pk_dizer_gabi: `<block type="pk_dizer"><field name="ATOR">gabi</field><value name="T">${txt('Olá, Nico!')}</value><value name="S"><shadow type="pk_segundos"><field name="V">2</field></shadow></value></block>`,
    pk_andar: `<block type="pk_andar"><field name="ATOR">gabi</field><value name="N">${n(10)}</value></block>`,
    pk_ir: '<block type="pk_ir"><field name="ATOR">nico</field><field name="SITIO">porta</field></block>',
    pk_imagem: '<block type="pk_imagem"><field name="ATOR">nico</field><field name="TRAJE">festa</field></block>',
    pk_cenario: '<block type="pk_cenario"><field name="CEN">fablab</field></block>',
    pk_hora: '<block type="pk_hora"><field name="HORA">noite</field></block>',
    mk_pausa: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">1000</field></shadow></value></block>',
  };
  // Todos os blocos do palco (caixa do projeto livre)
  F.TODOS_PALCO = ['pk_comecar', 'pk_dizer', 'pk_dizer_gabi', 'pk_andar', 'pk_ir', 'pk_imagem', 'pk_cenario', 'pk_hora', 'mk_pausa'];
  // nome do bloco no ecrã + cor (para as pistas da mascote)
  F.NOMES_PALCO = {
    pk_comecar: ['ao começar', 'verde'], pk_dizer: ['dizer … durante', 'azul'], pk_andar: ['andar … passos', 'azul'],
    pk_ir: ['ir até', 'azul'], pk_imagem: ['mudar imagem para', 'azul'], pk_cenario: ['mudar cenário para', 'cinzento-azulado'],
    pk_hora: ['mudar para a noite', 'cinzento-azulado'], mk_pausa: ['pausa (ms)', 'azul-claro'],
  };
})();
