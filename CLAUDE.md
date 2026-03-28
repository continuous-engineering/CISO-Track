# Cert Study Guides — Project Rules

## Build Commands
- Check: none (static HTML, no build step)
- Build: none
- Test: open index.html in browser via `npx serve .` or `python -m http.server 8080`
- Deploy: `git push origin main` (GitHub Pages auto-deploys from main branch root)

## Stack
Pure HTML + CSS + JavaScript. No framework, no build system, no npm. Every file is a standalone HTML page. IndexedDB for all persistence. Service Worker for offline-first caching.

## Repository
- Remote: `git@github.com:continuous-engineering/CISO-Track.git`
- GitHub Pages URL: `https://continuous-engineering.github.io/CISO-Track/`
- Branch: `main`
- Root: `/` (GitHub Pages serves from repo root)

## Architecture

### Files you touch when adding a cert or domain
**These three files must all be updated together. Forgetting any one of them breaks the experience.**

1. **`assets/js/config.js`** - The cert catalog. Add the cert to `CERT_CATALOG` with all domains, time estimates (`estimateMins`), quiz IDs (`quizId`), paths, and colors. Also add to `DEFAULT_CONFIG.selectedCerts` and `DEFAULT_CONFIG.certOrder` if it should be on by default.

2. **`assets/js/service-worker.js`** (or `service-worker.js`) - Add ALL new HTML file paths to the `PRECACHE` array so they work offline.

3. **`assets/js/mobile-nav.js`** - Add the cert to the appropriate drawer (`CLOUD_LINKS` or `MORE_LINKS`) so it appears in the mobile bottom nav.

### When adding a new cert
1. Create the HTML pages under a new directory (e.g., `newcert/index.html`, `newcert/domain1/index.html`, etc.)
2. Add the cert object to `CERT_CATALOG` in `config.js`
3. Add all new paths to the service worker PRECACHE list
4. Add to the appropriate mobile nav drawer in `mobile-nav.js`
5. Add to the Cloud dropdown in the top nav for each page (or run the `add-cloud-nav.js` pattern)
6. The schedule and settings page auto-update from config.js - no changes needed there

### When adding a new domain to an existing cert
1. Create the HTML page(s)
2. Add the domain object to the cert's `domains` array in `config.js` - include `estimateMins`, `quizId`, `path`, `quizPath`, `flashcardsPath`
3. Add the new paths to the service worker PRECACHE list
4. Lock.js automatically picks up the new domain and its quiz gate from config.js

### When adding a new topic page (not a domain)
1. Create the HTML file
2. Add to service worker PRECACHE
3. If it's a cross-cert shared page, add it to `shared/` and reference it from the relevant cert domain pages

## Key JavaScript Files

| File | Purpose |
|------|---------|
| `assets/js/db.js` | IndexedDB wrapper. All persistent state goes through here. |
| `assets/js/config.js` | Cert catalog + user config. Single source of truth for what exists. |
| `assets/js/app.js` | Page tracking, scroll analytics, nav state, dashboard stats, Cloud dropdown toggle. |
| `assets/js/lock.js` | Grays out locked domain links based on quiz scores + config. Runs on every page. |
| `assets/js/celebrate.js` | Confetti, toast notifications, badge modals. |
| `assets/js/mobile-nav.js` | Injects fixed bottom nav on mobile. Has Cloud and More drawers. |
| `assets/js/flashcards.js` | FlashcardDeck class — flip, shuffle, keyboard nav, persistence. |
| `assets/js/quiz.js` | Quiz class — scenario questions, scoring, time tracking, celebration. |
| `service-worker.js` | Cache-first offline PWA. Must be updated whenever new pages are added. |

## IndexedDB Schema (DB_VERSION = 3)

| Store | Key | Purpose |
|-------|-----|---------|
| `pageVisits` | `visitId` | One record per visit: duration, scroll %, re-read detection |
| `pageSummary` | `pageId` | Rolled-up per page: total time, visit count, fullyRead flag |
| `quizScores` | `quizId` | Best score, full attempt history |
| `badges` | `badgeId` | Achievement badges |
| `flashcardState` | `deckId` | Current card index per deck |
| `settings` | `key` | session, userName, userConfig, lastPage, mruPages |

**When adding a new store**: bump `DB_VERSION` in `db.js` and add it in `onupgradeneeded`.

### userConfig structure (stored in settings['userConfig'])
```json
{
  "selectedCerts": ["cism", "ccsk"],
  "certOrder": ["cism", "ccsk"],
  "lockChapters": true,
  "passMark": 80,
  "startDate": "2026-03-28",
  "dailyMinutes": 120
}
```

## CSS Variables (in style.css :root)
```
--cism:   #58a6ff  (blue)
--ccsk:   #3fb950  (green)
--cobit:  #d29922  (yellow/amber)
--cissp:  #bc8cff  (purple)
```
Cloud certs use inline hex colors (not CSS vars):
- AWS: `#ff9900`
- Azure: `#0078d4`
- GCP: `#4285f4`

**When adding a new cert**, add a CSS variable for it in `style.css` `:root` block AND in `config.js`.

## Page Structure Rules

### Every content page must have (in order):
1. `<link rel="stylesheet" href="[path]/assets/css/style.css">`
2. `<script src="[path]/assets/js/db.js"></script>` (first script)
3. Auth guard inline script (check `CertDB.getSetting('session')`)
4. Nav with all cert links + Cloud dropdown + Settings link
5. Content
6. `<footer>` with branding
7. `<script src="[path]/assets/js/config.js"></script>`
8. `<script src="[path]/assets/js/app.js"></script>`
9. `<script src="[path]/assets/js/celebrate.js"></script>`
10. `<script src="[path]/assets/js/lock.js"></script>`
11. `<script src="[path]/assets/js/mobile-nav.js"></script>`

### data- attributes on `<body>` for tracking
- `data-expected-mins="30"` - expected read time (used by analytics and suggestion engine)
- `data-quiz-id="cism_d1_quiz"` - links page to a quiz for suggestions
- `data-domain-badge-id="cism_d1_badge"` - badge to award when domain is complete
- `data-domain-topics="/cism/domain1/..."` - comma-separated page IDs that must be read
- `data-domain-quiz-id="cism_d1_quiz"` - quiz that must pass 80% for domain badge

## Branding
Every page footer must include:
```html
<div class="footer-powered">
  Powered by <a href="https://continuia.ai" target="_blank" rel="noopener">continuia.ai</a>
  &middot;
  <a href="https://continuous.engineering" target="_blank" rel="noopener">continuous.engineering</a>
</div>
```

## Navigation Rules
- Desktop top nav: Dashboard | Schedule | CISM | CCSK | COBIT | CISSP | Cloud (dropdown) | Settings
- When adding a new primary cert: add it to the top nav `<ul class="nav-links">` in every page (or use a script like `add-cloud-nav.js`)
- Cloud dropdown contains: AWS Security, AZ-500, GCP Security — update when adding new cloud certs
- Mobile bottom nav drawers are in `mobile-nav.js` — update `CLOUD_LINKS` or `MORE_LINKS` there

## Auth
- Login page: `login.html` — Password: `CISO` (soft client-side gate)
- Session stored in IndexedDB `settings['session']` as `{authenticated: true}`
- Every page (except login.html) must have the auth guard script in `<head>`
- No server-side auth — this is a personal static site

## Quiz ID Naming Convention
Format: `[certId]_[domainShortCode]_quiz`
Examples: `cism_d1_quiz`, `ccsk_d5_quiz`, `aws_d3_quiz`
The `quizId` in `config.js` must exactly match the `quizId` passed to `new Quiz(questions, container, quizId)` in the quiz page.

## Content Style
- No em-dashes. Use hyphens sparingly.
- Senior professional tone — no hand-holding, no basics.
- CISM/ISACA framing: business-aligned answers over technical. Risk over compliance.
- CCSK v5 (12 domains — updated from 14, includes AI/GenAI domain).
- All content is self-contained. User has no other resources.
- Section time estimates should be realistic (include flashcards + quiz time, not just read time).

## Cert Catalog Quick Reference
| ID | Name | Issuer | estimateWeeks | Domains |
|----|------|--------|---------------|---------|
| `cism` | CISM | ISACA | 8 | 4 (Governance, Risk, Program, Incident) |
| `ccsk` | CCSK | CSA | 3 | 4 sections |
| `cobit` | COBIT | ISACA | 3 | 3 sections |
| `cissp` | CISSP | ISC² | 10 | 5 sections |
| `aws` | AWS Security | AWS | 4 | 6 domains |
| `azure` | AZ-500 | Microsoft | 4 | 4 domains |
| `gcp` | GCP Security | Google | 4 | 5 domains |

## Deployment Checklist (after adding a new cert or domain)
- [ ] New HTML pages created under correct directory
- [ ] `config.js` updated with cert/domain entries
- [ ] `service-worker.js` PRECACHE array updated
- [ ] `mobile-nav.js` drawers updated
- [ ] Top nav Cloud dropdown updated on all pages (or script run)
- [ ] Quiz IDs in HTML pages match config.js
- [ ] `data-expected-mins` set on each page body
- [ ] Footer has continuia.ai + continuous.engineering branding
- [ ] Auth guard script in `<head>` of each new page
- [ ] All 11 required scripts loaded in correct order
- [ ] `git add -A && git commit && git push`
