const CACHE_NAME = 'psicohabitat';
// Archivos necesarios para la funcion offline
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/app.js',
  '/advice/Apps.json',
  '/advice/advices.json',
  '/assets/logo.png',
  '/offline.html' // Una página por si algo falla
];

// 1. Instalación: Guardar todo en local
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// 2. Priorisamos el offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // El cache existe, de lo contrario, ir a internet
      return cachedResponse || fetch(event.request);
    })
  );
});