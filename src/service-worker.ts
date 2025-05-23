/// <reference lib="webworker" />

const CACHE_NAME = 'neurolink-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/hub-96.png',
  '/screenshots/hub.png'
];

// Instalación del Service Worker
self.addEventListener('install', (event: ExtendableMessageEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event: ExtendableMessageEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Estrategia de caché: Network First, fallback a caché
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la respuesta es exitosa, actualizar la caché
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla la red, intentar servir desde caché
        return caches.match(event.request).then((response) => {
          if (response) {
            return response;
          }
          // Si no está en caché, mostrar página offline
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('', {
            status: 408,
            statusText: 'Request timed out.'
          });
        });
      })
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event: PushEvent) => {
  const options = {
    body: event.data?.text() ?? 'Nueva notificación de NeuroLink AI',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver más',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Cerrar',
        icon: '/icons/close.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NeuroLink AI', options)
  );
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/hub')
    );
  }
}); 