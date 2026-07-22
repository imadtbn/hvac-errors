
/* ============================================
   HVAC Error Codes Guide - Service Worker
   PWA Offline Support
   ============================================ */

const CACHE_NAME = 'hvac-guide-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/errors.html',
  '/error.html',
  '/brands.html',
  '/articles.html',
  '/article.html',
  '/search.html',
  '/about.html',
  '/contact.html',
  '/faq.html',
  '/privacy.html',
  '/disclaimer.html',
  '/css/style.css',
  '/js/main.js',
  '/data/brands.json',
  '/data/errors.json',
  '/data/articles.json',
  '/icons/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.warn('Some assets failed to cache:', err);
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Skip non-GET requests
  if (request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Return cached and fetch update in background
        fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, response.clone());
          });
        }).catch(() => {});
        return cached;
      }
      
      return fetch(request).then((response) => {
        // Cache successful responses
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      }).catch(() => {
        // Offline fallback for HTML pages
        if (request.headers.get('accept').includes('text/html')) {
          return caches.match('/index.html');
        }
        return new Response('Offline - No cached data available', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/plain' }
        });
      });
    })
  );
});

