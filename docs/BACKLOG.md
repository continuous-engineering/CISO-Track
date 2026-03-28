# Cert Study Guides — Backlog

## In Progress

| # | Item | Notes |
|---|------|-------|
| 1 | Dynamic dashboard cert cards | Replacing hardcoded HTML with config-driven cards — in this commit |

## Up Next — High Priority

| # | Item | Notes |
|---|------|-------|
| 2 | **Cloudflare Workers KV — cross-device sync** | Core reason for moving to Cloudflare. Codename → user data (quiz scores, progress, config) synced across devices. Requires: Worker at `/api/sync`, KV namespace `CERT_USERS`, bindings in Cloudflare dashboard. |
| 3 | **Cloudflare Worker — dynamic OG image** | Worker at `/api/og?c=CrimsonFalcon` generates personalized PNG for LinkedIn share. Uses `@cloudflare/workers-og` or Satori. |
| 4 | **Auth backed by KV** | On login, Worker verifies codename exists in KV. On first register, Worker creates entry. Removes the "accept any codename" client-side loophole. |

## Backlog — Content

| # | Item | Notes |
|---|------|-------|
| 5 | CISM domain1 topic pages | `01-governance-vs-management.html` through `07-legal-regulatory.html` |
| 6 | CISM domain2 topic pages | `01-risk-fundamentals.html` through `08-vulnerability-management.html` |
| 7 | CISM domain3 topic pages | `01-program-framework.html` through `06-program-metrics.html` |
| 8 | CISM domain4 topic pages | `01-incident-lifecycle.html` through `06-crisis-communications.html` |
| 9 | CCSK remaining modules | `02-governance.html` through `12-related-technologies.html` |
| 10 | COBIT remaining modules | `03-governance-system.html` through `07-implementation.html` |
| 11 | CISSP domain pages | `d1-security-risk-management.html` through `d8-software-security.html` |
| 12 | AWS Security domain pages | All 6 domain pages |
| 13 | AZ-500 domain pages | All 4 domain pages |
| 14 | GCP Security domain pages | All 5 domain pages |
| 15 | Shared concept pages | `access-management.html`, `cryptography.html`, `network-security.html` etc. |

## Backlog — Features

| # | Item | Notes |
|---|------|-------|
| 16 | LinkedIn post with personalized OG image | Blocked by item #3 (Worker OG image) |
| 17 | Exam date countdown | On dashboard and per-cert page. `exam-dates.html` exists, needs DB backing |
| 18 | Mobile nav — cloud cert drawer update | Add GCP when GCP pages are complete |
| 19 | Service worker auto-update notification | Toast when new SW version detected |

## Done

| # | Item |
|---|------|
| ✓ | Rebrand from CISO Cert Track to Cert Study Guides |
| ✓ | Codename login system (Adjective+Animal) |
| ✓ | Credential card — Canvas PNG download |
| ✓ | Settings page — cert picker, ordering, schedule config, lock toggle |
| ✓ | Dynamic schedule page (from config.js) |
| ✓ | Cloud dropdown in top nav |
| ✓ | lock.js — chapter locking by quiz score |
| ✓ | Deploy to Cloudflare Pages at certs.continuous.engineering |
| ✓ | OG share page (share.html) + LinkedIn share button |
| ✓ | Fix service worker PRECACHE (was failing on 50+ missing files) |
| ✓ | Fix duplicate config.js loads across 22 pages |
