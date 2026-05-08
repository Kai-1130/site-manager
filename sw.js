const CACHE_NAME = 'site-manager-cache-v1.6.1';
const urlsToCache = [
  './',
  './工地管理.html',
  './index.html',
  './logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Only cache same-origin navigation and static asset requests
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then(response => {
      // Only cache our own static resources
      var url = new URL(event.request.url);
      if (url.origin === location.origin) {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, response.clone());
          return response;
        });
      }
      return response;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
