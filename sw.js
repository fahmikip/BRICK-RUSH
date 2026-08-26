const CACHE_NAME = 'brickrush-v3';
const ASSETS = [
  './',
  './index.html',
  './css/style.css',
  './css/menu.css',
  './css/game.css',
  './css/responsive.css',
  './js/storage.js',
  './js/seedRandom.js',
  './js/audio.js',
  './js/input.js',
  './js/events.js',
  './js/particles.js',
  './js/effects.js',
  './js/combo.js',
  './js/eventQueue.js',
  './js/juice.js',
  './js/reward.js',
  './js/ball.js',
  './js/paddle.js',
  './js/brick.js',
  './js/brickManager.js',
  './js/physics.js',
  './js/level.js',
  './js/boss.js',
  './js/bossConfig.js',
  './js/worldManager.js',
  './js/eliteManager.js',
  './js/powerups.js',
  './js/upgrades.js',
  './js/runManager.js',
  './js/upgradeManager.js',
  './js/permanentUpgradeManager.js',
  './js/buildManager.js',
  './js/unlockManager.js',
  './js/collectionManager.js',
  './js/dailyChallenge.js',
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
