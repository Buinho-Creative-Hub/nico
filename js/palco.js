/* Nico · Palco — o «ecrã» da Missão 0: um cenário com atores (Nico, Gabi) e objetos, desenhado em SVG.
 *
 * Não corre programas: só mostra. Quem manda é o motor (js/palco-motor.js), que chama:
 *   reset(setup)              volta ao início do desafio: { cenario, atores: { nico: {x}, gabi: {x} }, objetos: { bola: {x} } }
 *   cenario(id) · hora('dia'|'noite')
 *   x(id) · colocar(id, x) · virar(id, paraEsquerda)
 *   imagem(id, traje) · dizer(id, texto) · calar(id)
 * O palco tem 480 × 320; o chão fica em y = 272. Os cenários usam o vocabulário do Buinho Educativo
 * (formas simples: quadrado, triângulo, círculo, semicírculo, arco; creme, azul, laranja).
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  const NS = 'http://www.w3.org/2000/svg';
  const L = 480, A = 320, CHAO = 272;

  // Sítios do cenário (para «ir até»)
  F.SITIO_X = { esquerda: 70, meio: 240, direita: 410, porta: 392 };

  // Os 8 estados das mascotes como imagens dos atores
  const TRAJE_SPRITE = { ola: 'boas_vindas', curioso: 'curiosa', pensar: 'a_pensar', surpresa: 'surpreendida', dica: 'dica',
    festa: 'celebrar', ideia: 'inventar', calma: 'calma' };
  // Atores com desenhos próprios para o palco (corpo inteiro + 2 passos de andar). Gabi: redesenhada pelo Ambrósio
  // (19 Out 2026) para ficar no estilo do Nico. [ficheiro, escala] — a escala respeita a altura do desenho original.
  F.SPRITES_PALCO = {
    gabi: {
      pasta: 'img/gabi-palco/',
      trajes: { ola: ['02_ola', 1], curioso: ['01_de_pe', 1], pensar: ['05_a_pensar', 1], surpresa: ['07_a_saltar', 0.95],
        dica: ['06_a_apontar', 0.98], festa: ['07_a_saltar', 0.95], ideia: ['06_a_apontar', 0.98], calma: ['08_sentada', 0.8] },
      andar: [['03_andar_a', 0.97], ['04_andar_b', 0.97]],
    },
  };
  // [href, escala] da imagem de um ator: desenho do palco se existir; senão, os 8 estados da mascote
  F.spriteAtor = (id, traje, passo) => {
    const P = F.SPRITES_PALCO[id];
    if (P) {
      const [f, e] = passo !== undefined && P.andar ? P.andar[passo % P.andar.length] : (P.trajes[traje] || P.trajes.ola);
      return [P.pasta + f + '.png', e];
    }
    const M = F.MASCOTES && F.MASCOTES[id];
    if (!M) return ['', 1];
    return [M.pasta + (M.sprites[TRAJE_SPRITE[traje] || 'boas_vindas'] || M.sprites.boas_vindas) + '.png', 1];
  };

  // ------------------------------------------------------------------ cenários
  const CEU = '<rect width="480" height="320" fill="#cfe6f5"/>';
  const casa = (x, w, h, porta = true) =>
    `<rect x="${x}" y="${CHAO - h}" width="${w}" height="${h}" fill="#fffdf7"/>` +
    `<rect x="${x}" y="${CHAO - 16}" width="${w}" height="16" fill="#2038a6"/>` +            // barra azul alentejana
    `<rect x="${x}" y="${CHAO - h}" width="${w}" height="7" fill="#f2c14e"/>` +
    `<rect x="${x + w - 28}" y="${CHAO - h - 26}" width="16" height="26" fill="#fffdf7"/><rect x="${x + w - 32}" y="${CHAO - h - 32}" width="24" height="7" fill="#fffdf7"/><rect x="${x + w - 26}" y="${CHAO - h - 22}" width="4" height="6" fill="#d9d2c3"/><rect x="${x + w - 18}" y="${CHAO - h - 22}" width="4" height="6" fill="#d9d2c3"/>` +  // chaminé
    (porta ? `<path d="M${x + 14} ${CHAO}v-44a13 13 0 0 1 26 0v44z" fill="#7a4a2b"/>` : '') +
    `<rect x="${x + w - 44}" y="${CHAO - h + 26}" width="22" height="22" fill="#2038a6"/>`;
  const sobreiro = (x, s = 1) =>
    `<rect x="${x - 7 * s}" y="${CHAO - 62 * s}" width="${14 * s}" height="${62 * s}" fill="#8a5a3b"/>` +
    `<circle cx="${x - 26 * s}" cy="${CHAO - 74 * s}" r="${30 * s}" fill="#3f6e3a"/><circle cx="${x + 22 * s}" cy="${CHAO - 80 * s}" r="${34 * s}" fill="#4d8043"/>` +
    `<circle cx="${x}" cy="${CHAO - 104 * s}" r="${28 * s}" fill="#56894a"/>`;
  const CENARIOS = {
    rua: () => CEU +
      '<path d="M0 200a170 60 0 0 1 300 0z" fill="#b9d6a0"/><path d="M220 200a200 70 0 0 1 300 0z" fill="#a9cb8f"/>' +
      casa(-10, 120, 108) + casa(118, 96, 92) + casa(222, 92, 120, false) +
      // FabLab do Buinho, com a porta laranja e o B
      `<rect x="324" y="${CHAO - 132}" width="160" height="132" fill="#fffdf7"/><rect x="324" y="${CHAO - 16}" width="160" height="16" fill="#2038a6"/>` +
      `<rect x="324" y="${CHAO - 132}" width="160" height="7" fill="#f2c14e"/>` +
      `<path d="M376 ${CHAO}v-58a16 16 0 0 1 32 0v58z" fill="#fa6415"/>` +
      `<circle cx="440" cy="${CHAO - 92}" r="20" fill="#2038a6"/><text x="440" y="${CHAO - 84}" text-anchor="middle" font-family="Asap, Arial, sans-serif" font-weight="800" font-size="24" fill="#fff">B</text>` +
      `<rect x="0" y="${CHAO}" width="480" height="${A - CHAO}" fill="#e7d6b4"/><rect x="0" y="${CHAO}" width="480" height="5" fill="#d6c39c"/>`,
    fablab: () =>
      `<rect width="480" height="320" fill="#faf0e1"/>` +
      // janela redonda, prateleiras com peças, quadro de ferramentas
      '<circle cx="90" cy="86" r="40" fill="#cfe6f5" stroke="#2038a6" stroke-width="8"/><path d="M50 86h80M90 46v80" stroke="#2038a6" stroke-width="5"/>' +
      '<rect x="160" y="60" width="150" height="8" fill="#7a4a2b"/><rect x="160" y="118" width="150" height="8" fill="#7a4a2b"/>' +
      '<rect x="170" y="36" width="24" height="24" fill="#fa6415"/><path d="M206 60l14-24 14 24z" fill="#2038a6"/><circle cx="262" cy="47" r="13" fill="#f2c14e"/><path d="M282 60a14 14 0 0 1 28 0z" fill="#56894a"/>' +
      '<path d="M172 118a16 16 0 0 1 32 0z" fill="#2038a6"/><rect x="214" y="96" width="30" height="22" fill="#e8e1d2" stroke="#3c3c3c" stroke-width="2"/><rect x="254" y="100" width="44" height="18" fill="#fa6415"/>' +
      // bancada
      `<rect x="20" y="${CHAO - 64}" width="300" height="14" fill="#9a6a44"/><rect x="34" y="${CHAO - 50}" width="12" height="50" fill="#7a4a2b"/><rect x="294" y="${CHAO - 50}" width="12" height="50" fill="#7a4a2b"/>` +
      `<rect x="60" y="${CHAO - 96}" width="70" height="32" fill="#3c3c3c"/><rect x="66" y="${CHAO - 90}" width="58" height="16" fill="#e64a2e" opacity=".35"/>` +   // cortadora laser
      `<rect x="160" y="${CHAO - 84}" width="40" height="20" fill="#2038a6"/>` +
      // porta azul à direita
      `<rect x="366" y="${CHAO - 120}" width="52" height="120" fill="#2038a6"/><circle cx="408" cy="${CHAO - 58}" r="4" fill="#f2c14e"/>` +
      `<rect x="0" y="${CHAO}" width="480" height="${A - CHAO}" fill="#d9b88f"/><rect x="0" y="${CHAO}" width="480" height="5" fill="#c4a175"/>`,
    montado: () => CEU +
      '<path d="M-40 210a220 70 0 0 1 400 0z" fill="#d8c27a"/><path d="M200 214a240 80 0 0 1 320 0z" fill="#cbb36a"/>' +
      sobreiro(70, 0.8) + sobreiro(200, 1.05) + sobreiro(330, 0.7) + sobreiro(440, 0.95) +
      `<circle cx="408" cy="54" r="22" fill="#f2c14e"/>` +
      `<rect x="0" y="${CHAO}" width="480" height="${A - CHAO}" fill="#e9c46a"/><rect x="0" y="${CHAO}" width="480" height="5" fill="#d9b357"/>`,
    horta: () => CEU +
      '<path d="M-20 214a240 60 0 0 1 520 0z" fill="#a9cb8f"/>' +
      // vedação
      Array.from({ length: 12 }, (_, i) => `<rect x="${i * 42 + 6}" y="${CHAO - 70}" width="10" height="70" fill="#fffdf7"/>`).join('') +
      `<rect x="0" y="${CHAO - 58}" width="480" height="8" fill="#fffdf7"/>` +
      // depósito de água
      `<rect x="0" y="${CHAO - 8}" width="480" height="${A - CHAO + 8}" fill="#8b5e3c"/>` +
      // regos com couves e cenouras
      Array.from({ length: 7 }, (_, i) => `<path d="M${i * 68 + 14} ${CHAO + 18}a16 16 0 0 1 32 0z" fill="#56894a"/><path d="M${i * 68 + 50} ${CHAO + 30}l8-22 8 22z" fill="#fa6415"/>`).join(''),
    palco: () =>
      `<rect width="480" height="320" fill="#2a1a3a"/>` +
      '<ellipse cx="240" cy="250" rx="170" ry="40" fill="#f2c14e" opacity=".22"/>' +
      '<path d="M0 0h96v320H0z" fill="#b8322a"/><path d="M96 0q-30 160 0 320" fill="#9c2a23"/>' +
      '<path d="M480 0h-96v320h96z" fill="#b8322a"/><path d="M384 0q30 160 0 320" fill="#9c2a23"/>' +
      Array.from({ length: 8 }, (_, i) => `<path d="M${i * 60} 0a30 26 0 0 0 60 0z" fill="#c43b31"/>`).join('') +
      `<rect x="0" y="${CHAO}" width="480" height="${A - CHAO}" fill="#9a6a44"/><rect x="0" y="${CHAO}" width="480" height="5" fill="#7a4a2b"/>`,
  };
  const NOITE = '<rect width="480" height="320" fill="#0b1240" opacity=".55"/><circle cx="84" cy="56" r="20" fill="#fdf3c4"/><circle cx="94" cy="50" r="18" fill="#2c3366" opacity=".9"/>' +
    [[160, 40], [220, 70], [300, 30], [350, 80], [430, 46], [260, 110], [40, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2" fill="#fff"/>`).join('');

  // ------------------------------------------------------------------ objetos
  const OBJETOS = {
    bola: '<circle r="14" cy="-14" fill="#fa6415"/><path d="M-14 -14h28M0 -28v28" stroke="#fff" stroke-width="2.5" fill="none"/><circle r="14" cy="-14" fill="none" stroke="#c94f0f" stroke-width="1.5"/>',
    maca: '<circle r="13" cy="-13" fill="#d83a2e"/><rect x="-1.5" y="-32" width="3" height="8" fill="#7a4a2b"/><path d="M2 -28q10 -6 12 2q-8 3 -12 -2z" fill="#56894a"/>',
    microbit: '<rect x="-20" y="-30" width="40" height="30" rx="4" fill="#3c3c3c"/>' +
      Array.from({ length: 9 }, (_, i) => `<rect x="${-9 + (i % 3) * 7}" y="${-24 + Math.floor(i / 3) * 7}" width="4" height="4" fill="${i % 2 ? '#ff5050' : '#5a5a5a'}"/>`).join('') +
      '<circle cx="-14" cy="-15" r="3" fill="#bbb"/><circle cx="14" cy="-15" r="3" fill="#bbb"/>',
    caixa: '<rect x="-24" y="-26" width="48" height="26" fill="#fa6415"/><path d="M-10 -26v-6h20v6" fill="none" stroke="#3c3c3c" stroke-width="3"/><rect x="-24" y="-16" width="48" height="4" fill="#c94f0f"/>',
  };

  // tamanho de cada ator no palco [largura, altura]: as ilustrações têm proporções diferentes
  const TAMANHO = { nico: [100, 112], gabi: [96, 104] };

  const el = (tag, attrs = {}, pai) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
    if (pai) pai.appendChild(e);
    return e;
  };

  // quebrar o texto do balão em linhas curtas (máx. 3)
  function linhas(t, max = 20) {
    const pal = String(t).split(/\s+/).filter(Boolean);
    const out = [];
    let l = '';
    for (const p of pal) {
      if ((l + ' ' + p).trim().length > max && l) { out.push(l); l = p; } else l = (l + ' ' + p).trim();
    }
    if (l) out.push(l);
    if (out.length > 3) { out.length = 3; out[2] = out[2].slice(0, max - 1) + '…'; }
    return out.length ? out : [''];
  }

  class Palco {
    constructor(caixa, opts = {}) {
      this.opts = opts;
      this.svg = el('svg', { viewBox: `0 0 ${L} ${A}`, role: 'img', 'aria-label': 'Palco', class: 'cena-svg' });
      caixa.appendChild(this.svg);
      this.gFundo = el('g', {}, this.svg);
      this.gNoite = el('g', { class: 'cena-noite' }, this.svg);
      this.gObjetos = el('g', {}, this.svg);
      this.gAtores = el('g', {}, this.svg);
      this.gBaloes = el('g', {}, this.svg);
      this.atores = {};
      this.objetos = {};
      this.reset({});
    }

    reset(setup) {
      setup = setup || {};
      this.estadoInicial = setup;
      this.cenario(setup.cenario || 'rua', true);
      this.hora(setup.hora || 'dia', true);
      this.gObjetos.innerHTML = ''; this.gAtores.innerHTML = ''; this.gBaloes.innerHTML = '';
      this.atores = {}; this.objetos = {};
      const at = setup.atores || { nico: { x: 90 }, gabi: { x: 190 } };
      for (const [id, o] of Object.entries(at)) this.criarAtor(id, o);
      for (const [id, o] of Object.entries(setup.objetos || {})) this.criarObjeto(id, o);
    }

    criarAtor(id, o) {
      const g = el('g', { class: 'cena-ator', 'data-ator': id, tabindex: '-1' }, this.gAtores);
      el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 6, fill: '#000', opacity: '.13' }, g);
      const corpo = el('g', {}, g);
      const [w, h] = TAMANHO[id] || [110, 100];
      const img = el('image', { preserveAspectRatio: 'xMidYMax meet' }, corpo);
      const a = { id, g, corpo, img, w, h, x: o.x ?? 120, traje: o.traje || 'ola', esquerda: !!o.esquerda };
      this.atores[id] = a;
      this.pintar(a);
      if (this.opts.aoClicar) g.addEventListener('pointerdown', () => this.opts.aoClicar(id));
      this.colocar(id, a.x);
      this.virar(id, a.esquerda);
    }
    criarObjeto(id, o) {
      const g = el('g', { class: 'cena-objeto', 'data-objeto': id }, this.gObjetos);
      g.innerHTML = OBJETOS[id] || '';
      this.objetos[id] = { id, g, x: o.x ?? 300 };
      g.setAttribute('transform', `translate(${this.objetos[id].x} ${CHAO})`);
    }

    cenario(id, inicial) {
      if (!CENARIOS[id]) return;
      this.cenarioAtual = id;
      this.gFundo.innerHTML = CENARIOS[id]();
      if (!inicial) this.piscar();
    }
    hora(h, inicial) {
      this.horaAtual = h === 'noite' ? 'noite' : 'dia';
      this.gNoite.innerHTML = this.horaAtual === 'noite' ? NOITE : '';
      if (!inicial) this.piscar();
    }
    piscar() { this.svg.classList.remove('cena-troca'); void this.svg.getBBox(); this.svg.classList.add('cena-troca'); }

    // posição de um ator ou objeto (para «ir até a bola»)
    x(id) { return (this.atores[id] || this.objetos[id] || {}).x; }
    tem(id) { return !!(this.atores[id] || this.objetos[id]); }
    colocar(id, x) {
      const a = this.atores[id];
      if (!a) return;
      a.x = Math.max(30, Math.min(L - 30, x));
      a.g.setAttribute('transform', `translate(${a.x.toFixed(1)} ${CHAO})`);
      this.moverBalao(id);
    }
    virar(id, paraEsquerda) {
      const a = this.atores[id];
      if (!a) return;
      a.esquerda = !!paraEsquerda;
      a.corpo.setAttribute('transform', a.esquerda ? 'scale(-1 1)' : '');
    }
    imagem(id, traje) {
      const a = this.atores[id];
      if (!a) return;
      a.traje = traje;
      this.pintar(a);
    }
    // desenha a imagem do ator (traje, ou um passo de andar se houver desenhos para isso)
    pintar(a, passo) {
      const [href, e] = F.spriteAtor(a.id, a.traje, passo);
      const w = a.w * e, h = a.h * e;
      a.img.setAttribute('href', href);
      for (const [k, v] of Object.entries({ x: -w / 2, y: -h, width: w, height: h })) a.img.setAttribute(k, v);
    }
    passo(id, k) { const a = this.atores[id]; if (a && F.SPRITES_PALCO[id] && F.SPRITES_PALCO[id].andar) this.pintar(a, k); }
    parado(id) { const a = this.atores[id]; if (a) this.pintar(a); }
    // balão de fala por cima do ator
    dizer(id, texto) {
      const a = this.atores[id];
      if (!a) return;
      this.calar(id);
      const ls = linhas(texto);
      const w = Math.max(56, Math.min(200, 14 + 8.6 * Math.max(...ls.map(l => l.length))));
      const h = 12 + ls.length * 19;
      const g = el('g', { class: 'cena-balao', 'data-balao': id }, this.gBaloes);
      el('rect', { x: -w / 2, y: -h, width: w, height: h, rx: 12, fill: '#fff', stroke: '#2038a6', 'stroke-width': 2.5 }, g);
      el('path', { d: 'M-8 -1.5 L0 12 L8 -1.5', fill: '#fff', stroke: '#2038a6', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, g);
      el('rect', { x: -9, y: -4, width: 18, height: 4, fill: '#fff' }, g);
      ls.forEach((l, i) => {
        const t = el('text', { x: 0, y: -h + 22 + i * 19, 'text-anchor': 'middle', 'font-family': 'Asap, Arial, sans-serif', 'font-size': 16, 'font-weight': 700, fill: '#1a1a1a' }, g);
        t.textContent = l;
      });
      a.balao = { g, w, h };
      this.moverBalao(id);
    }
    calar(id) {
      const a = this.atores[id];
      if (a && a.balao) { a.balao.g.remove(); a.balao = null; }
    }
    moverBalao(id) {
      const a = this.atores[id];
      if (!a || !a.balao) return;
      const bx = Math.max(a.balao.w / 2 + 4, Math.min(L - a.balao.w / 2 - 4, a.x));
      a.balao.g.setAttribute('transform', `translate(${bx.toFixed(1)} ${CHAO - 116})`);
    }
    estado() {
      return { cenario: this.cenarioAtual, hora: this.horaAtual,
        atores: Object.fromEntries(Object.values(this.atores).map(a => [a.id, { x: Math.round(a.x), traje: a.traje, fala: !!a.balao }])) };
    }
  }

  F.Palco = Palco;
  F.PALCO_CHAO = CHAO;
})();
