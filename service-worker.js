/* =============================================
   SERVICE WORKER — Cert Study Guides
   Cache-first. Normalizes CF Pretty URL paths
   (strips .html so cache keys match redirected URLs).
   API calls (/api/*) are never cached.
   ============================================= */

const CACHE = 'cert-study-guides-v7';

/**
 * Normalize a URL to its Cloudflare Pretty URL form.
 * CF redirects /foo.html → /foo, so we strip .html from pathnames
 * to ensure cache keys match the final URL after redirect.
 * .js, .css, .json, and root paths are returned as-is.
 */
function cacheKey(url) {
  const u = new URL(url);
  u.search = '';
  u.hash = '';
  if (u.pathname.endsWith('.html')) {
    u.pathname = u.pathname.slice(0, -5);
  }
  return u.toString();
}

// Extensionless paths for HTML pages (matches CF Pretty URL redirect targets).
// .js, .css, .json keep their extensions — CF does not redirect those.
const PRECACHE = [
  '/',
  '/login',
  '/schedule',
  '/settings',
  '/share',
  '/exam-dates',
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
  '/cism',
  '/cism/domain1',
  '/cism/domain1/flashcards',
  '/cism/domain1/quiz',
  '/cism/domain2',
  '/cism/domain2/quiz',
  '/cism/domain3',
  '/cism/domain3/flashcards',
  '/cism/domain3/quiz',
  '/cism/domain4',
  '/cism/domain4/flashcards',
  '/cism/domain4/quiz',

  // Shared concepts
  '/shared/risk-management',
  '/shared/governance-frameworks',
  '/shared/incident-response',
  '/shared/bcp-dr',

  // CCSK
  '/ccsk',
  '/ccsk/01-cloud-concepts',
  '/ccsk/05-iam',
  '/ccsk/09-data-security',

  // COBIT
  '/cobit',
  '/cobit/01-framework-intro',
  '/cobit/02-principles',

  // CISSP
  '/cissp',

  // Cloud certs
  '/aws-security',
  '/azure-security',
  '/gcp-security',
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

// Cache-first: serve from cache using normalized key, fall back to network,
// lazily cache new resources. API calls are passed through without caching.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Never intercept API calls — let them hit the network directly.
  const url = new URL(e.request.url);
  if (url.pathname.startsWith('/api/')) return;

  const key = cacheKey(e.request.url);

  e.respondWith(
    caches.open(CACHE).then(cache =>
      cache.match(key).then(cached => {
        if (cached) return cached;
        return fetch(e.request.url).then(resp => {
          // If CF redirected (e.g. /index → /), re-fetch the final URL.
          // Returning a redirected response to a navigate request fails with
          // "redirect mode is not follow".
          if (resp.redirected) {
            return fetch(resp.url).then(final => {
              if (final.status === 200 && final.type === 'basic') {
                cache.put(cacheKey(final.url), final.clone());
              }
              return final;
            });
          }
          if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
          cache.put(key, resp.clone());
          return resp;
        });
      })
    )
  );
});
