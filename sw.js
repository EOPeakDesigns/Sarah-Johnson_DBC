/**
 * Service Worker - Digital Business Card
 * Increment CACHE_NAME when static assets change.
 */
const CACHE_NAME = 'dbc-gm-v19';
const PRECACHE_URLS = [
  './',
  './index.html',
  './styles/main.css',
  './styles/modal.css',
  './styles/responsive.css',
  './scripts/app.js',
  './scripts/video-handler.js',
  './scripts/version-config.js',
  './manifest.webmanifest',
  './data/card.json',
  './data/labels.json',
  './assets/favicon-logo.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
