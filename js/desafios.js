/* Faísca Desafios — base dos desafios (comum a todas as missões e mascotes).
 * As missões (missoes/<id>.js) e as mascotes (mascotes/<id>.js) registam-se aqui.
 * Aqui ficam os blocos da caixa, as ajudas de verificação por comportamento,
 * a montagem da caixa de cada desafio e a junção mascote × missão.
 */
(function () {
  'use strict';
  const F = window.Faisca;

  // Blocos tal como aparecem na caixa (com as pílulas de valor já postas)
  const XML = F.XML_CAIXA = {
    mk_agitar: '<block type="mk_agitar"></block>',
    mk_logo: '<block type="mk_logo"></block>',
    mk_botao: '<block type="mk_botao"></block>',
    mk_botao_B: '<block type="mk_botao"><field name="B">B</field></block>',
    mk_botao_AB: '<block type="mk_botao"><field name="B">AB</field></block>',
    mk_pino_tocado: '<block type="mk_pino_tocado"></block>',
    mk_sempre: '<block type="mk_sempre"></block>',
    mk_icone: '<block type="mk_icone"><field name="I">Happy</field></block>',
    mk_icone_coracao: '<block type="mk_icone"><field name="I">Heart</field></block>',
    mk_icone_pequeno: '<block type="mk_icone"><field name="I">SmallHeart</field></block>',
    mk_icone_triste: '<block type="mk_icone"><field name="I">Sad</field></block>',
    mk_icone_sim: '<block type="mk_icone"><field name="I">Yes</field></block>',
    mk_icone_nao: '<block type="mk_icone"><field name="I">No</field></block>',
    mk_icone_surpreendido: '<block type="mk_icone"><field name="I">Surprised</field></block>',
    mk_icone_dormir: '<block type="mk_icone"><field name="I">Asleep</field></block>',
    mk_iniciar: '<block type="mk_iniciar"></block>',
    mk_gesto: '<block type="mk_gesto"><field name="G">left</field></block>',
    mk_gesto_direita: '<block type="mk_gesto"><field name="G">right</field></block>',
    mk_gesto_baixo: '<block type="mk_gesto"><field name="G">face down</field></block>',
    mk_gesto_queda: '<block type="mk_gesto"><field name="G">freefall</field></block>',
    mk_som_alto: '<block type="mk_som_alto"></block>',
    mk_luz: '<block type="mk_luz"></block>',
    mk_som_nivel: '<block type="mk_som_nivel"></block>',
    mk_temperatura: '<block type="mk_temperatura"></block>',
    mk_tempo: '<block type="mk_tempo"></block>',
    mk_mostrar_numero: '<block type="mk_mostrar_numero"><value name="N"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_mostrar_texto: '<block type="mk_mostrar_texto"><value name="T"><shadow type="mk_texto"><field name="TXT">Olá!</field></shadow></value></block>',
    mk_acender: '<block type="mk_acender"><value name="X"><shadow type="mk_num"><field name="NUM">2</field></shadow></value><value name="Y"><shadow type="mk_num"><field name="NUM">2</field></shadow></value></block>',
    mk_apagar_led: '<block type="mk_apagar_led"><value name="X"><shadow type="mk_num"><field name="NUM">2</field></shadow></value><value name="Y"><shadow type="mk_num"><field name="NUM">2</field></shadow></value></block>',
    mk_grafico: '<block type="mk_grafico"><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="MAX"><shadow type="mk_num"><field name="NUM">255</field></shadow></value></block>',
    mk_var_definir: '<block type="mk_var_definir"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_var_mudar: '<block type="mk_var_mudar"><field name="VAR">contador</field><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
    mk_var: '<block type="mk_var"><field name="VAR">contador</field></block>',
    mk_conta: '<block type="mk_conta"><field name="OP">+</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_aleatorio: '<block type="mk_aleatorio"><value name="A"><shadow type="mk_num"><field name="NUM">1</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">6</field></shadow></value></block>',
    mk_resto: '<block type="mk_resto"><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">2</field></shadow></value></block>',
    mk_comparar: '<block type="mk_comparar"><field name="OP">&lt;</field><value name="A"><shadow type="mk_num"><field name="NUM">0</field></shadow></value><value name="B"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_se_entao: '<block type="mk_se_entao"></block>',
    mk_se_senao: '<block type="mk_se"></block>',
    mk_ler_digital: '<block type="mk_ler_digital"><field name="P">P0</field></block>',
    mk_ler_analogico: '<block type="mk_ler_analogico"><field name="P">P1</field></block>',
    mk_servo: '<block type="mk_servo"><field name="P">P0</field><value name="A"><shadow type="mk_num"><field name="NUM">90</field></shadow></value></block>',
    mk_registar: '<block type="mk_registar"><value name="NOME"><shadow type="mk_texto"><field name="TXT">luz</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_tom_livre: '<block type="mk_tom"><value name="F"><shadow type="mk_num"><field name="NUM">440</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">0.25</field></shadow></value></block>',
    mk_digital_p0_1: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P0</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
    mk_digital_p0_0: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P0</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
    mk_limpar: '<block type="mk_limpar"></block>',
    mk_pausa: '<block type="mk_pausa"><value name="MS"><shadow type="mk_pausa_menu"><field name="V">200</field></shadow></value></block>',
    mk_repetir: '<block type="mk_repetir"><value name="N"><shadow type="mk_num"><field name="NUM">4</field></shadow></value></block>',
    mk_se: '<block type="mk_se"><value name="C"><block type="mk_escuro"></block></value></block>',
    mk_escuro: '<block type="mk_escuro"></block>',
    mk_botao_premido: '<block type="mk_botao_premido"></block>',
    mk_som: '<block type="mk_som"><value name="S"><shadow type="mk_som_menu"><field name="V">giggle</field></shadow></value></block>',
    mk_tom: '<block type="mk_tom"><value name="F"><shadow type="mk_nota_menu"><field name="V">262</field></shadow></value><value name="BAT"><shadow type="mk_batida_menu"><field name="V">1</field></shadow></value></block>',
    mk_digital_1: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">1</field></shadow></value></block>',
    mk_digital_0: '<block type="mk_digital"><value name="P"><shadow type="mk_pino_menu"><field name="V">P2</field></shadow></value><value name="V"><shadow type="mk_num"><field name="NUM">0</field></shadow></value></block>',
  };

  // ---------------------------------------------------- verificação
  // registo: [{t, dir:'in'|'out', v}]. «depois(in, saída)» procura uma saída
  // que aconteça até 8 s depois de uma entrada.
  function depois(reg, entrada, teste, janela = 8000) {
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in' || e.v !== entrada) continue;
      const seguintes = [];
      for (let j = i + 1; j < reg.length && reg[j].t - e.t <= janela; j++) if (reg[j].dir === 'out') seguintes.push(reg[j].v);
      if (teste(seguintes)) return true;
    }
    return false;
  }
  const conta = (l, v) => l.filter(x => x === v).length;

  // Quantas vezes um ícone ficou VISÍVEL (pelo menos minMs) depois de uma entrada.
  // Valida o comportamento, não a presença dos blocos.
  function visiveis(reg, entrada, nome, minMs = 120, janela = 15000) {
    let melhor = 0;
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in' || e.v !== entrada) continue;
      const ics = [];
      for (let j = i + 1; j < reg.length && reg[j].t - e.t <= janela; j++) {
        if (reg[j].dir === 'out' && (reg[j].v.startsWith('icone:') || reg[j].v === 'limpar')) ics.push(reg[j]);
      }
      let n = 0;
      ics.forEach((x, k) => {
        const fim = k + 1 < ics.length ? ics[k + 1].t : performance.now();
        if (x.v === 'icone:' + nome && fim - x.t >= minMs) n++;
      });
      melhor = Math.max(melhor, n);
    }
    return melhor;
  }
  const algumPino = (reg, teste) => ['pino:P0', 'pino:P1', 'pino:P2'].some(p => depois(reg, p, teste));

  // Como «depois», mas só conta as saídas até à entrada seguinte: a saída tem de ter
  // sido causada por ESTA entrada (ex.: tocar no pino), não por outra logo a seguir (agitar).
  function causou(reg, teste, entradaOk, janela = 8000) {
    for (let i = 0; i < reg.length; i++) {
      const e = reg[i];
      if (e.dir !== 'in' || !entradaOk(e.v)) continue;
      const seguintes = [];
      for (let j = i + 1; j < reg.length && reg[j].t - e.t <= janela && reg[j].dir === 'out'; j++) seguintes.push(reg[j].v);
      if (teste(seguintes)) return true;
    }
    return false;
  }

  // Caixa de blocos de um desafio: os blocos de todos os desafios até ele
  function caixa(n) {
    const DESAFIOS = F.DESAFIOS;
    const tipos = [];
    // por defeito a caixa é cumulativa; um desafio pode fixar a caixa toda com «caixa: [...]» (para não crescer demais)
    if (DESAFIOS[n].caixa) for (const k of [...DESAFIOS[n].novos, ...DESAFIOS[n].caixa]) { if (!tipos.includes(k)) tipos.push(k); }
    else for (let i = 0; i <= n; i++) for (const k of DESAFIOS[i].novos) if (!tipos.includes(k)) tipos.push(k);
    const novos = new Set(DESAFIOS[n].novos);
    // os novos primeiro, com um separador maior, para se verem logo
    const ordem = [...tipos.filter(t => novos.has(t)), ...tipos.filter(t => !novos.has(t))];
    if (ordem.length > LIMITE_SEM_GAVETAS) return gavetas(ordem.filter(k => XML[k]), novos);
    let xml = '<xml>';
    ordem.forEach((t, i) => {
      xml += XML[t];
      if (i === DESAFIOS[n].novos.length - 1 && ordem.length > novos.size) xml += '<sep gap="40"></sep><label text="Blocos que já conheces"></label>';
    });
    return xml + '</xml>';
  }

  // Muitos blocos → gavetas como no MakeCode (Básico, Entrada, Música…), com os novos numa gaveta própria
  const LIMITE_SEM_GAVETAS = 16;
  const GAVETA_DE = {
    mk_sempre: 'Básico', mk_iniciar: 'Básico', mk_icone: 'Básico', mk_mostrar_numero: 'Básico', mk_mostrar_texto: 'Básico', mk_limpar: 'Básico', mk_pausa: 'Básico',
    mk_agitar: 'Entrada', mk_logo: 'Entrada', mk_botao: 'Entrada', mk_pino_tocado: 'Entrada', mk_gesto: 'Entrada', mk_som_alto: 'Entrada',
    mk_escuro: 'Entrada', mk_botao_premido: 'Entrada', mk_luz: 'Entrada', mk_som_nivel: 'Entrada', mk_temperatura: 'Entrada', mk_tempo: 'Entrada',
    mk_som: 'Música', mk_tom: 'Música', mk_acender: 'LED', mk_apagar_led: 'LED', mk_grafico: 'LED',
    mk_repetir: 'Ciclos', mk_se: 'Lógica', mk_se_entao: 'Lógica', mk_comparar: 'Lógica',
    mk_var_definir: 'Variáveis', mk_var_mudar: 'Variáveis', mk_var: 'Variáveis',
    mk_conta: 'Matemática', mk_aleatorio: 'Matemática', mk_resto: 'Matemática',
    mk_digital: 'Pinos', mk_ler_digital: 'Pinos', mk_ler_analogico: 'Pinos', mk_servo: 'Pinos', mk_registar: 'Registo de dados',
  };
  const CORES_GAVETA = { 'Básico': '#1e90ff', 'Entrada': '#d400d4', 'Música': '#e63022', 'LED': '#5c2d91', 'Ciclos': '#00aa00', 'Lógica': '#00a4a6',
    'Variáveis': '#dc143c', 'Matemática': '#9400d3', 'Pinos': '#b22222', 'Registo de dados': '#378273', 'Novos': '#ffb000' };
  function gavetas(chaves, novos) {
    const tipo = k => (XML[k].match(/type="([a-z_]+)"/) || [])[1];
    const grupos = {};
    if (novos.size) grupos['Novos'] = [...novos].filter(k => XML[k]);
    for (const k of chaves) { if (novos.has(k)) continue; const g = GAVETA_DE[tipo(k)] || 'Básico'; (grupos[g] = grupos[g] || []).push(k); }
    const ordem = ['Novos', 'Básico', 'Entrada', 'Música', 'LED', 'Ciclos', 'Lógica', 'Variáveis', 'Matemática', 'Pinos', 'Registo de dados'];
    // uma só coluna (o Blockly não deixa trocar de caixa simples para caixa com categorias a meio), com secções por gaveta
    let xml = '<xml>';
    for (const g of ordem) if (grupos[g] && grupos[g].length) {
      xml += `<label text="${g === 'Novos' ? 'Blocos novos' : g}" web-class="gaveta gaveta-${g.normalize('NFD').replace(/[^a-zA-Z]/g, '').toLowerCase()}"></label>` + grupos[g].map(k => XML[k]).join('') + '<sep gap="28"></sep>';
    }
    return xml + '</xml>';
  }

  F.caixa = caixa;
  F.gavetas = gavetas;
  // houve(reg, 'numero:') — alguma saída começa por / corresponde a (texto ou RegExp)?
  const houve = (reg, t) => reg.some(e => e.dir === 'out' && (t instanceof RegExp ? t.test(e.v) : e.v.startsWith(t)));
  // números mostrados no ecrã, por ordem
  const numeros = reg => reg.filter(e => e.dir === 'out' && e.v.startsWith('numero:')).map(e => Number(e.v.slice(7)));
  // valor numérico de uma entrada de sensor ('luz:30' → 30)
  const valorDe = v => Number(String(v).split(':').pop());
  // depois de o sensor passar a um valor que cumpre cond(v), as saídas (até à entrada seguinte) cumprem teste?
  //   aposSensor(r, 'luz', v => v < 40, s => s.includes('icone:Asleep'))
  const aposSensor = (reg, sensor, cond, teste) => causou(reg, teste, x => x.startsWith(sensor + ':') && cond(valorDe(x)));
  F.verif = { depois, conta, visiveis, algumPino, causou, houve, numeros, valorDe, aposSensor };

  // ---------------------------------------------------- mascotes e missões
  // MASCOTE = quem acompanha (nome, género, ilustrações, voz, tema, sons).
  // MISSÃO  = o que se faz (níveis → desafios). Cada desafio traz a sua parte pedagógica
  //           em «tutor» (regras, pistas, gambiarra), escrita para servir qualquer mascote.
  // A criança escolhe as duas coisas; o motor junta-as em F.DESAFIOS / F.TUTOR.
  F.MASCOTES = {};
  F.MISSOES = {};
  F.ORDEM_MASCOTES = [];
  F.ORDEM_MISSOES = [];
  F.registarMascote = m => { F.MASCOTES[m.id] = m; F.ORDEM_MASCOTES.push(m.id); };
  // Todos os blocos da plataforma (um de cada tipo) — a caixa do projeto livre do último nível
  F.TODOS_BLOCOS = ['mk_agitar', 'mk_logo', 'mk_botao', 'mk_pino_tocado', 'mk_gesto', 'mk_som_alto', 'mk_iniciar', 'mk_sempre',
    'mk_icone', 'mk_mostrar_numero', 'mk_mostrar_texto', 'mk_limpar', 'mk_pausa', 'mk_acender', 'mk_apagar_led', 'mk_grafico',
    'mk_repetir', 'mk_se_entao', 'mk_se_senao', 'mk_comparar', 'mk_escuro', 'mk_botao_premido',
    'mk_luz', 'mk_som_nivel', 'mk_temperatura', 'mk_tempo', 'mk_var_definir', 'mk_var_mudar', 'mk_var',
    'mk_conta', 'mk_aleatorio', 'mk_resto', 'mk_som', 'mk_tom', 'mk_digital_1', 'mk_ler_digital', 'mk_ler_analogico',
    'mk_servo', 'mk_registar'];
  // Projeto livre no fim de cada nível (o 12.º desafio): gerado aqui, com os blocos a crescer de nível para nível —
  // nível 1: os blocos do nível 1 · nível 2: os dos níveis 1 e 2 · último nível: todos os blocos da plataforma.
  // Textos opcionais por nível em missao.livres = [{ titulo, missao, passos, boasVindas }].
  const LIVRE_TXT = [
    'Projeto livre! Tens os blocos deste nível. Inventa o que quiseres — se precisares de mim, estou aqui.',
    'Projeto livre! Agora tens os blocos dos dois primeiros níveis. Junta-os e inventa algo teu.',
    'Projeto livre, sem limites: tens todos os blocos! Inventa o teu próprio projeto.',
  ];
  function criarLivres(m) {
    // um desafio «livre» escrito à mão passa a dar o texto do livre desse nível
    m.livres = m.livres || [];
    m.niveis.forEach((nv, k) => {
      const l = nv.desafios.find(d => d.livre);
      if (l && !m.livres[k]) m.livres[k] = { titulo: l.titulo, missao: l.missao, passos: l.passos, material: l.material };
      nv.desafios = nv.desafios.filter(d => !d.livre);
    });
    m.niveis = m.niveis.filter(nv => nv.desafios.length);
    const blocos = [];
    m.niveis.forEach((nv, k) => {
      for (const d of nv.desafios) for (const key of [...(d.novos || []), ...(d.caixa || [])]) if (!blocos.includes(key)) blocos.push(key);
      const ultimo = k === m.niveis.length - 1;
      const t = m.livres[k] || {};
      const caixa = ultimo ? F.TODOS_BLOCOS.slice() : blocos.slice();
      nv.desafios.push({
        titulo: t.titulo || 'Projeto livre',
        missao: t.missao || (ultimo ? 'Agora é contigo: inventa um projeto com todos os blocos.' : `Agora é contigo: inventa um projeto com os blocos ${k ? 'dos níveis 1 e 2' : 'do nível 1'}.`),
        passos: t.passos || ['Escolhe uma ideia: um brinquedo, um aparelho, um jogo…', 'Experimenta no micro:bit do ecrã.', 'Envia para o micro:bit e mostra à turma.'],
        material: t.material || 'o que tiveres',
        novos: [], caixa, livre: true, gerado: true, ok: () => false,
        tutor: { boasVindas: ['testar', t.boasVindas || LIVRE_TXT[ultimo ? 2 : Math.min(k, 1)]], parecePronto: () => false, testar: '', regras: [], sucesso: '', extensao: '' },
      });
    });
  }
  F.registarMissao = m => {
    if (m.xml) Object.assign(XML, m.xml);
    criarLivres(m);
    F.MISSOES[m.id] = m; F.ORDEM_MISSOES.push(m.id);
  };
  // desafios de uma missão, por ordem, com o nível de cada um
  F.desafiosDe = missao => missao.niveis.flatMap((nv, k) => nv.desafios.map(d => Object.assign(d, { nivel: k, nivelNome: nv.nome })));

  F.ativar = function (mascoteId, missaoId) {
    const M = F.MASCOTES[mascoteId] || F.MASCOTES[F.ORDEM_MASCOTES[0]];
    const X = F.MISSOES[missaoId];
    F.MASCOTE = M;
    F.MISSAO = X;
    F.DESAFIOS = F.desafiosDe(X);
    F.TUTOR = {
      DESAFIOS: F.DESAFIOS.map(d => d.tutor),
      COMUNS: [...(X.comuns || []), ...(M.comuns || [])],
      GERAIS: M.gerais,
    };
  };

  // Voz da mascote. Um texto pode ser:
  //   'texto'                              igual para todas
  //   { nico: '…', gabi: '…', _: '…' }     um por mascote (_ = as outras)
  // e pode ter: {ola} → apresentação da mascote · [o|a] → masculino|feminino · {nome}
  F.voz = function (t, M = F.MASCOTE) {
    if (t && typeof t === 'object') t = t[M.id] !== undefined ? t[M.id] : t._;
    if (!t) return t;
    return t.replace(/\{ola\}/g, M.ola).replace(/\{nome\}/g, M.nome)
      .replace(/\[([^|\]]*)\|([^\]]*)\]/g, (_, mas, fem) => M.artigo === 'a' ? fem : mas);
  };
})();
