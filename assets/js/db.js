/* DB — Cert Study Guides
   R2 (/api/data/{store}) is primary storage; in-memory _mem caches per session.
   pageVisits = IndexedDB-only. pageSummary = dual-write (IndexedDB + R2).
   remotePut is fire-and-forget. */

const API_BASE = '/api/data';
const API_KEY  = 'continuous.engineering';

const _mem    = { settings: {}, quizScores: {}, pageSummary: {}, badges: {}, flashcardState: {} };
const _synced = new Set();

async function remoteGet(store) {
  try {
    const r = await fetch(`${API_BASE}/${store}`, {
      headers: { Authorization: `Bearer ${API_KEY}` }
    });
    return r.ok ? await r.json() : {};
  } catch { return {}; }
}

function remotePut(store, obj) {
  fetch(`${API_BASE}/${store}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${API_KEY}` },
    body: JSON.stringify(obj)
  }).catch(() => {});
}

async function ensureLoaded(store) {
  if (_synced.has(store)) return;
  const remote = await remoteGet(store);
  Object.assign(_mem[store], remote);
  _synced.add(store);
}

function persist(store) {
  remotePut(store, _mem[store]);
}

/* ── IndexedDB (pageVisits only) ── */
const DB_NAME    = 'cisoCertTrack';
const DB_VERSION = 3;
let _db = null;

function openDB() {
  if (_db) return Promise.resolve(_db);
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      [['pageVisits','visitId'],['pageSummary','pageId'],['quizScores','quizId'],
       ['badges','badgeId'],['flashcardState','deckId'],['settings','key']
      ].forEach(([name, key]) => {
        if (!db.objectStoreNames.contains(name)) {
          const s = db.createObjectStore(name, { keyPath: key });
          if (name === 'pageVisits') s.createIndex('byPage', 'pageId', { unique: false });
        }
      });
    };
    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = e => reject(e.target.error);
  });
}

function txGet(store, key) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).get(key);
    req.onsuccess = () => resolve(req.result ?? null);
    req.onerror   = () => reject(req.error);
  }));
}

function txPut(store, value) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readwrite').objectStore(store).put(value);
    req.onsuccess = () => resolve();
    req.onerror   = () => reject(req.error);
  }));
}

function txGetAll(store) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  }));
}

function txGetByIndex(store, indexName, value) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const req = db.transaction(store, 'readonly').objectStore(store).index(indexName).getAll(value);
    req.onsuccess = () => resolve(req.result);
    req.onerror   = () => reject(req.error);
  }));
}

/* ── PUBLIC API ── */
const CertDB = {

  /* PAGE VISITS — IndexedDB + pageSummary synced to R2 */
  async recordVisit(pageId, { duration, maxScrollPct, startScrollPct, expectedMins }) {
    const visitId = `${pageId}__${Date.now()}`;
    const existing = await txGet('pageSummary', pageId);
    const summary = existing || {
      pageId, visitCount: 0, totalSeconds: 0,
      maxScrollEver: 0, fullyRead: false,
      lastVisit: null, firstVisit: null
    };

    const isReread = summary.visitCount > 0 && startScrollPct < 10;
    const isResume = summary.visitCount > 0 && startScrollPct >= 10;
    await txPut('pageVisits', {
      visitId, pageId, duration, maxScrollPct,
      startScrollPct, isReread, isResume,
      expectedMins: expectedMins || null,
      date: new Date().toISOString()
    });

    summary.visitCount++;
    summary.totalSeconds += duration;
    summary.maxScrollEver = Math.max(summary.maxScrollEver, maxScrollPct);
    summary.fullyRead = summary.fullyRead || maxScrollPct >= 85;
    summary.lastVisit = new Date().toISOString();
    summary.firstVisit = summary.firstVisit || new Date().toISOString();
    summary.rereads = (summary.rereads || 0) + (isReread ? 1 : 0);

    await txPut('pageSummary', summary);
    _mem.pageSummary[pageId] = summary;
    persist('pageSummary');

    return { isReread, isResume, summary };
  },

  async getPageSummary(pageId) {
    await ensureLoaded('pageSummary');
    return _mem.pageSummary[pageId] ?? null;
  },
  getPageVisits(pageId) {
    return txGetByIndex('pageVisits', 'byPage', pageId);
  },
  async getAllSummaries() {
    await ensureLoaded('pageSummary');
    return Object.values(_mem.pageSummary);
  },

  /* QUIZ SCORES */
  async saveQuizScore(quizId, score, total) {
    await ensureLoaded('quizScores');
    const pct = Math.round(score / total * 100);
    const existing = _mem.quizScores[quizId] || { quizId, attempts: 0, best: 0, history: [] };
    existing.attempts++;
    existing.best = Math.max(existing.best, pct);
    existing.lastScore = pct;
    existing.lastDate = new Date().toISOString();
    existing.history = [...(existing.history || []), { score, total, pct, date: new Date().toISOString() }];
    _mem.quizScores[quizId] = existing;
    persist('quizScores');
  },

  async getQuizScore(quizId) {
    await ensureLoaded('quizScores');
    return _mem.quizScores[quizId] ?? null;
  },
  async getAllQuizScores() {
    await ensureLoaded('quizScores');
    return Object.values(_mem.quizScores);
  },

  /* BADGES */
  async awardBadge(badgeId, label, level, emoji) {
    await ensureLoaded('badges');
    if (_mem.badges[badgeId]) return false;
    _mem.badges[badgeId] = { badgeId, label, level, emoji: emoji || '🏅', date: new Date().toISOString() };
    persist('badges');
    return true;
  },
  async hasBadge(badgeId) {
    await ensureLoaded('badges');
    return !!_mem.badges[badgeId];
  },
  async getAllBadges() {
    await ensureLoaded('badges');
    return Object.values(_mem.badges);
  },

  /* FLASHCARD STATE */
  async saveFlashcardState(deckId, index) {
    await ensureLoaded('flashcardState');
    _mem.flashcardState[deckId] = { deckId, index };
    persist('flashcardState');
  },
  async getFlashcardState(deckId) {
    await ensureLoaded('flashcardState');
    return _mem.flashcardState[deckId]?.index ?? 0;
  },

  /* SETTINGS */
  async setSetting(key, value) {
    await ensureLoaded('settings');
    _mem.settings[key] = value;
    persist('settings');
  },
  async getSetting(key) {
    await ensureLoaded('settings');
    return _mem.settings[key] ?? null;
  },

  /* KANBAN TASKS — uses settings store */
  async getKanbanDone() {
    await ensureLoaded('settings');
    return new Set(_mem.settings['kanbanDone'] || []);
  },
  async markKanbanDone(taskId) {
    const done = await this.getKanbanDone();
    done.add(taskId);
    _mem.settings['kanbanDone'] = Array.from(done);
    persist('settings');
  },
  async unmarkKanbanDone(taskId) {
    const done = await this.getKanbanDone();
    done.delete(taskId);
    _mem.settings['kanbanDone'] = Array.from(done);
    persist('settings');
  },

  /* DASHBOARD STATS */
  async getStats() {
    await Promise.all(['pageSummary','quizScores','badges','settings'].map(ensureLoaded));
    const summaries = Object.values(_mem.pageSummary);
    const scores = Object.values(_mem.quizScores);
    const badges = Object.values(_mem.badges);
    const pagesRead = summaries.filter(p => p.fullyRead).length;
    const totalSeconds = summaries.reduce((a, b) => a + (b.totalSeconds || 0), 0);
    const avgScore = scores.length ? Math.round(scores.reduce((a, b) => a + b.best, 0) / scores.length) : null;
    const startDate = _mem.settings['userConfig']?.startDate || '2026-03-28';
    const daysSince = Math.max(1, Math.ceil((Date.now() - new Date(startDate).getTime()) / 86400000));
    return { pagesRead, totalSeconds, totalHours: Math.round(totalSeconds / 36) / 100,
      quizzesTaken: scores.length, avgScore, daysSince, badgesEarned: badges.length, badges, scores };
  },

  /* LEARNING SUGGESTION ENGINE */
  async getSuggestion(pageId, quizId, expectedMins) {
    const [summary, visits, quiz] = await Promise.all([
      this.getPageSummary(pageId),
      this.getPageVisits(pageId),
      quizId ? this.getQuizScore(quizId) : Promise.resolve(null),
    ]);
    if (!summary) return null;
    const actualMins = Math.round(summary.totalSeconds / 60);
    const ratio  = expectedMins ? actualMins / expectedMins : null;
    const rereads = summary.rereads || 0;
    let quizTrend = null;
    if (quiz && quiz.history && quiz.history.length >= 2) {
      const h = quiz.history;
      quizTrend = h[h.length - 1].pct - h[0].pct;
    }

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
      type: 'info', text: `Topic read. Hit the flashcards, then take the domain quiz.`
    };
    return null;
  }
};

/* Backwards-compat shim */
function saveQuizScore(quizId, score, total) {
  CertDB.saveQuizScore(quizId, score, total);
}
