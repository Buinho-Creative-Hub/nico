/* IC Sensing Lab — opções de acessibilidade (interruptores), desligadas por defeito.
 *
 * A plataforma serve crianças neurotípicas e neurodivergentes, com e sem deficiência visual: cada opção liga-se
 * quando faz falta, sem mudar o resto.
 *   calmo      modo calmo: sem música nem efeitos sonoros, sem animações, cores mais suaves, a mascote só fala
 *              quando lhe pedem (as boas-vindas e as respostas à «Ajuda» mantêm-se)
 *   contraste  alto contraste: fundo escuro/claro forte, contornos grossos, foco amarelo bem visível
 *   grande     letra e blocos grandes (blocos a 140 %)
 *   voz        ler em voz alta: botões 🔊 na perspetiva, no desafio e na mascote; a mascote lê o que diz
 *
 * Corre no <head> (depois de i18n.js) para as classes estarem no <html> antes de a página se desenhar.
 * Guardado em localStorage («iclab.a11y»); a página funciona igual sem armazenamento.
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  const CHAVE = 'iclab.a11y';
  const OPCOES = ['calmo', 'contraste', 'grande', 'voz'];
  let A = {};
  try { A = JSON.parse(localStorage.getItem(CHAVE)) || {}; } catch (e) { A = {}; }
  const q = new URLSearchParams(location.search);
  if (q.get('a11y')) for (const o of q.get('a11y').split(',')) if (OPCOES.includes(o)) A[o] = true;   // ex.: ?a11y=calmo,grande
  F.A11Y = A;

  function aplicar() {
    const h = document.documentElement;
    for (const o of OPCOES) h.classList.toggle('a11y-' + o, !!A[o]);
    document.querySelectorAll('.btn-ouvir').forEach(b => { b.hidden = !A.voz || b.dataset.semTexto === '1'; });
    if (window.Blockly && F.app && F.app.ws) {
      const ws = F.app.ws;
      ws.setScale(A.grande ? 1.4 : 1);
      setTimeout(() => Blockly.svgResize(ws), 50);
    }
  }
  aplicar();

  function mudar(o, v) {
    A[o] = v;
    try { localStorage.setItem(CHAVE, JSON.stringify(A)); } catch (e) {}
    if (o === 'calmo' && F.Som) { if (v) { F.Som.musica(false); F.Som.efeitos(false); } else F.Som.efeitos(true); document.querySelectorAll('[data-sons] .btn-som').forEach(x => x.dispatchEvent(new Event('pintar'))); }
    if (o === 'voz' && !v) F.calar();
    aplicar();
    if (o === 'voz' && v) F.falar(F.s('a11y_voz_ligada'));
  }

  // ------------------------------------------------------------ ler em voz alta (Web Speech API, sem internet no Chrome/Edge com vozes do sistema)
  const LOCALE = { en: 'en', sr: 'sr', es: 'es', pt: 'pt' };
  function voz() {
    if (!('speechSynthesis' in window)) return null;
    const vs = speechSynthesis.getVoices();
    const l = LOCALE[F.LANG] || 'en';
    return vs.find(v => v.lang && v.lang.toLowerCase().startsWith(l + '-' + (l === 'pt' ? 'pt' : ''))) ||
      vs.find(v => v.lang && v.lang.toLowerCase().startsWith(l)) ||
      (l === 'sr' ? vs.find(v => /^(hr|bs|sh)/i.test(v.lang)) : null) || null;
  }
  F.vozDisponivel = () => !!voz();
  F.falar = function (texto, forcar) {
    if (!(A.voz || forcar) || !texto || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(texto).replace(/[«»]/g, ''));
      const v = voz();
      if (v) { u.voice = v; u.lang = v.lang; } else u.lang = LOCALE[F.LANG];
      u.rate = A.calmo ? 0.85 : 0.95;
      speechSynthesis.speak(u);
    } catch (e) { /* sem voz: segue em silêncio */ }
  };
  F.calar = () => { try { speechSynthesis.cancel(); } catch (e) {} };
  if ('speechSynthesis' in window) speechSynthesis.onvoiceschanged = () => {};

  // ------------------------------------------------------------ painel com os interruptores
  const ICONE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="4.2" r="2.2" fill="currentColor"/><path d="M4 8.2l8 1.6 8-1.6M12 9.8v5.2M12 15l-3.6 6M12 15l3.6 6" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  function painel() {
    document.querySelectorAll('[data-a11y]').forEach((caixa, k) => {
      caixa.innerHTML = '';
      caixa.className = 'a11y';
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'btn-a11y'; b.innerHTML = ICONE + '<span>' + F.s('a11y') + '</span>';
      b.setAttribute('aria-expanded', 'false');
      const id = 'a11yPainel' + k;
      b.setAttribute('aria-controls', id);
      const p = document.createElement('div');
      p.className = 'a11y-painel'; p.id = id; p.hidden = true; p.setAttribute('role', 'group'); p.setAttribute('aria-label', F.s('a11y'));
      p.innerHTML = '<p class="a11y-intro"></p>';
      p.querySelector('.a11y-intro').textContent = F.s('a11y_intro');
      for (const o of OPCOES) {
        const linha = document.createElement('div');
        linha.className = 'a11y-linha';
        const sw = document.createElement('button');
        sw.type = 'button'; sw.className = 'interruptor'; sw.setAttribute('role', 'switch');
        sw.setAttribute('aria-checked', String(!!A[o]));
        sw.id = id + '_' + o;
        const rot = document.createElement('label');
        rot.htmlFor = sw.id;
        rot.innerHTML = '<strong></strong><span></span>';
        rot.querySelector('strong').textContent = F.s('a11y_' + o);
        rot.querySelector('span').textContent = F.s('a11y_' + o + '_desc');
        sw.addEventListener('click', () => {
          const v = sw.getAttribute('aria-checked') !== 'true';
          document.querySelectorAll('.interruptor[id$="_' + o + '"]').forEach(x => x.setAttribute('aria-checked', String(v)));
          mudar(o, v);
        });
        linha.append(rot, sw);
        p.appendChild(linha);
      }
      if (!('speechSynthesis' in window)) {
        const n = document.createElement('p'); n.className = 'a11y-nota'; n.textContent = F.s('a11y_sem_voz'); p.appendChild(n);
      }
      b.addEventListener('click', () => {
        const abrir = p.hidden;
        document.querySelectorAll('.a11y-painel').forEach(x => { x.hidden = true; });
        document.querySelectorAll('.btn-a11y').forEach(x => x.setAttribute('aria-expanded', 'false'));
        p.hidden = !abrir; b.setAttribute('aria-expanded', String(abrir));
        if (abrir) { const s = p.querySelector('.interruptor'); if (s) s.focus(); }
      });
      caixa.append(b, p);
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.a11y-painel:not([hidden])').forEach(p => { p.hidden = true; const b = p.previousElementSibling; if (b) { b.setAttribute('aria-expanded', 'false'); b.focus(); } });
  });
  document.addEventListener('click', e => {
    if (e.target.closest('.a11y')) return;
    document.querySelectorAll('.a11y-painel').forEach(p => { p.hidden = true; });
    document.querySelectorAll('.btn-a11y').forEach(x => x.setAttribute('aria-expanded', 'false'));
  });
  function iniciar() { F.aplicarI18n(); F.desenharLinguas(); painel(); aplicar(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', iniciar); else iniciar();
  F.aplicarA11y = aplicar;
})();
