/* Nico · Percurso 4.º ano — as experiências da «Mostra de Invenções» (revisão do Ambrósio, 1 Nov 2026, PR buinho-os #67).
 *
 * O raciocínio é a ação do jogo (construir, investigar, escrever), e a ação muda o mundo do Nico:
 *   ponte     M1 · Pontes de cortiça — arrastar peças (frações/comprimentos) até a ponte ter a medida do vão; o Nico testa
 *             { alvo: '1' | '1,5', unidade: 'm', pecas: ['1/2', '1/4', …], restricao: { pecas: 3 }, transforma: 'ponte-ribeira' }
 *   detetive  M2 · Detetive da oficina — ler um manual, marcar as pistas, ordenar a reparação, executar e explicar
 *             { pedido, manual: { titulo, seccoes: [{ titulo, frases: [...] }] }, pistas: ['1.2', …], passos: [...], explicar }
 *   correio   M3 · Correio do Nico — copiar, corrigir um rascunho e escrever uma mensagem própria; o destinatário responde
 *             { para, copia, rascunho, certo: [...], propria: { pergunta, min }, resposta }
 *
 *   F.PC.oficina.montar(el, atividade, api) → { fechar, resolver }
 * Sem quedas nem castigos: o erro dá informação («ainda falta um quarto»), nunca tira progresso.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.PC = F.PC || {};
  const h = (...a) => F.PC.itens.h(...a);
  const som = n => { if (F.Som) F.Som.tocar(n); };
  const seg = t0 => Math.round((performance.now() - t0) / 100) / 10;
  const NS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, at) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); return e; };

  // ------------------------------------------------------------ frações exatas
  const mdc = (a, b) => b ? mdc(b, a % b) : Math.abs(a);
  const red = ([n, d]) => { const g = mdc(n, d) || 1; return [n / g, d / g]; };
  const soma = (a, b) => red([a[0] * b[1] + b[0] * a[1], a[1] * b[1]]);
  const menos = (a, b) => soma(a, [-b[0], b[1]]);
  const cmp = (a, b) => a[0] * b[1] - b[0] * a[1];
  function fr(t) {
    const s = String(t).replace(/[^\d,./]/g, '');
    if (s.includes('/')) { const [n, d] = s.split('/').map(Number); return red([n, d]); }
    if (s.includes(',') || s.includes('.')) { const [i, dec] = s.replace('.', ',').split(','); const d = Math.pow(10, dec.length); return red([Number(i) * d + Number(dec), d]); }
    return [Number(s), 1];
  }
  const valorNum = f => f[0] / f[1];
  // escrever uma fração na mesma representação das peças (decimal com vírgula ou fração)
  function escrever(f, comoDecimal, unidade) {
    const u = unidade ? ' ' + unidade : '';
    if (comoDecimal) return String(Math.round(valorNum(f) * 1000) / 1000).replace('.', ',') + u;
    if (f[1] === 1) return f[0] + u;
    const um = { 2: 'meio', 3: 'terço', 4: 'quarto', 5: 'quinto', 6: 'sexto', 8: 'oitavo', 10: 'décimo', 12: 'doze avos' }[f[1]];
    return f[0] === 1 && um ? 'um ' + um : f[0] + '/' + f[1];
  }

  const T = {};

  // =================================================================================== M1 · Pontes de cortiça
  T.ponte = (el, at, api) => {
    const alvo = fr(at.alvo), dec = /[,.]/.test(String(at.alvo)) || (at.pecas || []).some(p => /[,.]/.test(p));
    const pecas = at.pecas.map((t, i) => ({ i, t, f: fr(t), usada: false }));
    const W = 900, M0 = 150, VAO = 560, esc = VAO / valorNum(alvo), Y = 170;
    let postas = [], sel = 0, tent = 0, feito = false; const t0 = performance.now();
    const svg = svgEl('svg', { viewBox: `0 0 ${W} 330`, class: 'of-ponte', role: 'img', 'aria-label': 'Ribeira com o vão da ponte' });
    const caixa = h('div', { class: 'of-tabuleiro', role: 'listbox', 'aria-label': 'Peças de cortiça (setas para escolher, Enter para pôr)', tabindex: '0' });
    const estado = h('p', { class: 'of-estado' });
    const criterios = h('div', { class: 'of-criterios', 'aria-live': 'polite' });
    let vivo = true;
    const btnTestar = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '▶ O Nico experimenta a ponte');
    const btnTirar = h('button', { type: 'button', class: 'btn btn-texto' }, '↶ Tirar a última peça');
    el.append(h('div', { class: 'pc-enunciado of' },
      h('p', { class: 'pe-pergunta' }, at.pergunta),
      h('p', { class: 'pe-instr' }, (at.restricao && at.restricao.pecas ? `Usa exatamente ${at.restricao.pecas} peças. ` : '') + 'Arrasta as peças para o vão (ou escolhe com as setas e carrega em Enter). Clica numa peça da ponte para a tirar.'),
      svg, estado, criterios, h('div', { class: 'of-linha' }, caixa), h('div', { class: 'of-linha' }, btnTirar, btnTestar)));

    // cenário fixo: céu, margens, ribeira, régua do vão
    const mmc = (a, b) => a / mdc(a, b) * b;
    let den = pecas.reduce((d, p) => mmc(d, p.f[1]), alvo[1]);
    if (den * valorNum(alvo) > 24) den = 1;   // marcas comuns só se forem legíveis; senão só 0 e o fim
    let g = `<defs><linearGradient id="ofCeu" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe6ff"/><stop offset="1" stop-color="#fff6e0"/></linearGradient></defs>
      <rect width="${W}" height="330" fill="url(#ofCeu)"/>
      <path d="M0 250 Q120 240 ${M0} ${Y + 6} V330 H0Z" fill="#b98b56"/><rect x="0" y="${Y + 6}" width="${M0}" height="12" fill="#8dbb5a"/>
      <path d="M${M0 + VAO} ${Y + 6} Q${M0 + VAO + 40} 240 ${W} 250 V330 H${M0 + VAO}Z" fill="#b98b56"/><rect x="${M0 + VAO}" y="${Y + 6}" width="${W - M0 - VAO}" height="12" fill="#8dbb5a"/>
      <path d="M${M0} 270 Q${M0 + VAO / 2} 255 ${M0 + VAO} 270 V330 H${M0}Z" fill="#5aa9e6"/>
      <path d="M${M0 + 40} 290 q20 -8 40 0 t40 0 M${M0 + 300} 300 q20 -8 40 0 t40 0" stroke="#d8efff" stroke-width="3" fill="none"/>
      <g transform="translate(${M0 + VAO + 120},${Y - 70})"><rect x="0" y="20" width="100" height="56" fill="#fff" stroke="#555"/><path d="M-6 22 50 -8 106 22z" fill="#c4553a"/><rect x="40" y="46" width="20" height="30" fill="#6b4a22"/></g>`;
    // régua: marcas em cada 1/den do vão
    const passos = Math.round(valorNum(alvo) * den);
    if (passos <= 24) for (let k = 0; k <= passos; k++) { const x = M0 + (k / den) * esc; g += `<line x1="${x}" x2="${x}" y1="${Y + 40}" y2="${Y + (k % den === 0 ? 58 : 50)}" stroke="#111" stroke-width="${k % den === 0 ? 2.5 : 1.2}"/>`; }
    g += `<line x1="${M0}" x2="${M0 + VAO}" y1="${Y + 40}" y2="${Y + 40}" stroke="#111" stroke-width="2"/>
      <text x="${M0}" y="${Y + 78}" text-anchor="middle" font-size="16" font-weight="700">0</text>
      <text x="${M0 + VAO}" y="${Y + 78}" text-anchor="middle" font-size="16" font-weight="700">${escrever(alvo, dec, at.unidade).replace('um ', '1 ')}</text>`;
    svg.innerHTML = g;
    const gPecas = svgEl('g', {}), nico = svgEl('image', { href: 'img/nico/01_boas_vindas.png', x: M0 - 110, y: Y - 92, width: 80, height: 96 });
    svg.append(gPecas, nico);

    function total() { return postas.reduce((t, p) => soma(t, p.f), [0, 1]); }
    function desenhar() {
      gPecas.innerHTML = '';
      let x = M0;
      postas.forEach(p => {
        const w = valorNum(p.f) * esc, passa = x + w > M0 + VAO + 0.5;
        const r = svgEl('g', { class: 'of-peca-posta', tabindex: '0', role: 'button', 'aria-label': 'Tirar a peça ' + p.t });
        r.append(svgEl('rect', { x, y: Y - 8, width: w - 2, height: 22, rx: 4, fill: passa ? '#f3b0a5' : '#c88a3d', stroke: '#111', 'stroke-width': 2 }));
        for (let k = 8; k < w - 6; k += 14) r.append(svgEl('circle', { cx: x + k, cy: Y + 3, r: 1.6, fill: '#7a4f1d' }));
        const t = svgEl('text', { x: x + w / 2, y: Y - 16, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700 }); t.textContent = p.t; r.append(t);
        r.addEventListener('click', () => tirar(p));
        r.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tirar(p); } });
        gPecas.append(r);
        x += w;
      });
      const tot = total(), c = cmp(tot, alvo);
      estado.textContent = postas.length ? `Ponte: ${postas.map(p => p.t).join(' + ')} = ${escrever(tot, dec, at.unidade)}` + (c < 0 ? ' · ainda há vão' : c > 0 ? ' · passa do vão!' : ' · tem a medida do vão') : 'Ainda não há peças no vão.';
      caixa.innerHTML = '';
      pecas.forEach((p, k) => {
        if (p.usada) return;
        const b = h('span', { class: 'of-peca' + (k === sel ? ' sel' : ''), role: 'option', 'aria-selected': String(k === sel) }, p.t);
        b.style.width = Math.max(56, valorNum(p.f) * esc * 0.62) + 'px';
        F.PC.arrastavel(b, { alvos: '.of-ponte', soltar: alvo => { if (alvo) por(p); }, clique: () => por(p) });
        caixa.append(b);
      });
      btnTirar.disabled = !postas.length;
      // dois critérios separados: a medida e o número de peças
      const nP = at.restricao && at.restricao.pecas;
      criterios.innerHTML = '';
      criterios.append(h('span', { class: c === 0 ? 'ok' : '' }, `Medida: ${c === 0 ? '✓' : c < 0 ? 'falta' : 'passa'}`));
      if (nP) criterios.append(h('span', { class: postas.length === nP ? 'ok' : '' }, `Peças: ${postas.length}/${nP}`));
    }
    function por(p) { if (feito || p.usada) return; p.usada = true; postas.push(p); som('encaixe'); desenhar(); }
    function tirar(p) { if (feito) return; postas = postas.filter(x => x !== p); p.usada = false; som('apagar'); desenhar(); }
    btnTirar.addEventListener('click', () => { if (postas.length) tirar(postas[postas.length - 1]); });
    caixa.addEventListener('keydown', ev => {
      const livres = pecas.map((p, k) => p.usada ? -1 : k).filter(k => k >= 0);
      if (!livres.length) return;
      let i = livres.indexOf(sel); if (i < 0) i = 0;
      if (ev.key === 'ArrowRight') { sel = livres[(i + 1) % livres.length]; desenhar(); ev.preventDefault(); }
      else if (ev.key === 'ArrowLeft') { sel = livres[(i - 1 + livres.length) % livres.length]; desenhar(); ev.preventDefault(); }
      else if (ev.key === 'Enter') { por(pecas[livres[i]]); const r = pecas.map((p, k) => p.usada ? -1 : k).filter(k => k >= 0); sel = r[0] ?? 0; desenhar(); ev.preventDefault(); }
      else if (ev.key === 'Backspace') { if (postas.length) tirar(postas[postas.length - 1]); ev.preventDefault(); }
    });

    const anda = (x, ms) => new Promise(r => { if (!vivo) return; nico.style.transition = `transform ${ms}ms linear`; nico.style.transform = `translateX(${x}px)`; setTimeout(r, ms + 30); });
    btnTestar.addEventListener('click', async () => {
      if (feito) return;
      if (!postas.length) { api.dizer('curiosa', 'Primeiro põe peças no vão: arrasta-as do tabuleiro.'); return; }
      tent++; btnTestar.disabled = true;
      const tot = total(), c = cmp(tot, alvo), n = at.restricao && at.restricao.pecas;
      const larg = Math.min(valorNum(tot), valorNum(alvo)) * esc;
      await anda(70, 400);
      if (c === 0 && (!n || postas.length === n)) {
        await anda(70 + VAO + 60, 1400);
        feito = true; som('sucesso');
        api.concluir({ ok: true, tentativas: tent, tempo: seg(t0), solucao: postas.map(p => p.t) },
          at.sucesso || `A ponte tem ${escrever(alvo, dec, at.unidade)}: ${postas.map(p => p.t).join(' + ')}. Passei! 🌉`);
        return;
      }
      if (c < 0) {
        await anda(70 + larg, 900);
        api.dizer('a_pensar', `Parei aqui: ainda falta ${escrever(menos(alvo, tot), dec, at.unidade)} para chegar à outra margem.`);
      } else if (c > 0) {
        api.dizer('surpreendida', `A ponte ficou maior do que o vão: passa ${escrever(menos(tot, alvo), dec, at.unidade)}. Troca ou tira uma peça.`);
      } else {
        api.dizer('a_pensar', `A medida está certa, mas a missão pede ${n} peças e usaste ${postas.length}. Consegues de outra maneira?`);
      }
      await anda(0, 500);
      btnTestar.disabled = false;
    });
    desenhar();
    api.dizer('boas_vindas', at.boasVindas || 'A ribeira levou a ponte! Constrói uma nova com as peças de cortiça. Quando achares que está bem, eu experimento.');
    return {
      fechar: () => { vivo = false; },
      resolver: () => {
        // procura uma combinação que sirva (para os testes): todas as subsequências das peças
        const n = pecas.length;
        for (let m = 1; m < (1 << n); m++) {
          const esc2 = pecas.filter((_, k) => m & (1 << k));
          if (at.restricao && at.restricao.pecas && esc2.length !== at.restricao.pecas) continue;
          if (cmp(esc2.reduce((t, p) => soma(t, p.f), [0, 1]), alvo) === 0) { postas.forEach(p => { p.usada = false; }); postas = []; esc2.forEach(por); return btnTestar.click(); }
        }
        throw new Error('ponte sem solução: ' + at.id);
      },
    };
  };

  // =================================================================================== M2 · Detetive da oficina
  T.detetive = (el, at, api) => {
    const t0 = performance.now(); let fase = 1, falhasPistas = 0, tentOrdem = 0, ordemCtrl = null;
    const achadas = new Set();
    const manual = h('div', { class: 'of-manual', tabindex: '0', 'aria-label': 'Manual (rola para ler)' }, h('h2', null, at.manual.titulo));
    at.manual.seccoes.forEach((sc, i) => {
      manual.append(h('h3', null, sc.titulo));
      const p = h('p');
      sc.frases.forEach((f, j) => {
        const id = `${i + 1}.${j + 1}`;
        const s = h('span', { class: 'of-frase', role: 'button', tabindex: '0', 'data-id': id }, f);
        const marcar = () => {
          if (fase !== 1 || achadas.has(id)) return;
          if (at.pistas.includes(id)) {
            achadas.add(id); s.classList.add('pista'); som('apanhar');
            api.dizer('celebrar', (at.porquePistas && at.porquePistas[id]) || 'Boa pista! Guarda-a no caderno.');
            caderno();
            if (achadas.size === at.pistas.length) { const b = h('button', { type: 'button', class: 'btn btn-azul' }, 'Já tenho as pistas → ordenar a reparação'); b.addEventListener('click', () => irFase(2)); corpo.append(b); b.focus(); }
          } else {
            falhasPistas++; som('apagar'); s.classList.add('nao'); setTimeout(() => s.classList.remove('nao'), 700);
            api.dizer('a_pensar', at.dicaPista || 'Essa frase é verdade, mas ajuda a explicar a avaria? Relê o pedido.');
          }
        };
        s.addEventListener('click', marcar);
        s.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); marcar(); } });
        p.append(s, ' ');
      });
      manual.append(p);
    });
    const painel = h('div', { class: 'of-caso' });
    const cad = h('ol', { class: 'of-caderno' });
    const corpo = h('div');
    painel.append(h('div', { class: 'of-pedido' }, h('strong', null, '📋 O caso: '), at.pedido), h('div', { class: 'of-fases' }), corpo);
    el.append(h('div', { class: 'pc-duplo of-detetive' }, h('div', { class: 'pd-texto' }, manual), h('div', { class: 'pd-perg' }, h('div', { class: 'pc-enunciado' }, painel))));
    function caderno() { cad.innerHTML = ''; [...achadas].forEach(id => { const [i, j] = id.split('.').map(Number); cad.append(h('li', null, at.manual.seccoes[i - 1].frases[j - 1])); }); }
    function fases() {
      const f = painel.querySelector('.of-fases'); f.innerHTML = '';
      ['Encontrar as pistas', 'Ordenar a reparação', 'Reparar e explicar'].forEach((n, k) => f.append(h('span', { class: k + 1 < fase ? 'feita' : k + 1 === fase ? 'atual' : '' }, `${k + 1}. ${n}`)));
    }
    function irFase(n) {
      fase = n; fases(); corpo.innerHTML = '';
      if (n === 1) {
        corpo.append(h('p', { class: 'pe-pergunta' }, `Lê o manual e clica nas ${at.pistas.length} frases que explicam o problema.`), h('h4', null, 'Caderno de pistas'), cad);
        caderno();
      } else if (n === 2) {
        const alvo = h('div');
        corpo.append(alvo);
        ordemCtrl = F.PC.itens.montar(alvo, { id: at.id + '-ordem', tipo: 'ordenar', pergunta: at.perguntaOrdem || 'Agora põe os passos da reparação pela ordem certa.', instr: 'Arrasta os cartões para cima ou para baixo.', itens: at.passos }, { modo: 'sessao' });
        const b = h('button', { type: 'button', class: 'btn btn-azul' }, 'Confirmar a ordem');
        b.addEventListener('click', () => {
          tentOrdem++;
          if (ordemCtrl.verificar().certo) { som('encaixe'); irFase(3); }
          else api.dizer('a_pensar', tentOrdem > 1 ? 'Os cartões verdes já estão no sítio. O que tem de acontecer antes dos outros?' : 'Ainda não. Pensa: o que se faz primeiro, antes de tudo o resto?');
        });
        corpo.append(b);
      } else {
        const anim = h('div', { class: 'of-repara', html: at.animacao || '<span class="of-roda">⚙️</span>' });
        const ta = h('textarea', { class: 'of-explica', placeholder: 'Escreve aqui…', 'aria-label': 'A tua explicação' });
        const lista = h('ul', { class: 'it-lista' });
        const crit = F.PC.itens.criteriosExtensa({ min: at.minExplica || 8 });
        const pintar = () => { lista.innerHTML = ''; crit.forEach(([n, f]) => lista.append(h('li', { class: f(ta.value) ? 'ok' : '' }, n))); };
        ta.addEventListener('input', pintar); pintar();
        const b = h('button', { type: 'button', class: 'btn btn-azul' }, 'Entregar o relatório');
        b.addEventListener('click', () => {
          if (!crit.every(([, f]) => f(ta.value))) { api.dizer('dica', 'Vê a lista debaixo da caixa: o que falta?'); return; }
          b.disabled = true; ta.readOnly = true;
          api.concluir({ ok: true, tempo: seg(t0), falhas: falhasPistas, tentativas: tentOrdem, valor: ta.value, aberta: true }, at.sucesso || 'Caso resolvido! O relatório fica para o professor ler. 🔎');
        });
        corpo.append(anim, h('p', { class: 'pe-pergunta' }, at.explicar || 'Explica numa ou duas frases o que estava avariado e como o descobriste.'), ta, lista, b);
        som('sucesso');
        api.dizer('celebrar', at.reparado || 'Funciona outra vez! Agora explica o que descobriste.');
      }
    }
    irFase(1);
    api.dizer('boas_vindas', at.boasVindas || 'Temos um caso na oficina! Lê o manual à esquerda e encontra as pistas.');
    return {
      fechar: () => {},
      resolver: () => {
        at.pistas.forEach(id => manual.querySelector(`[data-id="${id}"]`).click());
        irFase(2); ordemCtrl.repor(at.passos.map((_, i) => i)); corpo.querySelector('.btn-azul').click();
        const ta = corpo.querySelector('textarea'); ta.value = 'O Nico descobriu a avaria lendo o manual com muita atenção e reparou tudo.'; ta.dispatchEvent(new Event('input'));
        corpo.querySelector('.btn-azul').click();
      },
    };
  };

  // =================================================================================== M3 · Correio do Nico
  T.correio = (el, at, api) => {
    const t0 = performance.now(); let fase = 0, enganos = 0, tentEdicao = 0, total = 0, tCopia = null, ccm = 0;
    const fasesDef = [at.copia ? 'copia' : null, at.rascunho ? 'edicao' : null, at.propria ? 'propria' : null].filter(Boolean);
    const carta = h('div', { class: 'of-carta' });
    const topo = h('div', { class: 'of-carta-topo' }, h('span', { class: 'of-selo', 'aria-hidden': 'true' }, '✉️'), h('div', null, h('small', null, 'Para:'), h('strong', null, at.para)));
    const corpo = h('div');
    const passosEl = h('div', { class: 'of-fases' });
    el.append(h('div', { class: 'pc-enunciado of' }, h('p', { class: 'pe-pergunta' }, at.pergunta || `Correio do Nico: mensagens para ${at.para}.`), passosEl, h('div', { class: 'of-carta-caixa' }, topo, carta), corpo));
    const textos = {};
    const NOMES = { copia: 'Copiar', edicao: 'Corrigir o rascunho', propria: 'Escrever a tua' };
    function pintarFases() { passosEl.innerHTML = ''; fasesDef.forEach((f, k) => passosEl.append(h('span', { class: k < fase ? 'feita' : k === fase ? 'atual' : '' }, `${k + 1}. ${NOMES[f]}`))); }
    function seguinte() { fase++; if (fase >= fasesDef.length) return enviar(); mostrar(); }
    function mostrar() {
      pintarFases(); corpo.innerHTML = ''; carta.innerHTML = '';
      const f = fasesDef[fase];
      if (f === 'copia') {
        const L = at.copia.normalize('NFC');
        const alvo = h('p', { class: 'tc-linha' });
        const inp = h('input', { class: 'tc-entrada', type: 'text', autocomplete: 'off', spellcheck: 'false', 'aria-label': 'Copia a mensagem' });
        const dica = h('div', { class: 'tc-dica' });
        const ajuda = h('label', { class: 'of-ajuda' }, h('input', { type: 'checkbox' }), ' Mostrar como se escreve a próxima letra');
        const pintar = () => {
          const v = inp.value.normalize('NFC'); alvo.innerHTML = '';
          [...L].forEach((ch, i) => alvo.append(h('span', { class: i < v.length ? (v[i] === ch ? 'ok' : 'mal') : i === v.length ? 'cursor' : '' }, ch)));
          const err = [...v].findIndex((c, i) => c !== L[i]);
          dica.textContent = err >= 0 ? 'Há uma letra trocada (a vermelho): apaga com ⌫ e escreve outra vez.' : (ajuda.querySelector('input').checked && v.length < L.length ? F.PC.comoEscrever(L[v.length]).frase : '');
        };
        inp.addEventListener('paste', ev => ev.preventDefault());
        inp.addEventListener('input', ev => {
          if (!tCopia) tCopia = performance.now();
          if (ev.inputType === 'insertText' && ev.data) { const pos = (inp.selectionStart || inp.value.length) - ev.data.length; [...ev.data].forEach((c, i) => { total++; if (c !== L[pos + i]) enganos++; }); }
          pintar();
          if (inp.value.normalize('NFC') === L) { ccm = Math.round(L.length / (((performance.now() - tCopia) / 1000) / 60 || 1)); textos.copia = L; som('encaixe'); inp.disabled = true; setTimeout(seguinte, 600); }
        });
        ajuda.querySelector('input').addEventListener('change', () => { pintar(); inp.focus(); });
        carta.append(h('p', { class: 'of-manuscrito' }, at.copia));
        corpo.append(h('p', { class: 'pe-instr' }, 'Copia a mensagem do Nico para o envelope, letra a letra.'), alvo, inp, dica, ajuda);
        pintar(); setTimeout(() => inp.focus(), 60);
        api.dizer('boas_vindas', 'Primeiro copia a mensagem. Lê-a antes de começar!');
      } else if (f === 'edicao') {
        const ta = h('textarea', { class: 'of-explica', spellcheck: 'false', 'aria-label': 'Rascunho para corrigir' });
        ta.value = at.rascunho;
        const res = h('p', { class: 'of-estado' });
        const b = h('button', { type: 'button', class: 'btn btn-azul' }, 'Verificar a correção');
        const norm = t => String(t).normalize('NFC').trim().replace(/\s+/g, ' ');
        b.addEventListener('click', () => {
          tentEdicao++;
          const v = norm(ta.value);
          if (at.certo.some(c => norm(c) === v)) { textos.edicao = v; som('encaixe'); res.textContent = 'Corrigido ✓'; ta.readOnly = true; b.disabled = true; setTimeout(seguinte, 700); return; }
          // quantas palavras ainda são diferentes da versão certa mais parecida
          const pv = v.split(' '), melhor = at.certo.map(c => norm(c).split(' ')).map(c => c.reduce((n, w, i) => n + (w !== pv[i] ? 1 : 0), 0) + Math.abs(c.length - pv.length)).sort((a, b) => a - b)[0];
          res.textContent = `Ainda há ${melhor} ${melhor === 1 ? 'palavra' : 'palavras'} por corrigir.`;
          api.dizer('a_pensar', tentEdicao > 1 && at.dicaEdicao ? at.dicaEdicao : 'Lê devagar, palavra a palavra. Faltam acentos? Maiúsculas? Pontuação?');
        });
        carta.append(h('p', { class: 'of-manuscrito riscado' }, at.rascunho));
        corpo.append(h('p', { class: 'pe-instr' }, at.instrEdicao || 'O rascunho tem erros. Corrige-o na caixa: usa as setas para andar no texto, ⌫ para apagar e escreve o que falta.'), ta, res, b);
        setTimeout(() => ta.focus(), 60);
        api.dizer('a_pensar', 'Escrevi isto à pressa… Ajudas-me a corrigir antes de enviar?');
      } else {
        const ta = h('textarea', { class: 'of-explica', 'aria-label': 'A tua mensagem', placeholder: at.propria.dica || 'Escreve aqui a tua mensagem…' });
        const lista = h('ul', { class: 'it-lista' });
        const crit = F.PC.itens.criteriosExtensa({ min: at.propria.min || 12, palavrasChave: at.propria.palavrasChave });
        const pintar = () => { lista.innerHTML = ''; crit.forEach(([n, fn]) => lista.append(h('li', { class: fn(ta.value) ? 'ok' : '' }, n))); };
        ta.addEventListener('input', pintar); pintar();
        const b = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, '✉️ Enviar');
        b.addEventListener('click', () => {
          if (!crit.every(([, fn]) => fn(ta.value))) { api.dizer('dica', 'Antes de enviar, relê a mensagem e vê a lista: o que falta?'); return; }
          textos.propria = ta.value; b.disabled = true; ta.readOnly = true; seguinte();
        });
        corpo.append(h('p', { class: 'pe-pergunta' }, at.propria.pergunta), ta, lista, b);
        setTimeout(() => ta.focus(), 60);
        api.dizer('curiosa', 'Agora escreve tu. Lê a mensagem antes de a enviares!');
      }
    }
    function enviar() {
      pintarFases(); corpo.innerHTML = '';
      carta.innerHTML = ''; carta.append(h('p', { class: 'of-manuscrito' }, textos.propria || textos.edicao || textos.copia));
      carta.parentNode.classList.add('enviada'); som('sucesso');
      setTimeout(() => {
        corpo.append(h('div', { class: 'of-resposta' }, h('strong', null, `Resposta ${at.respostaDe || 'de ' + at.para}:`), h('p', null, at.resposta)));
        api.concluir({ ok: true, tempo: seg(t0), falhas: enganos, ccm, precisao: total ? Math.round(100 * (total - enganos) / total) : 100, tentativas: tentEdicao || 1, valor: textos.propria || '', aberta: !!at.propria },
          'Mensagem entregue! Olha, já respondeu. 📬');
      }, 900);
    }
    mostrar();
    return {
      fechar: () => {},
      resolver: () => {
        textos.copia = at.copia; textos.edicao = at.certo && at.certo[0]; textos.propria = 'O Nico escreveu uma mensagem muito bonita para a oficina do Buinho.';
        fase = fasesDef.length; enviar();
      },
    };
  };

  F.PC.oficina = { montar: (el, at, api) => { el.innerHTML = ''; return T[at.tipo](el, at, api); }, tipos: Object.keys(T), fr, soma, cmp };
})();
