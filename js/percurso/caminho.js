/* Nico · Percurso 4.º ano — programar o caminho do Nico numa quadrícula (pensamento computacional).
 *
 * Blocos com o aspecto do MakeCode Arcade (como o palco): «ao começar», «andar N casas para norte/sul/este/oeste»,
 * «apanhar», e os blocos do Nico «repetir N vezes» e «se … então» com «o número aqui é par/múltiplo de…».
 * Os pontos cardeais ligam ao Estudo do Meio (orientação, rosa dos ventos); os números a apanhar à Matemática.
 *
 * Validação pelo comportamento: corre o programa, e o desafio fica feito se o Nico chegar à meta e apanhar
 * exatamente o que se pede, sem bater em nada. Menos blocos (≤ maxBlocos) dá 3 estrelas, como no code.org.
 *
 * Atividade: { tipo: 'caminho', missao, cols, rows, inicio: [c, r], meta: [c, r] | null, nomeMeta,
 *              obst: [[c, r, 'arvore'|'pedra'|'agua'|'casa']], itens: [[c, r, 'texto', certo]], blocos: [...], maxBlocos, solucao }
 *   F.PC.caminho.montar(el, atividade, api) · F.PC.caminho.correr(atividade, xml) → resultado (sem animação; testes)
 *   F.PC.caminho.xml(programa)  programa abreviado → XML: [['E', 2], ['ap'], ['rep', 3, [...]], ['se', 'm3', [...]]]
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.PC = F.PC || {};
  const h = (...a) => F.PC.itens.h(...a);
  const COR = { atores: '#4b7bec', ciclos: '#20bf6b' };
  const DIRS = { N: [0, -1], S: [0, 1], E: [1, 0], O: [-1, 0] };
  const NOME_DIR = { N: 'norte', S: 'sul', E: 'este', O: 'oeste' };
  const TESTES = [['par', 'par'], ['ímpar', 'impar'], ['múltiplo de 3', 'm3'], ['múltiplo de 4', 'm4'], ['múltiplo de 5', 'm5'], ['múltiplo de 6', 'm6'], ['múltiplo de 10', 'm10']];
  const testar = (t, n) => ({ par: n % 2 === 0, impar: n % 2 === 1, m3: n % 3 === 0, m4: n % 4 === 0, m5: n % 5 === 0, m6: n % 6 === 0, m10: n % 10 === 0 })[t];

  Blockly.defineBlocksWithJsonArray([
    { type: 'cm_comecar', message0: 'ao começar', message1: '%1', args1: [{ type: 'input_statement', name: 'DO' }], colour: COR.ciclos, tooltip: 'Corre quando carregas em ▶ Começar.' },
    { type: 'cm_andar', message0: 'andar %1 casas para %2', args0: [{ type: 'input_value', name: 'N', check: 'Number' },
      { type: 'field_dropdown', name: 'DIR', options: [['norte ↑', 'N'], ['sul ↓', 'S'], ['este →', 'E'], ['oeste ←', 'O']] }],
      inputsInline: true, previousStatement: null, nextStatement: null, colour: COR.atores, tooltip: 'O Nico anda pela quadrícula. Norte é para cima no mapa.' },
    { type: 'cm_apanhar', message0: 'apanhar', previousStatement: null, nextStatement: null, colour: COR.atores, tooltip: 'Apanha o que estiver na casa onde o Nico está.' },
    { type: 'cm_aqui', message0: 'o número aqui é %1', args0: [{ type: 'field_dropdown', name: 'T', options: TESTES }], output: 'Boolean', style: 'logica',
      tooltip: 'Verdadeiro se na casa do Nico houver um número assim.' },
  ]);

  // ------------------------------------------------------------ XML
  const num = v => `<value name="N"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const CAIXA = {
    andarN: `<block type="cm_andar"><field name="DIR">N</field>${num(1)}</block>`,
    andarS: `<block type="cm_andar"><field name="DIR">S</field>${num(1)}</block>`,
    andarE: `<block type="cm_andar"><field name="DIR">E</field>${num(1)}</block>`,
    andarO: `<block type="cm_andar"><field name="DIR">O</field>${num(1)}</block>`,
    apanhar: '<block type="cm_apanhar"></block>',
    repetir: `<block type="mk_repetir">${num(3)}</block>`,
    se: '<block type="mk_se_entao"></block>',
    aqui: '<block type="cm_aqui"><field name="T">m3</field></block>',
  };
  function xmlProg(p) {
    const um = (b, resto) => {
      const nx = resto ? `<next>${resto}</next>` : '';
      if (DIRS[b[0]]) return `<block type="cm_andar"><field name="DIR">${b[0]}</field>${num(b[1] || 1)}${nx}</block>`;
      if (b[0] === 'ap') return `<block type="cm_apanhar">${nx}</block>`;
      if (b[0] === 'rep') return `<block type="mk_repetir">${num(b[1])}<statement name="DO">${seq(b[2])}</statement>${nx}</block>`;
      if (b[0] === 'se') return `<block type="mk_se_entao"><value name="C"><block type="cm_aqui"><field name="T">${b[1]}</field></block></value><statement name="SIM">${seq(b[2])}</statement>${nx}</block>`;
      return '';
    };
    const seq = l => l.reduceRight((resto, b) => um(b, resto), '');
    return `<xml><block type="cm_comecar" x="30" y="30" deletable="false"><statement name="DO">${seq(p)}</statement></block></xml>`;
  }

  // ------------------------------------------------------------ correr o programa (sem ecrã)
  function numeroDe(b, nome) {
    const v = b.getInputTargetBlock(nome);
    if (!v) return 0;
    if (v.type === 'mk_num') return Math.max(0, Math.floor(Number(v.getFieldValue('NUM')) || 0));
    return 0;
  }
  function simular(at, ws) {
    const st = { c: at.inicio[0], r: at.inicio[1], apanhados: [], passos: 0 };
    const rasto = [{ tipo: 'inicio', c: st.c, r: st.r }];
    const itemEm = (c, r) => at.itens ? at.itens.findIndex(i => i[0] === c && i[1] === r) : -1;
    const obstEm = (c, r) => (at.obst || []).find(o => o[0] === c && o[1] === r);
    let erro = null, contador = 0;
    const LIMITE = 600;
    function corre(b) {
      for (; b && !erro; b = b.getNextBlock()) {
        if (++contador > LIMITE) { erro = { tipo: 'infinito' }; return; }
        if (b.type === 'cm_andar') {
          const [dc, dr] = DIRS[b.getFieldValue('DIR')], n = numeroDe(b, 'N');
          for (let k = 0; k < n && !erro; k++) {
            const c = st.c + dc, r = st.r + dr;
            if (c < 0 || r < 0 || c >= at.cols || r >= at.rows) { erro = { tipo: 'fora', dir: b.getFieldValue('DIR') }; rasto.push({ tipo: 'bater', c: st.c, r: st.r, b: b.id }); return; }
            const o = obstEm(c, r);
            if (o) { erro = { tipo: 'obst', obst: o[2], dir: b.getFieldValue('DIR') }; rasto.push({ tipo: 'bater', c: st.c, r: st.r, para: [c, r], b: b.id }); return; }
            st.c = c; st.r = r; st.passos++;
            rasto.push({ tipo: 'mover', c, r, b: b.id });
          }
        } else if (b.type === 'cm_apanhar') {
          const i = itemEm(st.c, st.r);
          if (i < 0 || st.apanhados.includes(i)) { erro = { tipo: 'nada' }; rasto.push({ tipo: 'nada', c: st.c, r: st.r, b: b.id }); return; }
          st.apanhados.push(i); rasto.push({ tipo: 'apanhar', i, b: b.id, n: st.apanhados.length });
          if (at.itens[i][3] === false) { erro = { tipo: 'errado', item: at.itens[i][2] }; return; }
        } else if (b.type === 'mk_repetir') {
          const n = numeroDe(b, 'N');
          for (let k = 0; k < n && !erro; k++) { rasto.push({ tipo: 'volta', b: b.id, k: k + 1, n }); corre(b.getInputTargetBlock('DO')); }
        } else if (b.type === 'mk_se_entao') {
          const v = cond(b.getInputTargetBlock('C'));
          rasto.push({ tipo: 'teste', b: b.id, v, txt: b.getInputTargetBlock('C') ? b.getInputTargetBlock('C').getField('T').getText() : '' });
          if (v) corre(b.getInputTargetBlock('SIM'));
        }
      }
    }
    function cond(b) {
      if (!b) return false;
      if (b.type === 'cm_aqui') { const i = itemEm(st.c, st.r); if (i < 0 || st.apanhados.includes(i)) return false; const n = Number(at.itens[i][2]); return isFinite(n) && testar(b.getFieldValue('T'), n); }
      return false;
    }
    const topo = ws.getTopBlocks(false).find(b => b.type === 'cm_comecar');
    if (topo) corre(topo.getInputTargetBlock('DO'));
    // avaliar
    const devia = (at.itens || []).map((it, i) => it[3] !== false ? i : -1).filter(i => i >= 0);
    const faltam = devia.filter(i => !st.apanhados.includes(i));
    const naMeta = !at.meta || (st.c === at.meta[0] && st.r === at.meta[1]);
    const blocos = ws.getAllBlocks(false).filter(b => !b.isShadow() && b.type !== 'cm_comecar').length;
    const soltos = ws.getTopBlocks(false).filter(b => b.type !== 'cm_comecar').length;
    const ok = !erro && !faltam.length && naMeta && !!topo;
    return { ok, erro, faltam, naMeta, rasto, blocos, soltos, estrelas: ok ? (!at.maxBlocos || blocos <= at.maxBlocos ? 3 : 2) : 0, final: [st.c, st.r] };
  }
  // para os testes: corre um XML numa área sem ecrã
  function correr(at, xml) {
    const ws = new Blockly.Workspace();
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(xml), ws);
    const r = simular(at, ws); ws.dispose(); return r;
  }

  // ------------------------------------------------------------ desenhar a quadrícula
  const S = 64;
  function desenharObst(t, x, y) {
    if (t === 'arvore') return `<g transform="translate(${x},${y})"><rect x="28" y="36" width="8" height="20" fill="#6b4a22"/><circle cx="32" cy="28" r="20" fill="#3f7d3a"/><circle cx="22" cy="32" r="12" fill="#4f9a48"/><circle cx="42" cy="30" r="12" fill="#4f9a48"/></g>`;
    if (t === 'pedra') return `<g transform="translate(${x},${y})"><ellipse cx="32" cy="40" rx="22" ry="15" fill="#8d8d8d"/><ellipse cx="27" cy="35" rx="9" ry="5" fill="#b0b0b0"/></g>`;
    if (t === 'agua') return `<g transform="translate(${x},${y})"><rect x="1" y="1" width="62" height="62" fill="#5aa9e6"/><path d="M8 24q8-6 16 0t16 0t16 0M8 42q8-6 16 0t16 0t16 0" stroke="#d8efff" stroke-width="3" fill="none"/></g>`;
    if (t === 'casa') return `<g transform="translate(${x},${y})"><rect x="12" y="28" width="40" height="28" fill="#f4efe3" stroke="#555"/><path d="M8 30 32 10 56 30z" fill="#c4553a"/><rect x="28" y="40" width="9" height="16" fill="#6b4a22"/></g>`;
    return '';
  }
  function svgGrelha(at, M) {
    const W = at.cols * S, H = at.rows * S;
    let g = `<rect width="${W}" height="${H}" fill="${at.fundo || '#cfe6a8'}"/>`;
    for (let c = 0; c <= at.cols; c++) g += `<line x1="${c * S}" x2="${c * S}" y1="0" y2="${H}" stroke="#ffffff" stroke-opacity=".7"/>`;
    for (let r = 0; r <= at.rows; r++) g += `<line y1="${r * S}" y2="${r * S}" x1="0" x2="${W}" stroke="#ffffff" stroke-opacity=".7"/>`;
    (at.obst || []).forEach(([c, r, t]) => { g += desenharObst(t, c * S, r * S); });
    if (at.meta) {
      const [c, r] = at.meta;
      g += `<g transform="translate(${c * S},${r * S})"><rect x="3" y="3" width="58" height="58" rx="6" fill="#fff6dc" stroke="#ffc850" stroke-width="4"/>` +
        `<path d="M22 50V12" stroke="#111" stroke-width="3"/><path d="M23 13h22l-6 7 6 7H23z" fill="#ff5050"/>` +
        (at.nomeMeta ? `<text x="32" y="60" text-anchor="middle" font-size="11" font-weight="700" fill="#111">${at.nomeMeta}</text>` : '') + '</g>';
    }
    (at.itens || []).forEach(([c, r, v], i) => {
      g += `<g class="cm-item" data-i="${i}" transform="translate(${c * S},${r * S})"><circle cx="32" cy="32" r="22" fill="#fff" stroke="#7b2fd1" stroke-width="4"/>` +
        `<text x="32" y="${String(v).length > 3 ? 37 : 39}" text-anchor="middle" font-size="${String(v).length > 3 ? 13 : 19}" font-weight="700" fill="#111">${v}</text></g>`;
    });
    const [c0, r0] = at.inicio;
    g += `<g class="cm-nico" style="transform:translate(${c0 * S}px,${r0 * S}px)"><image href="${M}" x="4" y="0" width="56" height="62" preserveAspectRatio="xMidYMax meet"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" font-family="Asap, sans-serif">${g}</svg>`;
  }
  const ROSA = '<svg viewBox="0 0 96 96" width="88" aria-label="Rosa dos ventos: norte para cima"><circle cx="48" cy="48" r="30" fill="#fff" stroke="#111" stroke-width="2"/>' +
    '<path d="M48 20 54 48 48 76 42 48z" fill="#111"/><path d="M48 20 54 48 42 48z" fill="#ff5050"/><path d="M20 48 48 42 76 48 48 54z" fill="#9a9a9a"/>' +
    '<text x="48" y="14" text-anchor="middle" font-size="13" font-weight="700">N</text><text x="48" y="94" text-anchor="middle" font-size="13" font-weight="700">S</text>' +
    '<text x="88" y="52" text-anchor="middle" font-size="13" font-weight="700">E</text><text x="8" y="52" text-anchor="middle" font-size="13" font-weight="700">O</text></svg>';

  // ------------------------------------------------------------ mensagens da mascote
  const NOMES_OBST = { arvore: 'num sobreiro', pedra: 'numa pedra', agua: 'na água', casa: 'numa casa' };
  function explicar(r, at) {
    if (r.erro) {
      if (r.erro.tipo === 'obst') return ['surpreendida', `Ai! Ia ${NOMES_OBST[r.erro.obst] ? 'bater ' + NOMES_OBST[r.erro.obst] : 'bater'} a ${NOME_DIR[r.erro.dir]}. Conta as casas outra vez.`];
      if (r.erro.tipo === 'fora') return ['surpreendida', `Ups! Para ${NOME_DIR[r.erro.dir]} já não há caminho: ia sair do mapa.`];
      if (r.erro.tipo === 'nada') return ['a_pensar', 'Mandaste-me apanhar, mas aqui não há nada para apanhar. Onde é que eu estava?'];
      if (r.erro.tipo === 'errado') return ['a_pensar', `Apanhei o ${r.erro.item}… mas esse não era para apanhar! ${at.porque || 'Lê outra vez a missão.'}`];
      if (r.erro.tipo === 'infinito') return ['calma', 'Estou a andar há tanto tempo… o programa nunca mais acaba! Vê os números dos «repetir».'];
    }
    if (!r.rasto.some(x => x.tipo !== 'inicio') && r.soltos) return ['a_pensar', 'Os blocos têm de estar encaixados dentro do «ao começar», como peças de puzzle.'];
    if (r.faltam.length) return ['a_pensar', r.faltam.length === 1 ? 'Ainda falta apanhar uma coisa.' : `Ainda faltam apanhar ${r.faltam.length} coisas.`];
    if (!r.naMeta) return ['a_pensar', `Parei antes de chegar ${at.nomeMeta ? 'à ' + at.nomeMeta.toLowerCase() : 'à bandeira'}. Quantas casas faltam, e para onde?`];
    return ['a_pensar', 'Ainda não é bem isto. Experimenta outra vez!'];
  }

  // ------------------------------------------------------------ montar no ecrã
  function montar(el, at, api) {
    el.innerHTML = '';
    const M = 'img/nico/01_boas_vindas.png';   // quem anda no mapa é sempre o Nico (a mascote escolhida é quem ajuda)
    const grelha = h('div', { class: 'cm-grelha', html: svgGrelha(at, M) });
    const btnIr = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '▶ Começar');
    const btnRep = h('button', { type: 'button', class: 'btn btn-texto' }, '↺ Voltar ao início');
    const nBlocos = h('span', { class: 'cm-blocos-n' });
    const areaB = h('div');
    let aCorrer = false, tentativas = 0;
    el.append(h('div', { class: 'cm' },
      h('div', { class: 'cm-esq' },
        h('div', { class: 'cm-missao' }, at.missao),
        h('div', { style: 'display:flex;gap:12px;align-items:flex-start' }, grelha, h('div', { html: ROSA })),
        h('div', { class: 'cm-comandos' }, btnIr, btnRep, nBlocos)),
      h('div', { class: 'cm-blocos' }, areaB)));
    const caixa = `<xml>${(at.blocos || ['andarN', 'andarS', 'andarE', 'andarO']).map(k => CAIXA[k]).join('')}</xml>`;
    const ws = Blockly.inject(areaB, {
      renderer: 'makecode', theme: 'makecode', media: 'vendor/media/', toolbox: caixa, trashcan: true, sounds: false,
      zoom: { controls: true, wheel: false, startScale: 0.95, maxScale: 1.6, minScale: 0.6 }, move: { scrollbars: true, drag: true, wheel: true },
    });
    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(at.inicial ? xmlProg(at.inicial) : xmlProg([])), ws);
    const contar = () => {
      const n = ws.getAllBlocks(false).filter(b => !b.isShadow() && b.type !== 'cm_comecar').length;
      nBlocos.textContent = `Blocos: ${n}` + (at.maxBlocos ? ` · consegues com ${at.maxBlocos} ou menos?` : '');
    };
    const MUDA = [Blockly.Events.BLOCK_CREATE, Blockly.Events.BLOCK_DELETE, Blockly.Events.BLOCK_CHANGE, Blockly.Events.BLOCK_MOVE];
    ws.addChangeListener(ev => { if (!ev.isUiEvent && MUDA.includes(ev.type)) { contar(); if (!aCorrer) repor(); } });
    contar();
    const ro = new ResizeObserver(() => Blockly.svgResize(ws)); ro.observe(areaB);

    const nico = () => grelha.querySelector('.cm-nico');
    const estadoEl = h('div', { class: 'cm-estado', 'aria-live': 'polite' });
    const btnPasso = h('button', { type: 'button', class: 'btn btn-texto' }, '👣 Um passo');
    el.querySelector('.cm-comandos').insertBefore(btnPasso, btnRep);
    el.querySelector('.cm-comandos').after(estadoEl);
    let exec = null, previsao = null, previsoes = 0, previsoesCertas = 0;
    function repor() {
      const [c, r] = at.inicio;
      nico().style.transform = `translate(${c * S}px,${r * S}px)`;
      grelha.querySelectorAll('.cm-item').forEach(i => { i.style.opacity = 1; });
      ws.highlightBlock(null);
      exec = null; estadoEl.textContent = '';
    }
    // prever: clicar na casa onde se acha que o Nico vai parar (Lightbot/code.org: prever → executar → corrigir)
    const svgG = grelha.querySelector('svg');
    const marca = svgEl('g', { class: 'cm-previsao' }); marca.style.display = 'none';
    marca.innerHTML = `<circle cx="32" cy="32" r="26" fill="none" stroke="#d6336c" stroke-width="5" stroke-dasharray="7 5"/><text x="32" y="38" text-anchor="middle" font-size="18" font-weight="700" fill="#d6336c">?</text>`;
    svgG.append(marca);
    svgG.addEventListener('click', ev => {
      if (aCorrer || !at.prever) return;
      const pt = svgG.createSVGPoint(); pt.x = ev.clientX; pt.y = ev.clientY;
      const q = pt.matrixTransform(svgG.getScreenCTM().inverse());
      previsao = [Math.floor(q.x / S), Math.floor(q.y / S)];
      marca.setAttribute('transform', `translate(${previsao[0] * S},${previsao[1] * S})`); marca.style.display = '';
      api.dizer('curiosa', 'Previsão marcada! Agora carrega em ▶ Começar ou vai 👣 passo a passo e vê se acertaste.');
    });
    // um passo do rasto: mexe o Nico, destaca o bloco que está a correr e mostra o estado
    async function darPasso(p, lento) {
      if (p.b) ws.highlightBlock(p.b);
      if (p.tipo === 'mover') { nico().style.transform = `translate(${p.c * S}px,${p.r * S}px)`; if (F.Som) F.Som.tocar('clique'); estadoEl.textContent = `O Nico está na casa (${p.c + 1}, ${p.r + 1}).`; }
      else if (p.tipo === 'apanhar') { const it = grelha.querySelector(`.cm-item[data-i="${p.i}"]`); if (it) it.style.opacity = 0.15; if (F.Som) F.Som.tocar('apanhar'); estadoEl.textContent = `Apanhou ${at.itens[p.i][2]} · já tem ${p.n}.`; }
      else if (p.tipo === 'teste') estadoEl.textContent = `se o número aqui é ${p.txt} → ${p.v ? 'verdadeiro: faz o que está dentro' : 'falso: salta'}`;
      else if (p.tipo === 'volta') estadoEl.textContent = `repetir: volta ${p.k} de ${p.n}`;
      else if (p.tipo === 'bater' || p.tipo === 'nada') { const n = nico().querySelector('image'); n.classList.remove('cm-toque'); void n.getBoundingClientRect(); n.classList.add('cm-toque'); if (F.Som) F.Som.tocar('apagar'); }
      await espera(lento ? ({ mover: 300, apanhar: 250, bater: 450, nada: 450 }[p.tipo] || 120) : 0);
    }
    function acabar(r) {
      ws.highlightBlock(null);
      let nota = '';
      if (previsao) {
        previsoes++;
        const certo = previsao[0] === r.final[0] && previsao[1] === r.final[1];
        if (certo) previsoesCertas++;
        nota = certo ? ' E previste bem onde eu ia parar! 🔮' : ` Tinhas previsto outra casa — o que é que o programa fez de diferente?`;
        previsao = null; marca.style.display = 'none';
      }
      if (r.ok) {
        api.concluir({ ok: true, tentativas, blocos: r.blocos, estrelas: r.estrelas, previsoes, previsoesCertas },
          (r.estrelas === 3 ? (at.sucesso || 'Conseguiste! ⭐⭐⭐') : `Conseguiste! ⭐⭐ Com ${at.maxBlocos} blocos ou menos ganhas a 3.ª estrela (usaste ${r.blocos}). Experimenta o «repetir».`) + nota);
      } else {
        const [est, txt] = explicar(r, at);
        api.dizer(est, txt + nota);
        api.msg('Ainda não. Usa 👣 Um passo para ver onde o programa se engana, muda-o e experimenta outra vez.', 'errado');
      }
    }
    btnRep.addEventListener('click', () => { if (!aCorrer) repor(); });
    btnPasso.addEventListener('click', async () => {
      if (aCorrer) return;
      if (at.prever && !previsao && !exec && !tentativas) { api.dizer('curiosa', 'Antes de experimentar: onde achas que eu vou parar? Clica numa casa do mapa.'); return; }
      if (!exec) { const keep = previsao; repor(); previsao = keep; exec = { r: simular(at, ws), i: 1 }; tentativas++; }
      const p = exec.r.rasto[exec.i++];
      if (p) await darPasso(p, false);
      if (exec.i >= exec.r.rasto.length) { const r = exec.r; exec = null; acabar(r); }
    });
    btnIr.addEventListener('click', async () => {
      if (aCorrer) return;
      if (at.prever && !previsao && !tentativas) { api.dizer('curiosa', 'Antes de experimentar: onde achas que eu vou parar? Clica numa casa do mapa.'); return; }
      const keep = previsao; repor(); previsao = keep;
      const r = simular(at, ws);
      tentativas++;
      aCorrer = true; btnIr.disabled = true; btnPasso.disabled = true;
      for (const p of r.rasto.slice(1)) await darPasso(p, true);
      aCorrer = false; btnIr.disabled = false; btnPasso.disabled = false;
      acabar(r);
    });
    api.dizer('boas_vindas', at.boasVindas || (at.prever ? 'Primeiro prevê: clica na casa onde achas que eu vou parar. Depois experimenta!' : 'Arrasta os blocos para dentro do «ao começar» e carrega em ▶ Começar. Lembra-te: norte é para cima.'));
    return { fechar: () => { ro.disconnect(); ws.dispose(); }, ws };
  }
  const espera = ms => new Promise(r => setTimeout(r, ms));
  function svgEl(tag, at) { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); for (const k in at) e.setAttribute(k, at[k]); return e; }

  F.PC.caminho = { montar, correr, xml: xmlProg, simular };
})();
