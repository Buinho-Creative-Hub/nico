/* Faísca Desafios — micro:bit no ecrã + som (Web Audio). */
(function () {
  'use strict';
  const F = window.Faisca;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  // ------------------------------------------------------------- som
  let ctx = null;
  function audio() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function beep(freq, ms, when = 0, type = 'square', vol = 0.08) {
    const a = audio();
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.value = freq;
    const t0 = a.currentTime + when;
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.01);
    g.gain.setValueAtTime(vol, t0 + ms / 1000 - 0.02);
    g.gain.linearRampToValueAtTime(0, t0 + ms / 1000);
    o.connect(g).connect(a.destination);
    o.start(t0); o.stop(t0 + ms / 1000 + 0.02);
  }
  function glide(f1, f2, ms, when = 0, type = 'triangle', vol = 0.1) {
    const a = audio();
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    const t0 = a.currentTime + when;
    o.frequency.setValueAtTime(f1, t0);
    o.frequency.exponentialRampToValueAtTime(f2, t0 + ms / 1000);
    g.gain.setValueAtTime(vol, t0);
    g.gain.linearRampToValueAtTime(0, t0 + ms / 1000);
    o.connect(g).connect(a.destination);
    o.start(t0); o.stop(t0 + ms / 1000 + 0.02);
  }
  // Aproximações dos sons do micro:bit V2 (duração em ms devolvida)
  const SONS = {
    giggle()     { [0, 1, 2, 3, 4].forEach(i => glide(700 - i * 40, 500 - i * 40, 110, i * 0.13)); return 700; },
    happy()      { glide(400, 900, 250); glide(600, 1200, 250, 0.25); return 520; },
    hello()      { glide(300, 700, 300); glide(700, 500, 200, 0.3); return 520; },
    mysterious() { glide(300, 600, 900, 0, 'sine', 0.12); glide(450, 300, 900, 0, 'sine', 0.06); return 950; },
    sad()        { glide(500, 250, 700); return 720; },
    slide()      { glide(300, 900, 500, 0, 'sawtooth', 0.05); return 520; },
    soaring()    { glide(400, 1600, 900, 0, 'sine', 0.12); return 920; },
    spring()     { [0, 1, 2, 3].forEach(i => glide(300, 900, 120, i * 0.13)); return 560; },
    twinkle()    { [1046, 1318, 1568, 2093].forEach((f, i) => beep(f, 90, i * 0.1, 'sine', 0.08)); return 420; },
    yawn()       { glide(600, 200, 1200, 0, 'sine', 0.12); return 1220; },
  };

  // ------------------------------------------------------------- micro:bit
  class Sim {
    constructor(host, onInput) {
      this.onInput = onInput;
      this.leds = [];
      this.pinos = { P0: 0, P1: 0, P2: 0 };
      this.escuro = false;
      this.botoes = { A: false, B: false };
      // valores dos sensores (mudam com os controlos por baixo do micro:bit)
      this.sensores = { luz: 150, som: 20, temperatura: 21 };
      for (const p of ['P0', 'P1', 'P2']) { this.sensores['digital:' + p] = 0; this.sensores['analogico:' + p] = 0; }
      this.svg = el('svg', { viewBox: '0 0 340 330', role: 'img', 'aria-label': 'micro:bit simulado' }, host);
      this.desenhar();
      this.criarControlos(host);
    }
    sensor(nome) { return this.sensores[nome] ?? 0; }
    desenhar() {
      const s = this.svg;
      el('rect', { x: 20, y: 30, width: 300, height: 230, rx: 18, fill: '#1e1e1e' }, s);
      // logótipo (tocar)
      const logo = el('g', { class: 'sim-toque', tabindex: 0, role: 'button', 'aria-label': 'Tocar no logótipo' }, s);
      el('ellipse', { cx: 170, cy: 48, rx: 22, ry: 10, fill: 'none', stroke: '#d4af37', 'stroke-width': 3 }, logo);
      el('circle', { cx: 160, cy: 48, r: 3.5, fill: '#d4af37' }, logo);
      el('circle', { cx: 180, cy: 48, r: 3.5, fill: '#d4af37' }, logo);
      this.ligar(logo, () => this.onInput('logo'));
      // ecrã 5×5
      for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) {
        const cx = 122 + x * 24, cy = 82 + y * 24;
        el('rect', { x: cx - 4, y: cy - 7, width: 8, height: 14, rx: 2, fill: '#3a2a2a' }, s);
        this.leds.push(el('rect', { x: cx - 4, y: cy - 7, width: 8, height: 14, rx: 2, fill: '#ff2a2a', opacity: 0, class: 'sim-led' }, s));
      }
      // botões A e B
      const botao = (cx, nome) => {
        const g = el('g', { class: 'sim-toque', tabindex: 0, role: 'button', 'aria-label': 'Botão ' + nome }, s);
        el('rect', { x: cx - 22, y: 112, width: 44, height: 44, rx: 6, fill: '#333' }, g);
        el('circle', { cx, cy: 134, r: 14, fill: '#111', stroke: '#555', 'stroke-width': 2 }, g);
        el('text', { x: cx, y: 102, fill: '#fff', 'font-size': 16, 'font-weight': 700, 'text-anchor': 'middle', 'font-family': 'Asap, sans-serif' }, g).textContent = nome;
        this.ligar(g, () => this.onInput('botao:' + nome));
        return g;
      };
      botao(60, 'A'); botao(280, 'B');
      // pinos
      const pinos = [['P0', 70, 36], ['P1', 130, 36], ['P2', 190, 36], ['3V', 238, 28], ['GND', 288, 28]];
      this.padP = {};
      for (const [nome, cx, w] of pinos) {
        const g = el('g', nome.startsWith('P') ? { class: 'sim-toque', tabindex: 0, role: 'button', 'aria-label': 'Tocar no pin ' + nome } : {}, s);
        const r = el('rect', { x: cx - w / 2, y: 222, width: w, height: 38, rx: 4, fill: '#c9a227' }, g);
        el('circle', { cx, cy: 238, r: nome.startsWith('P') ? 9 : 5, fill: '#1e1e1e' }, g);
        el('text', { x: cx, y: 274, fill: '#5a5a5a', 'font-size': 12, 'font-weight': 700, 'text-anchor': 'middle', 'font-family': 'Asap, sans-serif' }, s).textContent = nome.replace('P', '');
        if (nome.startsWith('P')) {
          this.padP[nome] = r;
          if (nome !== 'P2') this.ligar(g, () => this.onInput('pino:' + nome));
        }
      }
      // LED de fora no P2 (aparece quando é usado)
      this.ledFora = el('g', { opacity: 0 }, s);
      el('path', { d: 'M190 252 C 190 290 220 300 236 306', stroke: '#2364ff', 'stroke-width': 3, fill: 'none' }, this.ledFora);
      el('path', { d: 'M288 252 C 288 290 272 300 262 306', stroke: '#111', 'stroke-width': 3, fill: 'none' }, this.ledFora);
      this.ledBolbo = el('circle', { cx: 249, cy: 312, r: 11, fill: '#5a1a1a', stroke: '#300', 'stroke-width': 2 }, this.ledFora);
      el('text', { x: 268, y: 317, fill: '#5a5a5a', 'font-size': 12, 'font-weight': 700, 'font-family': 'Asap, sans-serif' }, this.ledFora).textContent = 'LED';
      // altifalante a vibrar
      this.som = el('g', { opacity: 0 }, s);
      el('path', { d: 'M296 62 a 10 10 0 0 1 0 16 M302 56 a 18 18 0 0 1 0 28', stroke: '#ffc850', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, this.som);
    }
    ligar(g, fn) {
      g.addEventListener('click', () => { audio(); fn(); });
      g.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); audio(); fn(); } });
    }
    // ---- saídas (chamadas pelo motor)
    icone(nome) {
      this.pararTexto();
      const g = F.ICONES[nome];
      if (!g) return;
      for (let i = 0; i < 25; i++) this.leds[i].setAttribute('opacity', g[Math.floor(i / 5)][i % 5] === '#' ? 1 : 0);
    }
    limpar() { this.pararTexto(); this.leds.forEach(l => l.setAttribute('opacity', 0)); }
    pixel(x, y, on) { this.pararTexto(); this.leds[y * 5 + x].setAttribute('opacity', on ? 1 : 0); }
    grafico(v, max) {
      this.pararTexto();
      const n = Math.max(0, Math.min(25, Math.round(25 * v / (max || 1))));
      // enche de baixo para cima, como o «desenhar gráfico» do MakeCode
      for (let i = 0; i < 25; i++) {
        const y = 4 - Math.floor(i / 5), x = i % 5;
        this.leds[y * 5 + x].setAttribute('opacity', i < n ? 1 : 0);
      }
    }
    // texto/número a passar no ecrã; devolve quanto tempo demora (ms)
    mostrarTexto(t, numero) {
      this.pararTexto();
      const cols = F.colunasTexto(t);
      const pintar = off => {
        for (let x = 0; x < 5; x++) {
          const c = cols[off + x] || [false, false, false, false, false];
          for (let y = 0; y < 5; y++) this.leds[y * 5 + x].setAttribute('opacity', c[y] ? 1 : 0);
        }
      };
      if (numero && String(t).length === 1) { pintar(cols.length - 1 >= 5 ? 0 : -Math.floor((5 - (cols.length - 1)) / 2)); return 150; }
      let off = -5;
      const PASSO = 90;
      pintar(off);
      this._texto = setInterval(() => {
        off++;
        if (off > cols.length) { this.pararTexto(); return; }
        pintar(off);
      }, PASSO);
      return (cols.length + 6) * PASSO;
    }
    pararTexto() { clearInterval(this._texto); this._texto = null; }
    servo(p, a) {
      if (!this.servoG) {
        const cx = { P0: 70, P1: 130, P2: 190 }[p] || 70;
        this.servoG = el('g', {}, this.svg);
        el('path', { d: `M${cx} 252 C ${cx} 285 ${cx - 30} 290 ${cx - 40} 300`, stroke: '#e0a020', 'stroke-width': 3, fill: 'none' }, this.servoG);
        el('rect', { x: cx - 70, y: 292, width: 44, height: 30, rx: 4, fill: '#2b6cb0' }, this.servoG);
        this.servoBraco = el('g', { transform: `translate(${cx - 48} 296)` }, this.servoG);
        el('rect', { x: -3, y: -26, width: 6, height: 28, rx: 3, fill: '#fff', stroke: '#333', 'stroke-width': 1.5 }, this.servoBraco);
        el('circle', { cx: 0, cy: 0, r: 5, fill: '#ddd', stroke: '#333' }, this.servoBraco);
        this._servoBase = `translate(${cx - 48} 296)`;
      }
      this.servoG.setAttribute('opacity', 1);
      this.servoBraco.setAttribute('transform', `${this._servoBase} rotate(${a - 90})`);
    }
    registar(nome, v) {
      if (!this.tabela) return;
      this.dados.push([nome, v]);
      if (this.dados.length > 6) this.dados.shift();
      this.tabela.hidden = false;
      this.tabela.innerHTML = '<caption>Dados registados</caption>' +
        this.dados.map(([n, x]) => `<tr><td>${String(n).replace(/[<&]/g, '')}</td><td>${Math.round(x * 100) / 100}</td></tr>`).join('');
    }
    // ---- controlos dos sensores (só aparecem os que o desafio usa)
    criarControlos(host) {
      const caixa = document.createElement('div');
      caixa.className = 'sim-sensores';
      host.appendChild(caixa);
      this.dados = [];
      this.tabela = document.createElement('table');
      this.tabela.className = 'sim-dados'; this.tabela.hidden = true;
      host.appendChild(this.tabela);
      this.ctrl = {};
      const enviar = (k, v) => {   // avisa o motor (no máximo de 250 em 250 ms enquanto se arrasta)
        clearTimeout(this._envio);
        const agora = performance.now();
        if (!this._ultimoEnvio || agora - this._ultimoEnvio > 250) { this._ultimoEnvio = agora; this.onInput(k + ':' + v); }
        else this._envio = setTimeout(() => { this._ultimoEnvio = performance.now(); this.onInput(k + ':' + v); }, 250);
      };
      const slider = (k, rotulo, min, max, unidade = '') => {
        const l = document.createElement('label'); l.className = 'sim-slider';
        l.innerHTML = `<span>${rotulo}</span><input type="range" min="${min}" max="${max}" value="${this.sensores[k]}"><output>${this.sensores[k]}${unidade}</output>`;
        const i = l.querySelector('input'), o = l.querySelector('output');
        i.addEventListener('input', () => { this.sensores[k] = Number(i.value); o.textContent = i.value + unidade; enviar(k, i.value); });
        caixa.appendChild(l);
        this.ctrl[k] = l;
        l.definir = v => { i.value = v; o.textContent = v + unidade; };
      };
      const botao = (k, rotulo, fn) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-sim btn-sensor'; b.textContent = rotulo;
        b.addEventListener('click', () => { audio(); fn(b); });
        caixa.appendChild(b); this.ctrl[k] = b;
      };
      slider('luz', 'Luz', 0, 255);
      slider('som', 'Som', 0, 255);
      botao('palmas', 'Bater palmas', () => {
        const antes = this.sensores.som; this.sensores.som = 230;
        this.ctrl.som.definir(230); this.onInput('somalto');
        setTimeout(() => { this.sensores.som = antes; this.ctrl.som.definir(antes); }, 600);
      });
      slider('temperatura', 'Temperatura', -5, 50, '°C');
      for (const p of ['P0', 'P1', 'P2']) {
        slider('analogico:' + p, 'Pin ' + p.slice(1) + ' (analógico)', 0, 1023);
        botao('digital:' + p, 'Pin ' + p.slice(1) + ': aberto', b => {
          const v = this.sensores['digital:' + p] ? 0 : 1;
          this.sensores['digital:' + p] = v;
          b.textContent = 'Pin ' + p.slice(1) + (v ? ': fechado' : ': aberto');
          b.setAttribute('aria-pressed', String(!!v));
          this.onInput('digital:' + p + ':' + v);
        });
      }
      for (const [g, rotulo] of [['left', '↶ Inclinar esq.'], ['right', 'Inclinar dir. ↷'], ['face down', 'Virar ao contrário'], ['face up', 'Ecrã para cima'],
        ['up', 'Logotipo para cima'], ['down', 'Logotipo para baixo'], ['freefall', 'Deixar cair']]) {
        botao('gesto:' + g, rotulo, () => this.onInput('gesto:' + g));
      }
      this.controlos([]);
    }
    // lista de controlos a mostrar: 'luz', 'som', 'palmas', 'temperatura', 'analogico:P1', 'digital:P0', 'gesto:left'…
    controlos(lista) {
      const ver = new Set(lista);
      for (const [k, e] of Object.entries(this.ctrl)) e.hidden = !ver.has(k);
      this.svg.parentNode.querySelector('.sim-sensores').hidden = lista.length === 0;
    }
    definirSensor(k, v) { this.sensores[k] = v; if (this.ctrl[k] && this.ctrl[k].definir) this.ctrl[k].definir(v); }
    tocarSom(nome) {
      this.pulsarSom();
      return (SONS[nome] || SONS.giggle)();
    }
    tom(freq, ms) { this.pulsarSom(ms); beep(freq, ms); }
    pulsarSom(ms = 500) {
      this.som.setAttribute('opacity', 1);
      clearTimeout(this._som);
      this._som = setTimeout(() => this.som.setAttribute('opacity', 0), ms);
    }
    digital(pino, v) {
      this.pinos[pino] = v;
      if (pino === 'P2') {
        this.ledFora.setAttribute('opacity', 1);
        this.ledBolbo.setAttribute('fill', v ? '#ff3b3b' : '#5a1a1a');
        this.ledBolbo.setAttribute('filter', v ? 'drop-shadow(0 0 8px #ff3b3b)' : '');
      }
      if (this.padP[pino]) this.padP[pino].setAttribute('fill', v ? '#ffe27a' : '#c9a227');
    }
    reset() {
      this.limpar();
      if (this.servoG) this.servoG.setAttribute('opacity', 0.35);
      this.dados = []; if (this.tabela) { this.tabela.hidden = true; this.tabela.innerHTML = ''; }
      this.ledFora.setAttribute('opacity', 0);
      this.ledBolbo.setAttribute('fill', '#5a1a1a');
      for (const p in this.padP) this.padP[p].setAttribute('fill', '#c9a227');
    }
    agitar() {
      this.svg.classList.remove('a-agitar'); void this.svg.getBBox();
      this.svg.classList.add('a-agitar');
      this.onInput('agitar');
    }
  }

  F.Sim = Sim;
  F.audio = audio;
})();
