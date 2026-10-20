/* IC Sensing Lab sem internet: regista o service worker (sw.js) quando aberto pelo site.
 * Aberto a partir da pasta (Open IC Sensing Lab.bat, file://) já funciona offline e não precisa disto. */
if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('sw.js').catch(() => {}); });
}
