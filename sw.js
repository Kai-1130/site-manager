const CACHE_NAME = 'site-manager-cache-v2.1.5';
const urlsToCache = [
  './',
  './工地管理.html',
  './index.html',
  './logo.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
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

// Stale-While-Revalidate Strategy (靜默更新核心)
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 背景非同步抓取新版本更新快取
      const fetchPromise = fetch(event.request).then(networkResponse => {
        var url = new URL(event.request.url);
        // 只快取同源的靜態資源
        if (url.origin === location.origin && networkResponse.ok) {
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {
        // 斷網時靜默失敗，因為已經有 cachedResponse 墊底
        return null;
      });

      // 優先回傳快取 (秒開)，如果沒有快取才等網路
      return cachedResponse || fetchPromise;
    })
  );
});
