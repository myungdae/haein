// 강해인 시낭송교실 PWA — Service Worker
const CACHE_VERSION = 'haein-class-v2';
const STATIC_CACHE = `${CACHE_VERSION}-static`;

const PRECACHE_URLS = [
  '/',
  '/static/style.css',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k.startsWith('haein-class-') && k !== STATIC_CACHE).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // API calls: network-first, never cache mutating/dynamic admin+apply endpoints
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ ok: false, offline: true }), {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      }))
    );
    return;
  }

  // Static assets (images/icons/css): cache-first
  if (
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname.startsWith('/static/')
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          const clone = res.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return res;
        });
      })
    );
    return;
  }

  // Navigation / HTML: network-first with offline fallback
  event.respondWith(
    fetch(request)
      .then((res) => {
        const clone = res.clone();
        caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
        return res;
      })
      .catch(() =>
        caches.match(request).then((cached) => cached || caches.match('/offline.html'))
      )
  );
});
