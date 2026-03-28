/* =============================================
   INDEXEDDB WRAPPER — CISO CERT TRACK
   Full learning analytics: time, scroll, visits,
   re-reads, quiz trajectories, suggestions.
   ============================================= */

const DB_NAME = 'cisoCertTrack';
const DB_VERSION = 3;
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      const stores = [
        ['pageVisits',     'visitId'],   // one record per visit
        ['pageSummary',    'pageId'],    // rolled-up summary per page
        ['quizScores',     'quizId'],    // best + full history
        ['badges',         'badgeId'],
        ['flashcardState', 'deckId'],
        ['settings',       'key'],
      ];
      stores.forEach(([name, key]) => {
        if (!db.objectStoreNames.contains(name)) {
          const store = db.createObjectStore(name, { keyPath: key });
          if (name === 'pageVisits') store.createIndex('byPage', 'pageId', { unique: false });
        }
      });
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror = e => reject(e.target.error);
  });
}

function txGet(store, key) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror = () => reject(req.error);
  }));
}

function txPut(store, value) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  }));
}

function txGetAll(store) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

function txGetByIndex(store, indexName, value) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).index(indexName).getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

/* ── PUBLIC API ─────────────────────────────── */

const CertDB = {

  /* PAGE VISITS — full visit history */
  async recordVisit(pageId, { duration, maxScrollPct, startScrollPct, expectedMins }) {
    const visitId = `${pageId}__${Date.now()}`;
    const summary = await txGet('pageSummary', pageId) || {
      pageId, visitCount: 0, totalSeconds: 0,
      maxScrollEver: 0, fullyRead: false,
      lastVisit: null, firstVisit: null
    };

    const isReread = summary.visitCount > 0 && startScrollPct < 10;
    const isResume  = summary.visitCount > 0 && startScrollPct >= 10;

    await txPut('pageVisits', {
      visitId, pageId, duration, maxScrollPct,
      startScrollPct, isReread, isResume,
      expectedMins: expectedMins || null,
      date: new Date().toISOString()
    });

    // Update summary
    summary.visitCount++;
    summary.totalSeconds += duration;
    summary.maxScrollEver = Math.max(summary.maxScrollEver, maxScrollPct);
    summary.fullyRead = summary.fullyRead || maxScrollPct >= 85;
    summary.lastVisit = new Date().toISOString();
    summary.firstVisit = summary.firstVisit || new Date().toISOString();
    summary.rereads = (summary.rereads || 0) + (isReread ? 1 : 0);
    await txPut('pageSummary', summary);

    return { isReread, isResume, summary };
  },

  getPageSummary(pageId) {
    return txGet('pageSummary', pageId);
  },

  getPageVisits(pageId) {
    return txGetByIndex('pageVisits', 'byPage', pageId);
  },

  getAllSummaries() {
    return txGetAll('pageSummary');
  },

  /* QUIZ SCORES — full history per quiz */
  async saveQuizScore(quizId, score, total) {
    const pct = Math.round(score / total * 100);
    const existing = await txGet('quizScores', quizId) || {
      quizId, attempts: 0, best: 0, history: []
    };
    existing.attempts++;
    existing.best = Math.max(existing.best, pct);
    existing.lastScore = pct;
    existing.lastDate = new Date().toISOString();
    existing.history = [...(existing.history || []), {
      score, total, pct, date: new Date().toISOString()
    }];
    return txPut('quizScores', existing);
  },

  getQuizScore(quizId) {
    return txGet('quizScores', quizId);
  },

  getAllQuizScores() {
    return txGetAll('quizScores');
  },

  /* BADGES */
  async awardBadge(badgeId, label, level, emoji) {
    const existing = await txGet('badges', badgeId);
    if (existing) return false;
    await txPut('badges', { badgeId, label, level, emoji: emoji || '🏅', date: new Date().toISOString() });
    return true;
  },
  hasBadge(badgeId) {
    return txGet('badges', badgeId).then(r => !!r);
  },
  getAllBadges() {
    return txGetAll('badges');
  },

  /* FLASHCARD STATE */
  saveFlashcardState(deckId, index) {
    return txPut('flashcardState', { deckId, index });
  },
  getFlashcardState(deckId) {
    return txGet('flashcardState', deckId).then(r => r?.index || 0);
  },

  /* SETTINGS */
  setSetting(key, value) { return txPut('settings', { key, value }); },
  getSetting(key)        { return txGet('settings', key).then(r => r?.value ?? null); },

  /* DASHBOARD STATS */
  async getStats() {
    const [summaries, scores, badges] = await Promise.all([
      txGetAll('pageSummary'),
      txGetAll('quizScores'),
      txGetAll('badges'),
    ]);
    const pagesRead = summaries.filter(p => p.fullyRead).length;
    const totalSeconds = summaries.reduce((a, b) => a + (b.totalSeconds || 0), 0);
    const avgScore = scores.length
      ? Math.round(scores.reduce((a, b) => a + b.best, 0) / scores.length)
      : null;
    const daysSince = Math.max(1, Math.ceil(
      (Date.now() - new Date('2026-03-28').getTime()) / 86400000
    ));
    return {
      pagesRead, totalSeconds,
      totalHours: Math.round(totalSeconds / 36) / 100,
      quizzesTaken: scores.length,
      avgScore,
      daysSince,
      badgesEarned: badges.length,
      badges,
      scores,
    };
  },

  /* LEARNING SUGGESTION ENGINE */
  async getSuggestion(pageId, quizId, expectedMins) {
    const [summary, visits, quiz] = await Promise.all([
      txGet('pageSummary', pageId),
      txGetByIndex('pageVisits', 'byPage', pageId),
      quizId ? txGet('quizScores', quizId) : Promise.resolve(null),
    ]);

    if (!summary) return null;

    const actualMins = Math.round(summary.totalSeconds / 60);
    const ratio = expectedMins ? actualMins / expectedMins : null;
    const rereads = summary.rereads || 0;
    const visitCount = summary.visitCount;

    // Quiz trajectory
    let quizTrend = null;
    if (quiz && quiz.history && quiz.history.length >= 2) {
      const h = quiz.history;
      quizTrend = h[h.length-1].pct - h[0].pct; // positive = improving
    }

    /* Decision tree → suggestion */
    if (!summary.fullyRead) {
      if (ratio && ratio < 0.4) return {
        type: 'warning',
        text: `Quick scan detected (${actualMins} min vs. ${expectedMins} min expected). A full read will pay off before the quiz.`
      };
      return { type: 'info', text: `${Math.round(summary.maxScrollEver)}% of this topic read. Keep going.` };
    }

    if (quiz && quiz.best < 70 && quiz.attempts >= 2) return {
      type: 'tip',
      text: `Quiz score ${quiz.best}% after ${quiz.attempts} attempts — the explanations on wrong answers are your study guide. Re-read targeted sections, not the whole page.`
    };

    if (quiz && quiz.best >= 80 && quizTrend !== null && quizTrend > 0) return {
      type: 'success',
      text: `Score improved ${quiz.history[0].pct}% → ${quiz.best}%. Strong trajectory. Move on.`
    };

    if (rereads >= 2 && (!quiz || quiz.best < 80)) return {
      type: 'tip',
      text: `${rereads + 1} reads of this topic. The flashcard deck may be more effective than another full read — test the pattern differently.`
    };

    if (rereads >= 1 && quiz && quiz.best >= 80) return {
      type: 'success',
      text: `Re-read + ${quiz.best}% quiz. Solid retention pattern. This topic is done.`
    };

    if (ratio && ratio > 1.8 && (!quiz || quiz.best < 80)) return {
      type: 'tip',
      text: `${actualMins} min on this topic (${expectedMins} min expected). You're digging in — that's good. Quiz when ready.`
    };

    if (summary.fullyRead && !quiz) return {
      type: 'info',
      text: `Topic read. Hit the flashcards, then take the domain quiz.`
    };

    return null;
  }
};

/* Backwards-compat shim */
function saveQuizScore(quizId, score, total) {
  CertDB.saveQuizScore(quizId, score, total);
}
