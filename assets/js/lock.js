/* =============================================
   LOCK.JS — CHAPTER LOCK ENFORCEMENT
   Grays out links to domains the user hasn't
   unlocked yet. Visual only — URL still works.
   ============================================= */

(async function applyLocks() {
  if (typeof CertDB === 'undefined' || typeof CertConfig === 'undefined') return;

  const cfg = await CertConfig.load();
  if (!cfg.lockChapters) return;

  const allScores = await CertDB.getAllQuizScores();
  const scoreMap = {};
  for (const s of allScores) scoreMap[s.quizId] = s.best;

  const passMark = cfg.passMark || 80;

  /* For each cert, determine which domain indices are locked */
  const lockedPaths = new Set();

  for (const certId of Object.keys(CERT_CATALOG)) {
    const cert = CERT_CATALOG[certId];
    for (let i = 1; i < cert.domains.length; i++) {
      const prev = cert.domains[i - 1];
      const best = prev.quizId ? (scoreMap[prev.quizId] || 0) : passMark;
      if (best < passMark) {
        // Lock this domain and all subsequent ones
        for (let j = i; j < cert.domains.length; j++) {
          lockedPaths.add(cert.domains[j].path);
          if (cert.domains[j].quizPath) lockedPaths.add(cert.domains[j].quizPath);
          if (cert.domains[j].flashcardsPath) lockedPaths.add(cert.domains[j].flashcardsPath);
        }
        break; // once we hit a lock, rest are locked too
      }
    }
  }

  if (lockedPaths.size === 0) return;

  /* Find all anchor tags on the page and dim locked ones */
  const currentPath = window.location.pathname;

  document.querySelectorAll('a[href]').forEach(a => {
    const href = a.getAttribute('href');
    if (!href) return;

    // Resolve href relative to current page for matching
    let normalized = href.replace(/^\.\.\//, '').replace(/^\.\//, '');

    // Check if any locked path is a suffix match
    const isLocked = Array.from(lockedPaths).some(lp => {
      return href.endsWith(lp) || normalized === lp || href === lp;
    });

    if (isLocked) {
      a.style.pointerEvents = 'none';
      a.style.opacity = '0.35';
      a.style.cursor = 'not-allowed';
      a.setAttribute('title', 'Complete the previous chapter quiz (80%+) to unlock');
      // Add lock indicator if not already present
      if (!a.querySelector('.lock-glyph')) {
        const span = document.createElement('span');
        span.className = 'lock-glyph';
        span.textContent = ' 🔒';
        span.style.fontSize = '0.75em';
        a.appendChild(span);
      }
    }
  });

  /* Also dim nav links to locked cert index pages */
  // (cert index pages themselves are not locked, but domain pages within are)

})();
