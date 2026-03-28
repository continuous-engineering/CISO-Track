/* =============================================
   APP.JS — CISO CERT TRACK
   Time tracking, scroll analytics, nav, stats
   ============================================= */

/* ── SERVICE WORKER ──────────────────────── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').catch(() => {});
  });
}

/* ── PAGE-LEVEL TRACKING ─────────────────── */
const _pageId   = window.location.pathname;
const _expected = parseInt(document.body.dataset.expectedMins || '0', 10);
const _quizId   = document.body.dataset.quizId || null;
let _startTime  = Date.now();
let _startScrollPct = 0;
let _maxScrollPct   = 0;
let _trackingActive = true;

function _scrollPct() {
  const el = document.documentElement;
  const max = el.scrollHeight - el.clientHeight;
  return max > 0 ? Math.round((window.scrollY / max) * 100) : 100;
}

// Capture starting scroll position (for detecting re-reads)
window.addEventListener('load', () => {
  setTimeout(() => { _startScrollPct = _scrollPct(); }, 300);
});

window.addEventListener('scroll', () => {
  _maxScrollPct = Math.max(_maxScrollPct, _scrollPct());
}, { passive: true });

async function _saveVisit() {
  if (!_trackingActive || typeof CertDB === 'undefined') return;
  _trackingActive = false;
  const duration = Math.round((Date.now() - _startTime) / 1000);
  if (duration < 5) return; // ignore bounces
  const result = await CertDB.recordVisit(_pageId, {
    duration,
    maxScrollPct: _maxScrollPct,
    startScrollPct: _startScrollPct,
    expectedMins: _expected || null,
  });
  return result;
}

window.addEventListener('beforeunload', _saveVisit);
document.addEventListener('visibilitychange', async () => {
  if (document.hidden) {
    await _saveVisit();
    _startTime = Date.now();
    _maxScrollPct = 0;
    _startScrollPct = _scrollPct();
    _trackingActive = true;
  }
});

/* ── AUTO-MARK READ AT 85% SCROLL ─────────── */
{
  let _markedRead = false;
  window.addEventListener('scroll', () => {
    if (_markedRead || _scrollPct() < 85) return;
    _markedRead = true;
    if (typeof CertDB === 'undefined') return;
    // Mark the page ID as read
    CertDB.getPageSummary(_pageId).then(s => {
      if (!s?.fullyRead) {
        const title = document.querySelector('h1')?.textContent?.trim() || document.title;
        if (typeof celebrateSectionRead === 'function') celebrateSectionRead(title);
        refreshReadBadge();
        // Check domain badge after read
        checkAndAwardDomainBadge();
      }
    });
  }, { passive: true });
}

/* ── SUGGESTION WIDGET ───────────────────── */
async function loadSuggestion() {
  const el = document.getElementById('reading-intel');
  if (!el || typeof CertDB === 'undefined') return;
  const s = await CertDB.getSuggestion(_pageId, _quizId, _expected);
  if (!s) return;
  const colors = { success:'var(--accent2)', tip:'var(--accent)', warning:'var(--accent3)', info:'var(--text-muted)' };
  const icons  = { success:'✓', tip:'→', warning:'!', info:'i' };
  el.innerHTML = `
    <div style="border-left:3px solid ${colors[s.type]};padding:0.75rem 1rem;background:var(--bg2);
                border-radius:0 6px 6px 0;font-size:0.875rem;color:var(--text-muted);margin:1.5rem 0;">
      <span style="color:${colors[s.type]};font-weight:700;margin-right:0.5rem;">${icons[s.type]}</span>${s.text}
    </div>`;
}

/* ── READ BADGE ON TOPIC PAGES ───────────── */
function refreshReadBadge() {
  const badge = document.getElementById('read-badge');
  if (!badge || typeof CertDB === 'undefined') return;
  CertDB.getPageSummary(_pageId).then(s => {
    if (!s) return;
    const mins = Math.round(s.totalSeconds / 60);
    const visits = s.visitCount;
    const rereads = s.rereads || 0;
    badge.innerHTML = `
      <div style="display:flex;gap:1rem;flex-wrap:wrap;font-size:0.8rem;color:var(--text-muted);
                  padding:0.75rem 1rem;background:var(--bg2);border:1px solid var(--border);
                  border-radius:6px;margin-bottom:1.5rem;">
        ${s.fullyRead ? '<span style="color:var(--accent2);">✓ Read</span>' : '<span>Partial read</span>'}
        <span>⏱ ${mins} min total</span>
        <span>👁 ${visits} visit${visits !== 1 ? 's' : ''}</span>
        ${rereads ? `<span>↺ ${rereads} re-read${rereads !== 1 ? 's' : ''}</span>` : ''}
        ${_expected ? `<span style="color:${mins > _expected * 1.5 ? 'var(--accent3)' : 'var(--text-muted)'};">Expected: ${_expected} min</span>` : ''}
      </div>`;
  });
}

/* ── DOMAIN BADGE CHECK ──────────────────── */
async function checkAndAwardDomainBadge() {
  const meta = document.body.dataset;
  if (!meta.domainBadgeId || typeof CertDB === 'undefined') return;
  const topicIds = (meta.domainTopics || '').split(',').filter(Boolean);
  if (!topicIds.length) return;
  const [summaries, quiz, alreadyHas] = await Promise.all([
    CertDB.getAllSummaries(),
    meta.domainQuizId ? CertDB.getQuizScore(meta.domainQuizId) : Promise.resolve(null),
    CertDB.hasBadge(meta.domainBadgeId),
  ]);
  if (alreadyHas) return;
  const readSet = new Set(summaries.filter(s => s.fullyRead).map(s => s.pageId));
  const allRead = topicIds.every(id => readSet.has(id));
  const passed  = quiz && quiz.best >= 80;
  if (allRead && passed) {
    await CertDB.awardBadge(meta.domainBadgeId, meta.domainBadgeLabel, 'domain', meta.domainBadgeEmoji);
    if (typeof celebrateDomainBadge === 'function') {
      celebrateDomainBadge(meta.domainBadgeLabel, meta.domainCert || 'CISM');
    }
  }
}

/* ── NAV ACTIVE STATE ────────────────────── */
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href') || '';
    // strip relative prefixes and .html
    const clean = href.replace(/^(\.\.\/)+/, '/').replace(/^\.\//, '/').replace('index.html', '');
    if (clean.length > 2 && path.includes(clean.replace('.html',''))) {
      a.classList.add('active');
    }
  });
}

/* ── DASHBOARD STATS ─────────────────────── */
function loadDashboardStats() {
  if (!document.getElementById('stat-days') || typeof CertDB === 'undefined') return;
  CertDB.getStats().then(stats => {
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    set('stat-days',    stats.daysSince);
    set('stat-tasks',   stats.pagesRead);
    set('stat-quizzes', stats.quizzesTaken);
    set('stat-avg',     stats.avgScore ? stats.avgScore + '%' : '—');
    set('stat-hours',   stats.totalHours + 'h');
    set('stat-badges',  stats.badgesEarned);
  });
}

/* ── LAST LOCATION TRACKING ──────────────── */
// Save current page as "last visited" (skip index itself)
if (typeof CertDB !== 'undefined' && !_pageId.endsWith('/index.html') && _pageId !== '/') {
  const title = document.querySelector('h1')?.textContent?.trim() || document.title.split('—')[0].trim();
  CertDB.setSetting('lastPage', { url: _pageId, title, date: new Date().toISOString() });

  // MRU: keep last 5 unique pages
  CertDB.getSetting('mruPages').then(mru => {
    const list = (mru || []).filter(p => p.url !== _pageId);
    list.unshift({ url: _pageId, title, date: new Date().toISOString() });
    CertDB.setSetting('mruPages', list.slice(0, 5));
  });
}

/* ── RESUME WIDGET (dashboard only) ─────── */
async function loadResumeWidget() {
  const el = document.getElementById('resume-widget');
  if (!el || typeof CertDB === 'undefined') return;

  const [lastPage, mruPages] = await Promise.all([
    CertDB.getSetting('lastPage'),
    CertDB.getSetting('mruPages'),
  ]);

  if (!lastPage) {
    el.innerHTML = `<div class="card" style="border-color:var(--accent);">
      <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);margin-bottom:0.5rem;">Day 1 — Start Here</div>
      <h2 style="font-size:1.1rem;margin-bottom:0.75rem;">CISM Orientation</h2>
      <a href="cism/index.html" class="btn btn-primary">Begin →</a>
    </div>`;
    return;
  }

  const recent = (mruPages || []).slice(1, 4); // skip current (index of [0] is lastPage)
  el.innerHTML = `
    <div class="card" style="border-color:var(--accent);margin-bottom:1rem;">
      <div style="font-size:0.7rem;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:var(--accent);margin-bottom:0.5rem;">Resume</div>
      <div style="font-size:1rem;font-weight:600;margin-bottom:0.75rem;">${lastPage.title}</div>
      <a href="${lastPage.url}" class="btn btn-primary">Continue →</a>
    </div>
    ${recent.length ? `
    <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.5rem;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;">Recent</div>
    ${recent.map(p => `<div style="margin-bottom:0.35rem;font-size:0.85rem;">
      <a href="${p.url}" style="color:var(--text-muted);">→ ${p.title}</a>
    </div>`).join('')}` : ''}
  `;
}

/* ── INIT ────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  refreshReadBadge();
  loadDashboardStats();
  loadSuggestion();
  loadResumeWidget();
});

/* ── NAV CLOUD DROPDOWN ──────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const dd = document.getElementById('nav-cloud-dd');
  if (!dd) return;
  const btn = dd.querySelector('.nav-dropdown-trigger');
  btn.addEventListener('click', e => {
    e.stopPropagation();
    const open = dd.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', () => {
    dd.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
  });
});
