/* Nico · Percurso 4.º ano — mini-jogos (gamificar os desafios, não só «clicar na resposta certa»).
 *
 *   plataforma  o Nico corre e salta (setas + espaço), apanha as fichas certas e salta por cima das erradas
 *               { pergunta, fichas: [['18', true], ['26', false], …], tema, porque }
 *   ligar       ligar pontos com o rato: 'sequencia' (por ordem, revela um desenho) ou 'pares' (esquerda ↔ direita)
 *               { modo: 'sequencia', valores: [...por ordem], figura } · { modo: 'pares', pares: [[a, b], …] }
 *   apanhar     coisas a cair; mexe o cesto com o rato (ou setas) e apanha só as certas  { certos: [...], errados: [...] }
 *   memoria     jogo da memória com pares  { pares: [[a, b], …] }
 *   rebentar    balões a subir com palavras: escreve a palavra para o rebentar  { palavras: [...] }
 *
 *   F.PC.jogos.montar(el, atividade, api) → { fechar, resolver }   (resolver = só para os testes automáticos)
 * Grafismo provisório desenhado em código; quando chegarem as ilustrações do Ambrósio (img/percurso/…), são usadas
 * automaticamente (ver ARTE).
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.PC = F.PC || {};
  const h = (...a) => F.PC.itens.h(...a);
  const som = n => { if (F.Som) F.Som.tocar(n); };
  const seg = t0 => Math.round((performance.now() - t0) / 100) / 10;
  const baralhar = (l, s) => F.PC.itens.baralhar(l, s);

  // ------------------------------------------------------------ arte (ilustrações finais, se existirem; senão provisórias)
  const imgs = {};
  function imagem(lista) {
    const k = lista.join('|');
    if (imgs[k]) return imgs[k];
    const r = { img: null };
    const tentar = i => { if (i >= lista.length) return; const im = new Image(); im.onload = () => { r.img = im; }; im.onerror = () => tentar(i + 1); im.src = lista[i]; };
    tentar(0);
    return (imgs[k] = r);
  }
  // Poses do Nico do Ambrósio (img/percurso/nico-*). As 256×320 têm a pata em y=312; as do complemento (salta, tropeca)
  // são 288×360 com a pata em y=352, à mesma escala. Desenhar sempre pela pata.
  const POSE = n => ({ r: imagem(['img/percurso/nico-' + n + '.webp']), pe: /salta|tropeca/.test(n) ? 352 : 312 });
  const ARTE = {
    parado: () => POSE('parado'),
    corre: () => POSE('anda-' + (1 + Math.floor(performance.now() / 125) % 4)),
    salta: () => POSE('salta'),
    tropeca: () => POSE('tropeca'),
    festa: () => POSE('festa'),
  };
  F.PC.ARTE = ARTE;
  // Cenários do complemento do Ambrósio (MAPA-E-CENARIOS.json, groundFraction): fundo estático; chão e plataformas são geometria do motor.
  const CENARIOS = {
    messejana: ['cenario-messejana', 0.804], montado: ['cenario-montado', 0.83], alqueva: ['cenario-agua', 0.795],
    fablab: ['cenario-fablab', 0.765], horta: ['cenario-horta', 0.817], castelo: ['cenario-patrimonio', 0.81],
  };
  const COR = { ceu: '#EAF4FA', chao: '#D99D57', plat: '#D3AB75', borda: '#66523E', texto: '#17213B', painel: '#FFF9EC', foco: '#2038A6' };
  F.PC.cenario = tema => 'img/percurso/' + (CENARIOS[tema] || CENARIOS.montado)[0] + '.webp';

  const J = {};

  // =================================================================================== plataforma
  J.plataforma = (el, at, api) => {
    const W = 960, H = 440, CHAO = 380, PW = 54, PH = 74;
    const cen = CENARIOS[at.tema] || CENARIOS.montado, fundo = imagem(['img/percurso/' + cen[0] + '.webp']);
    const fichas = at.fichas.map(([v, certo], i) => {
      const x = 420 + i * 250;
      const tipo = i % 3 === 1 ? 'plat' : 'chao';
      return { v: String(v), certo, x, y: tipo === 'plat' ? 228 : 346, tipo, apanhada: false };
    });
    const plats = fichas.filter(f => f.tipo === 'plat').map(f => ({ x: f.x - 90, y: 262, w: 180 }));
    const L = 420 + fichas.length * 250 + 260, BANDEIRA = L - 140;
    const precisa = fichas.filter(f => f.certo).length;
    let p, vidas, apanhadas, t0 = performance.now(), fim = false, ultimoAviso = 0, tropeco = 0, falhas = 0;
    const teclas = {};
    function reiniciar(msg) {
      p = { x: 80, y: CHAO - PH, vx: 0, vy: 0, chao: true, dir: 1 };
      vidas = 3; apanhadas = 0; fichas.forEach(f => { f.apanhada = false; });
      if (msg) api.dizer('calma', msg);
      info();
    }
    const cv = h('canvas', { width: W, height: H, tabindex: '0', 'aria-label': 'Jogo de plataforma: setas para andar, espaço para saltar' });
    cv.style.width = '100%'; cv.style.maxWidth = W + 'px'; cv.style.display = 'block'; cv.style.margin = '0 auto'; cv.style.borderRadius = '10px'; cv.style.border = '3px solid #111'; cv.style.outline = 'none';
    const ctx = cv.getContext('2d');
    const placar = h('div', { class: 'jg-placar' });
    const info = () => { placar.innerHTML = ''; placar.append(h('span', null, `Certas: ${apanhadas} de ${precisa}`), h('span', { class: 'pe-instr' }, falhas ? `Tropeções: ${falhas}` : '')); };
    // botões no ecrã (rato / ecrã tátil)
    const botao = (txt, k) => {
      const b = h('button', { type: 'button', class: 'btn btn-texto jg-tecla' }, txt);
      const on = ev => { ev.preventDefault(); teclas[k] = true; }, off = () => { teclas[k] = false; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off);
      return b;
    };
    el.append(h('div', { class: 'pc-enunciado jg' },
      h('p', { class: 'pe-pergunta' }, at.pergunta),
      h('p', { class: 'pe-instr' }, 'Setas ← → para andar · Espaço (ou ↑) para saltar. Apanha as certas, salta por cima das erradas e chega à bandeira.'),
      placar, cv,
      h('div', { class: 'jg-botoes' }, botao('◀', 'esq'), botao('⤒ Saltar', 'salto'), botao('▶', 'dir'))));
    const mapa = { ArrowLeft: 'esq', a: 'esq', A: 'esq', ArrowRight: 'dir', d: 'dir', D: 'dir', ArrowUp: 'salto', ' ': 'salto', w: 'salto', W: 'salto' };
    const kd = ev => { const k = mapa[ev.key]; if (!k) return; ev.preventDefault(); teclas[k] = true; };
    const ku = ev => { const k = mapa[ev.key]; if (k) teclas[k] = false; };
    window.addEventListener('keydown', kd); window.addEventListener('keyup', ku);
    reiniciar();
    setTimeout(() => cv.focus(), 80);

    function passo(dt) {
      const ac = 1700, vmax = 270;
      if (teclas.esq) { p.vx = Math.max(p.vx - ac * dt, -vmax); p.dir = -1; }
      else if (teclas.dir) { p.vx = Math.min(p.vx + ac * dt, vmax); p.dir = 1; }
      else p.vx *= Math.pow(0.0008, dt);
      if (teclas.salto && p.chao) { p.vy = -840; p.chao = false; som('clique'); }
      p.vy += 2100 * dt;
      const yAntes = p.y;
      p.x = Math.max(0, Math.min(L - PW, p.x + p.vx * dt));
      p.y += p.vy * dt;
      p.chao = false;
      if (p.y + PH >= CHAO) { p.y = CHAO - PH; p.vy = 0; p.chao = true; }
      if (p.vy >= 0) for (const pl of plats) {
        if (p.x + PW > pl.x + 6 && p.x < pl.x + pl.w - 6 && yAntes + PH <= pl.y + 1 && p.y + PH >= pl.y) { p.y = pl.y - PH; p.vy = 0; p.chao = true; }
      }
      // fichas
      for (const f of fichas) {
        if (f.apanhada || (!f.certo && tropeco > 0)) continue;
        if (Math.abs(p.x + PW / 2 - f.x) < 40 && Math.abs(p.y + PH / 2 - f.y) < 50) {
          f.apanhada = true;
          if (f.certo) { apanhadas++; som('apanhar'); api.dizer('celebrar', `${f.v}! Certo!`); }
          else {
            // tropeçar não tira o que já se aprendeu: o erro fica registado e a ficha volta ao sítio
            falhas++; tropeco = 0.6; som('apagar'); f.apanhada = false; p.vx = -260 * p.dir; p.vy = -380; p.chao = false;
            api.dizer('surpreendida', `Tropecei no ${f.v}… esse não era! ${at.porque || ''}`);
          }
          info();
        }
      }
      // bandeira
      if (p.x + PW > BANDEIRA && !fim) {
        if (apanhadas >= precisa) {
          fim = true; som('sucesso');
          api.concluir({ ok: true, tempo: seg(t0), falhas }, falhas === 0 ? 'Perfeito: sem tropeçar! 🏁' : 'Chegaste à bandeira! 🏁');
        } else if (performance.now() - ultimoAviso > 2500) {
          ultimoAviso = performance.now();
          api.dizer('a_pensar', `Ainda faltam ${precisa - apanhadas} ${precisa - apanhadas === 1 ? 'ficha certa' : 'fichas certas'}. Volta atrás e procura!`);
        }
      }
      if (tropeco > 0) tropeco -= dt;
    }

    // ---- desenho
    function desenhar(t) {
      const cam = Math.max(0, Math.min(L - W, p.x - 300));
      // fundo estático do Ambrósio: a linha do chão da pintura (groundFraction) coincide com o chão do motor
      ctx.fillStyle = COR.ceu; ctx.fillRect(0, 0, W, H);
      if (fundo.img) { const ih = Math.max(W * fundo.img.height / fundo.img.width, CHAO / cen[1]), iw = ih * fundo.img.width / fundo.img.height; ctx.drawImage(fundo.img, (W - iw) / 2, CHAO - ih * cen[1], iw, ih); }
      ctx.save(); ctx.translate(-cam, 0);
      ctx.fillStyle = COR.chao; ctx.fillRect(0, CHAO, L, H - CHAO);
      ctx.fillStyle = COR.borda; ctx.fillRect(0, CHAO, L, 3);
      for (const pl of plats) {
        ctx.fillStyle = COR.plat; arred(pl.x, pl.y, pl.w, 24, 8); ctx.fill();
        ctx.strokeStyle = COR.borda; ctx.lineWidth = 3; arred(pl.x, pl.y, pl.w, 24, 8); ctx.stroke();
      }
      // fichas: discos claros com o número em texto
      for (const f of fichas) {
        if (f.apanhada) continue;
        const bob = Math.sin(t / 300 + f.x) * 4;
        ctx.fillStyle = COR.painel; ctx.beginPath(); ctx.arc(f.x, f.y + bob, 33, 0, 7); ctx.fill();
        ctx.strokeStyle = COR.borda; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = COR.texto; ctx.font = `700 ${f.v.length > 4 ? 15 : f.v.length > 2 ? 19 : 24}px Asap, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(f.v, f.x, f.y + bob + 1);
      }
      ctx.fillStyle = COR.borda; ctx.fillRect(BANDEIRA + 20, CHAO - 170, 6, 170);
      ctx.fillStyle = COR.foco; ctx.beginPath(); ctx.moveTo(BANDEIRA + 26, CHAO - 168); ctx.lineTo(BANDEIRA + 96, CHAO - 146); ctx.lineTo(BANDEIRA + 26, CHAO - 124); ctx.fill();
      // Nico desenhado pela pata; espelho só no desenho
      const correr = Math.abs(p.vx) > 30 && p.chao;
      const pose = tropeco > 0 ? ARTE.tropeca() : !p.chao ? ARTE.salta() : correr ? ARTE.corre() : ARTE.parado();
      const art = pose.r.img;
      ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(p.x + PW / 2, CHAO + 4, 30, 6, 0, 0, 7); ctx.fill();
      if (art) {
        const k = (PH + 30) / 312;
        ctx.save(); ctx.translate(p.x + PW / 2, p.y + PH);
        if (p.dir < 0) ctx.scale(-1, 1);
        ctx.drawImage(art, -art.width * k / 2, -pose.pe * k, art.width * k, art.height * k);
        ctx.restore();
      }
      ctx.restore();
    }
    function arred(x, y, w, hh, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + hh, r); ctx.arcTo(x + w, y + hh, x, y + hh, r); ctx.arcTo(x, y + hh, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

    let ult = performance.now(), raf = 0, vivo = true;
    const ciclo = t => {
      if (!vivo) return;
      const dt = Math.min(0.033, (t - ult) / 1000); ult = t;
      if (!fim) passo(dt);
      desenhar(t);
      raf = requestAnimationFrame(ciclo);
    };
    raf = requestAnimationFrame(ciclo);
    api.dizer('boas_vindas', at.boasVindas || 'Bora correr! Usa as setas e o espaço. Atenção às fichas erradas: salta por cima delas!');
    return {
      fechar: () => { vivo = false; cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); window.removeEventListener('keyup', ku); },
      // testes: apanha as certas e vai à bandeira
      resolver: () => { fichas.forEach(f => { if (f.certo) { f.apanhada = true; apanhadas++; } }); p.x = BANDEIRA; },
      estado: () => ({ vidas, apanhadas, precisa, x: p.x }),
    };
  };

  // =================================================================================== ligar pontos
  // contornos simples (sentido dos ponteiros) — os pontos distribuem-se ao longo do contorno
  const FIGURAS = {
    casa: { nome: 'uma casa alentejana', cor: '#f4efe3', pts: [[150, 330], [150, 170], [300, 70], [450, 170], [450, 330]] },
    estrela: { nome: 'uma estrela', cor: '#ffc850', pts: [[300, 40], [345, 150], [460, 155], [370, 225], [405, 340], [300, 275], [195, 340], [230, 225], [140, 155], [255, 150]] },
    peixe: { nome: 'um peixe', cor: '#5aa9e6', pts: [[90, 200], [190, 110], [330, 100], [430, 170], [520, 100], [500, 200], [520, 300], [430, 230], [330, 300], [190, 290]] },
    sobreiro: { nome: 'um sobreiro', cor: '#5f8f3e', pts: [[270, 350], [270, 250], [160, 240], [120, 170], [170, 90], [270, 60], [370, 70], [450, 130], [440, 220], [330, 250], [330, 350]] },
    gota: { nome: 'uma gota de água', cor: '#4f9fd8', pts: [[300, 40], [370, 160], [400, 240], [370, 320], [300, 350], [230, 320], [200, 240], [230, 160]] },
    castelo: { nome: 'um castelo', cor: '#cfc6b0', pts: [[120, 340], [120, 120], [170, 120], [170, 160], [220, 160], [220, 120], [270, 120], [270, 70], [330, 70], [330, 120], [380, 120], [380, 160], [430, 160], [430, 120], [480, 120], [480, 340]] },
  };
  function ptsAoLongo(pts, n) {
    const seg = pts.map((a, i) => { const b = pts[(i + 1) % pts.length]; return [a, b, Math.hypot(b[0] - a[0], b[1] - a[1])]; });
    const tot = seg.reduce((t, s) => t + s[2], 0), passo = tot / n, out = [];
    let d = 0;
    for (let k = 0; k < n; k++) {
      let alvo = k * passo, acc = 0;
      for (const [a, b, l] of seg) { if (acc + l >= alvo) { const t = (alvo - acc) / l; out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); break; } acc += l; }
      d += passo;
    }
    return out;
  }
  J.ligar = (el, at, api) => {
    const R = F.PC.relogioDe(api);
    const NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('viewBox', '0 0 600 400'); svg.setAttribute('class', 'jg-ligar');
    const t0 = performance.now(); let erros = 0, feito = false;
    const linha = (x1, y1, x2, y2, cls) => { const l = document.createElementNS(NS, 'line'); l.setAttribute('x1', x1); l.setAttribute('y1', y1); l.setAttribute('x2', x2); l.setAttribute('y2', y2); l.setAttribute('class', cls); return l; };
    const gLinhas = document.createElementNS(NS, 'g'), gPontos = document.createElementNS(NS, 'g');
    const fantasma = linha(0, 0, 0, 0, 'jg-fantasma'); fantasma.style.display = 'none';
    svg.append(gLinhas, fantasma, gPontos);
    const ponto = (x, y, txt, lado) => {
      const g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'jg-ponto'); g.setAttribute('tabindex', '0');
      const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('r', 13);
      const tx = document.createElementNS(NS, 'text'); tx.textContent = txt;
      const dx = lado === 'esq' ? -22 : lado === 'dir' ? 22 : 0;
      tx.setAttribute('x', x + dx); tx.setAttribute('y', y + (lado ? 6 : -20)); tx.setAttribute('text-anchor', lado === 'esq' ? 'end' : lado === 'dir' ? 'start' : 'middle');
      g.append(c, tx); g._x = x; g._y = y; gPontos.append(g); return g;
    };
    // arrastar uma linha a partir de um ponto
    function arrastarDe(origem, soltar) {
      origem.addEventListener('pointerdown', ev => {
        if (feito) return;
        ev.preventDefault();
        const pt = svg.createSVGPoint();
        const mover = e => { pt.x = e.clientX; pt.y = e.clientY; const q = pt.matrixTransform(svg.getScreenCTM().inverse()); fantasma.setAttribute('x1', origem._x); fantasma.setAttribute('y1', origem._y); fantasma.setAttribute('x2', q.x); fantasma.setAttribute('y2', q.y); fantasma.style.display = ''; };
        const largar = e => {
          window.removeEventListener('pointermove', mover); window.removeEventListener('pointerup', largar);
          fantasma.style.display = 'none';
          const alvo = document.elementFromPoint(e.clientX, e.clientY);
          const g = alvo && alvo.closest && alvo.closest('.jg-ponto');
          if (g && g !== origem) soltar(g);
        };
        window.addEventListener('pointermove', mover); window.addEventListener('pointerup', largar);
      });
    }
    let resolver;
    if (at.modo === 'pares') {
      const esq = at.pares.map(p => p[0]), dir = baralhar(at.pares.map(p => p[1]), at.id || 'pares');
      const n = at.pares.length, y = i => 60 + i * (300 / Math.max(1, n - 1));
      const pe = esq.map((t, i) => ponto(200, y(i), t, 'esq')), pd = dir.map((t, i) => ponto(400, y(i), t, 'dir'));
      let ligados = 0;
      const ligar = (a, b) => {
        const ia = pe.indexOf(a), ib = pd.indexOf(b);
        if (ia < 0 || ib < 0 || a.classList.contains('feito') || b.classList.contains('feito')) return;
        if (at.pares[ia][1] === dir[ib]) {
          a.classList.add('feito'); b.classList.add('feito'); gLinhas.append(linha(a._x, a._y, b._x, b._y, 'jg-linha')); som('encaixe'); ligados++;
          if (ligados === n) { feito = true; api.concluir({ ok: true, tempo: seg(t0), falhas: erros }); }
        } else {
          erros++; som('apagar');
          const l = linha(a._x, a._y, b._x, b._y, 'jg-linha errada'); gLinhas.append(l); R.depois(() => l.remove(), 600);
          api.dizer('a_pensar', at.dicaErro || `«${esq[ia]}» não liga com «${dir[ib]}». Experimenta outra vez!`);
        }
      };
      pe.forEach(a => arrastarDe(a, b => ligar(a, b)));
      pd.forEach(b => arrastarDe(b, a => ligar(a, b)));
      resolver = () => pe.forEach((a, i) => ligar(a, pd.find((b, k) => dir[k] === at.pares[i][1] && !b.classList.contains('feito'))));
    } else {
      const fig = FIGURAS[at.figura] || FIGURAS.estrela, n = at.valores.length;
      // os pontos ficam nos cantos do desenho (para se reconhecer); se faltarem, acrescentam-se a meio dos lados maiores
      let pts = fig.pts.map(p => p.slice());
      if (n < pts.length) pts = ptsAoLongo(fig.pts, n);
      while (pts.length < n) {
        let m = 0, k = 0;
        pts.forEach((a, i) => { const b = pts[(i + 1) % pts.length], d = Math.hypot(b[0] - a[0], b[1] - a[1]); if (d > m) { m = d; k = i; } });
        const a = pts[k], b = pts[(k + 1) % pts.length];
        pts.splice(k + 1, 0, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]);
      }
      const gs = pts.map(([x, y], i) => ponto(x, y, at.valores[i]));
      let atual = 0;
      gs[0].classList.add('atual', 'feito');
      const ligar = (a, b) => {
        if (feito) return;
        const ib = gs.indexOf(b);
        if (a !== gs[atual]) { if (b === gs[atual]) return ligar(b, a); api.dizer('dica', `Começa sempre no ponto amarelo: o ${at.valores[atual]}.`); return; }
        if (ib === atual + 1) {
          gLinhas.append(linha(a._x, a._y, b._x, b._y, 'jg-linha')); som('encaixe');
          a.classList.remove('atual'); b.classList.add('atual', 'feito'); atual = ib;
          if (atual === n - 1) {
            gLinhas.append(linha(b._x, b._y, gs[0]._x, gs[0]._y, 'jg-linha'));
            const poly = document.createElementNS(NS, 'polygon'); poly.setAttribute('points', pts.map(p => p.join(',')).join(' ')); poly.setAttribute('class', 'jg-revela'); poly.style.fill = fig.cor;
            svg.insertBefore(poly, gLinhas); feito = true; som('sucesso');
            api.concluir({ ok: true, tempo: seg(t0), falhas: erros }, `Apareceu ${fig.nome}! ✏️`);
          }
        } else {
          erros++; som('apagar');
          api.dizer('a_pensar', at.dicaErro || `Depois do ${at.valores[atual]} não vem o ${at.valores[ib]}. Qual é o seguinte?`);
        }
      };
      gs.forEach(g => arrastarDe(g, b => ligar(g, b)));
      gs.forEach(g => g.addEventListener('click', () => { if (g !== gs[atual]) ligar(gs[atual], g); }));
      resolver = () => { for (let i = atual + 1; i < n; i++) ligar(gs[i - 1], gs[i]); };
    }
    el.append(h('div', { class: 'pc-enunciado jg' }, h('p', { class: 'pe-pergunta' }, at.pergunta),
      h('p', { class: 'pe-instr' }, at.modo === 'pares' ? 'Carrega num ponto, arrasta a linha até ao par certo e larga.' : 'Começa no ponto amarelo. Arrasta uma linha até ao número seguinte (ou clica nele).'), svg));
    api.dizer('boas_vindas', at.boasVindas || 'Liga os pontos com o rato: carrega, arrasta e larga.');
    return { fechar: () => R.limpar(), resolver };
  };

  // =================================================================================== apanhar (coisas a cair)
  J.apanhar = (el, at, api) => {
    const zona = h('div', { class: 'rt-zona jg-apanhar', tabindex: '0', 'aria-label': 'Jogo: mexe o cesto com o rato ou com as setas' });
    const cesto = h('div', { class: 'jg-cesto' }, h('img', { class: 'jg-cesto-nico', src: 'img/percurso/nico-parado.webp', alt: '' }), h('img', { class: 'jg-cesto-img', src: 'img/percurso/cesto-vazio.webp', alt: '' }));
    zona.style.backgroundImage = `url(${F.PC.cenario(at.tema)})`;
    zona.append(cesto);
    const placar = h('div', { class: 'jg-placar' });
    el.append(h('div', { class: 'pc-enunciado jg' }, h('p', { class: 'pe-pergunta' }, at.pergunta),
      h('p', { class: 'pe-instr' }, 'Mexe o rato para a esquerda e para a direita (ou usa as setas) e apanha só as certas.'), placar, zona));
    const meta = at.certos.length;
    const certasVistas = new Set();
    let fila, caem, vidas, apanhados, cx = 0.5, t0 = performance.now(), fim = false, falhas = 0, proximo = 0;
    const W = () => zona.clientWidth || 900, H = () => zona.clientHeight || 460;
    function reiniciar() {
      fila = baralhar([...at.certos.map(t => [t, true]), ...at.errados.map(t => [t, false])], (at.id || 'ap') + Math.random());
      (caem || []).forEach(c => c.el.remove()); caem = []; vidas = 3; apanhados = 0; info();
    }
    const info = () => { placar.innerHTML = ''; placar.append(h('span', null, `Palavras certas: ${apanhados} de ${meta}`), h('span', { class: 'pe-instr' }, falhas ? `Enganos: ${falhas}` : '')); };
    zona.addEventListener('pointermove', ev => { const r = zona.getBoundingClientRect(); cx = Math.max(0.06, Math.min(0.94, (ev.clientX - r.left) / r.width)); });
    const kd = ev => { if (ev.key === 'ArrowLeft') { cx = Math.max(0.06, cx - 0.05); ev.preventDefault(); } if (ev.key === 'ArrowRight') { cx = Math.min(0.94, cx + 0.05); ev.preventDefault(); } };
    window.addEventListener('keydown', kd);
    reiniciar();
    function largar() {
      if (!fila.length) fila = baralhar([...at.certos.filter(t => !certasVistas.has(t)).map(t => [t, true]), ...at.errados.map(t => [t, false])], 'x' + Math.random());
      const [t, certo] = fila.shift();
      const e = h('div', { class: 'jg-cai' }, t);
      zona.append(e);
      caem.push({ el: e, t, certo, x: 0.08 + Math.random() * 0.84, y: -50, v: (at.velocidade || 85) + Math.random() * 40 });
    }
    let ult = performance.now(), raf = 0, vivo = true;
    const ciclo = now => {
      if (!vivo) return;
      const dt = Math.min(0.05, (now - ult) / 1000); ult = now;
      if (!fim) {
        if (now > proximo && caem.length < 3) { largar(); proximo = now + 1300; }
        const w = W(), hh = H(), bx = cx * w;
        cesto.style.left = (bx - 60) + 'px';
        for (const c of caem.slice()) {
          c.y += c.v * dt;
          c.el.style.left = (c.x * w - 60) + 'px'; c.el.style.top = c.y + 'px';
          if (c.y > hh - 120 && c.y < hh - 70 && Math.abs(c.x * w - bx) < 80) {
            c.el.remove(); caem.splice(caem.indexOf(c), 1);
            if (c.certo) {
              // conta cada palavra certa uma só vez: no fim têm de estar todas as diferentes
              if (!certasVistas.has(c.t)) { certasVistas.add(c.t); apanhados++; }
              som('apanhar'); api.dizer('celebrar', `${c.t}! Isso!`);
              if (apanhados >= meta) { fim = true; api.concluir({ ok: true, tempo: seg(t0), falhas }); }
            } else { falhas++; som('apagar'); api.dizer('surpreendida', `«${c.t}» não! ${at.porque || ''}`); }
            info();
          } else if (c.y > hh) {
            c.el.remove(); caem.splice(caem.indexOf(c), 1);
            if (c.certo && !certasVistas.has(c.t)) fila.push([c.t, true]);        // as certas que faltam voltam a cair
          }
        }
      }
      raf = requestAnimationFrame(ciclo);
    };
    raf = requestAnimationFrame(ciclo);
    api.dizer('boas_vindas', at.boasVindas || 'Mexe o cesto com o rato e apanha só as certas!');
    return {
      fechar: () => { vivo = false; cancelAnimationFrame(raf); window.removeEventListener('keydown', kd); },
      resolver: () => { apanhados = meta; fim = true; info(); api.concluir({ ok: true, vidas, tempo: seg(t0), falhas }); },
    };
  };

  // =================================================================================== memória
  J.memoria = (el, at, api) => {
    const R = F.PC.relogioDe(api);
    const cartas = baralhar(at.pares.flatMap((p, i) => [{ t: p[0], par: i }, { t: p[1], par: i }]), at.id || 'mem');
    const t0 = performance.now(); let abertas = [], feitos = 0, jogadas = 0, bloq = false, tVirar = 0;
    const grelha = h('div', { class: 'jg-memoria' });
    grelha.style.gridTemplateColumns = `repeat(${cartas.length > 12 ? 6 : 4}, minmax(0, 150px))`;
    const els = cartas.map(c => {
      const b = h('button', { type: 'button', class: 'jg-carta', 'aria-label': 'Carta virada' }, h('img', { class: 'jg-costas', src: 'img/percurso/carta-verso.webp', alt: '' }), h('span', { class: 'jg-face' }, c.t));
      b.addEventListener('click', () => virar(b, c));
      grelha.append(b); return b;
    });
    function virar(b, c) {
      if (bloq || b.classList.contains('virada')) return;
      b.classList.add('virada'); b.setAttribute('aria-label', c.t); som('clique');
      abertas.push([b, c]);
      if (abertas.length < 2) return;
      jogadas++;
      const [[b1, c1], [b2, c2]] = abertas; abertas = [];
      if (c1.par === c2.par) {
        b1.classList.add('par'); b2.classList.add('par'); feitos++; som('encaixe');
        if (feitos === at.pares.length) api.concluir({ ok: true, tempo: seg(t0), jogadas }, `Todos os pares em ${jogadas} jogadas!`);
      } else {
        bloq = true;
        tVirar = R.depois(() => { for (const x of [b1, b2]) { x.classList.remove('virada'); x.setAttribute('aria-label', 'Carta virada'); } bloq = false; }, 900);
      }
    }
    el.append(h('div', { class: 'pc-enunciado jg' }, h('p', { class: 'pe-pergunta' }, at.pergunta), h('p', { class: 'pe-instr' }, 'Vira duas cartas de cada vez. Se forem par, ficam abertas.'), grelha));
    api.dizer('boas_vindas', at.boasVindas || 'Jogo da memória! Lembra-te de onde estão as cartas.');
    return {
      fechar: () => R.limpar(),
      resolver: () => { R.parar(tVirar); abertas = []; at.pares.forEach((_, i) => { const [a, b] = els.filter((_, k) => cartas[k].par === i); bloq = false; virar(a, cartas[els.indexOf(a)]); virar(b, cartas[els.indexOf(b)]); }); },
    };
  };

  // =================================================================================== rebentar balões (teclado)
  J.rebentar = (el, at, api) => {
    const R = F.PC.relogioDe(api);
    const zona = h('div', { class: 'rt-zona jg-baloes' });
    zona.style.backgroundImage = `url(${F.PC.cenario(at.tema)})`;
    const inp = h('input', { class: 'tc-entrada', type: 'text', autocomplete: 'off', spellcheck: 'false', autocapitalize: 'off', 'aria-label': 'Escreve a palavra do balão' });
    const placar = h('div', { class: 'jg-placar' });
    const bPausa = h('button', { type: 'button', class: 'btn btn-texto' }, '⏸ Pausa');
    bPausa.addEventListener('click', () => { pausa = !pausa; bPausa.textContent = pausa ? '▶ Continuar' : '⏸ Pausa'; inp.focus(); });
    el.append(h('div', { class: 'pc-enunciado jg' }, h('p', { class: 'pe-pergunta' }, at.pergunta || 'Escreve a palavra de um balão para o rebentar!'), placar, zona, h('div', { style: 'display:flex;gap:10px;margin-top:10px' }, inp, bPausa)));
    let fila = at.palavras.slice(), sobem = [], feitos = 0, erros = 0, proximo = 0, emErro = false, pausa = false; const t0 = performance.now(), total = at.palavras.length;
    const info = () => { placar.innerHTML = ''; placar.append(h('span', null, `Rebentados: ${feitos} de ${total}`)); };
    info();
    inp.addEventListener('paste', ev => ev.preventDefault());
    inp.addEventListener('input', () => {
      const v = inp.value.trim();
      const b = sobem.find(s => s.t === v);
      if (b) {
        b.el.classList.add('pum'); R.depois(() => b.el.remove(), 300); sobem.splice(sobem.indexOf(b), 1);
        feitos++; som('apanhar'); inp.value = ''; info();
        if (feitos >= total) { vivo = false; api.concluir({ ok: true, tempo: seg(t0), falhas: erros }, 'Rebentaste todos os balões! 🎈'); }
      } else if (v && !sobem.some(s => s.t.startsWith(v))) {
        // um engano conta uma vez por palavra (até a criança apagar e recomeçar)
        if (!emErro) { erros++; emErro = true; }
        inp.classList.add('erro');
      } else { emErro = false; inp.classList.remove('erro'); }
    });
    let ult = performance.now(), raf = 0, vivo = true;
    const ciclo = now => {
      if (!vivo) return;
      const dt = Math.min(0.05, (now - ult) / 1000); ult = now;
      const hh = zona.clientHeight || 460, w = zona.clientWidth || 900;
      const maxBaloes = feitos < 2 ? 1 : 2;      // começa com um balão de cada vez
      if (!pausa && now > proximo && sobem.length < maxBaloes && fila.length) {
        const t = fila.shift();
        const e = h('div', { class: 'jg-balao' }, h('img', { src: 'img/percurso/balao-vazio.webp', alt: '' }), h('span', null, t));
        zona.append(e); sobem.push({ el: e, t, x: 0.1 + Math.random() * 0.7, y: hh, v: (at.velocidade || 30) + Math.random() * 8 });
        proximo = now + 2600;
      }
      for (const s of sobem.slice()) {
        if (!pausa) s.y -= s.v * dt; s.el.style.left = (s.x * w) + 'px'; s.el.style.top = s.y + 'px';
        if (s.y < -90) { s.el.remove(); sobem.splice(sobem.indexOf(s), 1); fila.push(s.t); }   // fugiu: volta a aparecer
      }
      raf = requestAnimationFrame(ciclo);
    };
    raf = requestAnimationFrame(ciclo);
    setTimeout(() => inp.focus(), 60);
    api.dizer('boas_vindas', at.boasVindas || 'Escreve a palavra que está no balão. Atenção aos acentos!');
    return {
      fechar: () => { vivo = false; cancelAnimationFrame(raf); R.limpar(); },
      resolver: () => { vivo = false; feitos = total; info(); api.concluir({ ok: true, tempo: seg(t0), falhas: erros }); },
    };
  };

  F.PC.jogos = { montar: (el, at, api) => { el.innerHTML = ''; return J[at.tipo](el, at, api); }, tipos: Object.keys(J), FIGURAS };
})();
