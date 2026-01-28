/**
 * Service Worker für MHS Ereignisse PWA
 * Ermöglicht Offline-Funktionalität und Caching
 */

const CACHE_NAME = 'ereignisse-v1.14.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  // CSS-Dateien
  './css/base.css',
  './css/layout.css',
  './css/components.css',
  './css/table.css',
  './css/filters.css',
  './css/dialogs.css',
  './css/statusbar.css',
  './css/dark-mode.css',
  './css/calendar.css',
  './css/dashboard.css',
  // JS-Dateien
  './js/utils.js',
  './js/data.js',
  './js/filters.js',
  './js/views.js',
  './js/calendar.js',
  './js/dashboard.js',
  './js/ui.js',
  './js/app.js'
];

// Installation: Cache erstellen und Assets hinzufügen
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        // Sofort aktivieren ohne auf andere Tabs zu warten
        return self.skipWaiting();
      })
  );
});

// Aktivierung: Alte Caches löschen
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Kontrolle über alle Clients übernehmen
        return self.clients.claim();
      })
  );
});

// Fetch: Cache-First Strategie mit Network Fallback
self.addEventListener('fetch', (event) => {
  // Nur GET-Requests cachen
  if (event.request.method !== 'GET') {
    return;
  }

  // Keine externen Requests cachen
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Aus Cache liefern, aber im Hintergrund aktualisieren
          event.waitUntil(updateCache(event.request));
          return cachedResponse;
        }

        // Nicht im Cache: Vom Netzwerk laden und cachen
        return fetchAndCache(event.request);
      })
      .catch(() => {
        // Offline und nicht im Cache: Fallback für HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match('./index.html');
        }
      })
  );
});

// Hilfsfunktion: Vom Netzwerk laden und cachen
async function fetchAndCache(request) {
  const response = await fetch(request);

  // Nur erfolgreiche Responses cachen
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }

  return response;
}

// Hilfsfunktion: Cache im Hintergrund aktualisieren (Stale-While-Revalidate)
async function updateCache(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response);
    }
  } catch (error) {
    // Netzwerkfehler ignorieren (offline)
    console.log('[SW] Background update failed:', error);
  }
}

// Message Handler für manuelle Updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
