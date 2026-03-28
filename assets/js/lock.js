/* =============================================
   LOCK.JS — CHAPTER LOCK ENFORCEMENT
   Grays out links to locked domains.
   Visual only — direct URL navigation still works.
   ============================================= */

(async function applyLocks() {
  if (typeof CertDB === 'undefined' || typeof CertConfig === 'undefined') return;

  const cfg = await CertConfig.load();
  if (!cfg.lockChapters) return;

  const allScores = await CertDB.getAllQuizScores();
  const scoreMap = {};
  for (const s of allScores) scoreMap[s.quizId] = s.best;

  const passMark = cfg.passMark || 80;

  /* Build set of locked page paths (absolute, relative to site root) */
  const lockedPaths = new Set();

  for (const certId of Object.keys(CERT_CATALOG)) {
    const cert = CERT_CATALOG[certId];
    for (let i = 1; i < cert.domains.length; i++) {
      const prev = cert.domains[i - 1];
      const best = prev.quizId ? (scoreMap[prev.quizId] || 0) : passMark;
      if (best < passMark) {
        for (let j = i; j < cert.domains.length; j++) {
          const d = cert.domains[j];
          // Strip hash fragments — lock the page, not the anchor
          const cleanPath = (d.path || '').split('#')[0];
          if (cleanPath) lockedPaths.add(cleanPath);
          if (d.quizPath) lockedPaths.add(d.quizPath.split('#')[0]);
          if (d.flashcardsPath) lockedPaths.add(d.flashcardsPath.split('#')[0]);
        }
        break;
      }
    }
  }

  if (lockedPaths.size === 0) return;

  /* Resolve a relative href to an absolute path from site root */
  function resolveToRoot(href) {
    if (!href) return null;
    // Strip hash/query
    const clean = href.split('#')[0].split('?')[0];
    if (!clean) return null;
    // Already absolute-ish from root (starts with /)
    if (clean.startsWith('/')) return clean.replace(/^\//, '');
    // Resolve relative to current page path
    const base = window.location.pathname.split('/').slice(0, -1).join('/');
    const parts = (base + '/' + clean).split('/');
    const resolved = [];
    for (const p of parts) {
      if (p === '..') resolved.pop();
      else if (p !== '.') resolved.push(p);
    }
    // Strip leading empty segment from absolute path
    return resolved.join('/').replace(/^\//, '');
  }

  function isLocked(href) {
    const resolved = resolveToRoot(href);
    if (!resolved) return false;
    // Strip any leading path prefix (for GitHub Pages subdirectory hosting)
    // Match against the last N segments of lockedPaths
    for (const lp of lockedPaths) {
      if (resolved === lp || resolved.endsWith('/' + lp) || resolved.endsWith(lp)) return true;
    }
    return false;
  }

  function applyLockStyle(el) {
    el.style.pointerEvents = 'none';
    el.style.opacity = '0.38';
    el.style.cursor = 'not-allowed';
    el.setAttribute('title', 'Pass the previous chapter quiz (80%+) to unlock');
    if (!el.querySelector('.lock-glyph')) {
      const g = document.createElement('span');
      g.className = 'lock-glyph';
      g.setAttribute('aria-hidden', 'true');
      g.textContent = ' 🔒';
      g.style.fontSize = '0.75em';
      el.appendChild(g);
    }
  }

  /* Apply to all anchor links on the page */
  document.querySelectorAll('a[href]').forEach(a => {
    if (isLocked(a.getAttribute('href'))) applyLockStyle(a);
  });

  /* Apply to nav dropdown items */
  document.querySelectorAll('.nav-dropdown-menu a, .mbn-drawer-link').forEach(a => {
    if (isLocked(a.getAttribute('href'))) applyLockStyle(a);
  });

})();
