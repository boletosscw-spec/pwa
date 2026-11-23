const CACHE_NAME = 'primal-echo-v38';
const OFFLINE_URL = '/offline/';
const CORE = [OFFLINE_URL, '/static/game/echo.css?v=38', '/static/game/echo.js?v=36', '/static/game/art/icon-192.png', '/static/game/art/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('primal-echo-') && key !== CACHE_NAME).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // Never store personal pages or authentication responses in the static cache.
    event.respondWith(fetch(request).catch(async () => (await caches.match(OFFLINE_URL)) || new Response('Sin conexión', {headers: {'Content-Type': 'text/plain; charset=utf-8'}})));
    return;
  }
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(caches.match(request).then(async cached => {
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) { const cache = await caches.open(CACHE_NAME); await cache.put(request, response.clone()); }
      return response;
    }));
  }
});
