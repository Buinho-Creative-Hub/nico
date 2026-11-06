/* Nico · Arcada — «O Jaime em Messejana»: jogo de plataformas a partir do jogo retro do Jaime (Nov 2026).
 *
 * A ideia, as ruas de Messejana e as velhinhas são do Jaime (o original foi feito por ele no Clickteam Fusion).
 * Esta versão HTML5 foi feita a pedido do Carlos, com mais níveis e adversários.
 *   Arte, toda do Ambrósio: o Jaime em pixel art (PR #81; azul e laranja, células 128×128, pés em [64,112]); os
 *   adversários em folhas animadas, os cenários 2560×360 (chão em y=328), os blocos de chão 64×32 e os objetos (PR #82,
 *   em img/percurso/jogo-jaime/). As vagonetas da mina são do pacote «Mapa de Cobre».
 *   O motor só desenha geometria simples (sombras e fundo do HUD).
 * Níveis: 1 a rua · 2 a praça em dia de feira · 3 as vagonetas da mina · 4 o caminho do castelo · 5 as ruínas (o guarda).
 * Comandos: ← → (ou A D) andar · ↑, W ou espaço saltar · P ou Esc pausa · C trocar de roupa (depois de acabar o jogo).
 * Botões no ecrã para tátil. Não dá moedas do percurso (é um jogo extra); o recorde fica neste computador.
 *
 *   F.PC.jogoJaime.montar(el, opcoes, api) → { fechar, estado, inimigos, saltarParaNivel, teleportar, passo, tecla, … }
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {}; F.PC = F.PC || {};
  const W = 960, H = 480, CHAO = 420, G = 2200, VEL = 300, SALTO = 840, BG_CHAO = 328;
  const CAIXA = [-16, -84, 32, 84];   // colisão do Jaime, relativa aos pés (manifesto do Ambrósio)
  const ANIM = { parado: [[0, 1], 2], correr: [[2, 3, 4, 5, 6, 7], 10], subir: [[8], 1], cair: [[9], 1], apanhado: [[10, 11], 5], festa: [[12, 13, 14], 6] };
  const D = 'img/percurso/jogo-jaime/';

  // ------------------------------------------------------------ folhas de sprites (JOGO-JAIME-ARTE.json v2)
  // fw×fh: célula · a: ponto de apoio · box: colisão na célula · an: animações [fotogramas, fps] · s: escala no ecrã
  const FOLHAS = {
    velhinha: { f: 'velhinha-sheet.png', fw: 48, fh: 64, a: [24, 60], box: [10, 16, 28, 44], s: 1.75, an: { andar: [[0, 1, 2, 3], 6], atacar: [[4, 5, 6], 6] } },
    cao: { f: 'cao-sheet.png', fw: 64, fh: 48, a: [32, 44], box: [8, 14, 48, 30], s: 1.6, an: { andar: [[0, 1, 2, 3], 10], ladrar: [[4, 5], 5] } },
    pombo: { f: 'pombo-sheet.png', fw: 64, fh: 48, a: [32, 24], box: [12, 14, 40, 22], s: 1.4, an: { voar: [[0, 1, 2, 3], 9], picar: [[4, 5], 8] } },
    gato: { f: 'gato-sheet.png', fw: 64, fh: 64, a: [32, 60], box: [12, 24, 40, 36], s: 1.4, an: { andar: [[0, 1, 2, 3], 8], atirar: [[4, 5, 6], 7] } },
    vaso: { f: 'vaso-sheet.png', fw: 48, fh: 48, a: [24, 44], box: [4, 4, 40, 40], s: 1.1, an: { inteiro: [[0], 1], cair: [[1], 1], partido: [[2], 1] } },
    carrinha: { f: 'carrinha-pao-sheet.png', fw: 96, fh: 48, a: [48, 44], box: [16, 8, 64, 36], s: 2, an: { andar: [[0, 1], 10] } },
    guarda: { f: 'guarda-castelo-sheet.png', fw: 48, fh: 64, a: [24, 60], box: [9, 12, 30, 48], s: 1.9, an: { andar: [[0, 1, 2, 3], 7], atacar: [[4, 5, 6], 6], tonto: [[7, 8], 5] } },
    moeda: { f: 'moeda-cobre-sheet.png', fw: 32, fh: 32, a: [16, 16], box: [5, 3, 22, 26], s: 1, an: { rodar: [[0, 1, 2, 3], 8] } },
  };
  // ------------------------------------------------------------ adversários: comportamento + folha
  //   persegue: vem atrás do Jaime · cao: patrulha a correr e pára a ladrar · pombo: voa para o Jaime e pica
  //   gato: fica no telhado/toldo e atira vasos (com sombra de aviso) · rola: atravessa o ecrã (carrinha, vagonetas)
  //   chefe: o guarda do castelo (salta-lhe em cima 3 vezes; deixa cair a chave)
  const ADVERSARIOS = {
    velhinha: { folha: 'velhinha', tipo: 'persegue', vel: 85, nome: 'por uma velhinha (queria dar-te beijinhos!)' },
    cao: { folha: 'cao', tipo: 'cao', vel: 210, nome: 'pelo cão' },
    pombo: { folha: 'pombo', tipo: 'pombo', vel: 150, nome: 'por um pombo' },
    gato: { folha: 'gato', tipo: 'gato', vel: 0, nome: 'pelo gato', inofensivo: true },
    carrinha: { folha: 'carrinha', tipo: 'rola', vel: 380, nome: 'pela carrinha do pão' },
    vagoneta: { img: 'img/percurso/vagoneta-pedra.webp', w: 110, h: 84, tipo: 'rola', vel: 320, nome: 'por uma vagoneta desgovernada' },
    vagonetaM: { img: 'img/percurso/vagoneta-minerio.webp', w: 110, h: 84, tipo: 'rola', vel: 260, nome: 'por uma vagoneta desgovernada' },
    guarda: { folha: 'guarda', tipo: 'chefe', vel: 120, nome: 'pelo guarda do castelo', vida: 3 },
  };
  const VASO = { folha: 'vaso', nome: 'um vaso do gato' };

  // ------------------------------------------------------------ níveis
  // chao: troços com chão (fora deles há buraco) · plat: [x, y, w, estilo] (madeira | caixa | toldo | muro), só seguram por cima
  // moedas: [x, y] · coracoes: [x, y] (vida extra) · inimigos: [tipo, x, a?, b?, y?] · bandeira: checkpoint · fim: meta
  const NIVEIS = [
    { nome: 'A rua de Messejana', fundo: 'rua-fundo.webp', topo: 'tile-calcada-topo.png', enche: 'tile-calcada-enchimento.png', fim: 4600, bandeira: 2300,
      chao: [[-200, 4900]],
      plat: [[700, 348, 96, 'caixa'], [1550, 300, 192, 'madeira'], [1850, 230, 192, 'madeira'], [3000, 348, 96, 'caixa'], [3500, 300, 192, 'madeira']],
      moedas: [[500, 360], [560, 360], [620, 360], [760, 300], [1600, 250], [1660, 250], [1900, 180], [1960, 180], [2600, 360], [2660, 360], [3050, 300], [3550, 250], [3610, 250], [4100, 360], [4160, 360]],
      coracoes: [[1950, 140]],
      inimigos: [['velhinha', 1100], ['cao', 1500, 1300, 1800], ['velhinha', 2600], ['carrinha', 3100], ['velhinha', 3400], ['cao', 4000, 3800, 4300]] },
    { nome: 'A praça em dia de feira', fundo: 'praca-feira-fundo.webp', topo: 'tile-calcada-topo.png', enche: 'tile-calcada-enchimento.png', fim: 5200, bandeira: 2600,
      chao: [[-200, 5500]],
      plat: [[600, 320, 160, 'toldo'], [1000, 270, 192, 'madeira'], [1700, 320, 160, 'toldo'], [2100, 250, 192, 'madeira'], [3000, 320, 160, 'toldo'], [3350, 260, 192, 'madeira'], [3900, 320, 160, 'toldo'], [4300, 240, 192, 'madeira']],
      moedas: [[650, 270], [710, 270], [1050, 220], [1110, 220], [1750, 270], [1810, 270], [2140, 200], [2800, 360], [3050, 270], [3400, 210], [3460, 210], [3950, 270], [4340, 190], [4700, 360], [4760, 360]],
      coracoes: [[3420, 170]],
      inimigos: [['velhinha', 900], ['gato', 1780, 0, 0, 320], ['pombo', 2000], ['cao', 2400, 2200, 2700], ['gato', 3080, 0, 0, 320], ['velhinha', 3600], ['pombo', 4100], ['gato', 3980, 0, 0, 320], ['cao', 4700, 4450, 5000]] },
    { nome: 'As vagonetas da mina', fundo: 'mina-fundo.webp', topo: 'tile-terra-topo.png', enche: 'tile-terra-topo.png', fim: 5600, bandeira: 2900,
      chao: [[-200, 1300], [1460, 2600], [2760, 3900], [4080, 5900]],
      plat: [[1300, 330, 160, 'madeira'], [2600, 300, 160, 'madeira'], [3150, 300, 192, 'madeira'], [3900, 330, 180, 'madeira'], [4500, 280, 192, 'madeira']],
      moedas: [[1330, 280], [1390, 280], [1700, 360], [1760, 360], [2630, 250], [2690, 250], [3200, 250], [3260, 250], [3930, 280], [3990, 280], [4550, 230], [4610, 230], [5100, 360], [5160, 360]],
      coracoes: [[3230, 200]],
      inimigos: [['vagoneta', 900], ['vagonetaM', 2000], ['pombo', 2300], ['vagoneta', 3400], ['cao', 4400, 4150, 4700], ['vagonetaM', 4900], ['pombo', 5200]] },
    { nome: 'O caminho do castelo', fundo: 'caminho-castelo-fundo.webp', topo: 'tile-terra-topo.png', enche: 'tile-terra-topo.png', fim: 6000, bandeira: 3000,
      chao: [[-200, 1000], [1180, 2000], [2200, 2900], [3100, 3800], [4050, 6300]],
      plat: [[1000, 330, 192, 'muro'], [1600, 280, 128, 'muro'], [2000, 320, 192, 'muro'], [2900, 320, 192, 'muro'], [3300, 250, 128, 'muro'], [3800, 320, 256, 'muro'], [4400, 280, 128, 'muro'], [4700, 220, 128, 'muro'], [5200, 300, 192, 'muro']],
      moedas: [[1040, 280], [1100, 280], [1640, 230], [2050, 270], [2110, 270], [2950, 270], [3340, 200], [3850, 270], [3910, 270], [4440, 230], [4740, 170], [5250, 250], [5310, 250], [5700, 360]],
      coracoes: [[4760, 140]],
      inimigos: [['velhinha', 700], ['cao', 1500, 1250, 1900], ['gato', 3350, 0, 0, 250], ['pombo', 2500], ['velhinha', 3500], ['carrinha', 4300], ['velhinha', 5000], ['pombo', 5300], ['velhinha', 5500]] },
    { nome: 'As ruínas do castelo', fundo: 'ruinas-castelo-fundo.webp', topo: 'tile-ruinas.png', enche: 'tile-muro.png', fim: 3200, bandeira: 1500, chave: true,
      chao: [[-200, 900], [1060, 3500]],
      plat: [[900, 330, 160, 'muro'], [1300, 280, 128, 'muro'], [2050, 300, 128, 'muro'], [2650, 300, 128, 'muro']],
      moedas: [[930, 280], [990, 280], [1330, 230], [1390, 230], [2080, 250], [2680, 250]],
      coracoes: [[1360, 190]],
      inimigos: [['velhinha', 600], ['pombo', 1100], ['guarda', 2350, 1900, 2850]] },
  ];

  const cache = {};
  function img(src) { if (!cache[src]) { const i = new Image(); i.src = src; cache[src] = i; } return cache[src]; }
  const pronta = i => i && i.complete && i.naturalWidth > 0;
  const quadro = (an, t) => an[0][Math.floor(t * an[1]) % an[0].length];

  function montar(el, opcoes, api) {
    opcoes = opcoes || {};
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

    const guardado = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const guardar = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* sem armazenamento */ } };
    let recorde = Number(guardado('nico.jogoJaime.recorde')) || 0;
    let laranjaAberta = guardado('nico.jogoJaime.laranja') === '1', roupa = laranjaAberta && guardado('nico.jogoJaime.roupa') === 'laranja' ? 'laranja' : 'azul';
    const folhaJaime = () => img(roupa === 'laranja' ? D + 'jaime-orange-sheet.png' : 'img/percurso/jaime-sheet.png');

    const tecla = {}; let pedido = 0, pausa = false;
    function pedirSalto() { pedido = 0.12; }
    const kd = e => {
      const k = e.key;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') tecla.esq = true;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') tecla.dir = true;
      else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') { if (!tecla.salto) pedirSalto(); tecla.salto = true; }
      else if (k === 'p' || k === 'P' || k === 'Escape') { pausa = !pausa; }
      else if ((k === 'c' || k === 'C') && laranjaAberta) { roupa = roupa === 'azul' ? 'laranja' : 'azul'; guardar('nico.jogoJaime.roupa', roupa); }
      else if (k === 'Enter' && S.fase !== 'jogar' && S.fase !== 'festa') avancarEcra();
      else return;
      e.preventDefault();
    };
    const ku = e => { const k = e.key; if (k === 'ArrowLeft' || k === 'a' || k === 'A') tecla.esq = false; else if (k === 'ArrowRight' || k === 'd' || k === 'D') tecla.dir = false; else if (k === ' ' || k === 'ArrowUp' || k === 'w' || k === 'W') tecla.salto = false; };
    cv.addEventListener('keydown', kd); cv.addEventListener('keyup', ku);
    cv.addEventListener('pointerdown', () => { cv.focus(); if (S.fase !== 'jogar' && S.fase !== 'festa') avancarEcra(); });
    const blur = () => { pausa = true; Object.keys(tecla).forEach(k => { tecla[k] = false; }); };
    window.addEventListener('blur', blur);

    const S = { nivel: 0, fase: 'inicio', vidas: 3, moedas: 0, pontos: 0, t: 0, cam: 0, aviso: '', avisoT: 0 };
    let J, L, inimigos, moedas, coracoes, vasos, chave;

    function carregarNivel(n) {
      S.nivel = n; L = NIVEIS[n];
      moedas = L.moedas.map(([x, y]) => ({ x, y, ok: false }));
      coracoes = (L.coracoes || []).map(([x, y]) => ({ x, y, ok: false }));
      vasos = []; chave = L.chave ? { x: 0, y: 0, visivel: false, ok: false } : null;
      inimigos = L.inimigos.map(([tipo, x, a, b, y]) => { const A = ADVERSARIOS[tipo];
        return { tipo, A, x, y: y || (A.tipo === 'pombo' ? 110 : CHAO), yBase: y || CHAO, x0: x, a: a || x - 200, b: b || x + 200, dir: -1, vy: 0, vx: 0,
          ativo: A.tipo !== 'rola' && A.tipo !== 'pombo', saltado: false, t: Math.random() * 3, est: 'andar', estT: 0, vida: A.vida || 1, invT: 0, fora: false }; });
      S.check = 80; S.moedasNivel = 0;
      img(D + L.fundo); img(D + L.topo); img(D + L.enche);
      renascer();
    }
    function renascer() { J = { x: S.check, y: CHAO, vx: 0, vy: 0, chao: true, dir: 1, anim: 'parado', at: 0, inv: 1.2, apanhado: 0, coyote: 0 }; S.cam = Math.max(0, J.x - 300); vasos = []; }
    function novoJogo() { S.vidas = 3; S.moedas = 0; S.pontos = 0; }
    function avancarEcra() {
      if (S.fase === 'inicio') { S.fase = 'jogar'; novoJogo(); carregarNivel(0); }
      else if (S.fase === 'fim') { if (S.nivel + 1 < NIVEIS.length) { S.fase = 'jogar'; carregarNivel(S.nivel + 1); } else { S.fase = 'inicio'; } }
      else if (S.fase === 'perdeu') { S.fase = 'jogar'; novoJogo(); carregarNivel(S.nivel); }
      cv.focus();
    }
    const avisar = t => { S.aviso = t; S.avisoT = 2.2; };
    const temChao = x => L.chao.some(([a, b]) => x >= a && x <= b);
    const somar = (n, t) => { S.pontos += n; if (t) avisar(t); };
    const som = n => { if (F.Som) F.Som.tocar(n); };

    // caixa de colisão de um adversário em coordenadas do mundo
    function caixaDe(e) {
      if (e.A.folha) { const Fh = FOLHAS[e.A.folha], s = Fh.s; return [e.x + (Fh.box[0] - Fh.a[0]) * s, e.y + (Fh.box[1] - Fh.a[1]) * s, Fh.box[2] * s, Fh.box[3] * s]; }
      return [e.x - e.A.w * 0.27, e.y - e.A.h * 0.85, e.A.w * 0.54, e.A.h * 0.85];
    }
    const toca = (a, b) => a[0] < b[0] + b[2] && a[0] + a[2] > b[0] && a[1] < b[1] + b[3] && a[1] + a[3] > b[1];

    // ------------------------------------------------------------ física e regras
    function passo(dt) {
      S.t += dt; if (S.avisoT > 0) S.avisoT -= dt;
      if (S.fase === 'festa') { J.at += dt; S.festaT -= dt; if (S.festaT <= 0) terminarNivel(); return; }
      if (S.fase !== 'jogar') return;
      if (pedido > 0) pedido -= dt;
      if (J.apanhado > 0) { J.apanhado -= dt; J.at += dt; if (J.apanhado <= 0) { if (S.vidas <= 0) { S.fase = 'perdeu'; guardarRecorde(); } else renascer(); } return; }
      const mv = (tecla.dir ? 1 : 0) - (tecla.esq ? 1 : 0);
      J.vx = mv * VEL; if (mv) J.dir = mv;
      J.coyote = J.chao ? 0.1 : Math.max(0, J.coyote - dt);
      if (pedido > 0 && (J.chao || J.coyote > 0)) { J.vy = -SALTO; J.chao = false; J.coyote = 0; pedido = 0; som('clique'); }
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
      if (J.x >= L.bandeira && S.check < L.bandeira) { S.check = L.bandeira; avisar('Bandeira! Se te apanharem, voltas aqui.'); som('nivel'); }
      const jc = [J.x + CAIXA[0], J.y + CAIXA[1], CAIXA[2], CAIXA[3]];
      moedas.forEach(m => { if (!m.ok && toca(jc, [m.x - 14, m.y - 14, 28, 28])) { m.ok = true; S.moedas++; S.moedasNivel++; somar(10); som('encaixe'); } });
      coracoes.forEach(m => { if (!m.ok && toca(jc, [m.x - 14, m.y - 14, 28, 28])) { m.ok = true; S.vidas = Math.min(5, S.vidas + 1); somar(20, 'Mais uma vida! ♥'); som('nivel'); } });
      if (chave && chave.visivel && !chave.ok && toca(jc, [chave.x - 14, chave.y - 40, 28, 40])) { chave.ok = true; somar(100, 'Tens a chave do castelo! Corre para a bandeira.'); som('sucesso'); }
      for (const e of inimigos) { if (mexer(e, dt, jc)) return; }
      for (const v of vasos) {
        v.t += dt;
        if (!v.partido) { v.vy += G * 0.55 * dt; v.x += v.vx * dt; v.y += v.vy * dt; if (v.y >= CHAO) { v.y = CHAO; v.partido = 0.7; som('apagar'); } }
        else v.partido -= dt;
        if (!v.partido || v.partido > 0.65) if (J.inv <= 0 && toca(jc, [v.x - 18, v.y - 40, 36, 38])) return perderVida('Apanhado por um vaso do gato!');
      }
      vasos = vasos.filter(v => !v.partido || v.partido > 0);
      if (J.x >= L.fim) {
        if (chave && !chave.ok) { J.x = L.fim - 2; if (S.avisoT <= 0) avisar(chave.visivel ? 'Falta apanhar a chave!' : 'O portão está fechado: o guarda tem a chave.'); }
        else { S.fase = 'festa'; S.festaT = 2.4; J.anim = 'festa'; J.at = 0; somar(100 + S.vidas * 20); som('sucesso'); }
      }
      S.cam += (Math.max(0, Math.min(L.fim + 300 - W, J.x - 320)) - S.cam) * Math.min(1, dt * 8);
    }
    // um adversário: anda, ataca e (se for o caso) apanha o Jaime. Devolve true se o Jaime foi apanhado.
    function mexer(e, dt, jc) {
      const A = e.A; e.t += dt; e.estT -= dt;
      const dx = J.x - e.x;
      if (A.tipo === 'persegue') {
        if (Math.abs(dx) < 520) { e.dir = Math.sign(dx) || e.dir; if (Math.abs(dx) > 30) e.x += e.dir * A.vel * dt; }
        e.est = Math.abs(dx) < 80 ? 'atacar' : 'andar';
      } else if (A.tipo === 'cao') {
        if (e.est === 'ladrar') { if (e.estT <= 0) { e.est = 'andar'; e.estT = 1.6 + Math.random(); } }
        else { e.x += e.dir * A.vel * dt; if (e.x < e.a) e.dir = 1; if (e.x > e.b) e.dir = -1; if (e.estT <= 0 && Math.abs(dx) < 500) { e.est = 'ladrar'; e.estT = 0.7; e.dir = Math.sign(dx) || e.dir; } }
      } else if (A.tipo === 'pombo') {
        if (!e.ativo && !e.fora && J.x > e.x0 - 650) { e.ativo = true; e.x = Math.max(e.x0, S.cam + W + 60); e.y = 110; e.dir = -1; e.est = 'voar'; }
        if (!e.ativo) return false;
        // o pombo escolhe o sítio onde o Jaime está, fica lá por cima meio segundo (aviso) e pica a direito: quem se mexe escapa
        if (e.est === 'voar') { e.x -= A.vel * dt; e.y = 110 + Math.sin(e.t * 3) * 10; if (!e.picou && Math.abs(dx) < 170) { e.est = 'mirar'; e.tx = J.x; e.estT = 0.55; e.picou = true; } }
        else if (e.est === 'mirar') { e.x += (e.tx - e.x) * Math.min(1, dt * 6); if (e.estT <= 0) { e.est = 'picar'; e.vy = 520; } }
        else if (e.est === 'picar') { e.y += e.vy * dt; if (e.y > CHAO - 26) { e.y = CHAO - 26; e.vy = -300; } if (e.vy < 0 && e.y < 110) { e.est = 'voar'; e.vy = 0; } }
        if (e.x < S.cam - 120) { e.ativo = false; e.fora = true; }
      } else if (A.tipo === 'gato') {
        e.est = e.estT > 0 ? 'atirar' : 'andar'; e.dir = Math.sign(dx) || e.dir;
        if (e.estT <= -1.6 && dx < 0 && dx > -420) { e.estT = 0.45; vasos.push({ x: e.x, y: e.y - 50, vx: Math.max(-260, dx / 1.1), vy: -180, t: 0, partido: 0 }); }
        return false;   // o gato não apanha ninguém: só atira vasos
      } else if (A.tipo === 'rola') {
        if (!e.ativo && !e.fora && J.x > e.x0 - 500) { e.ativo = true; e.x = S.cam + W + 100; e.dir = -1; e.saltado = false; }
        if (!e.ativo) return false;
        e.x -= A.vel * dt; e.est = 'andar';
        if (e.x < S.cam - 260) { e.ativo = false; e.fora = true; }
      } else if (A.tipo === 'chefe') {
        if (e.vida <= 0) { e.est = 'tonto'; return false; }
        if (e.invT > 0) { e.invT -= dt; e.est = 'tonto'; return false; }
        const perto = Math.abs(dx) < 520;
        if (perto) { if (e.est !== 'atacar' && Math.abs(dx) < 220 && e.estT <= -1.2) { e.est = 'atacar'; e.estT = 0.9; e.dir = Math.sign(dx) || e.dir; } }
        const v = e.est === 'atacar' && e.estT > 0 ? A.vel * 2.4 : A.vel;
        if (e.est === 'atacar' && e.estT <= 0) e.est = 'andar';
        if (e.est !== 'atacar' && perto) e.dir = Math.sign(dx) || e.dir;
        e.x += e.dir * v * dt; if (e.x < e.a) { e.x = e.a; e.dir = 1; } if (e.x > e.b) { e.x = e.b; e.dir = -1; }
        // salto em cima da cabeça: o guarda fica tonto
        const g = caixaDe(e);
        if (J.vy > 0 && J.x > g[0] - 6 && J.x < g[0] + g[2] + 6 && J.y >= g[1] && J.y <= g[1] + 30) {
          e.vida--; e.invT = 1.4; J.vy = -620; J.y = g[1] - 1; som('nivel');
          if (e.vida <= 0) { chave.visivel = true; chave.x = e.x; chave.y = CHAO; somar(200, 'O guarda ficou tonto de vez! Apanha a chave.'); }
          else somar(50, `Em cheio! Mais ${e.vida}.`);
          return false;
        }
      }
      if (A.inofensivo || (!e.ativo && (A.tipo === 'rola' || A.tipo === 'pombo'))) return false;
      const ec = caixaDe(e);
      if (J.inv <= 0 && toca(jc, [ec[0] + 4, ec[1] + 6, ec[2] - 8, ec[3] - 6])) { perderVida(`Apanhado ${A.nome}!`); return true; }
      if (!e.saltado && A.tipo !== 'chefe' && Math.abs(dx) < 14 && J.y < ec[1]) { e.saltado = true; somar(25, '+25 por saltar por cima!'); }
      return false;
    }
    function perderVida(t) {
      if (J.apanhado > 0) return; S.vidas--; J.apanhado = 1.1; J.anim = 'apanhado'; J.at = 0; avisar(t); som('apagar');
      inimigos.forEach(e => { if (Math.abs(e.x - J.x) < 260 && e.A.tipo === 'persegue') e.x += (e.x < J.x ? -260 : 260); });
    }
    function terminarNivel() {
      S.fase = 'fim'; guardarRecorde();
      if (S.nivel === NIVEIS.length - 1) {
        if (!laranjaAberta) { laranjaAberta = true; guardar('nico.jogoJaime.laranja', '1'); S.desbloqueou = true; }
        if (api && api.concluir) api.concluir({ ok: true, valor: S.pontos });
      }
    }
    function guardarRecorde() { if (S.pontos > recorde) { recorde = S.pontos; guardar('nico.jogoJaime.recorde', String(recorde)); } }

    // ------------------------------------------------------------ desenho
    function sprite(nome, an, t, x, y, flip, alfa) {
      const Fh = FOLHAS[nome], i = img(D + Fh.f); if (!pronta(i)) return;
      const k = typeof an === 'number' ? an : quadro(Fh.an[an], t), s = Fh.s;
      c.save(); if (alfa != null) c.globalAlpha = alfa; c.translate(Math.round(x), Math.round(y)); if (flip) c.scale(-1, 1);
      c.drawImage(i, k * Fh.fw, 0, Fh.fw, Fh.fh, -Fh.a[0] * s, -Fh.a[1] * s, Fh.fw * s, Fh.fh * s); c.restore();
    }
    function fundo() {
      const f = img(D + L.fundo); c.fillStyle = '#4aa3f0'; c.fillRect(0, 0, W, H);
      if (!pronta(f)) return;
      // o cenário (2560×360, chão em y=328) desliza mais devagar do que o jogo; o chão da pintura fica no chão do jogo
      const s = CHAO / BG_CHAO, fw = f.naturalWidth * s, fh = f.naturalHeight * s;
      const k = Math.max(0, Math.min(1, S.cam / Math.max(1, L.fim + 300 - W)));
      c.drawImage(f, -(fw - W) * k, CHAO - BG_CHAO * s, fw, fh);
    }
    function chao() {
      const topo = img(D + L.topo), enche = img(D + L.enche);
      L.chao.forEach(([a, b]) => {
        const x0 = Math.max(a, S.cam - 64), x1 = Math.min(b, S.cam + W + 64); if (x1 <= x0) return;
        for (let x = Math.floor(a / 64) * 64; x < b; x += 64) {
          if (x + 64 < S.cam || x > S.cam + W) continue;
          const xx = Math.round(x - S.cam), w = Math.min(64, b - x), cx = Math.max(0, a - x);
          if (pronta(topo)) c.drawImage(topo, cx, 0, w - cx, 32, xx + cx, CHAO, w - cx, 32);
          if (pronta(enche)) c.drawImage(enche, cx, 0, w - cx, 32, xx + cx, CHAO + 32, w - cx, 32);
        }
      });
    }
    function plataformas() {
      L.plat.forEach(([x, y, w, est]) => {
        const xx = Math.round(x - S.cam); if (xx > W || xx + w < 0) return;
        if (est === 'caixa') { const i = img(D + 'caixa-feira.png'); for (let k = 0; k < w; k += 48) for (let yy = y; yy < CHAO; yy += 46) if (pronta(i)) c.drawImage(i, xx + k, yy - 2, 48, 48); }
        else if (est === 'toldo') { const i = img(D + 'toldo-feira.png'); if (pronta(i)) c.drawImage(i, xx - 6, y - 8, w + 12, (CHAO - y) + 8); }
        else if (est === 'muro') { const i = img(D + 'tile-muro.png'); for (let k = 0; k < w; k += 64) if (pronta(i)) c.drawImage(i, 0, 0, Math.min(64, w - k), 32, xx + k, y, Math.min(64, w - k), 32); }
        else { const i = img(D + 'plataforma-madeira.png'); for (let k = 0; k < w; k += 96) if (pronta(i)) c.drawImage(i, 0, 0, Math.min(96, w - k + 13), 32, xx + k - 13, y - 4, Math.min(96, w - k + 13), 32); }
      });
    }
    function bandeira(x, ativa) {
      const xx = x - S.cam; if (xx < -60 || xx > W + 60) return;
      const i = img(D + 'bandeira-fim.png'); if (!pronta(i)) return;
      c.save(); if (!ativa) c.globalAlpha = 0.75; c.drawImage(i, xx - 24, CHAO - 138, 48, 144); c.restore();
    }
    function objetos() {
      moedas.forEach(m => { if (!m.ok) sprite('moeda', 'rodar', S.t + m.x / 97, m.x - S.cam, m.y); });
      const co = img(D + 'coracao.png');
      coracoes.forEach(m => { if (!m.ok && pronta(co)) c.drawImage(co, m.x - S.cam - 16, m.y - 16 + Math.sin(S.t * 3) * 4, 32, 32); });
      if (chave && chave.visivel && !chave.ok) { const k = img(D + 'chave-castelo.png'); if (pronta(k)) c.drawImage(k, chave.x - S.cam - 16, chave.y - 56 + Math.sin(S.t * 4) * 5, 32, 48); }
    }
    function desenharInimigos() {
      inimigos.forEach(e => {
        const A = e.A; if ((A.tipo === 'rola' || A.tipo === 'pombo') && !e.ativo) return;
        const xx = e.x - S.cam; if (xx < -220 || xx > W + 220) return;
        if (A.tipo === 'rola') { c.fillStyle = 'rgba(40,30,20,.3)'; c.beginPath(); c.ellipse(xx, CHAO + 2, 56, 7, 0, 0, 7); c.fill(); }
        if (A.folha) {
          if (A.tipo === 'pombo' && e.est === 'mirar') { c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(e.tx - S.cam, CHAO + 2, 22, 7, 0, 0, 7); c.fill(); }
          const Fh = FOLHAS[A.folha], an = Fh.an[e.est] ? e.est : e.est === 'mirar' ? 'picar' : Object.keys(Fh.an)[0];
          const alfa = A.tipo === 'chefe' && e.invT > 0 && Math.floor(S.t * 10) % 2 ? 0.5 : null;
          sprite(A.folha, an, e.t, xx, e.y, e.dir < 0, alfa);
        } else {
          const i = img(A.img); if (!pronta(i)) return;
          const ar = i.naturalWidth / i.naturalHeight, ww = A.h * ar;
          c.drawImage(i, xx - ww / 2, e.y - A.h * 1.03 + Math.sin(e.t * 30) * 1.5, ww, A.h * 1.05);
        }
        if (A.tipo === 'chefe' && e.vida > 0) { c.fillStyle = '#17213b'; c.font = '700 16px Asap, sans-serif'; c.textAlign = 'center'; c.fillText('♥'.repeat(e.vida), xx, e.y - 130); c.textAlign = 'start'; }
      });
      vasos.forEach(v => {
        const xx = v.x - S.cam;
        if (!v.partido) { const r = 8 + 16 * Math.max(0, Math.min(1, v.y / CHAO)); c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(xx + v.vx * 0.25, CHAO + 2, r, r * 0.35, 0, 0, 7); c.fill(); }
        sprite('vaso', v.partido ? 'partido' : 'cair', 0, xx, v.y, false);
      });
    }
    function desenharJaime() {
      const [fr, fps] = ANIM[J.anim] || ANIM.parado;
      const k = fr[Math.floor(J.at * fps) % fr.length];
      if (J.inv > 0 && J.apanhado <= 0 && Math.floor(S.t * 12) % 2) return;   // a piscar depois de ser apanhado
      const folha = folhaJaime();
      if (!pronta(folha)) { c.fillStyle = '#1d4fd6'; c.fillRect(J.x - S.cam - 16, J.y - 84, 32, 84); return; }
      c.save(); c.translate(Math.round(J.x - S.cam), Math.round(J.y)); if (J.dir < 0) c.scale(-1, 1);
      c.drawImage(folha, (k % 5) * 128, Math.floor(k / 5) * 128, 128, 128, -64, -112, 128, 128); c.restore();
    }
    function hud() {
      c.fillStyle = 'rgba(255,255,255,.88)'; c.fillRect(10, 10, 330, 34); c.fillRect(W - 270, 10, 260, 34);
      c.fillStyle = '#17213b'; c.font = '700 17px Asap, sans-serif'; c.textBaseline = 'middle';
      c.fillText(`Nível ${S.nivel + 1}: ${L.nome}`, 20, 27);
      sprite('moeda', 0, 0, W - 252, 27);
      c.fillText(`${S.moedas}   ★ ${S.pontos}`, W - 230, 27);
      const co = img(D + 'coracao.png');
      for (let i = 0; i < S.vidas; i++) if (pronta(co)) c.drawImage(co, W - 100 + i * 18, 18, 18, 18);
      if (chave) { const k = img(D + 'chave-castelo.png'); if (pronta(k)) { c.save(); c.globalAlpha = chave.ok ? 1 : 0.25; c.drawImage(k, 350, 12, 20, 30); c.restore(); } }
      if (S.avisoT > 0) { c.font = '700 19px Asap, sans-serif'; const w = c.measureText(S.aviso).width + 30; c.fillStyle = 'rgba(23,33,59,.85)'; c.fillRect((W - w) / 2, 60, w, 36); c.fillStyle = '#fff'; c.fillText(S.aviso, (W - w) / 2 + 15, 78); }
      if (pausa && S.fase === 'jogar') ecra('Pausa', 'Carrega em P (ou clica) para continuar.');
    }
    function ecra(t1, t2, t3, t4) {
      c.fillStyle = 'rgba(23,33,59,.78)'; c.fillRect(0, 0, W, H); c.fillStyle = '#fff'; c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = '700 38px Asap, sans-serif'; c.fillText(t1, W / 2, H / 2 - 70); c.font = '400 20px Asap, sans-serif'; c.fillText(t2, W / 2, H / 2 - 22);
      if (t3) c.fillText(t3, W / 2, H / 2 + 12); if (t4) c.fillText(t4, W / 2, H / 2 + 44); c.textAlign = 'start';
    }
    function desenhar() {
      if (S.fase === 'inicio') {
        L = L || NIVEIS[0]; S.cam = 0; fundo(); chao();
        ecra('O Jaime em Messejana', 'Um jogo criado pelo Jaime · 5 níveis · apanha as moedas de cobre e foge de quem te quer apanhar!',
          'Carrega em Enter, ou clica, para começar' + (recorde ? ` · recorde: ${recorde}` : ''), laranjaAberta ? `Tecla C: trocar de roupa (agora: ${roupa})` : 'Acaba o jogo para desbloquear a roupa cor de laranja');
        const f = folhaJaime(); if (pronta(f)) { const k = 12 + Math.floor(S.t * 6) % 3; c.drawImage(f, (k % 5) * 128, 256, 128, 128, W / 2 - 64, CHAO - 112, 128, 128); }
        S.t += 1 / 60;
        return;
      }
      fundo(); chao(); plataformas(); bandeira(L.bandeira, S.check >= L.bandeira); bandeira(L.fim, true);
      objetos(); desenharInimigos(); desenharJaime(); hud();
      if (S.fase === 'fim') {
        const ult = S.nivel + 1 >= NIVEIS.length;
        ecra(ult ? 'Chegaste ao castelo! 🏰' : `Nível ${S.nivel + 1} feito!`, `${S.moedasNivel} moedas neste nível · ${S.pontos} pontos`,
          ult ? `Recorde: ${recorde} · Enter para voltar ao início` : `A seguir: ${NIVEIS[S.nivel + 1].nome} · Enter para continuar`,
          ult && S.desbloqueou ? 'Desbloqueaste a roupa cor de laranja! (tecla C no início)' : '');
      }
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
      estado: () => ({ aviso: S.aviso, fase: S.fase, nivel: S.nivel, vidas: S.vidas, moedas: S.moedas, pontos: S.pontos, x: J && J.x, y: J && J.y, vy: J && J.vy, chao: J && J.chao, check: S.check, pausa, roupa, chave: chave && { ...chave } }),
      inimigos: () => inimigos.map(e => ({ tipo: e.tipo, x: e.x, y: e.y, ativo: e.ativo, vida: e.vida, est: e.est, caixa: caixaDe(e) })),
      vasos: () => vasos.map(v => ({ ...v })),
      saltarParaNivel: n => { S.fase = 'jogar'; novoJogo(); carregarNivel(n); },
      teleportar: (x, y, vy) => { J.x = x; J.y = y == null ? CHAO : y; J.vy = vy || 0; J.inv = 0; },
      passo: (dt, n) => { for (let i = 0; i < (n || 1); i++) passo(dt); },
      tecla: (k, v) => { tecla[k] = v; if (k === 'salto' && v) pedirSalto(); },
      iniciar: () => avancarEcra(),
    };
  }
  F.PC.jogoJaime = { montar, NIVEIS, ADVERSARIOS, FOLHAS };
})();
