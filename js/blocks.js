/* Faísca Desafios — blocos com o aspecto do MakeCode.
 *
 * O MakeCode desenha os blocos com um renderer derivado do «zelos» do Blockly
 * (mesmo entalhe, cantos de 4 px, linhas de 48 px, campos-pílula de 32 px).
 * Aqui partimos do zelos e aplicamos o que o distingue, medido no renderizador
 * oficial (makecode.microbit.org, Out 2026): fonte monoespaçada 16 px peso 600,
 * cores das gavetas, números em pílula branca com contorno #bfbfbf.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- renderer
  const MONO = 'Consolas, Monaco, Menlo, "Ubuntu Mono", source-code-pro, monospace';

  class MkConstants extends Blockly.zelos.ConstantProvider {
    constructor() {
      super();
      this.FIELD_TEXT_FONTFAMILY = MONO;
      this.FIELD_TEXT_FONTWEIGHT = '600';
      this.FIELD_TEXT_FONTSIZE = 12; // pt → 16 px, como no MakeCode
    }
  }
  class MkRenderer extends Blockly.zelos.Renderer {
    makeConstants_() { return new MkConstants(); }
  }
  Blockly.blockRendering.register('makecode', MkRenderer);

  // ------------------------------------------------------------------ cores
  // Cores das gavetas do MakeCode (pxt-microbit). Secundária = campos-menu;
  // terciária = contorno.
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v * k));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }
  const GAVETAS = {
    basico:   '#1e90ff',
    entrada:  '#d400d4',
    musica:   '#e63022',
    ciclos:   '#00aa00',
    logica:   '#00a4a6',
    pinos:    '#b22222',
    led:      '#5c2d91',
    variaveis:'#dc143c',
    matematica:'#9400d3',
    registo:  '#378273',
  };
  const blockStyles = {};
  for (const [nome, cor] of Object.entries(GAVETAS)) {
    blockStyles[nome] = { colourPrimary: cor, colourSecondary: shade(cor, 0.85), colourTertiary: shade(cor, 0.75) };
  }
  // Números e valores: pílula branca com contorno cinzento (sombra no MakeCode)
  blockStyles.valor = { colourPrimary: '#ffffff', colourSecondary: '#ffffff', colourTertiary: '#bfbfbf' };

  Blockly.Theme.defineTheme('makecode', {
    name: 'makecode',
    base: Blockly.Themes.Classic,
    blockStyles,
    componentStyles: {
      workspaceBackgroundColour: '#ecf0f1',
      flyoutBackgroundColour: '#ffffff',
      flyoutOpacity: 1,
      scrollbarColour: '#c8cdd2',
      scrollbarOpacity: 0.9,
    },
    fontStyle: { family: MONO, weight: '600', size: 12 },
    startHats: false,
  });

  // ------------------------------------------------------------------ ícones
  const ICONES = {
    Heart:      ['.#.#.', '#####', '#####', '.###.', '..#..'],
    SmallHeart: ['.....', '.#.#.', '.###.', '..#..', '.....'],
    Happy:      ['.....', '.#.#.', '.....', '#...#', '.###.'],
    Sad:        ['.....', '.#.#.', '.....', '.###.', '#...#'],
    Surprised:  ['.#.#.', '.....', '..#..', '.#.#.', '..#..'],
    Asleep:     ['.....', '##.##', '.....', '.###.', '.....'],
    Silly:      ['#...#', '.....', '#####', '...##', '...##'],
    Yes:        ['.....', '....#', '...#.', '#.#..', '.#...'],
    No:         ['#...#', '.#.#.', '..#..', '.#.#.', '#...#'],
    Ghost:      ['#####', '#.#.#', '#####', '#####', '#.#.#'],
  };
  const NOMES_ICONES = {
    Heart: 'coração', SmallHeart: 'coração pequeno', Happy: 'contente', Sad: 'triste',
    Surprised: 'surpreendido', Asleep: 'a dormir', Silly: 'pateta', Yes: 'sim', No: 'não', Ghost: 'fantasma',
  };
  function iconeSvg(nome) {
    const g = ICONES[nome];
    let r = '';
    for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
      const on = g[y][x] === '#';
      r += `<rect x="${x * 6}" y="${y * 6}" width="5" height="5" rx="1" fill="${on ? '#ffffff' : '#000000'}" fill-opacity="${on ? 1 : 0.22}"/>`;
    }
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29">${r}</svg>`);
  }
  const opcoesIcones = Object.keys(ICONES).map(k => [{ src: iconeSvg(k), width: 24, height: 24, alt: NOMES_ICONES[k] }, k]);

  // ------------------------------------------------------------------ sons e notas
  const SONS = [['riso', 'giggle'], ['feliz', 'happy'], ['olá', 'hello'], ['mistério', 'mysterious'],
    ['triste', 'sad'], ['escorregar', 'slide'], ['voar', 'soaring'], ['mola', 'spring'], ['brilho', 'twinkle'], ['bocejo', 'yawn']];
  const NOTAS = [['Dó', '262'], ['Ré', '294'], ['Mi', '330'], ['Fá', '349'], ['Sol', '392'], ['Lá', '440'], ['Si', '494'], ['Dó alto', '523']];

  // ------------------------------------------------------------------ blocos
  const num = (nome) => ({ type: 'input_value', name: nome, check: 'Number' });
  const menu = (nome) => ({ type: 'input_value', name: nome });
  const PAUSAS = [['100', '100'], ['200', '200'], ['300', '300'], ['500', '500'], ['1000', '1000'], ['2000', '2000'], ['3000', '3000'], ['5000', '5000']];
  const BATIDAS = [['1', '1'], ['1/2', '0.5'], ['1/4', '0.25'], ['2', '2'], ['4', '4']];
  // Gestos (como o «em agitar» do MakeCode, com o menu aberto)
  const GESTOS = [['inclinado para a esquerda', 'left'], ['inclinado para a direita', 'right'], ['logotipo para cima', 'up'],
    ['logotipo para baixo', 'down'], ['ecrã para cima', 'face up'], ['ecrã para baixo', 'face down'], ['queda livre', 'freefall']];
  // Variáveis: um conjunto fixo e simples (sem janelas para criar variáveis)
  const VARIAVEIS = [['contador', 'contador'], ['pontos', 'pontos'], ['medida', 'medida'], ['recorde', 'recorde'], ['vidas', 'vidas'], ['passos', 'passos']];
  const PINOS_LER = [['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2']];
  const stmt = { previousStatement: null, nextStatement: null };
  const F_BLOCOS_NOVOS = [
    // ---- eventos
    { type: 'mk_iniciar', message0: 'no arranque', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'basico', tooltip: 'Corre uma vez, quando o micro:bit liga.' },
    { type: 'mk_gesto', message0: 'em %1', args0: [{ type: 'field_dropdown', name: 'G', options: GESTOS }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando o micro:bit faz este movimento.' },
    { type: 'mk_som_alto', message0: 'em som alto', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando o microfone ouve um barulho forte (micro:bit V2).' },
    // ---- sensores (valores)
    { type: 'mk_luz', message0: 'nível de luz', output: 'Number', style: 'entrada', tooltip: 'De 0 (escuro) a 255 (muita luz).' },
    { type: 'mk_som_nivel', message0: 'nível de som', output: 'Number', style: 'entrada', tooltip: 'De 0 (silêncio) a 255 (muito barulho). micro:bit V2.' },
    { type: 'mk_temperatura', message0: 'temperatura (°C)', output: 'Number', style: 'entrada', tooltip: 'Temperatura perto do processador do micro:bit.' },
    { type: 'mk_tempo', message0: 'tempo de execução (ms)', output: 'Number', style: 'entrada', tooltip: 'Milissegundos desde que o programa começou.' },
    // ---- básico
    { type: 'mk_mostrar_numero', message0: 'mostrar número %1', args0: [num('N')], inputsInline: true, ...stmt, style: 'basico', tooltip: 'Mostra um número no ecrã de luzes.' },
    { type: 'mk_mostrar_texto', message0: 'mostrar texto %1', args0: [menu('T')], inputsInline: true, ...stmt, style: 'basico', tooltip: 'Faz passar um texto no ecrã de luzes.' },
    // ---- LED
    { type: 'mk_acender', message0: 'acender x %1 y %2', args0: [num('X'), num('Y')], inputsInline: true, ...stmt, style: 'led', tooltip: 'Acende uma luz. x: coluna (0–4), y: linha (0–4).' },
    { type: 'mk_apagar_led', message0: 'apagar x %1 y %2', args0: [num('X'), num('Y')], inputsInline: true, ...stmt, style: 'led', tooltip: 'Apaga uma luz.' },
    { type: 'mk_grafico', message0: 'desenhar gráfico de barras de %1 até %2', args0: [num('V'), num('MAX')], inputsInline: true, ...stmt, style: 'led', tooltip: 'Quanto maior o valor, mais luzes se acendem.' },
    // ---- variáveis
    { type: 'mk_var_definir', message0: 'definir %1 para %2', args0: [{ type: 'field_dropdown', name: 'VAR', options: VARIAVEIS }, num('V')], inputsInline: true, ...stmt, style: 'variaveis', tooltip: 'Guarda um valor na variável.' },
    { type: 'mk_var_mudar', message0: 'mudar %1 em %2', args0: [{ type: 'field_dropdown', name: 'VAR', options: VARIAVEIS }, num('V')], inputsInline: true, ...stmt, style: 'variaveis', tooltip: 'Soma este valor à variável (usa -1 para tirar).' },
    { type: 'mk_var', message0: '%1', args0: [{ type: 'field_dropdown', name: 'VAR', options: VARIAVEIS }], output: 'Number', style: 'variaveis', tooltip: 'O valor guardado na variável.' },
    // ---- matemática
    { type: 'mk_conta', message0: '%1 %2 %3', args0: [num('A'), { type: 'field_dropdown', name: 'OP', options: [['+', '+'], ['−', '-'], ['×', '*'], ['÷', '/']] }, num('B')],
      inputsInline: true, output: 'Number', style: 'matematica', tooltip: 'Faz uma conta.' },
    { type: 'mk_aleatorio', message0: 'escolher ao acaso de %1 até %2', args0: [num('A'), num('B')], inputsInline: true, output: 'Number', style: 'matematica', tooltip: 'Um número inteiro ao acaso entre os dois (incluídos).' },
    { type: 'mk_resto', message0: 'resto de %1 ÷ %2', args0: [num('A'), num('B')], inputsInline: true, output: 'Number', style: 'matematica', tooltip: 'O que sobra da divisão.' },
    // ---- lógica
    { type: 'mk_comparar', message0: '%1 %2 %3', args0: [num('A'), { type: 'field_dropdown', name: 'OP', options: [['<', '<'], ['>', '>'], ['=', '=='], ['≤', '<='], ['≥', '>='], ['≠', '!=']] }, num('B')],
      inputsInline: true, output: 'Boolean', style: 'logica', tooltip: 'Compara dois números.' },
    { type: 'mk_se_entao', message0: 'se %1 então', args0: [{ type: 'input_value', name: 'C', check: 'Boolean' }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'SIM' }], ...stmt, style: 'logica', tooltip: 'Só faz o que está dentro se a condição for verdadeira.' },
    // ---- pinos
    { type: 'mk_ler_digital', message0: 'leitura digital pin %1', args0: [{ type: 'field_dropdown', name: 'P', options: PINOS_LER }], output: 'Number', style: 'pinos', tooltip: '1 se o circuito estiver fechado, 0 se estiver aberto.' },
    { type: 'mk_ler_analogico', message0: 'leitura analógica pin %1', args0: [{ type: 'field_dropdown', name: 'P', options: PINOS_LER }], output: 'Number', style: 'pinos', tooltip: 'De 0 a 1023: quanto passa de eletricidade.' },
    { type: 'mk_servo', message0: 'escrever servo pin %1 para %2', args0: [{ type: 'field_dropdown', name: 'P', options: [['P0', 'P0'], ['P1', 'P1'], ['P2', 'P2']] }, num('A')], inputsInline: true, ...stmt, style: 'pinos', tooltip: 'Roda o servomotor para este ângulo (0 a 180 graus).' },
    // ---- registo de dados (micro:bit V2)
    { type: 'mk_registar', message0: 'registar dados %1 = %2', args0: [menu('NOME'), num('V')], inputsInline: true, ...stmt, style: 'registo', tooltip: 'Guarda uma linha na tabela de dados do micro:bit (abre o MY_DATA.HTM).' },
    // ---- sombras
    { type: 'mk_texto', message0: '%1', args0: [{ type: 'field_input', name: 'TXT', text: 'Olá!' }], output: 'String', style: 'valor' },
  ];

  Blockly.defineBlocksWithJsonArray([
    // Eventos (gaveta Entrada)
    { type: 'mk_agitar', message0: 'em agitar', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando abanas o micro:bit.' },
    { type: 'mk_logo', message0: 'ao logotipo pressionado', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando tocas no logótipo dourado.' },
    { type: 'mk_botao', message0: 'no botão %1 premido', args0: [{ type: 'field_dropdown', name: 'B', options: [['A', 'A'], ['B', 'B'], ['A+B', 'AB']] }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando carregas no botão.' },
    { type: 'mk_pino_tocado', message0: 'no pin %1 premido', args0: [{ type: 'field_dropdown', name: 'P', options: [['P1', 'P1'], ['P0', 'P0']] }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'entrada', tooltip: 'Corre quando fechas o circuito entre o pin e o GND.' },
    { type: 'mk_sempre', message0: 'para sempre', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], style: 'basico', tooltip: 'Repete sem parar.' },

    // Básico
    { type: 'mk_icone', message0: 'mostrar ícone %1', args0: [{ type: 'field_dropdown', name: 'I', options: opcoesIcones }],
      previousStatement: null, nextStatement: null, style: 'basico', tooltip: 'Desenha um ícone no ecrã de luzes.' },
    { type: 'mk_limpar', message0: 'limpar ecrã', previousStatement: null, nextStatement: null, style: 'basico' },
    { type: 'mk_pausa', message0: 'pausa (ms) %1', args0: [menu('MS')], inputsInline: true,
      previousStatement: null, nextStatement: null, style: 'basico', tooltip: 'Espera. 1000 ms = 1 segundo.' },

    // Ciclos e lógica
    { type: 'mk_repetir', message0: 'repetir %1 vezes', args0: [num('N')], message1: 'fazer %1', args1: [{ type: 'input_statement', name: 'DO' }],
      inputsInline: true, previousStatement: null, nextStatement: null, style: 'ciclos', tooltip: 'Faz o que está dentro várias vezes.' },
    { type: 'mk_se', message0: 'se %1 então', args0: [{ type: 'input_value', name: 'C', check: 'Boolean' }],
      message1: '%1', args1: [{ type: 'input_statement', name: 'SIM' }], message2: 'senão', message3: '%1', args3: [{ type: 'input_statement', name: 'NAO' }],
      previousStatement: null, nextStatement: null, style: 'logica' },
    { type: 'mk_escuro', message0: 'está escuro', output: 'Boolean', style: 'entrada', tooltip: 'Verdadeiro quando há pouca luz.' },
    { type: 'mk_botao_premido', message0: 'botão %1 premido', args0: [{ type: 'field_dropdown', name: 'B', options: [['A', 'A'], ['B', 'B']] }], output: 'Boolean', style: 'entrada' },

    // Música
    { type: 'mk_som', message0: 'tocar som %1', args0: [menu('S')], inputsInline: true,
      previousStatement: null, nextStatement: null, style: 'musica', tooltip: 'Toca um som do micro:bit.' },
    { type: 'mk_tom', message0: 'tocar tom %1 por %2 batida', args0: [menu('F'), menu('BAT')], inputsInline: true,
      previousStatement: null, nextStatement: null, style: 'musica', tooltip: 'Toca uma nota.' },

    // Pinos
    { type: 'mk_digital', message0: 'gravação digital pin %1 para %2', args0: [menu('P'), num('V')], inputsInline: true,
      previousStatement: null, nextStatement: null, style: 'pinos', tooltip: '1 liga, 0 desliga.' },

    // Valores em pílula (sombras, como no MakeCode)
    { type: 'mk_num', message0: '%1', args0: [{ type: 'field_number', name: 'NUM', value: 0 }], output: 'Number', style: 'valor' },
    { type: 'mk_pausa_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: PAUSAS }], output: 'Number', style: 'valor' },
    { type: 'mk_nota_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: NOTAS }], output: 'Number', style: 'valor' },
    { type: 'mk_batida_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: BATIDAS }], output: 'Number', style: 'musica' },
    { type: 'mk_som_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: SONS }], output: null, style: 'musica' },
    { type: 'mk_pino_menu', message0: '%1', args0: [{ type: 'field_dropdown', name: 'V', options: [['P2', 'P2'], ['P0', 'P0'], ['P1', 'P1']] }], output: null, style: 'pinos' },
    ...F_BLOCOS_NOVOS,
  ]);

  window.Faisca = window.Faisca || {};
  Object.assign(window.Faisca, { ICONES, NOMES_ICONES, SONS, NOTAS, GAVETAS, GESTOS, VARIAVEIS, iconeSvg });
})();
