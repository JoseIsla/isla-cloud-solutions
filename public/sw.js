// Service Worker — Isla Cloud Solutions
// Stale-while-revalidate for static assets, network-only for API, offline fallback

const CACHE_NAME = 'islacloud-v2';
const STATIC_CACHE = 'islacloud-static-v2';
const API_CACHE = 'islacloud-api-v2';
const IMG_CACHE = 'islacloud-img-v2';

// Precache on install
const PRECACHE_URLS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Clean old caches on activate
self.addEventListener('activate', (event) => {
  const validCaches = [CACHE_NAME, STATIC_CACHE, API_CACHE, IMG_CACHE];
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => !validCaches.includes(k)).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and chrome-extension requests
  if (request.method !== 'GET') return;
  if (url.protocol === 'chrome-extension:') return;

  // API requests — always network-only to avoid stale CMS/admin data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request, { cache: 'no-store' }));
    return;
  }

  // Images — cache-first (long-lived, content-addressed)
  if (request.destination === 'image' || /\.(webp|jpg|jpeg|png|svg|gif|ico)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMG_CACHE));
    return;
  }

  // Static assets (JS, CSS, fonts) — stale-while-revalidate
  // This ensures new builds are picked up quickly while still serving fast from cache
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    /\.(js|css|woff2?)$/i.test(url.pathname)
  ) {
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  // Navigation (HTML) — network-first with offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      networkFirstWithTimeout(request, STATIC_CACHE, 3000).catch(() =>
        caches.match('/') || new Response('Offline', { status: 503 })
      )
    );
    return;
  }

  // Default — network with cache fallback
  event.respondWith(networkFirstWithTimeout(request, STATIC_CACHE, 5000));
});

// --- Strategies ---

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 408 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached || new Response('', { status: 408 }));

  return cached || fetchPromise;
}

async function networkFirstWithTimeout(request, cacheName, timeout) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(request, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    clearTimeout(timeoutId);
    const cached = await caches.match(request);
    if (cached) return cached;
    throw new Error('No cache available');
  }
}