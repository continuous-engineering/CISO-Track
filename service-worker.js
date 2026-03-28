/* =============================================
   SERVICE WORKER — CISO CERT TRACK
   Offline-first: cache all pages on install.
   ============================================= */

const CACHE = 'ciso-cert-v1';

// All pages to pre-cache on install
const PRECACHE = [
  '/',
  '/index.html',
  '/schedule.html',
  '/assets/css/style.css',
  '/assets/js/app.js',
  '/assets/js/db.js',
  '/assets/js/flashcards.js',
  '/assets/js/quiz.js',

  // CISM
  '/cism/index.html',
  '/cism/domain1/index.html',
  '/cism/domain1/flashcards.html',
  '/cism/domain1/quiz.html',
  '/cism/domain2/index.html',
  '/cism/domain2/flashcards.html',
  '/cism/domain2/quiz.html',
  '/cism/domain3/index.html',
  '/cism/domain3/flashcards.html',
  '/cism/domain3/quiz.html',
  '/cism/domain4/index.html',
  '/cism/domain4/flashcards.html',
  '/cism/domain4/quiz.html',

  // Shared concepts
  '/shared/risk-management.html',
  '/shared/governance-frameworks.html',
  '/shared/incident-response.html',
  '/shared/bcp-dr.html',
  '/shared/access-management.html',
  '/shared/data-classification.html',
  '/shared/third-party-risk.html',
  '/shared/security-awareness.html',
  '/shared/cryptography.html',
  '/shared/network-security.html',

  // CISM topic pages
  '/cism/domain1/01-governance-vs-management.html',
  '/cism/domain1/02-security-strategy.html',
  '/cism/domain1/03-policy-hierarchy.html',
  '/cism/domain1/04-organizational-structure.html',
  '/cism/domain1/05-metrics-reporting.html',
  '/cism/domain1/06-maturity-models.html',
  '/cism/domain1/07-legal-regulatory.html',

  '/cism/domain2/01-risk-fundamentals.html',
  '/cism/domain2/02-risk-assessment.html',
  '/cism/domain2/03-quantitative-analysis.html',
  '/cism/domain2/04-risk-treatment.html',
  '/cism/domain2/05-controls.html',
  '/cism/domain2/06-risk-monitoring.html',
  '/cism/domain2/07-threat-intelligence.html',
  '/cism/domain2/08-vulnerability-management.html',

  '/cism/domain3/01-program-framework.html',
  '/cism/domain3/02-asset-classification.html',
  '/cism/domain3/03-controls-design.html',
  '/cism/domain3/04-vendor-management.html',
  '/cism/domain3/05-awareness-training.html',
  '/cism/domain3/06-program-metrics.html',

  '/cism/domain4/01-incident-lifecycle.html',
  '/cism/domain4/02-incident-classification.html',
  '/cism/domain4/03-response-operations.html',
  '/cism/domain4/04-forensics-evidence.html',
  '/cism/domain4/05-bcp-drp.html',
  '/cism/domain4/06-crisis-communications.html',

  // CCSK
  '/ccsk/index.html',
  '/ccsk/01-cloud-concepts.html',
  '/ccsk/02-governance.html',
  '/ccsk/03-risk-audit-compliance.html',
  '/ccsk/04-org-management.html',
  '/ccsk/05-iam.html',
  '/ccsk/06-security-monitoring.html',
  '/ccsk/07-infrastructure-networking.html',
  '/ccsk/08-workload-security.html',
  '/ccsk/09-data-security.html',
  '/ccsk/10-application-security.html',
  '/ccsk/11-incident-response.html',
  '/ccsk/12-related-technologies.html',
  '/ccsk/flashcards.html',
  '/ccsk/quiz.html',

  // COBIT
  '/cobit/index.html',
  '/cobit/01-framework-intro.html',
  '/cobit/02-principles.html',
  '/cobit/03-governance-system.html',
  '/cobit/04-edm-objectives.html',
  '/cobit/05-management-objectives.html',
  '/cobit/06-design-factors.html',
  '/cobit/07-implementation.html',
  '/cobit/flashcards.html',
  '/cobit/quiz.html',

  // CISSP
  '/cissp/index.html',
  '/cissp/d1-security-risk-management.html',
  '/cissp/d2-asset-security.html',
  '/cissp/d3-security-architecture.html',
  '/cissp/d3-cryptography.html',
  '/cissp/d4-network-security.html',
  '/cissp/d5-iam.html',
  '/cissp/d6-security-assessment.html',
  '/cissp/d7-security-operations.html',
  '/cissp/d8-software-security.html',
  '/cissp/flashcards.html',
  '/cissp/quiz.html',
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

// Cache-first strategy: serve from cache, fall back to network, cache new responses
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200) return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return resp;
      });
    })
  );
});
