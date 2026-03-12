// Body Alignment Malmesbury — Service Worker
// Provides basic offline caching for PWA support

const CACHE_NAME = 'body-alignment-v1';
const ASSETS_TO_CACHE = [
  '/Body_Alignment/',
  '/Body_Alignment/index.html',
  '/Body_Alignment/manifest.json',
  'https://leemcq.github.io/logo.jpg',
  'https://leemcq.github.io/n.jpg',
  'https://leemcq.github.io/4.png',
  'https://leemcq.github.io/15-480x480.png',
  'https://leemcq.github.io/16-480x480.png',
  'https://leemcq.github.io/14-480x480.png',
  'https://leemcq.github.io/spine-white-copy-300x300.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@300;400;500&display=swap'
];

// Install — cache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate — clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first for assets, network-first for HTML
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const isHTML = event.request.headers.get('accept')?.includes('text/html');

  if (isHTML) {
    // Network-first for pages
    event.respondWith(
      fetch(event.request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => caches.match(event.request))
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
          return res;
        });
      })
    );
  }
});
