self.addEventListener('install', (event) => {
  console.log('Service Worker: Instalado');
});

self.addEventListener('fetch', (event) => {
  // Apenas passa as requisições, mas é necessário para o PWA
  event.respondWith(fetch(event.request));
});
