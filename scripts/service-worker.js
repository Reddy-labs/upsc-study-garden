/* Values are filled by scripts/build-pwa.mjs for each production build. */
const CACHE = 'study-garden-__BUILD_VERSION__';
const ASSETS = __PRECACHE_ASSETS__;
self.addEventListener('install', (event) => {
  // A failed download leaves the previous working version active.
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(ASSETS)));
});
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith('study-garden-') && name !== CACHE) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});
self.addEventListener('message', (event) => {
  // Only switch an existing session after the user chooses to reload.
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  // Next's RSC requests are not HTML documents and must never share a cache key.
  if (request.headers.has('RSC') || url.searchParams.has('_rsc') || url.pathname.startsWith('/api/')) return;
  if (request.mode === 'navigate') {
    // Serve the app and its bundled notes from the same version as its cached JS.
    // Updates are discovered by the registration, then offered as a reload.
    event.respondWith((async () => {
      const cache = await caches.open(CACHE);
      return await cache.match('/') || await fetch(request).catch(() => cache.match('/offline.html'));
    })());
    return;
  }
  const isStatic = url.pathname.startsWith('/_next/static/');
  const isReadingAsset = /\.(png|svg|webmanifest|pdf)$/.test(url.pathname);
  if (!isStatic && !isReadingAsset) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(request);
    if (cached && isStatic) return cached;
    try {
      const response = await fetch(request);
      // Range responses cannot be stored with Cache.put (e.g. PDF viewers).
      if (response.status === 200 && response.type === 'basic') {
        try { await cache.put(request, response.clone()); } catch { /* Reading still works if storage fills up. */ }
      }
      return response;
    } catch {
      return cached || new Response('This file is not available offline yet. Reconnect and open it once.', {
        status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});
