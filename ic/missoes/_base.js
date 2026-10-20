/* IC Sensing Lab — ajudas comuns às missões (verificação pelo registo, XML das gambiarras, textos nas 4 línguas).
 *
 *   const { T, V, X } = F.IC;
 *   T(en, sr, es, pt)      texto nas quatro línguas → { en, sr, es, pt } (F.localizar escolhe na altura de registar)
 *   V.*                    verificações pelo COMPORTAMENTO (o registo de entradas/saídas), nunca pela presença de blocos
 *   X.*                    construtores de XML (programas da mascote com um erro, e blocos da caixa)
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const T = (en, sr, es, pt) => ({ en, sr, es, pt });
  const { valorDe } = F.verif;

  // ------------------------------------------------------------ verificações
  // último valor de um sensor antes da posição i do registo (null se ainda não mexeram nele)
  function ultimoSensor(reg, i, sensor) {
    for (let j = i - 1; j >= 0; j--) if (reg[j].dir === 'in' && reg[j].v.startsWith(sensor + ':')) return valorDe(reg[j].v);
    return null;
  }
  // saídas logo a seguir à entrada i (até à entrada seguinte, no máximo 8 s)
  function saidasApos(reg, i, janela = 8000) {
    const s = [];
    for (let j = i + 1; j < reg.length && reg[j].dir === 'out' && reg[j].t - reg[i].t <= janela; j++) s.push(reg[j].v);
    return s;
  }
  function saidasT(reg, i, janela = 12000) {
    const s = [];
    for (let j = i + 1; j < reg.length && reg[j].dir === 'out' && reg[j].t - reg[i].t <= janela; j++) s.push(reg[j]);
    return s;
  }
  // depois de «entrada», o micro:bit fez alguma coisa com o valor que o sensor tinha nesse momento
  function mostrou(reg, entrada, sensor, igual) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      const v = ultimoSensor(reg, i, sensor);
      if (v !== null && saidasApos(reg, i).some(x => igual(x, v))) return true;
    }
    return false;
  }
  // o micro:bit acompanha o sensor: para pelo menos n valores diferentes, a seguir aparece o esperado
  function acompanha(reg, sensor, igual, n = 2) {
    const ok = new Set();
    reg.forEach((e, i) => {
      if (e.dir !== 'in' || !e.v.startsWith(sensor + ':')) return;
      const v = valorDe(e.v);
      if (saidasApos(reg, i).some(x => igual(x, v))) ok.add(v);
    });
    return ok.size >= n;
  }
  // a uma entrada de sensor que cumpre cond(v), segue-se uma saída que cumpre teste(saida) — devolve as saídas que bateram
  function respostas(reg, sensor, cond, filtro) {
    const r = [];
    reg.forEach((e, i) => {
      if (e.dir !== 'in' || !e.v.startsWith(sensor + ':') || !cond(valorDe(e.v))) return;
      const s = saidasApos(reg, i).filter(filtro);
      if (s.length) r.push(s[s.length - 1]);
    });
    return r;
  }
  // depois de uma entrada de sensor acima/abaixo do limite, a resposta é sempre a mesma de cada lado e diferente entre lados
  function doisLados(reg, sensor, limite, filtro) {
    const cima = respostas(reg, sensor, v => v > limite, filtro), baixo = respostas(reg, sensor, v => v < limite, filtro);
    if (!cima.length || !baixo.length) return false;
    const c = new Set(cima), b = new Set(baixo);
    return c.size === 1 && b.size === 1 && [...c][0] !== [...b][0];
  }
  // a seguir a «entrada» (ex.: botao:A), os textos/saídas filtrados dependem da faixa do sensor: devolve { faixa → Set(saídas) }
  function porFaixa(reg, entrada, sensor, faixas, filtro) {
    const m = {};
    reg.forEach((e, i) => {
      if (e.dir !== 'in' || e.v !== entrada) return;
      const v = ultimoSensor(reg, i, sensor);
      if (v === null) return;
      const k = faixas.findIndex(f => v < f);
      const faixa = k < 0 ? faixas.length : k;
      const s = saidasApos(reg, i).filter(filtro);
      if (s.length) (m[faixa] = m[faixa] || new Set()).add(s[s.length - 1]);
    });
    return m;
  }
  // a variável muda «delta» depois de «entrada» e o ecrã mostra o valor novo
  function ajusta(reg, entrada, delta, saidaIgual = (x, v) => x === 'numero:' + v) {
    for (let i = 0; i < reg.length; i++) {
      if (reg[i].dir !== 'in' || reg[i].v !== entrada) continue;
      let antes = null;
      for (let j = i - 1; j >= 0; j--) if (reg[j].dir === 'out' && reg[j].v.startsWith('var:')) { antes = reg[j].v.split(':'); break; }
      if (!antes) continue;
      const nome = antes[1], novo = Number(antes[2]) + delta, s = saidasApos(reg, i);
      if (s.includes('var:' + nome + ':' + novo) && s.some(x => saidaIgual(x, novo))) return true;
    }
    return false;
  }
  // último valor de uma variável antes de i
  function ultimaVar(reg, i, nome) {
    for (let j = i - 1; j >= 0; j--) {
      const e = reg[j];
      if (e.dir !== 'out' || !e.v.startsWith('var:')) continue;
      const [, n] = e.v.split(':');
      if (!nome || n === nome) return { nome: n, v: valorDe(e.v) };
    }
    return null;
  }
  // registos de dados (log) com o nome e o valor
  const registos = reg => reg.filter(e => e.dir === 'out' && e.v.startsWith('registo:')).map(e => {
    const s = e.v.slice(9), k = s.lastIndexOf(':');
    return { t: e.t, nome: s.slice(0, k), v: Number(s.slice(k + 1)) };
  });
  // depois de «entrada», registos de dados feitos (até à entrada seguinte)
  function registosApos(reg, i) {
    const r = [];
    for (let j = i + 1; j < reg.length && reg[j].dir === 'out' && reg[j].t - reg[i].t <= 8000; j++) {
      if (!reg[j].v.startsWith('registo:')) continue;
      const s = reg[j].v.slice(9), k = s.lastIndexOf(':');
      r.push({ nome: s.slice(0, k), v: Number(s.slice(k + 1)) });
    }
    return r;
  }
  const barra = x => x.startsWith('soled:barra:') ? x.split(':').slice(2).map(Number) : null;   // [valor, min, max]
  const grande = x => x.startsWith('soled:grande:') ? Number(x.split(':')[2]) : null;
  const textoOled = x => x.startsWith('soled:texto:') || x.startsWith('soled:escrever:') || x.startsWith('texto:');

  F.IC = {
    T,
    V: { ultimoSensor, saidasApos, saidasT, mostrou, acompanha, respostas, doisLados, porFaixa, ajusta, ultimaVar, registos, registosApos, barra, grande, textoOled },
  };

  // ------------------------------------------------------------ XML (gambiarras e caixa)
  const N = (nome, v) => `<value name="${nome}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const S = (nome, t) => `<value name="${nome}"><shadow type="mk_texto"><field name="TXT">${t}</field></shadow></value>`;
  const VL = (nome, bloco) => `<value name="${nome}">${bloco}</value>`;
  const val = (nome, x) => typeof x === 'number' ? N(nome, x) : (typeof x === 'string' && !x.startsWith('<')) ? S(nome, x) : VL(nome, x);
  const B = t => `<block type="${t}"></block>`;
  const ruido = (p = 'P1') => `<block type="mk_kit_ruido"><field name="P">${p}</field></block>`;
  const luzKit = (p = 'P2') => `<block type="mk_kit_luz"><field name="P">${p}</field></block>`;
  const pir = (p = 'P13') => `<block type="mk_kit_pir"><field name="P">${p}</field></block>`;
  const soPir = (p = 'P13') => `<block type="so_pir"><field name="P">${p}</field></block>`;
  const xVar = n => `<block type="mk_var"><field name="VAR">${n}</field></block>`;
  const op = o => o.replace('<', '&lt;').replace('>', '&gt;');
  const cmp = (a, o, b) => `<block type="mk_comparar"><field name="OP">${op(o === '=' ? '==' : o)}</field>${val('A', a)}${val('B', b)}</block>`;
  const conta = (a, o, b) => `<block type="mk_conta"><field name="OP">${o}</field>${val('A', a)}${val('B', b)}</block>`;
  const media = (x, s = 5, c = 1) => `<block type="so_media">${val('V', x)}${N('S', s)}${N('C', c)}</block>`;
  // instruções abertas (sem o fecho), para encadear com seq
  const I = {
    numero: x => `<block type="mk_mostrar_numero">${val('N', x)}`,
    texto: t => `<block type="mk_mostrar_texto">${val('T', t)}`,
    icone: i => `<block type="mk_icone"><field name="I">${i}</field>`,
    limpar: () => '<block type="mk_limpar">',
    pausa: ms => `<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">${ms}</field></shadow></value>`,
    grafico: (x, m = 255) => `<block type="mk_grafico">${val('V', x)}${N('MAX', m)}`,
    definir: (n, x) => `<block type="mk_var_definir"><field name="VAR">${n}</field>${val('V', x)}`,
    mudar: (n, x) => `<block type="mk_var_mudar"><field name="VAR">${n}</field>${val('V', x)}`,
    registar: (n, x) => `<block type="mk_registar">${S('NOME', n)}${val('V', x)}`,
    digital: (p, v) => `<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">${p}</field></shadow></value>${N('V', v)}`,
    servo: (p, a) => `<block type="mk_servo"><field name="P">${p}</field>${val('A', a)}`,
    tom: (f, bat = '0.25') => `<block type="mk_tom">${typeof f === 'number' ? `<value name="F"><shadow type="mk_nota_menu"><field name="V">${f}</field></shadow></value>` : VL('F', f)}<value name="BAT"><shadow type="mk_batida_menu"><field name="V">${bat}</field></shadow></value>`,
    se: (c, sim, nao) => `<block type="mk_se">${VL('C', c)}<statement name="SIM">${seq(...sim)}</statement><statement name="NAO">${seq(...nao)}</statement>`,
    seEntao: (c, ...corpo) => `<block type="mk_se_entao">${VL('C', c)}<statement name="SIM">${seq(...corpo)}</statement>`,
    repetir: (n, ...corpo) => `<block type="mk_repetir">${N('N', n)}<statement name="DO">${seq(...corpo)}</statement>`,
    // Sensory OLED
    barra: (x, mn, mx, rot = F.s('oled_ruido'), un = 'dB') => `<block type="so_barra">${val('V', x)}${N('MIN', mn)}${N('MAX', mx)}${S('ROT', rot)}${S('UN', un)}`,
    grande: (x, rot = F.s('oled_ruido'), un = 'dB') => `<block type="so_grande">${val('V', x)}${S('ROT', rot)}${S('UN', un)}`,
    soTexto: (t, l = 0) => `<block type="so_texto">${val('T', t)}${N('L', l)}`,
    soLimpar: () => '<block type="so_limpar">',
    atividade: (mov, s = 10, rot = F.s('oled_atividade')) => `<block type="so_atividade">${VL('MOV', mov)}${N('S', s)}${S('ROT', rot)}`,
  };
  function seq(...ins) {
    ins = ins.filter(Boolean);
    return ins.length ? ins[0] + (ins.length > 1 ? `<next>${seq(...ins.slice(1))}</next>` : '') + '</block>' : '';
  }
  let y = 0;
  const ev = (tipo, campos, corpo) => { y += 170; return `<block type="${tipo}" x="40" y="${y}">${campos}<statement name="DO">${corpo}</statement></block>`; };
  const xml = (...bs) => { const r = '<xml>' + bs.join('') + '</xml>'; y = 0; return r; };
  const E = {
    botao: (l, c) => ev('mk_botao', l === 'A' ? '' : `<field name="B">${l}</field>`, c),
    sempre: c => ev('mk_sempre', '', c), inicio: c => ev('mk_iniciar', '', c), logo: c => ev('mk_logo', '', c),
  };
  F.IC.X = { N, S, VL, val, B, ruido, luzKit, pir, soPir, xVar, cmp, conta, media, I, seq, xml, E };
})();
