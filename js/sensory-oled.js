/* Nico — extensão «Sensory OLED» do Buinho (github:Buinho-Creative-Hub/IC-Oled v0.2.0, Invisible Cartographies)
 * no Nico: os blocos (gaveta roxa «Sensory OLED»), o desenho no OLED do ecrã (mesmas contas e a mesma letra 5×7
 * da extensão, num framebuffer de 128×64) e as funções de valor (média, dB, atividade).
 * O MicroPython equivalente está em js/hex.js (F.PY_SENSORY).
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  const W = 128, H = 64;
  // letra 5×7 da extensão, ASCII 32..122, 5 colunas por letra (bit 0 = em cima)
  F.LETRA_SENSORY = '000000000000005F00000007000700147F147F14242A7F2A12231308646236495620500005030000001C2241000041221C002A1C7F1C2A08083E080800503000000808080808006060000020100804023E5149453E00427F4000426151494622414949361814127F1027454545393C4A49493101710905033649494936464949291E003636000000563600000814224100141414141400412214080201510906324979413E7C1211127C7F494949363E414141227F4141221C7F494949417F090909013E4149497A7F0808087F00417F41002040413F017F081422417F404040407F020C027F7F0408107F3E4141413E7F090909063E4151215E7F09192946264949493201017F01013F4040403F1F2040201F3F4038403F631408146307087008076151494543007F41410002040810200041417F0004020102044040404040000102040020545454787F484444383844444420384444487F3854545418087E0901020C5252523E7F0804047800447D40002040443D007F1028440000417F40007C041804787C0804047838444444387C14141408081414187C7C080404084854545420043F4440203C4040207C1C2040201C3C4030403C44281028440C5050503C4464544C44';
  const FONT = F.LETRA_SENSORY.match(/../g).map(h => parseInt(h, 16));

  // ------------------------------------------------------------ o ecrã, como no main.ts da extensão
  class SensoryOLED {
    constructor() { this.reset(); }
    reset() {
      this.fb = new Uint8Array(1024); this.ligado = false;
      this.peakValue = -1000000; this.peakTime = 0; this.history = [];
      this.avgTimes = [[], [], []]; this.avgValues = [[], [], []];
      this.energy = 0; this.wasMoving = false; this.lastActivity = 0; this.moves = [];
    }
    millis() { return Math.round(performance.now()); }
    begin() { this.ligado = true; }
    clearBuffer() { this.begin(); this.fb.fill(0); }
    pixel(x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || x >= W || y < 0 || y >= H) return; this.fb[(y >> 3) * W + x] |= 1 << (y & 7); }
    hline(x0, x1, y) { for (let x = x0; x <= x1; x++) this.pixel(x, y); }
    vline(x, y0, y1) { if (y0 > y1) [y0, y1] = [y1, y0]; for (let y = y0; y <= y1; y++) this.pixel(x, y); }
    rect(x, y, w, h) { this.hline(x, x + w - 1, y); this.hline(x, x + w - 1, y + h - 1); this.vline(x, y, y + h - 1); this.vline(x + w - 1, y, y + h - 1); }
    fillRect(x, y, w, h) { for (let i = 0; i < w; i++) this.vline(x + i, y, y + h - 1); }
    glyph(code) { if (code < 32 || code > 122) code = 63; return (code - 32) * 5; }
    text(x, y, s) {
      s = F.semAcentos(s);
      for (let k = 0; k < s.length; k++) {
        const base = this.glyph(s.charCodeAt(k));
        for (let col = 0; col < 5; col++) for (let row = 0; row < 8; row++) if (FONT[base + col] & (1 << row)) this.pixel(x + k * 6 + col, y + row);
      }
    }
    textRight(xr, y, s) { s = F.semAcentos(s); this.text(xr - s.length * 6 + 2, y, s); }
    textScaled(x, y, s, k) {
      for (let n = 0; n < s.length; n++) {
        const base = this.glyph(s.charCodeAt(n));
        for (let col = 0; col < 5; col++) for (let row = 0; row < 8; row++) if (FONT[base + col] & (1 << row)) this.fillRect(x + (n * 6 + col) * k, y + row * k, k, k);
      }
    }
    fmt(v) { return '' + Math.round(v); }
    scale(v, min, max, size) { if (max == min) return 0; let f = (v - min) / (max - min); f = Math.max(0, Math.min(1, f)); return Math.round(f * size); }
    intensityBar(value, min, max, label = 'SOUND', unit = 'dB', peak = true) {
      const now = this.millis(), range = max - min;
      if (this.peakTime > 0) this.peakValue -= range * (now - this.peakTime) / 3000;
      this.peakTime = now;
      if (value > this.peakValue) this.peakValue = value;
      if (this.peakValue < min) this.peakValue = min;
      this.clearBuffer();
      this.text(0, 0, label);
      this.textRight(W - 1, 0, this.fmt(value) + ' ' + unit);
      this.rect(0, 16, W, 24);
      const w = this.scale(value, min, max, W - 4);
      if (w > 0) this.fillRect(2, 18, w, 20);
      if (peak) { const px = 2 + this.scale(this.peakValue, min, max, W - 4); this.vline(Math.min(px, W - 2), 12, 43); this.vline(Math.min(px + 1, W - 1), 12, 43); }
      this.text(0, 52, this.fmt(min));
      this.textRight(W - 1, 52, this.fmt(max));
      if (peak) { const p = 'PICO ' + this.fmt(this.peakValue); this.text(Math.round((W - p.length * 6) / 2), 52, p); }
    }
    scrollingGraph(value, min, max, low, high, label = 'SOUND') {
      this.history.push(value); if (this.history.length > W) this.history.shift();
      const top = 10, size = H - 1 - top, yOf = v => H - 1 - this.scale(v, min, max, size);
      this.clearBuffer();
      this.text(0, 0, label);
      this.textRight(W - 1, 0, this.fmt(value));
      for (const gv of [low, high]) { if (gv == null || gv <= min || gv >= max) continue; const gy = yOf(gv); for (let x = 0; x < W; x += 4) this.pixel(x, gy); }
      const n = this.history.length; let prevY = -1;
      for (let i = 0; i < n; i++) { const x = W - n + i, y = yOf(this.history[i]); if (prevY < 0) this.pixel(x, y); else this.vline(x, prevY, y); prevY = y; }
    }
    resetGraph() { this.history = []; }
    bigNumber(value, label = 'SOUND', unit = '') {
      const t = this.fmt(value); let k = 4; if (t.length > 5) k = 3; if (t.length > 7) k = 2;
      this.clearBuffer();
      label = F.semAcentos(label); unit = F.semAcentos(unit);
      this.text(Math.round((W - label.length * 6) / 2), 0, label);
      const w = t.length * 6 * k - k;
      this.textScaled(Math.round((W - w) / 2), 14, t, k);
      if (unit.length > 0) this.text(Math.round((W - unit.length * 6) / 2), 56, unit);
    }
    average(value, seconds, channel = 1) {
      channel = Math.max(1, Math.min(3, Math.round(channel))) - 1; if (seconds <= 0) seconds = 1;
      const now = this.millis(), ts = this.avgTimes[channel], vs = this.avgValues[channel];
      ts.push(now); vs.push(value);
      while (ts.length > 1 && now - ts[0] > seconds * 1000) { ts.shift(); vs.shift(); }
      while (ts.length > 200) { ts.shift(); vs.shift(); }
      return Math.round(vs.reduce((a, b) => a + b, 0) / vs.length);
    }
    toDecibels(level) { level = Math.max(0, Math.min(255, level)); return Math.round(35 + level * 65 / 255); }
    updateActivity(moving, seconds) {
      const now = this.millis(), dt = this.lastActivity > 0 ? (now - this.lastActivity) / 1000 : 0;
      this.lastActivity = now; if (seconds <= 0) seconds = 1;
      if (moving && !this.wasMoving) { this.energy += 25; this.moves.push(now); }
      if (moving) this.energy += 10 * dt; else this.energy -= 100 * dt / seconds;
      this.energy = Math.max(0, Math.min(100, this.energy));
      this.wasMoving = moving;
      while (this.moves.length && now - this.moves[0] > 60000) this.moves.shift();
    }
    activityMeter(moving, seconds = 10, label = 'ACTIVITY') {
      this.updateActivity(moving, seconds);
      this.clearBuffer();
      this.text(0, 0, label);
      this.textRight(W - 1, 0, this.moves.length + '/min');
      for (let i = 0; i < 10; i++) { const h = 8 + i * 4, x = 4 + i * 12, y = 60 - h; if (this.energy > i * 10) this.fillRect(x, y, 9, h); else this.rect(x, y, 9, h); }
    }
    activityLevel() { return Math.round(this.energy); }
    movementsPerMinute() { return this.moves.length; }
    clear() { this.clearBuffer(); }
    // ---- acrescentos do Nico (não existem na IC-Oled v0.2.0): texto com tamanho, formas e animações
    // texto com tamanho 1–4 em qualquer sítio, sem apagar o resto do ecrã
    escrever(s, x, y, k) {
      this.begin();
      k = Math.max(1, Math.min(4, Math.round(k) || 1));
      s = F.semAcentos(textoNum(s));
      if (k === 1) this.text(Math.round(x), Math.round(y), s); else this.textScaled(Math.round(x), Math.round(y), s, k);
    }
    circle(cx, cy, r) {   // contorno (algoritmo do ponto médio)
      let x = r, y = 0, e = 1 - r;
      while (x >= y) {
        for (const [a, b] of [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]]) this.pixel(cx + a, cy + b);
        y++; if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
      }
    }
    fillCircle(cx, cy, r) { for (let dy = -r; dy <= r; dy++) { const w = Math.floor(Math.sqrt(r * r - dy * dy)); this.hline(cx - w, cx + w, cy + dy); } }
    line(x0, y0, x1, y1) {
      const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
      for (let i = 0; i <= n; i++) this.pixel(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n));
    }
    // desenha a moldura i (de ANIMACOES[nome].n) — a mesma conta que o so_anim_* do .hex
    moldura(nome, i) { this.clearBuffer(); ANIMACOES[nome].desenhar(this, i); }
    showText(s, line) { this.begin(); const y = Math.max(0, Math.min(7, Math.round(line))) * 8; for (let x = 0; x < W; x++) this.fb[(y >> 3) * W + x] = 0; this.text(0, y, s); }
  }
  F.SensoryOLED = SensoryOLED;
  function textoNum(s) { if (typeof s === 'number') return String(Math.round(s * 100) / 100); return String(s); }

  // ------------------------------------------------------------ animações (galeria, como o «mostrar ícone»)
  // n molduras, ms por moldura. Cada desenho é traduzido 1:1 para MicroPython em js/hex.js (so_anim_<nome>).
  const ANIMACOES = {
    olhos: { nome: 'olhos', n: 12, ms: 110, desenhar(o, i) {
      const fecha = i === 9 || i === 10;
      for (const cx of [40, 88]) {
        if (fecha) { o.hline(cx - 18, cx + 18, 32); o.hline(cx - 18, cx + 18, 33); continue; }
        o.circle(cx, 32, 20); o.circle(cx, 32, 19);
        o.fillCircle(cx + Math.round(8 * Math.cos(2 * Math.PI * i / 12)), 32 + Math.round(5 * Math.sin(2 * Math.PI * i / 12)), 7);
      }
    } },
    coracao: { nome: 'coração', n: 8, ms: 120, desenhar(o, i) {
      const s = [10, 13, 10, 12, 10, 10, 10, 10][i];
      const d = Math.round(s * 0.9);
      o.fillCircle(64 - d, 24, s); o.fillCircle(64 + d, 24, s);
      for (let y = 0; y <= 2 * s + 4; y++) { const w = Math.round((d + s) * (1 - y / (2 * s + 4))); o.hline(64 - w, 64 + w, 26 + y); }
    } },
    bola: { nome: 'bola a saltar', n: 16, ms: 70, desenhar(o, i) {
      o.hline(0, 127, 63);
      const x = 10 + i * 7, y = 56 - Math.round(44 * Math.abs(Math.sin(Math.PI * i / 8)));
      o.fillCircle(x, y, 6);
    } },
    chuva: { nome: 'chuva', n: 8, ms: 90, desenhar(o, i) {
      for (const [cx, cy, r] of [[44, 10, 8], [60, 7, 10], [78, 9, 9], [92, 11, 6]]) o.fillCircle(cx, cy, r);   // nuvem
      for (let k = 0; k < 16; k++) { const x = 30 + (k * 37) % 70, y = 20 + (k * 23 + i * 7) % 44; o.vline(x, y, Math.min(63, y + 4)); }
    } },
    ondas: { nome: 'ondas do mar', n: 8, ms: 100, desenhar(o, i) {
      for (const [y0, a, f] of [[24, 8, 10], [42, 6, 7]]) {
        let py = -1;
        for (let x = 0; x < 128; x++) { const y = y0 + Math.round(a * Math.sin((x + i * 8) / f)); if (py < 0) o.pixel(x, y); else o.vline(x, py, y); py = y; }
      }
    } },
    fogo: { nome: 'fogo de artifício', n: 14, ms: 90, desenhar(o, i) {
      for (const [cx, cy, t0] of [[40, 24, 0], [92, 30, 5]]) {
        const t = i - t0; if (t < 0 || t > 8) continue;
        const r = t * 4;
        if (r === 0) { o.fillCircle(cx, cy, 2); continue; }
        for (let k = 0; k < 12; k++) { const a = 2 * Math.PI * k / 12; o.fillRect(cx + Math.round(r * Math.cos(a)), cy + Math.round(r * Math.sin(a)), 2, 2); }
      }
    } },
  };
  F.ANIMACOES_OLED = ANIMACOES;
  // miniatura da galeria: uma moldura desenhada num SVG pequeno (como os ícones do «mostrar ícone»)
  function miniatura(id) {
    const o = new SensoryOLED(); const a = ANIMACOES[id];
    o.moldura(id, Math.floor(a.n / 4));
    let r = '';
    for (let i = 0; i < 1024; i++) if (o.fb[i]) for (let b = 0; b < 8; b++) if (o.fb[i] & (1 << b)) r += `M${i % 128} ${(i >> 7) * 8 + b}h1v1h-1z`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="64" viewBox="0 0 128 64"><rect width="128" height="64" rx="4" fill="#05070a"/><path d="${r}" fill="#e8f6ff"/></svg>`);
  }
  const opcoesAnim = Object.keys(ANIMACOES).map(k => [{ src: miniatura(k), width: 64, height: 32, alt: ANIMACOES[k].nome }, k]);

  // ------------------------------------------------------------ blocos (gaveta «Sensory OLED», roxa como na extensão)
  const num = n => ({ type: 'input_value', name: n, check: 'Number' });
  const txt = n => ({ type: 'input_value', name: n });
  const stmt = { previousStatement: null, nextStatement: null, inputsInline: true, style: 'sensory' };
  const PINOS = ['P13', 'P0', 'P1', 'P2', 'P8', 'P12', 'P14', 'P15', 'P16'].map(p => [p, p]);
  Blockly.defineBlocksWithJsonArray([
    { type: 'so_barra', message0: 'barra de intensidade %1 de %2 até %3 rótulo %4 unidade %5', args0: [num('V'), num('MIN'), num('MAX'), txt('ROT'), txt('UN')], ...stmt,
      tooltip: 'Barra que sobe e desce com o valor; a marca do pico lembra o mais alto e desce devagar. Usa num «para sempre».' },
    { type: 'so_grande', message0: 'número grande %1 rótulo %2 unidade %3', args0: [num('V'), txt('ROT'), txt('UN')], ...stmt, tooltip: 'Um valor em números grandes, para se ler ao longe.' },
    { type: 'so_grafico', message0: 'gráfico a passar %1 de %2 até %3 linhas em %4 e %5 rótulo %6', args0: [num('V'), num('MIN'), num('MAX'), num('LO'), num('HI'), txt('ROT')], ...stmt,
      tooltip: 'As últimas leituras numa linha que passa da direita para a esquerda; cada vez junta um ponto.' },
    { type: 'so_grafico_reset', message0: 'recomeçar gráfico a passar', ...stmt, tooltip: 'Apaga a história do gráfico.' },
    { type: 'so_atividade', message0: 'medidor de atividade %1 esvazia em %2 s rótulo %3', args0: [{ type: 'input_value', name: 'MOV', check: 'Boolean' }, num('S'), txt('ROT')], ...stmt,
      tooltip: 'Cada movimento enche o medidor; quando nada mexe, esvazia. Mostra os movimentos do último minuto.' },
    { type: 'so_texto', message0: 'mostrar texto %1 na linha %2', args0: [txt('T'), num('L')], ...stmt, tooltip: 'Escreve um texto curto (até 21 letras) numa das 8 linhas (0 = em cima).' },
    { type: 'so_limpar', message0: 'limpar OLED', ...stmt, tooltip: 'Apaga o ecrã.' },
    { type: 'so_escrever', message0: 'escrever %1 em x %2 y %3 tamanho %4', args0: [txt('T'), num('X'), num('Y'),
      { type: 'field_dropdown', name: 'K', options: [['1', '1'], ['2', '2'], ['3', '3'], ['4', '4']] }], ...stmt,
      tooltip: 'Escreve um texto ou um número onde quiseres (x de 0 a 127, y de 0 a 63), com letra pequena (1) a muito grande (4). Não apaga o resto: usa «limpar OLED» antes.' },
    { type: 'so_animacao', message0: 'mostrar animação %1 %2 vezes', args0: [{ type: 'field_dropdown', name: 'A', options: opcoesAnim }, num('N')], ...stmt,
      tooltip: 'Mostra uma animação no ecrã OLED. Enquanto a animação corre, o resto do programa espera.' },
    { type: 'so_media', message0: 'média de %1 em %2 s canal %3', args0: [num('V'), num('S'), num('C')], inputsInline: true, output: 'Number', style: 'sensory',
      tooltip: 'Média dos últimos segundos: mais estável do que uma leitura só. Um canal (1, 2 ou 3) por sensor.' },
    { type: 'so_db', message0: 'dB a partir do nível de som %1', args0: [num('V')], inputsInline: true, output: 'Number', style: 'sensory', tooltip: 'Converte o nível de som do micro:bit (0–255) em dB aproximados (35–100).' },
    { type: 'so_pir', message0: 'PIR no %1 deteta movimento', args0: [{ type: 'field_dropdown', name: 'P', options: PINOS }], output: 'Boolean', style: 'sensory', tooltip: 'Verdadeiro enquanto o PIR vê movimento.' },
    { type: 'so_nivel', message0: 'nível de atividade', output: 'Number', style: 'sensory', tooltip: 'De 0 a 100, o mesmo do medidor de atividade.' },
    { type: 'so_movimentos', message0: 'movimentos por minuto', output: 'Number', style: 'sensory', tooltip: 'Quantos movimentos começaram no último minuto.' },
  ]);
  const n = (k, v) => `<value name="${k}"><shadow type="mk_num"><field name="NUM">${v}</field></shadow></value>`;
  const t = (k, v) => `<value name="${k}"><shadow type="mk_texto"><field name="TXT">${v}</field></shadow></value>`;
  F.XML_SENSORY = {
    so_barra: `<block type="so_barra"><value name="V"><block type="mk_kit_ruido"><field name="P">P1</field></block></value>${n('MIN', 40)}${n('MAX', 85)}${t('ROT', 'RUIDO')}${t('UN', 'dB')}</block>`,
    so_grande: `<block type="so_grande">${n('V', 50)}${t('ROT', 'RUIDO')}${t('UN', 'dB')}</block>`,
    so_grafico: `<block type="so_grafico">${n('V', 50)}${n('MIN', 30)}${n('MAX', 90)}${n('LO', 45)}${n('HI', 65)}${t('ROT', 'RUIDO')}</block>`,
    so_grafico_reset: '<block type="so_grafico_reset"></block>',
    so_atividade: `<block type="so_atividade"><value name="MOV"><shadow type="so_pir"><field name="P">P13</field></shadow></value>${n('S', 10)}${t('ROT', 'ATIVIDADE')}</block>`,
    so_texto: `<block type="so_texto">${t('T', 'Olá')}${n('L', 0)}</block>`,
    so_limpar: '<block type="so_limpar"></block>',
    so_barra_luz: `<block type="so_barra"><value name="V"><block type="mk_kit_luz"><field name="P">P2</field></block></value>${n('MIN', 0)}${n('MAX', 100)}${t('ROT', 'LUZ')}${t('UN', '%')}</block>`,
    so_escrever: `<block type="so_escrever">${t('T', 'Olá!')}${n('X', 0)}${n('Y', 20)}<field name="K">2</field></block>`,
    so_animacao: `<block type="so_animacao"><field name="A">olhos</field>${n('N', 2)}</block>`,
    so_media: `<block type="so_media">${n('V', 50)}${n('S', 5)}${n('C', 1)}</block>`,
    so_db: `<block type="so_db"><value name="V"><block type="mk_som_nivel"></block></value></block>`,
    so_pir: '<block type="so_pir"><field name="P">P13</field></block>',
    so_nivel: '<block type="so_nivel"></block>',
    so_movimentos: '<block type="so_movimentos"></block>',
  };
})();
