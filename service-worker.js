
const CACHE_NAME = 'birdbird-v1';
const ASSETS = [
  '/', 
  '/index.html',
  '/css/variables.css','/css/base.css','/css/header.css','/css/game.css','/css/components.css','/css/ads.css','/css/footer.css','/css/sections.css',
  '/js/game-config.js','/js/audio-manager.js','/js/leaderboard.js','/js/game-engine.js','/js/ui-manager.js','/js/main.js','/js/perf-patches.js',
  '/assets/images/bird.png','/assets/images/background.png','/assets/images/foreground.png','/assets/images/pipe.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
  )));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(net => {
      const copy = net.clone();
      caches.open(CACHE_NAME).then(cache => {
        if (req.method === 'GET' && net.ok) cache.put(req, copy);
      });
      return net;
    }).catch(() => res))
  );
});
