/* Nico · Arcada — «O Jaime em Messejana»: jogo de plataformas a partir do jogo retro do Jaime (Nov 2026).
 *
 * A ideia, as ruas de Messejana e as velhinhas são do Jaime (o jogo original foi feito por ele no Clickteam Fusion).
 * Esta versão HTML5 foi feita a pedido do Carlos, com níveis e adversários novos.
 *   Arte: o Jaime em pixel art (Ambrósio, PR #81: atlas 128×128, pés em [64,112]); cenários, personagens e objetos do
 *   pacote «Mapa de Cobre» do Ambrósio. O chão, as plataformas de pedra e as bandeiras são geometria do motor.
 *   Os adversários novos (cão, pombo, gato, carrinha do pão, guarda) estão previstos em ADVERSARIOS: quando a arte chegar,
 *   basta mudar a imagem e o tipo. Por agora: velhinhas (Avó Rosa), vizinhos da feira, laranjas a cair, vagonetas a rolar.
 * Comandos: ← → (ou A D) para andar, ↑, W ou espaço para saltar, P ou Esc para pausa. Botões no ecrã para tátil.
 * Não dá moedas do percurso (é um jogo extra); o recorde fica neste computador.
 *
 *   F.PC.jogoJaime.montar(el, opcoes, api) → { fechar, estado, saltarParaNivel }
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {}; F.PC = F.PC || {};
  const W = 960, H = 480, CHAO = 420, G = 2200, VEL = 300, SALTO = 840;
  const CAIXA = [-16, -84, 32, 84];   // colisão do Jaime, relativa aos pés (manifesto do Ambrósio)
  const ANIM = { parado: [[0, 1], 2], correr: [[2, 3, 4, 5, 6, 7], 10], subir: [[8], 1], cair: [[9], 1], apanhado: [[10, 11], 5], festa: [[12, 13, 14], 6] };
  const IMG = n => `img/percurso/${n}`;

  // ------------------------------------------------------------ adversários (comportamento + arte)
  // tipo: 'persegue' anda para o Jaime quando está perto · 'patrulha' entre a e b · 'cai' cai do céu quando ele se aproxima
  //       'rola' atravessa o ecrã a correr da direita para a esquerda
  const ADVERSARIOS = {
    velhinha: { img: 'avo-rosa.webp', w: 80, h: 106, vel: 85, tipo: 'persegue', nome: 'as velhinhas (querem dar-te beijinhos!)' },
    vizinha: { img: 'dona-graca.webp', w: 96, h: 112, vel: 70, tipo: 'patrulha', nome: 'a Dona Graça (quer vender-te queijo)' },
    vizinho: { img: 'sr-manuel.webp', w: 80, h: 112, vel: 110, tipo: 'patrulha', nome: 'o Sr. Manuel (anda à pressa)' },
    carteiro: { img: 'carteiro.webp', w: 80, h: 96, vel: 125, tipo: 'patrulha', nome: 'o carteiro (precisa de uma assinatura)' },
    laranja: { img: 'feira-laranjas.webp', w: 44, h: 40, vel: 0, tipo: 'cai', nome: 'laranjas a cair das bancas' },
    vagoneta: { img: 'vagoneta-pedra.webp', w: 110, h: 84, vel: 320, tipo: 'rola', nome: 'vagonetas desgovernadas' },
    vagonetaM: { img: 'vagoneta-minerio.webp', w: 110, h: 84, vel: 260, tipo: 'rola', nome: 'vagonetas desgovernadas' },
    // previstos (à espera da arte do Ambrósio): cao, pombo, gato, carrinha-pao, guarda
  };

  // ------------------------------------------------------------ níveis
  // chao: troços [x0, x1] com chão (fora deles há buraco) · plat: [x, y, w, img?] plataformas que só seguram por cima
  // moedas: [x, y] · inimigos: [tipo, x, a?, b?] · bandeira: checkpoint a meio · fim: x da meta
  const NIVEIS = [
    { nome: 'A rua de Messejana', fundo: 'cenario-messejana.webp', gf: 0.804, chaoCor: ['#e9dcc3', '#cdbb98'], fim: 4600, bandeira: 2300,
      chao: [[-200, 4900]],
      plat: [[700, 330, 120, 'caixa-queijos-fechada.webp'], [1550, 300, 180], [1850, 230, 160], [3000, 320, 120, 'caixa-queijos-fechada.webp'], [3500, 300, 200]],
      moedas: [[500, 360], [560, 360], [620, 360], [760, 270], [1600, 240], [1660, 240], [1900, 170], [1960, 170], [2600, 360], [2660, 360], [3050, 260], [3550, 240], [3610, 240], [4100, 360], [4160, 360]],
      inimigos: [['velhinha', 1100], ['velhinha', 2000], ['velhinha', 2900], ['velhinha', 3300], ['velhinha', 4000]] },
    { nome: 'A praça em dia de feira', fundo: 'cenario-messejana-praca.webp', chaoCor: ['#d8d0c0', '#b9ac93'], fim: 5200, bandeira: 2600,
      chao: [[-200, 5500]],
      plat: [[600, 320, 200], [1000, 270, 200], [1700, 320, 220], [2100, 250, 160], [3000, 320, 200], [3350, 260, 200], [3900, 310, 200], [4300, 240, 180]],
      moedas: [[650, 260], [710, 260], [1050, 210], [1110, 210], [1750, 260], [1810, 260], [2140, 190], [2800, 360], [3050, 260], [3400, 200], [3460, 200], [3950, 250], [4340, 180], [4700, 360], [4760, 360]],
      inimigos: [['vizinha', 900, 800, 1300], ['laranja', 1500], ['vizinho', 1900, 1700, 2400], ['velhinha', 2900], ['laranja', 3200], ['vizinha', 3700, 3500, 4100], ['laranja', 4400], ['vizinho', 4600, 4400, 5000]] },
    { nome: 'As vagonetas da mina', fundo: 'cenario-aljustrel-mina.webp', chaoCor: ['#c9794a', '#a35c34'], fim: 5600, bandeira: 2900,
      chao: [[-200, 1300], [1460, 2600], [2760, 3900], [4080, 5900]],
      plat: [[1300, 330, 160], [2600, 300, 160], [3150, 300, 200], [3900, 330, 180], [4500, 280, 200]],
      moedas: [[1330, 270], [1390, 270], [1700, 360], [1760, 360], [2630, 240], [2690, 240], [3200, 240], [3260, 240], [3930, 270], [3990, 270], [4550, 220], [4610, 220], [5100, 360], [5160, 360]],
      inimigos: [['vagoneta', 900], ['vagonetaM', 2000], ['carteiro', 2300, 2000, 2550], ['vagoneta', 3400], ['vagonetaM', 4300], ['carteiro', 5000, 4700, 5400]] },
    { nome: 'O caminho do castelo', fundo: 'cenario-patrimonio.webp', gf: 0.81, chaoCor: ['#d9b26a', '#b48a45'], fim: 6000, bandeira: 3000,
      chao: [[-200, 1000], [1180, 2000], [2200, 2900], [3100, 3800], [4050, 6300]],
      plat: [[1000, 330, 180], [1600, 280, 160], [2000, 320, 200], [2900, 320, 200], [3300, 250, 160], [3800, 320, 250], [4400, 280, 160], [4700, 220, 160], [5200, 300, 200]],
      moedas: [[1040, 270], [1100, 270], [1640, 220], [2050, 260], [2110, 260], [2950, 260], [3340, 190], [3850, 260], [3910, 260], [4440, 220], [4740, 160], [5250, 240], [5310, 240], [5700, 360]],
      inimigos: [['velhinha', 700], ['vizinho', 1500, 1200, 1900], ['vagoneta', 2500], ['velhinha', 3500], ['carteiro', 4300, 4100, 4700], ['velhinha', 5000], ['velhinha', 5400], ['vagonetaM', 5600]] },
  ];

  const cache = {};
  function img(n) { if (!cache[n]) { const i = new Image(); i.src = IMG(n); cache[n] = i; } return cache[n]; }
  const pronta = i => i && i.complete && i.naturalWidth > 0;

  function montar(el, opcoes, api) {
    opcoes = opcoes || {};
    const h = F.PC.itens ? F.PC.itens.h : null;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H; cv.tabIndex = 0;
    cv.className = 'jj-tela'; cv.setAttribute('aria-label', 'Jogo do Jaime: setas para andar, espaço para saltar, P para pausa');
    const ctl = document.createElement('div'); ctl.className = 'jj-ctl';
    const bt = (t, k, al) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-texto jj-bt'; b.textContent = t; b.setAttribute('aria-label', al);
      const on = e => { e.preventDefault(); tecla[k] = true; if (k === 'salto') pedirSalto(); }, off = e => { e.preventDefault(); tecla[k] = false; };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off); return b; };
    ctl.append(bt('◀', 'esq', 'Andar para a esquerda'), bt('⤒ Saltar', 'salto', 'Saltar'), bt('▶', 'dir', 'Andar para a direita'));
    const info = document.createElement('p'); info.className = 'jj-info'; info.textContent = 'Setas ← → para andar · espaço ou ↑ para saltar · P para pausa. Jogo criado pelo Jaime.';
    el.append(cv, ctl, info);
    const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
    const folha = img('jaime-sheet.png');

    const tecla = {}; let pedido = 0;
    function pedirSalto() { pedido = 0.12; }
    const kd = e => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') tecla.esq = true;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') tecla.dir = true;
      else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { if (!tecla.salto) pedirSalto(); tecla.salto = true; }
      else if (k === 'p' || k === 'P' || k === 'Escape') { pausa = !pausa; }
      else if (k === 'Enter' && (S.fase === 'fim' || S.fase === 'perdeu' || S.fase === 'inicio')) avancarEcra();
      else return;
      e.preventDefault();
    };
    const ku = e => { const k = e.key; if (k === 'ArrowLeft' || k === 'a' || k === 'A') tecla.esq = false; else if (k === 'ArrowRight' || k === 'd' || k === 'D') tecla.dir = false; else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') tecla.salto = false; };
    cv.addEventListener('keydown', kd); cv.addEventListener('keyup', ku);
    cv.addEventListener('pointerdown', () => { cv.focus(); if (S.fase !== 'jogar') avancarEcra(); });
    const blur = () => { pausa = true; Object.keys(tecla).forEach(k => { tecla[k] = false; }); };
    window.addEventListener('blur', blur);
    let pausa = false;

    let recorde = 0; try { recorde = Number(localStorage.getItem('nico.jogoJaime.recorde')) || 0; } catch (e) { /* sem armazenamento */ }
    const S = { nivel: 0, fase: 'inicio', vidas: 3, moedas: 0, pontos: 0, total: 0, t: 0, cam: 0, aviso: '', avisoT: 0 };
    let J, L, inimigos, moedas;

    function carregarNivel(n) {
      S.nivel = n; L = NIVEIS[n];
      moedas = L.moedas.map(([x, y]) => ({ x, y, ok: false }));
      inimigos = L.inimigos.map(([tipo, x, a, b]) => { const D = ADVERSARIOS[tipo];
        return { tipo, D, x, y: D.tipo === 'cai' ? -60 : CHAO, x0: x, a: a == null ? x - 200 : a, b: b == null ? x + 200 : b, dir: -1, vy: 0, ativo: D.tipo !== 'cai' && D.tipo !== 'rola', saltado: false, fase: Math.random() * 6 }; });
      S.check = 80; S.moedasNivel = 0;
      [L.fundo, 'moeda-cobre.webp', ...new Set(L.inimigos.map(i => ADVERSARIOS[i[0]].img)), ...L.plat.filter(p => p[3]).map(p => p[3])].forEach(img);
      renascer();
    }
    function renascer() { J = { x: S.check, y: CHAO, vx: 0, vy: 0, chao: true, dir: 1, anim: 'parado', at: 0, inv: 1.2, apanhado: 0, coyote: 0 }; S.cam = Math.max(0, J.x - 300); }
    function avancarEcra() {
      if (S.fase === 'inicio') { S.fase = 'jogar'; carregarNivel(0); }
      else if (S.fase === 'fim') { if (S.nivel + 1 < NIVEIS.length) { S.fase = 'jogar'; carregarNivel(S.nivel + 1); } else { S.fase = 'inicio'; S.vidas = 3; S.moedas = 0; S.pontos = 0; } }
      else if (S.fase === 'perdeu') { S.fase = 'jogar'; S.vidas = 3; S.moedas = 0; S.pontos = 0; carregarNivel(S.nivel); }
      cv.focus();
    }
    const avisar = t => { S.aviso = t; S.avisoT = 2.2; };
    const temChao = x => L.chao.some(([a, b]) => x >= a && x <= b);

    // ------------------------------------------------------------ física e regras
    function passo(dt) {
      S.t += dt; if (S.avisoT > 0) S.avisoT -= dt;
      if (S.fase === 'festa') { J.at += dt; S.festaT -= dt; if (S.festaT <= 0) { S.fase = 'fim'; guardarRecorde(); if (api && api.concluir && S.nivel === NIVEIS.length - 1) api.concluir({ ok: true, valor: S.pontos }); } return; }
      if (S.fase !== 'jogar') return;
      if (pedido > 0) pedido -= dt;
      if (J.apanhado > 0) { J.apanhado -= dt; J.at += dt; if (J.apanhado <= 0) { if (S.vidas <= 0) { S.fase = 'perdeu'; guardarRecorde(); } else renascer(); } return; }
      const mv = (tecla.dir ? 1 : 0) - (tecla.esq ? 1 : 0);
      J.vx = mv * VEL; if (mv) J.dir = mv;
      J.coyote = J.chao ? 0.1 : Math.max(0, J.coyote - dt);
      if (pedido > 0 && (J.chao || J.coyote > 0)) { J.vy = -SALTO; J.chao = false; J.coyote = 0; pedido = 0; if (F.Som) F.Som.tocar('clique'); }
      if (!tecla.salto && J.vy < -300) J.vy = -300;   // salto mais curto se largar a tecla
      J.vy += G * dt;
      const yAntes = J.y;
      J.x = Math.max(0, Math.min(L.fim + 200, J.x + J.vx * dt)); J.y += J.vy * dt;
      J.chao = false;
      if (J.vy >= 0) {
        for (const [px, py, pw] of L.plat) if (J.x + 10 > px && J.x - 10 < px + pw && yAntes <= py + 1 && J.y >= py) { J.y = py; J.vy = 0; J.chao = true; }
        if (!J.chao && temChao(J.x) && yAntes <= CHAO + 1 && J.y >= CHAO) { J.y = CHAO; J.vy = 0; J.chao = true; }
      }
      if (J.y > H + 140) return perderVida('Caíste num buraco!');
      if (J.inv > 0) J.inv -= dt;
      J.anim = !J.chao ? (J.vy < 0 ? 'subir' : 'cair') : mv ? 'correr' : 'parado'; J.at += dt;
      if (J.x > S.check + 10 && J.x >= L.bandeira && S.check < L.bandeira) { S.check = L.bandeira; avisar('Bandeira! Se te apanharem, voltas aqui.'); if (F.Som) F.Som.tocar('nivel'); }
      // moedas
      moedas.forEach(m => { if (!m.ok && Math.abs(m.x - J.x) < 30 && m.y > J.y - 100 && m.y < J.y + 10) { m.ok = true; S.moedas++; S.moedasNivel++; S.pontos += 10; if (F.Som) F.Som.tocar('encaixe'); } });
      // adversários
      inimigos.forEach(e => {
        const D = e.D; e.fase += dt;
        if (D.tipo === 'persegue') { const d = J.x - e.x; if (Math.abs(d) < 520) { e.dir = Math.sign(d) || e.dir; e.x += e.dir * D.vel * dt; } }
        else if (D.tipo === 'patrulha') { e.x += e.dir * D.vel * dt; if (e.x < e.a) e.dir = 1; if (e.x > e.b) e.dir = -1; }
        else if (D.tipo === 'cai') {
          if (!e.ativo && J.x > e.x0 - 460 && J.x < e.x0 - 120 && (e.espera = (e.espera || 0) - dt) <= 0) { e.ativo = true; e.y = -40; e.vy = 0; e.x = e.x0; e.espera = 1.2; }
          if (e.ativo) { e.vy += G * 0.5 * dt; e.y += e.vy * dt; if (e.y > CHAO + 10) { e.ativo = false; e.y = -60; } }
        } else if (D.tipo === 'rola') {
          if (!e.ativo && J.x > e.x0 - 500 && J.x < e.x0) { e.ativo = true; e.x = S.cam + W + 80; e.dir = -1; e.saltado = false; }
          if (e.ativo) { e.x -= D.vel * dt; if (e.x < S.cam - 200) { e.ativo = false; e.x0 = -99999; } }
        }
        if (!e.ativo && (D.tipo === 'cai' || D.tipo === 'rola')) return;
        // colisão (caixas encolhidas para ser justo)
        const ex0 = e.x - D.w * 0.27, ex1 = e.x + D.w * 0.27, ey0 = e.y - D.h * 0.85, ey1 = e.y;
        const jx0 = J.x + CAIXA[0], jx1 = J.x + CAIXA[0] + CAIXA[2], jy0 = J.y + CAIXA[1], jy1 = J.y;
        if (J.inv <= 0 && jx1 > ex0 && jx0 < ex1 && jy1 > ey0 + 6 && jy0 < ey1) return perderVida(`Apanhado por ${D.nome}!`);
        if (!e.saltado && D.tipo !== 'cai' && Math.abs(J.x - e.x) < 14 && J.y < ey0) { e.saltado = true; S.pontos += 25; avisar('+25 por saltar por cima!'); }
      });
      if (J.x >= L.fim) { S.fase = 'festa'; S.festaT = 2.4; J.anim = 'festa'; J.at = 0; S.pontos += 100 + S.vidas * 20; if (F.Som) F.Som.tocar('sucesso'); }
      S.cam += (Math.max(0, Math.min(L.fim + 300 - W, J.x - 320)) - S.cam) * Math.min(1, dt * 8);
    }
    function perderVida(t) {
      if (J.apanhado > 0) return; S.vidas--; J.apanhado = 1.1; J.anim = 'apanhado'; J.at = 0; avisar(t); if (F.Som) F.Som.tocar('apagar');
      inimigos.forEach(e => { if (Math.abs(e.x - J.x) < 260 && e.D.tipo === 'persegue') e.x += (e.x < J.x ? -260 : 260); });
    }
    function guardarRecorde() { if (S.pontos > recorde) { recorde = S.pontos; try { localStorage.setItem('nico.jogoJaime.recorde', String(recorde)); } catch (e) { /* sem armazenamento */ } } }

    // ------------------------------------------------------------ desenho
    function fundo() {
      const f = img(L.fundo);
      if (pronta(f)) {
        // o chão pintado no cenário (groundFraction do Ambrósio) fica à altura do chão do jogo
        const fh = CHAO / (L.gf || 0.8) + 8, s = fh / f.naturalHeight, fw = Math.max(W, f.naturalWidth * s), fh2 = fw / f.naturalWidth * f.naturalHeight;
        // um só cenário que desliza devagar ao longo do nível (sem repetir a igreja); o chão da pintura fica no chão do jogo
        const k = Math.max(0, Math.min(1, S.cam / Math.max(1, L.fim + 300 - W)));
        c.fillStyle = '#cfe8f7'; c.fillRect(0, 0, W, H);
        c.drawImage(f, -(fw - W) * k, CHAO - fh2 * (L.gf || 0.8), fw, fh2);
      } else { c.fillStyle = '#bfe3ff'; c.fillRect(0, 0, W, H); }
    }
    function chao() {
      const [cl, esc] = L.chaoCor;
      L.chao.forEach(([a, b]) => {
        const x0 = a - S.cam, x1 = b - S.cam; if (x1 < 0 || x0 > W) return;
        c.fillStyle = cl; c.fillRect(x0, CHAO, x1 - x0, H - CHAO);
        c.fillStyle = esc; c.fillRect(x0, CHAO, x1 - x0, 5);
        c.strokeStyle = esc; c.lineWidth = 2;
        for (let y = CHAO + 20; y < H; y += 20) { c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke(); }
        for (let y = CHAO + 5, r = 0; y < H; y += 20, r++) for (let x = Math.ceil((a + (r % 2) * 24) / 48) * 48 - (r % 2) * 24; x < b; x += 48) { const xx = x - S.cam; if (xx < -2 || xx > W) continue; c.beginPath(); c.moveTo(xx, y); c.lineTo(xx, y + 15); c.stroke(); }
      });
    }
    function plataformas() {
      L.plat.forEach(([x, y, w, im]) => {
        const xx = x - S.cam; if (xx > W || xx + w < 0) return;
        const i = im ? img(im) : null;
        if (i && pronta(i)) c.drawImage(i, xx - 6, y - 10, w + 12, Math.min(110, CHAO - y + 10));
        else { c.fillStyle = '#c8b28d'; c.fillRect(xx, y, w, 22); c.fillStyle = '#8f7a55'; c.fillRect(xx, y + 18, w, 6); c.strokeStyle = '#8f7a55'; c.lineWidth = 2; for (let k = 40; k < w; k += 40) { c.beginPath(); c.moveTo(xx + k, y); c.lineTo(xx + k, y + 18); c.stroke(); } }
      });
    }
    function bandeira(x, cor) { const xx = x - S.cam; if (xx < -40 || xx > W + 40) return; c.fillStyle = '#555'; c.fillRect(xx, CHAO - 130, 6, 130); c.fillStyle = cor; c.beginPath(); c.moveTo(xx + 6, CHAO - 130); c.lineTo(xx + 56, CHAO - 112); c.lineTo(xx + 6, CHAO - 94); c.fill(); }
    function desenharMoedas() {
      const i = img('moeda-cobre.webp');
      moedas.forEach(m => { if (m.ok) return; const xx = m.x - S.cam; if (xx < -30 || xx > W + 30) return; const sx = Math.abs(Math.cos(S.t * 4 + m.x)) * 0.8 + 0.2;
        if (pronta(i)) { c.save(); c.translate(xx, m.y); c.scale(sx, 1); c.drawImage(i, -16, -16, 32, 32); c.restore(); } else { c.fillStyle = '#c97a3b'; c.beginPath(); c.arc(xx, m.y, 14 * sx, 0, 7); c.fill(); } });
    }
    function desenharInimigos() {
      inimigos.forEach(e => {
        if ((e.D.tipo === 'cai' || e.D.tipo === 'rola') && !e.ativo) return;
        const xx = e.x - S.cam; if (xx < -150 || xx > W + 150) return;
        if (e.D.tipo === 'cai') { const r = 10 + 18 * Math.max(0, Math.min(1, (e.y + 40) / (CHAO + 40))); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(xx, CHAO + 2, r, r * 0.35, 0, 0, 7); c.fill(); }
        const i = img(e.D.img), D = e.D;
        const bob = e.D.tipo === 'rola' ? Math.sin(e.fase * 30) * 1.5 : e.D.tipo === 'cai' ? 0 : Math.abs(Math.sin(e.fase * 7)) * -5;   // andar: um saltinho
        const sq = e.D.tipo === 'cai' ? 1 : 1 + Math.sin(e.fase * 14) * 0.03;
        c.save(); c.translate(xx, e.y + bob); if (e.dir > 0 && e.D.tipo !== 'rola') c.scale(-1, 1); c.scale(1, sq);
        if (pronta(i)) { const ar = i.naturalWidth / i.naturalHeight, ww = D.h * ar; c.drawImage(i, -ww / 2, -D.h * 1.03, ww, D.h * 1.05); }
        c.restore();
        if (e.D.tipo === 'rola') { c.fillStyle = 'rgba(80,60,40,.35)'; c.fillRect(xx - 60, CHAO - 4, 120, 4); }
      });
    }
    function desenharJaime() {
      const [fr, fps] = ANIM[J.anim] || ANIM.parado;
      const k = fr[Math.floor(J.at * fps) % fr.length];
      if (J.inv > 0 && J.apanhado <= 0 && Math.floor(S.t * 12) % 2) return;   // a piscar depois de ser apanhado
      if (!pronta(folha)) { c.fillStyle = '#1d4fd6'; c.fillRect(J.x - S.cam - 16, J.y - 84, 32, 84); return; }
      const sx = (k % 5) * 128, sy = Math.floor(k / 5) * 128;
      c.save(); c.translate(Math.round(J.x - S.cam), Math.round(J.y)); if (J.dir < 0) c.scale(-1, 1);
      c.drawImage(folha, sx, sy, 128, 128, -64, -112, 128, 128); c.restore();
    }
    function hud() {
      c.fillStyle = 'rgba(255,255,255,.85)'; c.fillRect(10, 10, 300, 34); c.fillRect(W - 250, 10, 240, 34);
      c.fillStyle = '#17213b'; c.font = '700 17px Asap, sans-serif'; c.textBaseline = 'middle';
      c.fillText(`Nível ${S.nivel + 1}: ${L.nome}`, 20, 27);
      c.fillText(`🪙 ${S.moedas}   ★ ${S.pontos}   ${'♥'.repeat(Math.max(0, S.vidas))}${'♡'.repeat(Math.max(0, 3 - S.vidas))}`, W - 240, 27);
      if (S.avisoT > 0) { c.font = '700 19px Asap, sans-serif'; const w = c.measureText(S.aviso).width + 30; c.fillStyle = 'rgba(23,33,59,.85)'; c.fillRect((W - w) / 2, 60, w, 36); c.fillStyle = '#fff'; c.fillText(S.aviso, (W - w) / 2 + 15, 78); }
      if (pausa && S.fase === 'jogar') ecra('Pausa', 'Carrega em P (ou clica) para continuar.');
    }
    function ecra(t1, t2, t3) {
      c.fillStyle = 'rgba(23,33,59,.78)'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '700 38px Asap, sans-serif'; c.fillText(t1, W / 2, H / 2 - 50); c.font = '400 20px Asap, sans-serif'; c.fillText(t2, W / 2, H / 2 + 4);
      if (t3) c.fillText(t3, W / 2, H / 2 + 40); c.textAlign = 'start';
    }
    function desenhar() {
      if (S.fase === 'inicio') {
        L = L || NIVEIS[0]; S.cam = 0; fundo();
        ecra('O Jaime em Messejana', 'Um jogo criado pelo Jaime · 4 níveis · apanha as moedas de cobre e foge de quem te quer apanhar!', 'Carrega em Enter, ou clica, para começar' + (recorde ? ` · recorde: ${recorde}` : ''));
        if (pronta(folha)) { const k = 12 + Math.floor(S.t * 6) % 3; c.drawImage(folha, (k % 5) * 128, 256, 128, 128, W / 2 - 64, H - 150, 128, 128); }
        S.t += 1 / 60;
        return;
      }
      fundo(); chao(); plataformas(); bandeira(L.bandeira, S.check >= L.bandeira ? '#0e9f6e' : '#f0b400'); bandeira(L.fim, '#d6336c');
      desenharMoedas(); desenharInimigos(); desenharJaime(); hud();
      if (S.fase === 'fim') ecra(S.nivel + 1 < NIVEIS.length ? `Nível ${S.nivel + 1} feito!` : 'Chegaste ao castelo! 🏰', `${S.moedasNivel} moedas neste nível · ${S.pontos} pontos`, S.nivel + 1 < NIVEIS.length ? `A seguir: ${NIVEIS[S.nivel + 1].nome} · Enter para continuar` : `Recorde: ${recorde} · Enter para jogar outra vez`);
      if (S.fase === 'perdeu') ecra('Apanharam-te!', `Fizeste ${S.pontos} pontos.`, 'Enter para tentar outra vez este nível');
    }
    let ult = performance.now(), raf = 0, vivo = true;
    function ciclo(t) {
      if (!vivo) return;
      const dt = Math.min(0.033, (t - ult) / 1000); ult = t;
      if (!pausa) passo(dt);
      desenhar(); raf = requestAnimationFrame(ciclo);
    }
    raf = requestAnimationFrame(ciclo);
    setTimeout(() => cv.focus(), 50);
    return {
      fechar: () => { vivo = false; cancelAnimationFrame(raf); window.removeEventListener('blur', blur); },
      estado: () => ({ fase: S.fase, nivel: S.nivel, vidas: S.vidas, moedas: S.moedas, pontos: S.pontos, x: J && J.x, y: J && J.y, chao: J && J.chao, check: S.check, pausa }),
      saltarParaNivel: n => { S.fase = 'jogar'; S.vidas = 3; carregarNivel(n); },
      inimigos: () => inimigos.map(e => ({ tipo: e.tipo, x: e.x, y: e.y, ativo: e.ativo, w: e.D.w, h: e.D.h })),
      teleportar: x => { J.x = x; J.y = CHAO; J.vy = 0; },
      passo: (dt, n) => { for (let i = 0; i < (n || 1); i++) passo(dt); },
      tecla: (k, v) => { tecla[k] = v; if (k === 'salto' && v) pedirSalto(); },
      iniciar: () => avancarEcra(),
    };
  }
  F.PC.jogoJaime = { montar, NIVEIS, ADVERSARIOS };
})();
