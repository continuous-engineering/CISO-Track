/* =============================================
   SERVICE WORKER — Cert Study Guides
   Cache-first. Only pre-cache files that exist.
   All other pages are cached lazily on first visit.
   ============================================= */

const CACHE = 'cert-study-guides-v4';

// ONLY files that actually exist right now.
// Pages not yet authored are cached lazily on first visit.
const PRECACHE = [
  '/',
  '/index.html',
  '/login.html',
  '/schedule.html',
  '/settings.html',
  '/share.html',
  '/exam-dates.html',
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/assets/js/db.js',
  '/assets/js/config.js',
  '/assets/js/lock.js',
  '/assets/js/celebrate.js',
  '/assets/js/mobile-nav.js',
  '/assets/js/flashcards.js',
  '/assets/js/quiz.js',
  '/assets/js/credcard.js',
  '/manifest.json',

  // CISM
  '/cism/index.html',
  '/cism/domain1/index.html',
  '/cism/domain1/flashcards.html',
  '/cism/domain1/quiz.html',
  '/cism/domain2/index.html',
  '/cism/domain2/quiz.html',
  '/cism/domain3/index.html',
  '/cism/domain3/flashcards.html',
  '/cism/domain3/quiz.html',
  '/cism/domain4/index.html',
  '/cism/domain4/flashcards.html',
  '/cism/domain4/quiz.html',

  // Shared concepts (only those that exist)
  '/shared/risk-management.html',
  '/shared/governance-frameworks.html',
  '/shared/incident-response.html',
  '/shared/bcp-dr.html',

  // CCSK
  '/ccsk/index.html',
  '/ccsk/01-cloud-concepts.html',
  '/ccsk/05-iam.html',
  '/ccsk/09-data-security.html',

  // COBIT
  '/cobit/index.html',
  '/cobit/01-framework-intro.html',
  '/cobit/02-principles.html',

  // CISSP
  '/cissp/index.html',

  // Cloud certs
  '/aws-security/index.html',
  '/azure-security/index.html',
  '/gcp-security/index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Cache-first: serve from cache, fall back to network, lazily cache anything new.
// Use e.request.url (string) for the network fetch so redirect:follow is the default —
// Cloudflare Pages redirects /foo.html → /foo (pretty URLs) and navigation requests
// have redirect:'manual' which causes opaqueredirect errors if we pass the Request object.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request.url).then(resp => {
        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return resp;
      });
    })
  );
});
