/* IC Sensing Lab — service worker (gerado por ferramentas/gerar-sw.py; não editar à mão).
 * Depois de abrir a plataforma uma vez com internet, fica todo guardado no browser e funciona sem rede.
 * Com internet vai sempre buscar a versão mais recente (rede primeiro); sem internet usa a cópia guardada. */
const VERSAO = 'iclab-c0eeffa2ee';
const FICHEIROS = [
 "./",
 "css/faisca.css",
 "css/ic.css",
 "css/professor.css",
 "educadores.html",
 "fonts/roboto-cyrillic-400-normal.woff2",
 "fonts/roboto-cyrillic-700-normal.woff2",
 "fonts/roboto-cyrillic-ext-400-normal.woff2",
 "fonts/roboto-cyrillic-ext-700-normal.woff2",
 "fonts/roboto-latin-400-normal.woff2",
 "fonts/roboto-latin-700-normal.woff2",
 "fonts/roboto-latin-ext-400-normal.woff2",
 "fonts/roboto-latin-ext-700-normal.woff2",
 "fonts/roboto-slab-cyrillic-700-normal.woff2",
 "fonts/roboto-slab-cyrillic-ext-700-normal.woff2",
 "fonts/roboto-slab-latin-700-normal.woff2",
 "fonts/roboto-slab-latin-ext-700-normal.woff2",
 "i18n/blocos.js",
 "i18n/educadores.js",
 "i18n/turmas.js",
 "i18n/ui.js",
 "img/capa-recurso.jpg",
 "img/eu-cofunded-mono.svg",
 "img/eu-cofunded-white.svg",
 "img/ic_lockup_horizontal.svg",
 "img/ic_lockup_horizontal_white.svg",
 "img/ic_symbol.svg",
 "img/ic_symbol_white.svg",
 "img/icone-192.png",
 "img/icone-512.png",
 "img/lio/01_boas_vindas.png",
 "img/lio/02_curiosa.png",
 "img/lio/03_a_pensar.png",
 "img/lio/04_surpreendida.png",
 "img/lio/05_a_dar_uma_dica.png",
 "img/lio/06_a_celebrar.png",
 "img/lio/07_a_incentivar.png",
 "img/lio/08_calma.png",
 "img/mo/01_boas_vindas.png",
 "img/mo/02_curiosa.png",
 "img/mo/03_a_pensar.png",
 "img/mo/04_surpreendida.png",
 "img/mo/05_a_dar_uma_dica.png",
 "img/mo/06_a_celebrar.png",
 "img/mo/07_a_incentivar.png",
 "img/mo/08_calma.png",
 "img/texture_ink_dark.svg",
 "img/texture_paper.svg",
 "index.html",
 "js/acessibilidade.js",
 "js/app.js",
 "js/ble.js",
 "js/blocks.js",
 "js/conforto.js",
 "js/desafios.js",
 "js/escolha.js",
 "js/fonte.js",
 "js/hex.js",
 "js/i18n.js",
 "js/inicio.js",
 "js/motor.js",
 "js/offline.js",
 "js/pistas.js",
 "js/professor.js",
 "js/sensory-oled.js",
 "js/sim.js",
 "js/som.js",
 "js/turma.js",
 "js/tutor-analise.js",
 "js/tutor-motor.js",
 "js/tutor-ui.js",
 "manifest.webmanifest",
 "mascotes/lio.js",
 "mascotes/mo.js",
 "missoes/_base.js",
 "missoes/calma.js",
 "missoes/detetives.js",
 "missoes/estacao.js",
 "missoes/livre.js",
 "missoes/mapa.js",
 "missoes/ouvir.js",
 "missoes/perspetivas.js",
 "missoes/sentir.js",
 "professor.html",
 "vendor/blockly-msg-en.js",
 "vendor/blockly-msg-es.js",
 "vendor/blockly-msg-pt.js",
 "vendor/blockly-msg-sr.js",
 "vendor/blockly_compressed.js",
 "vendor/media/1x1.gif",
 "vendor/media/click.mp3",
 "vendor/media/delete-icon.svg",
 "vendor/media/delete.mp3",
 "vendor/media/disconnect.mp3",
 "vendor/media/dropdown-arrow.svg",
 "vendor/media/foldout-icon.svg",
 "vendor/media/handclosed.cur",
 "vendor/media/handdelete.cur",
 "vendor/media/handopen.cur",
 "vendor/media/pilcrow.png",
 "vendor/media/quote0.png",
 "vendor/media/quote1.png",
 "vendor/media/resize-handle.svg",
 "vendor/media/sprites.png",
 "vendor/media/sprites.svg",
 "vendor/microbit-fs.js",
 "vendor/micropython-v2.js"
];

self.addEventListener('install', ev => {
  ev.waitUntil(caches.open(VERSAO).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', ev => {
  ev.waitUntil(caches.keys()
    .then(nomes => Promise.all(nomes.filter(n => n.startsWith('iclab-') && n !== VERSAO).map(n => caches.delete(n))))
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
