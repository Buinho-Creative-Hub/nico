/* Nico — service worker (gerado por ferramentas/gerar-sw.py; não editar à mão).
 * Depois de abrir o nico.buinho.pt uma vez com internet, o Nico fica todo guardado no browser e funciona sem rede.
 * Com internet vai sempre buscar a versão mais recente (rede primeiro); sem internet usa a cópia guardada. */
const VERSAO = 'nico-__VERSAO__';
const FICHEIROS = __FICHEIROS__;

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSAO).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n.startsWith('nico-') && n !== VERSAO).map(n => caches.delete(n))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', ev => {
  const r = ev.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return;
  ev.respondWith((async () => {
    const cache = await caches.open(VERSAO);
    try {
      // rede primeiro, mas sem ficar à espera de uma ligação lenta na escola
      const resp = await Promise.race([fetch(r), new Promise((_, no) => setTimeout(() => no(new Error('lento')), 4000))]);
      if (resp && resp.ok) cache.put(r, resp.clone());
      return resp;
    } catch (e) {
      const guardado = await cache.match(r, { ignoreSearch: true });
      if (guardado) return guardado;
      if (r.mode === 'navigate') return cache.match('index.html');
      throw e;
    }
  })());
});
