/* Nico · Percurso 4.º ano — a mascote ao lado (balão, pistas em 3 níveis, ouvir o enunciado).
 *
 *   F.PC.masc.dizer(estado, texto, {dica})      estado = sprite da mascote (boas_vindas, curiosa, a_pensar, dica, celebrar, calma…)
 *   F.PC.masc.pistas(lista)                      as 3 pistas da atividade atual (o botão Ajuda sobe um nível de cada vez)
 *   F.PC.masc.ouvir(texto)                       lê em voz alta (voz pt-PT do computador, se houver)
 * A mascote ajuda sem dar a solução: a pista 1 pergunta, a 2 orienta, a 3 diz o gesto concreto.
 */
(function () {
  'use strict';
  const F = window.Faisca;
  F.PC = F.PC || {};
  const $ = id => document.getElementById(id);

  let pistas = [], nivel = 0, texto = '';
  const M = () => F.MASCOTES[F.MASCOTE_ID] || F.MASCOTES[F.ORDEM_MASCOTES[0]];
  // o texto pode ser { nico: '…', gabi: '…', _: '…' } (cada mascote fala por si)
  const daMascote = t => (t && typeof t === 'object') ? (t[M().id] || t._ || '') : (t || '');

  function img(estado) {
    const m = M();
    const s = m.sprites[estado] || m.sprites.boas_vindas;
    return m.pasta + s + '.png';
  }
  function dizer(estado, t, op = {}) {
    texto = daMascote(t);
    const b = $('balao'); if (!b) return;
    b.classList.toggle('dica', !!op.dica);
    b.innerHTML = '';
    if (op.nivel) { const n = document.createElement('span'); n.className = 'pb-nivel'; n.textContent = 'Pista ' + op.nivel + ' de 3'; b.appendChild(n); }
    b.appendChild(document.createTextNode(texto));
    const i = $('mascImg'); if (i) { i.src = img(estado); i.alt = M().nome; }
  }
  function definirPistas(lista) { pistas = (lista || []).slice(0, 3); nivel = 0; atualizarBotao(); }
  function atualizarBotao() {
    const b = $('btnAjuda'); if (!b) return;
    b.disabled = !pistas.length;
    b.textContent = !pistas.length ? 'Ajuda' : nivel >= pistas.length ? 'Ajuda (já viste todas)' : nivel ? 'Mais ajuda' : 'Ajuda';
  }
  function ajuda() {
    if (!pistas.length) { dizer('curiosa', 'Lê com calma o que se pede. Estou aqui!'); return; }
    const k = Math.min(nivel, pistas.length - 1);
    dizer(k === 0 ? 'curiosa' : 'dica', pistas[k], { dica: true, nivel: k + 1 });
    if (F.Som) F.Som.tocar('ajuda');
    nivel = Math.min(nivel + 1, pistas.length);
    atualizarBotao();
    if (F.PC.registarAjuda) F.PC.registarAjuda(k + 1);
  }
  // voz do computador (pt-PT se existir); sem voz instalada, o botão avisa
  function ouvir(t) {
    const fala = String(t || '').replace(/\s+/g, ' ').trim();
    if (!fala) return;
    if (!('speechSynthesis' in window)) { dizer('a_pensar', 'Este computador não tem voz. Pede ajuda ao professor para ler.'); return; }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(fala);
    u.lang = 'pt-PT'; u.rate = 0.92;
    const v = speechSynthesis.getVoices().find(x => /pt-PT/i.test(x.lang)) || speechSynthesis.getVoices().find(x => /^pt/i.test(x.lang));
    if (v) u.voice = v;
    speechSynthesis.speak(u);
  }

  document.addEventListener('DOMContentLoaded', () => {
    const b = $('btnAjuda'); if (b) b.addEventListener('click', ajuda);
  });
  F.PC.masc = { dizer, pistas: definirPistas, ajuda, ouvir, img, daMascote, mascote: M };
})();
