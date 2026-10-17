/* Faísca Desafios — o que a criança escolheu: a mascote (?a=) e a missão (?m=).
 *
 *   index.html                       ecrã inicial: escolher mascote e missão
 *   index.html?a=nico&m=reparar      direto aos desafios
 *   index.html?p=nico                (antigo) = ?a=nico
 *
 * A mascote escolhida fica lembrada no browser. Corre no <head> para o tema
 * (cores da mascote) estar certo antes de a página se desenhar.
 */
(function () {
  'use strict';
  const F = window.Faisca = window.Faisca || {};
  const q = new URLSearchParams(location.search);
  const ok = v => v && /^[a-z0-9-]+$/.test(v) ? v : null;
  let guardada = null;
  try { guardada = localStorage.getItem('faisca.mascote'); } catch (e) {}
  F.MASCOTE_ID = ok(q.get('a')) || ok(q.get('p')) || ok(guardada) || 'gabi';
  F.MISSAO_ID = ok(q.get('m'));
  document.documentElement.setAttribute('data-mascote', F.MASCOTE_ID);
  F.lembrarMascote = id => { try { localStorage.setItem('faisca.mascote', id); } catch (e) {} };
})();
