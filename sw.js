
/**
 * SERVICE WORKER DE "AUTO-DESTRUIÇÃO" v4.5.4
 * Este arquivo limpa qualquer cache anterior e se desativa.
 * Isso garante que o navegador sempre busque o index.html novo do Vercel.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          return caches.delete(cacheName);
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Apenas busca na rede, sem cache
  event.respondWith(fetch(event.request));
});
