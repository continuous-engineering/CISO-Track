# Cert Study Guides — Project Rules

## Build Commands
- Check: none (static HTML, no build step)
- Build: none
- Test: open index.html in browser via `npx serve .` or `python -m http.server 8080`
- Deploy: `git push origin main` (Cloudflare Pages auto-deploys from main branch root)

## Stack
Pure HTML + CSS + JavaScript. No framework, no build system, no npm. Every file is a standalone HTML page. R2-primary persistence via Cloudflare Pages Functions, IndexedDB as offline fallback. Service Worker for offline-first caching.

## Repository
- Remote: `git@github.com:continuous-engineering/CISO-Track.git`
- Live URL: `https://certs.continuous.engineering/`
- Branch: `main`
- Root: `/` (Cloudflare Pages serves from repo root)

## Platform Vision

This is a **universal certification and professional learning platform** — not a security-only site. The current catalog starts with security certs, but the platform is designed to expand to any domain:
- Any certification body (PMI, AWS, Google, Microsoft, CompTIA, ISACA, ISC², Linux Foundation, etc.)
- Any discipline (security, cloud, project management, data, DevOps, finance, legal, healthcare IT, etc.)
- Any language (multilingual content is a first-class future concern — all static text should eventually be externalizable)

When building or reviewing features, design for extensibility, not just the current cert list.

## Architecture

### Files you touch when adding a cert or domain
**These four files must all be updated together. Forgetting any one breaks the experience.**

1. **`assets/js/config.js`** — The cert catalog. Add the cert to `CERT_CATALOG` with all domains, time estimates (`estimateMins`), quiz IDs (`quizId`), paths, and colors. Also add to `DEFAULT_CONFIG.selectedCerts` and `DEFAULT_CONFIG.certOrder` if it should be on by default.

2. **`service-worker.js`** (repo root) — Add ALL new HTML file paths to the `PRECACHE` array so they work offline. Uses extensionless paths to match Cloudflare Pretty URL redirect targets.

3. **`assets/js/mobile-nav.js`** — Add the cert to the appropriate drawer (`CLOUD_LINKS`, `MORE_LINKS`, or a new category drawer) so it appears in the mobile bottom nav.

4. **`assets/js/db.js`** — No change needed for new certs; only update if adding a new IndexedDB store. R2 handles new certs automatically.

### When adding a new cert
1. Create the HTML pages under a new directory (e.g., `newcert/index.html`, `newcert/domain1/index.html`)
2. Add the cert object to `CERT_CATALOG` in `config.js`
3. Add all new paths to `service-worker.js` PRECACHE list (extensionless)
4. Add to the appropriate mobile nav drawer in `mobile-nav.js`
5. Add to the top nav on all existing pages (or use the `add-cloud-nav.js` pattern)
6. Schedule and settings pages auto-update from `config.js` — no changes needed there

### When adding a new domain to an existing cert
1. Create the HTML page(s)
2. Add the domain object to the cert's `domains` array in `config.js` — include `estimateMins`, `quizId`, `path`, `quizPath`, `flashcardsPath`
3. Add the new paths to the PRECACHE list
4. `lock.js` automatically picks up the new domain and its quiz gate from `config.js`

### When adding a new topic page (not a domain)
1. Create the HTML file
2. Add to PRECACHE
3. If it's a cross-cert shared page, add it to `shared/` and reference it from the relevant cert domain pages

### Nav categories (extensible)
The nav is currently organized as: primary certs (CISM, CCSK, COBIT, CISSP) + Cloud dropdown (AWS, AZ-500, GCP). As the catalog grows, nav groupings should be driven by a category field in `config.js`, not hardcoded lists. Plan for: Security, Cloud, DevOps, PM, Data, etc.

## Backend — Cloudflare R2 + Pages Functions

Data is stored in **Cloudflare R2** (primary) with **IndexedDB** as offline fallback.

### API
- Endpoint: `/api/data/{store}` — GET / PUT / DELETE
- Auth: `Authorization: Bearer continuous.engineering` (configurable via `API_KEY` env var in CF Pages)
- Handler: `functions/api/[[path]].js` — catch-all Pages Function
- R2 bucket binding: `DATA_BUCKET` → bucket name `cert-study-data`

### R2 setup (one-time)
```
wrangler r2 bucket create cert-study-data
```
Then add `DATA_BUCKET` binding in Cloudflare Pages dashboard → Settings → Functions → R2 bucket bindings.

### R2 stores (keys: `data/{store}.json`)
| Store | Contents |
|-------|---------|
| `settings` | session, userName, userConfig, lastPage, mruPages |
| `quizScores` | best score + attempt history per quizId |
| `pageSummary` | total time, visit count, fullyRead per pageId |
| `badges` | earned badges |
| `flashcardState` | current card index per deckId |

`pageVisits` is **IndexedDB-only** — high-volume append-only, no cross-device value.

## Key JavaScript Files

| File | Purpose |
|------|---------|
| `assets/js/db.js` | R2-primary data layer. IndexedDB for pageVisits and offline fallback. All persistent state goes through `CertDB`. |
| `assets/js/config.js` | Cert catalog + user config. Single source of truth for what exists. |
| `assets/js/app.js` | Page tracking, scroll analytics, nav state, dashboard stats, dropdown toggle, disclaimer footer injection. |
| `assets/js/lock.js` | Grays out locked domain links based on quiz scores + config. Runs on every page. |
| `assets/js/celebrate.js` | Confetti, toast notifications, badge modals. |
| `assets/js/mobile-nav.js` | Injects fixed bottom nav on mobile. Has category drawers. |
| `assets/js/flashcards.js` | FlashcardDeck class — flip, shuffle, keyboard nav, persistence. |
| `assets/js/quiz.js` | Quiz class — scenario questions, scoring, time tracking, celebration. |
| `assets/js/credcard.js` | Credential card display on settings page. |
| `service-worker.js` | Cache-first offline PWA. Must be updated whenever new pages are added. |
| `functions/api/[[path]].js` | Cloudflare Pages Function — R2 read/write API. |

## IndexedDB Schema (DB_VERSION = 3)

`pageVisits` remains in IndexedDB only. All other stores sync to R2.

| Store | Key | Purpose |
|-------|-----|---------|
| `pageVisits` | `visitId` | One record per visit: duration, scroll %, re-read detection (local only) |
| `pageSummary` | `pageId` | Rolled-up per page: total time, visit count, fullyRead flag |
| `quizScores` | `quizId` | Best score, full attempt history |
| `badges` | `badgeId` | Achievement badges |
| `flashcardState` | `deckId` | Current card index per deck |
| `settings` | `key` | session, userName, userConfig, lastPage, mruPages |

**When adding a new store**: bump `DB_VERSION` in `db.js`, add it in `onupgradeneeded`, add to `_mem` and `VALID_STORES` in both `db.js` and `functions/api/[[path]].js`.

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
Each cert gets a CSS variable. Current:
```
--cism:   #58a6ff  (blue)
--ccsk:   #3fb950  (green)
--cobit:  #d29922  (yellow/amber)
--cissp:  #bc8cff  (purple)
```
Inline hex colors (used when CSS var not practical):
- AWS: `#ff9900` | Azure: `#0078d4` | GCP: `#4285f4`

**When adding a new cert**, add a CSS variable in `style.css` `:root` AND set `color` in `config.js`.

## Page Structure Rules

### Every content page must have (in order):
1. `<link rel="stylesheet" href="[path]/assets/css/style.css">`
2. `<script src="[path]/assets/js/db.js"></script>` (first script — must load before auth guard)
3. Auth guard inline script (check `CertDB.getSetting('session')`)
4. Nav with cert links + category dropdowns + Settings link
5. Content
6. `<footer>` with branding
7. `<script src="[path]/assets/js/config.js"></script>`
8. `<script src="[path]/assets/js/app.js"></script>`
9. `<script src="[path]/assets/js/celebrate.js"></script>`
10. `<script src="[path]/assets/js/lock.js"></script>`
11. `<script src="[path]/assets/js/mobile-nav.js"></script>`

### data- attributes on `<body>` for tracking
- `data-expected-mins="30"` — expected read time (analytics + suggestion engine)
- `data-quiz-id="cism_d1_quiz"` — links page to a quiz for suggestions
- `data-domain-badge-id="cism_d1_badge"` — badge to award when domain is complete
- `data-domain-topics="/cism/domain1/..."` — comma-separated page IDs that must be read
- `data-domain-quiz-id="cism_d1_quiz"` — quiz that must pass 80% for domain badge

## Branding
Every page footer must include:
```html
<div class="footer-powered">
  Powered by <a href="https://continuia.ai" target="_blank" rel="noopener">continuia.ai</a>
  &middot;
  <a href="https://continuous.engineering" target="_blank" rel="noopener">continuous.engineering</a>
</div>
```

`app.js` automatically injects a compact disclaimer line into every `<footer>` at DOMContentLoaded. Do not duplicate it manually.

## Navigation Rules
- Desktop top nav: Dashboard | Schedule | [primary certs] | [category dropdowns] | Settings
- When adding a new primary cert: add it to `<ul class="nav-links">` in every page
- Dropdown categories (e.g., Cloud) are defined inline in nav HTML; `mobile-nav.js` mirrors them in drawers
- As cert count grows, primary nav items should move to dropdowns by category — avoid nav overflow

## Auth
- Login page: `login.html` — Password: `continuous.engineering` (soft client-side gate)
- Session stored in `settings['session']` as `{authenticated: true}` (synced to R2)
- Every page except `login.html` must have the auth guard script in `<head>`
- No server-side auth — personal static site

## Quiz ID Naming Convention
Format: `[certId]_[domainShortCode]_quiz`
Examples: `cism_d1_quiz`, `ccsk_d5_quiz`, `aws_d3_quiz`, `pmp_d2_quiz`
The `quizId` in `config.js` must exactly match the `quizId` passed to `new Quiz(questions, container, quizId)`.

## Content Style
- No em-dashes. Use hyphens sparingly.
- Senior professional tone — no hand-holding, no basics.
- Frame answers in terms of the certification body's perspective (e.g., ISACA = business-risk alignment; PMI = process discipline; AWS = service-specific best practice).
- All content is AI-generated from publicly available information. Mark time estimates realistically (include flashcards + quiz time, not just read time).
- Content is self-contained — users have no other resources assumed.
- **No affiliation claims.** Content is exam prep only. Disclaimers are auto-injected by `app.js`.

## Cert Catalog Quick Reference
| ID | Name | Issuer | Domain | estimateWeeks |
|----|------|--------|--------|---------------|
| `cism` | CISM | ISACA | Security | 8 |
| `ccsk` | CCSK | CSA | Security/Cloud | 3 |
| `cobit` | COBIT | ISACA | Governance | 3 |
| `cissp` | CISSP | ISC² | Security | 10 |
| `aws` | AWS Security | AWS | Cloud | 4 |
| `azure` | AZ-500 | Microsoft | Cloud | 4 |
| `gcp` | GCP Security | Google | Cloud | 4 |

**Planned expansion areas** (not yet implemented): DevOps (CKA, Terraform), PM (PMP, PRINCE2), Data (CDP, DP-900), Finance (CFA L1), Legal (CIPP), Healthcare (CHIME), and multilingual versions of all tracks.

## Deployment Checklist (after adding a new cert or domain)
- [ ] New HTML pages created under correct directory
- [ ] `config.js` updated with cert/domain entries
- [ ] `service-worker.js` PRECACHE array updated (extensionless paths)
- [ ] `mobile-nav.js` drawers updated
- [ ] Top nav updated on all pages (or script run)
- [ ] Quiz IDs in HTML pages match `config.js`
- [ ] `data-expected-mins` set on each page body
- [ ] Footer has continuia.ai + continuous.engineering branding
- [ ] Auth guard script in `<head>` of each new page
- [ ] All 11 required scripts loaded in correct order
- [ ] `git add -A && git commit && git push`
