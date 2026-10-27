/* IC Sensing Lab — línguas (EN · SR · ES · PT).
 *
 * Corre no <head>, logo a seguir a escolha.js, antes de tudo o resto.
 *   ?l=sr            escolhe a língua (fica lembrada no browser)
 *   F.LANG           'en' | 'sr' | 'es' | 'pt'
 *   F.t(x)           x = 'texto' (igual em todas) ou { en, sr, es, pt } → texto na língua escolhida (EN por defeito)
 *   F.s(chave, v)    texto da interface (i18n/ui.js), com {nome} substituído pelos valores de v
 *   F.localizar(o)   percorre um objeto (missão, mascote) e troca cada { en, sr, es, pt } pelo texto da língua
 *   F.aplicarI18n()  textos do HTML com data-i18n="chave" (texto), data-i18n-title, data-i18n-aria, data-i18n-html
 *
 * Tradução automática feita pelo Pacheco (Out 2026), a rever por falantes nativos dos parceiros (SR: escola Veljko;
 * ES: FabLab Cuenca). Ao rever, mudar só os textos — as chaves ficam.
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  F.LANGS = ['en', 'sr', 'es', 'pt'];
  F.NOMES_LINGUA = { en: 'English', sr: 'Српски', es: 'Español', pt: 'Português' };
  const q = new URLSearchParams(location.search);
  const ok = v => F.LANGS.includes(v) ? v : null;
  let guardada = null;
  try { guardada = localStorage.getItem('iclab.lang'); } catch (e) {}
  const doBrowser = () => {
    const l = (navigator.languages || [navigator.language || 'en']).map(x => String(x).slice(0, 2).toLowerCase());
    return l.map(ok).find(Boolean) || null;
  };
  F.LANG = ok(q.get('l')) || ok(guardada) || doBrowser() || 'en';
  try { if (q.get('l') && ok(q.get('l'))) localStorage.setItem('iclab.lang', F.LANG); } catch (e) {}
  document.documentElement.lang = { en: 'en', sr: 'sr-Cyrl', es: 'es', pt: 'pt' }[F.LANG];

  F.escolherLingua = function (l) {
    if (!ok(l)) return;
    try { localStorage.setItem('iclab.lang', l); } catch (e) {}
    const u = new URL(location.href);
    u.searchParams.set('l', l);
    location.href = u.toString();
  };

  const eLang = o => o && typeof o === 'object' && !Array.isArray(o) && ('en' in o) && Object.keys(o).every(k => F.LANGS.includes(k));
  F.eTraducao = eLang;
  F.t = function (x) {
    if (eLang(x)) return x[F.LANG] !== undefined ? x[F.LANG] : x.en;
    return x;
  };
  F.localizar = function (o, vistos = new Set()) {
    if (eLang(o)) return F.t(o);
    if (!o || typeof o !== 'object' || vistos.has(o)) return o;
    vistos.add(o);
    if (Array.isArray(o)) { for (let i = 0; i < o.length; i++) o[i] = F.localizar(o[i], vistos); return o; }
    for (const k of Object.keys(o)) if (typeof o[k] !== 'function') o[k] = F.localizar(o[k], vistos);
    return o;
  };
  F.UI = F.UI || {};
  F.s = function (chave, v) {
    let t = F.t(F.UI[chave]);
    if (t === undefined) { console.warn('i18n: falta', chave); t = chave; }
    if (v) t = String(t).replace(/\{(\w+)\}/g, (m, k) => (v[k] !== undefined ? v[k] : m));
    return t;
  };
  F.aplicarI18n = function (raiz = document) {
    raiz.querySelectorAll('[data-i18n]').forEach(e => { e.textContent = F.s(e.dataset.i18n); });
    raiz.querySelectorAll('[data-i18n-html]').forEach(e => { e.innerHTML = F.s(e.dataset.i18nHtml); });
    raiz.querySelectorAll('[data-i18n-title]').forEach(e => { e.title = F.s(e.dataset.i18nTitle); });
    raiz.querySelectorAll('[data-i18n-aria]').forEach(e => { e.setAttribute('aria-label', F.s(e.dataset.i18nAria)); });
    // voltar ao site do projeto, na mesma língua (no site do IC fica no mesmo domínio; nos testes leva ao site a sério)
    const noSite = /invisiblecartographies\.eu$/.test(location.hostname);
    raiz.querySelectorAll('[data-site-ic]').forEach(e => { e.href = (noSite ? '/' : 'https://invisiblecartographies.eu/') + (F.LANG === 'en' ? '' : F.LANG + '/'); });
  };
  // seletor de língua: <div data-linguas></div>
  F.desenharLinguas = function () {
    document.querySelectorAll('[data-linguas]').forEach(caixa => {
      caixa.innerHTML = '';
      const s = document.createElement('select');
      s.className = 'sel-lingua';
      s.setAttribute('aria-label', F.s('lingua'));
      for (const l of F.LANGS) {
        const o = document.createElement('option');
        o.value = l; o.textContent = F.NOMES_LINGUA[l]; o.selected = l === F.LANG;
        s.appendChild(o);
      }
      s.addEventListener('change', () => F.escolherLingua(s.value));
      caixa.appendChild(s);
    });
  };
})();
