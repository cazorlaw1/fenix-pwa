const CACHE_NAME = 'fenix-v1';

// Instalación limpia del Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Fuerza la activación inmediata para evitar bloqueos
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptación ligera de red para no bloquear la app
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});