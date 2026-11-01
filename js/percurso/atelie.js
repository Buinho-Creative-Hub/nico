/* Nico · Percurso 4.º ano — M4 «Horta programável» e M5 «Ateliê de mosaicos» (fichas do Ambrósio, FICHAS-M4-M5.md,
 * PR buinho-os #68, 1 Nov 2026). M4/M5 são nomes de mecânicas, não de sessões.
 *
 * Contrato comum: observar → prever → construir → experimentar → explicar. O erro não tira bolotas nem trabalho.
 * Botões persistentes (Experimentar, Um passo, Desfazer, Recomeçar esta tentativa); tudo com rato ou só com teclado;
 * estado anunciado numa região aria-live. Rascunho guardado após cada ação (api.rascunho). A explicação final é
 * «texto guardado» para o professor ler — nunca «correta» por contar palavras.
 *
 *   horta    { canteiros: [2,3,2,4], alvo: { min: 3, max: 4 }, deposito: 2, maxDoses: 2, blocos: [...], inicial: [...],
 *              solucao: [...], explicar, versao }
 *            programa: [{ op: 'para_cada', corpo: [...] }, { op: 'repetir', n: 2, corpo }, { op: 'se_seco', corpo }, { op: 'regar' }, { op: 'avancar' }]
 *   mosaico  { fixos: [[r, c, cor]], bloqueadas: [[r, c]], cobrir: [[r, c]] | null, inventario: { azul: 2, … } | null,
 *              metas: { area, perimetro, continua, simetria: { padrao } | null }, previsao: true|false, explicar, versao }
 *
 * Interpretador e geometria são funções puras (F.PC.horta, F.PC.mosaico): o resultado nunca se lê do ecrã.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.PC = F.PC || {};
  const h = (...a) => F.PC.itens.h(...a);
  const som = n => { if (F.Som) F.Som.tocar(n); };
  const seg = t0 => Math.round((performance.now() - t0) / 100) / 10;
  const pouco = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const copia = x => JSON.parse(JSON.stringify(x));

  // =================================================================================== M4 · interpretador puro
  const MAX_OPS = 100;
  const NOMES_OP = { para_cada: 'para cada canteiro', repetir: 'repetir', se_seco: 'se o canteiro estiver seco', regar: 'regar', avancar: 'avançar para o canteiro seguinte' };
  // Corre o programa a partir do estado inicial do desafio e devolve TODOS os passos (eventos), cada um com o estado depois dele.
  // Execução contínua e «Um passo» usam esta mesma lista: são iguais por construção.
  function passos(at, prog) {
    const st = { h: at.canteiros.slice(), dep: at.deposito, usadas: 0, c: 0, ops: 0 };
    const ev = [];
    const marca = (t, extra) => { ev.push(Object.assign({ t, h: st.h.slice(), dep: st.dep, usadas: st.usadas, c: st.c }, extra)); };
    const PARA = {};
    function lista(L) { for (const n of L) { no(n); } }
    function no(n) {
      if (++st.ops > MAX_OPS) { marca('limite', { no: n }); throw PARA; }
      if (n.op === 'para_cada') {
        for (let i = 0; i < st.h.length; i++) { st.c = i; marca('canteiro', { no: n, i }); lista(n.corpo || []); }
      } else if (n.op === 'repetir') {
        for (let k = 1; k <= n.n; k++) { marca('volta', { no: n, k, n: n.n }); lista(n.corpo || []); }
      } else if (n.op === 'se_seco') {
        // o sensor lê a humidade do canteiro atual NO INSTANTE em que o bloco corre
        const v = st.h[st.c] < at.alvo.min;
        marca('teste', { no: n, i: st.c, valor: st.h[st.c], v });
        if (v) lista(n.corpo || []);
      } else if (n.op === 'regar') {
        if (st.dep <= 0) { marca('semAgua', { no: n, i: st.c }); throw PARA; }
        st.dep--; st.usadas++; st.h[st.c]++;
        marca('regar', { no: n, i: st.c });
      } else if (n.op === 'avancar') {
        if (st.c + 1 >= st.h.length) { marca('fronteira', { no: n, i: st.c }); throw PARA; }
        st.c++; marca('canteiro', { no: n, i: st.c });
      }
    }
    marca('inicio');
    try { lista(prog); marca('fim'); } catch (e) { if (e !== PARA) throw e; }
    return ev;
  }
  // integridade dos blocos: contentores vazios e repetições fora de 1–8
  function integridade(prog) {
    for (const n of prog) {
      if (n.corpo) {
        if (!n.corpo.length) return n;
        const m = integridade(n.corpo); if (m) return m;
      }
      if (n.op === 'repetir' && !(n.n >= 1 && n.n <= 8)) return n;
    }
    return null;
  }
  // validação pela ordem da ficha: integridade → execução/depósito → faixas → orçamento
  function avaliar(at, prog) {
    const v = integridade(prog);
    if (!prog.length) return { ok: false, tipo: 'vazio', msg: 'O programa ainda está vazio. Junta blocos da paleta.', ev: [] };
    if (v) return { ok: false, tipo: 'vazio', msg: v.op === 'repetir' && v.corpo && v.corpo.length ? 'O «repetir» tem de ser de 1 a 8 vezes.' : `O bloco «${NOMES_OP[v.op]}» está vazio: põe lá dentro o que deve fazer.`, ev: [], no: v };
    const ev = passos(at, prog), u = ev[ev.length - 1], { min, max } = at.alvo;
    const base = { ev, final: u.h, usadas: u.usadas };
    if (u.t === 'semAgua') return Object.assign(base, { ok: false, tipo: 'deposito', msg: 'O depósito ficou vazio antes desta rega. Vê quais os canteiros que já tinham água suficiente.' });
    if (u.t === 'limite') return Object.assign(base, { ok: false, tipo: 'limite', msg: `O programa fez mais de ${MAX_OPS} operações e parou. Vê os números dos «repetir».` });
    if (u.t === 'fronteira') return Object.assign(base, { ok: false, tipo: 'fronteira', msg: 'Já não há canteiro seguinte: o programa parou no último canteiro.' });
    const seco = u.h.findIndex(x => x < min), mais = u.h.findIndex(x => x > max);
    if (seco >= 0) return Object.assign(base, { ok: false, tipo: 'seco', i: seco, msg: `O canteiro ${seco + 1} ficou com ${u.h[seco]} ${u.h[seco] === 1 ? 'gota' : 'gotas'}. Precisa de pelo menos ${min}. Em que momento voltas a ler o sensor?` });
    if (mais >= 0) return Object.assign(base, { ok: false, tipo: 'excesso', i: mais, msg: `O canteiro ${mais + 1} ficou com ${u.h[mais]} gotas: passou o máximo de ${max}. Que condição podia evitar esta rega?` });
    if (u.usadas > at.maxDoses) return Object.assign(base, { ok: false, tipo: 'orcamento', msg: `Usaste ${u.usadas} doses, mas só podes gastar ${at.maxDoses}. Rega só onde faz falta.` });
    return Object.assign(base, { ok: true, tipo: 'certo', msg: `Todos os canteiros ficaram entre ${min} e ${max} gotas. Usaste ${u.usadas} ${u.usadas === 1 ? 'dose' : 'doses'}.` });
  }
  F.PC.horta = { passos, avaliar, integridade, MAX_OPS };

  // =================================================================================== M5 · geometria pura
  const K = (r, c) => r + ',' + c;
  const RC = k => k.split(',').map(Number);
  const VIZ = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  const geo = {
    area: cel => cel.size,
    perimetro(cel) { let p = 0; cel.forEach(k => { const [r, c] = RC(k); VIZ.forEach(([dr, dc]) => { if (!cel.has(K(r + dr, c + dc))) p++; }); }); return p; },
    // arestas do contorno (para «mostrar o contorno»): [r, c, lado] com lado ∈ cima/baixo/esq/dir
    arestas(cel) { const a = []; cel.forEach(k => { const [r, c] = RC(k); if (!cel.has(K(r - 1, c))) a.push([r, c, 'cima']); if (!cel.has(K(r + 1, c))) a.push([r, c, 'baixo']); if (!cel.has(K(r, c - 1))) a.push([r, c, 'esq']); if (!cel.has(K(r, c + 1))) a.push([r, c, 'dir']); }); return a; },
    continua(cel) {
      if (cel.size <= 1) return true;
      const [i] = cel, vis = new Set([i]), fila = [i];
      while (fila.length) { const [r, c] = RC(fila.pop()); VIZ.forEach(([dr, dc]) => { const n = K(r + dr, c + dc); if (cel.has(n) && !vis.has(n)) { vis.add(n); fila.push(n); } }); }
      return vis.size === cel.size;
    },
    // simetria vertical num tabuleiro de 6 colunas: (r, c) ↔ (r, 7 − c); devolve as células sem par
    refletir: ([r, c], cols = 6) => [r, cols + 1 - c],
    semPar(mapa, padrao, cols = 6) {
      const s = [];
      mapa.forEach((cor, k) => { const [r, c] = RC(k); const o = mapa.get(K(r, cols + 1 - c)); if (o === undefined || (padrao && o !== cor)) s.push([r, c]); });
      return s;
    },
  };
  geo.K = K;
  F.PC.mosaico = { geo };

  // =================================================================================== peças comuns de ecrã
  // botão que pede confirmação no 2.º clique (Recomeçar explica antes o que vai ser reposto)
  function confirmar(texto, pergunta, fn) {
    const b = h('button', { type: 'button', class: 'btn btn-texto' }, texto);
    let armado = false;
    b.addEventListener('click', () => {
      if (!armado) { armado = true; b.textContent = pergunta; b.classList.add('aviso'); return; }
      armado = false; b.textContent = texto; b.classList.remove('aviso'); fn();
    });
    b.addEventListener('blur', () => { armado = false; b.textContent = texto; b.classList.remove('aviso'); });
    return b;
  }
  // explicação final: guardada para o professor, sem mínimo rígido de palavras
  function explicacao(caixa, pergunta, aoGuardar, valorAntes) {
    const ta = h('textarea', { class: 'of-explica', 'aria-label': pergunta, placeholder: 'Escreve aqui a tua explicação…' });
    if (valorAntes) ta.value = valorAntes;
    const b = h('button', { type: 'button', class: 'btn btn-azul' }, 'Guardar a explicação');
    const aviso = h('p', { class: 'pe-instr', 'aria-live': 'polite' });
    b.addEventListener('click', () => {
      if (ta.value.trim().split(/\s+/).filter(Boolean).length < 2) { aviso.textContent = 'Escreve pelo menos uma frase curta.'; ta.focus(); return; }
      b.disabled = true; ta.readOnly = true; aviso.textContent = 'Texto guardado para o professor.'; aoGuardar(ta.value.trim());
    });
    caixa.append(h('div', { class: 'at-explica' }, h('p', { class: 'pe-pergunta' }, pergunta), ta, aviso, b));
    ta.focus();
  }
  const modoDe = (mostrada) => mostrada ? 'mostrada' : null;

  // =================================================================================== M4 · Horta programável
  const PALETA_H = {
    para_cada: () => ({ op: 'para_cada', corpo: [] }),
    repetir: () => ({ op: 'repetir', n: 2, corpo: [] }),
    se_seco: () => ({ op: 'se_seco', corpo: [] }),
    regar: () => ({ op: 'regar' }),
    avancar: () => ({ op: 'avancar' }),
  };
  function horta(el, at, api) {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    const { min, max } = at.alvo, N = at.canteiros.length, TOPO = 6;
    let prog = copia(at.inicial || []), desfazer = [], ativo = null;   // ativo: lista (array) onde entram os blocos novos
    let exec = null, aCorrer = false, execucoes = 0, passosDados = 0, nDesfazer = 0, previsao = null, previsoes = 0, previsoesCertas = 0, mostrada = false, feito = false, falhas = 0;
    const ras = api.rascunho && api.rascunho.ler();
    if (ras && ras.v === (at.versao || 1) && Array.isArray(ras.prog)) prog = ras.prog;
    const guardar = () => { if (api.rascunho) api.rascunho.gravar({ v: at.versao || 1, prog }); };

    // ---------------- a horta (esquerda)
    const vivo = h('p', { class: 'at-vivo', 'aria-live': 'polite' });
    const linhaCanteiros = h('div', { class: 'hp-canteiros', role: 'group', 'aria-label': 'Canteiros (setas para escolher, Enter para ler o sensor)' });
    const depEl = h('div', { class: 'hp-deposito' });
    const nico = h('img', { class: 'hp-nico', src: 'img/percurso/nico-parado.webp', alt: '' });
    const cena = h('div', { class: 'hp-cena' }, linhaCanteiros, nico);
    let selC = 0;
    const bedsBtn = at.canteiros.map((_, i) => {
      const b = h('button', { type: 'button', class: 'hp-canteiro', tabindex: i === 0 ? '0' : '-1' });
      b.addEventListener('click', () => { selC = i; ler(i); });
      b.addEventListener('keydown', ev => {
        const d = { ArrowLeft: -1, ArrowRight: 1 }[ev.key];
        if (d) { ev.preventDefault(); selC = (i + d + N) % N; bedsBtn.forEach((x, k) => x.tabIndex = k === selC ? 0 : -1); bedsBtn[selC].focus(); }
      });
      linhaCanteiros.append(b); return b;
    });
    const estadoTxt = x => x < min ? 'seco' : x > max ? 'a mais' : 'adequado';
    function ler(i) {
      const s = exec ? exec.ev[exec.i - 1] : null, x = s ? s.h[i] : at.canteiros[i];
      vivo.textContent = `Sensor do canteiro ${i + 1}: ${x} ${x === 1 ? 'gota' : 'gotas'} — ${estadoTxt(x)} (alvo de ${min} a ${max}).`;
    }
    function pintarHorta(s, destaque) {
      const hum = s ? s.h : at.canteiros, dep = s ? s.dep : at.deposito, usadas = s ? s.usadas : 0, c = s ? s.c : 0;
      bedsBtn.forEach((b, i) => {
        const x = hum[i]; b.innerHTML = '';
        b.className = 'hp-canteiro ' + (x < min ? 'seco' : x > max ? 'excesso' : 'ok') + (destaque && destaque.i === i ? ' ' + destaque.cls : '');
        b.setAttribute('aria-label', `Canteiro ${i + 1}, humidade ${x}, ${estadoTxt(x)}`);
        const gotas = h('span', { class: 'hp-gotas', 'aria-hidden': 'true' });
        for (let k = TOPO; k >= 1; k--) gotas.append(h('i', { class: (k <= x ? 'cheia' : '') + (k >= min && k <= max ? ' faixa' : '') }));
        if (x > TOPO) gotas.prepend(h('i', { class: 'cheia mais' }));
        b.append(h('strong', null, `Canteiro ${i + 1}`), gotas, h('span', { class: 'hp-num' }, `${x} ${x === 1 ? 'gota' : 'gotas'}`), h('span', { class: 'hp-est' }, estadoTxt(x)));
        if (destaque && destaque.i === i && destaque.bolha) b.append(h('span', { class: 'hp-bolha' }, destaque.bolha));
      });
      depEl.innerHTML = '';
      depEl.append(h('strong', null, 'Depósito'), h('span', { class: 'hp-doses', 'aria-hidden': 'true' }, Array.from({ length: at.deposito }, (_, k) => h('i', { class: k < dep ? 'cheia' : '' }))),
        h('span', null, `${dep} ${dep === 1 ? 'dose' : 'doses'} · usadas ${usadas} de no máximo ${at.maxDoses}`));
      // o Nico fica por cima do canteiro atual
      const alvoB = bedsBtn[c];
      if (alvoB) { nico.style.left = (alvoB.offsetLeft + alvoB.offsetWidth / 2) + 'px'; }
    }

    // ---------------- previsão (opções textuais)
    const prevCaixa = h('div', { class: 'hp-prever' });
    function pedirPrevisao(depois) {
      prevCaixa.innerHTML = ''; prevCaixa.hidden = false;
      const regados = new Set(); let doses = null;
      const ok = h('button', { type: 'button', class: 'btn btn-azul', disabled: true }, 'Guardar a previsão');
      const linhaD = h('div', { class: 'hp-opcoes', role: 'group', 'aria-label': 'Quantas doses vai gastar?' });
      for (let d = 0; d <= at.deposito; d++) {
        const b = h('button', { type: 'button', class: 'hp-op', 'aria-pressed': 'false' }, String(d));
        b.addEventListener('click', () => { doses = d; linhaD.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === b))); ok.disabled = false; });
        linhaD.append(b);
      }
      const bMais = h('button', { type: 'button', class: 'hp-op', 'aria-pressed': 'false' }, 'vai faltar água');
      bMais.addEventListener('click', () => { doses = 'falta'; linhaD.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(x === bMais))); ok.disabled = false; });
      linhaD.append(bMais);
      const linhaC = h('div', { class: 'hp-opcoes', role: 'group', 'aria-label': 'Que canteiros vão receber água?' });
      at.canteiros.forEach((_, i) => {
        const b = h('button', { type: 'button', class: 'hp-op', 'aria-pressed': 'false' }, `Canteiro ${i + 1}`);
        b.addEventListener('click', () => { regados.has(i) ? regados.delete(i) : regados.add(i); b.setAttribute('aria-pressed', String(regados.has(i))); });
        linhaC.append(b);
      });
      ok.addEventListener('click', () => {
        previsao = { doses, regados: [...regados].sort() }; previsoes++;
        prevCaixa.hidden = true; vivo.textContent = 'Previsão guardada. Agora experimenta!'; depois();
      });
      prevCaixa.append(h('p', { class: 'pe-pergunta' }, 'Antes de experimentar, prevê:'),
        h('p', { class: 'pe-instr' }, 'Quantas doses vai gastar o programa?'), linhaD,
        h('p', { class: 'pe-instr' }, 'Que canteiros vão receber água? (escolhe os que quiseres; nenhum também é resposta)'), linhaC, ok);
      prevCaixa.querySelector('button').focus();
    }
    function compararPrevisao(r) {
      if (!previsao) return '';
      const regados = [...new Set(r.ev.filter(e => e.t === 'regar').map(e => e.i))].sort();
      const falta = r.tipo === 'deposito';
      const dOk = previsao.doses === 'falta' ? falta : (!falta && previsao.doses === r.usadas);
      const cOk = JSON.stringify(regados) === JSON.stringify(previsao.regados);
      if (dOk && cOk) previsoesCertas++;
      const p = previsao; previsao = null;
      return ` Previsão: ${p.doses === 'falta' ? 'faltar água' : p.doses + (p.doses === 1 ? ' dose' : ' doses')} ${dOk ? '✓' : '✗'} · canteiros regados ${cOk ? '✓' : '✗ (foram: ' + (regados.length ? regados.map(i => i + 1).join(', ') : 'nenhum') + ')'}.`;
    }

    // ---------------- programa (direita): lista editável com aspeto de blocos
    const progEl = h('div', { class: 'hp-prog', 'aria-label': 'O teu programa' });
    const paleta = h('div', { class: 'hp-paleta', role: 'group', 'aria-label': 'Blocos' });
    const linhaNo = new Map();
    (at.blocos || ['para_cada', 'repetir', 'se_seco', 'regar']).forEach(op => {
      const b = h('button', { type: 'button', class: 'hp-pal op-' + op }, '＋ ' + (op === 'se_seco' ? `se estiver seco (menos de ${min})` : op === 'repetir' ? 'repetir 2 vezes' : NOMES_OP[op]));
      b.addEventListener('click', () => {
        if (aCorrer) return;
        mudar(() => { const novo = PALETA_H[op](); const L = ativo || prog; L.push(novo); if (novo.corpo) ativo = novo.corpo; });
        vivo.textContent = `Juntaste «${NOMES_OP[op]}».`;
      });
      paleta.append(b);
    });
    function mudar(fn) { desfazer.push(JSON.stringify(prog)); fn(); voltarEdicao(); guardar(); desenharProg(); }
    function paiDe(L, alvo) { for (const n of L) { if (n.corpo === alvo) return L; if (n.corpo) { const p = paiDe(n.corpo, alvo); if (p) return p; } } return null; }
    function desenharProg() {
      progEl.innerHTML = ''; linhaNo.clear();
      if (ativo && ativo !== prog && !contem(prog, ativo)) ativo = null;
      const lista = (L, nivel) => {
        const caixa = h('div', { class: 'hp-lista' + (nivel ? ' dentro' : '') });
        L.forEach((n, i) => {
          const cab = h('div', { class: 'hp-bloco op-' + n.op });
          const txt = h('span', { class: 'hp-txt' });
          if (n.op === 'repetir') {
            const menos = h('button', { type: 'button', class: 'hp-mini', 'aria-label': 'Menos uma vez' }, '−');
            const mais = h('button', { type: 'button', class: 'hp-mini', 'aria-label': 'Mais uma vez' }, '+');
            menos.addEventListener('click', () => { if (n.n > 1) mudar(() => { n.n--; }); });
            mais.addEventListener('click', () => { if (n.n < 8) mudar(() => { n.n++; }); });
            txt.append('repetir ', menos, h('b', { 'aria-live': 'polite' }, String(n.n)), mais, ' vezes');
          } else txt.append(n.op === 'se_seco' ? `se o canteiro estiver seco (menos de ${min} gotas)` : NOMES_OP[n.op]);
          const cima = h('button', { type: 'button', class: 'hp-mini', 'aria-label': `Subir «${NOMES_OP[n.op]}»`, disabled: i === 0 ? true : null }, '▲');
          const baixo = h('button', { type: 'button', class: 'hp-mini', 'aria-label': `Descer «${NOMES_OP[n.op]}»`, disabled: i === L.length - 1 ? true : null }, '▼');
          const fora = h('button', { type: 'button', class: 'hp-mini', 'aria-label': `Tirar «${NOMES_OP[n.op]}»` }, '✕');
          cima.addEventListener('click', () => mudar(() => { [L[i - 1], L[i]] = [L[i], L[i - 1]]; }));
          baixo.addEventListener('click', () => mudar(() => { [L[i + 1], L[i]] = [L[i], L[i + 1]]; }));
          fora.addEventListener('click', () => mudar(() => { L.splice(i, 1); }));
          cab.append(txt, h('span', { class: 'hp-acoes' }, cima, baixo, fora));
          linhaNo.set(n, cab);
          const item = h('div', { class: 'hp-item' }, cab);
          if (n.corpo) item.append(lista(n.corpo, nivel + 1));
          caixa.append(item);
        });
        // ranhura: onde entram os blocos novos
        const sel = (ativo || prog) === L;
        const r = h('button', { type: 'button', class: 'hp-ranhura' + (sel ? ' ativa' : ''), 'aria-pressed': String(sel) }, sel ? '▸ os blocos novos entram aqui' : (nivel ? '▸ pôr blocos aqui dentro' : '▸ pôr blocos aqui (no fim)'));
        r.addEventListener('click', () => { ativo = L === prog ? null : L; desenharProg(); progEl.querySelector('.hp-ranhura.ativa').focus(); });
        caixa.append(r);
        return caixa;
      };
      progEl.append(h('div', { class: 'hp-comecar' }, 'ao experimentar'), lista(prog, 0));
      bDesfazer.disabled = !desfazer.length;
    }
    const contem = (L, alvo) => L.some(n => n.corpo && (n.corpo === alvo || contem(n.corpo, alvo)));

    // ---------------- execução
    const resultado = h('div', { class: 'hp-resultado', 'aria-live': 'polite' });
    const bIr = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '▶ Experimentar');
    const bPasso = h('button', { type: 'button', class: 'btn btn-texto' }, '👣 Um passo');
    const bEditar = h('button', { type: 'button', class: 'btn btn-texto' }, '✎ Voltar à edição');
    const bDesfazer = h('button', { type: 'button', class: 'btn btn-texto' }, '↶ Desfazer');
    const bRecomecar = confirmar('↺ Recomeçar esta tentativa', 'Repor o programa do início? Clica outra vez', () => {
      mudar(() => { prog = copia(at.inicial || []); ativo = null; }); vivo.textContent = 'O programa voltou ao do início. A horta também.';
    });
    const bMostrar = h('button', { type: 'button', class: 'btn btn-texto', hidden: true }, '👀 Ver uma solução (fica registado)');
    bDesfazer.addEventListener('click', () => { if (aCorrer || !desfazer.length) return; prog = JSON.parse(desfazer.pop()); ativo = null; nDesfazer++; voltarEdicao(); guardar(); desenharProg(); vivo.textContent = 'Desfeito.'; });
    bEditar.addEventListener('click', () => { voltarEdicao(); vivo.textContent = 'A horta voltou ao estado inicial. Podes mudar o programa.'; });
    bMostrar.addEventListener('click', () => {
      if (!at.solucao) return;
      mostrada = true; mudar(() => { prog = copia(at.solucao); ativo = null; });
      api.dizer('calma', 'Esta é uma solução possível. Experimenta-a e vê porque funciona.'); if (F.PC.registarAjuda) F.PC.registarAjuda(9);
    });
    function voltarEdicao() { exec = null; resultado.textContent = ''; marcarNo(null); pintarHorta(null); }
    function marcarNo(n) { linhaNo.forEach((e, k) => e.classList.toggle('a-correr', k === n)); }
    function mostrarPasso(e) {
      marcarNo(e.no || null);
      let dest = null, txt = '';
      if (e.t === 'canteiro') { dest = { i: e.i, cls: 'atual' }; txt = `Para cada canteiro: agora o canteiro ${e.i + 1}.`; }
      else if (e.t === 'volta') { dest = { i: e.c, cls: 'atual' }; txt = `Repetir: volta ${e.k} de ${e.n}.`; }
      else if (e.t === 'teste') { dest = { i: e.i, cls: 'sensor', bolha: `${e.valor} < ${min}? ${e.v ? 'Sim' : 'Não'}` }; txt = e.v ? `Sensor: ${e.valor} é menor do que ${min}? Sim. O canteiro ${e.i + 1} está seco: o que está dentro corre.` : `Sensor: ${e.valor} é menor do que ${min}? Não. Este bloco de rega não vai correr.`; }
      else if (e.t === 'regar') { dest = { i: e.i, cls: 'regado' }; txt = `Regar: o canteiro ${e.i + 1} fica com ${e.h[e.i]} gotas. Gastou-se 1 dose.`; som('apanhar'); }
      else if (e.t === 'semAgua') { dest = { i: e.i, cls: 'falta' }; txt = 'O depósito ficou vazio antes desta rega: o programa parou aqui.'; som('apagar'); }
      else if (e.t === 'fronteira') { dest = { i: e.i, cls: 'falta' }; txt = 'Não há canteiro seguinte: o programa parou.'; }
      else if (e.t === 'limite') txt = 'Demasiadas operações: o programa parou.';
      else if (e.t === 'fim') txt = 'O programa terminou.';
      else if (e.t === 'inicio') txt = 'Início: a horta está como no princípio.';
      pintarHorta(e, dest); vivo.textContent = txt;
    }
    function comecar() {
      if (!previsao && !previsoes) { pedirPrevisao(() => {}); return false; }
      const r = avaliar(at, prog);
      if (r.tipo === 'vazio') { vivo.textContent = r.msg; api.dizer('a_pensar', r.msg); return false; }
      exec = { r, ev: r.ev, i: 1 }; execucoes++;
      pintarHorta(r.ev[0]);
      return true;
    }
    function acabar() {
      const r = exec.r; marcarNo(null);
      const comp = compararPrevisao(r);
      resultado.innerHTML = '';
      resultado.className = 'hp-resultado ' + (r.ok ? 'certo' : 'errado');
      resultado.append(h('p', null, (r.ok ? '✓ ' : '') + r.msg + comp));
      if (!r.ok) {
        falhas++; if (falhas >= 2 && at.solucao && !mostrada) bMostrar.hidden = false;
        api.dizer(r.tipo === 'excesso' || r.tipo === 'deposito' ? 'surpreendida' : 'a_pensar', r.msg);
        resultado.append(h('p', { class: 'pe-instr' }, 'Usa ✎ Voltar à edição, muda o programa e experimenta outra vez.'));
        return;
      }
      feito = true; som('sucesso');
      [bIr, bPasso, bEditar, bDesfazer, bRecomecar, bMostrar].forEach(b => { b.disabled = true; });
      paleta.querySelectorAll('button').forEach(b => { b.disabled = true; }); progEl.querySelectorAll('button').forEach(b => { b.disabled = true; });
      api.dizer('celebrar', at.sucesso || 'A horta está pronta para a Mostra!');
      explicacao(resultado, at.explicar || 'Explica numa frase como escolheste onde regar.', texto => {
        api.concluir({ ok: true, modo: modoDe(mostrada), tentativas: execucoes, tempo: seg(t0), execucoes, passos: passosDados, desfazer: nDesfazer, previsoes, previsoesCertas,
          doses: r.usadas, final: r.final, valor: texto, aberta: true }, 'Texto guardado para o professor. A horta ficou regada! 🌱');
      });
    }
    bPasso.addEventListener('click', () => {
      if (aCorrer || feito) return;
      if (!exec && !comecar()) return;
      passosDados++;
      const e = exec.ev[exec.i++]; if (e) mostrarPasso(e);
      if (exec.i >= exec.ev.length) acabar();
    });
    bIr.addEventListener('click', async () => {
      if (feito) return;
      if (aCorrer) { saltar = true; return; }   // «Experimentar» abreviável: 2.º clique mostra já o resultado
      if (!comecar()) return;
      aCorrer = true; saltar = false; bIr.textContent = '⏩ Mostrar já o resultado'; bPasso.disabled = true;
      const ms = pouco() ? 0 : 520;
      while (exec && exec.i < exec.ev.length) {
        const e = exec.ev[exec.i++];
        if (!saltar) { mostrarPasso(e); if (ms) await R.espera(ms); }
      }
      if (saltar) mostrarPasso(exec.ev[exec.ev.length - 1]);
      aCorrer = false; bIr.textContent = '▶ Experimentar'; bPasso.disabled = false;
      acabar();
    });
    let saltar = false;

    el.append(h('div', { class: 'pc-enunciado at hp' },
      h('p', { class: 'pe-pergunta' }, at.pergunta),
      h('p', { class: 'pe-instr' }, `Objetivo: todos os canteiros com ${min} a ${max} gotas · cada «regar» dá 1 gota e gasta 1 dose · podes gastar no máximo ${at.maxDoses} ${at.maxDoses === 1 ? 'dose' : 'doses'}.`),
      h('div', { class: 'at-grelha' },
        h('div', { class: 'at-esq' }, depEl, cena, vivo, prevCaixa, resultado),
        h('div', { class: 'at-dir' }, h('p', { class: 'pe-instr' }, 'Clica num bloco da paleta para o juntar onde está a seta ▸. Usa ▲ ▼ para mudar a ordem.'), paleta, progEl)),
      h('div', { class: 'at-rodape' }, bIr, bPasso, bEditar, bDesfazer, bRecomecar, bMostrar)));
    prevCaixa.hidden = true;
    desenharProg(); pintarHorta(null);
    R.depois(() => pintarHorta(exec ? exec.ev[exec.i - 1] : null), 50);   // o Nico só se posiciona depois do layout
    if (ras && ras.prog) vivo.textContent = 'Recuperei o teu programa da última vez.';
    api.dizer('boas_vindas', at.boasVindas || 'Lê a humidade de cada canteiro. Depois programa a rega só onde faz falta.');
    return {
      fechar: () => R.limpar(),
      resolver: () => { prog = copia(at.solucao); previsoes = previsoes || 1; voltarEdicao(); desenharProg(); bIr.click(); },
      estado: () => ({ prog: copia(prog), exec: exec && exec.i }),
    };
  }

  // =================================================================================== M5 · Ateliê de mosaicos
  const PADROES = {
    azul: { nome: 'azul com ondas', cor: '#2F6DB5', svg: '<path d="M3 11q4-5 8 0t8 0t8 0M3 21q4-5 8 0t8 0t8 0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>' },
    terracota: { nome: 'terracota com pontos', cor: '#C0603A', svg: '<g fill="#fff"><circle cx="8" cy="8" r="2.6"/><circle cx="22" cy="8" r="2.6"/><circle cx="15" cy="15" r="2.6"/><circle cx="8" cy="22" r="2.6"/><circle cx="22" cy="22" r="2.6"/></g>' },
    verde: { nome: 'verde com folhas', cor: '#3F8A4F', svg: '<g fill="#fff"><path d="M6 22C6 13 13 7 22 7C22 16 15 22 6 22Z"/></g><path d="M7 21L19 10" stroke="#3F8A4F" stroke-width="1.6"/>' },
  };
  const azulejo = cor => `<svg viewBox="0 0 30 30" aria-hidden="true" class="mo-pad"><rect width="30" height="30" fill="${PADROES[cor].cor}"/>${PADROES[cor].svg}</svg>`;
  function mosaico(el, at, api) {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    const L = 6, C = 6, M = at.metas || {};
    const fixos = new Map((at.fixos || []).map(([r, c, cor]) => [K(r, c), cor]));
    const bloq = new Set((at.bloqueadas || []).map(([r, c]) => K(r, c)));
    const cobrir = at.cobrir ? new Set(at.cobrir.map(([r, c]) => K(r, c))) : null;
    let cel = new Map(fixos), inv = at.inventario ? Object.assign({}, at.inventario) : null, desf = [], cor = Object.keys(at.inventario || PADROES)[0], tool = 'por';
    let foco = [1, 1], verificacoes = 0, nDesfazer = 0, previsao = null, contorno = false, feito = false, falhas = 0;
    const ras = api.rascunho && api.rascunho.ler();
    if (ras && ras.v === (at.versao || 1) && Array.isArray(ras.cel)) { cel = new Map([...fixos, ...ras.cel.filter(([k]) => !fixos.has(k))]); if (ras.inv) inv = ras.inv; }
    const guardar = () => { if (api.rascunho) api.rascunho.gravar({ v: at.versao || 1, cel: [...cel].filter(([k]) => !fixos.has(k)), inv }); };
    const vivo = h('p', { class: 'at-vivo', 'aria-live': 'polite' });

    // paleta
    const paleta = h('div', { class: 'mo-paleta', role: 'group', 'aria-label': 'Azulejos' });
    const botoesCor = {};
    function pintarPaleta() {
      paleta.innerHTML = '';
      Object.keys(inv || PADROES).forEach(k => {
        const b = h('button', { type: 'button', class: 'mo-cor', 'aria-pressed': String(tool === 'por' && cor === k) }, h('span', { html: azulejo(k) }), PADROES[k].nome + (inv ? ` · ${inv[k]}` : ''));
        b.addEventListener('click', () => { tool = 'por'; cor = k; pintarPaleta(); vivo.textContent = `Escolheste ${PADROES[k].nome}.`; });
        botoesCor[k] = b; paleta.append(b);
      });
      const r = h('button', { type: 'button', class: 'mo-cor', 'aria-pressed': String(tool === 'tirar') }, h('span', { class: 'mo-borracha', 'aria-hidden': 'true' }, '✕'), 'retirar');
      r.addEventListener('click', () => { tool = 'tirar'; pintarPaleta(); vivo.textContent = 'Ferramenta retirar: escolhe o azulejo a tirar.'; });
      paleta.append(r);
    }

    // grelha com coordenadas
    const grelha = h('div', { class: 'mo-grelha', role: 'grid', 'aria-label': 'Grelha de 6 por 6 (setas para mudar de célula, Enter para pôr, Delete para tirar)' });
    const svgC = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgC.setAttribute('class', 'mo-contorno'); svgC.setAttribute('viewBox', `0 0 ${C} ${L}`); svgC.setAttribute('preserveAspectRatio', 'none'); svgC.setAttribute('aria-hidden', 'true');
    const btns = {};
    const corpoG = h('div', { class: 'mo-celulas' });
    for (let r = 1; r <= L; r++) for (let c = 1; c <= C; c++) {
      const k = K(r, c);
      const b = h('button', { type: 'button', class: 'mo-cel', role: 'gridcell', tabindex: r === 1 && c === 1 ? '0' : '-1' });
      b.addEventListener('click', () => { foco = [r, c]; agir(r, c, tool); });
      b.addEventListener('keydown', ev => {
        const d = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] }[ev.key];
        if (d) { ev.preventDefault(); focar(Math.max(1, Math.min(L, r + d[0])), Math.max(1, Math.min(C, c + d[1]))); }
        else if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); agir(r, c, 'por'); }
        else if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); agir(r, c, 'tirar'); }
      });
      btns[k] = b; corpoG.append(b);
    }
    const eixo = M.simetria ? h('div', { class: 'mo-eixo', 'aria-hidden': 'true' }, h('span', null, 'eixo')) : null;
    const cab = h('div', { class: 'mo-cab', 'aria-hidden': 'true' }, h('span'), ...Array.from({ length: C }, (_, i) => h('span', null, String(i + 1))));
    const lat = h('div', { class: 'mo-lat', 'aria-hidden': 'true' }, ...Array.from({ length: L }, (_, i) => h('span', null, String(i + 1))));
    grelha.append(cab, h('div', { class: 'mo-meio' }, lat, h('div', { class: 'mo-campo' }, corpoG, svgC, eixo)));
    function focar(r, c) { foco = [r, c]; Object.values(btns).forEach(b => { b.tabIndex = -1; }); const b = btns[K(r, c)]; b.tabIndex = 0; b.focus(); }
    function rotulo(r, c) {
      const k = K(r, c), x = cel.get(k);
      return `Linha ${r}, coluna ${c}, ` + (x ? PADROES[x].nome + (fixos.has(k) ? ', fixo' : ', móvel') : bloq.has(k) ? 'bloqueada' : 'vazia') + (cobrir && cobrir.has(k) ? ', para cobrir' : '');
    }
    function agir(r, c, modo) {
      if (feito) return;
      const k = K(r, c), x = cel.get(k);
      if (fixos.has(k)) { vivo.textContent = `Linha ${r}, coluna ${c}: este azulejo está fixo 🔒.`; return; }
      if (bloq.has(k)) { vivo.textContent = 'Esta célula está fora do painel.'; return; }
      if (modo === 'tirar') {
        if (!x) { vivo.textContent = `Linha ${r}, coluna ${c} já está vazia.`; return; }
        mudar(() => { cel.delete(k); if (inv) inv[x]++; }); vivo.textContent = `Tiraste o azulejo da linha ${r}, coluna ${c}.`; som('apagar'); return;
      }
      if (x === cor) { vivo.textContent = `Linha ${r}, coluna ${c} já tem ${PADROES[cor].nome}.`; return; }
      if (inv && inv[cor] <= 0) { vivo.textContent = `Já não tens azulejos ${PADROES[cor].nome}. Retira um ou escolhe outro.`; api.dizer('a_pensar', vivo.textContent); return; }
      mudar(() => { if (x && inv) inv[x]++; cel.set(k, cor); if (inv) inv[cor]--; });
      vivo.textContent = `Linha ${r}, coluna ${c}: ${PADROES[cor].nome}${x ? ' (trocaste a cor; a área não muda)' : ''}.`; som('encaixe');
    }
    function mudar(fn) { desf.push(JSON.stringify({ cel: [...cel], inv })); fn(); guardar(); limparResultado(); pintar(); }
    function pintar(semPar) {
      const sp = new Set((semPar || []).map(([r, c]) => K(r, c)));
      for (let r = 1; r <= L; r++) for (let c = 1; c <= C; c++) {
        const k = K(r, c), b = btns[k], x = cel.get(k);
        b.className = 'mo-cel' + (x ? ' cheia' : '') + (fixos.has(k) ? ' fixa' : '') + (bloq.has(k) ? ' bloq' : '') + (cobrir && cobrir.has(k) ? ' cobrir' : '') + (sp.has(k) ? ' sem-par' : '');
        b.innerHTML = x ? azulejo(x) + (fixos.has(k) ? '<span class="mo-cadeado" aria-hidden="true">🔒</span>' : '') : '';
        b.setAttribute('aria-label', rotulo(r, c));
      }
      pintarPaleta();
      const ocup = new Set(cel.keys());
      svgC.innerHTML = contorno ? geo.arestas(ocup).map(([r, c, l]) => {
        const x0 = c - 1, y0 = r - 1, P = { cima: [x0, y0, x0 + 1, y0], baixo: [x0, y0 + 1, x0 + 1, y0 + 1], esq: [x0, y0, x0, y0 + 1], dir: [x0 + 1, y0, x0 + 1, y0 + 1] }[l];
        return `<line x1="${P[0]}" y1="${P[1]}" x2="${P[2]}" y2="${P[3]}"/>`;
      }).join('') : '';
      contador.textContent = `Azulejos no painel: ${cel.size}` + (inv ? ` · por pôr: ${Object.values(inv).reduce((a, b) => a + b, 0)}` : '');
      bDesf.disabled = !desf.length;
    }
    const contador = h('p', { class: 'mo-contador' });

    // critérios (pela ordem da ficha)
    const criterios = [];
    if (cobrir) criterios.push(['cobrir', 'Cobrir o retângulo marcado']);
    if (M.area != null) criterios.push(['area', `Área ${M.area}`]);
    if (M.continua) criterios.push(['continua', 'Forma contínua (ligada pelos lados)']);
    if (M.perimetro != null) criterios.push(['perimetro', `Perímetro ${M.perimetro}`]);
    if (M.simetria) criterios.push(['simetria', M.simetria.padrao ? 'Simetria no eixo (posição e padrão)' : 'Simetria no eixo']);
    const lista = h('ul', { class: 'it-lista mo-criterios' }, criterios.map(([, n]) => h('li', null, n)));
    function verificar() {
      const ocup = new Set(cel.keys()), area = geo.area(ocup), per = geo.perimetro(ocup), cont = geo.continua(ocup);
      const sp = M.simetria ? geo.semPar(cel, M.simetria.padrao) : [];
      const res = {
        cobrir: () => !cobrir || [...cobrir].every(k => cel.has(k)) && [...ocup].every(k => cobrir.has(k)),
        area: () => area === M.area, continua: () => cont, perimetro: () => per === M.perimetro, simetria: () => !sp.length,
      };
      const estado = criterios.map(([id, n]) => [id, n, res[id]()]);
      const falha = estado.find(x => !x[2]);
      let msg;
      if (!falha) msg = estado.map(([, n]) => n + ' ✓').join(' · ') + '. Há outras soluções que também resultam.';
      else if (falha[0] === 'cobrir') { const faltam = [...cobrir].filter(k => !cel.has(k)).length, fora = [...ocup].filter(k => !cobrir.has(k)).length; msg = faltam ? `Ainda há ${faltam} ${faltam === 1 ? 'célula' : 'células'} do retângulo por cobrir.` : `Há ${fora} ${fora === 1 ? 'azulejo' : 'azulejos'} fora do retângulo.`; }
      else if (falha[0] === 'area') msg = area < M.area ? `Tens ${area} ${area === 1 ? 'azulejo' : 'azulejos'}. Para uma área de ${M.area}, ${M.area - area === 1 ? 'falta cobrir uma célula' : `faltam cobrir ${M.area - area} células`}.` : `Tens ${area} azulejos: a área pedida é ${M.area}. Retira ${area - M.area}.`;
      else if (falha[0] === 'continua') msg = 'Há partes que só se tocam num canto ou estão separadas. Neste desafio têm de se ligar por um lado.';
      else if (falha[0] === 'perimetro') msg = `A área é ${area}, mas o contorno tem ${per} lados. ${per > M.perimetro ? 'Há uma forma de juntar mais lados por dentro?' : 'Precisas de um contorno maior.'}`;
      else { const [r, c] = sp[0], d = c <= C / 2 ? C / 2 + 1 - c : c - C / 2; msg = `O azulejo da linha ${r}, coluna ${c} está a ${d === 1 ? 'uma casa' : d + ' casas'} do eixo. Onde fica o seu par?`; }
      return { ok: !falha, estado, msg, area, per, sp };
    }
    const resultado = h('div', { class: 'hp-resultado', 'aria-live': 'polite' });
    const prevCaixa = h('div', { class: 'hp-prever', hidden: true });
    function limparResultado() { resultado.innerHTML = ''; resultado.className = 'hp-resultado'; lista.querySelectorAll('li').forEach(li => { li.className = ''; }); }
    function pedirPrevisao() {
      prevCaixa.innerHTML = ''; prevCaixa.hidden = false;
      const ia = h('input', { type: 'number', min: '0', max: '36', class: 'tc-entrada mo-num', 'aria-label': 'Área prevista' });
      const ip = h('input', { type: 'number', min: '0', max: '60', class: 'tc-entrada mo-num', 'aria-label': 'Perímetro previsto' });
      const ok = h('button', { type: 'button', class: 'btn btn-azul' }, 'Guardar e verificar');
      ok.addEventListener('click', () => {
        if (ia.value === '' || ip.value === '') { vivo.textContent = 'Escreve os dois números da tua previsão.'; return; }
        previsao = { area: Number(ia.value), per: Number(ip.value) }; prevCaixa.hidden = true; bVer.click();
      });
      [ia, ip].forEach(i => i.addEventListener('keydown', ev => { if (ev.key === 'Enter') ok.click(); }));
      prevCaixa.append(h('p', { class: 'pe-pergunta' }, 'Antes de verificar, prevê: quanto medem a área e o perímetro da tua forma?'),
        h('label', { class: 'mo-campo-prev' }, 'Área: ', ia, ' quadrados'), h('label', { class: 'mo-campo-prev' }, 'Perímetro: ', ip, ' lados'), ok);
      ia.focus();
    }
    const bVer = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '✓ Verificar');
    const bDesf = h('button', { type: 'button', class: 'btn btn-texto' }, '↶ Desfazer');
    const bContorno = h('button', { type: 'button', class: 'btn btn-texto', hidden: true, 'aria-pressed': 'false' }, '▢ Mostrar o contorno');
    const bRec = confirmar('↺ Recomeçar esta tentativa', 'Tirar os azulejos móveis? Clica outra vez', () => {
      mudar(() => { cel = new Map(fixos); inv = at.inventario ? Object.assign({}, at.inventario) : null; });
      vivo.textContent = 'Tiraste os azulejos móveis. Os fixos 🔒 ficaram.';
    });
    bDesf.addEventListener('click', () => { if (!desf.length || feito) return; const s = JSON.parse(desf.pop()); cel = new Map(s.cel); inv = s.inv; nDesfazer++; guardar(); limparResultado(); pintar(); vivo.textContent = 'Desfeito.'; });
    bContorno.addEventListener('click', () => { contorno = !contorno; bContorno.setAttribute('aria-pressed', String(contorno)); bContorno.textContent = contorno ? '▢ Esconder o contorno' : '▢ Mostrar o contorno'; pintar(); });
    bVer.addEventListener('click', () => {
      if (feito) return;
      if (at.previsao && !previsao) { pedirPrevisao(); return; }
      verificacoes++;
      const v = verificar();
      lista.querySelectorAll('li').forEach((li, i) => { li.className = v.estado[i][2] ? 'ok' : 'nao'; });
      pintar(v.sp);
      let comp = '';
      if (previsao) { comp = ` A tua previsão: área ${previsao.area} ${previsao.area === v.area ? '✓' : '✗ (é ' + v.area + ')'} · perímetro ${previsao.per} ${previsao.per === v.per ? '✓' : '✗ (é ' + v.per + ')'}.`; previsao = null; }
      resultado.innerHTML = ''; resultado.className = 'hp-resultado ' + (v.ok ? 'certo' : 'errado');
      resultado.append(h('p', null, (v.ok ? '✓ ' : '') + v.msg + comp));
      bContorno.hidden = false;
      if (!v.ok) { falhas++; api.dizer('a_pensar', v.msg); return; }
      feito = true; som('sucesso');
      [bVer, bDesf, bRec].forEach(b => { b.disabled = true; });
      api.dizer('celebrar', at.sucesso || 'Que painel bonito para a Mostra!');
      explicacao(resultado, at.explicar || 'Explica numa frase como pensaste.', texto => {
        api.concluir({ ok: true, tentativas: verificacoes, tempo: seg(t0), verificacoes, desfazer: nDesfazer, area: v.area, perimetro: v.per,
          celulas: [...cel].map(([k, x]) => k + ':' + x), valor: texto, aberta: true }, 'Explicação guardada para o professor. O painel vai para a Mostra! 🧩');
      });
    });

    el.append(h('div', { class: 'pc-enunciado at mo' },
      h('p', { class: 'pe-pergunta' }, at.pergunta),
      h('div', { class: 'at-grelha mo-grelha-caixa' },
        h('div', { class: 'at-esq mo-esq' }, grelha, contador),
        h('div', { class: 'at-dir' }, h('p', { class: 'pe-instr' }, 'Escolhe um azulejo e depois uma célula. No teclado: setas para andar, Enter para pôr, Delete para tirar.'), paleta, h('h4', null, 'O que o painel tem de ter'), lista, vivo, prevCaixa, resultado)),
      h('div', { class: 'at-rodape' }, bVer, bDesf, bRec, bContorno)));
    pintar();
    if (ras && ras.cel && ras.cel.length) vivo.textContent = 'Recuperei o teu painel da última vez.';
    api.dizer('boas_vindas', at.boasVindas || 'Escolhe um azulejo e depois uma célula da grelha.');
    return {
      fechar: () => R.limpar(),
      resolver: () => { cel = new Map([...fixos, ...(at.solucao || []).map(([r, c, x]) => [K(r, c), x])]); if (inv) Object.keys(inv).forEach(k => { inv[k] = 0; }); previsao = at.previsao ? { area: -1, per: -1 } : null; bVer.click(); },
      estado: () => ({ cel: [...cel], inv }),
    };
  }

  F.PC.oficina.registar('horta', horta);
  F.PC.oficina.registar('mosaico', mosaico);
})();
