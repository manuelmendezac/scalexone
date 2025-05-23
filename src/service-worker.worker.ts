/// <reference lib="webworker" />

declare var self: ServiceWorkerGlobalScope;
export {};

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
self.addEventListener('install', (event) => {
  const swEvent = event as ExtendableEvent;
  swEvent.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  const swEvent = event as ExtendableEvent;
  swEvent.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))
      )
    )
  );
  (self as ServiceWorkerGlobalScope).clients.claim();
});

// Estrategia de caché: Network First, fallback a caché
self.addEventListener('fetch', (event) => {
  const fetchEvent = event as FetchEvent;
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then((response) => response || fetch(fetchEvent.request))
  );
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  const pushEvent = event as PushEvent;
  const data = pushEvent.data?.json() || {};
  const title = data.title || 'Notificación';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192.png',
    data: data.url || '/',
  };
  pushEvent.waitUntil((self as ServiceWorkerGlobalScope).registration.showNotification(title, options));
});

// Manejo de clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  const notifEvent = event as NotificationEvent;
  notifEvent.notification.close();
  const url = (notifEvent.notification.data as string) || '/';
  notifEvent.waitUntil(
    (self as ServiceWorkerGlobalScope).clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client && (client as WindowClient).url === url) {
          return (client as WindowClient).focus();
        }
      }
      return (self as ServiceWorkerGlobalScope).clients.openWindow(url);
    })
  );
}); 