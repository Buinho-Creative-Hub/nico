/* Tutor (mascote) — leitura do programa. Transforma o espaço de blocos numa estrutura simples
 * que as regras pedagógicas conseguem interrogar, sem conhecerem o Blockly.
 * Não tem interface: pode ser testado sozinho.
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};

  const EVENTOS = {
    mk_agitar: () => 'agitar',
    mk_logo: () => 'logo',
    mk_botao: b => 'botao:' + b.getFieldValue('B'),
    mk_pino_tocado: b => 'pino:' + b.getFieldValue('P'),
    mk_sempre: () => 'sempre',
    mk_iniciar: () => 'inicio',
    mk_gesto: b => 'gesto:' + b.getFieldValue('G'),
    mk_som_alto: () => 'somalto',
  };

  function valor(b, nome) {
    const v = b.getInputTargetBlock(nome);
    if (!v) return null;
    if (v.type === 'mk_num') return Number(v.getFieldValue('NUM'));
    if (v.type === 'mk_texto') return v.getFieldValue('TXT');
    if (v.type === 'mk_var') return 'var:' + v.getFieldValue('VAR');
    return v.getFieldValue('V');
  }
  // todos os blocos de valor (sensores, variáveis, contas…) usados dentro de um bloco
  function valores(b, acc = []) {
    for (const inp of b.inputList) {
      if (inp.type !== Blockly.inputs.inputTypes.VALUE) continue;
      const v = inp.connection && inp.connection.targetBlock();
      if (!v) continue;
      if (!v.isShadow() || v.type === 'mk_num' || v.type === 'mk_texto') {
        const d = { tipo: v.type };
        if (v.type === 'mk_var') d.var = v.getFieldValue('VAR');
        if (v.type === 'mk_conta' || v.type === 'mk_comparar') d.op = v.getFieldValue('OP');
        if (v.type === 'mk_num') d.n = Number(v.getFieldValue('NUM'));
        if (v.type === 'mk_ler_digital' || v.type === 'mk_ler_analogico') d.pino = v.getFieldValue('P');
        acc.push(d);
      }
      valores(v, acc);
    }
    return acc;
  }

  // Descreve um bloco de instrução (sem os filhos)
  function descrever(b) {
    const d = { tipo: b.type, id: b.id };
    switch (b.type) {
      case 'mk_icone': d.icone = b.getFieldValue('I'); break;
      case 'mk_pausa': d.ms = Number(valor(b, 'MS')); break;
      case 'mk_repetir': d.n = Number(valor(b, 'N')); break;
      case 'mk_som': d.som = valor(b, 'S'); break;
      case 'mk_tom': d.freq = Number(valor(b, 'F')); break;
      case 'mk_digital': d.pino = valor(b, 'P'); d.v = Number(valor(b, 'V')) ? 1 : 0; break;
      case 'mk_mostrar_numero': d.n = valor(b, 'N'); break;
      case 'mk_mostrar_texto': d.texto = valor(b, 'T'); break;
      case 'mk_acender': case 'mk_apagar_led': d.x = valor(b, 'X'); d.y = valor(b, 'Y'); break;
      case 'mk_grafico': d.max = valor(b, 'MAX'); break;
      case 'mk_var_definir': case 'mk_var_mudar': d.var = b.getFieldValue('VAR'); d.n = valor(b, 'V'); break;
      case 'mk_servo': d.pino = b.getFieldValue('P'); d.angulo = valor(b, 'A'); break;
      case 'mk_registar': d.nome = valor(b, 'NOME'); break;
    }
    // blocos de valor lá dentro (ex.: «mostrar número (nível de luz)» → usa: [{tipo:'mk_luz'}])
    d.usa = valores(b);
    return d;
  }

  // Sequência de instruções a partir de um bloco, com os corpos aninhados
  function sequencia(b) {
    const out = [];
    for (; b; b = b.getNextBlock()) {
      if (!b.isEnabled()) continue;
      const d = descrever(b);
      if (b.type === 'mk_repetir') d.corpo = sequencia(b.getInputTargetBlock('DO'));
      if (b.type === 'mk_se') { d.sim = sequencia(b.getInputTargetBlock('SIM')); d.nao = sequencia(b.getInputTargetBlock('NAO')); }
      if (b.type === 'mk_se_entao') d.sim = sequencia(b.getInputTargetBlock('SIM'));
      out.push(d);
    }
    return out;
  }

  // Lista plana (com profundidade e o bloco que a contém)
  function achatar(seq, dentroDe = null, prof = 0, acc = []) {
    for (const d of seq) {
      acc.push(Object.assign({ dentroDe, prof }, d));
      if (d.corpo) achatar(d.corpo, d.tipo, prof + 1, acc);
      if (d.sim) achatar(d.sim, d.tipo, prof + 1, acc);
      if (d.nao) achatar(d.nao, d.tipo, prof + 1, acc);
    }
    return acc;
  }

  function analisar(ws) {
    const eventos = [];
    const soltos = [];
    for (const top of ws.getTopBlocks(true)) {
      if (top.isShadow()) continue;
      const ev = EVENTOS[top.type];
      if (ev) {
        const seq = sequencia(top.getInputTargetBlock('DO'));
        eventos.push({ chave: ev(top), id: top.id, seq, plano: achatar(seq) });
      } else if (top.previousConnection || top.outputConnection) {
        soltos.push({ tipo: top.type, id: top.id, plano: achatar(sequencia(top)) });
      }
    }
    const a = {
      eventos,
      soltos,
      // ajudas para as regras
      evento(chave) { return eventos.find(e => e.chave === chave) || null; },
      eventosDe(prefixo) { return eventos.filter(e => e.chave.startsWith(prefixo)); },
      todos() { return eventos.flatMap(e => e.plano.map(p => Object.assign({ evento: e.chave }, p))); },
      soltosPlano() { return soltos.flatMap(s => s.plano); },
      existe(tipo) { return this.todos().some(p => p.tipo === tipo) || this.soltosPlano().some(p => p.tipo === tipo); },
      vazio() { return eventos.length === 0 && soltos.length === 0; },
      assinatura: '',
    };
    a.assinatura = JSON.stringify([eventos.map(e => [e.chave, e.plano.map(p => [p.tipo, p.icone, p.ms, p.n, p.som, p.freq, p.pino, p.v, p.prof, p.var, p.x, p.y, p.texto, p.angulo, JSON.stringify(p.usa)])]), soltos.map(s => s.plano.map(p => p.tipo))]);
    return a;
  }

  F.analisar = analisar;

  // Ajudas para as regras das missões (lêem um evento da análise)
  F.ajudasTutor = {
    icones: (ev, nome) => ev ? ev.plano.filter(p => p.tipo === 'mk_icone' && (!nome || p.icone === nome)) : [],
    // tem(ev, tipo): há esse bloco no evento — de instrução OU de valor (sensor, variável, conta…)
    tem: (ev, tipo) => !!ev && ev.plano.some(p => p.tipo === tipo || (p.usa || []).some(u => u.tipo === tipo)),
    // blocos de instrução de um tipo dentro do evento
    blocos: (ev, tipo) => ev ? ev.plano.filter(p => p.tipo === tipo) : [],
    // o bloco de instrução «tipo» tem lá dentro o valor «valorTipo»? (ex.: mostrar número ← nível de luz)
    dentro: (ev, tipo, valorTipo) => !!ev && ev.plano.some(p => p.tipo === tipo && (p.usa || []).some(u => u.tipo === valorTipo)),
    soltoCom: (a, tipo) => a.soltosPlano().some(p => p.tipo === tipo || (p.usa || []).some(u => u.tipo === tipo)),
  };
})();
