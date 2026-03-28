/* =============================================
   CISO CERT TRACK — CORE APP
   Progress tracking via localStorage
   ============================================= */

const STORAGE_KEY = 'ciso_cert_progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch { return {}; }
}

function saveProgress(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function markDone(taskId) {
  const p = getProgress();
  p[taskId] = { done: true, date: new Date().toISOString() };
  saveProgress(p);
  refreshDoneState();
}

function isDone(taskId) {
  return !!(getProgress()[taskId]?.done);
}

function refreshDoneState() {
  document.querySelectorAll('[data-task]').forEach(el => {
    const id = el.dataset.task;
    if (isDone(id)) {
      el.classList.add('done');
      const cb = el.querySelector('input[type=checkbox]');
      if (cb) cb.checked = true;
    }
  });
}

function saveQuizScore(quizId, score, total) {
  const p = getProgress();
  if (!p.quizzes) p.quizzes = {};
  p.quizzes[quizId] = { score, total, pct: Math.round(score/total*100), date: new Date().toISOString() };
  saveProgress(p);
}

function getQuizScore(quizId) {
  return getProgress()?.quizzes?.[quizId];
}

// Active nav link
function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && path.includes(href.replace('../', '').replace('./', '').replace('index.html', ''))) {
      a.classList.add('active');
    }
  });
}

// Stats on home page
function updateStats() {
  const p = getProgress();
  const total = Object.keys(p).filter(k => k !== 'quizzes').length;
  const quizzes = p.quizzes ? Object.values(p.quizzes) : [];
  const avgScore = quizzes.length ? Math.round(quizzes.reduce((a, b) => a + b.pct, 0) / quizzes.length) : 0;

  const elDays = document.getElementById('stat-days');
  const elTasks = document.getElementById('stat-tasks');
  const elQuizzes = document.getElementById('stat-quizzes');
  const elAvg = document.getElementById('stat-avg');

  if (elDays) elDays.textContent = Math.max(1, Math.ceil((new Date() - new Date('2026-03-28')) / 86400000) + 1);
  if (elTasks) elTasks.textContent = total;
  if (elQuizzes) elQuizzes.textContent = quizzes.length;
  if (elAvg) elAvg.textContent = quizzes.length ? avgScore + '%' : '—';
}

// Progress bars
function updateProgressBars() {
  document.querySelectorAll('[data-progress-bar]').forEach(bar => {
    const id = bar.dataset.progressBar;
    const total = parseInt(bar.dataset.total || 10);
    const p = getProgress();
    const done = Object.keys(p).filter(k => k.startsWith(id + '_') && p[k].done).length;
    const pct = Math.min(100, Math.round(done / total * 100));
    const fill = bar.querySelector('.progress-fill');
    if (fill) fill.style.width = pct + '%';
    const label = bar.querySelector('.progress-label');
    if (label) label.textContent = pct + '%';
  });
}

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  refreshDoneState();
  updateStats();
  updateProgressBars();

  // Kanban task click to mark done
  document.querySelectorAll('.kanban-task[data-task]').forEach(el => {
    el.addEventListener('click', () => {
      const id = el.dataset.task;
      if (!isDone(id)) {
        markDone(id);
        el.style.opacity = '0.5';
      }
    });
  });

  // Checkbox tasks
  document.querySelectorAll('input[data-task]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) markDone(cb.dataset.task);
    });
  });
});
