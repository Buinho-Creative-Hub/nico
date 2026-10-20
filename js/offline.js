/* Nico sem internet: regista o service worker (sw.js) quando aberto pelo site (nico.buinho.pt).
 * Aberto a partir da pasta (Abrir Nico.bat, file://) já funciona offline e não precisa disto. */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
