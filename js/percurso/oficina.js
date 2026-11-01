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

  // ------------------------------------------------------------ transformação visível da reparação (Detetive, fase 3)
  // Desenho esquemático exato em SVG (sem arte nova): avaria → reparado → a funcionar, com legenda em texto.
  const REPARACOES = {
    tubo: {
      legendas: ['O tubo do canteiro 3 está esmagado: a água para ali.', 'O tubo foi endireitado e reparado.', 'A água passa outra vez e chega ao canteiro 3.'],
      svg: `<rect x="16" y="24" width="84" height="100" rx="8" fill="#fff" stroke="#66523E" stroke-width="4"/>
        <rect x="20" y="52" width="76" height="68" rx="5" fill="#8fc8ec"/><text x="58" y="44" text-anchor="middle" font-size="15" font-weight="700" fill="#17213B">depósito</text>
        <rect x="500" y="104" width="96" height="40" rx="6" fill="#b07a45" stroke="#66523E" stroke-width="3"/><text x="548" y="130" text-anchor="middle" font-size="16" font-weight="700" fill="#fff">canteiro 3</text>
        <g class="rp-antes"><path d="M100 80 H270 Q300 80 300 92 Q300 104 330 104 H520" fill="none" stroke="#66523E" stroke-width="22" stroke-linejoin="round"/>
          <path d="M100 80 H270 Q300 80 300 92 Q300 104 330 104 H520" fill="none" stroke="#fff" stroke-width="15" stroke-linejoin="round"/>
          <path d="M282 72 L318 112 M318 72 L282 112" stroke="#d6336c" stroke-width="5"/>
          <path d="M102 80 H268" stroke="#4aa3df" stroke-width="9" stroke-linecap="round"/></g>
        <g class="rp-depois"><path d="M100 92 H520" stroke="#66523E" stroke-width="22"/><path d="M100 92 H520" stroke="#fff" stroke-width="15"/>
          <rect x="286" y="78" width="28" height="28" rx="4" fill="none" stroke="#2038A6" stroke-width="4"/></g>
        <g class="rp-fluxo"><path class="rp-agua" d="M102 92 H518" stroke="#4aa3df" stroke-width="9" stroke-linecap="round" stroke-dasharray="18 10"/>
          <circle cx="532" cy="110" r="5" fill="#4aa3df"/><circle cx="548" cy="116" r="4" fill="#4aa3df"/><circle cx="564" cy="110" r="5" fill="#4aa3df"/></g>`,
    },
    circuito: {
      legendas: ['O fio está desligado: o circuito está aberto e a luz não acende.', 'O fio foi ligado outra vez: o circuito ficou fechado.', 'A corrente passa e a luz acende.'],
      svg: `<rect x="40" y="56" width="90" height="44" rx="6" fill="#fff" stroke="#66523E" stroke-width="4"/><text x="85" y="84" text-anchor="middle" font-size="15" font-weight="700" fill="#17213B">pilha</text>
        <circle cx="470" cy="78" r="30" fill="#fff" stroke="#66523E" stroke-width="4"/><text x="470" y="132" text-anchor="middle" font-size="15" font-weight="700" fill="#17213B">luz</text>
        <path d="M130 78 H260 M340 78 H440" stroke="#66523E" stroke-width="6" stroke-linecap="round"/>
        <g class="rp-antes"><path d="M260 78 L300 50" stroke="#66523E" stroke-width="6" stroke-linecap="round"/><path d="M296 70 L312 86 M312 70 L296 86" stroke="#d6336c" stroke-width="4"/></g>
        <g class="rp-depois"><path d="M260 78 H340" stroke="#2038A6" stroke-width="6" stroke-linecap="round"/></g>
        <g class="rp-fluxo"><circle cx="470" cy="78" r="22" fill="#ffd34d"/><path d="M470 34 V22 M506 48 L516 40 M434 48 L424 40" stroke="#e0a800" stroke-width="4" stroke-linecap="round"/></g>`,
    },
  };
  REPARACOES.placa = {
    legendas: ['O N da placa estava virado para o Sol do meio-dia, que está a sul: tudo ao contrário.', 'A placa rodou meia volta.', 'Agora o N aponta para norte e a seta da escola também.'],
    svg: `<circle cx="470" cy="80" r="26" fill="#ffd34d" stroke="#e0a800" stroke-width="4"/><text x="470" y="132" text-anchor="middle" font-size="14" font-weight="700" fill="#17213B">Sol do meio-dia (sul)</text>
      <path d="M150 140 V96" stroke="#66523E" stroke-width="8"/><text x="60" y="150" font-size="14" font-weight="700" fill="#17213B">placa</text>
      <g class="rp-antes"><g transform="translate(150 70) rotate(90)"><circle r="34" fill="#fff" stroke="#66523E" stroke-width="4"/><path d="M0 -28 L7 0 L0 28 L-7 0Z" fill="#d6336c"/><text y="-38" text-anchor="middle" font-size="16" font-weight="800" fill="#d6336c" transform="rotate(-90 0 -44)">N</text></g>
        <path d="M200 70 H300" stroke="#d6336c" stroke-width="5" marker-end="url(#rpSeta)"/><text x="250" y="58" text-anchor="middle" font-size="14" font-weight="700" fill="#d6336c">«norte» ✗</text></g>
      <g class="rp-depois"><g transform="translate(150 70) rotate(-90)"><circle r="34" fill="#fff" stroke="#66523E" stroke-width="4"/><path d="M0 -28 L7 0 L0 28 L-7 0Z" fill="#2038A6"/><text y="-38" text-anchor="middle" font-size="16" font-weight="800" fill="#2038A6" transform="rotate(90 0 -44)">N</text></g></g>
      <g class="rp-fluxo"><path d="M100 70 H20" stroke="#2e8b57" stroke-width="5" marker-end="url(#rpSetaV)"/><text x="60" y="58" text-anchor="middle" font-size="14" font-weight="700" fill="#2e8b57">norte ✓</text></g>
      <defs><marker id="rpSeta" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#d6336c"/></marker>
        <marker id="rpSetaV" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="5" markerHeight="5" orient="auto"><path d="M0 0L10 5L0 10Z" fill="#2e8b57"/></marker></defs>`,
  };
  // linha do tempo exata (anos verdadeiros dos dados da atividade)
  function calendario(d) {
    const x = a => 50 + (a - d.de) / (d.ate - d.de) * 512, m = d.marca, hj = d.hoje;
    const marcaSvg = (a, t, cor) => `<path d="M${x(a)} 70 V110" stroke="${cor}" stroke-width="4"/><text x="${x(a)}" y="132" text-anchor="middle" font-size="15" font-weight="800" fill="${cor}">${a}${t ? ' · ' + t : ''}</text>`;
    return {
      legendas: d.legendas,
      svg: `<path d="M40 90 H572" stroke="#66523E" stroke-width="4"/>
        <text x="${x(d.de)}" y="58" text-anchor="middle" font-size="15" font-weight="800" fill="#17213B">${d.de}</text><path d="M${x(d.de)} 80 V100" stroke="#17213B" stroke-width="4"/>
        <g class="rp-antes">${m ? marcaSvg(m, d.nome, '#d6336c') : `<text x="${x(d.de)}" y="128" text-anchor="middle" font-size="14" font-weight="700" fill="#d6336c">última tiragem</text>`}</g>
        <g class="rp-depois"><rect x="${x(d.de)}" y="82" width="${x(d.ate) - x(d.de)}" height="16" rx="6" fill="#4aa3df" fill-opacity=".45"/>
          <text x="${x(d.ate)}" y="58" text-anchor="middle" font-size="15" font-weight="800" fill="#17213B">${d.ate}</text><path d="M${x(d.ate)} 80 V100" stroke="#17213B" stroke-width="4"/></g>
        <g class="rp-fluxo">${m ? marcaSvg(m, d.nome, '#2e8b57') : ''}${hj ? marcaSvg(hj, 'hoje', '#d6336c') : ''}</g>`,
    };
  }
  function reparacao(tipo, R, dados) {
    const def = tipo === 'calendario' && dados ? calendario(dados) : (REPARACOES[tipo] || REPARACOES.tubo);
    const caixa = h('figure', { class: 'of-reparacao fase-1' });
    caixa.innerHTML = `<svg viewBox="0 0 612 160" role="img" aria-label="Reparação: antes e depois">${def.svg}</svg>`;
    const leg = h('figcaption', { 'aria-live': 'polite' }, '1. ' + def.legendas[0]);
    caixa.append(leg);
    const ir = n => { caixa.className = 'of-reparacao fase-' + n; leg.textContent = def.legendas.slice(0, n).map((t, i) => `${i + 1}. ${t}`).join(' '); };
    const pouco = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (pouco) ir(3); else { R.depois(() => ir(2), 1100); R.depois(() => ir(3), 2200); }
    caixa.ir = ir;
    return caixa;
  }

  const T = {};

  // =================================================================================== M1 · Pontes de cortiça
  T.ponte = (el, at, api) => {
    const alvo = fr(at.alvo), dec = /[,.]/.test(String(at.alvo)) || (at.pecas || []).some(p => /[,.]/.test(p));
    const pecas = at.pecas.map((t, i) => ({ i, t, f: fr(t), usada: false }));
    // cenário do Ambrósio (img/percurso/ribeira, 900×330): margens em x≈175 e x≈688, chão em y=166 (LEIA-ME do pacote de arte)
    const W = 900, M0 = 175, VAO = 513, esc = VAO / valorNum(alvo), Y = 166, ALT = 22;
    let postas = [], sel = 0, tent = 0, feito = false; const t0 = performance.now();
    const R = F.PC.relogioDe(api);
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
    let g = `<image href="img/percurso/ribeira.webp" x="0" y="0" width="${W}" height="330" preserveAspectRatio="none"/>
      <rect x="${M0 - 14}" y="${Y + 34}" width="${VAO + 28}" height="52" rx="6" fill="#fff" fill-opacity=".82"/>`;
    // régua: marcas em cada 1/den do vão
    const passos = Math.round(valorNum(alvo) * den);
    if (passos <= 24) for (let k = 0; k <= passos; k++) { const x = M0 + (k / den) * esc; g += `<line x1="${x}" x2="${x}" y1="${Y + 40}" y2="${Y + (k % den === 0 ? 58 : 50)}" stroke="#111" stroke-width="${k % den === 0 ? 2.5 : 1.2}"/>`; }
    g += `<line x1="${M0}" x2="${M0 + VAO}" y1="${Y + 40}" y2="${Y + 40}" stroke="#111" stroke-width="2"/>
      <text x="${M0}" y="${Y + 78}" text-anchor="middle" font-size="16" font-weight="700">0</text>
      <text x="${M0 + VAO}" y="${Y + 78}" text-anchor="middle" font-size="16" font-weight="700">${escrever(alvo, dec, at.unidade).replace('um ', '1 ')}</text>`;
    svg.innerHTML = g;
    // Nico do Ambrósio: âncora dos pés em (128, 312) numa tela 256×320; apresentado com 96 de altura
    const NH = 96, NW = NH * 256 / 320, NX0 = M0 - 70;
    const gPecas = svgEl('g', {}), nico = svgEl('image', { href: 'img/percurso/nico-parado.webp', x: NX0 - 128 * NH / 320, y: Y - 312 * NH / 320, width: NW, height: NH });
    const pose = n => nico.setAttribute('href', 'img/percurso/nico-' + n + '.webp');
    svg.append(gPecas, nico);

    function total() { return postas.reduce((t, p) => soma(t, p.f), [0, 1]); }
    function desenhar() {
      gPecas.innerHTML = '';
      let x = M0;
      postas.forEach(p => {
        const w = valorNum(p.f) * esc, passa = x + w > M0 + VAO + 0.5;
        const r = svgEl('g', { class: 'of-peca-posta', tabindex: '0', role: 'button', 'aria-label': 'Tirar a peça ' + p.t });
        // textura de cortiça do Ambrósio esticada no comprimento exato da peça (sem pontas arredondadas, para não criar falsos intervalos)
        r.append(svgEl('image', { href: 'img/percurso/cortica-meio.webp', x, y: Y - 2, width: w, height: ALT, preserveAspectRatio: 'none' }));
        r.append(svgEl('rect', { x, y: Y - 2, width: w, height: ALT, fill: passa ? '#e03131' : 'none', 'fill-opacity': passa ? 0.35 : 0, stroke: '#4a2f12', 'stroke-width': 1.5 }));
        const t = svgEl('text', { x: x + w / 2, y: Y - 10, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, stroke: '#fff', 'stroke-width': 4, 'paint-order': 'stroke' }); t.textContent = p.t; r.append(t);
        r.addEventListener('click', () => tirar(p));
        r.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); tirar(p); } });
        gPecas.append(r);
        x += w;
      });
      const tot = total(), c = cmp(tot, alvo);
      estado.textContent = postas.length ? `Ponte: ${postas.map(p => p.t).join(' + ')} = ${escrever(tot, dec, at.unidade)}` + (c < 0 ? ' · ainda há vão' : c > 0 ? ' · passa do vão!' : ' · tem a medida do vão') : 'Ainda não há peças no vão.';
      caixa.innerHTML = '';
      if (pecas[sel] && pecas[sel].usada) { const l = pecas.findIndex(p => !p.usada); sel = l < 0 ? 0 : l; }   // a seleção nunca fica numa peça já posta
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

    // andar: as 4 poses do Ambrósio a ~8 imagens por segundo; parado no fim (com «menos movimento», só desliza)
    const poucoMovimento = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    const anda = (x, ms) => new Promise(r => {
      if (!vivo) return;
      let f = 0; const passo = poucoMovimento ? 0 : R.cada(() => pose('anda-' + (f++ % 4 + 1)), 125);
      nico.style.transition = `transform ${ms}ms linear`; nico.style.transform = `translateX(${x}px)`;
      R.depois(() => { R.parar(passo); pose('parado'); r(); }, ms + 30);
    });
    btnTestar.addEventListener('click', async () => {
      if (feito) return;
      if (!postas.length) { api.dizer('curiosa', 'Primeiro põe peças no vão: arrasta-as do tabuleiro.'); return; }
      tent++; btnTestar.disabled = true;
      const tot = total(), c = cmp(tot, alvo), n = at.restricao && at.restricao.pecas;
      const larg = Math.min(valorNum(tot), valorNum(alvo)) * esc;
      await anda(70, 400);
      if (c === 0 && (!n || postas.length === n)) {
        await anda(70 + VAO + 60, 1400);
        feito = true; som('sucesso'); pose('festa');
        api.concluir({ ok: true, tentativas: tent, tempo: seg(t0), solucao: postas.map(p => p.t) },
          at.sucesso || `A ponte tem ${escrever(alvo, dec, at.unidade)}: ${postas.map(p => p.t).join(' + ')}. Passei! 🌉`);
        return;
      }
      if (c < 0) {
        await anda(70 + larg, 900);
        pose('pensa');
        api.dizer('a_pensar', `Parei aqui: ainda falta ${escrever(menos(alvo, tot), dec, at.unidade)} para chegar à outra margem.`);
      } else if (c > 0) {
        pose('pensa');
        api.dizer('surpreendida', `A ponte ficou maior do que o vão: passa ${escrever(menos(tot, alvo), dec, at.unidade)}. Troca ou tira uma peça.`);
      } else {
        api.dizer('a_pensar', `A medida está certa, mas a missão pede ${n} peças e usaste ${postas.length}. Consegues de outra maneira?`);
      }
      await R.espera(900);
      await anda(0, 500);
      btnTestar.disabled = false;
    });
    desenhar();
    api.dizer('boas_vindas', at.boasVindas || 'A ribeira levou a ponte! Constrói uma nova com as peças de cortiça. Quando achares que está bem, eu experimento.');
    return {
      fechar: () => { vivo = false; R.limpar(); },
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
    const R = F.PC.relogioDe(api);
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
            falhasPistas++; som('apagar'); s.classList.add('nao'); R.depois(() => s.classList.remove('nao'), 700);
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
    painel.append(h('div', { class: 'of-pedido' }, h('img', { src: 'img/percurso/detetive-caso.webp', alt: '' }), h('div', null, h('strong', null, 'O caso: '), at.pedido)), h('div', { class: 'of-fases' }), corpo);
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
        const anim = reparacao(at.reparacao || 'tubo', R, at.linhaTempo);
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
        som('sucesso'); anim.scrollIntoView({ block: 'nearest' });
        api.dizer('celebrar', at.reparado || 'Funciona outra vez! Agora explica o que descobriste.');
      }
    }
    irFase(1);
    api.dizer('boas_vindas', at.boasVindas || 'Temos um caso na oficina! Lê o manual à esquerda e encontra as pistas.');
    return {
      fechar: () => R.limpar(),
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
    const R = F.PC.relogioDe(api);
    const fasesDef = [at.copia ? 'copia' : null, at.rascunho ? 'edicao' : null, at.propria ? 'propria' : null].filter(Boolean);
    const carta = h('div', { class: 'of-carta' });
    const topo = h('div', { class: 'of-carta-topo' }, h('span', { class: 'of-selo', 'aria-hidden': 'true' }, h('img', { src: 'img/percurso/correio-selo.webp', alt: '' })), h('div', null, h('small', null, 'Para:'), h('strong', null, at.para)), h('img', { class: 'of-envelope', src: 'img/percurso/correio-envelope.webp', alt: '' }));
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
          if (inp.value.normalize('NFC') === L) { ccm = Math.round(L.length / (((performance.now() - tCopia) / 1000) / 60 || 1)); textos.copia = L; som('encaixe'); inp.disabled = true; R.depois(seguinte, 600); }
        });
        ajuda.querySelector('input').addEventListener('change', () => { pintar(); inp.focus(); });
        carta.append(h('p', { class: 'of-manuscrito' }, at.copia));
        corpo.append(h('p', { class: 'pe-instr' }, 'Copia a mensagem do Nico para o envelope, letra a letra.'), alvo, inp, dica, ajuda);
        pintar(); R.depois(() => inp.focus(), 60);
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
          if (at.certo.some(c => norm(c) === v)) { textos.edicao = v; som('encaixe'); res.textContent = 'Corrigido ✓'; ta.readOnly = true; b.disabled = true; R.depois(seguinte, 700); return; }
          // quantas palavras ainda são diferentes da versão certa mais parecida
          const pv = v.split(' '), melhor = at.certo.map(c => norm(c).split(' ')).map(c => c.reduce((n, w, i) => n + (w !== pv[i] ? 1 : 0), 0) + Math.abs(c.length - pv.length)).sort((a, b) => a - b)[0];
          res.textContent = `Ainda há ${melhor} ${melhor === 1 ? 'palavra' : 'palavras'} por corrigir.`;
          api.dizer('a_pensar', tentEdicao > 1 && at.dicaEdicao ? at.dicaEdicao : 'Lê devagar, palavra a palavra. Faltam acentos? Maiúsculas? Pontuação?');
        });
        carta.append(h('p', { class: 'of-manuscrito riscado' }, at.rascunho));
        corpo.append(h('p', { class: 'pe-instr' }, at.instrEdicao || 'O rascunho tem erros. Corrige-o na caixa: usa as setas para andar no texto, ⌫ para apagar e escreve o que falta.'), ta, res, b);
        R.depois(() => ta.focus(), 60);
        api.dizer('a_pensar', 'Escrevi isto à pressa… Ajudas-me a corrigir antes de enviar?');
      } else {
        const ta = h('textarea', { class: 'of-explica', 'aria-label': 'A tua mensagem', placeholder: at.propria.dica || 'Escreve aqui a tua mensagem…' });
        const lista = h('ul', { class: 'it-lista' });
        const crit = F.PC.itens.criteriosExtensa({ min: at.propria.min || 12, palavrasChave: at.propria.palavrasChave });
        const pintar = () => { lista.innerHTML = ''; crit.forEach(([n, fn]) => lista.append(h('li', { class: fn(ta.value) ? 'ok' : '' }, n))); };
        ta.addEventListener('input', pintar); pintar();
        const b = h('button', { type: 'button', class: 'btn btn-azul btn-grande' }, 'Enviar');
        b.addEventListener('click', () => {
          if (!crit.every(([, fn]) => fn(ta.value))) { api.dizer('dica', 'Antes de enviar, relê a mensagem e vê a lista: o que falta?'); return; }
          textos.propria = ta.value; b.disabled = true; ta.readOnly = true; seguinte();
        });
        corpo.append(h('p', { class: 'pe-pergunta' }, at.propria.pergunta), ta, lista, b);
        R.depois(() => ta.focus(), 60);
        api.dizer('curiosa', 'Agora escreve tu. Lê a mensagem antes de a enviares!');
      }
    }
    function enviar() {
      pintarFases(); corpo.innerHTML = '';
      carta.innerHTML = ''; carta.append(h('p', { class: 'of-manuscrito' }, textos.propria || textos.edicao || textos.copia));
      carta.parentNode.classList.add('enviada'); som('sucesso');
      R.depois(() => {
        corpo.append(h('div', { class: 'of-resposta' }, h('strong', null, `Resposta ${at.respostaDe || 'de ' + at.para}:`), h('p', null, at.resposta)));
        api.concluir({ ok: true, tempo: seg(t0), falhas: enganos, ccm, precisao: total ? Math.round(100 * (total - enganos) / total) : 100, tentativas: tentEdicao || 1, valor: textos.propria || '', aberta: !!at.propria },
          'Mensagem entregue! Olha, já respondeu. 📬');
      }, 900);
    }
    mostrar();
    return {
      fechar: () => R.limpar(),
      resolver: () => {
        textos.copia = at.copia; textos.edicao = at.certo && at.certo[0]; textos.propria = 'O Nico escreveu uma mensagem muito bonita para a oficina do Buinho.';
        fase = fasesDef.length; enviar();
      },
    };
  };

  const tipos = Object.keys(T);
  F.PC.oficina = { montar: (el, at, api) => { el.innerHTML = ''; return T[at.tipo](el, at, api); }, tipos, fr, soma, cmp, reparacao,
    registar: (nome, fn) => { T[nome] = fn; if (!tipos.includes(nome)) tipos.push(nome); } };
})();
