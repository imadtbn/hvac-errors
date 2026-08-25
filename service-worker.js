/* ============================================
   HVAC Error Codes Guide - Service Worker
   PWA Offline Support
   محدث: يعمل تحت GitHub Pages subpath مع استراتيجية
   Network-first للأعطل الديناميكية
   ============================================ */

const CACHE_NAME = 'hvac-guide-v3';

// ملفات ثابتة نثبّتها مسبقاً (نستخدم مسارات نسبية لضمان العمل تحت /hvac-errors/)
const STATIC_ASSETS = [
  './',
  './index.html',
  './errors.html',
  './error.html',
  './brands.html',
  './articles.html',
  './article.html',
  './search.html',
  './about.html',
  './contact.html',
  './faq.html',
  './privacy.html',
  './disclaimer.html',
  './css/style.css',
  './js/main.js',
  './js/pwa.js',
  './data/brands.json',
  './data/errors.json',
  './icons/favicon.ico',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// صفحات HTML القابلة للعمل أوفلاين (نستخدمها كـ fallback)
const OFFLINE_PAGE = './index.html';

// Install: Cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
      .catch((err) => console.warn('Some assets failed to cache:', err))
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // تجاهل الطلبات غير GET
  if (request.method !== 'GET') return;
  const url = new URL(request.url);

  // تجاهل نطاقات خارجية (إعلانات، تحليلات، خطوط)
  if (url.origin !== self.location.origin) return;

  // صفحات HTML: network-first مع fallback أوفلاين
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(OFFLINE_PAGE).then((r) => r || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // ملفات JSON (البيانات): stale-while-revalidate
  if (url.pathname.includes('/data/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetched = fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const clone = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
            }
            return response;
          })
          .catch(() => null);
        return cached || fetched;
      })
    );
    return;
  }

  // بقية الأصول: cache-first مع تحديث في الخلفية
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        fetch(request).then((response) => {
          if (response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
        }).catch(() => {});
        return cached;
      }
      return fetch(request).catch(() => new Response('', { status: 503 }));
    })
  );
});
