// Gram Panchayat Chandra — Service Worker
// Provides basic offline support by caching the app shell and static assets.
// Strategy:
//   - precache: app shell (HTML, manifest, logo)
//   - runtime: stale-while-revalidate for same-origin GET requests (JS/CSS/images)
//   - Network-first for /api/* (always try fresh, fall back to cache when offline)
//   - Bypass for non-GET and cross-origin requests

const SW_VERSION = 'gpchandra-sw-v3';
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/logo.svg',
  '/offline.html',
];

// Image cache — separate cache for WhatsApp images (larger, cache-first)
const IMAGE_CACHE = 'gpchandra-images-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SW_VERSION).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== SW_VERSION && k !== IMAGE_CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Image requests (WebP/JPG/PNG/SVG) — cache-first for fast offline loads
  if (req.destination === 'image' || /\.(webp|jpg|jpeg|png|svg|gif)$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) =>
        cache.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((res) => {
            if (res && res.status === 200) {
              cache.put(req, res.clone()).catch(() => {});
            }
            return res;
          }).catch(() => cached || new Response('', { status: 404 }));
        })
      )
    );
    return;
  }

  // API requests — network-first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(SW_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() => caches.match(req).then((cached) => cached || new Response(
          JSON.stringify({ offline: true, message: 'Offline — please reconnect.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        )))
    );
    return;
  }

  // Everything else — stale-while-revalidate, with offline fallback for navigation requests
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req)
        .then((res) => {
          // Only cache successful, basic responses
          if (res && res.status === 200 && res.type === 'basic') {
            const copy = res.clone();
            caches.open(SW_VERSION).then((c) => c.put(req, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => {
          // Navigation requests (HTML pages) — fall back to offline page
          if (req.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return cached;
        });
      return cached || fetchPromise;
    })
  );
});
