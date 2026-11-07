/* Nico · Capítulo especial — jogos curtos dentro do teste de revisão.
 *
 * Pedido do Carlos (7 Nov 2026): cada teste tem também alguns jogos (poucos: 3), a rodar entre testes.
 * Cada jogo é uma pergunta do teste: a criança mexe (pôr contas, virar cartões, clicar na reta, programar o Nico…)
 * e só no fim, ao entregar, se vê se estava certo. Mesma interface dos itens: montar → { valor, repor, respondido }.
 *
 *   F.REV.jogosTeste.gerar(tipo, r)   item { tipo: 'jogo', jogo, tema, k: 'jogo-<tipo>', pergunta, …parâmetros }
 *   F.REV.jogosTeste.escolher(n, recentes, r)   n tipos de jogo diferentes, evitando os dos testes anteriores
 *   F.REV.jogosTeste.montar(el, it, aoMudar) · corrigir(it, v) · certa(it)
 */
(function () {
  'use strict';
  const F = window.Faisca, R = F.REV, U = R.util, h = F.PC.itens.h;
  const NB = ' ';
  let n = 0;
  const id = t => 'rvj-' + t + '-' + (++n) + '-' + Math.floor(Math.random() * 1e6).toString(36);

  // ------------------------------------------------------------ geradores (os parâmetros de cada jogo)
  const GER = {
    abaco: r => { let a = U.ri(r, 1, 9) * 100000 + U.ri(r, 0, 99999); if (r() < 0.5) { const s = String(a).split(''); s[U.ri(r, 1, 5)] = '0'; a = Number(s.join('')); } return { tema: 'num', alvo: a, pergunta: `🎮 Representa no ábaco o número ${U.fmt(a)}.`, instr: 'Usa + e − em cada vareta.' }; },
    binario: r => { const a = U.ri(r, 3, 31); return { tema: 'pc', alvo: a, pergunta: `🎮 Vira os cartões para mostrar o número ${a} em binário.`, instr: 'Clica num cartão para o virar: com pintas = 1, escuro = 0.' }; },
    reta: r => { const max = U.pick(r, [1000, 10000, 100000]), a = U.ri(r, 5, 95) * max / 100; return { tema: 'num', max, alvo: a, pergunta: `🎮 Clica na reta numérica onde fica o ${U.fmt(a)}.`, instr: 'Conta como certo se ficar muito perto (a menos de 5% da reta).' }; },
    relogio: r => { const hh = U.ri(r, 1, 12), mm = U.pick(r, [0, 15, 30, 45, 5, 20, 40, 50]); return { tema: 'med', hh, mm, pergunta: `🎮 Acerta o relógio para as ${hh}h${String(mm).padStart(2, '0')}.`, instr: 'Usa os botões das horas e dos minutos.' }; },
    fracao: r => { const d = U.pick(r, [3, 4, 5, 6, 8, 10]), num = U.ri(r, 1, d - 1); return { tema: 'fra', d, num, pergunta: `🎮 Pinta ${num}/${d} da piza.`, instr: 'Clica nas partes para as pintar (e outra vez para despintar).' }; },
    feira: r => { const p = U.ri(r, 1, 40) * 5 + U.ri(r, 0, 1) * U.ri(r, 1, 18) * 100; return { tema: 'med', preco: p, pergunta: `🎮 Na feira, um frasco de mel custa ${U.euros(p / 100)}. Paga a quantia exata.`, imagem: 'img/revisoes/feira-mel-frasco.webp', instr: 'Clica nas notas e moedas; clica no que está na mesa para o tirar.' }; },
    coordenada: r => { const c = U.ri(r, 0, 7), l = U.ri(r, 0, 7); return { tema: 'geo', c, l, pergunta: `🎮 Clica na casa (${'abcdefgh'[c]}, ${l + 1}) da grelha.`, instr: 'Primeiro a letra (coluna), depois o número (linha).' }; },
    ordena: r => { const s = new Set(); while (s.size < 5) s.add(U.ri(r, 10, 99) * 1000 + U.ri(r, 0, 999)); return { tema: 'num', nums: [...s], pergunta: '🎮 Clica nos números do menor para o maior.', instr: 'Se te enganares, carrega em «Recomeçar».' }; },
    programa: r => {
      let ini, fim, pedras;
      do { ini = [U.ri(r, 0, 5), U.ri(r, 0, 5)]; fim = [U.ri(r, 0, 5), U.ri(r, 0, 5)]; pedras = new Set(); for (let k = 0; k < 6; k++) pedras.add(U.ri(r, 0, 5) + ',' + U.ri(r, 0, 5)); pedras.delete(ini.join(',')); pedras.delete(fim.join(',')); }
      while (Math.abs(ini[0] - fim[0]) + Math.abs(ini[1] - fim[1]) < 4 || !caminho(ini, fim, pedras));
      return { tema: 'pc', ini, fim, pedras: [...pedras], pergunta: '🎮 Programa o Nico 🐾 para chegar à moeda 🪙 sem bater nas pedras.', instr: 'Junta setas ao programa. Só se corre no fim, quando entregares o teste!' };
    },
    planificacao: r => {
      const vistas = new Set(), boas = [], mas = [];
      for (let t = 0; t < 5000 && (boas.length < 2 || mas.length < 3); t++) { const x = U.hexomino(r), f = x.map(c => c.join(',')).sort().join(';'); if (vistas.has(f)) continue; vistas.add(f); (U.eCubo(x) ? boas : mas).push(x); }
      const nb = U.ri(r, 1, 2), figs = U.misturar(r, [...boas.slice(0, nb), ...mas.slice(0, 4 - nb)]);
      return { tema: 'geo', figs, pergunta: '🎮 Marca todas as figuras que são planificações do cubo.', instr: 'Pode haver mais do que uma.' };
    },
  };
  const NOMES = { abaco: 'Ábaco', binario: 'Cartões binários', reta: 'Reta numérica', relogio: 'Relógio', fracao: 'Pintar frações', feira: 'Pagar na feira', coordenada: 'Coordenadas', ordena: 'Ordenar números', programa: 'Programar o Nico', planificacao: 'Planificações do cubo' };
  const COMP = { abaco: 'Ler números no ábaco', binario: 'Sistema binário', reta: 'Ler números na reta numérica', relogio: 'Ler as horas', fracao: 'Reconhecer frações', feira: 'Contar dinheiro', coordenada: 'Coordenadas na grelha', ordena: 'Comparar e ordenar números', programa: 'Programar caminhos (setas)', planificacao: 'Planificações do cubo' };
  Object.entries(COMP).forEach(([t, c]) => { R.COMPETENCIAS['jogo-' + t] = c; });

  function gerar(tipo, r) {
    r = r || Math.random;
    return Object.assign({ id: id(tipo), tipo: 'jogo', jogo: tipo, k: 'jogo-' + tipo, area: 'mat', nomeJogo: NOMES[tipo] }, GER[tipo](r));
  }
  function escolher(qt, recentes, r) {
    r = r || Math.random; recentes = recentes || new Set();
    let l = U.misturar(r, Object.keys(GER)).filter(t => !recentes.has('jogo-' + t));
    if (l.length < qt) l = [...l, ...U.misturar(r, Object.keys(GER)).filter(t => !l.includes(t))];
    return l.slice(0, qt).map(t => gerar(t, r));
  }

  // ------------------------------------------------------------ ajudas
  const SET = { '↑': [-1, 0], '↓': [1, 0], '←': [0, -1], '→': [0, 1] };
  function caminho(a, b, pedras) {   // caminho mais curto em setas (ou null)
    const prev = new Map([[a.join(','), null]]), fila = [a];
    while (fila.length) {
      const p = fila.shift();
      if (p[0] === b[0] && p[1] === b[1]) { const out = []; let k = p.join(','); while (prev.get(k)) { const [q, s] = prev.get(k); out.unshift(s); k = q; } return out; }
      for (const [s, [dr, dc]] of Object.entries(SET)) { const q = [p[0] + dr, p[1] + dc], k = q.join(','); if (q[0] >= 0 && q[1] >= 0 && q[0] < 6 && q[1] < 6 && !pedras.has(k) && !prev.has(k)) { prev.set(k, [p.join(','), s]); fila.push(q); } }
    }
    return null;
  }
  function correr(it, prog) {
    const ped = new Set(it.pedras); let p = it.ini.slice();
    for (const s of prog) { const q = [p[0] + SET[s][0], p[1] + SET[s][1]]; if (q[0] < 0 || q[1] < 0 || q[0] > 5 || q[1] > 5 || ped.has(q.join(','))) return false; p = q; }
    return p[0] === it.fim[0] && p[1] === it.fim[1];
  }
  const DIN = [[2000, '20 €', 'nota'], [1000, '10 €', 'nota'], [500, '5 €', 'nota'], [200, '2 €', 'moeda'], [100, '1 €', 'moeda'], [50, '50 c', 'moeda'], [20, '20 c', 'moeda'], [10, '10 c', 'moeda'], [5, '5 c', 'moeda']];
  const btn = (t, f, cls) => h('button', { type: 'button', class: cls || 'btn btn-texto', onclick: f }, t);

  // ------------------------------------------------------------ montar (cada jogo no ecrã do teste)
  const M = {
    abaco(el, it, st, mudou) {
      st.d = st.d || [0, 0, 0, 0, 0, 0];
      const fig = h('div', { class: 'rv-abaco' }), bt = h('div', { class: 'rv-abaco-bt' });
      const pintar = () => { fig.innerHTML = U.svgAbaco(Number(st.d.join(''))); };
      ['CM', 'DM', 'UM', 'C', 'D', 'U'].forEach((o, k) => bt.append(h('div', null, btn('+', () => { if (st.d[k] < 9) { st.d[k]++; st.mexeu = true; pintar(); mudou(); } }), btn('−', () => { if (st.d[k] > 0) { st.d[k]--; pintar(); mudou(); } }))));
      el.append(fig, bt); pintar();
      return () => st.mexeu ? st.d.join('') : undefined;
    },
    binario(el, it, st, mudou) {
      st.b = st.b || ['0', '0', '0', '0', '0']; const V = [16, 8, 4, 2, 1];
      const c = h('div', { class: 'rv-cartas' });
      const pintar = () => { c.innerHTML = ''; V.forEach((v, k) => { const b = h('button', { type: 'button', class: 'rv-carta', 'aria-pressed': String(st.b[k] === '1'), 'aria-label': 'Cartão ' + v, html: U.svgCartao(v, st.b[k] === '1') }); b.onclick = () => { st.b[k] = st.b[k] === '1' ? '0' : '1'; st.mexeu = true; pintar(); mudou(); }; c.append(b); }); };
      el.append(c); pintar();
      return () => st.mexeu ? st.b.join('') : undefined;
    },
    reta(el, it, st, mudou) {
      const W = 640, x0 = 30, x1 = 610, X = v => x0 + (v / it.max) * (x1 - x0), cx = h('div', { class: 'rv-reta' });
      const pintar = () => {
        let g = `<line x1="${x0}" y1="60" x2="${x1}" y2="60" stroke="#222" stroke-width="4"/>`;
        for (let k = 0; k <= 10; k++) { const v = it.max * k / 10; g += `<line x1="${X(v)}" y1="${k % 5 ? 52 : 44}" x2="${X(v)}" y2="${k % 5 ? 68 : 76}" stroke="#222" stroke-width="2"/>`; if (k % 5 === 0) g += `<text x="${X(v)}" y="98" text-anchor="middle" font-size="16" font-weight="700">${U.fmt(v)}</text>`; }
        if (st.v != null) g += `<circle cx="${X(st.v)}" cy="60" r="9" fill="#e05a47"/>`;
        cx.innerHTML = `<svg viewBox="0 0 ${W} 110" width="100%" font-family="Asap, sans-serif" style="cursor:crosshair">${g}</svg>`;
      };
      cx.addEventListener('click', ev => { const s = cx.querySelector('svg').getBoundingClientRect(), x = (ev.clientX - s.left) * W / s.width; st.v = Math.round(Math.max(0, Math.min(it.max, (x - x0) / (x1 - x0) * it.max))); pintar(); mudou(); });
      el.append(cx); pintar();
      return () => st.v;
    },
    relogio(el, it, st, mudou) {
      if (st.h == null) { st.h = 12; st.m = 0; }
      const fig = h('div'), pintar = () => { fig.innerHTML = ''; fig.append(F.PC.itens.figura({ tipo: 'relogio', h: st.h, m: st.m })); };
      const mexer = (dh, dm) => { st.m += dm; if (st.m >= 60) { st.m -= 60; st.h++; } if (st.m < 0) { st.m += 60; st.h--; } st.h = ((st.h - 1 + dh + 12) % 12) + 1; st.mexeu = true; pintar(); mudou(); };
      el.append(fig, h('div', { class: 'rv-rel-bt' }, h('span', null, 'Horas'), btn('−', () => mexer(-1, 0)), btn('+', () => mexer(1, 0)), h('span', null, 'Minutos'), btn('− 5', () => mexer(0, -5)), btn('+ 5', () => mexer(0, 5))));
      pintar();
      return () => st.mexeu ? st.h + ':' + st.m : undefined;
    },
    fracao(el, it, st, mudou) {
      st.p = st.p || [];
      const fig = h('div', { class: 'rv-frac' });
      const pintar = () => {
        const c = 110, Rr = 100, d = it.d; let g = '';
        for (let i = 0; i < d; i++) { const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2;
          g += `<path data-i="${i}" d="M${c},${c} L${(c + Rr * Math.cos(a0)).toFixed(1)},${(c + Rr * Math.sin(a0)).toFixed(1)} A${Rr},${Rr} 0 0 1 ${(c + Rr * Math.cos(a1)).toFixed(1)},${(c + Rr * Math.sin(a1)).toFixed(1)} Z" fill="${st.p.includes(i) ? '#f29d32' : '#fff'}" stroke="#222" stroke-width="3" style="cursor:pointer"/>`; }
        fig.innerHTML = `<svg viewBox="0 0 220 220" width="240">${g}</svg>`;
        fig.querySelectorAll('path').forEach(p => p.addEventListener('click', () => { const i = +p.dataset.i; st.p = st.p.includes(i) ? st.p.filter(x => x !== i) : [...st.p, i]; pintar(); mudou(); }));
      };
      el.append(fig); pintar();
      return () => st.p.length ? st.p.length : undefined;
    },
    feira(el, it, st, mudou) {
      st.p = st.p || [];
      const mesa = h('div', { class: 'rv-mesa' }), tot = h('p', { class: 'rv-soma' }), cart = h('div', { class: 'rv-carteira' });
      const pintar = () => { mesa.innerHTML = ''; st.p.forEach((v, i) => { const d = DIN.find(x => x[0] === v); mesa.append(h('button', { type: 'button', class: 'rv-din ' + d[2], onclick: () => { st.p.splice(i, 1); pintar(); mudou(); } }, d[1])); }); tot.textContent = 'Na mesa: ' + U.euros(st.p.reduce((a, b) => a + b, 0) / 100); };
      DIN.forEach(([v, t, tipo]) => cart.append(h('button', { type: 'button', class: 'rv-din ' + tipo, onclick: () => { st.p.push(v); pintar(); mudou(); } }, t)));
      el.append(h('p', { class: 'rv-mini' }, 'Na mesa (clica para tirar):'), mesa, tot, h('p', { class: 'rv-mini' }, 'A tua carteira:'), cart); pintar();
      return () => st.p.length ? st.p.reduce((a, b) => a + b, 0) : undefined;
    },
    coordenada(el, it, st, mudou) {
      const L = 'abcdefgh', g = h('div', { class: 'rv-grade' });
      const pintar = () => {
        g.innerHTML = '';
        for (let r = 7; r >= 0; r--) { g.append(h('span', { class: 'rv-g-l' }, String(r + 1))); for (let k = 0; k < 8; k++) { const on = st.v === k + ',' + r; g.append(h('button', { type: 'button', class: 'rv-g-c' + (on ? ' sel' : ''), 'aria-label': `(${L[k]}, ${r + 1})`, onclick: () => { st.v = k + ',' + r; pintar(); mudou(); } }, on ? '📍' : '')); } }
        g.append(h('span'), ...L.split('').map(x => h('span', { class: 'rv-g-l' }, x)));
      };
      el.append(g); pintar();
      return () => st.v;
    },
    ordena(el, it, st, mudou) {
      st.o = st.o || [];
      const g = h('div', { class: 'rv-ordena' });
      const pintar = () => { g.innerHTML = ''; it.nums.forEach(nn => { const k = st.o.indexOf(nn); g.append(h('button', { type: 'button', class: 'rv-num' + (k >= 0 ? ' sel' : ''), onclick: () => { if (k < 0) { st.o.push(nn); pintar(); mudou(); } } }, (k >= 0 ? (k + 1) + '.º  ' : '') + U.fmt(nn))); }); };
      el.append(g, btn('Recomeçar', () => { st.o = []; pintar(); mudou(); })); pintar();
      return () => st.o.length === it.nums.length ? st.o.slice() : undefined;
    },
    programa(el, it, st, mudou) {
      st.p = st.p || [];
      const ped = new Set(it.pedras), grade = h('div', { class: 'rv-prog-g' }), lista = h('div', { class: 'rv-prog-l' });
      for (let r = 0; r < 6; r++) for (let c = 0; c < 6; c++) { const k = r + ',' + c; const im = (f, alt) => `<img class="rv-cel-img" src="${f}" alt="${alt}">`; grade.append(h('span', { class: 'rv-prog-c', html: it.ini[0] === r && it.ini[1] === c ? im('img/percurso/nico-tartaruga-n.webp', 'Nico') : it.fim[0] === r && it.fim[1] === c ? im('img/percurso/moeda-cobre.webp', 'moeda') : ped.has(k) ? im('img/revisoes/peca-pedra.webp', 'pedra') : '' })); }
      const pintar = () => { lista.textContent = st.p.length ? 'Programa: ' + st.p.join(' ') : 'Programa: (vazio)'; };
      el.append(grade, lista, h('div', { class: 'rv-prog-bt' }, ...Object.keys(SET).map(s => btn(s, () => { if (st.p.length < 20) { st.p.push(s); pintar(); mudou(); } })), btn('⌫ Apagar', () => { st.p.pop(); pintar(); mudou(); })));
      pintar();
      return () => st.p.length ? st.p.slice() : undefined;
    },
    planificacao(el, it, st, mudou) {
      st.s = st.s || [];
      const g = h('div', { class: 'rv-planif' });
      const svg = cels => { const s = 22, mr = Math.max(...cels.map(c => c[0])), mc = Math.max(...cels.map(c => c[1])); return `<svg viewBox="0 0 ${(mc + 1) * s + 8} ${(mr + 1) * s + 8}" width="${(mc + 1) * s + 8}">${cels.map(([r, c]) => `<rect x="${4 + c * s}" y="${4 + r * s}" width="${s}" height="${s}" fill="#f6c25b" stroke="#7a4a00" stroke-width="2"/>`).join('')}</svg>`; };
      it.figs.forEach((f, k) => { const b = h('button', { type: 'button', class: 'rv-pl', 'aria-pressed': String(st.s.includes(k)), html: `<b>${'ABCD'[k]}</b>` + svg(f) }); b.onclick = () => { st.s = st.s.includes(k) ? st.s.filter(x => x !== k) : [...st.s, k].sort(); b.setAttribute('aria-pressed', String(st.s.includes(k))); mudou(); }; g.append(b); });
      el.append(g);
      return () => st.s.length ? st.s.slice() : undefined;
    },
  };
  function montar(el, it, aoMudar) {
    el.innerHTML = '';
    const CAPA = { abaco: 'abaco', binario: 'binario', reta: 'reta', relogio: 'relogio', fracao: 'fracoes', feira: 'feira', coordenada: 'coordenadas', ordena: 'ordena', programa: 'programa', planificacao: 'planificacoes' };
    const caixa = h('div', { class: 'pc-enunciado rv-jogo-item' },
      h('div', { class: 'rv-jogo-faixa' }, h('img', { src: 'img/revisoes/jogo-' + CAPA[it.jogo] + '.webp', alt: '' }), h('div', null, h('b', null, '🎮 Hora do jogo!'), h('span', null, it.nomeJogo + ' — este conta para o teste.'))),
      h('p', { class: 'pe-pergunta' }, it.pergunta), it.imagem ? h('img', { src: it.imagem, alt: '', class: 'rv-jt-img' }) : null, it.instr ? h('p', { class: 'pe-instr' }, it.instr) : null);
    const corpo = h('div', { class: 'rv-jogo-palco' }); caixa.append(corpo); el.append(caixa);
    let st = {}, ler = null;
    const desenhar = () => { corpo.innerHTML = ''; ler = M[it.jogo](corpo, it, st, () => aoMudar && aoMudar()); };
    desenhar();
    return {
      valor: () => ({ v: ler(), st: JSON.parse(JSON.stringify(st)) }),
      repor: x => { if (x && x.st) { st = x.st; desenhar(); } },
      respondido: () => ler() !== undefined,
      textoParaOuvir: () => it.pergunta + '. ' + (it.instr || ''),
    };
  }

  // ------------------------------------------------------------ corrigir e resposta certa
  function corrigir(it, x) {
    const v = x && x.v; if (v === undefined || v === null) return false;
    switch (it.jogo) {
      case 'abaco': return Number(v) === it.alvo;
      case 'binario': return parseInt(v, 2) === it.alvo;
      case 'reta': return Math.abs(v - it.alvo) / it.max <= 0.05;
      case 'relogio': return v === it.hh + ':' + it.mm;
      case 'fracao': return v === it.num;
      case 'feira': return v === it.preco;
      case 'coordenada': return v === it.c + ',' + it.l;
      case 'ordena': { const s = it.nums.slice().sort((a, b) => a - b); return v.every((x2, i) => x2 === s[i]); }
      case 'programa': return correr(it, v);
      case 'planificacao': { const c = it.figs.map((f, k) => U.eCubo(f) ? k : -1).filter(k => k >= 0); return c.length === v.length && c.every(k => v.includes(k)); }
    }
    return false;
  }
  function certa(it) {
    switch (it.jogo) {
      case 'abaco': return `${String(it.alvo).padStart(6, '0').split('').join(' ')} contas (CM DM UM C D U)`;
      case 'binario': return `${it.alvo.toString(2).padStart(5, '0')} (cartões 16 8 4 2 1)`;
      case 'reta': return `perto de ${U.fmt(it.alvo)}: ${Math.round(100 * it.alvo / it.max)}% do caminho entre 0 e ${U.fmt(it.max)}`;
      case 'relogio': return `ponteiro pequeno no ${it.hh}, ponteiro grande no ${it.mm ? it.mm / 5 : 12}`;
      case 'fracao': return `${it.num} partes pintadas em ${it.d}`;
      case 'feira': { let r = it.preco; const o = []; for (const [v, t] of DIN) while (r >= v) { o.push(t); r -= v; } return `${U.euros(it.preco / 100)}, por exemplo ${o.join(' + ')}`; }
      case 'coordenada': return `a casa (${'abcdefgh'[it.c]}, ${it.l + 1})`;
      case 'ordena': return it.nums.slice().sort((a, b) => a - b).map(U.fmt).join(' < ');
      case 'programa': return 'por exemplo: ' + caminho(it.ini, it.fim, new Set(it.pedras)).join(' ');
      case 'planificacao': return 'figura(s) ' + it.figs.map((f, k) => U.eCubo(f) ? 'ABCD'[k] : null).filter(Boolean).join(', ');
    }
    return '';
  }
  const explica = it => ({ abaco: 'Cada vareta é uma ordem: o número de contas é o algarismo.', binario: 'Soma as pintas dos cartões virados.', reta: 'Olha para o meio da reta e para os riscos de 10 em 10%.',
    relogio: 'O ponteiro grande marca os minutos (cada número = 5 min); o pequeno marca as horas.', fracao: 'O numerador diz quantas partes se pintam.', feira: 'Junta notas e moedas até ao preço, sem passar.',
    coordenada: 'Primeiro a letra (coluna), depois o número (linha).', ordena: 'Compara da esquerda para a direita, ordem a ordem.', programa: 'Segue as setas uma a uma e confirma que não bates em nenhuma pedra.',
    planificacao: 'Dobrada, cada quadrado tem de ficar numa face diferente do cubo.' })[it.jogo];

  R.jogosTeste = { gerar, escolher, montar, corrigir, certa, explica, TIPOS: Object.keys(GER), caminho, correr };
})();
