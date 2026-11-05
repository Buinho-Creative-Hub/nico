/* Nico · Percurso 4.º ano — jogos de Matemática, Programar e Estudo do Meio dos capítulos do concelho (Nov 2026).
 *
 *   feira        Feira de Ervidel: pagar a quantia certa, dar o troco, escolher dentro do orçamento (euros e cêntimos)
 *                { rondas: [{ tipo: 'pagar', preco } | { tipo: 'troco', preco, pago } | { tipo: 'orcamento', tem, n, produtos }] }
 *   saco         probabilidades: certo / possível / impossível, onde é mais provável, simular tiragens
 *   inquerito    dados: ouvir as respostas → contar → tabela de frequências → gráfico de barras → moda
 *   planificacao sólidos: montar a planificação de um cubo numa grelha (dobragem verificada) e contar faces/arestas/vértices
 *   tartaruga    programar o Nico a desenhar (avança, recua, roda 90°, repete): polígonos, perímetro, ângulos
 *   triagem      condições «se … senão se … senão»: vagonetas da mina, cartas do carteiro…
 *   circuito     Estudo do Meio · experimentar materiais num circuito e separar condutores e isoladores
 *   arqueologia  Estudo do Meio · escavar por camadas (mais fundo = mais antigo) e pôr os achados na linha do tempo
 *
 *   Registados em F.PC.oficina. Funções puras (testadas) em F.PC.terr.
 *   Geometria, gráficos e grelhas são SVG/HTML exato; não há ilustração desenhada aqui (a arte é do Ambrósio).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  const h = (...a) => F.PC.itens.h(...a);
  const som = n => { if (F.Som) F.Som.tocar(n); };
  const seg = t0 => Math.round((performance.now() - t0) / 100) / 10;
  const reg = (n, fn) => F.PC.oficina.registar(n, fn);
  const NS = 'http://www.w3.org/2000/svg';
  const sv = (tag, at, ...f) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); f.forEach(x => e.append(x.nodeType ? x : document.createTextNode(x))); return e; };

  // ------------------------------------------------------------ dinheiro (sempre em cêntimos inteiros)
  const cent = v => Math.round(Number(String(v).replace(',', '.')) * 100);
  const euros = c => (c / 100).toFixed(2).replace('.', ',') + ' €';
  const MOEDAS = [500, 200, 100, 50, 20, 10, 5, 2, 1];
  const nomeMoeda = c => c >= 100 ? (c / 100) + ' €' : c + ' c';

  reg('feira', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let r = 0, tent = 0, erros = 0, mostradas = 0, tabuleiro = [], escolha = new Set();
    const conta = h('div', { class: 'li-frase-num' }), enun = h('p', { class: 'pe-pergunta' }), corpo = h('div', { class: 'te-feira' });
    const bVer = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar');
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-instr' }, at.pergunta || 'Feira de Ervidel: ajuda o Nico na banca.'), conta, enun, corpo, h('div', { class: 'li-botoes' }, bVer)));
    const soma = () => tabuleiro.reduce((t, c) => t + c, 0);
    function carteira() {
      const tab = h('div', { class: 'te-tabuleiro', 'aria-label': 'Dinheiro no balcão', role: 'list' });
      const pintarTab = () => {
        tab.innerHTML = '';
        if (!tabuleiro.length) tab.append(h('small', null, 'O balcão está vazio. Clica nas moedas e notas para as pôr aqui.'));
        tabuleiro.forEach((c, i) => tab.append(h('button', { type: 'button', class: 'te-moeda' + (c >= 500 ? ' nota' : c >= 100 ? ' euro' : c >= 10 ? ' ouro' : ' cobre'), role: 'listitem', 'aria-label': `${nomeMoeda(c)} (tirar)`,
          onclick: () => { tabuleiro.splice(i, 1); pintarTab(); } }, nomeMoeda(c))));
      };
      const bolsa = h('div', { class: 'te-bolsa' }, MOEDAS.map(c => h('button', { type: 'button', class: 'te-moeda' + (c >= 500 ? ' nota' : c >= 100 ? ' euro' : c >= 10 ? ' ouro' : ' cobre'), 'aria-label': 'Pôr ' + nomeMoeda(c),
        onclick: () => { if (tabuleiro.length >= 15) return api.dizer('a_pensar', 'Já tens muitas moedas no balcão. Usa moedas maiores!'); tabuleiro.push(c); pintarTab(); } }, nomeMoeda(c))));
      pintarTab();
      return [h('small', null, 'Moedas e notas (clica para pôr no balcão):'), bolsa, h('small', null, 'No balcão (clica numa para a tirar):'), tab];
    }
    function mostrar() {
      const Rd = at.rondas[r]; tent = 0; tabuleiro = []; escolha = new Set(); corpo.innerHTML = ''; bVer.disabled = false;
      conta.textContent = `Cliente ${r + 1} de ${at.rondas.length}`;
      if (Rd.tipo === 'pagar') { enun.textContent = `${Rd.quem || 'O Nico'} compra ${Rd.oque} por ${euros(cent(Rd.preco))}. Põe no balcão a quantia certa, sem troco.`; corpo.append(...carteira()); }
      else if (Rd.tipo === 'troco') { enun.textContent = `${Rd.quem || 'Uma cliente'} compra ${Rd.oque} por ${euros(cent(Rd.preco))} e paga com ${euros(cent(Rd.pago))}. Dá-lhe o troco certo.`; corpo.append(...carteira()); }
      else {
        enun.textContent = `Tens ${euros(cent(Rd.tem))}. Escolhe ${Rd.n} coisas diferentes sem gastar mais do que tens. Depois escreve quanto sobra.`;
        const lista = h('div', { class: 'te-produtos' });
        Rd.produtos.forEach(([nome, p], i) => lista.append(h('label', { class: 'te-produto' }, h('input', { type: 'checkbox', onchange: e => { e.target.checked ? escolha.add(i) : escolha.delete(i); } }), h('span', null, nome), h('b', null, euros(cent(p))))));
        const sobra = h('input', { class: 'tc-entrada', type: 'text', inputmode: 'decimal', 'aria-label': 'Quanto sobra, em euros', placeholder: '0,00', style: 'width:120px' });
        corpo.append(lista, h('label', { class: 'li-plano' }, h('b', null, 'Sobram (€):'), sobra));
      }
      api.dizer('boas_vindas', Rd.tipo === 'orcamento' ? 'Faz as contas antes de escolher. Não há pressa!' : 'Começa pelas moedas maiores. 1 € são 100 cêntimos.');
    }
    function certoDa(Rd) { return Rd.tipo === 'pagar' ? cent(Rd.preco) : cent(Rd.pago) - cent(Rd.preco); }
    // a maneira com menos moedas de fazer uma quantia (para mostrar quando falha duas vezes)
    const decompor = c => { const o = []; MOEDAS.forEach(m => { while (c >= m) { o.push(m); c -= m; } }); return o; };
    bVer.onclick = () => {
      const Rd = at.rondas[r];
      if (Rd.tipo !== 'orcamento') {
        if (!tabuleiro.length) return api.dizer('curiosa', 'Põe primeiro moedas no balcão.');
        tent++; const alvo = certoDa(Rd), s = soma();
        if (s === alvo) { som('encaixe'); api.dizer('celebrar', `Certo: ${euros(s)}!`); return proxima(); }
        erros++;
        if (tent < 2) return api.dizer('a_pensar', s < alvo ? `Puseste ${euros(s)}. Falta ${euros(alvo - s)}.` : `Puseste ${euros(s)}. É ${euros(s - alvo)} a mais.`);
        mostradas++; tabuleiro = decompor(alvo); corpo.innerHTML = ''; corpo.append(...carteira());
        api.dizer('calma', `Uma maneira de fazer ${euros(alvo)}: ${tabuleiro.map(nomeMoeda).join(' + ')}.`); return proxima();
      }
      const escolhidos = [...escolha], total = escolhidos.reduce((t, i) => t + cent(Rd.produtos[i][1]), 0), tem = cent(Rd.tem);
      const inp = corpo.querySelector('input.tc-entrada'), sobra = inp.value.trim() ? cent(inp.value.replace('€', '')) : NaN;
      if (escolhidos.length !== Rd.n) return api.dizer('curiosa', `Escolhe ${Rd.n} coisas (tens ${escolhidos.length}).`);
      tent++;
      if (total <= tem && sobra === tem - total) { som('encaixe'); api.dizer('celebrar', `Gastaste ${euros(total)} e sobram ${euros(tem - total)}. Muito bem!`); return proxima(); }
      erros++;
      const msg = total > tem ? `Assim gastas ${euros(total)}: é mais do que ${euros(tem)}.` : `Gastas ${euros(total)}. Quanto sobra de ${euros(tem)}? Volta a fazer a subtração.`;
      if (tent < 2) return api.dizer('a_pensar', msg);
      mostradas++; api.dizer('calma', msg + (total <= tem ? ` Sobram ${euros(tem - total)}.` : '')); proxima();
    };
    function proxima() {
      bVer.disabled = true;
      if (r + 1 < at.rondas.length) { R.depois(() => { r++; mostrar(); }, 1100); return; }
      R.depois(() => api.concluir({ ok: mostradas === 0, tempo: seg(t0), falhas: erros, tentativas: erros ? 2 : 1 }, mostradas ? null : 'A banca do Nico nunca teve as contas tão certas!'), 900);
    }
    mostrar();
    return { fechar: () => R.limpar(), resolver: () => { mostradas = 0; erros = 0; r = at.rondas.length - 1; mostrar(); const Rd = at.rondas[r];
      if (Rd.tipo === 'orcamento') { const sol = Rd.solucao; sol.forEach(i => escolha.add(i)); corpo.querySelector('input.tc-entrada').value = euros(cent(Rd.tem) - sol.reduce((t, i) => t + cent(Rd.produtos[i][1]), 0)).replace(' €', ''); }
      else tabuleiro = decompor(certoDa(Rd));
      bVer.onclick(); } };
  });

  // ------------------------------------------------------------ probabilidades
  const COR = { azul: ['#2f6fdf', 'A'], vermelha: ['#d6336c', 'V'], amarela: ['#e5b100', 'M'], verde: ['#0e9f6e', 'D'] };
  function desenharSaco(s, rot) {
    const bolas = Object.entries(s).flatMap(([c, n]) => Array(n).fill(c));
    const W = Math.max(160, 34 * Math.min(bolas.length, 6) + 30), linhas = Math.ceil(bolas.length / 6);
    const g = sv('svg', { viewBox: `0 0 ${W} ${40 * linhas + 40}`, width: W, class: 'te-saco', role: 'img', 'aria-label': (rot ? rot + ': ' : '') + Object.entries(s).map(([c, n]) => `${n} ${c}${n === 1 ? '' : 's'}`).join(', ') });
    g.append(sv('rect', { x: 4, y: 18, width: W - 8, height: 40 * linhas + 16, rx: 18, fill: '#f6efe3', stroke: '#8a6a3a', 'stroke-width': 3 }));
    if (rot) g.append(sv('text', { x: W / 2, y: 14, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#333' }, rot));
    bolas.forEach((c, i) => { const x = 30 + (i % 6) * 34, y = 44 + Math.floor(i / 6) * 40;
      g.append(sv('circle', { cx: x, cy: y, r: 14, fill: COR[c][0], stroke: '#111', 'stroke-width': 1.5 }), sv('text', { x, y: y + 5, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 700, fill: '#fff' }, COR[c][1])); });
    return g;
  }
  reg('saco', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let r = 0, tent = 0, erros = 0, mostradas = 0, resp = null, sim = null;
    const conta = h('div', { class: 'li-frase-num' }), enun = h('p', { class: 'pe-pergunta' }), corpo = h('div', { class: 'te-sacos' }), ops = h('div', { class: 'li-opcoes', role: 'radiogroup' });
    const bVer = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Verificar');
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-instr' }, at.pergunta || 'Na tômbola da feira: o que é certo, possível ou impossível?'), h('p', { class: 'li-legenda' }, 'Legenda das bolas: A azul · V vermelha · M amarela · D verde'), conta, enun, corpo, ops, h('div', { class: 'li-botoes' }, bVer)));
    const opcoesDe = Rd => Rd.tipo === 'classificar' ? ['certo', 'possível', 'impossível'] : Rd.tipo === 'comparar' ? Rd.sacos.map((_, i) => 'Saco ' + 'ABC'[i]).concat(Rd.igual ? ['É igual nos dois'] : []) : Object.keys(Rd.saco);
    function certa(Rd) {
      if (Rd.tipo === 'classificar') { const n = Rd.saco[Rd.cor] || 0, t = Object.values(Rd.saco).reduce((a, b) => a + b, 0); return n === 0 ? 2 : n === t ? 0 : 1; }
      if (Rd.tipo === 'comparar') { const p = Rd.sacos.map(s => (s[Rd.cor] || 0) / Object.values(s).reduce((a, b) => a + b, 0)); if (p[0] === p[1]) return 2; return p[0] > p[1] ? 0 : 1; }
      const k = Object.keys(Rd.saco); let m = 0; k.forEach((c, i) => { if (sim[c] > sim[k[m]]) m = i; }); return m;
    }
    function mostrar() {
      const Rd = at.rondas[r]; tent = 0; resp = null; corpo.innerHTML = ''; ops.innerHTML = ''; bVer.disabled = false; sim = null;
      conta.textContent = `Pergunta ${r + 1} de ${at.rondas.length}`;
      if (Rd.tipo === 'classificar') { enun.textContent = `Tirar, sem ver, uma bola ${Rd.cor} deste saco é um acontecimento…`; corpo.append(desenharSaco(Rd.saco)); }
      else if (Rd.tipo === 'comparar') { enun.textContent = `Em que saco é mais provável tirar uma bola ${Rd.cor}?`; Rd.sacos.forEach((s, i) => corpo.append(desenharSaco(s, 'Saco ' + 'ABC'[i]))); }
      else {
        enun.textContent = `Tira ${Rd.n} vezes uma bola do saco (e volta a pô-la lá dentro). Qual saiu mais vezes?`;
        const tab = h('table', { class: 'te-tab' });
        const bSim = h('button', { type: 'button', class: 'btn btn-escuro' }, `🎲 Tirar ${Rd.n} vezes`);
        bSim.onclick = () => {
          const bolas = Object.entries(Rd.saco).flatMap(([c, n]) => Array(n).fill(c)); sim = {}; Object.keys(Rd.saco).forEach(c => { sim[c] = 0; });
          for (let i = 0; i < Rd.n; i++) sim[bolas[Math.floor(Math.random() * bolas.length)]]++;
          const vals = Object.values(sim); if (vals.filter(v => v === Math.max(...vals)).length > 1) return bSim.onclick();   // sem empates: a pergunta tem uma resposta
          tab.innerHTML = ''; tab.append(h('tr', null, h('th', null, 'Cor'), Object.keys(sim).map(c => h('th', null, c))), h('tr', null, h('th', null, 'Vezes'), Object.values(sim).map(v => h('td', null, String(v)))));
          bSim.disabled = true; pintarOps(); som('encaixe');
        };
        corpo.append(desenharSaco(Rd.saco), h('div', null, bSim), tab);
        api.dizer('curiosa', 'Antes de tirar: qual achas que vai sair mais? Porquê?');
        return;
      }
      pintarOps();
    }
    function pintarOps() {
      const Rd = at.rondas[r]; ops.innerHTML = '';
      opcoesDe(Rd).forEach((o, j) => ops.append(h('label', null, h('input', { type: 'radio', name: 'saco-' + at.id + '-' + r, onchange: () => { resp = j; } }), ' ', o)));
    }
    bVer.onclick = () => {
      const Rd = at.rondas[r];
      if (Rd.tipo === 'simular' && !sim) return api.dizer('curiosa', 'Primeiro carrega no 🎲 para tirar as bolas.');
      if (resp === null) return api.dizer('curiosa', 'Escolhe uma resposta.');
      tent++; const c = certa(Rd);
      if (resp === c) { som('encaixe'); api.dizer('celebrar', Rd.porque || 'Isso mesmo!'); return proxima(); }
      erros++;
      if (tent < 2) return api.dizer('a_pensar', Rd.tipo === 'classificar' ? 'Conta as bolas dessa cor. Há alguma? São todas dessa cor?' : Rd.tipo === 'comparar' ? 'Compara: em cada saco, quantas bolas dessa cor há em quantas bolas ao todo?' : 'Lê a tabela: qual é o número maior?');
      mostradas++; api.dizer('calma', 'A resposta certa é: ' + opcoesDe(Rd)[c] + '. ' + (Rd.porque || '')); proxima();
    };
    function proxima() {
      bVer.disabled = true;
      if (r + 1 < at.rondas.length) { R.depois(() => { r++; mostrar(); }, 1100); return; }
      R.depois(() => api.concluir({ ok: mostradas === 0, tempo: seg(t0), falhas: erros, tentativas: erros ? 2 : 1 }, mostradas ? null : 'Já percebes de sorte e de azar como um matemático!'), 900);
    }
    mostrar();
    return { fechar: () => R.limpar(), resolver: () => { mostradas = 0; erros = 0; r = at.rondas.length - 1; mostrar(); const Rd = at.rondas[r]; if (Rd.tipo === 'simular') { sim = Object.fromEntries(Object.keys(Rd.saco).map((c, i) => [c, i === 0 ? 9 : 1])); } resp = certa(Rd); bVer.onclick(); } };
  });

  // ------------------------------------------------------------ inquérito (dados)
  function moda(lista) { const c = {}; lista.forEach(x => { c[x] = (c[x] || 0) + 1; }); const m = Math.max(...Object.values(c)); return Object.keys(c).filter(k => c[k] === m); }
  reg('inquerito', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    const cats = at.categorias, N = at.respostas.length; let fase = 0, i = 0, erros = 0, mostradas = 0, tent = 0;
    const marcas = cats.map(() => 0), alturas = cats.map(() => 0);
    const freq = cats.map(c => at.respostas.filter(x => x === c).length), modas = moda(at.respostas);
    const corpo = h('div', { class: 'te-inq' }), faseEl = h('div', { class: 'of-fases' });
    const NOMES = ['Recolher', 'Tabela', 'Gráfico', 'Moda'];
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta), faseEl, corpo));
    const pintarFases = () => { faseEl.innerHTML = ''; NOMES.forEach((f, k) => faseEl.append(h('span', { class: k < fase ? 'feita' : k === fase ? 'atual' : '' }, `${k + 1}. ${f}`))); };
    const tally = n => '||||| '.repeat(Math.floor(n / 5)).replace(/\|\|\|\|\| /g, '卌 ') + '|'.repeat(n % 5);
    function mostrar() {
      pintarFases(); corpo.innerHTML = ''; tent = 0;
      if (fase === 0) {
        const pessoa = at.pessoas ? at.pessoas[i % at.pessoas.length] : `Pessoa ${i + 1}`;
        corpo.append(h('p', { class: 'pe-instr' }, `Pergunta do inquérito: «${at.tema}» Lê a resposta de cada pessoa e faz um risco na categoria certa.`),
          h('div', { class: 'te-cartao' }, h('small', null, `${i + 1} de ${N} · ${pessoa}`), h('strong', null, '«' + (at.ditos ? at.ditos[i] : at.respostas[i]) + '»')),
          h('div', { class: 'te-cats' }, cats.map((c, k) => h('button', { type: 'button', class: 'btn btn-texto', onclick: () => {
            if (c !== at.respostas[i]) { erros++; return api.dizer('a_pensar', 'Lê outra vez a resposta: em que categoria cabe?'); }
            marcas[k]++; som('encaixe'); i++; if (i >= N) { fase = 1; } mostrar();
          } }, h('span', null, c), h('code', null, tally(marcas[k]) || '—')))));
      } else if (fase === 1) {
        const ins = cats.map((c, k) => h('input', { class: 'tc-entrada', type: 'text', inputmode: 'numeric', 'aria-label': 'Frequência de ' + c, style: 'width:70px' }));
        const tot = h('input', { class: 'tc-entrada', type: 'text', inputmode: 'numeric', 'aria-label': 'Total', style: 'width:70px' });
        corpo.append(h('p', { class: 'pe-instr' }, 'Conta os riscos e preenche a tabela de frequências.'),
          h('table', { class: 'te-tab' }, h('tr', null, h('th', null, at.coluna || 'Resposta'), h('th', null, 'Contagem'), h('th', null, 'Frequência')),
            cats.map((c, k) => h('tr', null, h('td', null, c), h('td', null, h('code', null, tally(marcas[k]))), h('td', null, ins[k]))), h('tr', null, h('th', null, 'Total'), h('td'), h('td', null, tot))),
          h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul', onclick: () => {
            tent++;
            const ok = ins.every((x, k) => Number(x.value) === freq[k]) && Number(tot.value) === N;
            if (ok) { som('encaixe'); fase = 2; return mostrar(); }
            erros++;
            if (tent < 2) return api.dizer('a_pensar', 'Há uma frequência ou o total que não bate certo. Conta os riscos de cinco em cinco. O total é a soma de todas.');
            mostradas++; ins.forEach((x, k) => { x.value = freq[k]; }); tot.value = N; api.dizer('calma', 'Pus os números certos. Confere com os riscos.'); R.depois(() => { fase = 2; mostrar(); }, 1600);
          } }, 'Verificar a tabela')));
      } else if (fase === 2) {
        const max = Math.max(...freq) + 1, W = 90 * cats.length + 70, H = 34 * max + 60, svg = sv('svg', { viewBox: `0 0 ${W} ${H}`, width: Math.min(W, 640), class: 'te-graf', role: 'img', 'aria-label': 'Gráfico de barras para construir' });
        const pintar = () => {
          svg.innerHTML = '';
          for (let y = 0; y <= max; y++) { const yy = H - 40 - y * 34; svg.append(sv('line', { x1: 50, x2: W - 10, y1: yy, y2: yy, stroke: '#ddd' }), sv('text', { x: 40, y: yy + 5, 'text-anchor': 'end', 'font-size': 13 }, String(y))); }
          cats.forEach((c, k) => { const x = 70 + k * 90;
            svg.append(sv('rect', { x, y: H - 40 - alturas[k] * 34, width: 50, height: alturas[k] * 34, fill: '#7b2fd1' }), sv('text', { x: x + 25, y: H - 18, 'text-anchor': 'middle', 'font-size': 13 }, c));
            for (let y = 1; y <= max; y++) { const z = sv('rect', { x, y: H - 40 - y * 34, width: 50, height: 34, fill: 'transparent', style: 'cursor:pointer' }); z.addEventListener('click', () => { alturas[k] = alturas[k] === y ? y - 1 : y; pintar(); }); svg.append(z); } });
        };
        const teclas = h('div', { class: 'te-cats' }, cats.map((c, k) => h('span', null, c, ' ', h('button', { type: 'button', class: 'btn btn-texto', 'aria-label': 'Baixar a barra de ' + c, onclick: () => { alturas[k] = Math.max(0, alturas[k] - 1); pintar(); } }, '▼'), h('button', { type: 'button', class: 'btn btn-texto', 'aria-label': 'Subir a barra de ' + c, onclick: () => { alturas[k] = Math.min(max, alturas[k] + 1); pintar(); } }, '▲'))));
        pintar();
        corpo.append(h('p', { class: 'pe-instr' }, 'Constrói o gráfico de barras: clica na grelha à altura certa de cada barra (ou usa ▲ ▼).'), svg, teclas,
          h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul', onclick: () => {
            tent++;
            if (alturas.every((a, k) => a === freq[k])) { som('encaixe'); fase = 3; return mostrar(); }
            erros++;
            if (tent < 2) return api.dizer('a_pensar', 'Compara cada barra com a frequência da tabela: ' + cats.map((c, k) => `${c} ${freq[k]}`).join(', ') + '.');
            mostradas++; freq.forEach((f, k) => { alturas[k] = f; }); pintar(); R.depois(() => { fase = 3; mostrar(); }, 1600);
          } }, 'Verificar o gráfico')));
      } else {
        corpo.append(h('p', { class: 'pe-instr' }, 'A moda é a resposta que aparece mais vezes. Qual é a moda deste inquérito?'),
          h('div', { class: 'te-cats' }, cats.map(c => h('button', { type: 'button', class: 'btn btn-texto', onclick: () => {
            tent++;
            if (modas.includes(c)) { som('sucesso'); return acabar(); }
            erros++;
            if (tent < 2) return api.dizer('a_pensar', 'Olha para o gráfico: qual é a barra mais alta?');
            mostradas++; api.dizer('calma', 'A moda é ' + modas.join(' e ') + ': é a barra mais alta.'); acabar();
          } }, c))));
      }
    }
    function acabar() {
      corpo.append(h('p', { class: 'li-feita' }, `Moda: ${modas.join(' e ')} · ${N} respostas`));
      corpo.querySelectorAll('button').forEach(b => { b.disabled = true; });
      api.concluir({ ok: mostradas === 0, tempo: seg(t0), falhas: erros, tentativas: erros ? 2 : 1 }, mostradas ? null : (at.conclusao || 'Inquérito feito! A Junta já tem os números para decidir.'));
    }
    mostrar();
    return { fechar: () => R.limpar(), resolver: () => { mostradas = 0; fase = 3; mostrar(); acabar(); } };
  });

  // ------------------------------------------------------------ planificações do cubo
  // dobrar a planificação «a rolar» o cubo: cada quadrado fica com a face que está em baixo; são 6 faces diferentes?
  function redeCubo(cel) {
    if (cel.length !== 6) return false;
    const k = ([r, c]) => r + ',' + c, S = new Set(cel.map(k));
    const ini = { U: 'U', D: 'D', N: 'N', S: 'S', E: 'E', W: 'W' };
    const rolar = (o, d) => d === 'E' ? { ...o, D: o.E, E: o.U, U: o.W, W: o.D } : d === 'W' ? { ...o, D: o.W, W: o.U, U: o.E, E: o.D }
      : d === 'N' ? { ...o, D: o.N, N: o.U, U: o.S, S: o.D } : { ...o, D: o.S, S: o.U, U: o.N, N: o.D };
    const vis = new Map([[k(cel[0]), ini]]), fila = [cel[0]];
    while (fila.length) {
      const [r, c] = fila.shift(), o = vis.get(k([r, c]));
      [[r, c + 1, 'E'], [r, c - 1, 'W'], [r - 1, c, 'N'], [r + 1, c, 'S']].forEach(([rr, cc, d]) => { const kk = k([rr, cc]); if (S.has(kk) && !vis.has(kk)) { vis.set(kk, rolar(o, d)); fila.push([rr, cc]); } });
    }
    if (vis.size !== 6) return false;
    return new Set([...vis.values()].map(o => o.D)).size === 6;
  }
  const SOLIDOS = {
    cubo: { nome: 'cubo', f: 6, a: 12, v: 8, pts: [[40, 70], [120, 70], [120, 150], [40, 150], [80, 40], [160, 40], [160, 120], [80, 120]], ar: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]], esc: [6, 7, 2] },
    prisma3: { nome: 'prisma triangular', f: 5, a: 9, v: 6, pts: [[30, 150], [110, 150], [70, 85], [90, 120], [170, 120], [130, 55]], ar: [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [0, 3], [1, 4], [2, 5]], esc: [3] },
    piramide4: { nome: 'pirâmide quadrangular', f: 5, a: 8, v: 5, pts: [[30, 150], [130, 150], [170, 115], [70, 115], [100, 30]], ar: [[0, 1], [1, 2], [2, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4]], esc: [3] },
    piramide3: { nome: 'pirâmide triangular', f: 4, a: 6, v: 4, pts: [[30, 150], [150, 150], [110, 110], [95, 35]], ar: [[0, 1], [1, 2], [2, 0], [0, 3], [1, 3], [2, 3]], esc: [2] },
  };
  function desenharSolido(id) {
    const S = SOLIDOS[id], g = sv('svg', { viewBox: '0 0 200 180', width: 200, class: 'te-solido', role: 'img', 'aria-label': S.nome });
    S.ar.forEach(([a, b]) => { const tracejada = S.esc.includes(a) || S.esc.includes(b); g.append(sv('line', { x1: S.pts[a][0], y1: S.pts[a][1], x2: S.pts[b][0], y2: S.pts[b][1], stroke: '#2b2b2b', 'stroke-width': 3, 'stroke-dasharray': tracejada ? '6 5' : 'none' })); });
    return g;
  }
  reg('planificacao', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let parte = at.rede === false ? 1 : 0, tent = 0, erros = 0, mostradas = 0, s = 0; const cel = new Set();
    const L = at.linhas || 5, C = at.colunas || 6;
    const corpo = h('div', { class: 'te-plan' });
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta), corpo));
    function mostrar() {
      corpo.innerHTML = ''; tent = 0;
      if (parte === 0) {
        const grelha = h('div', { class: 'te-grelha', role: 'grid', 'aria-label': 'Grelha para a planificação', style: `grid-template-columns:repeat(${C},44px)` });
        const pintar = () => { grelha.innerHTML = ''; for (let r = 0; r < L; r++) for (let c = 0; c < C; c++) { const k = r + ',' + c;
          grelha.append(h('button', { type: 'button', class: 'te-cel' + (cel.has(k) ? ' on' : ''), 'aria-pressed': cel.has(k) ? 'true' : 'false', 'aria-label': `Linha ${r + 1}, coluna ${c + 1}`,
            onclick: () => { cel.has(k) ? cel.delete(k) : cel.size < 6 && cel.add(k); pintar(); grelha.querySelector(`[aria-label="Linha ${r + 1}, coluna ${c + 1}"]`).focus(); } })); }
          conta.textContent = `${cel.size} de 6 quadrados`; };
        const conta = h('small');
        corpo.append(h('p', { class: 'pe-instr' }, 'Pinta 6 quadrados ligados pelos lados que, dobrados, fecham um cubo. Clica para pintar ou tirar.'), grelha, conta,
          h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul', onclick: () => {
            if (cel.size !== 6) return api.dizer('curiosa', 'O cubo tem 6 faces: pinta 6 quadrados.');
            tent++; const ok = redeCubo([...cel].map(k => k.split(',').map(Number)));
            if (ok) { som('sucesso'); api.dizer('celebrar', 'Dobra, dobra… fecha! É mesmo a planificação de um cubo.'); return R.depois(() => { parte = 1; s = 0; mostrar(); }, 1200); }
            erros++;
            if (tent < 3) return api.dizer('a_pensar', 'Ao dobrar, duas faces ficam uma em cima da outra (ou o cubo fica aberto). Experimenta uma cruz: 4 em fila e 1 de cada lado.');
            mostradas++; cel.clear(); ['1,1', '0,2', '1,2', '2,2', '3,2', '1,3'].forEach(k => cel.add(k)); pintar(); api.dizer('calma', 'Uma planificação que funciona: a cruz. Há 11 planificações diferentes do cubo!');
            R.depois(() => { parte = 1; s = 0; mostrar(); }, 2200);
          } }, 'Dobrar')));
        pintar();
      } else {
        const id = at.solidos[s], S = SOLIDOS[id];
        const ins = ['faces', 'arestas', 'vértices'].map(n => h('input', { class: 'tc-entrada', type: 'text', inputmode: 'numeric', 'aria-label': 'Número de ' + n, style: 'width:70px' }));
        corpo.append(h('p', { class: 'pe-instr' }, `Sólido ${s + 1} de ${at.solidos.length}: ${S.nome}. As linhas tracejadas são as arestas escondidas. Conta faces, arestas e vértices.`), desenharSolido(id),
          h('div', { class: 'te-cats' }, ['Faces', 'Arestas', 'Vértices'].map((n, k) => h('label', { class: 'li-plano' }, h('b', null, n), ins[k]))),
          h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul', onclick: () => {
            tent++; const v = ins.map(i => Number(i.value)), c = [S.f, S.a, S.v];
            if (v.every((x, k) => x === c[k])) { som('encaixe'); return seguinte(); }
            erros++;
            if (tent < 2) return api.dizer('a_pensar', 'Faces são as «paredes», arestas são as linhas onde duas faces se encontram, vértices são os bicos. Não te esqueças das escondidas.');
            mostradas++; ins.forEach((i, k) => { i.value = c[k]; }); api.dizer('calma', `O ${S.nome} tem ${S.f} faces, ${S.a} arestas e ${S.v} vértices.`); R.depois(seguinte, 1800);
          } }, 'Verificar')));
      }
    }
    function seguinte() { if (s + 1 < at.solidos.length) { s++; mostrar(); } else acabar(); }
    function acabar() { corpo.querySelectorAll('button').forEach(b => { b.disabled = true; }); api.concluir({ ok: mostradas === 0, tempo: seg(t0), falhas: erros, tentativas: erros ? 2 : 1 }, mostradas ? null : 'As caixas da feira já estão todas montadas!'); }
    mostrar();
    return { fechar: () => R.limpar(), resolver: () => { mostradas = 0; acabar(); } };
  });

  // ------------------------------------------------------------ tartaruga (desenhar com blocos)
  // programa: [{ op: 'avanca', n } | { op: 'recua', n } | { op: 'dir' } | { op: 'esq' } | { op: 'repete', n, corpo: [...] }]
  function correrTartaruga(prog, ini) {
    let [x, y] = ini || [0, 0], d = 0; const segs = [], passos = []; let n = 0;
    const DX = [0, 1, 0, -1], DY = [-1, 0, 1, 0];
    const exec = lista => { for (const b of lista) { if (++n > 400) throw new Error('longo');
      if (b.op === 'avanca' || b.op === 'recua') { const s = b.op === 'avanca' ? 1 : -1; for (let i = 0; i < b.n; i++) { const nx = x + s * DX[d], ny = y + s * DY[d]; segs.push([x, y, nx, ny]); x = nx; y = ny; } }
      else if (b.op === 'dir') d = (d + 1) % 4; else if (b.op === 'esq') d = (d + 3) % 4;
      else if (b.op === 'repete') for (let i = 0; i < b.n; i++) exec(b.corpo || []);
      passos.push({ x, y, d, segs: segs.length }); } };
    try { exec(prog); } catch (e) { return { erro: 'longo', segs, passos, fim: [x, y], d }; }
    return { segs, passos, fim: [x, y], d };
  }
  const chaveSeg = ([a, b, c, d]) => (a < c || (a === c && b < d)) ? `${a},${b},${c},${d}` : `${c},${d},${a},${b}`;
  const contarBlocos = p => p.reduce((t, b) => t + 1 + (b.corpo ? contarBlocos(b.corpo) : 0), 0);
  function verificarTartaruga(at, prog) {
    const r = correrTartaruga(prog, at.inicio);
    if (r.erro) return { ok: false, crit: [['O programa acaba', false]] };
    const crit = [];
    if (at.alvo.segs) {
      const A = new Set(r.segs.map(chaveSeg)), B = new Set();
      at.alvo.segs.forEach(([a, b, c, d]) => { const dx = Math.sign(c - a), dy = Math.sign(d - b); let x = a, y = b; while (x !== c || y !== d) { B.add(chaveSeg([x, y, x + dx, y + dy])); x += dx; y += dy; } });
      crit.push(['Desenha todas as linhas do modelo', [...B].every(k => A.has(k))], ['Não desenha linhas a mais', [...A].every(k => B.has(k))]);
    }
    if (at.alvo.lados) {
      // juntar segmentos seguidos na mesma direção → lados
      const lados = []; r.segs.forEach(s => { const dir = [s[2] - s[0], s[3] - s[1]].join(); const u = lados[lados.length - 1]; if (u && u.dir === dir) u.n++; else lados.push({ dir, n: 1 }); });
      if (lados.length > 1 && lados[0].dir === lados[lados.length - 1].dir) { lados[0].n += lados.pop().n; }
      const fechado = r.segs.length > 0 && r.fim[0] === (at.inicio || [0, 0])[0] && r.fim[1] === (at.inicio || [0, 0])[1];
      crit.push(['A figura fecha (o Nico volta ao início)', fechado], [`Tem ${at.alvo.lados} lados`, lados.length === at.alvo.lados]);
      if (at.alvo.medidas) { const m = lados.map(l => l.n).sort((a, b) => a - b).join(), q = at.alvo.medidas.slice().sort((a, b) => a - b).join(); crit.push([`Lados com ${at.alvo.medidas.join(', ')} passos`, m === q]); }
      if (at.alvo.perimetro) crit.push([`Perímetro ${at.alvo.perimetro} passos`, r.segs.length === at.alvo.perimetro]);
    }
    if (at.maxBlocos) crit.push([`No máximo ${at.maxBlocos} blocos`, contarBlocos(prog) <= at.maxBlocos]);
    return { ok: crit.every(c => c[1]), crit, r };
  }
  const NOME_B = { avanca: 'avança', recua: 'recua', dir: 'roda 90° para a direita', esq: 'roda 90° para a esquerda', repete: 'repete' };
  reg('tartaruga', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    const rascunho = api.rascunho && api.rascunho.ler();
    let prog = rascunho ? JSON.parse(JSON.stringify(rascunho)) : JSON.parse(JSON.stringify(at.inicial || []));
    let alvoCont = null, tent = 0, execs = 0, mostrada = false, ultimo = null;
    const W = at.tamanho || 10, CEL = 34;
    const svg = sv('svg', { viewBox: `0 0 ${W * CEL + 20} ${W * CEL + 20}`, width: Math.min(W * CEL + 20, 320), class: 'te-tart', role: 'img', 'aria-label': 'Folha quadriculada do Nico' });
    const editor = h('div', { class: 'te-prog', 'aria-label': 'Programa', role: 'list' });
    const crit = h('ul', { class: 'it-lista' });
    const bExp = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '▶ Experimentar');
    const bPasso = h('button', { type: 'button', class: 'btn btn-texto' }, '👣 Um passo');
    const bLimpar = h('button', { type: 'button', class: 'btn btn-texto' }, 'Recomeçar');
    const ajudaSol = h('button', { type: 'button', class: 'btn btn-texto', hidden: true }, 'Ver uma solução');
    const paleta = h('div', { class: 'te-paleta' }, (at.blocos || ['avanca', 'dir', 'esq', 'repete']).map(op => h('button', { type: 'button', class: 'te-b te-op-' + op, onclick: () => juntar(op) }, '+ ' + NOME_B[op])));
    const gravar = () => { if (api.rascunho) api.rascunho.gravar(prog); };
    function juntar(op) {
      const b = op === 'avanca' || op === 'recua' ? { op, n: 1 } : op === 'repete' ? { op, n: 4, corpo: [] } : { op };
      (alvoCont || prog).push(b); gravar(); pintarProg(); desenhar([]);
    }
    function numSel(b, max) { const s = h('select', { 'aria-label': 'Número' }, Array.from({ length: max }, (_, i) => h('option', { value: i + 1, selected: b.n === i + 1 ? true : null }, String(i + 1)))); s.onchange = () => { b.n = Number(s.value); gravar(); desenhar([]); }; return s; }
    function linhaBloco(b, lista, i, nivel) {
      const mover = d => { const j = i + d; if (j < 0 || j >= lista.length) return; [lista[i], lista[j]] = [lista[j], lista[i]]; gravar(); pintarProg(); };
      const ctl = h('span', { class: 'te-ctl' }, h('button', { type: 'button', 'aria-label': 'Subir', onclick: () => mover(-1) }, '▲'), h('button', { type: 'button', 'aria-label': 'Descer', onclick: () => mover(1) }, '▼'),
        h('button', { type: 'button', 'aria-label': 'Apagar', onclick: () => { lista.splice(i, 1); if (alvoCont === b.corpo) alvoCont = null; gravar(); pintarProg(); desenhar([]); } }, '✕'));
      const row = h('div', { class: 'te-b te-op-' + b.op, role: 'listitem', style: `margin-left:${nivel * 22}px` }, NOME_B[b.op], ' ',
        b.n != null ? numSel(b, b.op === 'repete' ? 8 : 9) : null, b.op === 'avanca' || b.op === 'recua' ? ' passos' : b.op === 'repete' ? ' vezes' : '', ctl);
      const out = [row];
      if (b.op === 'repete') {
        b.corpo.forEach((x, k) => out.push(...linhaBloco(x, b.corpo, k, nivel + 1)));
        out.push(h('button', { type: 'button', class: 'te-ranhura' + (alvoCont === b.corpo ? ' sel' : ''), style: `margin-left:${(nivel + 1) * 22}px`, onclick: () => { alvoCont = alvoCont === b.corpo ? null : b.corpo; pintarProg(); } },
          alvoCont === b.corpo ? '▸ os blocos novos entram aqui (dentro do repete)' : 'clica aqui para juntar blocos dentro do repete'));
      }
      return out;
    }
    function pintarProg() {
      editor.innerHTML = '';
      editor.append(h('div', { class: 'te-b te-ini' }, 'ao começar'));
      prog.forEach((b, i) => editor.append(...linhaBloco(b, prog, i, 1)));
      editor.append(h('button', { type: 'button', class: 'te-ranhura' + (!alvoCont ? ' sel' : ''), style: 'margin-left:22px', onclick: () => { alvoCont = null; pintarProg(); } }, !alvoCont ? '▸ os blocos novos entram aqui' : 'clica aqui para juntar blocos no fim'));
      editor.append(h('small', null, `${contarBlocos(prog)} blocos` + (at.maxBlocos ? ` (máximo ${at.maxBlocos})` : '')));
    }
    const px = v => 10 + v * CEL;
    function desenhar(segs, pos) {
      svg.innerHTML = '';
      for (let i = 0; i <= W; i++) svg.append(sv('line', { x1: px(i), x2: px(i), y1: px(0), y2: px(W), stroke: '#e3e3e3' }), sv('line', { y1: px(i), y2: px(i), x1: px(0), x2: px(W), stroke: '#e3e3e3' }));
      const A = at.alvo.segs || at.alvo.modelo;
      if (A) A.forEach(([a, b, c, d]) => svg.append(sv('line', { x1: px(a), y1: px(b), x2: px(c), y2: px(d), stroke: '#bcd3ff', 'stroke-width': 9, 'stroke-linecap': 'round' })));
      segs.forEach(([a, b, c, d]) => svg.append(sv('line', { x1: px(a), y1: px(b), x2: px(c), y2: px(d), stroke: '#d6336c', 'stroke-width': 4, 'stroke-linecap': 'round' })));
      const [x, y] = pos ? [pos.x, pos.y] : (at.inicio || [0, 0]), d = pos ? pos.d : 0;
      const ang = d * 90;
      svg.append(sv('g', { transform: `translate(${px(x)},${px(y)}) rotate(${ang})` }, sv('circle', { r: 11, fill: '#0e9f6e', stroke: '#fff', 'stroke-width': 2 }), sv('path', { d: 'M0,-16 L7,-4 L-7,-4 Z', fill: '#0e9f6e' })));
    }
    function pintarCrit(v) { crit.innerHTML = ''; v.crit.forEach(([n, ok]) => crit.append(h('li', { class: ok ? 'ok' : '' }, n))); }
    function correr(animado) {
      const v = verificarTartaruga(at, prog); execs++;
      const r = v.r || correrTartaruga(prog, at.inicio);
      if (!animado) { desenhar(r.segs, r.passos[r.passos.length - 1]); terminar(v); return; }
      let k = 0; bExp.disabled = true;
      const passo = () => { if (k >= r.passos.length) { bExp.disabled = false; terminar(v); return; } const p = r.passos[k++]; desenhar(r.segs.slice(0, p.segs), p); R.depois(passo, 260); };
      passo();
    }
    function terminar(v) {
      pintarCrit(v); ultimo = v;
      if (v.ok) { som('sucesso'); [bExp, bPasso, bLimpar].forEach(b => { b.disabled = true; }); paleta.querySelectorAll('button').forEach(b => { b.disabled = true; });
        return api.concluir({ ok: true, tempo: seg(t0), execucoes: execs, tentativas: tent + 1, modo: mostrada ? 'mostrada' : 'autonomo', valor: JSON.stringify(prog) }, at.feito || 'Desenho perfeito!'); }
      tent++; if (tent >= 2) ajudaSol.hidden = false;
      api.dizer('a_pensar', 'Vê a lista: o que ainda falta? Usa 👣 Um passo para seguir o Nico.');
    }
    let passoK = 0, passoR = null;
    bExp.onclick = () => { passoR = null; correr(true); };
    bPasso.onclick = () => {
      if (!passoR) { passoR = correrTartaruga(prog, at.inicio); passoK = 0; }
      if (passoK >= passoR.passos.length) { passoR = null; return correr(false); }
      const p = passoR.passos[passoK++]; desenhar(passoR.segs.slice(0, p.segs), p);
    };
    bLimpar.onclick = () => { if (!confirmar()) return; prog = JSON.parse(JSON.stringify(at.inicial || [])); alvoCont = null; gravar(); pintarProg(); desenhar([]); };
    const confirmar = () => typeof window.confirm !== 'function' || window.confirm('Recomeçar o programa?');
    ajudaSol.onclick = () => { prog = JSON.parse(JSON.stringify(at.solucao)); mostrada = true; alvoCont = null; pintarProg(); correr(true); };
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta),
      h('div', { class: 'te-tart-caixa' }, h('div', null, svg, h('p', { class: 'li-legenda' }, 'Azul-claro: o modelo · rosa: o que o Nico desenha · cada lado da quadrícula é 1 passo')),
        h('div', { class: 'te-tart-prog' }, paleta, editor, crit, h('div', { class: 'li-botoes' }, bExp, bPasso, bLimpar, ajudaSol)))));
    pintarProg(); desenhar([]);
    R.depois(() => api.dizer('boas_vindas', at.boasVindas || 'Junta blocos para o Nico desenhar. Ele começa virado para cima (norte).'), 30);
    return { fechar: () => R.limpar(), resolver: () => { prog = JSON.parse(JSON.stringify(at.solucao)); pintarProg(); correr(false); } };
  });

  // ------------------------------------------------------------ triagem com condições
  // programa: { regras: [{ se: valor, vai: destino }], senao: destino }
  function correrTriagem(prog, itens) { return itens.map(([tipo]) => { const r = prog.regras.find(x => x.se === tipo); return r ? r.vai : prog.senao; }); }
  reg('triagem', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let prog = JSON.parse(JSON.stringify(at.inicial || { regras: [{ se: at.condicoes[0], vai: at.destinos[0][0] }], senao: at.destinos[1][0] }));
    let tent = 0, execs = 0, mostrada = false;
    const nomeD = id => at.destinos.find(d => d[0] === id)[1];
    const editor = h('div', { class: 'te-prog' }), pista = h('div', { class: 'te-pista' }), bExp = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '▶ Experimentar');
    const bSol = h('button', { type: 'button', class: 'btn btn-texto', hidden: true }, 'Ver uma solução');
    const selD = (v, f) => { const s = h('select', { 'aria-label': 'Destino' }, at.destinos.map(([id, n]) => h('option', { value: id, selected: id === v ? true : null }, n))); s.onchange = () => f(s.value); return s; };
    const selC = (v, f) => { const s = h('select', { 'aria-label': 'Condição' }, at.condicoes.map(c => h('option', { value: c, selected: c === v ? true : null }, c))); s.onchange = () => f(s.value); return s; };
    function pintar() {
      editor.innerHTML = '';
      editor.append(h('div', { class: 'te-b te-ini' }, `para cada ${at.item || 'vagoneta'}`));
      prog.regras.forEach((r, i) => editor.append(h('div', { class: 'te-b te-se', style: 'margin-left:22px' }, i === 0 ? (at.se || 'se a carga for') + ' ' : 'senão, ' + (at.se || 'se a carga for') + ' ', selC(r.se, v => { r.se = v; }), ' então vai para ', selD(r.vai, v => { r.vai = v; }),
        prog.regras.length > 1 ? h('span', { class: 'te-ctl' }, h('button', { type: 'button', 'aria-label': 'Apagar esta condição', onclick: () => { prog.regras.splice(i, 1); pintar(); } }, '✕')) : null)));
      editor.append(h('div', { class: 'te-b te-se', style: 'margin-left:22px' }, 'senão, vai para ', selD(prog.senao, v => { prog.senao = v; })));
      if (prog.regras.length < (at.maxRegras || 1)) editor.append(h('button', { type: 'button', class: 'te-ranhura', style: 'margin-left:22px', onclick: () => { prog.regras.push({ se: at.condicoes[0], vai: at.destinos[0][0] }); pintar(); } }, '+ juntar «senão, se…»'));
    }
    function desenharPista(destinos) {
      pista.innerHTML = '';
      const cols = at.destinos.map(([id, n]) => h('div', { class: 'te-dest' }, h('strong', null, n)));
      at.itens.forEach(([tipo, nome], i) => {
        const d = destinos ? destinos[i] : null, certo = at.certo[tipo];
        const chip = h('span', { class: 'te-chip' + (d ? (d === certo ? ' certo' : ' errado') : '') }, nome);
        if (d) cols[at.destinos.findIndex(x => x[0] === d)].append(chip); else pista.append(chip);
      });
      pista.append(h('div', { class: 'te-dests' }, cols));
    }
    bExp.onclick = () => {
      execs++; const ds = correrTriagem(prog, at.itens); bExp.disabled = true;
      let k = 0; const parcial = [];
      const anda = () => { if (k >= ds.length) { bExp.disabled = false; return fim(ds); } parcial.push(ds[k++]); desenharPista(parcial.concat(Array(ds.length - parcial.length).fill(null))); R.depois(anda, 220); };
      anda();
    };
    function fim(ds) {
      const mal = at.itens.filter(([t], i) => ds[i] !== at.certo[t]);
      if (!mal.length) { som('sucesso'); bExp.disabled = true; editor.querySelectorAll('select,button').forEach(x => { x.disabled = true; });
        return api.concluir({ ok: true, tempo: seg(t0), execucoes: execs, tentativas: tent + 1, modo: mostrada ? 'mostrada' : 'autonomo', valor: JSON.stringify(prog) }, at.feito || 'Tudo no sítio certo!'); }
      tent++; if (tent >= 2) bSol.hidden = false;
      api.dizer('a_pensar', `${mal.length} ${mal.length === 1 ? 'foi parar' : 'foram parar'} ao sítio errado (a vermelho): ${mal.map(m => m[1]).join(', ')}. Que condição falta?`);
    }
    bSol.onclick = () => { prog = JSON.parse(JSON.stringify(at.solucao)); mostrada = true; pintar(); bExp.onclick(); };
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta), h('div', { class: 'te-tart-caixa' }, h('div', { class: 'te-tart-prog' }, editor, h('div', { class: 'li-botoes' }, bExp, bSol)), pista)));
    pintar(); desenharPista(null);
    R.depois(() => api.dizer('boas_vindas', 'Escolhe as condições e carrega em ▶. O programa decide para onde vai cada uma.'), 30);
    return { fechar: () => R.limpar(), resolver: () => { prog = JSON.parse(JSON.stringify(at.solucao)); fim(correrTriagem(prog, at.itens)); } };
  });

  // ------------------------------------------------------------ circuito elétrico (Estudo do Meio)
  reg('circuito', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    const testados = {}; let tent = 0, erros = 0, fase = 0;
    const svg = sv('svg', { viewBox: '0 0 420 230', width: 420, class: 'te-circ', role: 'img', 'aria-label': 'Circuito com pilha, lâmpada e um espaço para o material' });
    const estado = h('p', { class: 'of-estado', 'aria-live': 'polite' }), corpo = h('div');
    function desenhar(mat) {
      svg.innerHTML = '';
      const on = mat && mat[1];
      svg.append(sv('path', { d: 'M60 170 V60 H200 M260 60 H360 V170 H260 M200 170 H60', fill: 'none', stroke: '#b5651d', 'stroke-width': 5 }));
      svg.append(sv('rect', { x: 30, y: 95, width: 60, height: 40, fill: '#333', rx: 4 }), sv('text', { x: 60, y: 121, 'text-anchor': 'middle', fill: '#fff', 'font-size': 14, 'font-weight': 700 }, 'pilha'));
      svg.append(sv('circle', { cx: 230, cy: 60, r: 26, fill: on ? '#ffe45c' : '#f0f0f0', stroke: '#333', 'stroke-width': 3 }), sv('text', { x: 230, y: 25, 'text-anchor': 'middle', 'font-size': 13 }, on ? 'acesa' : 'apagada'));
      if (on) [[-40, 0], [40, 0], [0, -40], [-28, -28], [28, -28]].forEach(([dx, dy]) => svg.append(sv('line', { x1: 230 + dx * 0.75, y1: 60 + dy * 0.75, x2: 230 + dx, y2: 60 + dy, stroke: '#e5b100', 'stroke-width': 3 })));
      svg.append(sv('rect', { x: 200, y: 150, width: 60, height: 40, fill: mat ? '#e9dcfb' : '#fff', stroke: '#7b2fd1', 'stroke-width': 3, 'stroke-dasharray': mat ? 'none' : '6 4', rx: 6 }),
        sv('text', { x: 230, y: 210 + 6, 'text-anchor': 'middle', 'font-size': 13 }, mat ? mat[0] : 'material?'));
    }
    function mostrar() {
      corpo.innerHTML = '';
      if (fase === 0) {
        corpo.append(h('p', { class: 'pe-instr' }, 'Experimenta cada material no espaço do circuito. A lâmpada acende?'),
          h('div', { class: 'te-cats' }, at.materiais.map(m => h('button', { type: 'button', class: 'btn btn-texto' + (m[0] in testados ? ' feito' : ''), onclick: () => {
            testados[m[0]] = m[1]; desenhar(m); estado.textContent = `${m[0]}: a lâmpada ${m[1] ? 'acende' : 'não acende'}.`; som(m[1] ? 'encaixe' : 'apagar'); mostrar();
            if (Object.keys(testados).length === at.materiais.length) R.depois(() => { fase = 1; mostrar(); }, 900);
          } }, m[0] in testados ? `${m[0]} ${testados[m[0]] ? '💡' : '✗'}` : m[0]))));
      } else {
        const marc = new Set();
        corpo.append(h('p', { class: 'pe-pergunta' }, 'Quais destes materiais são bons condutores de eletricidade? Marca todos.'),
          h('div', { class: 'li-opcoes' }, at.materiais.map(m => h('label', null, h('input', { type: 'checkbox', onchange: e => { e.target.checked ? marc.add(m[0]) : marc.delete(m[0]); } }), ' ', m[0]))),
          h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul', onclick: () => {
            tent++; const ok = at.materiais.every(m => marc.has(m[0]) === m[1]);
            if (ok) { som('sucesso'); return acabar(true); }
            erros++;
            if (tent < 2) return api.dizer('a_pensar', 'Volta à tabela: com quais acendeu a lâmpada? Esses deixam passar a corrente.');
            api.dizer('calma', 'Condutores: ' + at.materiais.filter(m => m[1]).map(m => m[0]).join(', ') + '. ' + (at.porque || '')); acabar(false);
          } }, 'Verificar')));
      }
    }
    function acabar(ok) { corpo.querySelectorAll('button,input').forEach(x => { x.disabled = true; }); api.concluir({ ok, tempo: seg(t0), falhas: erros, tentativas: tent }, ok ? (at.porque || 'Muito bem!') : null); }
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta), h('div', { class: 'te-tart-caixa' }, h('div', null, svg, estado), corpo)));
    desenhar(null); mostrar();
    return { fechar: () => R.limpar(), resolver: () => { at.materiais.forEach(m => { testados[m[0]] = m[1]; }); acabar(true); } };
  });

  // ------------------------------------------------------------ arqueologia (Estudo do Meio · tempo histórico)
  reg('arqueologia', (el, at, api) => {
    const R = F.PC.relogioDe(api), t0 = performance.now();
    let aberto = 0, fase = 0, tent = 0, erros = 0, mostradas = 0; let ordem = [];
    const corpo = h('div'), faseEl = h('div', { class: 'of-fases' });
    const NOMES = ['Escavar', 'O mais antigo', 'Linha do tempo'];
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta), faseEl, corpo));
    const pintarFases = () => { faseEl.innerHTML = ''; NOMES.forEach((f, k) => faseEl.append(h('span', { class: k < fase ? 'feita' : k === fase ? 'atual' : '' }, `${k + 1}. ${f}`))); };
    function corte() {
      const caixa = h('div', { class: 'te-camadas' });
      at.camadas.forEach((c, i) => {
        const vista = i < aberto;
        caixa.append(h('button', { type: 'button', class: 'te-camada' + (vista ? ' aberta' : ''), style: `background:${c.cor || ['#c9a46a', '#b08550', '#8f6a3f', '#6f5232', '#5a4128'][i % 5]}`, disabled: fase > 0 ? true : null,
          'aria-label': vista ? `Camada ${i + 1}: ${c.achado}` : `Camada ${i + 1} (por escavar)`,
          onclick: () => { if (i > aberto) { erros++; return api.dizer('a_pensar', 'Os arqueólogos escavam de cima para baixo: primeiro a camada de cima!'); } if (i === aberto) { aberto++; som('encaixe'); mostrar(); if (aberto === at.camadas.length) R.depois(() => { fase = 1; tent = 0; mostrar(); }, 900); } } },
          h('small', null, `Camada ${i + 1}` + (i === 0 ? ' (em cima)' : i === at.camadas.length - 1 ? ' (mais funda)' : '')), vista ? h('strong', null, '⛏ ' + c.achado) : h('span', null, i === aberto ? 'clica para escavar' : '')));
      });
      return caixa;
    }
    function mostrar() {
      pintarFases(); corpo.innerHTML = '';
      if (fase === 0) corpo.append(h('p', { class: 'pe-instr' }, 'Escava camada a camada, de cima para baixo.'), corte());
      else if (fase === 1) {
        corpo.append(corte(), h('p', { class: 'pe-pergunta' }, 'Qual destes achados é o mais antigo?'), h('div', { class: 'te-cats' }, at.camadas.map((c, i) => h('button', { type: 'button', class: 'btn btn-texto', onclick: () => {
          tent++;
          if (i === at.camadas.length - 1) { som('encaixe'); api.dizer('celebrar', 'Isso! Quanto mais fundo, mais antigo: as camadas foram-se pondo umas por cima das outras.'); fase = 2; tent = 0; ordem = F.PC.itens.baralhar(at.camadas.map((_, k) => k), at.id); return R.depois(mostrar, 900); }
          erros++;
          if (tent < 2) return api.dizer('a_pensar', 'Pensa: as camadas de terra vão-se juntando por cima ao longo do tempo. Onde fica a mais velha?');
          mostradas++; api.dizer('calma', 'O mais antigo é o da camada mais funda: ' + at.camadas[at.camadas.length - 1].achado + '.'); fase = 2; tent = 0; ordem = F.PC.itens.baralhar(at.camadas.map((_, k) => k), at.id); R.depois(mostrar, 1500);
        } }, c.achado))));
      } else {
        const lista = h('ol', { class: 'te-linha' });
        const pintarL = () => { lista.innerHTML = ''; ordem.forEach((k, i) => lista.append(h('li', null, h('span', null, at.camadas[k].achado),
          h('span', { class: 'te-ctl' }, h('button', { type: 'button', 'aria-label': 'Mais antigo', onclick: () => { if (i) { [ordem[i - 1], ordem[i]] = [ordem[i], ordem[i - 1]]; pintarL(); } } }, '▲'),
            h('button', { type: 'button', 'aria-label': 'Mais recente', onclick: () => { if (i < ordem.length - 1) { [ordem[i + 1], ordem[i]] = [ordem[i], ordem[i + 1]]; pintarL(); } } }, '▼'))))); };
        pintarL();
        corpo.append(h('p', { class: 'pe-pergunta' }, 'Põe os achados na linha do tempo: do mais antigo (em cima) para o mais recente (em baixo).'),
          h('p', { class: 'pe-instr' }, 'Pistas: ' + at.camadas.map(c => `${c.achado} — ${c.epoca}`).join(' · ')), lista,
          h('div', { class: 'li-botoes' }, h('button', { type: 'button', class: 'btn btn-azul', onclick: () => {
            tent++; const certa = at.camadas.map((_, k) => at.camadas.length - 1 - k);
            if (ordem.every((k, i) => k === certa[i])) { som('sucesso'); return acabar(); }
            erros++;
            if (tent < 2) return api.dizer('a_pensar', 'Lê as épocas: os romanos viveram há quase dois mil anos; o século XVI foi há uns quinhentos anos.');
            mostradas++; ordem = certa; pintarL(); api.dizer('calma', 'Esta é a ordem certa: do mais fundo ao de cima.'); acabar();
          } }, 'Verificar')));
      }
    }
    function acabar() { corpo.querySelectorAll('button').forEach(b => { b.disabled = true; }); api.concluir({ ok: mostradas === 0, tempo: seg(t0), falhas: erros, tentativas: erros ? 2 : 1 }, mostradas ? null : (at.feito || 'Grande arqueólogo!')); }
    mostrar();
    return { fechar: () => R.limpar(), resolver: () => { aberto = at.camadas.length; fase = 2; mostradas = 0; acabar(); } };
  });

  F.PC.terr = { cent, euros, moda, redeCubo, correrTartaruga, verificarTartaruga, correrTriagem, contarBlocos, SOLIDOS };
})();
