const CACHE_NAME = 'psicohabitat';
// Archivos necesarios para la funcion offline
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/style/base.css',
    '/js/script.js',
    '/advice/Apps.json',
    '/advice/advices.json',
    '/manifest.json',           // Añadido
    '/img/icon.png',            // Corregido (antes assets/logo)
    '/img/fondo.jpg',           // Añadido para el juego
    '/img/add.svg',             // Añadido para iOS
    '/img/share.svg'            // Añadido para iOS
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
      console.log(cachedResponse ? 'Cache hit: ' + event.request.url : 'Cache miss: ' + event.request.url);
      return cachedResponse || fetch(event.request);
    })
  );
});