const CACHE_NAME = 'brickrush-v1';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/menu.css',
  './css/game.css',
  './css/responsive.css',
  './js/storage.js',
  './js/audio.js',
  './js/input.js',
  './js/particles.js',
  './js/ball.js',
  './js/paddle.js',
  './js/brick.js',
  './js/physics.js',
  './js/level.js',
  './js/boss.js',
  './js/powerups.js',
  './js/upgrades.js',
  './js/ui.js',
  './js/game.js',
  './js/main.js'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(
        names.filter(function(name) {
          return name !== CACHE_NAME;
        }).map(function(name) {
          return caches.delete(name);
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(fetchResponse) {
        if (fetchResponse && fetchResponse.status === 200) {
          var responseClone = fetchResponse.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, responseClone);
          });
        }
        return fetchResponse;
      });
    }).catch(function() {
      if (event.request.destination === 'document') {
        return caches.match('./index.html');
      }
    })
  );
});
