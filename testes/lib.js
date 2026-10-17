/* Ajudas para escrever programas de teste em XML (Blockly) sem erros.
 *   ev('mk_botao', campos('B','A'), seq(icone('Happy'), tom(262)))
 *   xml(ev(...), ev(...))      — vários eventos (posição automática)
 * Valores: num(5), txt('Olá'), b('mk_luz'), v('contador'), conta(a,'+',b), cmp(a,'<',b), ...
 */
'use strict';
let y = 0;
const campos = (...kv) => { let s = ''; for (let i = 0; i < kv.length; i += 2) s += `<field name="${kv[i]}">${kv[i + 1]}</field>`; return s; };
// valor: string XML de um bloco de valor (ou número → sombra mk_num)
const val = (nome, x) => {
  if (x === undefined || x === null) return '';
  if (typeof x === 'number') return `<value name="${nome}"><shadow type="mk_num"><field name="NUM">${x}</field></shadow></value>`;
  if (typeof x === 'string' && !x.startsWith('<')) return `<value name="${nome}"><shadow type="mk_texto"><field name="TXT">${x}</field></shadow></value>`;
  return `<value name="${nome}">${x}</value>`;
};
const blk = (tipo, interior = '') => `<block type="${tipo}">${interior}</block>`;
const num = n => blk('mk_num', campos('NUM', n));
const txt = t => blk('mk_texto', campos('TXT', t));
const b = tipo => blk(tipo);
const v = nome => blk('mk_var', campos('VAR', nome));
const conta = (a, op, c) => blk('mk_conta', campos('OP', op) + val('A', a) + val('B', c));
const cmp = (a, op, c) => blk('mk_comparar', campos('OP', (op === '=' ? '==' : op).replace('<', '&lt;').replace('>', '&gt;')) + val('A', a) + val('B', c));
const aleatorio = (a, c) => blk('mk_aleatorio', val('A', a) + val('B', c));
const resto = (a, c) => blk('mk_resto', val('A', a) + val('B', c));
const lerD = p => blk('mk_ler_digital', campos('P', p));
const lerA = p => blk('mk_ler_analogico', campos('P', p));
// instruções (devolvem [abertura, fecho] para encadear com seq)
const I = (tipo, interior = '') => [`<block type="${tipo}">${interior}`, '</block>'];
const icone = n => I('mk_icone', campos('I', n));
const limpar = () => I('mk_limpar');
const pausa = ms => I('mk_pausa', `<value name="MS"><shadow type="mk_pausa_menu"><field name="V">${ms}</field></shadow></value>`);
const tom = (f = 262, bat = 1) => I('mk_tom', (typeof f === 'number' ? `<value name="F"><shadow type="mk_nota_menu"><field name="V">${f}</field></shadow></value>` : val('F', f)) + `<value name="BAT"><shadow type="mk_batida_menu"><field name="V">${bat}</field></shadow></value>`);
const som = s => I('mk_som', `<value name="S"><shadow type="mk_som_menu"><field name="V">${s}</field></shadow></value>`);
const digital = (p, x) => I('mk_digital', `<value name="P"><shadow type="mk_pino_menu"><field name="V">${p}</field></shadow></value>` + val('V', x));
const numero = x => I('mk_mostrar_numero', val('N', x));
const texto = t => I('mk_mostrar_texto', val('T', t));
const acender = (x, yy) => I('mk_acender', val('X', x) + val('Y', yy));
const apagar = (x, yy) => I('mk_apagar_led', val('X', x) + val('Y', yy));
const grafico = (x, m = 255) => I('mk_grafico', val('V', x) + val('MAX', m));
const definir = (nome, x) => I('mk_var_definir', campos('VAR', nome) + val('V', x));
const mudar = (nome, x) => I('mk_var_mudar', campos('VAR', nome) + val('V', x));
const servo = (p, a) => I('mk_servo', campos('P', p) + val('A', a));
const registar = (nome, x) => I('mk_registar', val('NOME', nome) + val('V', x));
const repetir = (n, ...corpo) => I('mk_repetir', val('N', n) + `<statement name="DO">${seq(...corpo)}</statement>`);
const se = (c, sim, nao) => I('mk_se', `<value name="C">${c}</value><statement name="SIM">${seq(...(sim || []))}</statement><statement name="NAO">${seq(...(nao || []))}</statement>`);
const seEntao = (c, ...corpo) => I('mk_se_entao', `<value name="C">${c}</value><statement name="SIM">${seq(...corpo)}</statement>`);
// encadeia instruções
function seq(...ins) {
  ins = ins.filter(Boolean);
  if (!ins.length) return '';
  const [a, f] = ins[0];
  const resto_ = seq(...ins.slice(1));
  return a + (resto_ ? `<next>${resto_}</next>` : '') + f;
}
// evento (bloco de topo)
function ev(tipo, camposXml, corpo) {
  y += 160;
  return `<block type="${tipo}" x="40" y="${y}">${camposXml || ''}<statement name="DO">${corpo || ''}</statement></block>`;
}
// atalhos de eventos
const E = {
  botao: (l, c) => ev('mk_botao', l === 'A' ? '' : campos('B', l), c),
  pino: (p, c) => ev('mk_pino_tocado', campos('P', p), c),
  agitar: c => ev('mk_agitar', '', c), logo: c => ev('mk_logo', '', c),
  sempre: c => ev('mk_sempre', '', c), inicio: c => ev('mk_iniciar', '', c),
  gesto: (g, c) => ev('mk_gesto', campos('G', g), c), somalto: c => ev('mk_som_alto', '', c),
};
// bloco solto (ex.: para testar «blocos fora»)
const solto = ins => { y += 160; return ins[0].replace('<block ', `<block x="420" y="${y}" `) + ins[1]; };
function xml(...bs) { y = 0; return '<xml>' + bs.join('') + '</xml>'; }
module.exports = { campos, val, num, txt, b, v, conta, cmp, aleatorio, resto, lerD, lerA, icone, limpar, pausa, tom, som, digital, numero, texto,
  acender, apagar, grafico, definir, mudar, servo, registar, repetir, se, seEntao, seq, ev, E, solto, xml };
