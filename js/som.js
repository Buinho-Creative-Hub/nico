/* Faísca Desafios — música de fundo e efeitos sonoros.
 *
 * Tudo sintetizado com Web Audio: zero ficheiros, funciona offline e em file://.
 *   F.Som.tocar('encaixe'|'apanhar'|'apagar'|'sucesso'|'nivel'|'ajuda'|'voz'|'clique')
 *   F.Som.musica(true|false) · F.Som.efeitos(true|false)  — lembrados no browser
 *   F.Som.abafar(ms)  baixa a música enquanto o micro:bit do ecrã toca (para se ouvir o programa)
 * A música só começa depois do primeiro clique (regra dos browsers) e pára quando o separador
 * fica escondido. Cada mascote tem o seu tema (mascote.som.musica) e o seu tom de voz (mascote.som.voz).
 */
(function () {
  'use strict';
  const F = window.Faisca;

  const ler = (k, def) => { try { const v = localStorage.getItem(k); return v === null ? def : v === '1'; } catch (e) { return def; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, v ? '1' : '0'); } catch (e) {} };

  let ctx = null, gMusica = null, gEfeitos = null;
  let musicaOn = ler('faisca.som.musica', true);
  let efeitosOn = ler('faisca.som.efeitos', true);
  let comecou = false;
  const VOL_MUSICA = 0.07, VOL_EFEITOS = 0.35;

  function ligar() {
    if (ctx) return ctx;
    ctx = F.audio();                        // o mesmo AudioContext do micro:bit do ecrã
    gMusica = ctx.createGain(); gMusica.gain.value = musicaOn ? VOL_MUSICA : 0; gMusica.connect(ctx.destination);
    gEfeitos = ctx.createGain(); gEfeitos.gain.value = efeitosOn ? VOL_EFEITOS : 0; gEfeitos.connect(ctx.destination);
    return ctx;
  }
  const hz = midi => 440 * Math.pow(2, (midi - 69) / 12);

  // nota com envelope simples; destino = música ou efeitos
  function nota(dest, f, t, dur, { tipo = 'triangle', vol = 0.5, ataque = 0.008, ate = null, filtro = null } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = tipo;
    o.frequency.setValueAtTime(f, t);
    if (ate) o.frequency.exponentialRampToValueAtTime(ate, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + ataque);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    let saida = g;
    if (filtro) { const fl = ctx.createBiquadFilter(); fl.type = 'lowpass'; fl.frequency.value = filtro; g.connect(fl); saida = fl; }
    o.connect(g); saida.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }
  let ruidoBuf = null;
  function ruido(dest, t, dur, vol, passaAlto = 6000) {
    if (!ruidoBuf) {
      ruidoBuf = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
      const d = ruidoBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource(), g = ctx.createGain(), fl = ctx.createBiquadFilter();
    s.buffer = ruidoBuf; fl.type = 'highpass'; fl.frequency.value = passaAlto;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(fl).connect(g).connect(dest); s.start(t); s.stop(t + dur + 0.02);
  }

  // ------------------------------------------------------------ efeitos
  const EFEITOS = {
    // peça a encaixar: o «clique» duplo do MakeCode/Scratch
    encaixe: t => { nota(gEfeitos, 1500, t, 0.05, { vol: 0.45 }); nota(gEfeitos, 2100, t + 0.035, 0.06, { vol: 0.35 }); ruido(gEfeitos, t, 0.03, 0.15); },
    apanhar: t => nota(gEfeitos, 520, t, 0.08, { tipo: 'sine', vol: 0.4, ate: 820 }),
    apagar: t => nota(gEfeitos, 480, t, 0.2, { vol: 0.35, ate: 110 }),
    clique: t => nota(gEfeitos, 950, t, 0.03, { tipo: 'sine', vol: 0.25 }),
    ajuda: t => { nota(gEfeitos, hz(81), t, 0.18, { tipo: 'sine', vol: 0.3 }); nota(gEfeitos, hz(88), t + 0.09, 0.3, { tipo: 'sine', vol: 0.25 }); },
    voz: t => {
      const b = (F.MASCOTE && F.MASCOTE.som && F.MASCOTE.som.voz) || 440;
      nota(gEfeitos, b, t, 0.07, { tipo: 'sine', vol: 0.25 }); nota(gEfeitos, b * 1.26, t + 0.07, 0.09, { tipo: 'sine', vol: 0.22 });
    },
    nivel: t => [72, 79, 84].forEach((m, i) => nota(gEfeitos, hz(m), t + i * 0.08, 0.25, { vol: 0.35 })),
    sucesso: t => {
      [72, 76, 79, 84].forEach((m, i) => nota(gEfeitos, hz(m), t + i * 0.09, 0.22, { tipo: 'square', vol: 0.18, filtro: 3500 }));
      [76, 79, 84, 88].forEach(m => nota(gEfeitos, hz(m), t + 0.4, 0.9, { vol: 0.16 }));
      for (let i = 0; i < 6; i++) nota(gEfeitos, hz(96 + (i % 3) * 3), t + 0.45 + i * 0.07, 0.12, { tipo: 'sine', vol: 0.08 });
    },
  };

  // ------------------------------------------------------------ música
  // 8 compassos de 8 colcheias; 0 = pausa. Acordes: nota base do baixo por compasso.
  const TEMAS = {
    // Nico: alegre e saltitão, em Sol (G D Em C G D C D)
    nico: {
      bpm: 116, lead: { tipo: 'square', vol: 0.22, filtro: 2200, dur: 0.16 }, baixo: [55, 50, 52, 48, 55, 50, 48, 50],
      padraoBaixo: [1, 0, 0, 0, 5, 0, 0, 0], chocalho: [0, 0, 1, 0, 0, 0, 1, 0],
      melodia: [
        67, 71, 74, 71, 79, 0, 74, 0,   74, 0, 78, 76, 74, 72, 71, 0,
        71, 74, 76, 74, 79, 76, 74, 0,  72, 74, 76, 79, 76, 74, 72, 0,
        67, 71, 74, 79, 78, 79, 74, 0,  78, 76, 74, 76, 78, 0, 74, 0,
        76, 74, 72, 71, 69, 71, 72, 0,  74, 0, 71, 0, 69, 0, 66, 0,
      ],
    },
    // Gabi: balanço calmo, quase bossa, em Dó (C Am Dm G)
    gabi: {
      bpm: 96, lead: { tipo: 'sine', vol: 0.32, dur: 0.3 }, baixo: [48, 45, 50, 43, 48, 45, 50, 43],
      padraoBaixo: [1, 0, 0, 5, 5, 0, 0, 1], chocalho: [1, 1, 1, 1, 1, 1, 1, 1],
      melodia: [
        76, 0, 0, 79, 0, 76, 74, 0,   72, 0, 0, 76, 0, 72, 69, 0,
        74, 0, 77, 0, 76, 74, 72, 0,  71, 0, 74, 0, 79, 0, 0, 0,
        76, 0, 0, 79, 0, 81, 79, 0,   76, 0, 72, 0, 69, 0, 72, 0,
        74, 0, 72, 74, 0, 77, 76, 0,  74, 0, 71, 0, 67, 0, 0, 0,
      ],
    },
  };
  let passo = 0, proxima = 0, relogio = null;
  function agendar() {
    const T = TEMAS[(F.MASCOTE && F.MASCOTE.som && F.MASCOTE.som.musica) || 'gabi'] || TEMAS.gabi;
    const col = 60 / T.bpm / 2;
    while (proxima < ctx.currentTime + 0.25) {
      const k = passo % 64, c = Math.floor(k / 8), p = k % 8;
      const m = T.melodia[k];
      if (m) nota(gMusica, hz(m), proxima, T.lead.dur, { tipo: T.lead.tipo, vol: T.lead.vol, filtro: T.lead.filtro });
      const pb = T.padraoBaixo[p];
      if (pb) nota(gMusica, hz(T.baixo[c] + (pb === 5 ? 7 : 0)), proxima, col * 1.6, { tipo: 'triangle', vol: 0.5, filtro: 900 });
      if (T.chocalho[p]) ruido(gMusica, proxima, 0.04, p % 2 ? 0.06 : 0.1, 7000);
      passo++; proxima += col;
    }
  }
  function tocarMusica() {
    if (!comecou || !musicaOn || relogio || document.hidden) return;
    ligar();
    proxima = ctx.currentTime + 0.1;
    relogio = setInterval(agendar, 60);
  }
  function pararMusica() { clearInterval(relogio); relogio = null; }

  // ------------------------------------------------------------ API
  F.Som = {
    tocar(nome) {
      if (!efeitosOn || !comecou || !EFEITOS[nome]) return;
      try { ligar(); EFEITOS[nome](ctx.currentTime + 0.01); } catch (e) { /* sem som: segue */ }
    },
    musica(on) {
      musicaOn = on; gravar('faisca.som.musica', on);
      if (gMusica) gMusica.gain.setTargetAtTime(on ? VOL_MUSICA : 0, ctx.currentTime, 0.1);
      if (on) tocarMusica(); else pararMusica();
    },
    efeitos(on) {
      efeitosOn = on; gravar('faisca.som.efeitos', on);
      if (gEfeitos) gEfeitos.gain.value = on ? VOL_EFEITOS : 0;
    },
    get musicaLigada() { return musicaOn; },
    get efeitosLigados() { return efeitosOn; },
    abafar(ms) {
      if (!gMusica || !musicaOn) return;
      const t = ctx.currentTime;
      gMusica.gain.cancelScheduledValues(t);
      gMusica.gain.setTargetAtTime(0.008, t, 0.03);
      gMusica.gain.setTargetAtTime(VOL_MUSICA, t + ms / 1000 + 0.3, 0.4);
    },
  };

  // começa no primeiro gesto da criança (os browsers não deixam tocar antes)
  const arrancar = () => {
    if (comecou) return;
    comecou = true;
    try { ligar(); tocarMusica(); } catch (e) {}
  };
  document.addEventListener('pointerdown', arrancar, true);
  document.addEventListener('keydown', arrancar, true);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pararMusica(); else tocarMusica(); });
})();
