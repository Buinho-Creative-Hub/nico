/* IC Sensing Lab — extensão «Conforto» (gaveta verde do IC). Nova em Out 2026, só existe nesta plataforma.
 *
 * Porquê: a Sensory OLED mede e mostra. O Invisible Cartographies precisa também de:
 *   1. limites PESSOAIS (o mesmo valor é calmo para uma pessoa e demais para outra) — perfil sensorial, incluindo os
 *      perfis-exemplo das personagens das perspetivas, para «medir a mesma sala com os limites de outra pessoa»;
 *   2. detetar o que é SÚBITO, não só o que é alto (secador de mãos, alarme: o que mais custa ao Teo);
 *   3. saídas que NÃO dependem dos olhos (a escola coordenadora é para alunos com deficiência visual): sinais
 *      sonoros suaves e curtos (sem alarmes estridentes) e um «medidor de som» em que a altura da nota segue o valor;
 *   4. dados para o MAPA aberto do projeto: paragens numeradas do percurso (como no Field Protocol) e uma linha de
 *      registo por paragem com ruído, luz e sentir — as mesmas colunas da folha de registo em papel.
 *
 * Simulador: F.Conforto.valor / F.Conforto.executar (chamados pelo js/motor.js).
 * MicroPython: F.Conforto.pyValor / F.Conforto.pyBloco / F.Conforto.PY (chamados pelo js/hex.js).
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  const SENTIDOS = ['ruido', 'luz', 'mov'];
  const DEFEITO = { ruido: 70, luz: 70, mov: 10 };
  // perfis-exemplo das personagens (missoes/perspetivas.js). Ilustrativos: os limites reais são de cada pessoa — pergunta, não adivinhes.
  const PERFIS = {
    eu: DEFEITO,
    ana: { ruido: 55, luz: 70, mov: 10 },   // ouve tudo ao mesmo volume; o eco da sala grande é o mais difícil
    luka: { ruido: 70, luz: 55, mov: 6 },   // os olhos saltam para tudo o que pisca e mexe
    mira: { ruido: 60, luz: 100, mov: 12 }, // ouve as salas; se todos falam ao mesmo tempo perde o mapa
    teo: { ruido: 65, luz: 80, mov: 15 },   // o pior são os sons que não escolhe (usa também «salto súbito»)
    dani: { ruido: 70, luz: 75, mov: 12 },
    nina: { ruido: 75, luz: 80, mov: 15 },  // a amiga da Mira
  };
  const SINAIS = {   // [frequência Hz (0 = silêncio), ms] — curtos e suaves, nada de sirenes
    calma: [[523, 120], [392, 220]],
    atencao: [[659, 110], [0, 70], [659, 110]],
    demais: [[784, 110], [659, 110], [523, 240]],
  };
  const t4 = (en, sr, es, pt) => ({ en, sr, es, pt });
  const sentidoOpcoes = () => [[F.t(t4('noise', 'буке', 'ruido', 'ruído')), 'ruido'], [F.t(t4('light', 'светла', 'luz', 'luz')), 'luz'], [F.t(t4('movement', 'покрета', 'movimiento', 'movimento')), 'mov']];
  const sinalOpcoes = () => [[F.t(t4('calm', 'мирно', 'calma', 'calma')), 'calma'], [F.t(t4('attention', 'пажња', 'atención', 'atenção')), 'atencao'], [F.t(t4('too much', 'превише', 'demasiado', 'demais')), 'demais']];
  const perfilOpcoes = () => [[F.t(t4('me', 'мене', 'mí', 'mim')), 'eu'], ...['ana', 'luka', 'mira', 'teo', 'dani', 'nina'].map(k => [F.PERSPETIVAS && F.PERSPETIVAS[k] ? F.t(F.PERSPETIVAS[k].nome) : k, k])];

  // ------------------------------------------------------------ textos dos blocos (PT aqui; EN/ES/SR na tabela das traduções)
  Object.assign(F.TEXTOS_BLOCOS || {}, {
    cf_perfil: { en: ['use the sensory profile of %1'], es: ['usar el perfil sensorial de %1'], sr: ['користи сензорни профил: %1'],
      tip: { en: 'Sets the noise, light and movement limits at once. The characters’ profiles are examples: real limits are personal — ask, don’t guess.',
        es: 'Define a la vez los límites de ruido, luz y movimiento. Los perfiles de los personajes son ejemplos: los límites reales son personales; pregunta, no adivines.',
        sr: 'Поставља одједном границе буке, светла и покрета. Профили ликова су примери: праве границе су личне — питај, не погађај.' } },
    cf_limite_definir: { en: ['set my %1 limit to %2'], es: ['fijar mi límite de %1 en %2'], sr: ['постави моју границу %1 на %2'],
      tip: { en: 'Your own limit: noise in dB, light in %, movement in moves per minute.', es: 'Tu propio límite: ruido en dB, luz en %, movimiento en movimientos por minuto.', sr: 'Твоја лична граница: бука у dB, светло у %, покрет у покретима у минути.' } },
    cf_limite: { en: ['my %1 limit'], es: ['mi límite de %1'], sr: ['моја граница %1'],
      tip: { en: 'The limit in use right now (from the profile or from «set my limit»).', es: 'El límite que se usa ahora (del perfil o de «fijar mi límite»).', sr: 'Граница која се сада користи (из профила или из «постави моју границу»).' } },
    cf_demais: { en: ['%1 is too much for my %2 limit'], es: ['%1 es demasiado para mi límite de %2'], sr: ['%1 је превише за моју границу %2'],
      tip: { en: 'True when the value goes over your limit.', es: 'Verdadero cuando el valor pasa tu límite.', sr: 'Тачно кад вредност пређе твоју границу.' } },
    cf_zona: { en: ['comfort zone of %1 for my %2 limit'], es: ['zona de confort de %1 para mi límite de %2'], sr: ['зона удобности за %1 и моју границу %2'],
      tip: { en: '1 = comfortable (green), 2 = getting close, 85% of the limit (yellow), 3 = too much (red) — like the dot stickers and the feeling buttons.', es: '1 = cómodo (verde), 2 = cerca, 85 % del límite (amarillo), 3 = demasiado (rojo), como las pegatinas y los botones del sentir.', sr: '1 = удобно (зелено), 2 = близу, 85% границе (жуто), 3 = превише (црвено) — као налепнице и дугмад осећања.' } },
    cf_subito: { en: ['sudden jump in %1 of more than %2'], es: ['salto repentino de %1 de más de %2'], sr: ['нагли скок %1 већи од %2'],
      tip: { en: 'True when the value jumps above what it was in the last seconds — a hand dryer, an alarm, a door slamming. A steady loud sound stops counting as sudden.',
        es: 'Verdadero cuando el valor salta por encima de lo de los últimos segundos: un secador de manos, una alarma, un portazo. Un ruido fuerte constante deja de ser repentino.',
        sr: 'Тачно кад вредност скочи изнад онога што је била последњих секунди — сушач за руке, аларм, лупање вратима. Стално гласан звук престаје да буде нагли.' } },
    cf_sinal: { en: ['gentle signal %1'], es: ['señal suave %1'], sr: ['благ сигнал %1'],
      tip: { en: 'A short, soft sound you can recognise without looking: calm, attention or too much.', es: 'Un sonido corto y suave que reconoces sin mirar: calma, atención o demasiado.', sr: 'Кратак, мек звук који препознаш без гледања: мирно, пажња или превише.' } },
    cf_sonificar: { en: ['play %1 as sound from %2 to %3'], es: ['tocar %1 como sonido de %2 a %3'], sr: ['свирај %1 као звук од %2 до %3'],
      tip: { en: 'A sound gauge: the higher the value, the higher the note. Measure with your ears.', es: 'Un medidor sonoro: cuanto más alto el valor, más aguda la nota. Mide con los oídos.', sr: 'Звучни мерач: што је већа вредност, то је виши тон. Мери ушима.' } },
    cf_paragem_seguinte: { en: ['next stop on the route'], es: ['siguiente parada del recorrido'], sr: ['следеће стајалиште на рути'],
      tip: { en: 'Adds 1 to the stop number (as on the Field Protocol map).', es: 'Suma 1 al número de parada (como en el mapa del Protocolo de campo).', sr: 'Додаје 1 броју стајалишта (као на мапи теренског протокола).' } },
    cf_paragem: { en: ['stop number'], es: ['número de parada'], sr: ['број стајалишта'], tip: { en: 'Which stop of the route you are at (starts at 1).', es: 'En qué parada del recorrido estás (empieza en 1).', sr: 'На ком стајалишту руте си (почиње од 1).' } },
    cf_registar_ponto: { en: ['log stop %1 noise %2 light %3 feeling %4'], es: ['registrar parada %1 ruido %2 luz %3 sentir %4'], sr: ['забележи стајалиште %1 бука %2 светло %3 осећај %4'],
      tip: { en: 'One row in the data log, with the same columns as the paper record sheet. Open MY_DATA.HTM on the micro:bit to see the table.',
        es: 'Una fila en el registro de datos, con las mismas columnas que la hoja de registro en papel. Abre MY_DATA.HTM en el micro:bit para ver la tabla.',
        sr: 'Један ред у бележењу података, са истим колонама као папирни образац. Отвори MY_DATA.HTM на micro:bit-у да видиш табелу.' } },
  });

  // ------------------------------------------------------------ blocos
  const num = n => ({ type: 'input_value', name: n, check: 'Number' });
  const stmt = { previousStatement: null, nextStatement: null, inputsInline: true, style: 'conforto' };
  const dd = (name, fn) => ({ type: 'field_dropdown', name, options: fn });
  Blockly.defineBlocksWithJsonArray(F.traduzirBlocos([
    { type: 'cf_perfil', message0: 'usar o perfil sensorial de %1', args0: [dd('P', perfilOpcoes)], ...stmt,
      tooltip: 'Define de uma vez os limites de ruído, luz e movimento. Os perfis das personagens são exemplos: os limites reais são de cada pessoa — pergunta, não adivinhes.' },
    { type: 'cf_limite_definir', message0: 'definir o meu limite de %1 para %2', args0: [dd('S', sentidoOpcoes), num('V')], ...stmt,
      tooltip: 'O teu limite: ruído em dB, luz em %, movimento em movimentos por minuto.' },
    { type: 'cf_limite', message0: 'o meu limite de %1', args0: [dd('S', sentidoOpcoes)], output: 'Number', style: 'conforto',
      tooltip: 'O limite em uso agora (do perfil ou do «definir o meu limite»).' },
    { type: 'cf_demais', message0: '%1 é demais para o meu limite de %2', args0: [num('V'), dd('S', sentidoOpcoes)], inputsInline: true, output: 'Boolean', style: 'conforto',
      tooltip: 'Verdadeiro quando o valor passa o teu limite.' },
    { type: 'cf_zona', message0: 'zona de conforto de %1 para o meu limite de %2', args0: [num('V'), dd('S', sentidoOpcoes)], inputsInline: true, output: 'Number', style: 'conforto',
      tooltip: '1 = confortável (verde), 2 = quase, 85% do limite (amarelo), 3 = demais (vermelho) — como os autocolantes e os botões do sentir.' },
    { type: 'cf_subito', message0: 'salto súbito de %1 maior do que %2', args0: [num('V'), num('D')], inputsInline: true, output: 'Boolean', style: 'conforto',
      tooltip: 'Verdadeiro quando o valor salta acima do que era nos últimos segundos — um secador de mãos, um alarme, uma porta a bater. Um som alto que continua deixa de contar como súbito.' },
    { type: 'cf_sinal', message0: 'sinal suave %1', args0: [dd('X', sinalOpcoes)], ...stmt,
      tooltip: 'Um som curto e suave que se reconhece sem olhar: calma, atenção ou demais.' },
    { type: 'cf_sonificar', message0: 'tocar %1 como som de %2 até %3', args0: [num('V'), num('MIN'), num('MAX')], ...stmt,
      tooltip: 'Um medidor de som: quanto maior o valor, mais aguda a nota. Mede com os ouvidos.' },
    { type: 'cf_paragem_seguinte', message0: 'paragem seguinte do percurso', ...stmt, tooltip: 'Soma 1 ao número da paragem (como no mapa do Protocolo de campo).' },
    { type: 'cf_paragem', message0: 'número da paragem', output: 'Number', style: 'conforto', tooltip: 'Em que paragem do percurso estás (começa em 1).' },
    { type: 'cf_registar_ponto', message0: 'registar paragem %1 ruído %2 luz %3 sentir %4', args0: [num('P'), num('R'), num('L'), num('S')], ...stmt,
      tooltip: 'Uma linha no registo de dados, com as mesmas colunas da folha de registo em papel. Abre o MY_DATA.HTM no micro:bit para ver a tabela.' },
  ]));

  const n = (k, v) => `<value name="${k}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const ruido = '<block type="mk_kit_ruido"><field name="P">P1</field></block>';
  const luz = '<block type="mk_kit_luz"><field name="P">P2</field></block>';
  F.XML_CONFORTO = {
    cf_perfil: '<block type="cf_perfil"><field name="P">ana</field></block>',
    cf_limite_definir: `<block type="cf_limite_definir"><field name="S">ruido</field>${n('V', 65)}</block>`,
    cf_limite: '<block type="cf_limite"><field name="S">ruido</field></block>',
    cf_demais: `<block type="cf_demais"><value name="V"><shadow type="mk_num"><field name="NUM">60</field></shadow>${ruido}</value><field name="S">ruido</field></block>`,
    cf_zona: `<block type="cf_zona"><value name="V"><shadow type="mk_num"><field name="NUM">60</field></shadow>${ruido}</value><field name="S">ruido</field></block>`,
    cf_subito: `<block type="cf_subito"><value name="V"><shadow type="mk_num"><field name="NUM">60</field></shadow>${ruido}</value>${n('D', 15)}</block>`,
    cf_sinal: '<block type="cf_sinal"><field name="X">atencao</field></block>',
    cf_sonificar: `<block type="cf_sonificar"><value name="V"><shadow type="mk_num"><field name="NUM">60</field></shadow>${ruido}</value>${n('MIN', 40)}${n('MAX', 90)}</block>`,
    cf_paragem_seguinte: '<block type="cf_paragem_seguinte"></block>',
    cf_paragem: '<block type="cf_paragem"></block>',
    cf_registar_ponto: `<block type="cf_registar_ponto"><value name="P"><shadow type="mk_num"><field name="NUM">1</field></shadow><block type="cf_paragem"></block></value>` +
      `<value name="R"><shadow type="mk_num"><field name="NUM">60</field></shadow>${ruido}</value><value name="L"><shadow type="mk_num"><field name="NUM">50</field></shadow>${luz}</value>${n('S', 2)}</block>`,
  };
  F.BLOCOS_CONFORTO = Object.keys(F.XML_CONFORTO);

  // ------------------------------------------------------------ contas (iguais no ecrã e no micro:bit)
  const zona = (v, lim) => v > lim ? 3 : (v >= 0.85 * lim ? 2 : 1);   // 1 verde · 2 amarelo · 3 vermelho
  const nota = (v, mn, mx) => { if (mx === mn) return 440; const f = Math.max(0, Math.min(1, (v - mn) / (mx - mn))); return Math.round(220 + f * 660); };

  F.Conforto = {
    PERFIS, SINAIS, DEFEITO, zona, nota,
    // estado de um programa (o motor cria um novo em cada arranque)
    estado() { return { lim: Object.assign({}, DEFEITO), paragem: 1, base: {} }; },
    valor(m, v) {
      const st = m.cf || (m.cf = this.estado());
      const nn = (k, d = 0) => { const x = Number(m.valor(v, k, d)); return Number.isFinite(x) ? x : d; };
      switch (v.type) {
        case 'cf_limite': return st.lim[v.getFieldValue('S')] ?? 0;
        case 'cf_demais': return nn('V') > (st.lim[v.getFieldValue('S')] ?? 0);
        case 'cf_zona': return zona(nn('V'), st.lim[v.getFieldValue('S')] ?? 0);
        case 'cf_paragem': return st.paragem;
        case 'cf_subito': {
          const x = nn('V'), d = nn('D', 15), agora = performance.now(), b = st.base[v.id];
          if (!b) { st.base[v.id] = [x, agora]; return false; }
          const r = x - b[0] > d;
          b[0] += (x - b[0]) * Math.min(1, (agora - b[1]) / 3000); b[1] = agora;
          return r;
        }
      }
      return undefined;
    },
    async executar(m, b, g) {
      const st = m.cf || (m.cf = this.estado());
      const nn = (k, d = 0) => { const x = Number(m.valor(b, k, d)); return Number.isFinite(x) ? x : d; };
      switch (b.type) {
        case 'cf_perfil': { const p = b.getFieldValue('P'); st.lim = Object.assign({}, PERFIS[p] || DEFEITO); m.registo('out', 'perfil:' + p); break; }
        case 'cf_limite_definir': { const s = b.getFieldValue('S'), x = nn('V'); st.lim[s] = x; m.registo('out', 'limite:' + s + ':' + x); break; }
        case 'cf_sinal': {
          const x = b.getFieldValue('X');
          m.registo('out', 'sinal:' + x);
          for (const [f, ms] of SINAIS[x] || []) { if (f) m.emTodas(s => s.tom && s.tom(f, ms)); await m.esperar(ms, g); }
          break;
        }
        case 'cf_sonificar': {
          const f = nota(nn('V'), nn('MIN', 40), nn('MAX', 90));
          m.emTodas(s => s.tom && s.tom(f, 120));
          m.registo('out', 'sonificar:' + f);
          await m.esperar(120, g);
          break;
        }
        case 'cf_paragem_seguinte': st.paragem += 1; m.registo('out', 'paragem:' + st.paragem); break;
        case 'cf_registar_ponto': {
          const linha = [['col_paragem', nn('P', st.paragem)], ['col_ruido', nn('R')], ['col_luz', nn('L')], ['col_sentir', nn('S')]];
          m.emTodas(s => s.registar && linha.forEach(([k, x]) => s.registar(F.s(k), x)));
          m.registo('out', 'ponto:' + linha.map(x => Math.round(x[1])).join(':'));
          await m.esperar(20, g);
          break;
        }
      }
    },

    // ---------------------------------------------------------- MicroPython
    pyValor(G, v) {
      const e = (k, d = '0') => G.expr(v, k, d);
      G.usa.add('conforto');
      const s = JSON.stringify(v.getFieldValue('S') || 'ruido').replace(/"/g, "'");
      switch (v.type) {
        case 'cf_limite': return `_cfl[${s}]`;
        case 'cf_demais': return `(${e('V')} > _cfl[${s}])`;
        case 'cf_zona': return `cf_zona(${e('V')}, _cfl[${s}])`;
        case 'cf_paragem': return "_cfl['p']";
        case 'cf_subito': G.cfN = (G.cfN || 0) + 1; return `cf_subito(${G.cfN}, ${e('V')}, ${e('D', '15')})`;
      }
      return null;
    },
    pyBloco(G, b, p) {
      G.usa.add('conforto');
      const e = (k, d = '0') => G.expr(b, k, d);
      switch (b.type) {
        case 'cf_perfil': { const k = b.getFieldValue('P'); return [p + `cf_perfil('${PERFIS[k] ? k : 'eu'}')`]; }
        case 'cf_limite_definir': return [p + `_cfl['${SENTIDOS.includes(b.getFieldValue('S')) ? b.getFieldValue('S') : 'ruido'}'] = ${e('V')}`];
        case 'cf_sinal': { const x = b.getFieldValue('X'); return [p + `yield from cf_sinal('${SINAIS[x] ? x : 'calma'}')`]; }
        case 'cf_sonificar': return [p + `yield from _tom(cf_nota(${e('V')}, ${e('MIN', '40')}, ${e('MAX', '90')}), 120)`];
        case 'cf_paragem_seguinte': return [p + "_cfl['p'] += 1"];
        case 'cf_registar_ponto': {
          G.usa.add('log');
          const c = k => "'" + F.semAcentos(F.s(k)).replace(/[^A-Za-z0-9 _-]/g, '') + "'";
          return [p + `log.add({${c('col_paragem')}: ${e('P', "_cfl['p']")}, ${c('col_ruido')}: ${e('R')}, ${c('col_luz')}: ${e('L')}, ${c('col_sentir')}: ${e('S')}})`];
        }
      }
      return null;
    },
    PY: [
      '# ---- extensão Conforto (IC Sensing Lab): limites pessoais, saltos súbitos, sinais suaves, paragens do percurso',
      "_cfl = {'ruido': 70, 'luz': 70, 'mov': 10, 'p': 1}",
      '_CFP = {' + Object.entries(PERFIS).map(([k, v]) => `'${k}': (${v.ruido}, ${v.luz}, ${v.mov})`).join(', ') + '}',
      '_CFS = {' + Object.entries(SINAIS).map(([k, v]) => `'${k}': (${v.map(([f, ms]) => `(${f}, ${ms})`).join(', ')})`).join(', ') + '}',
      '_cfb = {}',
      '',
      'def cf_perfil(k):',
      '    r, l, m = _CFP.get(k, _CFP[\'eu\'])',
      "    _cfl['ruido'] = r",
      "    _cfl['luz'] = l",
      "    _cfl['mov'] = m",
      '',
      'def cf_zona(v, lim):',
      '    if v > lim:',
      '        return 3',
      '    return 2 if v >= 0.85 * lim else 1',
      '',
      'def cf_nota(v, mn, mx):',
      '    if mx == mn:',
      '        return 440',
      '    f = max(0, min(1, (v - mn) / (mx - mn)))',
      '    return int(220 + f * 660 + 0.5)',
      '',
      'def cf_subito(i, v, d):',
      '    now = running_time()',
      '    s = _cfb.get(i)',
      '    if s is None:',
      '        _cfb[i] = [v, now]',
      '        return False',
      '    r = v - s[0] > d',
      '    s[0] = s[0] + (v - s[0]) * min(1, (now - s[1]) / 3000)',
      '    s[1] = now',
      '    return r',
      '',
      'def cf_sinal(k):',
      '    for f, ms in _CFS.get(k, ()):',
      '        if f:',
      '            yield from _tom(f, ms)',
      '        else:',
      '            yield from _espera(ms)',
      '',
    ],
  };
})();
