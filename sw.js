/* Nico — service worker (gerado por ferramentas/gerar-sw.py; não editar à mão).
 * Depois de abrir o nico.buinho.pt uma vez com internet, o Nico fica todo guardado no browser e funciona sem rede.
 * Com internet vai sempre buscar a versão mais recente (rede primeiro); sem internet usa a cópia guardada. */
const VERSAO = 'nico-d662e8305a';
const FICHEIROS = [
 "./",
 "css/faisca.css",
 "estados.html",
 "fonts/Asap-Bold_0.ttf",
 "fonts/Asap-Regular_0.ttf",
 "img/gabi/01_boas_vindas.png",
 "img/gabi/02_curiosa.png",
 "img/gabi/03_a_pensar.png",
 "img/gabi/04_surpreendida.png",
 "img/gabi/05_a_dar_uma_dica.png",
 "img/gabi/06_a_celebrar.png",
 "img/gabi/07_a_incentivar.png",
 "img/gabi/08_calma.png",
 "img/gabi-palco/01_de_pe.png",
 "img/gabi-palco/02_ola.png",
 "img/gabi-palco/03_andar_a.png",
 "img/gabi-palco/04_andar_b.png",
 "img/gabi-palco/05_a_pensar.png",
 "img/gabi-palco/06_a_apontar.png",
 "img/gabi-palco/07_a_saltar.png",
 "img/gabi-palco/08_sentada.png",
 "img/icone-192.png",
 "img/icone-512.png",
 "img/nico/01_boas_vindas.png",
 "img/nico/02_curioso.png",
 "img/nico/03_a_pensar.png",
 "img/nico/04_surpreendido.png",
 "img/nico/05_a_dar_uma_dica.png",
 "img/nico/06_a_celebrar.png",
 "img/nico/07_a_inventar.png",
 "img/nico/08_trapalhao_calmo.png",
 "index.html",
 "js/app.js",
 "js/ble.js",
 "js/blocks.js",
 "js/blocos-palco.js",
 "js/desafios.js",
 "js/escolha.js",
 "js/fonte.js",
 "js/hex.js",
 "js/inicio.js",
 "js/motor.js",
 "js/offline.js",
 "js/palco-app.js",
 "js/palco-motor.js",
 "js/palco.js",
 "js/pistas.js",
 "js/sensory-oled.js",
 "js/sim.js",
 "js/som.js",
 "js/tutor-analise.js",
 "js/tutor-motor.js",
 "js/tutor-ui.js",
 "manifest.webmanifest",
 "mascotes/gabi.js",
 "mascotes/nico.js",
 "missoes/citizen-sensing.js",
 "missoes/livre.js",
 "missoes/matematica.js",
 "missoes/natureza.js",
 "missoes/palco.js",
 "missoes/primeiros-passos.js",
 "missoes/reparar.js",
 "missoes/toy-hacking.js",
 "nico.html",
 "palco.html",
 "vendor/blockly-msg-pt.js",
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
